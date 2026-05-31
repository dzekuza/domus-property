'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/shared/Card';
import WorkerList from '@/components/work/WorkerList';
import UpdateForm from '@/components/work/UpdateForm';
import UpdateFeed from '@/components/work/UpdateFeed';
import ExpenseTable from '@/components/work/ExpenseTable';
import { formatDate } from '@/lib/fmt';

export default function ManagerPage() {
  const router = useRouter();
  const { currentUser, workEngagements, units, estates, updatesForEngagement, signOut } = useStore();
  const user = currentUser();
  const engagement = user?.engagementId
    ? workEngagements.find(e => e.id === user.engagementId)
    : null;
  const unit = engagement ? units.find(u => u.id === engagement.unitId) : null;
  const estate = unit ? estates.find(e => e.id === unit.estateId) : null;

  const [groupMode, setGroupMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allUpdates = engagement ? updatesForEngagement(engagement.id) : [];
  const selectedUpdates = allUpdates.filter(u => selectedIds.has(u.id));

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function cancelGroup() {
    setGroupMode(false);
    setSelectedIds(new Set());
  }

  if (!engagement || !unit) {
    return (
      <div>
        <PageHeader title="Darbo vadovo portalas" subtitle="Jums dar nepriskirtas projektas." />
        <Card><p style={{ fontSize: 13, color: 'var(--color-muted-ash-2)' }}>Kreipkitės į savininką dėl priskyrimo.</p></Card>
      </div>
    );
  }

  const unitLabel = `${estate?.name ?? ''} – Butas ${unit.number}`;
  const isActive = engagement.status === 'active';

  return (
    <div>
      <PageHeader
        title="Darbo vadovas"
        subtitle={unitLabel}
        statusBadge={{ label: isActive ? 'Aktyvus' : 'Užbaigtas', active: isActive }}
        meta={[
          { label: 'Butas', value: `${unit.number}, ${unit.floor} aukštas` },
          { label: 'Pradėta', value: formatDate(engagement.createdAt) },
        ]}
        actions={
          <button
            onClick={() => { signOut(); router.push('/login'); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '7px 14px', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <LogOut size={14} />
            Atsijungti
          </button>
        }
      />

      <div className="darbai-grid">
        {/* Left col — workers + expenses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24, alignSelf: 'flex-start' }}>
          <WorkerList engagementId={engagement.id} />
          <ExpenseTable engagementId={engagement.id} />
        </div>

        {/* Right col — post update + feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {user && (
            <UpdateForm
              engagementId={engagement.id}
              authorId={user.id}
              authorName={user.fullName}
              authorRole="work_manager"
              showOwnerToggle
              groupedUpdates={selectedUpdates}
              onRemoveGrouped={id => toggleSelect(id)}
              onGroupSent={cancelGroup}
            />
          )}
          <UpdateFeed
            engagementId={engagement.id}
            unitLabel={unitLabel}
            readOnly
            allowGrouping
            groupMode={groupMode}
            selectedIds={selectedIds}
            onToggleGroupMode={() => { setGroupMode(true); setSelectedIds(new Set()); }}
            onToggleSelect={toggleSelect}
            onCancelGroup={cancelGroup}
          />
        </div>
      </div>
    </div>
  );
}
