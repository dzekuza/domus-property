import AppLayout from '@/components/layout/AppLayout';
import RoleGuard from '@/components/shared/RoleGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="admin">
      <AppLayout>{children}</AppLayout>
    </RoleGuard>
  );
}
