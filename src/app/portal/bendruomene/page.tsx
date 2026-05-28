'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/shared/Card';
import Avatar from '@/components/shared/Avatar';
import { formatRelative } from '@/lib/fmt';

export default function BendruomenePage() {
  const { effectiveUser, unitOf, estateForUnit, chatMessages, sendChatMessage, users } = useStore();
  const effUser = effectiveUser();
  const unit = effUser?.unitId ? unitOf(effUser.id) : null;
  const estate = unit ? estateForUnit(unit.id) : null;
  const estateId = estate?.id;

  const messages = chatMessages
    .filter(m => m.estateId === estateId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  function handleSend() {
    if (!text.trim() || !estateId) return;
    sendChatMessage(estateId, text.trim());
    setText('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      <PageHeader
        title="Bendruomenė"
        subtitle={estate ? `${estate.name} · Gyventojų pokalbiai` : 'Gyventojų pokalbiai'}
      />

      {/* Messages area */}
      <Card style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, color: 'var(--color-muted-ash-2)' }}>
            <MessageSquare size={36} strokeWidth={1.5} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>Pokalbių dar nėra</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Būkite pirmas — parašykite žinutę!</p>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px' }}>
            {messages.map((msg, i) => {
              const author = users.find(u => u.id === msg.authorUserId);
              const isAdmin = author?.role === 'admin';
              const isMine = msg.authorUserId === effUser?.id;
              const prevMsg = messages[i - 1];
              const showAvatar = !prevMsg || prevMsg.authorUserId !== msg.authorUserId;

              return (
                <div key={msg.id} style={{ display: 'flex', gap: 10, marginBottom: showAvatar ? 16 : 4, flexDirection: isMine ? 'row-reverse' : 'row' }}>
                  {/* Avatar spacer */}
                  <div style={{ width: 34, flexShrink: 0 }}>
                    {showAvatar && !isMine && (
                      <Avatar name={author?.fullName ?? '?'} bg={author?.avatarBg} size={34} />
                    )}
                  </div>

                  <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                    {showAvatar && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        {!isMine && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{author?.fullName}</span>}
                        {isAdmin && (
                          <span style={{ fontSize: 10, fontWeight: 500, background: 'var(--color-electric-violet)', color: '#fff', padding: '1px 6px', borderRadius: 100 }}>Administracija</span>
                        )}
                        {isMine && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>Jūs</span>}
                      </div>
                    )}
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: isMine
                        ? 'var(--color-electric-violet)'
                        : isAdmin
                          ? 'var(--color-violet-tint)'
                          : 'var(--color-cloud-canvas)',
                      color: isMine ? '#fff' : 'var(--color-midnight-ink)',
                      fontSize: 14,
                      lineHeight: 1.5,
                      border: isAdmin && !isMine ? '1px solid var(--color-violet-tint-2)' : 'none',
                    }}>
                      {msg.body}
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', marginTop: 3 }}>
                      {formatRelative(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-ghost-border)', display: 'flex', gap: 10 }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Rašykite žinutę…"
            style={{ flex: 1, padding: '10px 16px', fontSize: 14, border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-pill)', outline: 'none', fontFamily: 'inherit', fontWeight: 500 }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-electric-violet)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--color-ghost-border)'}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            style={{ width: 42, height: 42, borderRadius: '50%', background: text.trim() ? 'var(--color-electric-violet)' : 'var(--color-cloud-canvas)', border: 'none', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .15s' }}
          >
            <Send size={16} strokeWidth={1.5} style={{ color: text.trim() ? '#fff' : 'var(--color-muted-ash-2)' }} />
          </button>
        </div>
      </Card>
    </div>
  );
}
