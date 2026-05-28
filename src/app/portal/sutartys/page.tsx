'use client';

import { Zap, Droplets, Flame, Trash2, AlertTriangle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { SERVICE_KINDS } from '@/lib/constants';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/shared/Card';
import StatusPill from '@/components/shared/StatusPill';
import Btn from '@/components/shared/Btn';
import type { ServiceKind } from '@/lib/types';

const serviceIcons: Record<ServiceKind, React.FC<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>> = {
  elec:  Zap,
  water: Droplets,
  heat:  Flame,
  waste: Trash2,
};

export default function SutartysPage() {
  const { effectiveUser, unitOf } = useStore();
  const effUser = effectiveUser();
  const unit = effUser?.unitId ? unitOf(effUser.id) : null;
  const services = unit?.services ?? [];
  const pendingCount = services.filter(s => s.status !== 'done').length;

  return (
    <div>
      <PageHeader title="Paslaugų sutartys" />

      {pendingCount > 0 && (
        <div style={{ background: 'var(--color-warning-tint)', border: '1px solid #f0d080', borderRadius: 8, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={18} strokeWidth={1.5} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
          <p style={{ flex: 1, fontSize: 14, color: 'var(--color-warning)' }}>{pendingCount} sutartys laukia jūsų veiksmų</p>
          <Btn variant="primary" size="sm">Pradėti</Btn>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {services.map(svc => {
          const meta = SERVICE_KINDS[svc.id];
          const Icon = serviceIcons[svc.id];
          return (
            <Card key={svc.id}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--color-cloud-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} strokeWidth={1.5} style={{ color: 'var(--color-electric-violet)' }} />
                </div>
                <StatusPill type="service" value={svc.status} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{meta.name}</p>
              <p style={{ fontSize: 13, color: 'var(--color-muted-ash-2)', marginTop: 2 }}>{meta.provider}</p>
              <div style={{ height: 1, background: 'var(--color-ghost-border)', margin: '12px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {svc.date ? (
                  <span style={{ fontSize: 13, color: 'var(--color-muted-ash-2)' }}>Aktyvuota: {svc.date}</span>
                ) : (
                  <span style={{ fontSize: 13, color: 'var(--color-muted-ash-2)' }}>Dar neaktyvuota</span>
                )}
                {svc.status === 'done'
                  ? <Btn variant="ghost" size="sm">Sutartis</Btn>
                  : <Btn variant="primary" size="sm">Pasirašyti</Btn>
                }
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
