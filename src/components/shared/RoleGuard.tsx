'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import type { Role } from '@/lib/types';

export default function RoleGuard({ role, children }: { role: Role | Role[]; children: React.ReactNode }) {
  const router = useRouter();
  const session = useStore(s => s.session);

  const allowed = Array.isArray(role) ? role : [role];
  const ok = !!session.userId && !!session.role && allowed.includes(session.role);

  useEffect(() => {
    if (!ok) router.replace('/login');
  }, [ok, router]);

  if (!ok) return null;
  return <>{children}</>;
}
