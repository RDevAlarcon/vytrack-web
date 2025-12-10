'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { AppLayout } from '../../components/layout/AppLayout';
import { apiClient } from '../../lib/apiClient';
import { Button } from '../../components/ui/Button';

type Driver = {
  id: string;
  name: string;
  licenseNumber?: string;
  licenseExpiry?: string;
};

async function fetchDrivers() {
  const res = await apiClient.get('/drivers');
  return res.data as Driver[];
}

type CreateDriverForm = {
  name: string;
  licenseNumber?: string;
  licenseExpiry?: string;
};

export default function DriversPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['drivers'], queryFn: fetchDrivers });
  const { register, handleSubmit, reset } = useForm<CreateDriverForm>();

  const onSubmit = handleSubmit(async (form) => {
    await apiClient.post('/drivers', form);
    reset();
    queryClient.invalidateQueries({ queryKey: ['drivers'] });
  });

  return (
    <AppLayout>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Crear driver</h2>
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-sm text-gray-600">Nombre</label>
              <input className="mt-1 w-full rounded border px-3 py-2 text-sm" {...register('name', { required: true })} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Licencia</label>
              <input className="mt-1 w-full rounded border px-3 py-2 text-sm" {...register('licenseNumber')} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Vencimiento</label>
              <input type="date" className="mt-1 w-full rounded border px-3 py-2 text-sm" {...register('licenseExpiry')} />
            </div>
            <Button type="submit">Crear</Button>
          </form>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Drivers</h2>
          {isLoading ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : (
            <div className="mt-3 overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-500">
                    <th className="py-2">Nombre</th>
                    <th className="py-2">Licencia</th>
                    <th className="py-2">Vencimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((d) => (
                    <tr key={d.id} className="border-t">
                      <td className="py-2">{d.name}</td>
                      <td className="py-2">{d.licenseNumber || '-'}</td>
                      <td className="py-2">{d.licenseExpiry ? new Date(d.licenseExpiry).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
