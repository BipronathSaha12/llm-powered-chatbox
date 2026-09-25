import { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchConversations,
  fetchConversationDetails,
  createConversation,
  renameConversation,
  deleteConversation
} from '../api/conversations';
import { sendChatMessage } from '../api/chat';

export function useChat() {
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    try {
      const data = await fetchConversations();
      const list = data.results || data;
      setConversations(list);
      return list;
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Could not load conversation history.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load active conversation details when activeConvId changes
  useEffect(() => {
    if (!activeConvId) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }

    async function loadDetails() {
      try {
        const details = await fetchConversationDetails(activeConvId);
        setActiveConversation(details);
        setMessages(details.messages || []);
      } catch (err) {
        console.error('Failed to load conversation details:', err);
        setError('Could not load conversation details.');
      }
    }
    loadDetails();
  }, [activeConvId]);

  // Create New Conversation
  const handleNewConversation = async () => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    try {
      const newConv = await createConversation('New Conversation');
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(newConv.id);
      setActiveConversation(newConv);
      setMessages([]);
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    }
  };

  // Switch Conversation
  const handleSelectConversation = (id) => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setActiveConvId(id);
  };

  // Rename Conversation
  const handleRenameConversation = async (id, newTitle) => {
    try {
      const updated = await renameConversation(id, newTitle);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: updated.title } : c))
      );
      if (activeConvId === id) {
        setActiveConversation((prev) => (prev ? { ...prev, title: updated.title } : null));
      }
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };

  // Delete Conversation
  const handleDeleteConversation = async (id) => {
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id) {
        setActiveConvId(null);
        setActiveConversation(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  // Send Message with Real-Time SSE Streaming
  const handleSendMessage = async (text) => {
    if (!text.trim() || isStreaming) return;

    setError(null);
    setIsStreaming(true);

    const userMsg = {
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);

    abortControllerRef.current = new AbortController();

    let currentConvId = activeConvId;
    let assistantMsgIndex = null;

    await sendChatMessage({
      conversationId: currentConvId,
      message: text,
      signal: abortControllerRef.current.signal,
      onMeta: (data) => {
        if (!currentConvId && data.conversation_id) {
          currentConvId = data.conversation_id;
          setActiveConvId(currentConvId);
          loadConversations();
        }
      },
      onDelta: (data) => {
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            return [
              ...prev.slice(0, prev.length - 1),
              { ...lastMsg, content: lastMsg.content + data.content }
            ];
          } else {
            return [
              ...prev,
              {
                role: 'assistant',
                content: data.content,
                created_at: new Date().toISOString()
              }
            ];
          }
        });
      },
      onDone: (data) => {
        setIsStreaming(false);
        if (data.title) {
          setConversations((prev) =>
            prev.map((c) => (c.id === data.conversation_id ? { ...c, title: data.title } : c))
          );
        }
        loadConversations();
      },
      onError: (data) => {
        setIsStreaming(false);
        setError(data.error || 'An error occurred during response generation.');
      }
    });

    setIsStreaming(false);
  };

  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
  };

  return {
    conversations,
    activeConvId,
    activeConversation,
    messages,
    isStreaming,
    loading,
    error,
    handleNewConversation,
    handleSelectConversation,
    handleRenameConversation,
    handleDeleteConversation,
    handleSendMessage,
    handleStopStream
  };
}
