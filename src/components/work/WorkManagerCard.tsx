'use client';

import { useState } from 'react';
import { UserCog, CheckCircle, RotateCcw } from 'lucide-react';
import { useStore } from '@/lib/store';
import Avatar from '@/components/shared/Avatar';
import Btn from '@/components/shared/Btn';

import { formatDate } from '@/lib/fmt';
import type { WorkEngagement } from '@/lib/types';

interface Props {
  unitId: string;
  engagement?: WorkEngagement;
  onCreated?: () => void;
}

export default function WorkManagerCard({ unitId, engagement, onCreated }: Props) {
  const { inviteWorkManager, completeEngagement, reactivateEngagement } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  function handleInvite() {
    if (!name.trim() || !email.trim()) return;
    inviteWorkManager(unitId, name.trim(), email.trim());
    setName(''); setEmail('');
    setInviting(false);
    onCreated?.();
  }

  const inputStyle: React.CSSProperties = {
    flex: 1, padding: '9px 12px', fontSize: 13,
    border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-input)',
    outline: 'none', fontFamily: 'inherit', fontWeight: 400, color: 'var(--foreground)',
    background: 'var(--color-input-bg)', boxSizing: 'border-box',
  };

  if (!engagement) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserCog size={15} style={{ color: 'var(--color-electric-violet)' }} />
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-midnight-ink)' }}>Pakviesti darbo vadovą</p>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-muted-ash)', maxWidth: 340 }}>
            Darbo vadovas organizuos trumpalaikius remonto darbus jūsų bute ir teiks ataskaitas.
          </p>
        </div>
        {!inviting ? (
          <Btn variant="primary" size="sm" onClick={() => setInviting(true)}>Pakviesti</Btn>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Vardas Pavardė" style={inputStyle} />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="el.pastas@mail.lt" type="email" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="primary" size="sm" disabled={!name.trim() || !email.trim()} onClick={handleInvite}>Pakviesti</Btn>
              <Btn variant="ghost" size="sm" onClick={() => { setInviting(false); onCreated?.(); }}>Atšaukti</Btn>
            </div>
          </div>
        )}
      </div>
    );
  }

  const isActive = engagement.status === 'active';

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <Avatar name={engagement.managerName} bg="rgba(118,192,61,0.20)" size={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{engagement.managerName}</p>
          <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>{engagement.managerEmail}</p>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 100, flexShrink: 0,
          background: isActive ? 'rgba(118,192,61,0.20)' : 'rgba(0,0,0,0.06)',
          color: isActive ? 'var(--color-accent)' : 'var(--color-muted-ash)',
        }}>
          {isActive ? 'Aktyvus' : 'Užbaigtas'}
        </span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>
        Pradėta: {formatDate(engagement.createdAt)}
        {engagement.completedAt && ` · Baigta: ${formatDate(engagement.completedAt)}`}
      </p>
      <div style={{ marginTop: 12 }}>
        {isActive ? (
          <Btn variant="ghost" size="sm" onClick={() => completeEngagement(engagement.id)} icon={<CheckCircle size={13} />}>
            Užbaigti darbą
          </Btn>
        ) : (
          <Btn variant="ghost" size="sm" onClick={() => reactivateEngagement(engagement.id)} icon={<RotateCcw size={13} />}>
            Atnaujinti darbą
          </Btn>
        )}
      </div>
    </>
  );
}
