'use client';

import { useState } from 'react';
import { Phone, Mail, UserRoundCog, X, Building2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import PageShell from '@/components/layout/PageShell';
import Avatar from '@/components/shared/Avatar';
import EmptyState from '@/components/shared/EmptyState';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import type { Contact } from '@/lib/types';

export default function KontaktaiPage() {
  const { effectiveUser, unitOf, estateForUnit, contacts } = useStore();
  const effUser = effectiveUser();
  const unit = effUser?.unitId ? unitOf(effUser.id) : null;
  const estate = unit ? estateForUnit(unit.id) : null;
  const estateContacts = contacts.filter(c => estate?.contactIds.includes(c.id));

  const [selected, setSelected] = useState<Contact | null>(null);

  return (
    <>
      <PageShell title="Kontaktai" subtitle="Specialistai, atsakingi už jūsų projektą." bodyStyle={{ padding: '16px 24px 24px' }}>
        {estateContacts.length === 0 ? (
          <EmptyState icon={UserRoundCog} title="Kontaktų dar nėra" subtitle="Kontaktai bus paskelbti artimiausiu metu." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {estateContacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => setSelected(contact)}
                style={{
                  background: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-ghost-border)',
                  borderRadius: 14,
                  padding: 16,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s, background 0.15s',
                  width: '100%',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(118,192,61,0.05)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-ghost-border)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-raised)';
                }}
              >
                <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
                  <Avatar name={contact.fullName} size={44} />
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted-ash-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{contact.category}</p>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-midnight-ink)' }}>{contact.fullName}</p>
                    <p style={{ fontSize: 13, color: 'var(--color-muted-ash)' }}>{contact.org}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-midnight-ink)' }}>
                    <Phone size={14} strokeWidth={1.5} style={{ color: 'var(--color-muted-ash-2)', flexShrink: 0 }} />
                    {contact.phone}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-midnight-ink)' }}>
                    <Mail size={14} strokeWidth={1.5} style={{ color: 'var(--color-muted-ash-2)', flexShrink: 0 }} />
                    {contact.email}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </PageShell>

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
          {selected && <ContactDrawer contact={selected} onClose={() => setSelected(null)} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

function ContactDrawer({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-muted-ash)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Kontaktas
        </span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted-ash)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--color-midnight-ink)')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted-ash)')}
        >
          <X size={18} />
        </button>
      </div>

      {/* Identity block */}
      <div style={{ padding: '20px 24px 24px', borderBottom: '1px solid var(--color-ghost-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <Avatar name={contact.fullName} size={56} />
          <div>
            <p style={{ fontSize: 19, fontWeight: 700, color: 'var(--color-midnight-ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {contact.fullName}
            </p>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {contact.category}
            </p>
          </div>
        </div>

        {/* Org row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(255,255,255,0.07)', borderRadius: 10, border: '1px solid var(--color-ghost-border)' }}>
          <Building2 size={14} strokeWidth={1.5} style={{ color: 'var(--color-muted-ash-2)', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'var(--color-midnight-ink)', fontWeight: 500 }}>{contact.org}</span>
        </div>
      </div>

      {/* Contact actions */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-ghost-border)' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-muted-ash-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          Susisiekti
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <a
            href={`tel:${contact.phone}`}
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
            href={`mailto:${contact.email}`}
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
              <a href={`tel:${contact.phone}`} style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-midnight-ink)', textDecoration: 'none' }}>
                {contact.phone}
              </a>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 10, border: '1px solid var(--color-ghost-border)' }}>
            <Mail size={14} strokeWidth={1.5} style={{ color: 'var(--color-muted-ash-2)', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 10, color: 'var(--color-muted-ash-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>El. paštas</p>
              <a href={`mailto:${contact.email}`} style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-midnight-ink)', textDecoration: 'none' }}>
                {contact.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
