'use client';

import { useState } from 'react';
import { Plus, Trash2, Calendar, Clock, Scissors, Sparkles, Wrench, Eye, HelpCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/shared/Card';
import Btn from '@/components/shared/Btn';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDate } from '@/lib/fmt';
import type { ScheduleEventType } from '@/lib/types';

const EVENT_TYPES: ScheduleEventType[] = ['Žolės pjovimas', 'Valymas', 'Remontas', 'Apžiūra', 'Kita'];

const TYPE_META: Record<ScheduleEventType, { icon: React.FC<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>, color: string, bg: string }> = {
  'Žolės pjovimas': { icon: Scissors,   color: 'var(--color-success)',         bg: 'var(--color-success-tint)' },
  'Valymas':        { icon: Sparkles,   color: 'var(--color-electric-violet)', bg: 'var(--color-violet-tint)' },
  'Remontas':       { icon: Wrench,     color: 'var(--color-warning)',         bg: 'var(--color-warning-tint)' },
  'Apžiūra':        { icon: Eye,        color: 'var(--color-muted-ash)',       bg: 'var(--color-cloud-canvas)' },
  'Kita':           { icon: HelpCircle, color: 'var(--color-muted-ash-2)',     bg: 'var(--color-cloud-canvas)' },
};

function isUpcoming(date: string) {
  return new Date(date) >= new Date(new Date().toDateString());
}

export default function AdminTvarkarastisPage() {
  const { estates, scheduleEvents, createScheduleEvent, deleteScheduleEvent } = useStore();
  const [estateFilter, setEstateFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ estateId: estates[0]?.id ?? '', title: '', type: 'Žolės pjovimas' as ScheduleEventType, date: '', time: '', description: '' });

  const today = new Date().toISOString().slice(0, 10);
  const filtered = scheduleEvents
    .filter(e => estateFilter === 'all' || e.estateId === estateFilter)
    .sort((a, b) => a.date.localeCompare(b.date));

  const upcoming = filtered.filter(e => isUpcoming(e.date));
  const past = filtered.filter(e => !isUpcoming(e.date));

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createScheduleEvent({ estateId: form.estateId, title: form.title, type: form.type, date: form.date, time: form.time || undefined, description: form.description || undefined });
    setForm({ estateId: estates[0]?.id ?? '', title: '', type: 'Žolės pjovimas', date: '', time: '', description: '' });
    setShowModal(false);
  }

  const selectStyle: React.CSSProperties = { padding: '8px 12px', fontSize: 13, border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-pill)', outline: 'none', fontFamily: 'inherit', fontWeight: 500, background: 'var(--color-paper-white)' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', fontSize: 14, border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'inherit', fontWeight: 500, boxSizing: 'border-box' };

  function EventList({ events, emptyLabel }: { events: typeof filtered; emptyLabel: string }) {
    if (events.length === 0) return <p style={{ fontSize: 13, color: 'var(--color-muted-ash-2)', padding: '16px 0' }}>{emptyLabel}</p>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {events.map(event => {
          const meta = TYPE_META[event.type];
          const Icon = meta.icon;
          const estateName = estates.find(e => e.id === event.estateId)?.name;
          return (
            <Card key={event.id} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} strokeWidth={1.5} style={{ color: meta.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{event.title}</p>
                  <span style={{ fontSize: 11, background: 'var(--color-cloud-canvas)', color: 'var(--color-muted-ash-2)', padding: '2px 8px', borderRadius: 100 }}>{event.type}</span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {formatDate(event.date)}</span>
                  {event.time && <span style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {event.time}</span>}
                  <span style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>{estateName}</span>
                </div>
                {event.description && <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', marginTop: 3 }}>{event.description}</p>}
              </div>
              <button onClick={() => deleteScheduleEvent(event.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 6, display: 'flex', borderRadius: 6 }}>
                <Trash2 size={15} />
              </button>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Tvarkaraštis"
        subtitle={`${scheduleEvents.length} įvykių iš viso`}
        actions={
          <>
            <select value={estateFilter} onChange={e => setEstateFilter(e.target.value)} style={selectStyle}>
              <option value="all">Visi objektai</option>
              {estates.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <Btn variant="primary" icon={<Plus size={15} />} onClick={() => setShowModal(true)}>Naujas įvykis</Btn>
          </>
        }
      />

      {/* Upcoming */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-muted-ash-2)', marginBottom: 12 }}>
          Planuojami ({upcoming.length})
        </p>
        <EventList events={upcoming} emptyLabel="Planuojamų įvykių nėra." />
      </div>

      {/* Past */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-muted-ash-2)', marginBottom: 12 }}>
          Praėję ({past.length})
        </p>
        <EventList events={past} emptyLabel="Praėjusių įvykių nėra." />
      </div>

      {/* Create modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Naujas įvykis</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Objektas</label>
              <select value={form.estateId} onChange={e => setForm(f => ({ ...f, estateId: e.target.value }))} style={{ ...inputStyle }}>
                {estates.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Tipas</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ScheduleEventType }))} style={{ ...inputStyle }}>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Pavadinimas</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="pvz. Žolės pjovimas" required style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Data</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required min={today} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Laikas (neprivaloma)</label>
                <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Aprašymas (neprivaloma)</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Papildoma informacija gyventojams…" style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <Btn variant="primary" type="submit" style={{ justifyContent: 'center', marginTop: 4 }}>Sukurti įvykį</Btn>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
