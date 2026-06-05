'use client';

import { useMemo, useState } from 'react';
import { Calendar, Clock, Scissors, Sparkles, Wrench, Eye, HelpCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageShell from '@/components/layout/PageShell';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import type { ScheduleEventType, ScheduleEvent } from '@/lib/types';
import { formatDate } from '@/lib/fmt';

const TYPE_META: Record<ScheduleEventType, { icon: React.FC<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>, color: string, bg: string }> = {
  'Žolės pjovimas': { icon: Scissors,   color: 'var(--color-success)',         bg: 'rgba(118,192,61,0.12)' },
  'Valymas':        { icon: Sparkles,   color: 'var(--color-electric-violet)', bg: 'rgba(118,192,61,0.12)' },
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

function groupByMonth(events: ScheduleEvent[]) {
  const groups: Record<string, ScheduleEvent[]> = {};
  for (const e of events) {
    const key = e.date.slice(0, 7);
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  return groups;
}

function monthLabel(key: string) {
  const [year, month] = key.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('lt-LT', { month: 'long', year: 'numeric' });
}

export default function TvarkarastisPage() {
  const { effectiveUser, unitOf, scheduleEvents } = useStore();
  const effUser = effectiveUser();
  const unit = effUser?.unitId ? unitOf(effUser.id) : null;
  const estateId = unit?.estateId;
  const events = scheduleEvents
    .filter(e => e.estateId === estateId)
    .sort((a, b) => a.date.localeCompare(b.date));

  const grouped = groupByMonth(events);
  const today = new Date().toISOString().slice(0, 10);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof events>();
    for (const ev of events) {
      const list = map.get(ev.date) ?? [];
      list.push(ev);
      map.set(ev.date, list);
    }
    return map;
  }, [events]);

  const eventDates = useMemo(() => new Set(eventsByDate.keys()), [eventsByDate]);

  const selectedDateStr = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    : null;

  const selectedDayEvents = selectedDateStr ? (eventsByDate.get(selectedDateStr) ?? []) : [];

  return (
    <PageShell title="Tvarkaraštis" subtitle="Planuojami darbai ir lankymosi datos jūsų valdoje." bodyStyle={{ padding: '20px 24px 28px' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* ── Left: event list ─────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-muted-ash-2)' }}>
              <Calendar size={36} strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-muted-ash)' }}>Įvykių dar nėra</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Administracija netrukus paskelbs planuojamus darbus.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {Object.entries(grouped).map(([monthKey, monthEvents]) => (
                <div key={monthKey}>
                  <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-muted-ash-2)', marginBottom: 10 }}>
                    {monthLabel(monthKey)}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {monthEvents.map(event => {
                      const meta = TYPE_META[event.type];
                      const Icon = meta.icon;
                      const upcoming = isUpcoming(event.date);
                      const isToday = event.date === today;
                      return (
                        <div key={event.id} style={{
                          display: 'flex', gap: 16, alignItems: 'flex-start',
                          padding: '14px 16px',
                          background: 'var(--color-surface-raised)',
                          border: '1px solid var(--color-ghost-border)',
                          borderRadius: 12,
                          opacity: upcoming ? 1 : 0.55,
                        }}>
                          <div style={{ width: 42, height: 42, borderRadius: 10, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={20} strokeWidth={1.5} style={{ color: meta.color }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{event.title}</p>
                              {isToday && (
                                <span style={{ fontSize: 11, fontWeight: 500, background: 'var(--color-electric-violet)', color: '#fff', padding: '2px 8px', borderRadius: 100 }}>Šiandien</span>
                              )}
                              {!upcoming && !isToday && (
                                <span style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', background: 'var(--color-surface-hover)', padding: '2px 8px', borderRadius: 100 }}>Atlikta</span>
                              )}
                            </div>
                            {event.description && (
                              <p style={{ fontSize: 13, color: 'var(--color-muted-ash)', marginBottom: 6, lineHeight: 1.5 }}>{event.description}</p>
                            )}
                            <div style={{ display: 'flex', gap: 12 }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--color-muted-ash-2)' }}>
                                <Calendar size={13} strokeWidth={1.5} /> {formatDate(event.date)}
                              </span>
                              {event.time && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--color-muted-ash-2)' }}>
                                  <Clock size={13} strokeWidth={1.5} /> {event.time}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
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
                    {selectedDayEvents.map(ev => (
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
                            {ev.type}{ev.time ? ` · ${ev.time}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
