'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function Root() {
  const router = useRouter();
  const session = useStore(s => s.session);

  useEffect(() => {
    if (!session.userId) {
      router.replace('/login');
    } else if (session.role === 'admin') {
      router.replace('/admin/estates');
    } else if (session.role === 'work_manager') {
      router.replace('/manager');
    } else if (session.role === 'worker') {
      router.replace('/worker');
    } else {
      router.replace('/portal/pagrindinis');
    }
  }, [session, router]);

  return null;
}
