'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import PageHeader from '@/components/layout/PageHeader';
import WorkManagerCard from '@/components/work/WorkManagerCard';
import UpdateFeed from '@/components/work/UpdateFeed';
import WorkerList from '@/components/work/WorkerList';
import ExpenseTable from '@/components/work/ExpenseTable';
import Card from '@/components/shared/Card';
import EmptyState from '@/components/shared/EmptyState';
import Btn from '@/components/shared/Btn';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HardHat, Plus } from 'lucide-react';

export default function DarbaiPage() {
  const { effectiveUser, unitOf, estateForUnit, engagementsForUnit } = useStore();
  const user = effectiveUser();
  const unit = user?.unitId ? unitOf(user.id) : null;
  const estate = unit ? estateForUnit(unit.id) : null;
  const engagements = unit ? engagementsForUnit(unit.id) : [];

  const [groupDialogOpen, setGroupDialogOpen] = useState(false);

  if (!unit) {
    return (
      <div>
        <PageHeader title="Remonto darbai" subtitle="Jūsų butas dar nepriskirtas." />
      </div>
    );
  }

  const unitLabel = `${estate?.name ?? ''} – Butas ${unit.number}`;

  return (
    <div>
      <PageHeader
        title="Remonto darbai"
        subtitle="Trumpalaikiai darbai jūsų bute — vadovai ir darbininkai."
        actions={
          engagements.length > 0
            ? <Btn variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setGroupDialogOpen(true)}>
                Nauja grupė
              </Btn>
            : undefined
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {engagements.length === 0 && (
          <Card>
            <EmptyState
              icon={HardHat}
              title="Darbų dar nėra"
              subtitle="Pakvieskite darbo vadovą, kad pradėtumėte."
            />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <Btn variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setGroupDialogOpen(true)}>
                Pridėti grupę
              </Btn>
            </div>
          </Card>
        )}

        {engagements.map((eng, i) => (
          <div key={eng.id}>
            {engagements.length > 1 && (
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-muted-ash-2)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                Grupė {i + 1}
              </p>
            )}
            <div className="darbai-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <WorkManagerCard unitId={unit.id} engagement={eng} />
                <WorkerList engagementId={eng.id} />
                <ExpenseTable engagementId={eng.id} />
              </div>
              <UpdateFeed engagementId={eng.id} unitLabel={unitLabel} />
            </div>
          </div>
        ))}

      </div>

      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-display)' }}>Nauja remonto grupė</DialogTitle>
          </DialogHeader>
          <WorkManagerCard
            unitId={unit.id}
            onCreated={() => setGroupDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
