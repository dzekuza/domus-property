'use client';

import { useRef, useState } from 'react';
import { Camera, Lock, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageShell from '@/components/layout/PageShell';
import Btn from '@/components/shared/Btn';
import { initials } from '@/lib/fmt';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

export default function NustatymaiPage() {
  const { effectiveUser, updateUser } = useStore();
  const user = effectiveUser();

  const [name, setName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saved, setSaved] = useState(false);

  // avatar state
  const [preview, setPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarSaved, setAvatarSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    updateUser(user.id, { fullName: name, phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setAvatarError(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Pasirinkite paveikslėlio failą (JPEG, PNG, WebP).');
      return;
    }
    if (file.size > MAX_BYTES) {
      setAvatarError('Failas per didelis. Maksimalus dydis — 4 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.onerror = () => setAvatarError('Nepavyko nuskaityti failo. Bandykite dar kartą.');
    reader.readAsDataURL(file);

    // reset input so same file can be re-selected
    e.target.value = '';
  }

  function handleAvatarSave() {
    if (!user || !preview) return;
    updateUser(user.id, { avatarUrl: preview });
    setPreview(null);
    setAvatarSaved(true);
    setTimeout(() => setAvatarSaved(false), 3000);
  }

  function handleAvatarRemove() {
    if (!user) return;
    updateUser(user.id, { avatarUrl: undefined });
    setPreview(null);
    setAvatarError(null);
  }

  const currentAvatar = user?.avatarUrl;
  const displayAvatar = preview ?? currentAvatar;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', fontSize: 14,
    background: 'var(--color-input-bg)', border: '1px solid var(--color-ghost-border)',
    borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'inherit',
    fontWeight: 500, boxSizing: 'border-box', color: 'var(--foreground)',
  };

  return (
    <PageShell title="Nustatymai" bodyStyle={{ padding: '28px' }}>

      {/* ── Avatar ── */}
      <div style={{ paddingBottom: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, marginBottom: 18, color: 'var(--color-midnight-ink)' }}>
          Profilio nuotrauka
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* Avatar preview */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt="Profilio nuotrauka"
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.15)', display: 'block' }}
              />
            ) : (
              <div style={{
                width: 80, height: 80, borderRadius: '50%', background: '#3a7015',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 700, color: '#fff',
                border: '3px solid rgba(255,255,255,0.15)',
              }}>
                {initials(user?.fullName ?? '?')}
              </div>
            )}
            {/* Camera overlay button */}
            <button
              onClick={() => fileRef.current?.click()}
              aria-label="Keisti nuotrauką"
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 26, height: 26, borderRadius: '50%',
                background: 'var(--color-accent)', border: '2px solid rgba(22,24,30,0.8)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              }}
            >
              <Camera size={13} />
            </button>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  padding: '8px 16px', borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.07)',
                  color: 'var(--foreground)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}
              >
                Pasirinkti nuotrauką
              </button>
              {preview && (
                <Btn variant="primary" size="sm" onClick={handleAvatarSave}>
                  Išsaugoti
                </Btn>
              )}
              {currentAvatar && !preview && (
                <button
                  onClick={handleAvatarRemove}
                  style={{
                    padding: '8px 12px', borderRadius: 10,
                    border: '1px solid rgba(255,80,80,0.3)',
                    background: 'rgba(255,80,80,0.08)',
                    color: '#ef4444', fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  <Trash2 size={13} /> Pašalinti
                </button>
              )}
              {preview && (
                <button
                  onClick={() => { setPreview(null); setAvatarError(null); }}
                  style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.10)', background: 'none', color: 'var(--muted-foreground)', fontSize: 13, cursor: 'pointer' }}
                >
                  Atšaukti
                </button>
              )}
            </div>

            {/* Status messages */}
            {avatarError && (
              <p style={{ fontSize: 12, color: '#ef4444', margin: 0 }}>{avatarError}</p>
            )}
            {preview && !avatarError && (
              <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', margin: 0 }}>Peržiūra — paspauskite „Išsaugoti" norint patvirtinti.</p>
            )}
            {avatarSaved && (
              <span style={{ fontSize: 13, color: 'var(--color-success)', background: 'var(--color-success-tint)', padding: '4px 12px', borderRadius: 'var(--radius-pill)', display: 'inline-block' }}>
                Nuotrauka išsaugota
              </span>
            )}
            {!displayAvatar && !avatarError && (
              <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', margin: 0 }}>JPEG, PNG arba WebP · maks. 4 MB</p>
            )}
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={handleFileChange}
        />
      </div>

      <div style={{ height: 1, background: 'var(--color-ghost-border)', marginBottom: 28 }} />

      {/* ── Personal info ── */}
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

      <div style={{ height: 1, background: 'var(--color-ghost-border)', marginBottom: 28 }} />

      {/* ── Security ── */}
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
