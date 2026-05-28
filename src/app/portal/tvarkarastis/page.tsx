'use client';

import { Calendar, Clock, Scissors, Sparkles, Wrench, Eye, HelpCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/shared/Card';
import type { ScheduleEventType } from '@/lib/types';
import { formatDate } from '@/lib/fmt';

const TYPE_META: Record<ScheduleEventType, { icon: React.FC<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>, color: string, bg: string }> = {
  'Žolės pjovimas': { icon: Scissors, color: 'var(--color-success)', bg: 'var(--color-success-tint)' },
  'Valymas':        { icon: Sparkles, color: 'var(--color-electric-violet)', bg: 'var(--color-violet-tint)' },
  'Remontas':       { icon: Wrench,   color: 'var(--color-warning)', bg: 'var(--color-warning-tint)' },
  'Apžiūra':        { icon: Eye,      color: 'var(--color-muted-ash)', bg: 'var(--color-cloud-canvas)' },
  'Kita':           { icon: HelpCircle, color: 'var(--color-muted-ash-2)', bg: 'var(--color-cloud-canvas)' },
};

function isUpcoming(date: string) {
  return new Date(date) >= new Date(new Date().toDateString());
}

import type { ScheduleEvent } from '@/lib/types';

function groupByMonth(events: ScheduleEvent[]) {
  const groups: Record<string, typeof events> = {};
  for (const e of events) {
    const key = e.date.slice(0, 7); // "YYYY-MM"
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
    <div>
      <PageHeader title="Tvarkaraštis" subtitle="Planuojami darbai ir lankymosi datos jūsų valdoje." />

      {events.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-muted-ash-2)' }}>
            <Calendar size={36} strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>Įvykių dar nėra</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Administracija netrukus paskelbs planuojamus darbus.</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {Object.entries(grouped).map(([monthKey, monthEvents]) => (
            <div key={monthKey}>
              <p style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-muted-ash-2)', marginBottom: 10 }}>
                {monthLabel(monthKey)}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {monthEvents.map(event => {
                  const meta = TYPE_META[event.type];
                  const Icon = meta.icon;
                  const upcoming = isUpcoming(event.date);
                  const isToday = event.date === today;
                  return (
                    <Card key={event.id} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', opacity: upcoming ? 1 : 0.6 }}>
                      {/* Icon */}
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <Icon size={20} strokeWidth={1.5} style={{ color: meta.color }} />
                      </div>
                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{event.title}</p>
                          {isToday && (
                            <span style={{ fontSize: 11, fontWeight: 500, background: 'var(--color-electric-violet)', color: '#fff', padding: '2px 8px', borderRadius: 100 }}>Šiandien</span>
                          )}
                          {!upcoming && !isToday && (
                            <span style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', background: 'var(--color-cloud-canvas)', padding: '2px 8px', borderRadius: 100 }}>Atlikta</span>
                          )}
                        </div>
                        {event.description && (
                          <p style={{ fontSize: 13, color: 'var(--color-muted-ash-2)', marginBottom: 6, lineHeight: 1.5 }}>{event.description}</p>
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
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
