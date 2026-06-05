'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bug, Download } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageShell from '@/components/layout/PageShell';
import StatusPill from '@/components/shared/StatusPill';
import Btn from '@/components/shared/Btn';
import EmptyState from '@/components/shared/EmptyState';
import { formatDate } from '@/lib/fmt';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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


  return (
    <PageShell
        title="Defektai"
        subtitle={`${defects.length} pranešimų iš viso`}
        actions={<Btn variant="ghost" icon={<Download size={14} />}>Eksportuoti</Btn>}
      >
        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, padding: '16px 20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Select value={estateFilter} onValueChange={v => { if (v) setEstateFilter(v); }}>
          <SelectTrigger className="rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Visi objektai</SelectItem>
              {uniqueEstates.map(e => e && <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as DefectStatus | 'all')}>
          <SelectTrigger className="rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          {STATUS_OPTIONS.slice(1).map(o => (
            <span key={o.value} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: 'rgba(0,0,0,0.05)', color: 'var(--color-muted-ash)', border: '1px solid var(--color-ghost-border)' }}>
              {o.label}: {defects.filter(d => d.status === o.value).length}
            </span>
          ))}
        </div>
      </div>

        <div style={{ height: 1, background: 'var(--color-ghost-border)' }} />
        {filtered.length === 0 ? (
          <EmptyState icon={Bug} title="Defektų nerasta" subtitle="Pakeiskite filtrus arba laukite naujų pranešimų." />
        ) : (
          <div className="table-scroll"><table className="domus-table">
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
          </table></div>
        )}
  </PageShell>
  );
}
