'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import type { Role } from '@/lib/types';
import Btn from '@/components/shared/Btn';

export default function LoginPage() {
  const router = useRouter();
  const signIn = useStore(s => s.signIn);
  const [role, setRole] = useState<Role>('owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const ok = signIn(email, password, role);
    if (!ok) {
      setError('Neteisingas el. paštas arba slaptažodis.');
      return;
    }
    router.push(role === 'admin' ? '/admin/estates' : '/portal/pagrindinis');
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'none',
    borderBottom: `2px solid ${active ? 'var(--color-electric-violet)' : 'transparent'}`,
    color: active ? 'var(--color-midnight-ink)' : 'var(--color-muted-ash-2)',
    transition: 'color .12s',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-cloud-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-electric-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={22} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: 'var(--color-midnight-ink)' }}>Domus</span>
        </div>

        <div style={{ background: 'var(--color-paper-white)', border: '1px solid var(--color-ghost-border)', borderRadius: 12, overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-ghost-border)' }}>
            <button style={tabStyle(role === 'owner')} onClick={() => setRole('owner')}>Savininkas</button>
            <button style={tabStyle(role === 'admin')} onClick={() => setRole('admin')}>Administratorius</button>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-muted-ash)', marginBottom: 6 }}>
                El. paštas
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={role === 'owner' ? 'andrius@mail.lt' : 'tomas@domus.lt'}
                required
                style={{ width: '100%', padding: '12px 16px', fontSize: 14, border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'inherit', fontWeight: 500, boxSizing: 'border-box' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-electric-violet)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-ghost-border)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-muted-ash)', marginBottom: 6 }}>
                Slaptažodis
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="demo"
                required
                style={{ width: '100%', padding: '12px 16px', fontSize: 14, border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'inherit', fontWeight: 500, boxSizing: 'border-box' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-electric-violet)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-ghost-border)'}
              />
            </div>
            {error && (
              <p style={{ fontSize: 13, color: 'var(--color-danger)', background: 'var(--color-danger-tint)', padding: '8px 12px', borderRadius: 8, margin: 0 }}>
                {error}
              </p>
            )}
            <Btn variant="primary" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              Prisijungti
            </Btn>
          </form>
        </div>

        {/* Quick sign-in */}
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-muted-ash-2)', marginBottom: 2 }}>Greitas prisijungimas</p>
          <button
            onClick={() => { const ok = signIn('andrius@mail.lt', 'demo', 'owner'); if (ok) router.push('/portal/pagrindinis'); }}
            style={{ width: '100%', padding: '11px 16px', fontSize: 13, fontWeight: 500, background: 'var(--color-paper-white)', border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span>Savininkas — Andrius Kazlauskas</span>
            <span style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', background: 'var(--color-cloud-canvas)', padding: '2px 8px', borderRadius: 100 }}>andrius@mail.lt</span>
          </button>
          <button
            onClick={() => { const ok = signIn('tomas@domus.lt', 'demo', 'admin'); if (ok) router.push('/admin/estates'); }}
            style={{ width: '100%', padding: '11px 16px', fontSize: 13, fontWeight: 500, background: 'var(--color-paper-white)', border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span>Administratorius — Tomas Domus</span>
            <span style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', background: 'var(--color-cloud-canvas)', padding: '2px 8px', borderRadius: 100 }}>tomas@domus.lt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
