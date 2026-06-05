'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import PageShell from '@/components/layout/PageShell';
import WorkManagerCard from '@/components/work/WorkManagerCard';
import UpdateFeed from '@/components/work/UpdateFeed';
import WorkerList from '@/components/work/WorkerList';
import ExpenseTable from '@/components/work/ExpenseTable';
import EmptyState from '@/components/shared/EmptyState';
import Btn from '@/components/shared/Btn';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HardHat, Plus } from 'lucide-react';
import type { Unit, Estate } from '@/lib/types';

export default function AdminDarbaiPage() {
  const { estates, units, workEngagements, engagementsForUnit } = useStore();
  const [addDialogUnit, setAddDialogUnit] = useState<Unit | null>(null);

  const estateUnit = (unit: Unit): Estate | undefined =>
    estates.find(e => e.id === unit.estateId);

  // Only show units that have at least one engagement, or we always show all units
  const allUnits = units;

  return (
    <>
      <PageShell
        title="Remonto darbai"
        subtitle="Visi aktyvūs darbai visuose butuose"
        bodyStyle={{ padding: '20px 24px 32px' }}
      >
        {allUnits.length === 0 ? (
          <EmptyState icon={HardHat} title="Nėra butų" subtitle="Pirmiausia sukurkite objektą ir pridėkite butų." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {allUnits.map(unit => {
              const estate = estateUnit(unit);
              const engagements = engagementsForUnit(unit.id);
              const unitLabel = `${estate?.name ?? ''} – Butas ${unit.number}`;

              return (
                <div key={unit.id}>
                  {/* Unit header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>
                        {estate?.name ?? '—'}
                      </p>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600, color: 'var(--color-midnight-ink)', margin: 0 }}>
                        Butas {unit.number}
                      </h3>
                    </div>
                    <Btn variant="ghost" size="sm" icon={<Plus size={13} />} onClick={() => setAddDialogUnit(unit)}>
                      Nauja grupė
                    </Btn>
                  </div>

                  {engagements.length === 0 ? (
                    <div style={{ padding: '24px 0' }}>
                      <EmptyState
                        icon={HardHat}
                        title="Darbų dar nėra"
                        subtitle={'Paspauskite „Nauja grupė" norėdami pradėti.'}
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                      {engagements.map((eng, i) => (
                        <div key={eng.id}>
                          {engagements.length > 1 && (
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-muted-ash-2)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
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
                  )}

                  <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginTop: 32 }} />
                </div>
              );
            })}
          </div>
        )}
      </PageShell>

      <Dialog open={!!addDialogUnit} onOpenChange={v => !v && setAddDialogUnit(null)}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-display)' }}>
              Nauja remonto grupė — Butas {addDialogUnit?.number}
            </DialogTitle>
          </DialogHeader>
          {addDialogUnit && (
            <WorkManagerCard
              unitId={addDialogUnit.id}
              onCreated={() => setAddDialogUnit(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
