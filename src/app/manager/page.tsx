'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/shared/Card';
import WorkerList from '@/components/work/WorkerList';
import UpdateForm from '@/components/work/UpdateForm';
import UpdateFeed from '@/components/work/UpdateFeed';
import { formatDate } from '@/lib/fmt';

export default function ManagerPage() {
  const { currentUser, workEngagements, units, estates, updatesForEngagement } = useStore();
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
      <PageHeader title="Darbo vadovas" subtitle={unitLabel} />

      <div className="darbai-grid">
        {/* Left col — project info + workers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Objektas</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{estate?.name}</p>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 100,
                  background: isActive ? '#dcfce7' : 'var(--color-cloud-canvas)',
                  color: isActive ? '#166534' : 'var(--color-muted-ash)',
                }}>
                  {isActive ? 'Aktyvus' : 'Užbaigtas'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Butas</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{unit.number}, {unit.floor} aukštas</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Pradėta</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{formatDate(engagement.createdAt)}</p>
                </div>
              </div>
            </div>
          </Card>

          <WorkerList engagementId={engagement.id} />
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
