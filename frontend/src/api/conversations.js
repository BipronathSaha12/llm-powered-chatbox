import { apiFetch } from './client';

export async function fetchConversations() {
  const res = await apiFetch('/conversations/');
  if (!res.ok) throw new Error('Failed to fetch conversations.');
  return await res.json();
}

export async function fetchConversationDetails(id) {
  const res = await apiFetch(`/conversations/${id}/`);
  if (!res.ok) throw new Error('Failed to load conversation details.');
  return await res.json();
}

export async function createConversation(title = 'New Conversation') {
  const res = await apiFetch('/conversations/', {
    method: 'POST',
    body: JSON.stringify({ title })
  });
  if (!res.ok) throw new Error('Failed to create conversation.');
  return await res.json();
}

export async function renameConversation(id, title) {
  const res = await apiFetch(`/conversations/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ title })
  });
  if (!res.ok) throw new Error('Failed to rename conversation.');
  return await res.json();
}

export async function deleteConversation(id) {
  const res = await apiFetch(`/conversations/${id}/`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete conversation.');
  return true;
}
