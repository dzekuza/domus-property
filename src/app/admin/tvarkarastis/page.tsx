'use client';

import { useState } from 'react';
import { Plus, Trash2, Calendar, Clock, Scissors, Sparkles, Wrench, Eye, HelpCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageShell from '@/components/layout/PageShell';
import Btn from '@/components/shared/Btn';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/lib/fmt';
import type { ScheduleEventType } from '@/lib/types';

const EVENT_TYPES: ScheduleEventType[] = ['Žolės pjovimas', 'Valymas', 'Remontas', 'Apžiūra', 'Kita'];

const TYPE_META: Record<ScheduleEventType, { icon: React.FC<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>, color: string, bg: string }> = {
  'Žolės pjovimas': { icon: Scissors,   color: 'var(--color-success)',         bg: 'rgba(118,192,61,0.12)' },
  'Valymas':        { icon: Sparkles,   color: 'var(--color-electric-violet)', bg: 'rgba(124,58,237,0.12)' },
  'Remontas':       { icon: Wrench,     color: 'var(--color-warning)',         bg: 'rgba(184,110,0,0.12)' },
  'Apžiūra':        { icon: Eye,        color: 'rgba(255,255,255,0.55)',       bg: 'rgba(255,255,255,0.07)' },
  'Kita':           { icon: HelpCircle, color: 'rgba(255,255,255,0.40)',       bg: 'rgba(255,255,255,0.07)' },
};

function isUpcoming(date: string) {
  return new Date(date) >= new Date(new Date().toDateString());
}

const innerRow: React.CSSProperties = {
  display: 'flex', gap: 14, alignItems: 'center',
  padding: '14px 16px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
};

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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', fontSize: 14,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'inherit',
    fontWeight: 500, boxSizing: 'border-box', color: 'rgba(255,255,255,0.92)',
  };

  function EventList({ events, emptyLabel }: { events: typeof filtered; emptyLabel: string }) {
    if (events.length === 0) return <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.40)', padding: '12px 0' }}>{emptyLabel}</p>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {events.map(event => {
          const meta = TYPE_META[event.type];
          const Icon = meta.icon;
          const estateName = estates.find(e => e.id === event.estateId)?.name;
          return (
            <div key={event.id} style={innerRow}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} strokeWidth={1.5} style={{ color: meta.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>{event.title}</p>
                  <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.50)', padding: '2px 8px', borderRadius: 100 }}>{event.type}</span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} />{formatDate(event.date)}</span>
                  {event.time && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} />{event.time}</span>}
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{estateName}</span>
                </div>
                {event.description && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{event.description}</p>}
              </div>
              <button onClick={() => deleteScheduleEvent(event.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 6, display: 'flex', borderRadius: 6 }}>
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <PageShell
        title="Tvarkaraštis"
        subtitle={`${scheduleEvents.length} įvykių iš viso`}
        actions={
          <>
            <Select value={estateFilter} onValueChange={v => { if (v) setEstateFilter(v); }}>
              <SelectTrigger className="rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Visi objektai</SelectItem>
                  {estates.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Btn variant="primary" icon={<Plus size={15} />} onClick={() => setShowModal(true)}>Naujas įvykis</Btn>
          </>
        }
        bodyStyle={{ padding: '20px 24px 24px' }}
      >
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.38)', marginBottom: 10 }}>
            Planuojami ({upcoming.length})
          </p>
          <EventList events={upcoming} emptyLabel="Planuojamų įvykių nėra." />
        </div>

        <div>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.38)', marginBottom: 10 }}>
            Praėję ({past.length})
          </p>
          <EventList events={past} emptyLabel="Praėjusių įvykių nėra." />
        </div>
      </PageShell>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Naujas įvykis</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Objektas</label>
              <Select value={form.estateId} onValueChange={v => { if (v) setForm(f => ({ ...f, estateId: v })); }}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {estates.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Tipas</label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as ScheduleEventType }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
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
    </>
  );
}
