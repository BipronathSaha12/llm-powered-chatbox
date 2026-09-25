import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

export function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      margin: '1rem 0',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      border: '1px solid var(--border-color)',
      background: '#0d1117'
    }}>
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        padding: '0.4rem 1rem',
        background: '#161b22',
        borderBottom: '1px solid var(--border-color)',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)'
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, textTransform: 'lowercase' }}>
          {language || 'text'}
        </span>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'transparent',
            border: 'none',
            color: copied ? '#34d399' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.78rem',
            padding: '0.2rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            transition: 'all 0.2s ease'
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          background: 'transparent',
          fontFamily: 'var(--font-mono)'
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}
