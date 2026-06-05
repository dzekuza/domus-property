'use client';

import { useState } from 'react';
import { UserPlus, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-input)',
    outline: 'none', fontFamily: 'inherit', fontWeight: 400, color: 'rgba(255,255,255,0.9)',
    background: 'rgba(255,255,255,0.07)', boxSizing: 'border-box',
  };

  return (
    <Card>
      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-midnight-ink)', marginBottom: 14 }}>Darbininkai ({workers.length})</p>

      <div style={{ overflow: 'hidden', maxHeight: adding ? 400 : 0, transition: 'max-height 0.35s cubic-bezier(0.22, 1, 0.36, 1), margin-bottom 0.35s cubic-bezier(0.22, 1, 0.36, 1)', marginBottom: adding ? 14 : 0 }}>
        <div className="t-panel-slide" data-open={adding ? 'true' : 'false'} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 12 }}>
          {/* Row 1 — name + email */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Vardas Pavardė" style={inputStyle} />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="el.pastas@mail.lt" type="email" style={inputStyle} />
          </div>

          {/* Row 2 — specialty + password */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Select value={specialty} onValueChange={v => setSpecialty(v as WorkerSpecialty)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>

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
      </div>

      {workers.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--color-muted-ash-2)', fontStyle: 'italic' }}>Darbininkų dar nėra. Pridėkite pirmąjį.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {workers.map(worker => (
            <div key={worker.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.06)',
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

      <Btn variant="ghost" size="sm" icon={<UserPlus size={13} />} onClick={() => setAdding(s => !s)} style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
        Pridėti darbininką
      </Btn>
    </Card>
  );
}
