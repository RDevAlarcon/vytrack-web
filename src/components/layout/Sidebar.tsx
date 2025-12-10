// src/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Car, Users, ClipboardList, Bell, BarChart3, Settings, Map } from 'lucide-react';
import { cn } from '../../lib/utils';

const links = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/vehicles', label: 'Vehicles', icon: Car },
  { href: '/drivers', label: 'Drivers', icon: Users },
  { href: '/assignments', label: 'Assignments', icon: ClipboardList },
  { href: '/tracking', label: 'Tracking', icon: Map },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings/subscription', label: 'Subscription', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex h-full w-64 flex-col bg-gray-900 text-gray-100">
      <div className="px-4 py-6 text-lg font-semibold">VyTrack</div>
      <nav className="flex-1 space-y-1 px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-800',
                active && 'bg-gray-800 text-white',
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
