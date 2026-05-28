'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: 14,
    border: '1px solid var(--color-ghost-border)',
    borderRadius: 10,
    outline: 'none',
    fontFamily: 'inherit',
    fontWeight: 400,
    boxSizing: 'border-box',
    background: '#fafaf8',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    color: 'var(--color-midnight-ink)',
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--background)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      {/* Background accent circle */}
      <div style={{
        position: 'fixed',
        top: -120, left: -120,
        width: 400, height: 400,
        borderRadius: '50%',
        background: 'rgba(12,61,74,0.06)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed',
        bottom: -80, right: -80,
        width: 300, height: 300,
        borderRadius: '50%',
        background: 'rgba(232,119,60,0.07)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <img src="/logo-dark.svg" alt="Domus" style={{ height: 34, width: 'auto' }} />
        </div>

        <div style={{
          background: 'var(--color-paper-white)',
          border: '1px solid var(--color-ghost-border)',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
        }}>
          {/* Role tabs */}
          <div style={{
            display: 'flex',
            background: 'var(--color-cloud-canvas)',
            padding: 4,
            margin: '16px 16px 0',
            borderRadius: 12,
            gap: 4,
          }}>
            {(['owner', 'admin'] as Role[]).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  padding: '9px 0',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  fontFamily: 'inherit',
                  borderRadius: 9,
                  transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
                  background: role === r ? 'var(--color-paper-white)' : 'transparent',
                  color: role === r ? 'var(--color-sidebar-bg)' : 'var(--color-muted-ash-2)',
                  boxShadow: role === r ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {r === 'owner' ? 'Savininkas' : 'Administratorius'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '24px 24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                style={inputStyle}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'var(--color-teal)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(103,205,205,0.15)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--color-ghost-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
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
                style={inputStyle}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'var(--color-teal)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(103,205,205,0.15)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--color-ghost-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            {error && (
              <p style={{
                fontSize: 13,
                color: 'var(--color-danger)',
                background: 'var(--color-danger-tint)',
                padding: '9px 14px',
                borderRadius: 10,
                margin: 0,
              }}>
                {error}
              </p>
            )}
            <Btn variant="primary" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: 4, padding: '13px 20px', fontSize: 15 }}>
              Prisijungti
            </Btn>
          </form>
        </div>

        {/* Quick sign-in */}
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-muted-ash-2)', marginBottom: 2, fontWeight: 400 }}>Greitas prisijungimas</p>
          {[
            { label: 'Savininkas', name: 'Andrius Kazlauskas', email: 'andrius@mail.lt', r: 'owner' as Role, redirect: '/portal/pagrindinis' },
            { label: 'Administratorius', name: 'Tomas Domus', email: 'tomas@domus.lt', r: 'admin' as Role, redirect: '/admin/estates' },
          ].map(({ label, name, email: e, r, redirect }) => (
            <button
              key={r}
              onClick={() => { const ok = signIn(e, 'demo', r); if (ok) router.push(redirect); }}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 13,
                fontWeight: 500,
                background: 'var(--color-paper-white)',
                border: '1px solid var(--color-ghost-border)',
                borderRadius: 14,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                boxShadow: 'var(--shadow-card)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-teal)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-ghost-border)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'var(--color-sidebar-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                  flexShrink: 0,
                }}>
                  {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', fontWeight: 400 }}>{label}</div>
                </div>
              </div>
              <span style={{
                fontSize: 11, color: 'var(--color-muted-ash-2)',
                background: 'var(--color-cloud-canvas)',
                padding: '3px 9px', borderRadius: 100,
                fontWeight: 400,
              }}>{e}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
