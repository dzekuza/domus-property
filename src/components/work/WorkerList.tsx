'use client';

import { useState } from 'react';
import { UserPlus, Trash2, ChevronDown, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useStore } from '@/lib/store';
import Avatar from '@/components/shared/Avatar';
import Btn from '@/components/shared/Btn';
import Card from '@/components/shared/Card';
import type { WorkerSpecialty } from '@/lib/types';

function generatePassword() {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
  const out = new Array(12);
  const buf = new Uint32Array(12);
  crypto.getRandomValues(buf);
  const limit = Math.floor(0xFFFFFFFF / chars.length) * chars.length;
  for (let i = 0; i < 12; i++) {
    let v = buf[i];
    while (v >= limit) { const b = new Uint32Array(1); crypto.getRandomValues(b); v = b[0]; }
    out[i] = chars[v % chars.length];
  }
  return out.join('');
}

const SPECIALTIES: WorkerSpecialty[] = ['Dažytojas', 'Elektrikas', 'Santechnikas', 'Stogdengys', 'Kita'];

interface Props {
  engagementId: string;
}

export default function WorkerList({ engagementId }: Props) {
  const { workersForEngagement, inviteWorker, removeWorker } = useStore();
  const workers = workersForEngagement(engagementId);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState<WorkerSpecialty>('Dažytojas');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adding, setAdding] = useState(false);

  function handleAdd() {
    if (!name.trim() || !email.trim()) return;
    inviteWorker(engagementId, name.trim(), email.trim(), specialty);
    setName(''); setEmail(''); setPassword('');
    setAdding(false);
  }

  const inputStyle: React.CSSProperties = {
    flex: 1, padding: '9px 12px', fontSize: 13,
    border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-input)',
    outline: 'none', fontFamily: 'inherit', fontWeight: 400,
    background: 'var(--color-paper-white)', boxSizing: 'border-box',
  };

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-midnight-ink)' }}>Darbininkai ({workers.length})</p>
        <Btn variant="ghost" size="sm" icon={<UserPlus size={13} />} onClick={() => setAdding(s => !s)}>
          Pridėti
        </Btn>
      </div>

      {adding && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 14px', background: 'var(--color-cloud-canvas)', borderRadius: 12, marginBottom: 14 }}>
          {/* Row 1 — name + email */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Vardas Pavardė" style={inputStyle} />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="el.pastas@mail.lt" type="email" style={inputStyle} />
          </div>

          {/* Row 2 — specialty + password */}
          <div style={{ display: 'flex', gap: 8 }}>
            {/* Specialty select with custom arrow */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <select
                value={specialty}
                onChange={e => setSpecialty(e.target.value as WorkerSpecialty)}
                style={{
                  ...inputStyle,
                  flex: 'none',
                  width: 'auto',
                  paddingRight: 32,
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  cursor: 'pointer',
                }}
              >
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={13} style={{
                position: 'absolute', right: 10, top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: 'var(--color-muted-ash-2)',
              }} />
            </div>

            {/* Password with eye + generate */}
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                placeholder="Slaptažodis"
                style={{ ...inputStyle, paddingRight: 68 }}
              />
              <div style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 2 }}>
                <button
                  type="button"
                  title="Generuoti slaptažodį"
                  onClick={() => { setPassword(generatePassword()); setShowPassword(true); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--color-muted-ash-2)', borderRadius: 6 }}
                >
                  <RefreshCw size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--color-muted-ash-2)', borderRadius: 6 }}
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
          </div>

          {/* Row 3 — actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="primary" size="sm" disabled={!name.trim() || !email.trim()} onClick={handleAdd}>
              Pridėti
            </Btn>
            <Btn variant="ghost" size="sm" onClick={() => setAdding(false)}>
              Atšaukti
            </Btn>
          </div>
        </div>
      )}

      {workers.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--color-muted-ash-2)', fontStyle: 'italic' }}>Darbininkų dar nėra. Pridėkite pirmąjį.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {workers.map(worker => (
            <div key={worker.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              background: 'var(--color-cloud-canvas)',
              borderRadius: 12,
            }}>
              <Avatar name={worker.name} bg="#fdf3df" size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{worker.name}</p>
                <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>{worker.email}</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: '#fdf3df', color: '#854d0e', flexShrink: 0 }}>
                {worker.specialty}
              </span>
              <button
                onClick={() => removeWorker(worker.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--color-muted-ash-2)', flexShrink: 0 }}
                title="Pašalinti"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
