'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, AlertTriangle, Image, FileText, UserRoundCog, Settings,
  Building2, Bug, Users, LogOut, HelpCircle, Eye, X, Calendar, MessageSquare, HardHat,
  PanelLeftClose, PanelLeftOpen, Megaphone, ClipboardList,
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
  { href: '/portal/skelbimai',   label: 'Skelbimų lenta',    icon: Megaphone },
  { href: '/portal/bendruomene', label: 'Bendruomenė',       icon: MessageSquare },
  { href: '/portal/darbai',      label: 'Remonto darbai',    icon: HardHat },
  { href: '/portal/nustatymai',  label: 'Nustatymai',        icon: Settings },
];

const adminNav = [
  { href: '/admin/estates',      label: 'Objektai',     icon: Building2 },
  { href: '/admin/defects',      label: 'Defektai',     icon: Bug },
  { href: '/admin/contacts',     label: 'Kontaktai',    icon: Users },
  { href: '/admin/tvarkarastis', label: 'Tvarkaraštis', icon: Calendar },
  { href: '/admin/bendruomene',  label: 'Bendruomenė',  icon: MessageSquare },
  { href: '/admin/darbai',       label: 'Remonto darbai', icon: HardHat },
  { href: '/admin/darbu-eiga',   label: 'Darbu eiga',   icon: ClipboardList },
];

const managerNav = [
  { href: '/manager', label: 'Mano projektas', icon: HardHat },
];

const workerNav = [
  { href: '/worker', label: 'Mano darbai', icon: HardHat },
];

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }: { isOpen?: boolean; onClose?: () => void; collapsed?: boolean; onToggleCollapse?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, currentUser, effectiveUser, signOut, stopImpersonating } = useStore();
  const effUser = effectiveUser();
  const isImpersonating = !!session.impersonateUserId;
  const nav = session.role === 'admin' ? adminNav
    : session.role === 'work_manager' ? managerNav
    : session.role === 'worker' ? workerNav
    : ownerNav;

  function handleSignOut() {
    signOut();
    router.push('/login');
  }

  return (
    <aside
      className={`app-sidebar${isOpen ? ' open' : ''}`}
      style={{
        width: collapsed ? 60 : 256,
        height: 'calc(100dvh - 20px)',
        position: 'sticky',
        top: 10,
        margin: '10px 0 10px 10px',
        background: 'var(--glass-sidebar-bg)',
        backdropFilter: 'var(--glass-sidebar-blur)',
        border: '1px solid var(--color-sidebar-border)',
        borderRadius: 18,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'width 0.22s ease',
      }}
    >
      {/* Logo */}
      <div className="sidebar-logo-row" style={{ padding: '16px 12px 14px', display: 'flex', alignItems: 'center', minHeight: 56, gap: 8 }}>
        {!collapsed && (
          <>
            <img src="/darkmite.svg" alt="Miteda" style={{ height: 26, width: 'auto', flexShrink: 0 }} />
            <span style={{
              fontSize: 10, fontWeight: 600,
              background: 'var(--color-teal-tint)',
              color: 'var(--color-sidebar-fg-active)',
              padding: '2px 8px',
              borderRadius: 100,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              {session.role === 'admin' ? 'Admin' : session.role === 'work_manager' ? 'Vadovas' : session.role === 'worker' ? 'Darbininkas' : 'Savininkas'}
            </span>
            <div style={{ flex: 1 }} />
          </>
        )}
        <button
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Išplėsti' : 'Suskleisti'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-sidebar-fg)', display: 'flex', padding: 4, flexShrink: 0, ...(collapsed ? { margin: '0 auto' } : {}) }}
        >
          <div className="t-icon-swap" data-state={collapsed ? 'a' : 'b'}>
            <span className="t-icon" data-icon="a"><PanelLeftOpen size={16} /></span>
            <span className="t-icon" data-icon="b"><PanelLeftClose size={16} /></span>
          </div>
        </button>
        {!collapsed && (
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Uždaryti meniu">
            <X size={15} />
          </button>
        )}
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
      {!collapsed && (
        <div style={{
          padding: '4px 16px 6px',
          fontSize: 10,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-muted-ash-2)',
          fontWeight: 600,
        }}>
          {session.role === 'admin' ? 'Valdymas' : session.role === 'work_manager' ? 'Projektas' : session.role === 'worker' ? 'Darbai' : 'Mano butas'}
        </div>
      )}

      {/* Nav */}
      <nav style={{ padding: '0 6px', flex: 1 }}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item${active ? ' active' : ''}`}
              title={collapsed ? label : undefined}
              style={collapsed ? { justifyContent: 'center', padding: '10px 0' } : undefined}
              onClick={onClose}
            >
              <Icon size={17} strokeWidth={active ? 2 : 1.75} style={{ flexShrink: 0, opacity: active ? 1 : 0.65 }} />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Footer links */}
      <div style={{ padding: '10px 6px 6px', borderTop: '1px solid var(--color-sidebar-border)' }}>
        <Link href="#" className="nav-item" title={collapsed ? 'Pagalba' : undefined} style={collapsed ? { justifyContent: 'center', padding: '10px 0' } : { marginBottom: 2 }}>
          <HelpCircle size={17} strokeWidth={1.75} style={{ opacity: 0.6, flexShrink: 0 }} />
          {!collapsed && 'Pagalba'}
        </Link>
        <button onClick={handleSignOut} className="nav-item" title={collapsed ? 'Atsijungti' : undefined} style={{ color: '#b91c1c', ...(collapsed ? { justifyContent: 'center', padding: '10px 0' } : {}) }}>
          <LogOut size={17} strokeWidth={1.75} style={{ flexShrink: 0 }} />
          {!collapsed && 'Atsijungti'}
        </button>
      </div>

      {/* User card */}
      <div style={{
        margin: collapsed ? '8px 6px 12px' : '8px 10px 12px',
        padding: collapsed ? '10px 0' : '12px 14px',
        background: 'var(--color-sidebar-user-bg)',
        borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 10,
        border: '1px solid var(--color-sidebar-border)',
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
        {!collapsed && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-midnight-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{effUser?.fullName}</div>
            <div style={{ fontSize: 11, color: 'var(--color-muted-ash-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{effUser?.email}</div>
          </div>
        )}
      </div>
    </aside>
  );
}
