'use client';

import { useState } from 'react';
import { Menu, Building2 } from 'lucide-react';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-wrapper">
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button className="sidebar-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Atidaryti meniu">
          <Menu size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--color-electric-violet)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={15} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500, color: 'var(--color-midnight-ink)' }}>Domus</span>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className={`app-sidebar-overlay${sidebarOpen ? ' open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <main className="app-main">
        {children}
      </main>
    </div>
  );
}
