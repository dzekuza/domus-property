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
    } else {
      router.replace('/portal/pagrindinis');
    }
  }, [session, router]);

  return null;
}
