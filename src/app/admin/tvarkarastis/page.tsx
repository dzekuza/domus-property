'use client';

import { useMemo, useState } from 'react';
import { Plus, Trash2, Calendar, Clock, Scissors, Sparkles, Wrench, Eye, HelpCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageShell from '@/components/layout/PageShell';
import Btn from '@/components/shared/Btn';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/lib/fmt';
import type { ScheduleEventType } from '@/lib/types';

const EVENT_TYPES: ScheduleEventType[] = ['Žolės pjovimas', 'Valymas', 'Remontas', 'Apžiūra', 'Kita'];

const TYPE_META: Record<ScheduleEventType, { icon: React.FC<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>, color: string, bg: string }> = {
  'Žolės pjovimas': { icon: Scissors,   color: 'var(--color-success)',         bg: 'var(--color-accent-tint)' },
  'Valymas':        { icon: Sparkles,   color: 'var(--color-electric-violet)', bg: 'var(--color-purple-tint-md)' },
  'Remontas':       { icon: Wrench,     color: 'var(--color-warning)',         bg: 'rgba(184,110,0,0.12)' },
  'Apžiūra':        { icon: Eye,        color: 'var(--color-muted-ash)',       bg: 'var(--color-surface-hover)' },
  'Kita':           { icon: HelpCircle, color: 'var(--color-muted-ash-2)',    bg: 'var(--color-surface-hover)' },
};

const TYPE_COLORS: Record<ScheduleEventType, string> = {
  'Žolės pjovimas': 'var(--color-success)',
  'Valymas':        'var(--color-electric-violet)',
  'Remontas':       'var(--color-warning)',
  'Apžiūra':        'var(--color-muted-ash)',
  'Kita':           'var(--color-muted-ash-2)',
};

function isUpcoming(date: string) {
  return new Date(date) >= new Date(new Date().toDateString());
}

const innerRow: React.CSSProperties = {
  display: 'flex', gap: 14, alignItems: 'center',
  padding: '14px 16px',
  background: 'var(--color-surface-raised)',
  border: '1px solid var(--color-ghost-border)',
  borderRadius: 12,
};

export default function AdminTvarkarastisPage() {
  const { estates, scheduleEvents, createScheduleEvent, deleteScheduleEvent } = useStore();
  const [estateFilter, setEstateFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ estateId: estates[0]?.id ?? '', title: '', type: 'Žolės pjovimas' as ScheduleEventType, date: '', time: '', description: '' });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const today = new Date().toISOString().slice(0, 10);
  const filtered = scheduleEvents
    .filter(e => estateFilter === 'all' || e.estateId === estateFilter)
    .sort((a, b) => a.date.localeCompare(b.date));

  const upcoming = filtered.filter(e => isUpcoming(e.date));
  const past = filtered.filter(e => !isUpcoming(e.date));

  // Calendar: group all events (unfiltered) by date for dot markers
  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof scheduleEvents>();
    for (const ev of scheduleEvents) {
      const list = map.get(ev.date) ?? [];
      list.push(ev);
      map.set(ev.date, list);
    }
    return map;
  }, [scheduleEvents]);

  const eventDates = useMemo(() => new Set(eventsByDate.keys()), [eventsByDate]);

  const selectedDateStr = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    : null;

  const selectedDayEvents = selectedDateStr ? (eventsByDate.get(selectedDateStr) ?? []) : [];

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createScheduleEvent({ estateId: form.estateId, title: form.title, type: form.type, date: form.date, time: form.time || undefined, description: form.description || undefined });
    setForm({ estateId: estates[0]?.id ?? '', title: '', type: 'Žolės pjovimas', date: '', time: '', description: '' });
    setShowModal(false);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', fontSize: 14,
    background: 'var(--color-surface-raised)', border: '1px solid var(--color-ghost-border)',
    borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'inherit',
    fontWeight: 500, boxSizing: 'border-box', color: 'var(--foreground)',
  };

  function EventList({ events, emptyLabel }: { events: typeof filtered; emptyLabel: string }) {
    if (events.length === 0) return <p style={{ fontSize: 13, color: 'var(--color-muted-ash-2)', padding: '12px 0' }}>{emptyLabel}</p>;
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
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{event.title}</p>
                  <span style={{ fontSize: 11, background: 'var(--color-surface-hover)', color: 'var(--color-muted-ash-2)', padding: '2px 8px', borderRadius: 100 }}>{event.type}</span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} />{formatDate(event.date)}</span>
                  {event.time && <span style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} />{event.time}</span>}
                  <span style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>{estateName}</span>
                </div>
                {event.description && <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', marginTop: 3 }}>{event.description}</p>}
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
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* ── Left: event lists ─────────────────────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-muted-ash-2)', marginBottom: 10 }}>
                Planuojami ({upcoming.length})
              </p>
              <EventList events={upcoming} emptyLabel="Planuojamų įvykių nėra." />
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-muted-ash-2)', marginBottom: 10 }}>
                Praėję ({past.length})
              </p>
              <EventList events={past} emptyLabel="Praėjusių įvykių nėra." />
            </div>
          </div>

          {/* ── Right: calendar sidebar ───────────────────────────────────── */}
          <div style={{ width: 300, flexShrink: 0 }}>
            <div style={{
              border: '1px solid var(--color-ghost-border)',
              borderRadius: 16,
              background: 'var(--color-surface-raised)',
              overflow: 'hidden',
            }}>
              {/* Calendar header */}
              <div style={{
                padding: '14px 16px 10px',
                borderBottom: '1px solid var(--color-ghost-border)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Calendar size={15} style={{ color: 'var(--color-electric-violet)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>Kalendorius</span>
              </div>

              {/* Calendar */}
              <CalendarPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{ hasEvent: (date) => {
                  const ds = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                  return eventDates.has(ds);
                }}}
                modifiersClassNames={{ hasEvent: 'has-event' }}
                className="[--cell-size:2.25rem] w-full"
              />

              {/* Selected day events */}
              {selectedDate && (
                <div style={{ borderTop: '1px solid var(--color-ghost-border)', padding: '12px 14px 14px' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted-ash-2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {selectedDate.toLocaleDateString('lt-LT', { day: 'numeric', month: 'long' })}
                  </p>
                  {selectedDayEvents.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--color-muted-ash-2)' }}>Įvykių nėra</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {selectedDayEvents.map(ev => {
                        const estateName = estates.find(e => e.id === ev.estateId)?.name;
                        return (
                          <div key={ev.id} style={{
                            display: 'flex', gap: 10, alignItems: 'flex-start',
                            padding: '8px 10px',
                            background: 'var(--color-surface-raised)',
                            border: '1px solid var(--color-ghost-border)',
                            borderRadius: 10,
                          }}>
                            <div style={{
                              width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                              background: TYPE_COLORS[ev.type],
                            }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-midnight-ink)', marginBottom: 2 }}>{ev.title}</p>
                              <p style={{ fontSize: 11, color: 'var(--color-muted-ash-2)' }}>
                                {ev.type}{ev.time ? ` · ${ev.time}` : ''}{estateName ? ` · ${estateName}` : ''}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
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
