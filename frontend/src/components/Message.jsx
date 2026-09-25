import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check, Pencil, X, Send } from 'lucide-react';
import { CodeBlock } from './CodeBlock';

export function Message({ message, onEditSubmit, isStreaming }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleSaveEdit = () => {
    if (!editText.trim() || isStreaming) return;
    setIsEditing(false);
    if (onEditSubmit) {
      onEditSubmit(editText.trim());
    }
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(message.content);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.85rem',
        padding: '1rem 0.5rem',
        maxWidth: '100%',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      {!isUser && (
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)',
            flexShrink: 0,
            marginTop: '2px'
          }}
        >
          <Bot size={20} color="#fff" />
        </div>
      )}

      <div
        style={{
          maxWidth: '82%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isUser ? 'flex-end' : 'flex-start'
        }}
      >
        <div
          style={{
            width: '100%',
            background: isUser
              ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)'
              : 'var(--bg-secondary)',
            border: isUser ? 'none' : '1px solid var(--border-color)',
            color: isUser ? '#ffffff' : 'var(--text-primary)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            borderTopRightRadius: isUser ? '4px' : 'var(--radius-lg)',
            borderTopLeftRadius: !isUser ? '4px' : 'var(--radius-lg)',
            boxShadow: isUser ? '0 4px 20px rgba(124, 58, 237, 0.25)' : 'var(--shadow-main)',
            fontSize: '0.95rem'
          }}
        >
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleEditKeyDown}
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  padding: '0.75rem',
                  fontSize: '0.92rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical'
                }}
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(message.content);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={!editText.trim() || isStreaming}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    background: '#22c55e',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  <Send size={14} /> Save & Submit
                </button>
              </div>
            </div>
          ) : isUser ? (
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {message.content}
            </div>
          ) : (
            <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node: _node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <CodeBlock
                        language={match[1]}
                        value={String(children).replace(/\n$/, '')}
                        {...props}
                      />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {message.created_at && !isEditing && (
            <div
              style={{
                fontSize: '0.7rem',
                color: isUser ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                marginTop: '0.4rem',
                textAlign: 'right'
              }}
            >
              {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>

        {/* Action Toolbar below message (Copy & Edit options) */}
        {!isEditing && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginTop: '0.35rem',
              padding: '0 0.2rem'
            }}
          >
            {/* Copy Button for Assistant and User messages */}
            <button
              onClick={handleCopy}
              className="action-btn"
              title="Copy message to clipboard"
            >
              {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            {/* Edit Button for User messages */}
            {isUser && onEditSubmit && (
              <button
                onClick={() => {
                  setEditText(message.content);
                  setIsEditing(true);
                }}
                className="action-btn"
                title="Edit message and resubmit"
                disabled={isStreaming}
              >
                <Pencil size={14} />
                <span>Edit</span>
              </button>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px'
          }}
        >
          <User size={20} color="var(--accent-cyan)" />
        </div>
      )}
    </div>
  );
}
