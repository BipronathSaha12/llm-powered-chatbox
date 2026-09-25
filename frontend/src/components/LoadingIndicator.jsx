import React from 'react';
import { Bot } from 'lucide-react';

export function LoadingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '0.8rem', padding: '1rem', alignItems: 'flex-start' }} className="animate-fade-in">
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: 'var(--gradient-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)',
        flexShrink: 0
      }}>
        <Bot size={20} color="#fff" />
      </div>
      <div style={{
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-color)',
        padding: '0.8rem 1.2rem',
        borderRadius: 'var(--radius-lg)',
        borderTopLeftRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginRight: '6px' }}>Thinking</span>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-purple)', animation: 'pulseGlow 1s infinite ease-in-out' }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)', animation: 'pulseGlow 1s infinite ease-in-out 0.2s' }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-pink)', animation: 'pulseGlow 1s infinite ease-in-out 0.4s' }} />
      </div>
    </div>
  );
}
