'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Phone, Mail } from 'lucide-react';
import { useStore } from '@/lib/store';
import { CONTACT_CATEGORIES } from '@/lib/constants';
import PageShell from '@/components/layout/PageShell';
import Avatar from '@/components/shared/Avatar';
import Btn from '@/components/shared/Btn';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ContactCategory } from '@/lib/types';

export default function AdminContactsPage() {
  const { contacts, upsertContact, deleteContact } = useStore();
  const [filter, setFilter] = useState<ContactCategory | 'Visi'>('Visi');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ fullName: '', org: '', phone: '', email: '', category: 'Kita' as ContactCategory });

  const filtered = filter === 'Visi' ? contacts : contacts.filter(c => c.category === filter);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    upsertContact({ ...form, documents: [] });
    setForm({ fullName: '', org: '', phone: '', email: '', category: 'Kita' });
    setShowModal(false);
  }

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: 'var(--radius-pill)', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
    background: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.07)',
    color: active ? '#11141a' : 'rgba(255,255,255,0.72)',
    border: active ? '1px solid transparent' : '1px solid rgba(255,255,255,0.14)',
    transition: 'background 0.15s, color 0.15s',
  });

  return (
    <div>
      <PageShell
        title="Kontaktai"
        subtitle={`${contacts.length} specialistų`}
        actions={<Btn variant="primary" icon={<Plus size={15} />} onClick={() => setShowModal(true)}>Naujas kontaktas</Btn>}
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
              <tr key={contact.id}>
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
                  <a href={`tel:${contact.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-midnight-ink)', textDecoration: 'none' }}>
                    <Phone size={13} strokeWidth={1.5} style={{ color: 'var(--color-muted-ash-2)' }} />
                    {contact.phone}
                  </a>
                </td>
                <td>
                  <a href={`mailto:${contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-midnight-ink)', textDecoration: 'none' }}>
                    <Mail size={13} strokeWidth={1.5} style={{ color: 'var(--color-muted-ash-2)' }} />
                    {contact.email}
                  </a>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-muted-ash-2)', padding: 6, display: 'flex', borderRadius: 6 }}><Pencil size={14} /></button>
                    <button onClick={() => deleteContact(contact.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: 6, display: 'flex', borderRadius: 6 }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </PageShell>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Naujas kontaktas</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Kategorija</label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as ContactCategory }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
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
            <Btn variant="primary" type="submit" style={{ justifyContent: 'center', marginTop: 4 }}>Sukurti kontaktą</Btn>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
