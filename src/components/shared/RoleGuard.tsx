'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import type { Role } from '@/lib/types';

export default function RoleGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const router = useRouter();
  const session = useStore(s => s.session);

  useEffect(() => {
    if (!session.userId || session.role !== role) {
      router.replace('/login');
    }
  }, [session, role, router]);

  if (!session.userId || session.role !== role) return null;
  return <>{children}</>;
}
