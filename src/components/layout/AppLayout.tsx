import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-cloud-canvas)' }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '24px 32px', maxWidth: 1320 + 64 }}>
        {children}
      </main>
    </div>
  );
}
