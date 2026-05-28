'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Building2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/shared/Card';
import StatusPill from '@/components/shared/StatusPill';
import Btn from '@/components/shared/Btn';
import EmptyState from '@/components/shared/EmptyState';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function EstatesPage() {
  const router = useRouter();
  const { estates, units, createEstate } = useStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', unitCount: '' });

  const filtered = estates.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.address.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createEstate({
      name: form.name,
      address: form.address,
      status: 'Pardavimas',
      coverPhotoUrl: `https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80`,
      unitCount: parseInt(form.unitCount) || 0,
      contactIds: [],
      photoUrls: [],
    });
    setForm({ name: '', address: '', unitCount: '' });
    setShowModal(false);
  }

  return (
    <div>
      <PageHeader
        title="Objektai"
        actions={
          <>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted-ash-2)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ieškoti objektų…" style={{ paddingLeft: 34, paddingRight: 14, paddingTop: 9, paddingBottom: 9, fontSize: 13, border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-pill)', outline: 'none', fontFamily: 'inherit', fontWeight: 500, width: 220 }} />
            </div>
            <Btn variant="primary" icon={<Plus size={15} />} onClick={() => setShowModal(true)}>Naujas objektas</Btn>
          </>
        }
      />

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <EmptyState icon={Building2} title="Objektų nerasta" subtitle="Pakeiskite paieškos užklausą arba sukurkite naują objektą." action={{ label: 'Naujas objektas', onClick: () => setShowModal(true) }} />
        ) : (
          <div className="table-scroll"><table className="domus-table">
            <thead>
              <tr>
                <th>Objektas</th>
                <th>Adresas</th>
                <th>Butai</th>
                <th>Parduota</th>
                <th>Būsena</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(estate => {
                const estUnits = units.filter(u => u.estateId === estate.id);
                const sold = estUnits.filter(u => u.status === 'sold').length;
                return (
                  <tr key={estate.id} onClick={() => router.push(`/admin/estates/${estate.id}`)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {estate.coverPhotoUrl && (
                          <img src={estate.coverPhotoUrl} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                        )}
                        <div>
                          <p style={{ fontWeight: 600 }}>{estate.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>{estate.id}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-muted-ash-2)' }}>{estate.address}</td>
                    <td>{estate.unitCount}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13 }}>{sold}/{estUnits.length || estate.unitCount}</span>
                        <div style={{ width: 60, height: 4, background: 'var(--color-cloud-canvas)', borderRadius: 100, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${estUnits.length ? (sold / estUnits.length) * 100 : 0}%`, background: 'var(--color-electric-violet)' }} />
                        </div>
                      </div>
                    </td>
                    <td><StatusPill type="estate" value={estate.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        )}
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Naujas objektas</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
            {[
              { label: 'Pavadinimas', key: 'name', placeholder: 'pvz. Kalnų Terasos' },
              { label: 'Adresas', key: 'address', placeholder: 'pvz. Vilniaus g. 24, Vilnius' },
              { label: 'Butų skaičius', key: 'unitCount', placeholder: '48', type: 'number' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>{field.label}</label>
                <input
                  type={field.type ?? 'text'}
                  value={(form as Record<string, string>)[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  required
                  style={{ width: '100%', padding: '10px 14px', fontSize: 14, border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'inherit', fontWeight: 500, boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <Btn variant="primary" type="submit" style={{ justifyContent: 'center', marginTop: 4 }}>Sukurti objektą</Btn>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
