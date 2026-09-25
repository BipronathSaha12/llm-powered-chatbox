import React, { useRef, useEffect } from 'react';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { LoadingIndicator } from './LoadingIndicator';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, MessageSquare, AlertCircle, Sun, Moon } from 'lucide-react';

export function ChatWindow({ conversation, messages, isStreaming, error, onSendMessage, onStopStream }) {
  const messagesEndRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, error]);

  return (
    <main style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Top Bar Header */}
      <header style={{
        padding: '1rem 1.5rem',
        background: 'var(--bg-glass)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <MessageSquare size={18} color="var(--accent-purple)" />
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {conversation?.title || 'New Conversation'}
          </h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Light / Dark Theme Switcher */}
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-glow)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 500,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease'
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#7c3aed" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#34d399',
              boxShadow: '0 0 8px #34d399'
            }} />
            Gemini 2.5 Flash
          </div>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
        {messages.length === 0 ? (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '1rem',
            padding: '2rem'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-xl)',
              background: 'var(--gradient-glow)',
              border: '1px solid var(--border-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 32px rgba(139, 92, 246, 0.3)'
            }}>
              <Sparkles size={32} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }} className="gradient-text">
              How can I assist you today?
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', fontSize: '0.92rem' }}>
              Ask coding questions, debugging problems, SQL queries, or general knowledge questions with real-time AI responses.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <Message
              key={msg.id || idx}
              message={msg}
              onEditSubmit={onSendMessage}
              isStreaming={isStreaming}
            />
          ))
        )}

        {isStreaming && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <LoadingIndicator />
        )}

        {error && (
          <div style={{
            margin: '1rem',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={onSendMessage}
        isStreaming={isStreaming}
        onStopStream={onStopStream}
      />
    </main>
  );
}
