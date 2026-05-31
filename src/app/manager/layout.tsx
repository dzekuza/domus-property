import AppLayout from '@/components/layout/AppLayout';
import RoleGuard from '@/components/shared/RoleGuard';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="work_manager">
      <AppLayout>{children}</AppLayout>
    </RoleGuard>
  );
}
