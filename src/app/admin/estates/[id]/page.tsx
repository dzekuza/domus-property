'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Upload, Trash2, UserPlus } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/shared/Card';
import StatusPill from '@/components/shared/StatusPill';
import Btn from '@/components/shared/Btn';
import Avatar from '@/components/shared/Avatar';

const tabs = ['Butai', 'Nuotraukos', 'Kontaktai'] as const;
type Tab = typeof tabs[number];

export default function EstateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { estates, units, contacts, users, addEstatePhoto, removeEstatePhoto } = useStore();
  const estate = estates.find(e => e.id === id);
  const estUnits = units.filter(u => u.estateId === id);
  const estContacts = contacts.filter(c => estate?.contactIds.includes(c.id));

  const [tab, setTab] = useState<Tab>('Butai');

  if (!estate) return <div style={{ padding: 32 }}>Objektas nerastas.</div>;

  const sold = estUnits.filter(u => u.status === 'sold').length;

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '12px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'none',
    borderBottom: `2px solid ${active ? 'var(--color-electric-violet)' : 'transparent'}`,
    color: active ? 'var(--color-midnight-ink)' : 'var(--color-muted-ash-2)',
    marginBottom: -1,
  });

  return (
    <div>
      <PageHeader
        title={estate.name}
        subtitle={`${estate.address} · ${estate.unitCount} butai`}
        breadcrumbs={[{ label: 'Objektai', href: '/admin/estates' }, { label: estate.name }]}
        actions={
          <>
            <Btn variant="ghost" size="sm">Redaguoti</Btn>
            <Btn variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => {}}>Naujas butas</Btn>
          </>
        }
      />

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-ghost-border)', marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t} style={tabStyle(tab === t)} onClick={() => setTab(t)}>
            {t} {t === 'Butai' ? `(${estUnits.length})` : t === 'Nuotraukos' ? `(${estate.photoUrls.length})` : `(${estContacts.length})`}
          </button>
        ))}
      </div>

      {/* Butai */}
      {tab === 'Butai' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-scroll"><table className="domus-table">
            <thead>
              <tr>
                <th>Butas</th>
                <th>Aukštas</th>
                <th>Plotas</th>
                <th>Savininkas</th>
                <th>Būsena</th>
              </tr>
            </thead>
            <tbody>
              {estUnits.map(unit => {
                const owner = unit.ownerUserId ? users.find(u => u.id === unit.ownerUserId) : null;
                return (
                  <tr key={unit.id} onClick={() => router.push(`/admin/estates/${id}/units/${unit.id}`)}>
                    <td style={{ fontWeight: 600 }}>{unit.number}</td>
                    <td>{unit.floor}</td>
                    <td>{unit.totalAreaM2} m²</td>
                    <td>
                      {owner ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar name={owner.fullName} size={26} bg={owner.avatarBg} />
                          <span style={{ fontSize: 13 }}>{owner.fullName}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 13, color: 'var(--color-muted-ash-2)' }}>—</span>
                      )}
                    </td>
                    <td><StatusPill type="unit" value={unit.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </Card>
      )}

      {/* Nuotraukos */}
      {tab === 'Nuotraukos' && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ cursor: 'pointer' }}>
              <Btn variant="primary" size="sm" icon={<Upload size={13} />} onClick={() => document.getElementById('estate-photo-upload')?.click()}>Įkelti nuotraukas</Btn>
              <input id="estate-photo-upload" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={async e => {
                for (const f of Array.from(e.target.files ?? [])) await addEstatePhoto(id, f);
              }} />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {estate.photoUrls.map((url, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 'var(--radius-image)', overflow: 'hidden', group: '' } as React.CSSProperties}>
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <button onClick={() => removeEstatePhoto(id, url)} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {estate.photoUrls.length === 0 && <p style={{ gridColumn: '1/-1', fontSize: 14, color: 'var(--color-muted-ash-2)', padding: '32px 0', textAlign: 'center' }}>Nuotraukų dar nėra.</p>}
          </div>
        </div>
      )}

      {/* Kontaktai */}
      {tab === 'Kontaktai' && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <Btn variant="primary" size="sm" icon={<UserPlus size={13} />}>Priskirti kontaktą</Btn>
          </div>
          {estContacts.length === 0 ? (
            <Card><p style={{ fontSize: 14, color: 'var(--color-muted-ash-2)', textAlign: 'center', padding: '24px 0' }}>Kontaktų dar nepriskirta.</p></Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {estContacts.map(c => (
                <Card key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Avatar name={c.fullName} size={38} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{c.fullName}</p>
                    <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>{c.org} · {c.category}</p>
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--color-muted-ash-2)' }}>{c.phone}</span>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
