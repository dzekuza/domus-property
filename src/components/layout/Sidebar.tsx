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
  { href: '/portal/pagrindinis', label: 'Pagrindinis', icon: Home },
  { href: '/portal/defektai',    label: 'Defektai',    icon: AlertTriangle },
  { href: '/portal/nuotraukos',  label: 'Nuotraukos',  icon: Image },
  { href: '/portal/sutartys',    label: 'Paslaugų sutartys', icon: FileText },
  { href: '/portal/kontaktai',     label: 'Kontaktai',     icon: UserRoundCog },
  { href: '/portal/tvarkarastis', label: 'Tvarkaraštis', icon: Calendar },
  { href: '/portal/bendruomene',  label: 'Bendruomenė',  icon: MessageSquare },
  { href: '/portal/nustatymai',   label: 'Nustatymai',   icon: Settings },
];

const adminNav = [
  { href: '/admin/estates',       label: 'Objektai',     icon: Building2 },
  { href: '/admin/defects',       label: 'Defektai',     icon: Bug },
  { href: '/admin/contacts',      label: 'Kontaktai',    icon: Users },
  { href: '/admin/tvarkarastis',  label: 'Tvarkaraštis', icon: Calendar },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, currentUser, effectiveUser, signOut, stopImpersonating } = useStore();
  const user = currentUser();
  const effUser = effectiveUser();
  const isImpersonating = !!session.impersonateUserId;
  const nav = session.role === 'admin' ? adminNav : ownerNav;

  function handleSignOut() {
    signOut();
    router.push('/login');
  }

  return (
    <aside style={{ width: 260, height: '100vh', position: 'sticky', top: 0, background: 'var(--color-paper-white)', borderRight: '1px solid var(--color-ghost-border)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-electric-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Building2 size={18} color="white" />
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, color: 'var(--color-midnight-ink)' }}>Domus</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, background: 'var(--color-violet-tint)', color: 'var(--color-electric-violet)', padding: '2px 8px', borderRadius: 1000, fontWeight: 500 }}>
          {session.role === 'admin' ? 'Admin' : 'Savininkas'}
        </span>
      </div>

      {/* Impersonate banner */}
      {isImpersonating && (
        <div style={{ margin: '0 12px 8px', background: '#fdf3df', border: '1px solid #f0d080', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <Eye size={14} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
          <span style={{ flex: 1, color: 'var(--color-warning)' }}>Žiūrite kaip savininkas</span>
          <button onClick={stopImpersonating} style={{ color: 'var(--color-warning)', cursor: 'pointer', display: 'flex' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Section label */}
      <div style={{ padding: '8px 20px 4px', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-muted-ash-2)', fontWeight: 500 }}>
        {session.role === 'admin' ? 'Valdymas' : 'Mano butas'}
      </div>

      {/* Nav */}
      <nav style={{ padding: '0 8px', flex: 1 }}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item${active ? ' active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 8px 8px', borderTop: '1px solid var(--color-ghost-border)' }}>
        <Link href="#" className="nav-item" style={{ marginBottom: 4 }}>
          <HelpCircle size={18} strokeWidth={1.5} />
          Pagalba
        </Link>
        <button onClick={handleSignOut} className="nav-item" style={{ color: 'var(--color-danger)' }}>
          <LogOut size={18} strokeWidth={1.5} />
          Atsijungti
        </button>
      </div>

      {/* User card */}
      <div style={{ margin: 8, padding: '12px 14px', background: 'var(--color-cloud-canvas)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: effUser?.avatarBg ?? 'var(--color-violet-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--color-electric-violet)', flexShrink: 0 }}>
          {initials(effUser?.fullName ?? '?')}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-midnight-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{effUser?.fullName}</div>
          <div style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{effUser?.email}</div>
        </div>
      </div>
    </aside>
  );
}
