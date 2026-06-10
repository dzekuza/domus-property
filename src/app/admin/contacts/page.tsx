'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Phone, Mail, X, Building2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { CONTACT_CATEGORIES } from '@/lib/constants';
import PageShell from '@/components/layout/PageShell';
import Avatar from '@/components/shared/Avatar';
import Btn from '@/components/shared/Btn';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Contact, ContactCategory } from '@/lib/types';

export default function AdminContactsPage() {
  const { contacts, upsertContact, deleteContact } = useStore();
  const [filter, setFilter] = useState<ContactCategory | 'Visi'>('Visi');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: '', org: '', phone: '', email: '', category: 'Kita' as ContactCategory });
  const [selected, setSelected] = useState<Contact | null>(null);

  const filtered = filter === 'Visi' ? contacts : contacts.filter(c => c.category === filter);

  function openCreate() {
    setEditingId(null);
    setForm({ fullName: '', org: '', phone: '', email: '', category: 'Kita' });
    setShowModal(true);
  }

  function openEdit(contact: Contact) {
    setEditingId(contact.id);
    setForm({ fullName: contact.fullName, org: contact.org, phone: contact.phone, email: contact.email, category: contact.category });
    setSelected(null);
    setShowModal(true);
  }

  function handleDelete(id: string) {
    deleteContact(id);
    if (selected?.id === id) setSelected(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    upsertContact({ ...(editingId ? { id: editingId } : {}), ...form, documents: [] });
    setForm({ fullName: '', org: '', phone: '', email: '', category: 'Kita' });
    setEditingId(null);
    setShowModal(false);
  }

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: 'var(--radius-pill)', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
    background: active ? 'var(--color-midnight-ink)' : 'rgba(0,0,0,0.05)',
    color: active ? '#fff' : 'var(--color-muted-ash)',
    border: active ? '1px solid transparent' : '1px solid var(--color-ghost-border)',
    transition: 'background 0.15s, color 0.15s',
  });

  return (
    <>
      <PageShell
        title="Kontaktai"
        subtitle={`${contacts.length} specialistų`}
        actions={<Btn variant="primary" icon={<Plus size={15} />} onClick={openCreate}>Naujas kontaktas</Btn>}
      >
        {/* Category pills */}
        <div className="hide-scrollbar" style={{ display: 'flex', gap: 6, padding: '16px 20px 4px', overflowX: 'auto' }}>
          <button style={pillStyle(filter === 'Visi')} onClick={() => setFilter('Visi')}>Visi ({contacts.length})</button>
          {CONTACT_CATEGORIES.map(cat => (
            <button key={cat} style={pillStyle(filter === cat)} onClick={() => setFilter(cat)}>
              {cat} ({contacts.filter(c => c.category === cat).length})
            </button>
          ))}
        </div>

        <div className="table-scroll"><table className="domus-table">
          <thead>
            <tr>
              <th>Specialistas</th>
              <th>Kategorija</th>
              <th>Telefonas</th>
              <th>El. paštas</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(contact => (
              <tr
                key={contact.id}
                onClick={() => setSelected(contact)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar name={contact.fullName} size={34} />
                    <div>
                      <p style={{ fontWeight: 600 }}>{contact.fullName}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-muted-ash-2)' }}>{contact.org}</p>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: 13, color: 'var(--color-muted-ash-2)' }}>{contact.category}</td>
                <td>
                  <a href={`tel:${contact.phone}`} onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-midnight-ink)', textDecoration: 'none' }}>
                    <Phone size={13} strokeWidth={1.5} style={{ color: 'var(--color-muted-ash-2)' }} />
                    {contact.phone}
                  </a>
                </td>
                <td>
                  <a href={`mailto:${contact.email}`} onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-midnight-ink)', textDecoration: 'none' }}>
                    <Mail size={13} strokeWidth={1.5} style={{ color: 'var(--color-muted-ash-2)' }} />
                    {contact.email}
                  </a>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(contact)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-muted-ash-2)', padding: 6, display: 'flex', borderRadius: 6 }}><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(contact.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 6, display: 'flex', borderRadius: 6 }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </PageShell>

      {/* Detail drawer */}
      <Sheet open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}>
        <SheetContent
          side="right"
          showCloseButton={false}
          style={{
            width: 380,
            padding: 0,
            background: 'var(--glass-sidebar-bg)',
            backdropFilter: 'var(--glass-sidebar-blur)',
            WebkitBackdropFilter: 'var(--glass-sidebar-blur)',
            border: 'none',
            borderLeft: '1px solid var(--color-ghost-border)',
          }}
        >
          {selected && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Header */}
              <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-muted-ash)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Kontaktas
                </span>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted-ash)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--color-midnight-ink)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted-ash)')}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Identity */}
              <div style={{ padding: '20px 24px 24px', borderBottom: '1px solid var(--color-ghost-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <Avatar name={selected.fullName} size={56} />
                  <div>
                    <p style={{ fontSize: 19, fontWeight: 700, color: 'var(--color-midnight-ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                      {selected.fullName}
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {selected.category}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(255,255,255,0.07)', borderRadius: 10, border: '1px solid var(--color-ghost-border)' }}>
                  <Building2 size={14} strokeWidth={1.5} style={{ color: 'var(--color-muted-ash-2)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--color-midnight-ink)', fontWeight: 500 }}>{selected.org}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-ghost-border)' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted-ash-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  Susisiekti
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <a
                    href={`tel:${selected.phone}`}
                    style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      padding: '14px 10px', borderRadius: 12, textDecoration: 'none',
                      background: 'rgba(118,192,61,0.12)', border: '1px solid rgba(118,192,61,0.25)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(118,192,61,0.22)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(118,192,61,0.12)')}
                  >
                    <Phone size={18} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-accent)' }}>Skambinti</span>
                  </a>
                  <a
                    href={`mailto:${selected.email}`}
                    style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      padding: '14px 10px', borderRadius: 12, textDecoration: 'none',
                      background: 'rgba(255,255,255,0.07)', border: '1px solid var(--color-ghost-border)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.13)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.07)')}
                  >
                    <Mail size={18} strokeWidth={1.5} style={{ color: 'var(--color-midnight-ink)' }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>El. paštas</span>
                  </a>
                </div>
              </div>

              {/* Details */}
              <div style={{ padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted-ash-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  Informacija
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 10, border: '1px solid var(--color-ghost-border)' }}>
                    <Phone size={14} strokeWidth={1.5} style={{ color: 'var(--color-muted-ash-2)', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--color-muted-ash-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>Telefonas</p>
                      <a href={`tel:${selected.phone}`} style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-midnight-ink)', textDecoration: 'none' }}>{selected.phone}</a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 10, border: '1px solid var(--color-ghost-border)' }}>
                    <Mail size={14} strokeWidth={1.5} style={{ color: 'var(--color-muted-ash-2)', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 10, color: 'var(--color-muted-ash-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>El. paštas</p>
                      <a href={`mailto:${selected.email}`} style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-midnight-ink)', textDecoration: 'none' }}>{selected.email}</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin actions */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-ghost-border)', display: 'flex', gap: 8 }}>
                <Btn variant="secondary" icon={<Pencil size={13} />} onClick={() => openEdit(selected)} style={{ flex: 1, justifyContent: 'center' }}>
                  Redaguoti
                </Btn>
                <Btn variant="secondary" icon={<Trash2 size={13} />} onClick={() => handleDelete(selected.id)} style={{ justifyContent: 'center', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
                  Ištrinti
                </Btn>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit / Create dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? 'Redaguoti kontaktą' : 'Naujas kontaktas'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Kategorija</label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as ContactCategory }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CONTACT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {[
              { label: 'Vardas ir pavardė', key: 'fullName', placeholder: 'Jonas Petraitis' },
              { label: 'Organizacija', key: 'org', placeholder: 'UAB Firma' },
              { label: 'Telefonas', key: 'phone', placeholder: '+370 600 00000' },
              { label: 'El. paštas', key: 'email', placeholder: 'jonas@firma.lt', type: 'email' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>{field.label}</label>
                <input type={field.type ?? 'text'} value={(form as Record<string, string>)[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} placeholder={field.placeholder} required style={{ width: '100%', padding: '10px 14px', fontSize: 14, border: '1px solid var(--color-ghost-border)', borderRadius: 'var(--radius-input)', outline: 'none', fontFamily: 'inherit', fontWeight: 500, boxSizing: 'border-box' }} />
              </div>
            ))}
            <Btn variant="primary" type="submit" style={{ justifyContent: 'center', marginTop: 4 }}>{editingId ? 'Išsaugoti' : 'Sukurti kontaktą'}</Btn>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
