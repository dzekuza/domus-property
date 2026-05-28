'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, AlertTriangle, Image, FileText, UserRoundCog, Settings,
  Building2, Bug, Users, LogOut, HelpCircle, Eye, X, Calendar, MessageSquare,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { initials } from '@/lib/fmt';

const ownerNav = [
  { href: '/portal/pagrindinis', label: 'Pagrindinis',       icon: Home },
  { href: '/portal/defektai',    label: 'Defektai',          icon: AlertTriangle },
  { href: '/portal/nuotraukos',  label: 'Nuotraukos',        icon: Image },
  { href: '/portal/sutartys',    label: 'Paslaugų sutartys', icon: FileText },
  { href: '/portal/kontaktai',   label: 'Kontaktai',         icon: UserRoundCog },
  { href: '/portal/tvarkarastis',label: 'Tvarkaraštis',      icon: Calendar },
  { href: '/portal/bendruomene', label: 'Bendruomenė',       icon: MessageSquare },
  { href: '/portal/nustatymai',  label: 'Nustatymai',        icon: Settings },
];

const adminNav = [
  { href: '/admin/estates',      label: 'Objektai',     icon: Building2 },
  { href: '/admin/defects',      label: 'Defektai',     icon: Bug },
  { href: '/admin/contacts',     label: 'Kontaktai',    icon: Users },
  { href: '/admin/tvarkarastis', label: 'Tvarkaraštis', icon: Calendar },
];

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, currentUser, effectiveUser, signOut, stopImpersonating } = useStore();
  const effUser = effectiveUser();
  const isImpersonating = !!session.impersonateUserId;
  const nav = session.role === 'admin' ? adminNav : ownerNav;

  function handleSignOut() {
    signOut();
    router.push('/login');
  }

  return (
    <aside
      className={`app-sidebar${isOpen ? ' open' : ''}`}
      style={{
        width: 256,
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: 'var(--color-sidebar-bg)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 16px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <img
          src="/logo-white.svg"
          alt="Domus"
          style={{ height: 28, width: 'auto', flexShrink: 0 }}
        />
        <span style={{
          fontSize: 10, fontWeight: 600,
          background: 'rgba(103,205,205,0.18)',
          color: 'var(--color-teal)',
          padding: '2px 8px',
          borderRadius: 100,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginLeft: 'auto',
        }}>
          {session.role === 'admin' ? 'Admin' : 'Savininkas'}
        </span>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Uždaryti meniu">
          <X size={15} />
        </button>
      </div>

      {/* Impersonate banner */}
      {isImpersonating && (
        <div style={{
          margin: '0 10px 8px',
          background: 'rgba(232,119,60,0.15)',
          border: '1px solid rgba(232,119,60,0.3)',
          borderRadius: 10,
          padding: '10px 12px',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12,
        }}>
          <Eye size={13} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
          <span style={{ flex: 1, color: 'var(--color-accent)' }}>Žiūrite kaip savininkas</span>
          <button onClick={stopImpersonating} style={{ color: 'var(--color-accent)', cursor: 'pointer', display: 'flex', background: 'none', border: 'none' }}>
            <X size={13} />
          </button>
        </div>
      )}

      {/* Section label */}
      <div style={{
        padding: '4px 16px 6px',
        fontSize: 10,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.35)',
        fontWeight: 600,
      }}>
        {session.role === 'admin' ? 'Valdymas' : 'Mano butas'}
      </div>

      {/* Nav */}
      <nav style={{ padding: '0 8px', flex: 1 }}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`nav-item${active ? ' active' : ''}`}>
              <Icon size={17} strokeWidth={active ? 2 : 1.75} style={{ flexShrink: 0, opacity: active ? 1 : 0.65 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer links */}
      <div style={{ padding: '10px 8px 6px', borderTop: '1px solid var(--color-sidebar-border)' }}>
        <Link href="#" className="nav-item" style={{ marginBottom: 2 }}>
          <HelpCircle size={17} strokeWidth={1.75} style={{ opacity: 0.6, flexShrink: 0 }} />
          Pagalba
        </Link>
        <button onClick={handleSignOut} className="nav-item" style={{ color: '#f87171' }}>
          <LogOut size={17} strokeWidth={1.75} style={{ flexShrink: 0 }} />
          Atsijungti
        </button>
      </div>

      {/* User card */}
      <div style={{
        margin: '8px 10px 12px',
        padding: '12px 14px',
        background: 'var(--color-sidebar-user-bg)',
        borderRadius: 12,
        display: 'flex', alignItems: 'center', gap: 10,
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'var(--color-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff',
          flexShrink: 0,
        }}>
          {initials(effUser?.fullName ?? '?')}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, color: '#fff',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{effUser?.fullName}</div>
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,0.45)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{effUser?.email}</div>
        </div>
      </div>
    </aside>
  );
}
