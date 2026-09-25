import json
import asyncio
import logging
from django.http import StreamingHttpResponse, JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.authentication import JWTAuthentication
from asgiref.sync import sync_to_async

from conversations.models import Conversation
from .services.persistence import resolve_conversation, save_user_message, save_assistant_turn_and_usage, get_historical_messages
from .services.context import build_context
from .services.gemini import GeminiService

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class ChatStreamView(View):
    async def post(self, request, *args, **kwargs):
        request_id = getattr(request, 'request_id', 'unknown')
        
        # 1. JWT Authentication
        try:
            jwt_auth = JWTAuthentication()
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return JsonResponse({
                    'error': {'code': 'authentication_error', 'message': 'Authentication credentials were not provided.'}
                }, status=401)

            raw_token = auth_header.split(' ')[1]
            validated_token = await sync_to_async(jwt_auth.get_validated_token)(raw_token)
            user = await sync_to_async(jwt_auth.get_user)(validated_token)
        except Exception as e:
            logger.warning("JWT Authentication failed for chat stream: %s", e)
            return JsonResponse({
                'error': {'code': 'authentication_error', 'message': 'Invalid or expired authentication token.'}
            }, status=401)

        # 2. Parse Body
        try:
            body = json.loads(request.body.decode('utf-8'))
        except Exception:
            return JsonResponse({
                'error': {'code': 'validation_error', 'message': 'Invalid JSON body.'}
            }, status=400)

        conversation_id = body.get('conversation_id')
        user_message_text = body.get('message', '').strip()

        if not user_message_text:
            return JsonResponse({
                'error': {'code': 'validation_error', 'message': 'Message parameter is required and cannot be empty.'}
            }, status=400)

        if len(user_message_text) > 32000:
            return JsonResponse({
                'error': {'code': 'validation_error', 'message': 'Message exceeds maximum allowed length of 32,000 characters.'}
            }, status=400)

        # 3. Resolve Conversation
        conversation = await resolve_conversation(user, conversation_id)
        if conversation is None:
            return JsonResponse({
                'error': {'code': 'not_found', 'message': 'Conversation not found.'}
            }, status=404)

        # 4. Save User Message
        await save_user_message(conversation, user_message_text)

        # 5. Build Context
        historical_messages = await get_historical_messages(conversation)
        system_prompt, contents = build_context(historical_messages, user_message_text)

        # 6. Stream SSE Response Async Generator
        async def event_generator():
            # Emit Meta Event
            meta_payload = {
                'request_id': request_id,
                'conversation_id': str(conversation.id)
            }
            yield f"event: meta\ndata: {json.dumps(meta_payload)}\n\n"

            gemini_svc = GeminiService()
            assistant_content = ""
            usage_data = None
            stream_error = None

            try:
                async for chunk in gemini_svc.stream_chat(system_prompt, contents):
                    if chunk['type'] == 'delta':
                        assistant_content += chunk['content']
                        yield f"event: delta\ndata: {json.dumps({'content': chunk['content']})}\n\n"
                    elif chunk['type'] == 'usage':
                        usage_data = chunk
                    elif chunk['type'] == 'error':
                        stream_error = chunk['message']
                        usage_data = chunk
                        yield f"event: error\ndata: {json.dumps({'error': stream_error})}\n\n"
            except Exception as exc:
                logger.exception("Error in chat stream generation: %s", exc)
                stream_error = str(exc)
                yield f"event: error\ndata: {json.dumps({'error': stream_error})}\n\n"

            # 7. Persist Assistant Turn & Usage Record
            input_tokens = usage_data.get('input_tokens', 0) if usage_data else 0
            output_tokens = usage_data.get('output_tokens', 0) if usage_data else 0
            thinking_tokens = usage_data.get('thinking_tokens', 0) if usage_data else 0
            model = usage_data.get('used_model', gemini_svc.model_name) if usage_data else gemini_svc.model_name
            first_token_ms = usage_data.get('first_token_ms') if usage_data else None
            latency_ms = usage_data.get('latency_ms') if usage_data else None
            outcome = usage_data.get('outcome', 'error' if stream_error else 'success') if usage_data else ('error' if stream_error else 'success')

            assistant_msg, record = await save_assistant_turn_and_usage(
                user=user,
                conversation=conversation,
                content=assistant_content,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                thinking_tokens=thinking_tokens,
                model=model,
                first_token_ms=first_token_ms,
                latency_ms=latency_ms,
                outcome=outcome
            )

            # Emit Done Event
            done_payload = {
                'conversation_id': str(conversation.id),
                'message_id': str(assistant_msg.id) if assistant_msg else None,
                'title': conversation.title
            }
            yield f"event: done\ndata: {json.dumps(done_payload)}\n\n"

        response = StreamingHttpResponse(
            event_generator(),
            content_type='text/event-stream'
        )
        response['Cache-Control'] = 'no-cache, no-transform'
        response['X-Accel-Buffering'] = 'no'
        return response
