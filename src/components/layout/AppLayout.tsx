'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { useStore } from '@/lib/store';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const role = useStore(s => s.session.role);
  const hideSidebar = role === 'work_manager' || role === 'worker';

  return (
    <div className="app-wrapper">
      {/* Mobile top bar — only shown when sidebar is present */}
      {!hideSidebar && (
        <div className="mobile-topbar">
          <button className="sidebar-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Atidaryti meniu">
            <Menu size={19} />
          </button>
          <img src="/logo-white.svg" alt="Miteda" style={{ height: 24, width: 'auto' }} />
        </div>
      )}

      {!hideSidebar && (
        <>
          <div
            className={`app-sidebar-overlay${sidebarOpen ? ' open' : ''}`}
            onClick={() => setSidebarOpen(false)}
          />
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(c => !c)}
          />
        </>
      )}

      <main className="app-main">
        {children}
      </main>
    </div>
  );
}
