'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bug, Download } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/shared/Card';
import StatusPill from '@/components/shared/StatusPill';
import Btn from '@/components/shared/Btn';
import EmptyState from '@/components/shared/EmptyState';
import { formatDate } from '@/lib/fmt';
import type { DefectStatus } from '@/lib/types';

const STATUS_OPTIONS: { label: string; value: DefectStatus | 'all' }[] = [
  { label: 'Visos', value: 'all' },
  { label: 'Atviri', value: 'open' },
  { label: 'Vykdomi', value: 'progress' },
  { label: 'Išspręsti', value: 'resolved' },
  { label: 'Atmesti', value: 'rejected' },
];

export default function AdminDefectsPage() {
  const router = useRouter();
  const { defects, users, units, estates } = useStore();
  const [estateFilter, setEstateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<DefectStatus | 'all'>('all');

  const uniqueEstates = [...new Set(defects.map(d => d.estateId))].map(id => estates.find(e => e.id === id)).filter(Boolean);

  const filtered = defects.filter(d => {
    if (estateFilter !== 'all' && d.estateId !== estateFilter) return false;
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    return true;
  });

  const selectStyle: React.CSSProperties = { padding: '8px 12px', fontSize: 13, border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-pill)', outline: 'none', fontFamily: 'inherit', fontWeight: 500, background: 'var(--color-paper-white)' };

  return (
    <div>
      <PageHeader
        title="Defektai"
        subtitle={`${defects.length} pranešimų iš viso`}
        actions={<Btn variant="ghost" icon={<Download size={14} />}>Eksportuoti</Btn>}
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={estateFilter} onChange={e => setEstateFilter(e.target.value)} style={selectStyle}>
          <option value="all">Visi objektai</option>
          {uniqueEstates.map(e => e && <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as DefectStatus | 'all')} style={selectStyle}>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          {STATUS_OPTIONS.slice(1).map(o => (
            <span key={o.value} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: 'var(--color-cloud-canvas)', color: 'var(--color-muted-ash)' }}>
              {o.label}: {defects.filter(d => d.status === o.value).length}
            </span>
          ))}
        </div>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <EmptyState icon={Bug} title="Defektų nerasta" subtitle="Pakeiskite filtrus arba laukite naujų pranešimų." />
        ) : (
          <table className="domus-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pranešimas</th>
                <th>Objektas / Butas</th>
                <th>Savininkas</th>
                <th>Data</th>
                <th>Būsena</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(defect => {
                const unit = units.find(u => u.id === defect.unitId);
                const estate = estates.find(e => e.id === defect.estateId);
                const owner = users.find(u => u.id === defect.ownerUserId);
                return (
                  <tr key={defect.id} onClick={() => router.push(`/admin/defects/${defect.id}`)}>
                    <td style={{ fontWeight: 600, color: 'var(--color-electric-violet)' }}>{defect.id}</td>
                    <td>
                      <p style={{ fontWeight: 600 }}>{defect.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>{defect.room}</p>
                    </td>
                    <td style={{ color: 'var(--color-muted-ash-2)' }}>
                      <p>{estate?.name}</p>
                      <p style={{ fontSize: 12 }}>Butas {unit?.number}</p>
                    </td>
                    <td style={{ fontSize: 13 }}>{owner?.fullName}</td>
                    <td style={{ fontSize: 13, color: 'var(--color-muted-ash-2)' }}>{formatDate(defect.createdAt)}</td>
                    <td><StatusPill type="defect" value={defect.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
