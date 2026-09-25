from asgiref.sync import sync_to_async
from conversations.models import Conversation, Message, UsageRecord
from django.utils import timezone

@sync_to_async
def resolve_conversation(user, conversation_id=None):
    if conversation_id:
        try:
            return Conversation.objects.for_user(user).get(id=conversation_id)
        except Conversation.DoesNotExist:
            return None
    else:
        return Conversation.objects.create(user=user, title="New Conversation")

@sync_to_async
def save_user_message(conversation, content, input_tokens=0):
    msg = Message.objects.create(
        conversation=conversation,
        role='user',
        content=content,
        input_tokens=input_tokens
    )
    # Update conversation updated_at timestamp & auto-set title from user message if new
    conversation.updated_at = timezone.now()
    if conversation.title == "New Conversation" and content:
        title_text = content.strip().split('\n')[0][:35].strip()
        if title_text:
            conversation.title = title_text
        conversation.save(update_fields=['updated_at', 'title'])
    else:
        conversation.save(update_fields=['updated_at'])
    return msg

@sync_to_async
def save_assistant_turn_and_usage(user, conversation, content, input_tokens=0, output_tokens=0, thinking_tokens=0, model="gemini-2.5-flash", first_token_ms=None, latency_ms=None, outcome="success"):
    msg = None
    if content:
        msg = Message.objects.create(
            conversation=conversation,
            role='assistant',
            content=content,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            thinking_tokens=thinking_tokens
        )
        conversation.updated_at = timezone.now()
        conversation.save(update_fields=['updated_at'])

    record = UsageRecord.objects.create(
        user=user,
        conversation=conversation,
        model=model,
        outcome=outcome,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        thinking_tokens=thinking_tokens,
        first_token_ms=first_token_ms,
        latency_ms=latency_ms
    )
    return msg, record

@sync_to_async
def get_historical_messages(conversation):
    return list(conversation.messages.all())
