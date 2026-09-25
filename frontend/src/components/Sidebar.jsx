import React from 'react';
import { Plus, LogOut, Sparkles, User as UserIcon, Sun, Moon } from 'lucide-react';
import { ConversationList } from './ConversationList';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

export function Sidebar({ conversations, activeId, onSelectConv, onNewConv, onRenameConv, onDeleteConv }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside style={{
      width: '280px',
      height: '100vh',
      background: 'var(--bg-glass)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.25rem 1rem',
      gap: '1.25rem',
      backdropFilter: 'blur(16px)',
      flexShrink: 0
    }}>
      {/* App Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--gradient-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(139, 92, 246, 0.4)'
        }}>
          <Sparkles size={20} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.2 }} className="gradient-text">
            Gemini AI
          </h1>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Django + React + Postgres</span>
        </div>
      </div>

      {/* New Chat Button */}
      <button
        onClick={onNewConv}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem',
          width: '100%',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--gradient-glow)',
          border: '1px solid var(--border-glow)',
          color: 'var(--text-primary)',
          fontWeight: 600,
          fontSize: '0.9rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
        }}
      >
        <Plus size={18} color="var(--accent-cyan)" />
        New Conversation
      </button>

      {/* Conversations Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '0.5rem' }}>
          Recent Chats
        </span>
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={onSelectConv}
          onRename={onRenameConv}
          onDelete={onDeleteConv}
        />
      </div>

      {/* Quick Theme Switcher & User Footer */}
      <div style={{
        paddingTop: '0.85rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.55rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontSize: '0.82rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#7c3aed" />}
          <span>Toggle {theme === 'dark' ? 'Light' : 'Dark'} Theme</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)'
            }}>
              <UserIcon size={16} color="var(--accent-cyan)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.username || 'User'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || ''}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              transition: 'color 0.2s ease'
            }}
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
