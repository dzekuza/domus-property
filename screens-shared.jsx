// screens-shared.jsx — icons, sidebar, topbar, layout used by every Domus screen.
// Each artboard mounts its own <ScreenRouter> with its own state, so sidebar
// clicks work inside that artboard.

const { useState, useMemo, useRef, useEffect, createContext, useContext } = React;

/* ============================== ICONS ============================== */
// Minimal-stroke outline icons, 1.5px stroke, monochrome.
function Icon({ name, size = 18, color = 'currentColor' }) {
  const s = size;
  const props = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home':       return <svg {...props}><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9h14v-9"/><path d="M10 19v-5h4v5"/></svg>;
    case 'alert':      return <svg {...props}><path d="M12 9v4"/><circle cx="12" cy="16" r=".5" fill={color}/><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z"/></svg>;
    case 'image':      return <svg {...props}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5L5 21"/></svg>;
    case 'file':       return <svg {...props}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>;
    case 'contact':    return <svg {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11h-6"/><path d="M22 16h-6"/></svg>;
    case 'cog':        return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>;
    case 'bldg':       return <svg {...props}><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M15 9h2a2 2 0 0 1 2 2v10"/><path d="M9 7h2"/><path d="M9 11h2"/><path d="M9 15h2"/></svg>;
    case 'search':     return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case 'bell':       return <svg {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
    case 'plus':       return <svg {...props}><path d="M12 5v14"/><path d="M5 12h14"/></svg>;
    case 'chevron-down': return <svg {...props}><path d="m6 9 6 6 6-6"/></svg>;
    case 'chevron-right': return <svg {...props}><path d="m9 6 6 6-6 6"/></svg>;
    case 'chevron-left': return <svg {...props}><path d="m15 6-6 6 6 6"/></svg>;
    case 'check':      return <svg {...props}><path d="M20 6 9 17l-5-5"/></svg>;
    case 'x':          return <svg {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
    case 'upload':     return <svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8 12 3 7 8"/><path d="M12 3v12"/></svg>;
    case 'download':   return <svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>;
    case 'paperclip':  return <svg {...props}><path d="m21 12-9 9a6 6 0 0 1-8.5-8.5l9-9a4 4 0 0 1 5.5 5.5L9 18a2 2 0 1 1-3-3l8-8"/></svg>;
    case 'send':       return <svg {...props}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>;
    case 'phone':      return <svg {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>;
    case 'mail':       return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>;
    case 'drop':       return <svg {...props}><path d="M12 2.5s7 7.5 7 12.5a7 7 0 0 1-14 0c0-5 7-12.5 7-12.5Z"/></svg>;
    case 'bolt':       return <svg {...props}><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>;
    case 'flame':      return <svg {...props}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.5 0 2.8-.4 4-2 .8-1 .9-2.2.4-3.4-.4-.9-1.2-1.6-2-2.3-.7-.6-1.4-1.1-2-1.8-.5-.6-1-1.4-1-2.4 0-.5.1-1 .3-1.5a4 4 0 0 0-2.4 3.5c0 1.6.7 2.6 1.4 3.4l.3.4c.7 1 .9 2 .5 2.8Z"/><path d="M14 17.8c.7-.3 1.5-1 1.8-1.7"/></svg>;
    case 'trash':      return <svg {...props}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>;
    case 'edit':       return <svg {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>;
    case 'filter':     return <svg {...props}><path d="M22 3H2l8 9.5V19l4 2v-8.5Z"/></svg>;
    case 'dot':        return <svg {...props}><circle cx="12" cy="12" r="4" fill={color} stroke="none"/></svg>;
    case 'eye':        return <svg {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'lock':       return <svg {...props}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
    case 'tools':      return <svg {...props}><path d="M14.7 6.3a4 4 0 1 1 5.66 5.66l-9.9 9.9a2 2 0 1 1-2.83-2.83l9.9-9.9"/><path d="m12 8 4 4"/></svg>;
    case 'doc-up':     return <svg {...props}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="m9 14 3-3 3 3"/><path d="M12 11v7"/></svg>;
    default:           return null;
  }
}

/* ============================== ROUTING ============================== */
const RouterCtx = createContext(null);

function ScreenRouter({ role, initialRoute, children }) {
  const [route, setRoute] = useState(initialRoute);
  const [modal, setModal] = useState(null); // { kind, payload }
  return (
    <RouterCtx.Provider value={{ role, route, setRoute, modal, setModal }}>
      {children}
    </RouterCtx.Provider>
  );
}
function useRouter() { return useContext(RouterCtx); }

/* ============================== DOMUS LOGO ============================== */
function DomusLogo({ size = 22 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M3 11.5 12 3l9 8.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-9.5Z" fill="#202020"/>
        <circle cx="12" cy="10" r="2.2" fill="#5757f8"/>
      </svg>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 18, letterSpacing: '-0.02em' }}>Domus</span>
    </div>
  );
}

/* ============================== SIDEBAR ============================== */
const OWNER_NAV = [
  { id: 'pagrindinis',  icon: 'home',    label: 'Pagrindinis',       sub: 'Pirkimo eiga' },
  { id: 'defektai',     icon: 'alert',   label: 'Defektai',          sub: 'Pranešimai ir atsakymai' },
  { id: 'nuotraukos',   icon: 'image',   label: 'Nuotraukos',        sub: 'Buto perdavimas' },
  { id: 'sutartys',     icon: 'file',    label: 'Paslaugų sutartys', sub: 'Komunalinės paslaugos' },
  { id: 'kontaktai',    icon: 'contact', label: 'Kontaktai',         sub: 'Specialistai' },
  { id: 'nustatymai',   icon: 'cog',     label: 'Nustatymai',        sub: 'Paskyra' },
];

const ADMIN_NAV = [
  { id: 'estates',  icon: 'bldg',    label: 'Objektai',     sub: 'Visi projektai' },
  { id: 'defects',  icon: 'alert',   label: 'Defektai',     sub: 'Visi pranešimai' },
  { id: 'contacts', icon: 'contact', label: 'Kontaktai',    sub: 'Specialistų biblioteka' },
];

function Sidebar() {
  const { role, route, setRoute } = useRouter();
  const items = role === 'admin' ? ADMIN_NAV : OWNER_NAV;
  // Match active route by prefix (admin sub-pages like 'estate-detail' map to 'estates')
  const activeBase = (
    route === 'estate-detail' || route === 'unit-editor' ? 'estates' :
    route === 'defect-thread' ? 'defects' :
    route
  );
  return (
    <aside style={{
      width: 260,
      background: 'var(--color-paper-white)',
      borderRight: '1px solid var(--color-ghost-border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      padding: '28px 20px 20px',
    }}>
      {/* Logo + role chip */}
      <div style={{ padding: '0 8px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <DomusLogo />
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px',
          background: role === 'admin' ? 'var(--color-midnight-ink)' : 'var(--color-cloud-canvas)',
          color: role === 'admin' ? 'var(--color-paper-white)' : 'var(--color-muted-ash)',
          borderRadius: 'var(--radius-pill)', fontSize: 11, fontWeight: 500,
          letterSpacing: 0,
        }}>
          {role === 'admin' ? 'Admin' : 'Savininkas'}
        </div>
      </div>

      {/* Nav section */}
      <div style={{ padding: '0 16px 12px' }}>
        <div className="t-caption" style={{ fontSize: 11, color: 'var(--color-muted-ash-2)' }}>
          {role === 'admin' ? 'Valdymas' : 'Mano butas'}
        </div>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map(it => (
          <button key={it.id}
            className={`nav-item ${activeBase === it.id ? 'active' : ''}`}
            onClick={() => setRoute(it.id)}>
            <Icon name={it.icon} size={18} />
            <span style={{ flex: 1 }}>{it.label}</span>
          </button>
        ))}
      </nav>

      <div style={{ flex: 1 }}></div>

      {/* Help link */}
      <button className="nav-item" style={{ marginBottom: 12 }}>
        <Icon name="contact" size={18}/>
        <span style={{ flex: 1 }}>Pagalba</span>
      </button>

      {/* User card */}
      <div style={{
        padding: 12,
        borderRadius: 10,
        background: 'var(--color-cloud-canvas)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--color-midnight-ink)',
          color: 'var(--color-paper-white)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 500, flexShrink: 0,
        }}>
          {role === 'admin' ? 'TM' : 'AK'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.2, color: 'var(--color-midnight-ink)' }}>
            {role === 'admin' ? 'Tomas Mockus' : 'Andrius Kazlauskas'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-muted-ash-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
            {role === 'admin' ? 'tomas@domus.lt' : 'a.kazlauskas@mail.lt'}
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ============================== TOPBAR ============================== */
function Topbar({ title, subtitle, actions, breadcrumbs }) {
  return (
    <header style={{
      padding: '20px 32px 0',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 24,
      flexShrink: 0,
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        {breadcrumbs && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 13, color: 'var(--color-muted-ash-2)' }}>
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Icon name="chevron-right" size={12} />}
                <span style={{ color: i === breadcrumbs.length - 1 ? 'var(--color-midnight-ink)' : 'inherit' }}>{b}</span>
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 className="h-page">{title}</h1>
        {subtitle && <p className="t-body" style={{ marginTop: 6 }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {actions}
        <button className="btn-ghost" style={{ padding: 8, borderRadius: '50%' }}>
          <Icon name="bell" size={16} />
        </button>
      </div>
    </header>
  );
}

/* ============================== LAYOUT ============================== */
function ScreenLayout({ children }) {
  return (
    <div className="domus-screen" style={{
      display: 'flex',
      width: '100%',
      height: '100%',
      background: 'var(--color-cloud-canvas)',
      overflow: 'hidden',
    }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}

/* ============================== MODAL ============================== */
function Modal({ open, onClose, title, children, footer, width = 560 }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(32,32,32,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="fade-in" style={{
        background: 'var(--color-paper-white)',
        borderRadius: 12,
        width, maxWidth: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-ghost-border)' }}>
          <h3 className="h-section">{title}</h3>
          <button onClick={onClose} style={{ padding: 6, borderRadius: '50%' }}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ padding: 24, maxHeight: 540, overflowY: 'auto' }}>{children}</div>
        {footer && <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-ghost-border)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ============================== HELPERS ============================== */
function Avatar({ name, size = 32, bg }) {
  const initials = name.split(' ').slice(0,2).map(p => p[0]).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg || 'var(--color-violet-tint)',
      color: 'var(--color-electric-violet)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 500, flexShrink: 0,
    }}>{initials}</div>
  );
}

function StatusPill({ status }) {
  const map = {
    done: { cls: 'pill pill-success', label: 'Atlikta', icon: 'check' },
    progress: { cls: 'pill pill-violet', label: 'Vykdoma', icon: 'dot' },
    pending: { cls: 'pill pill-neutral', label: 'Laukiama', icon: 'dot' },
    review: { cls: 'pill pill-warning', label: 'Peržiūrima', icon: 'dot' },
    open: { cls: 'pill pill-warning', label: 'Atviras', icon: 'dot' },
    resolved: { cls: 'pill pill-success', label: 'Išspręsta', icon: 'check' },
    rejected: { cls: 'pill pill-danger', label: 'Atmesta', icon: 'x' },
    not_started: { cls: 'pill pill-neutral', label: 'Nepradėta', icon: 'dot' },
  };
  const s = map[status] || map.pending;
  return <span className={s.cls}><Icon name={s.icon} size={10} />{s.label}</span>;
}

// Export
Object.assign(window, { Icon, ScreenRouter, useRouter, Sidebar, Topbar, ScreenLayout, Modal, Avatar, StatusPill, DomusLogo, OWNER_NAV, ADMIN_NAV });
