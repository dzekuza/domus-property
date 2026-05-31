import AppLayout from '@/components/layout/AppLayout';
import RoleGuard from '@/components/shared/RoleGuard';

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="worker">
      <AppLayout>{children}</AppLayout>
    </RoleGuard>
  );
}
