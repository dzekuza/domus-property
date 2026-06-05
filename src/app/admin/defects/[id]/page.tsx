'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageShell from '@/components/layout/PageShell';
import Avatar from '@/components/shared/Avatar';
import Btn from '@/components/shared/Btn';
import { formatRelative } from '@/lib/fmt';
import type { DefectStatus } from '@/lib/types';

const STATUS_OPTIONS: { label: string; value: DefectStatus; color: string }[] = [
  { label: 'Atviras',    value: 'open',     color: 'var(--color-muted-ash)' },
  { label: 'Vykdomas',  value: 'progress', color: 'var(--color-danger)' },
  { label: 'Išspręstas', value: 'resolved', color: 'var(--color-success)' },
  { label: 'Atmestas',  value: 'rejected', color: 'var(--color-danger)' },
];

const innerSection: React.CSSProperties = {
  background: 'var(--color-surface-raised)',
  border: '1px solid var(--color-ghost-border)',
  borderRadius: 14,
  padding: 16,
};

export default function DefectThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { defects, users, units, estates, replyToDefect, setDefectStatus, deleteDefect } = useStore();
  const defect = defects.find(d => d.id === id);

  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  if (!defect) return <div style={{ padding: 32 }}>Defektas nerastas.</div>;

  const unit = units.find(u => u.id === defect.unitId);
  const estate = estates.find(e => e.id === defect.estateId);
  const owner = users.find(u => u.id === defect.ownerUserId);

  async function handleReply() {
    if (!replyText.trim()) return;
    setSending(true);
    await replyToDefect(defect!.id, replyText, []);
    setReplyText('');
    setSending(false);
  }

  function handleDelete() {
    deleteDefect(defect!.id);
    router.push('/admin/defects');
  }

  return (
    <PageShell
      title={defect.title}
      subtitle={`${estate?.name} · Butas ${unit?.number} · ${owner?.fullName}`}
      breadcrumbs={[{ label: 'Defektai', href: '/admin/defects' }, { label: defect.id }]}
      actions={<Btn variant="ghost" size="sm" icon={<Trash2 size={13} />} onClick={handleDelete} style={{ color: 'var(--color-danger)' }}>Ištrinti</Btn>}
      bodyStyle={{ padding: '20px 24px 24px' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* Thread */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {defect.messages.map((msg) => {
            const author = users.find(u => u.id === msg.authorUserId);
            const isAdmin = author?.role === 'admin';
            return (
              <div
                key={msg.id}
                style={{
                  ...innerSection,
                  ...(isAdmin ? { background: 'var(--color-purple-tint-md)', border: '1px solid var(--color-purple)' } : {}),
                }}
              >
                <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                  <Avatar name={author?.fullName ?? '?'} bg={author?.avatarBg} size={36} />
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{author?.fullName}</span>
                      <span style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>{isAdmin ? 'Administratorius' : 'Savininkas'}</span>
                      <span style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>{formatRelative(msg.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: 'var(--color-midnight-ink)', lineHeight: 1.55 }}>{msg.body}</p>
              </div>
            );
          })}

          {/* Reply composer */}
          <div style={innerSection}>
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              rows={4}
              placeholder="Rašykite atsakymą…"
              style={{
                width: '100%', padding: '10px 14px', fontSize: 14,
                background: 'var(--color-surface-raised)', border: '1px solid var(--color-ghost-border)',
                borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'inherit',
                fontWeight: 500, resize: 'vertical', boxSizing: 'border-box',
                marginBottom: 12, color: 'var(--foreground)',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Btn variant="ghost" size="sm">Pridėti failą</Btn>
              <Btn variant="primary" size="sm" icon={<Send size={13} />} disabled={sending || !replyText.trim()} onClick={handleReply}>
                {sending ? 'Siunčiama…' : 'Siųsti atsakymą'}
              </Btn>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Status */}
          <div style={innerSection}>
            <p style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted-ash-2)', marginBottom: 12 }}>Būsena</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDefectStatus(defect.id, opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8,
                    border: defect.status === opt.value ? `1px solid ${opt.color}` : '1px solid transparent',
                    background: defect.status === opt.value ? 'rgba(0,0,0,0.06)' : 'transparent',
                    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, fontSize: 14,
                    color: 'var(--color-midnight-ink)',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                  {opt.label}
                  {defect.status === opt.value && <span style={{ marginLeft: 'auto', fontSize: 12, color: opt.color }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div style={innerSection}>
            <p style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted-ash-2)', marginBottom: 12 }}>Detalės</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'ID', value: defect.id },
                { label: 'Objektas', value: estate?.name },
                { label: 'Butas', value: unit?.number },
                { label: 'Patalpa', value: defect.room },
                { label: 'Savininkas', value: owner?.fullName },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', color: 'var(--color-midnight-ink)' }}>{row.value ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </PageShell>
  );
}
