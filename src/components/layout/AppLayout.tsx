'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-wrapper">
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button className="sidebar-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Atidaryti meniu">
          <Menu size={19} />
        </button>
        <img src="/logo-white.svg" alt="Domus" style={{ height: 24, width: 'auto' }} />
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
