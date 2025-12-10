'use client';

import { useEffect } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { FleetMap } from '../../components/map/FleetMap';
import { getToken } from '../../lib/auth';
import { useRouter } from 'next/navigation';

export default function TrackingPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <AppLayout>
      <FleetMap />
    </AppLayout>
  );
}
