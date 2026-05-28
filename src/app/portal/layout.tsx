import AppLayout from '@/components/layout/AppLayout';
import RoleGuard from '@/components/shared/RoleGuard';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard role="owner">
      <AppLayout>{children}</AppLayout>
    </RoleGuard>
  );
}
