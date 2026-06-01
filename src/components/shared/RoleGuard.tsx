'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import type { Role } from '@/lib/types';

export default function RoleGuard({ role, children }: { role: Role | Role[]; children: React.ReactNode }) {
  const router = useRouter();
  const session = useStore(s => s.session);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Wait for zustand persist rehydration before checking auth
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
    if (useStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  const allowed = Array.isArray(role) ? role : [role];
  const ok = !!session.userId && !!session.role && allowed.includes(session.role);

  useEffect(() => {
    if (hydrated && !ok) router.replace('/login');
  }, [ok, router, hydrated]);

  if (!hydrated || !ok) return null;
  return <>{children}</>;
}
