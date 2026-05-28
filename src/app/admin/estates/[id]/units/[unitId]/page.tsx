'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Trash2, Eye, Zap, Droplets, Flame, Trash2 as Trash2Icon, FileText, Download } from 'lucide-react';
import { useStore } from '@/lib/store';
import { PURCHASE_STEPS, SERVICE_KINDS } from '@/lib/constants';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/shared/Card';
import Btn from '@/components/shared/Btn';
import { Switch } from '@/components/ui/switch';
import { formatBytes, formatDate } from '@/lib/fmt';
import type { PurchaseStepId, ServiceKind } from '@/lib/types';

const tabs = ['Techninė', 'Dokumentai', 'Nuotraukos', 'Paslaugos', 'Savininko eiga'] as const;
type Tab = typeof tabs[number];

const serviceIcons: Record<ServiceKind, React.FC<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>> = {
  elec:  Zap, water: Droplets, heat: Flame, waste: Trash2Icon,
};

export default function UnitEditorPage({ params }: { params: Promise<{ id: string; unitId: string }> }) {
  const { id, unitId } = use(params);
  const router = useRouter();
  const { estates, units, users, updateUnit, toggleStepVisibility, setServiceContractStatus, uploadDocument, deleteDocument, addUnitPhoto, removeUnitPhoto, impersonate } = useStore();
  const unit = units.find(u => u.id === unitId);
  const estate = estates.find(e => e.id === id);
  const owner = unit?.ownerUserId ? users.find(u => u.id === unit.ownerUserId) : null;

  const [tab, setTab] = useState<Tab>('Techninė');
  const [form, setForm] = useState({ number: unit?.number ?? '', floor: String(unit?.floor ?? ''), block: unit?.block ?? '', totalAreaM2: String(unit?.totalAreaM2 ?? ''), usableAreaM2: String(unit?.usableAreaM2 ?? ''), rooms: String(unit?.rooms ?? ''), notes: unit?.notes ?? '' });

  if (!unit || !estate) return <div style={{ padding: 32 }}>Butas nerastas.</div>;

  function handleImpersonate() {
    if (!owner) return;
    impersonate(owner.id);
    router.push('/portal/pagrindinis');
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '12px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'none',
    borderBottom: `2px solid ${active ? 'var(--color-electric-violet)' : 'transparent'}`,
    color: active ? 'var(--color-midnight-ink)' : 'var(--color-muted-ash-2)',
    marginBottom: -1,
  });

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', fontSize: 14, border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'inherit', fontWeight: 500, boxSizing: 'border-box' };

  return (
    <div>
      <PageHeader
        title={`Butas ${unit.number}`}
        subtitle={`${unit.floor} aukštas · ${unit.totalAreaM2} m²${owner ? ` · Savininkas: ${owner.fullName}` : ''}`}
        breadcrumbs={[
          { label: 'Objektai', href: '/admin/estates' },
          { label: estate.name, href: `/admin/estates/${id}` },
          { label: `Butas ${unit.number}` },
        ]}
        actions={
          <>
            <span style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', padding: '5px 10px', background: 'var(--color-cloud-canvas)', borderRadius: 'var(--radius-pill)' }}>Automatiškai išsaugota</span>
            {owner && <Btn variant="primary" size="sm" icon={<Eye size={13} />} onClick={handleImpersonate}>Peržiūrėti kaip savininką</Btn>}
          </>
        }
      />

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-ghost-border)', marginBottom: 20, gap: 0 }}>
        {tabs.map(t => <button key={t} style={tabStyle(tab === t)} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      {/* Techninė */}
      {tab === 'Techninė' && (
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            {[
              { label: 'Buto Nr.', key: 'number' },
              { label: 'Aukštas', key: 'floor', type: 'number' },
              { label: 'Korpusas', key: 'block' },
              { label: 'Bendras plotas (m²)', key: 'totalAreaM2', type: 'number' },
              { label: 'Naudingas plotas (m²)', key: 'usableAreaM2', type: 'number' },
              { label: 'Kambariai', key: 'rooms', type: 'number' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>{field.label}</label>
                <input
                  type={field.type ?? 'text'}
                  value={(form as Record<string, string>)[field.key]}
                  onChange={e => {
                    const updated = { ...form, [field.key]: e.target.value };
                    setForm(updated);
                    updateUnit(unitId, { [field.key]: field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value });
                  }}
                  style={inputStyle}
                />
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Pastabos</label>
              <textarea value={form.notes} rows={3} onChange={e => { setForm(f => ({ ...f, notes: e.target.value })); updateUnit(unitId, { notes: e.target.value }); }} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </div>
        </Card>
      )}

      {/* Dokumentai */}
      {tab === 'Dokumentai' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PURCHASE_STEPS.map(step => {
            const docs = unit.documents[step.id] ?? [];
            return (
              <Card key={step.id}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: docs.length > 0 ? 12 : 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{step.id}. {step.title}</p>
                  <label>
                    <Btn variant="ghost" size="sm" icon={<Upload size={13} />} onClick={() => document.getElementById(`doc-upload-${step.id}`)?.click()}>Įkelti dokumentą</Btn>
                    <input id={`doc-upload-${step.id}`} type="file" style={{ display: 'none' }} onChange={async e => { if (e.target.files?.[0]) await uploadDocument(unitId, step.id, e.target.files[0]); }} />
                  </label>
                </div>
                {docs.map(doc => (
                  <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--color-cloud-canvas)', borderRadius: 6, marginTop: 6 }}>
                    <FileText size={14} style={{ color: 'var(--color-muted-ash-2)' }} />
                    <span style={{ flex: 1, fontSize: 13 }}>{doc.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>{formatBytes(doc.sizeBytes)}</span>
                    <span style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>{formatDate(doc.uploadedAt)}</span>
                    <a href={doc.url} download={doc.name}><Btn variant="ghost" size="sm" icon={<Download size={12} />}>Atsisiųsti</Btn></a>
                    <button onClick={() => deleteDocument(unitId, step.id, doc.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)', display: 'flex', padding: 4 }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </Card>
            );
          })}
        </div>
      )}

      {/* Nuotraukos */}
      {tab === 'Nuotraukos' && (
        <Card>
          <div style={{ marginBottom: 14 }}>
            <Btn variant="primary" size="sm" icon={<Upload size={13} />} onClick={() => document.getElementById('unit-photo-upload')?.click()}>Įkelti nuotraukas</Btn>
            <input id="unit-photo-upload" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={async e => { for (const f of Array.from(e.target.files ?? [])) await addUnitPhoto(unitId, f); }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {unit.photoUrls.map((url, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 'var(--radius-image)', overflow: 'hidden' }}>
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => removeUnitPhoto(unitId, url)} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {unit.photoUrls.length === 0 && <p style={{ gridColumn: '1/-1', fontSize: 14, color: 'var(--color-muted-ash-2)', textAlign: 'center', padding: '24px 0' }}>Nuotraukų dar nėra.</p>}
          </div>
        </Card>
      )}

      {/* Paslaugos */}
      {tab === 'Paslaugos' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {unit.services.map(svc => {
            const meta = SERVICE_KINDS[svc.id];
            const Icon = serviceIcons[svc.id];
            return (
              <Card key={svc.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--color-cloud-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} strokeWidth={1.5} style={{ color: 'var(--color-electric-violet)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{meta.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>{meta.provider}</p>
                </div>
                <Switch checked={svc.status === 'done'} onCheckedChange={checked => setServiceContractStatus(unitId, svc.id, checked ? 'done' : 'pending')} />
              </Card>
            );
          })}
        </div>
      )}

      {/* Savininko eiga */}
      {tab === 'Savininko eiga' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Žingsniai (matomi savininkui)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {PURCHASE_STEPS.map((step, i) => (
                <div key={step.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < PURCHASE_STEPS.length - 1 ? '1px solid var(--color-ghost-border)' : 'none' }}>
                  <p style={{ fontSize: 13, flex: 1, paddingRight: 12 }}>{step.id}. {step.title}</p>
                  <Switch checked={unit.visibleSteps[step.id]} onCheckedChange={checked => toggleStepVisibility(unitId, step.id as PurchaseStepId, checked)} />
                </div>
              ))}
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Pakviesti savininką</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="el.pastas@mail.lt" defaultValue={owner?.email ?? ''} style={{ flex: 1, padding: '10px 14px', fontSize: 13, border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'inherit', fontWeight: 500 }} />
                <Btn variant="primary" size="sm">Siųsti kvietimą</Btn>
              </div>
            </Card>
            {owner && (
              <Card>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Savininko informacija</h3>
                <p style={{ fontSize: 13, color: 'var(--color-muted-ash-2)' }}>Savininkas: <strong style={{ color: 'var(--color-midnight-ink)' }}>{owner.fullName}</strong></p>
                <p style={{ fontSize: 13, color: 'var(--color-muted-ash-2)', marginTop: 4 }}>{owner.email}</p>
                <p style={{ fontSize: 13, color: 'var(--color-muted-ash-2)', marginTop: 4 }}>{owner.phone}</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
