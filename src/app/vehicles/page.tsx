'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { AppLayout } from '../../components/layout/AppLayout';
import { apiClient } from '../../lib/apiClient';
import { Button } from '../../components/ui/Button';

type Vehicle = {
  id: string;
  plate: string;
  type?: string;
  capacity?: string;
  status: string;
};

type CreateVehicleForm = {
  plate: string;
  type?: string;
  capacity?: string;
};

async function fetchVehicles() {
  const res = await apiClient.get('/vehicles');
  return res.data as Vehicle[];
}

export default function VehiclesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['vehicles'], queryFn: fetchVehicles });
  const { register, handleSubmit, reset } = useForm<CreateVehicleForm>();

  const onSubmit = handleSubmit(async (form) => {
    await apiClient.post('/vehicles', { ...form });
    reset();
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
  });

  const updateStatus = async (id: string, status: string) => {
    await apiClient.patch(`/vehicles/${id}`, { status });
    queryClient.invalidateQueries({ queryKey: ['vehicles'] });
  };

  return (
    <AppLayout>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Crear vehículo</h2>
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-sm text-gray-600">Plate</label>
              <input className="mt-1 w-full rounded border px-3 py-2 text-sm" {...register('plate', { required: true })} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Type</label>
              <input className="mt-1 w-full rounded border px-3 py-2 text-sm" {...register('type')} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Capacity</label>
              <input className="mt-1 w-full rounded border px-3 py-2 text-sm" {...register('capacity')} />
            </div>
            <Button type="submit">Crear</Button>
          </form>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Vehículos</h2>
          {isLoading ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : (
            <div className="mt-3 overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-500">
                    <th className="py-2">Plate</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((v) => (
                    <tr key={v.id} className="border-t">
                      <td className="py-2">{v.plate}</td>
                      <td className="py-2">{v.type || '-'}</td>
                      <td className="py-2">{v.status}</td>
                      <td className="py-2 space-x-2">
                        <Button type="button" className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(v.id, 'ACTIVE')}>
                          Activar
                        </Button>
                        <Button type="button" className="bg-yellow-600 hover:bg-yellow-700" onClick={() => updateStatus(v.id, 'INACTIVE')}>
                          Inactivar
                        </Button>
                        <Button type="button" className="bg-red-600 hover:bg-red-700" onClick={() => updateStatus(v.id, 'BLOCKED')}>
                          Bloquear
                        </Button>
                      </td>
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
