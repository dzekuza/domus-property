'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Upload, Trash2, UserPlus, X, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageShell from '@/components/layout/PageShell';
import Card from '@/components/shared/Card';
import StatusPill from '@/components/shared/StatusPill';
import Btn from '@/components/shared/Btn';
import Avatar from '@/components/shared/Avatar';

const tabs = ['Butai', 'Gyventojai', 'Nuotraukos', 'Kontaktai'] as const;
type Tab = typeof tabs[number];

export default function EstateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { estates, units, contacts, users, addEstatePhoto, removeEstatePhoto, updateUnit } = useStore();
  const estate = estates.find(e => e.id === id);
  const estUnits = units.filter(u => u.estateId === id);
  const estContacts = contacts.filter(c => estate?.contactIds.includes(c.id));
  const unitIds = new Set(estUnits.map(u => u.id));
  const estResidents = users.filter(u => u.unitId && unitIds.has(u.unitId));

  const [tab, setTab] = useState<Tab>('Butai');
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  if (!estate) return <div style={{ padding: 32 }}>Objektas nerastas.</div>;

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: 'var(--radius-pill)', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
    background: active ? 'var(--color-accent)' : 'rgba(255,255,255,0.07)',
    color: active ? '#fff' : 'var(--color-muted-ash)',
    border: active ? '1px solid transparent' : '1px solid var(--color-ghost-border)',
    transition: 'background 0.15s, color 0.15s',
  });

  // ── Bulk helpers ──────────────────────────────────────────────
  function toggleUnit(unitId: string) {
    setSelectedUnits(prev => {
      const next = new Set(prev);
      next.has(unitId) ? next.delete(unitId) : next.add(unitId);
      return next;
    });
  }
  function toggleAllUnits(checked: boolean) {
    setSelectedUnits(checked ? new Set(estUnits.map(u => u.id)) : new Set());
  }

  function toggleUser(userId: string) {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  }
  function toggleAllUsers(checked: boolean) {
    setSelectedUsers(checked ? new Set(estResidents.map(u => u.id)) : new Set());
  }

  const allUnitsChecked = estUnits.length > 0 && selectedUnits.size === estUnits.length;
  const allUsersChecked = estResidents.length > 0 && selectedUsers.size === estResidents.length;

  return (
    <PageShell
      title={estate.name}
      subtitle={`${estate.address} · ${estate.unitCount} butai`}
      breadcrumbs={[{ label: 'Objektai', href: '/admin/estates' }, { label: estate.name }]}
      actions={
        <>
          <Btn variant="ghost" size="sm">Redaguoti</Btn>
          <Btn variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => {}}>Naujas butas</Btn>
        </>
      }
    >
      {/* Pills nav */}
      <div className="hide-scrollbar" style={{ display: 'flex', gap: 6, padding: '16px 28px 8px', overflowX: 'auto' }}>
        {tabs.map(t => {
          const count = t === 'Butai' ? estUnits.length
            : t === 'Gyventojai' ? estResidents.length
            : t === 'Nuotraukos' ? estate.photoUrls.length
            : estContacts.length;
          return (
            <button key={t} style={pillStyle(tab === t)} onClick={() => setTab(t)}>
              {t} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Butai ── */}
      {tab === 'Butai' && (
        <div style={{ position: 'relative' }}>
          {/* Bulk action bar */}
          {selectedUnits.size > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 20px', margin: '0 0 2px',
              background: 'rgba(118,192,61,0.1)', borderBottom: '1px solid rgba(118,192,61,0.25)',
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-accent)', flex: 1 }}>
                Pasirinkta: {selectedUnits.size}
              </span>
              <Btn variant="secondary" size="sm" onClick={() => setSelectedUnits(new Set())}>
                Atšaukti
              </Btn>
              <Btn
                variant="secondary"
                size="sm"
                onClick={() => {
                  selectedUnits.forEach(uid => updateUnit(uid, { status: 'sold' } as any));
                  setSelectedUnits(new Set());
                }}
              >
                Pažymėti kaip parduotus
              </Btn>
              <Btn
                variant="secondary"
                size="sm"
                style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                icon={<Trash2 size={13} />}
                onClick={() => setSelectedUnits(new Set())}
              >
                Ištrinti
              </Btn>
            </div>
          )}

          <div className="table-scroll"><table className="domus-table">
            <thead>
              <tr>
                <th style={{ width: 40, paddingRight: 0 }}>
                  <input
                    type="checkbox"
                    checked={allUnitsChecked}
                    onChange={e => toggleAllUnits(e.target.checked)}
                    style={{ cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                  />
                </th>
                <th>Butas</th>
                <th>Aukštas</th>
                <th>Plotas</th>
                <th>Savininkas</th>
                <th>Būsena</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {estUnits.map(unit => {
                const owner = unit.ownerUserId ? users.find(u => u.id === unit.ownerUserId) : null;
                const checked = selectedUnits.has(unit.id);
                return (
                  <tr
                    key={unit.id}
                    style={{ background: checked ? 'rgba(118,192,61,0.07)' : undefined }}
                    onClick={() => router.push(`/admin/estates/${id}/units/${unit.id}`)}
                  >
                    <td style={{ paddingRight: 0 }} onClick={e => { e.stopPropagation(); toggleUnit(unit.id); }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleUnit(unit.id)}
                        style={{ cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                      />
                    </td>
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
                    <td onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => router.push(`/admin/estates/${id}/units/${unit.id}`)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted-ash-2)', padding: 4, display: 'flex', borderRadius: 6 }}
                      >
                        <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        </div>
      )}

      {/* ── Gyventojai ── */}
      {tab === 'Gyventojai' && (
        <div style={{ position: 'relative' }}>
          {selectedUsers.size > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 20px', margin: '0 0 2px',
              background: 'rgba(118,192,61,0.1)', borderBottom: '1px solid rgba(118,192,61,0.25)',
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-accent)', flex: 1 }}>
                Pasirinkta: {selectedUsers.size}
              </span>
              <Btn variant="secondary" size="sm" icon={<X size={13} />} onClick={() => setSelectedUsers(new Set())}>
                Atšaukti
              </Btn>
              <Btn
                variant="secondary"
                size="sm"
                style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                icon={<Trash2 size={13} />}
                onClick={() => setSelectedUsers(new Set())}
              >
                Ištrinti
              </Btn>
            </div>
          )}

          {estResidents.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--color-muted-ash-2)', textAlign: 'center', padding: '32px 0' }}>
              Gyventojų dar nėra.
            </p>
          ) : (
            <div className="table-scroll"><table className="domus-table">
              <thead>
                <tr>
                  <th style={{ width: 40, paddingRight: 0 }}>
                    <input
                      type="checkbox"
                      checked={allUsersChecked}
                      onChange={e => toggleAllUsers(e.target.checked)}
                      style={{ cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                    />
                  </th>
                  <th>Gyventojas</th>
                  <th>Rolė</th>
                  <th>Butas</th>
                  <th>El. paštas</th>
                  <th>Telefonas</th>
                </tr>
              </thead>
              <tbody>
                {estResidents.map(user => {
                  const unit = units.find(u => u.id === user.unitId);
                  const checked = selectedUsers.has(user.id);
                  return (
                    <tr
                      key={user.id}
                      style={{ background: checked ? 'rgba(118,192,61,0.07)' : undefined, cursor: 'default' }}
                    >
                      <td style={{ paddingRight: 0 }} onClick={e => { e.stopPropagation(); toggleUser(user.id); }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleUser(user.id)}
                          style={{ cursor: 'pointer', accentColor: 'var(--color-accent)' }}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={user.fullName} size={30} bg={user.avatarBg} avatarUrl={user.avatarUrl} />
                          <div>
                            <p style={{ fontWeight: 600 }}>{user.fullName}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--color-muted-ash-2)', textTransform: 'capitalize' }}>
                        {user.role === 'owner' ? 'Savininkas' : user.role}
                      </td>
                      <td style={{ fontSize: 13 }}>{unit?.number ?? '—'}</td>
                      <td style={{ fontSize: 13, color: 'var(--color-midnight-ink)' }}>{user.email}</td>
                      <td style={{ fontSize: 13, color: 'var(--color-midnight-ink)' }}>{user.phone ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
          )}
        </div>
      )}

      {/* ── Nuotraukos ── */}
      {tab === 'Nuotraukos' && (
        <div style={{ padding: '0 20px 20px' }}>
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
              <div key={i} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: 'var(--radius-image)', overflow: 'hidden' }}>
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

      {/* ── Kontaktai ── */}
      {tab === 'Kontaktai' && (
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ marginBottom: 14 }}>
            <Btn variant="primary" size="sm" icon={<UserPlus size={13} />}>Priskirti kontaktą</Btn>
          </div>
          {estContacts.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--color-muted-ash-2)', textAlign: 'center', padding: '24px 0' }}>Kontaktų dar nepriskirta.</p>
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
    </PageShell>
  );
}
