import logging
from .prompts import DEFAULT_SYSTEM_INSTRUCTION

logger = logging.getLogger(__name__)

# Max context tokens for history trimming (e.g., 32k tokens ≈ 128k chars)
MAX_CONTEXT_TOKENS = 32000

def estimate_tokens(text: str) -> int:
    """Approximate token count (≈ 4 characters per token)."""
    if not text:
        return 0
    return max(1, len(text) // 4)

def build_context(messages_input, current_user_message: str, system_instruction: str = None):
    """
    Builds context list for Gemini API.
    Walks historical messages newest-first, trims against token budget,
    and returns chronological list of message dicts with strict alternating roles.
    Works safely with both evaluated Python lists and QuerySets.
    """
    system_prompt = system_instruction or DEFAULT_SYSTEM_INSTRUCTION
    budget = MAX_CONTEXT_TOKENS - estimate_tokens(system_prompt) - estimate_tokens(current_user_message)

    raw_list = list(messages_input) if messages_input else []
    
    # Filter out any message matching current_user_message at the end of the history list
    # (since save_user_message persists the user message right before context building)
    past_messages = []
    found_current = False
    for msg in reversed(raw_list):
        if not found_current and msg.role == 'user' and msg.content == current_user_message:
            found_current = True
            continue
        past_messages.append(msg)

    # Sort newest-first to respect token budget
    past_messages = sorted(past_messages, key=lambda m: getattr(m, 'created_at', 0), reverse=True)

    selected_messages = []
    accumulated_tokens = 0

    for msg in past_messages:
        msg_tokens = getattr(msg, 'input_tokens', 0) or estimate_tokens(msg.content)
        if accumulated_tokens + msg_tokens > budget:
            logger.info("Context budget exceeded (%d > %d). Trimming older history.", accumulated_tokens + msg_tokens, budget)
            break
        selected_messages.append(msg)
        accumulated_tokens += msg_tokens

    # Reverse back to chronological order (oldest to newest)
    selected_messages.reverse()

    # Format contents for Gemini API (contents list of dicts: {'role': 'user'|'model', 'parts': [{'text': ...}]})
    contents = []
    for msg in selected_messages:
        role = 'user' if msg.role == 'user' else 'model'
        # Prevent consecutive identical roles by combining text
        if contents and contents[-1]['role'] == role:
            contents[-1]['parts'][0]['text'] += f"\n\n{msg.content}"
        else:
            contents.append({
                'role': role,
                'parts': [{'text': msg.content}]
            })

    # Append current user turn cleanly as the final turn
    if contents and contents[-1]['role'] == 'user':
        contents[-1]['parts'][0]['text'] += f"\n\n{current_user_message}"
    else:
        contents.append({
            'role': 'user',
            'parts': [{'text': current_user_message}]
        })

    return system_prompt, contents
