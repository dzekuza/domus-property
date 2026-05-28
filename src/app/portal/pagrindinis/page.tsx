'use client';

import { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, FileText, Download, Upload, Check } from 'lucide-react';
import { useStore } from '@/lib/store';
import { PURCHASE_STEPS } from '@/lib/constants';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/shared/Card';
import StatusPill from '@/components/shared/StatusPill';
import Btn from '@/components/shared/Btn';
import { formatBytes, formatDate } from '@/lib/fmt';
import type { PurchaseStepId } from '@/lib/types';

export default function PagrindiniasPage() {
  const { effectiveUser, unitOf, estateForUnit, uploadDocument } = useStore();
  const effUser = effectiveUser();
  const unit = effUser?.unitId ? unitOf(effUser.id) : null;
  const estate = unit ? estateForUnit(unit.id) : null;

  const visibleSteps = PURCHASE_STEPS.filter(s => unit?.visibleSteps[s.id]);
  const doneCount = visibleSteps.filter(s => unit?.stepStatuses[s.id] === 'done').length;

  const defaultOpen = visibleSteps.find(s => unit?.stepStatuses[s.id] === 'progress')?.id
    ?? visibleSteps[0]?.id
    ?? null;
  const [openStep, setOpenStep] = useState<PurchaseStepId | null>(defaultOpen as PurchaseStepId | null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(stepId: PurchaseStepId, file: File) {
    setUploading(true);
    try {
      await uploadDocument(unit!.id, stepId, file);
      setToast('Failas įkeltas');
      setTimeout(() => setToast(''), 3000);
    } catch (err: unknown) {
      setToast(err instanceof Error ? err.message : 'Klaida įkeliant failą');
      setTimeout(() => setToast(''), 4000);
    }
    setUploading(false);
  }

  if (!unit) {
    return (
      <div>
        <PageHeader title="Pirkimo eiga" subtitle="Jūsų butas dar nepriskirtas." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Pirkimo eiga" subtitle="Visi jūsų pirkimo proceso žingsniai vienoje vietoje." />

      {/* Hero card */}
      <Card style={{ marginBottom: 20 }}>
        <div className="hero-card-inner">
        {estate?.coverPhotoUrl && (
          <img src={estate.coverPhotoUrl} alt={estate.name} className="hero-card-img" />
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{estate?.name}</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--color-midnight-ink)', marginBottom: 8 }}>Butas {unit.number}</h2>
            {unit.keyHandoverDate && (
              <p style={{ fontSize: 13, color: 'var(--color-muted-ash-2)' }}>Planuojamas raktų perdavimas: <strong>{formatDate(unit.keyHandoverDate)}</strong></p>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--color-muted-ash-2)' }}>Pirkimo eiga</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{doneCount} / {visibleSteps.length}</span>
            </div>
            <div style={{ height: 6, background: 'var(--color-cloud-canvas)', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${visibleSteps.length ? (doneCount / visibleSteps.length) * 100 : 0}%`, background: 'var(--color-electric-violet)', borderRadius: 100, transition: 'width .3s' }} />
            </div>
          </div>
        </div>
        </div>
      </Card>

      {/* Steps accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visibleSteps.map((step, idx) => {
          const status = unit.stepStatuses[step.id];
          const docs = unit.documents[step.id] ?? [];
          const isOpen = openStep === step.id;

          return (
            <Card key={step.id} style={{ padding: 0, overflow: 'hidden' }}>
              <button
                onClick={() => setOpenStep(isOpen ? null : step.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {/* Step number / check */}
                <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: status === 'done' ? 'var(--color-success)' : 'var(--color-cloud-canvas)', color: status === 'done' ? '#fff' : 'var(--color-muted-ash-2)', fontWeight: 600, fontSize: 13 }}>
                  {status === 'done' ? <Check size={16} strokeWidth={2.5} /> : idx + 1}
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{step.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', marginTop: 2 }}>{step.subtitle}</p>
                </div>
                <StatusPill type="step" value={status} />
                {isOpen ? <ChevronUp size={16} style={{ color: 'var(--color-muted-ash-2)', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: 'var(--color-muted-ash-2)', flexShrink: 0 }} />}
              </button>

              {isOpen && (
                <div className="fade-in" style={{ borderTop: '1px solid var(--color-ghost-border)', padding: '16px 20px' }}>
                  {docs.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--color-muted-ash-2)', fontStyle: 'italic' }}>Dokumentai bus paskelbti artimiausiu metu.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {docs.map(doc => (
                        <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--color-cloud-canvas)', borderRadius: 8 }}>
                          <FileText size={16} strokeWidth={1.5} style={{ color: 'var(--color-muted-ash-2)', flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 13 }}>{doc.name}</span>
                          <span style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>{formatBytes(doc.sizeBytes)}</span>
                          <a href={doc.url} download={doc.name}>
                            <Btn variant="ghost" size="sm" icon={<Download size={13} />}>Atsisiųsti</Btn>
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {step.allowOwnerUpload && (
                    <div style={{ marginTop: 16, border: '2px dashed var(--color-ghost-border)', borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <Upload size={24} strokeWidth={1.5} style={{ color: 'var(--color-muted-ash-2)' }} />
                      <p style={{ fontSize: 13, color: 'var(--color-muted-ash-2)', textAlign: 'center' }}>Įkelkite pasirašytą priėmimo-perdavimo aktą (PDF)</p>
                      <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleUpload(step.id, e.target.files[0])} />
                      <Btn variant="primary" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()} icon={<Upload size={13} />}>
                        {uploading ? 'Įkeliama…' : 'Įkelti'}
                      </Btn>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--color-midnight-ink)', color: '#fff', padding: '12px 20px', borderRadius: 'var(--radius-pill)', fontSize: 14, zIndex: 9999 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
