// src/components/layout/Topbar.tsx
'use client';

import { useRouter } from 'next/navigation';
import { clearToken } from '../../lib/auth';
import { Button } from '../ui/Button';

export function Topbar() {
  const router = useRouter();
  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-4">
      <div className="text-sm text-gray-600">VyTrack Panel</div>
      <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
        Cerrar sesión
      </Button>
    </header>
  );
}
