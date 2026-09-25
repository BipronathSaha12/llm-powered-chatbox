import React, { useState, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';

export function ChatInput({ onSendMessage, isStreaming, onStopStream }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div style={{
      padding: '1rem 1.5rem',
      background: 'var(--bg-glass)',
      borderTop: '1px solid var(--border-color)',
      position: 'relative'
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-end',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.75rem 1rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
          transition: 'border-color 0.2s ease'
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Gemini anything... (Shift + Enter for new line)"
          rows={1}
          maxLength={32000}
          disabled={isStreaming}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.95rem',
            resize: 'none',
            maxHeight: '180px',
            lineHeight: 1.5
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {input.length}/32000
          </span>

          {isStreaming ? (
            <button
              type="button"
              onClick={onStopStream}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#ef4444',
                border: 'none',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              title="Stop response"
            >
              <Square size={16} fill="#fff" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: input.trim() ? 'var(--gradient-primary)' : 'var(--bg-hover)',
                border: 'none',
                color: input.trim() ? '#fff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                boxShadow: input.trim() ? '0 0 12px rgba(139, 92, 246, 0.4)' : 'none',
                transition: 'all 0.2s ease'
              }}
              title="Send message"
            >
              <Send size={18} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
