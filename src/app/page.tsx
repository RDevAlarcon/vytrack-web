'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { AppLayout } from '../components/layout/AppLayout';

async function fetchCounts() {
  const [vehicles, drivers, assignments] = await Promise.all([
    apiClient.get('/vehicles'),
    apiClient.get('/drivers'),
    apiClient.get('/assignments'),
  ]);
  return {
    vehicles: vehicles.data.length || 0,
    drivers: drivers.data.length || 0,
    assignments: assignments.data.length || 0,
  };
}

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-counts'],
    queryFn: fetchCounts,
  });

  return (
    <AppLayout>
      <div className="grid gap-4 md:grid-cols-3">
        {['Vehicles', 'Drivers', 'Assignments'].map((label) => {
          const value =
            label === 'Vehicles'
              ? data?.vehicles ?? 0
              : label === 'Drivers'
              ? data?.drivers ?? 0
              : data?.assignments ?? 0;
          return (
            <div key={label} className="rounded-lg bg-white p-4 shadow">
              <div className="text-sm text-gray-500">{label}</div>
              <div className="text-3xl font-semibold">{isLoading ? '...' : value}</div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
