'use client';

import { useState } from 'react';
import { Plus, AlertTriangle, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { useStore } from '@/lib/store';
import { DEFECT_ROOMS } from '@/lib/constants';
import PageShell from '@/components/layout/PageShell';
import StatusPill from '@/components/shared/StatusPill';
import Btn from '@/components/shared/Btn';
import Avatar from '@/components/shared/Avatar';
import EmptyState from '@/components/shared/EmptyState';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatRelative } from '@/lib/fmt';
import type { DefectStatus, DefectRoom } from '@/lib/types';

const filters: { label: string; value: DefectStatus | 'all' }[] = [
  { label: 'Visi', value: 'all' },
  { label: 'Atviri', value: 'open' },
  { label: 'Vykdomi', value: 'progress' },
  { label: 'Išspręsti', value: 'resolved' },
];

const innerItem: React.CSSProperties = {
  background: 'var(--color-input-bg)',
  border: '1px solid var(--color-ghost-border)',
  borderRadius: 14,
  overflow: 'hidden',
};

export default function DefektaiPage() {
  const { effectiveUser, defectsForUnit, unitOf, users, submitDefect, replyToDefect } = useStore();
  const effUser = effectiveUser();
  const unit = effUser?.unitId ? unitOf(effUser.id) : null;
  const defects = unit ? defectsForUnit(unit.id) : [];

  const [filter, setFilter] = useState<DefectStatus | 'all'>('all');
  const [openCard, setOpenCard] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [reply, setReply] = useState<Record<string, string>>({});
  const [room, setRoom] = useState<DefectRoom>('Kita');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filtered = filter === 'all' ? defects : defects.filter(d => d.status === filter);

  async function handleSubmitDefect() {
    if (!unit || !title.trim() || !body.trim()) return;
    setSubmitting(true);
    await submitDefect({ unitId: unit.id, estateId: unit.estateId, title, room, body, files: [] });
    setTitle(''); setBody(''); setRoom('Kita');
    setShowModal(false);
    setSubmitting(false);
  }

  async function handleReply(defectId: string) {
    const text = reply[defectId]?.trim();
    if (!text) return;
    await replyToDefect(defectId, text, []);
    setReply(r => ({ ...r, [defectId]: '' }));
  }

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: 'var(--radius-pill)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
    background: active ? 'var(--color-surface-active)' : 'rgba(0,0,0,0.04)',
    color: active ? 'var(--color-midnight-ink)' : 'var(--color-muted-ash)',
    border: active ? 'none' : '1px solid var(--color-ghost-border)',
  });

  return (
    <>
      <PageShell
        title="Defektai"
        actions={<Btn variant="primary" icon={<Plus size={15} />} onClick={() => setShowModal(true)}>Naujas pranešimas</Btn>}
        bodyStyle={{ padding: '16px 24px 24px' }}
      >
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {filters.map(f => (
            <button key={f.value} style={pillStyle(filter === f.value)} onClick={() => setFilter(f.value)}>
              {f.label} ({f.value === 'all' ? defects.length : defects.filter(d => d.status === f.value).length})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="Pranešimų dar nėra" subtitle="Pastebėję defektą, pranešite mums." action={{ label: 'Naujas pranešimas', onClick: () => setShowModal(true) }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(defect => {
              const isOpen = openCard === defect.id;
              return (
                <div key={defect.id} style={innerItem}>
                  <button
                    onClick={() => setOpenCard(isOpen ? null : defect.id)}
                    aria-expanded={isOpen}
                    aria-controls={`defect-body-${defect.id}`}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', fontWeight: 500 }}>{defect.id}</span>
                        <span style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }} aria-hidden="true">·</span>
                        <span style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>{defect.room}</span>
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{defect.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', marginTop: 2 }}>Pateikta {formatRelative(defect.createdAt)} · {defect.messages.length} žinutės</p>
                    </div>
                    <StatusPill type="defect" value={defect.status} />
                    {isOpen
                      ? <ChevronUp size={16} style={{ color: 'var(--color-muted-ash-2)' }} aria-hidden="true" />
                      : <ChevronDown size={16} style={{ color: 'var(--color-muted-ash-2)' }} aria-hidden="true" />}
                  </button>

                  {isOpen && (
                    <div id={`defect-body-${defect.id}`} className="fade-in" style={{ borderTop: '1px solid var(--color-ghost-border)', padding: '16px 20px' }}>
                      {defect.messages.map(msg => {
                        const author = users.find(u => u.id === msg.authorUserId);
                        const isAdmin = author?.role === 'admin';
                        return (
                          <div key={msg.id} style={{ display: 'flex', gap: 12, marginBottom: 14, background: isAdmin ? 'rgba(139,92,246,0.12)' : 'transparent', padding: isAdmin ? '12px' : '0', borderRadius: 8 }}>
                            <Avatar name={author?.fullName ?? '?'} bg={author?.avatarBg} size={32} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{author?.fullName}</span>
                                <span style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>{formatRelative(msg.createdAt)}</span>
                              </div>
                              <p style={{ fontSize: 14, color: 'var(--color-muted-ash)' }}>{msg.body}</p>
                            </div>
                          </div>
                        );
                      })}
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <input
                          value={reply[defect.id] ?? ''}
                          onChange={e => setReply(r => ({ ...r, [defect.id]: e.target.value }))}
                          placeholder="Rašykite atsakymą…"
                          onKeyDown={e => e.key === 'Enter' && handleReply(defect.id)}
                          style={{ flex: 1, padding: '10px 14px', fontSize: 14, background: 'var(--color-input-bg)', color: 'var(--foreground)', border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'inherit', fontWeight: 500 }}
                        />
                        <Btn variant="primary" size="sm" icon={<Send size={13} />} onClick={() => handleReply(defect.id)}>Siųsti</Btn>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </PageShell>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Naujas pranešimas apie defektą</DialogTitle></DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Patalpa</label>
              <Select value={room} onValueChange={v => setRoom(v as DefectRoom)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>{DEFECT_ROOMS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Trumpas pavadinimas</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="pvz. Nutekėjimas po kriaukle" style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: 'var(--color-input-bg)', color: 'var(--foreground)', border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'inherit', fontWeight: 500, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Aprašymas</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} placeholder="Aprašykite problemą detaliau…" style={{ width: '100%', padding: '10px 14px', fontSize: 14, background: 'var(--color-input-bg)', color: 'var(--foreground)', border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'inherit', fontWeight: 500, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <Btn variant="primary" disabled={submitting || !title.trim() || !body.trim()} onClick={handleSubmitDefect} style={{ justifyContent: 'center' }}>
              {submitting ? 'Siunčiama…' : 'Pateikti pranešimą'}
            </Btn>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
