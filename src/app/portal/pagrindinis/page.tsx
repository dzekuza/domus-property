'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Car, Wifi, Bell, Phone, Copy, Check } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/shared/Card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore } from '@/lib/store';

// ── Event types ──────────────────────────────────────────────────────────────
const EVENT_TYPES = {
  waste:    { label: 'Šiukšlių išvežimas',        color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' },
  lawn:     { label: 'Žolės pjovimas',             color: '#76c03d', bg: 'rgba(118,192,61,0.10)' },
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

// ── Messages ──────────────────────────────────────────────────────────────────
const MESSAGES = [
  { id: 1, from: 'Administratorius', avatar: 'A', avatarBg: 'var(--color-sidebar-bg)',
    text: 'Primename apie bendrijos susirinkimą birželio 15 d. 18:00 val.', time: 'Šiandien 09:14', unread: true },
  { id: 2, from: 'Miteda', avatar: 'M', avatarBg: 'var(--color-accent)',
    text: 'Jūsų butas įregistruotas. Raktų perdavimas planuojamas birželio 30 d.', time: 'Vakar 14:30', unread: false },
  { id: 3, from: 'Administratorius', avatar: 'A', avatarBg: 'var(--color-sidebar-bg)',
    text: 'Birželio 12 d. 9:00–14:00 bus atjungtas karštas vanduo.', time: 'Pirmad.', unread: false },
];

// ── Bulletin board ────────────────────────────────────────────────────────────
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

// ── Important info ────────────────────────────────────────────────────────────
const IMPORTANT_INFO = [
  { icon: Lock,  label: 'Laiptinės kodas',       value: '1234#',                     copy: true  },
  { icon: Car,   label: 'Vartų kodas',            value: '5678#',                     copy: true  },
  { icon: Wifi,  label: 'WiFi (bendros erdvės)',  value: 'KalnuTerasos · kalnu2024',  copy: true  },
  { icon: Bell,  label: 'Avarinis numeris',       value: '+370 600 12345',            copy: false },
  { icon: Phone, label: 'Administratorius',       value: '+370 699 87654',            copy: false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysFromNow(dateStr: string) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.floor((new Date(dateStr).getTime() - now.getTime()) / 86_400_000);
}

export default function PagrindiniasPage() {
  const router = useRouter();
  const { effectiveUser, unitOf, estateForUnit } = useStore();
  const effUser = effectiveUser();
  const unit   = effUser?.unitId ? unitOf(effUser.id) : null;
  const estate = unit ? estateForUnit(unit.id) : null;

  const [copied, setCopied] = useState<string | null>(null);

  function copy(value: string, label: string) {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div>
      <PageHeader
        title="Pagrindinis"
        subtitle={unit ? `${estate?.name ?? ''} · Butas ${unit.number}` : 'Sveiki sugrįžę'}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Bulletin Board (full width, first) ────────────────────────── */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-ghost-border)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--color-midnight-ink)', marginBottom: 2 }}>
              Skelbimų lenta
            </h3>
            <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>Aktualūs pranešimai ir skelbimai</p>
          </div>
          <div className="bulletin-grid" style={{ padding: '16px 24px 24px' }}>
            {BULLETINS.map((b) => (
              <div
                key={b.id}
                style={{
                  padding: 18,
                  background: b.priority === 'high' ? 'rgba(255,96,27,0.05)' : 'var(--color-cloud-canvas)',
                  borderRadius: 12,
                  border: `1px solid ${b.priority === 'high' ? 'rgba(255,96,27,0.2)' : 'var(--color-ghost-border)'}`,
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
                <p style={{ fontSize: 13, color: 'var(--color-muted-ash-2)', lineHeight: 1.55 }}>{b.body}</p>
                <p style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', marginTop: 12, opacity: 0.65 }}>
                  {new Date(b.date).toLocaleDateString('lt-LT')}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Main grid: Calendar (left) + side column (right) ─────────── */}
        <div className="home-grid">

          {/* Calendar / Agenda ───────────────────────────────────────── */}
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-ghost-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--color-midnight-ink)', marginBottom: 2 }}>
                  Artimiausi įvykiai
                </h3>
                <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>Namo veiklos kalendorius</p>
              </div>
            </div>

            {/* Color legend */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-ghost-border)', display: 'flex', flexWrap: 'wrap', gap: '5px 12px', width: '100%', boxSizing: 'border-box' }}>
              {(Object.entries(EVENT_TYPES) as [EventType, typeof EVENT_TYPES[EventType]][]).map(([key, { label, color }]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', whiteSpace: 'nowrap' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Events */}
            <ScrollArea style={{ height: 348 }}>
              <div style={{ padding: '4px 0 12px' }}>
                {UPCOMING_EVENTS.map((ev) => {
                  const { color, bg, label } = EVENT_TYPES[ev.type];
                  const days  = daysFromNow(ev.date);
                  const soon  = days >= 0 && days <= 7;
                  const d     = new Date(ev.date);
                  return (
                    <div
                      key={`${ev.date}-${ev.type}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 24px', borderBottom: '1px solid var(--color-ghost-border)' }}
                    >
                      {/* Date column */}
                      <div style={{ width: 48, flexShrink: 0, textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 700, lineHeight: 1, color: soon ? color : 'var(--color-midnight-ink)' }}>
                          {d.getDate()}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>
                          {d.toLocaleDateString('lt-LT', { month: 'short' })}
                        </div>
                      </div>

                      {/* Color bar */}
                      <div style={{ width: 3, height: 38, borderRadius: 2, background: color, flexShrink: 0 }} />

                      {/* Label */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-midnight-ink)' }}>{label}</p>
                        {ev.note && (
                          <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', marginTop: 1 }}>{ev.note}</p>
                        )}
                      </div>

                      {/* "Soon" badge */}
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
          </Card>

          {/* ── Right side column ──────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Messages ───────────────────────────────────────────────── */}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-ghost-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>
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
                    display: 'flex', gap: 12, padding: '12px 20px', cursor: 'pointer',
                    borderBottom: i < MESSAGES.length - 1 ? '1px solid var(--color-ghost-border)' : 'none',
                    background: msg.unread ? 'rgba(118,192,61,0.04)' : 'transparent',
                  }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: msg.avatarBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
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
            </Card>

            {/* Important Info ─────────────────────────────────────────── */}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-ghost-border)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>
                  🚨 Svarbi informacija
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
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 20px', cursor: canCopy ? 'pointer' : 'default', transition: 'background 0.12s' }}
                      onMouseEnter={e => canCopy && ((e.currentTarget as HTMLDivElement).style.background = 'var(--color-cloud-canvas)')}
                      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
                    >
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--color-cloud-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={13} style={{ color: 'var(--color-muted-ash)' }} />
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
            </Card>

          </div>{/* /right col */}
        </div>{/* /home-grid */}


      </div>
    </div>
  );
}
