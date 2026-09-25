import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { ChatWindow } from '../components/ChatWindow';
import { useChat } from '../hooks/useChat';

export function Chat() {
  const {
    conversations,
    activeConvId,
    activeConversation,
    messages,
    isStreaming,
    error,
    handleNewConversation,
    handleSelectConversation,
    handleRenameConversation,
    handleDeleteConversation,
    handleSendMessage,
    handleStopStream
  } = useChat();

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <Sidebar
        conversations={conversations}
        activeId={activeConvId}
        onSelectConv={handleSelectConversation}
        onNewConv={handleNewConversation}
        onRenameConv={handleRenameConversation}
        onDeleteConv={handleDeleteConversation}
      />
      <ChatWindow
        conversation={activeConversation}
        messages={messages}
        isStreaming={isStreaming}
        error={error}
        onSendMessage={handleSendMessage}
        onStopStream={handleStopStream}
      />
    </div>
  );
}
