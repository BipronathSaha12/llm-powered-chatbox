import { tokens } from './client';

export async function sendChatMessage({ conversationId, message, onMeta, onDelta, onDone, onError, signal }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
  const url = `${API_BASE_URL}/chat/`;

  let accessToken = tokens.getAccess();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    let response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        conversation_id: conversationId || null,
        message
      }),
      signal
    });

    // Handle 401 Unauthorized by attempting token refresh automatically
    if (response.status === 401 && tokens.getRefresh()) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: tokens.getRefresh() })
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          tokens.set(data.access, data.refresh || tokens.getRefresh());
          headers.Authorization = `Bearer ${data.access}`;
          // Retry original chat request with new access token
          response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              conversation_id: conversationId || null,
              message
            }),
            signal
          });
        } else {
          tokens.clear();
          window.dispatchEvent(new Event('auth:logout'));
          if (onError) onError({ error: 'Session expired. Please sign in again.' });
          return;
        }
      } catch (err) {
        tokens.clear();
        window.dispatchEvent(new Event('auth:logout'));
        if (onError) onError({ error: 'Session expired. Please sign in again.' });
        return;
      }
    }

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const errorMsg = errorJson.error?.message || `HTTP ${response.status}: Failed to communicate with AI chat backend.`;
      if (onError) onError({ error: errorMsg });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let currentEvent = 'message';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Retain trailing un-terminated line fragment

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) {
          // Empty line signifies end of an SSE message block
          currentEvent = 'message';
          continue;
        }

        if (line.startsWith(':')) {
          // SSE comment / heartbeat line
          continue;
        }

        if (line.startsWith('event:')) {
          currentEvent = line.substring(6).trim();
        } else if (line.startsWith('data:')) {
          const rawData = line.substring(5).trim();
          try {
            const data = JSON.parse(rawData);
            if (currentEvent === 'meta' && onMeta) {
              onMeta(data);
            } else if (currentEvent === 'delta' && onDelta) {
              onDelta(data);
            } else if (currentEvent === 'done' && onDone) {
              onDone(data);
            } else if (currentEvent === 'error' && onError) {
              onError(data);
            }
          } catch (err) {
            console.warn('Failed to parse SSE payload:', rawData, err);
          }
        }
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Chat stream aborted by user.');
    } else {
      if (onError) onError({ error: err.message || 'Connection error while streaming AI response.' });
    }
  }
}
