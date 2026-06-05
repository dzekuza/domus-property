'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Car, Wifi, Bell, Phone, Copy, Check, Building2 } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore } from '@/lib/store';

const EVENT_TYPES = {
  waste:    { label: 'Šiukšlių išvežimas',        color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' },
  lawn:     { label: 'Žolės pjovimas',             color: 'var(--color-accent)', bg: 'var(--color-accent-tint)' },
  elevator: { label: 'Lifto priežiūra',            color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  water:    { label: 'Vandens atjungimas',          color: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
  meeting:  { label: 'Bendruomenės susirinkimas',  color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)' },
  cleaning: { label: 'Teritorijos valymas',        color: '#06b6d4', bg: 'rgba(6,182,212,0.10)'  },
  roof:     { label: 'Stogo darbai',               color: '#ff601b', bg: 'rgba(255,96,27,0.10)'  },
} as const;
type EventType = keyof typeof EVENT_TYPES;

const UPCOMING_EVENTS: Array<{ date: string; type: EventType; note?: string }> = [
  { date: '2026-06-03', type: 'waste' },
  { date: '2026-06-05', type: 'lawn' },
  { date: '2026-06-10', type: 'elevator' },
  { date: '2026-06-12', type: 'water',    note: '9:00 – 14:00' },
  { date: '2026-06-15', type: 'meeting',  note: '18:00, Laiptinė A' },
  { date: '2026-06-18', type: 'cleaning' },
  { date: '2026-06-22', type: 'roof' },
  { date: '2026-07-01', type: 'waste' },
  { date: '2026-07-08', type: 'lawn' },
];

const MESSAGES = [
  { id: 1, from: 'Administratorius', avatar: 'A', avatarBg: 'rgba(0,0,0,0.08)',
    text: 'Primename apie bendrijos susirinkimą birželio 15 d. 18:00 val.', time: 'Šiandien 09:14', unread: true },
  { id: 2, from: 'Miteda', avatar: 'M', avatarBg: 'var(--color-accent)',
    text: 'Jūsų butas įregistruotas. Raktų perdavimas planuojamas birželio 30 d.', time: 'Vakar 14:30', unread: false },
  { id: 3, from: 'Administratorius', avatar: 'A', avatarBg: 'rgba(0,0,0,0.08)',
    text: 'Birželio 12 d. 9:00–14:00 bus atjungtas karštas vanduo.', time: 'Pirmad.', unread: false },
];

const BULLETINS = [
  { id: 1, title: 'Vandens atjungimas birželio 12 d.',
    body: 'Nuo 9:00 iki 14:00 bus atjungtas karštas vanduo techninės priežiūros tikslais.',
    date: '2026-06-01', priority: 'high' as const },
  { id: 2, title: 'Stovėjimo aikštelės taisyklės',
    body: 'Kiekvienas savininkas turi vieną žymėtą vietą. Prašome laikytis tvarkos.',
    date: '2026-05-28', priority: 'normal' as const },
  { id: 3, title: 'Penktadienio laiptinės valymas',
    body: 'Kiekvieną penktadienį atliekamas laiptinės valymas 8:00–10:00.',
    date: '2026-05-25', priority: 'normal' as const },
];

const IMPORTANT_INFO = [
  { icon: Lock,  label: 'Laiptinės kodas',       value: '1234#',                     copy: true  },
  { icon: Car,   label: 'Vartų kodas',            value: '5678#',                     copy: true  },
  { icon: Wifi,  label: 'WiFi (bendros erdvės)',  value: 'KalnuTerasos · kalnu2024',  copy: true  },
  { icon: Bell,  label: 'Avarinis numeris',       value: '+370 600 12345',            copy: false },
  { icon: Phone, label: 'Administratorius',       value: '+370 699 87654',            copy: false },
];

function daysFromNow(dateStr: string) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.floor((new Date(dateStr).getTime() - now.getTime()) / 86_400_000);
}

const innerSection: React.CSSProperties = {
  background: 'var(--color-surface-raised)',
  border: '1px solid var(--color-ghost-border)',
  borderRadius: 14,
  overflow: 'hidden',
};

export default function PagrindiniasPage() {
  const router = useRouter();
  const { effectiveUser, unitOf, estateForUnit, progressUpdates, estates } = useStore();
  const effUser = effectiveUser();
  const unit   = effUser?.unitId ? unitOf(effUser.id) : null;
  const estate = unit ? estateForUnit(unit.id) : null;
  const myUpdates = progressUpdates.filter(p => p.notifiedUserIds.includes(effUser?.id ?? ''));

  const [copied, setCopied] = useState<string | null>(null);

  function copy(value: string, label: string) {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <PageShell
      title="Pagrindinis"
      subtitle={unit ? `${estate?.name ?? ''} · Butas ${unit.number}` : 'Sveiki sugrįžę'}
      bodyStyle={{ padding: '16px 24px 24px' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Bulletin Board */}
        <div style={innerSection}>
          <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid var(--color-ghost-border)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--color-midnight-ink)', marginBottom: 2 }}>
              Skelbimų lenta
            </h3>
            <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>Aktualūs pranešimai ir skelbimai</p>
          </div>
          <div className="bulletin-grid" style={{ padding: '14px 16px 16px' }}>
            {BULLETINS.map((b) => (
              <div
                key={b.id}
                style={{
                  padding: 16,
                  background: b.priority === 'high' ? 'rgba(255,96,27,0.10)' : 'rgba(0,0,0,0.03)',
                  borderRadius: 10,
                  border: `1px solid ${b.priority === 'high' ? 'rgba(255,96,27,0.28)' : 'var(--color-ghost-border)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-midnight-ink)', lineHeight: 1.35 }}>{b.title}</p>
                  {b.priority === 'high' && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-danger)', background: 'var(--color-danger-tint)', padding: '2px 8px', borderRadius: 100, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Svarbu
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-muted-ash)', lineHeight: 1.55 }}>{b.body}</p>
                <p style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', marginTop: 10 }}>
                  {new Date(b.date).toLocaleDateString('lt-LT')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Darbu eiga updates */}
        {myUpdates.length > 0 && (
          <div style={innerSection}>
            <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid var(--color-ghost-border)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--color-midnight-ink)', marginBottom: 2 }}>
                Darbu eiga
              </h3>
              <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>Naujausi statybos ir remonto atnaujinimai</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {myUpdates.map((upd, i) => {
                const updEstate = upd.estateId ? estates.find(e => e.id === upd.estateId) : null;
                return (
                  <div key={upd.id} style={{ padding: '14px 18px', borderBottom: i < myUpdates.length - 1 ? '1px solid var(--color-ghost-border)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--color-accent-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Building2 size={13} style={{ color: 'var(--color-accent)' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{upd.title}</span>
                          {updEstate && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-accent)', background: 'var(--color-accent-tint)', padding: '1px 7px', borderRadius: 100 }}>
                              {updEstate.name}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', marginTop: 1 }}>
                          {new Date(upd.createdAt).toLocaleDateString('lt-LT', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--color-muted-ash)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{upd.body}</p>
                    {upd.imageUrls && upd.imageUrls.length > 0 && (
                      <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                        {upd.imageUrls.map((url, j) => (
                          <div key={j} style={{ aspectRatio: '4/3', borderRadius: 8, overflow: 'hidden' }}>
                            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main grid: Calendar (left) + side column (right) */}
        <div className="home-grid">

          {/* Calendar / Agenda */}
          <div style={innerSection}>
            <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid var(--color-ghost-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--color-midnight-ink)', marginBottom: 2 }}>
                  Artimiausi įvykiai
                </h3>
                <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>Namo veiklos kalendorius</p>
              </div>
            </div>
            <ScrollArea style={{ height: 348 }}>
              <div style={{ padding: '4px 0 12px' }}>
                {UPCOMING_EVENTS.map((ev) => {
                  const { color, bg, label } = EVENT_TYPES[ev.type];
                  const days = daysFromNow(ev.date);
                  const soon = days >= 0 && days <= 7;
                  const d    = new Date(ev.date);
                  return (
                    <div
                      key={`${ev.date}-${ev.type}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 18px', borderBottom: '1px solid var(--color-ghost-border)' }}
                    >
                      <div style={{ width: 48, flexShrink: 0, textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 700, lineHeight: 1, color: soon ? color : 'var(--color-midnight-ink)' }}>
                          {d.getDate()}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>
                          {d.toLocaleDateString('lt-LT', { month: 'short' })}
                        </div>
                      </div>
                      <div style={{ width: 3, height: 38, borderRadius: 2, background: color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-midnight-ink)' }}>{label}</p>
                        {ev.note && (
                          <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', marginTop: 1 }}>{ev.note}</p>
                        )}
                      </div>
                      {soon && (
                        <span style={{ fontSize: 11, fontWeight: 600, color, background: bg, padding: '2px 9px', borderRadius: 100, flexShrink: 0, whiteSpace: 'nowrap' }}>
                          {days === 0 ? 'Šiandien' : `${days}d.`}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Right side column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Messages */}
            <div style={innerSection}>
              <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--color-ghost-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>
                  Gautos žinutės
                </h3>
                {MESSAGES.some(m => m.unread) && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: 'var(--color-danger)', padding: '1px 7px', borderRadius: 100 }}>
                    {MESSAGES.filter(m => m.unread).length}
                  </span>
                )}
              </div>
              {MESSAGES.map((msg, i) => (
                <div
                  key={msg.id}
                  onClick={() => router.push('/portal/bendruomene')}
                  style={{
                    display: 'flex', gap: 12, padding: '12px 18px', cursor: 'pointer',
                    borderBottom: i < MESSAGES.length - 1 ? '1px solid var(--color-ghost-border)' : 'none',
                    background: msg.unread ? 'rgba(118,192,61,0.05)' : 'transparent',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = msg.unread ? 'rgba(118,192,61,0.05)' : 'transparent')}
                >
                  <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: msg.avatarBg, color: 'var(--foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                    {msg.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2, gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: msg.unread ? 700 : 500, color: 'var(--color-midnight-ink)' }}>{msg.from}</span>
                      <span style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', flexShrink: 0 }}>{msg.time}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.text}
                    </p>
                  </div>
                  {msg.unread && (
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-accent)', flexShrink: 0, alignSelf: 'center' }} />
                  )}
                </div>
              ))}
            </div>

            {/* Important Info */}
            <div style={innerSection}>
              <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--color-ghost-border)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>
                  Svarbi informacija
                </h3>
              </div>
              <div style={{ padding: '6px 0' }}>
                {IMPORTANT_INFO.map(({ icon: Icon, label, value, copy: canCopy }) => {
                  const isCopied = copied === label;
                  return (
                    <div
                      key={label}
                      onClick={canCopy ? () => copy(value, label) : undefined}
                      title={canCopy ? 'Spustelėkite norėdami nukopijuoti' : undefined}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 18px', cursor: canCopy ? 'pointer' : 'default', transition: 'background 0.12s' }}
                      onMouseEnter={e => canCopy && ((e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface-raised)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
                    >
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={13} style={{ color: 'var(--color-muted-ash-2)' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', marginBottom: 1 }}>{label}</p>
                        <p style={{
                          fontSize: 13, fontWeight: 600,
                          color: isCopied ? 'var(--color-accent)' : 'var(--color-midnight-ink)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          transition: 'color 0.15s',
                        }}>
                          {isCopied ? '✓ Nukopijuota' : value}
                        </p>
                      </div>
                      {canCopy && !isCopied && (
                        <Copy size={13} style={{ color: 'var(--color-muted-ash-2)', flexShrink: 0 }} />
                      )}
                      {isCopied && (
                        <Check size={13} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>
    </PageShell>
  );
}
