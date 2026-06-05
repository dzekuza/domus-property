'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageShell from '@/components/layout/PageShell';
import Btn from '@/components/shared/Btn';

export default function NustatymaiPage() {
  const { effectiveUser, updateUser } = useStore();
  const user = effectiveUser();

  const [name, setName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    updateUser(user.id, { fullName: name, phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', fontSize: 14, background: 'var(--color-surface-raised)', border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'inherit', fontWeight: 500, boxSizing: 'border-box', color: 'var(--foreground)' };

  return (
    <PageShell title="Nustatymai" bodyStyle={{ padding: '28px' }}>
      {/* Personal info */}
      <div style={{ paddingBottom: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, marginBottom: 18, color: 'var(--color-midnight-ink)' }}>Asmeninė informacija</h2>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6, color: 'var(--color-muted-ash)' }}>Vardas ir pavardė</label>
              <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6, color: 'var(--color-muted-ash)' }}>Telefonas</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6, color: 'var(--color-muted-ash)' }}>El. paštas</label>
            <div style={{ position: 'relative' }}>
              <input value={user?.email ?? ''} disabled style={{ ...inputStyle, background: 'rgba(0,0,0,0.02)', color: 'var(--color-muted-ash-2)', paddingRight: 110 }} />
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-muted-ash-2)' }}>
                <Lock size={12} /> Nekeičiamas
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', marginTop: 4 }}>El. pašto pakeitimui susisiekite su Domus pagalba.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Btn variant="primary" type="submit">Išsaugoti pakeitimus</Btn>
            {saved && (
              <span style={{ fontSize: 13, color: 'var(--color-success)', background: 'var(--color-success-tint)', padding: '5px 12px', borderRadius: 'var(--radius-pill)' }}>
                Išsaugota
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--color-ghost-border)', marginBottom: 28 }} />

      {/* Security */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, marginBottom: 4, color: 'var(--color-midnight-ink)' }}>Saugumas</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { label: 'Slaptažodis', meta: 'Paskutinį kartą keistas prieš 30 d.' },
            { label: 'Dviejų veiksnių autentifikacija', meta: 'Neaktyvuota' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i === 0 ? '1px solid var(--color-ghost-border)' : 'none' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-midnight-ink)' }}>{row.label}</p>
                <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', marginTop: 2 }}>{row.meta}</p>
              </div>
              <Btn variant="ghost" size="sm">Keisti</Btn>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
