'use client';

import { Calendar, Clock, Scissors, Sparkles, Wrench, Eye, HelpCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageShell from '@/components/layout/PageShell';
import type { ScheduleEventType, ScheduleEvent } from '@/lib/types';
import { formatDate } from '@/lib/fmt';

const TYPE_META: Record<ScheduleEventType, { icon: React.FC<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>, color: string, bg: string }> = {
  'Žolės pjovimas': { icon: Scissors,   color: 'var(--color-success)',         bg: 'rgba(118,192,61,0.12)' },
  'Valymas':        { icon: Sparkles,   color: 'var(--color-electric-violet)', bg: 'rgba(118,192,61,0.12)' },
  'Remontas':       { icon: Wrench,     color: 'var(--color-warning)',         bg: 'rgba(184,110,0,0.12)' },
  'Apžiūra':        { icon: Eye,        color: 'var(--color-muted-ash)',       bg: 'var(--color-surface-hover)' },
  'Kita':           { icon: HelpCircle, color: 'var(--color-muted-ash-2)',    bg: 'var(--color-surface-hover)' },
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
  const { effectiveUser, unitOf, estateForUnit, scheduleEvents } = useStore();
  const effUser = effectiveUser();
  const unit = effUser?.unitId ? unitOf(effUser.id) : null;
  const estateId = unit?.estateId;
  const events = scheduleEvents
    .filter(e => e.estateId === estateId)
    .sort((a, b) => a.date.localeCompare(b.date));

  const grouped = groupByMonth(events);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <PageShell title="Tvarkaraštis" subtitle="Planuojami darbai ir lankymosi datos jūsų valdoje." bodyStyle={{ padding: '20px 24px 28px' }}>
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
                      background: 'rgba(0,0,0,0.03)',
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
    </PageShell>
  );
}
