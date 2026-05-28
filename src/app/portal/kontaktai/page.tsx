'use client';

import { Phone, Mail, UserRoundCog } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/shared/Card';
import Avatar from '@/components/shared/Avatar';
import EmptyState from '@/components/shared/EmptyState';

export default function KontaktaiPage() {
  const { effectiveUser, unitOf, estateForUnit, contacts } = useStore();
  const effUser = effectiveUser();
  const unit = effUser?.unitId ? unitOf(effUser.id) : null;
  const estate = unit ? estateForUnit(unit.id) : null;
  const estateContacts = contacts.filter(c => estate?.contactIds.includes(c.id));

  return (
    <div>
      <PageHeader title="Kontaktai" subtitle="Specialistai, atsakingi už jūsų projektą." />

      {estateContacts.length === 0 ? (
        <Card><EmptyState icon={UserRoundCog} title="Kontaktų dar nėra" subtitle="Kontaktai bus paskelbti artimiausiu metu." /></Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {estateContacts.map(contact => (
            <Card key={contact.id}>
              <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
                <Avatar name={contact.fullName} size={44} />
                <div>
                  <p style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{contact.category}</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{contact.fullName}</p>
                  <p style={{ fontSize: 13, color: 'var(--color-muted-ash-2)' }}>{contact.org}</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <a href={`tel:${contact.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-midnight-ink)', textDecoration: 'none' }}>
                  <Phone size={14} strokeWidth={1.5} style={{ color: 'var(--color-muted-ash-2)' }} />
                  {contact.phone}
                </a>
                <a href={`mailto:${contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-midnight-ink)', textDecoration: 'none' }}>
                  <Mail size={14} strokeWidth={1.5} style={{ color: 'var(--color-muted-ash-2)' }} />
                  {contact.email}
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
