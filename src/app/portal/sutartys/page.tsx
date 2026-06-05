'use client';

import { Zap, Droplets, Flame, Trash2, AlertTriangle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { SERVICE_KINDS } from '@/lib/constants';
import PageShell from '@/components/layout/PageShell';
import StatusPill from '@/components/shared/StatusPill';
import Btn from '@/components/shared/Btn';
import type { ServiceKind } from '@/lib/types';

const serviceIcons: Record<ServiceKind, React.FC<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>> = {
  elec:  Zap,
  water: Droplets,
  heat:  Flame,
  waste: Trash2,
};

const innerCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 14,
  padding: '20px',
};

export default function SutartysPage() {
  const { effectiveUser, unitOf, setServiceContractStatus } = useStore();
  const effUser = effectiveUser();
  const unit = effUser?.unitId ? unitOf(effUser.id) : null;
  const services = unit?.services ?? [];
  const pendingCount = services.filter(s => s.status !== 'done').length;

  return (
    <PageShell title="Paslaugų sutartys" bodyStyle={{ padding: '20px 24px 24px' }}>
      {pendingCount > 0 && (
        <div style={{ background: 'rgba(255,185,0,0.10)', border: '1px solid rgba(255,185,0,0.22)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={18} strokeWidth={1.5} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
          <p style={{ flex: 1, fontSize: 14, color: 'var(--color-warning)' }}>{pendingCount} sutartys laukia jūsų veiksmų</p>
          <Btn variant="primary" size="sm">Pradėti</Btn>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {services.map(svc => {
          const meta = SERVICE_KINDS[svc.id];
          const Icon = serviceIcons[svc.id];
          return (
            <div key={svc.id} style={innerCard}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} strokeWidth={1.5} style={{ color: 'var(--color-electric-violet)' }} />
                </div>
                <StatusPill type="service" value={svc.status} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>{meta.name}</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)', marginTop: 2 }}>{meta.provider}</p>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.09)', margin: '12px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {svc.date ? (
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)' }}>Aktyvuota: {svc.date}</span>
                ) : (
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.50)' }}>Dar neaktyvuota</span>
                )}
                {svc.status === 'done'
                  ? <Btn variant="ghost" size="sm">Sutartis</Btn>
                  : <Btn
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        if (!unit) return;
                        const next = svc.status === 'pending' ? 'progress' : 'done';
                        setServiceContractStatus(unit.id, svc.id, next);
                      }}
                    >
                      {svc.status === 'progress' ? 'Patvirtinti' : 'Pasirašyti'}
                    </Btn>
                }
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
