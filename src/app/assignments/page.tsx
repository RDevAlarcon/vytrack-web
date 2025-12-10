'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { AppLayout } from '../../components/layout/AppLayout';
import { apiClient } from '../../lib/apiClient';
import { Button } from '../../components/ui/Button';

type Vehicle = { id: string; plate: string };
type Driver = { id: string; name: string };
type Assignment = {
  id: string;
  driverId: string;
  vehicleId: string;
  status: string;
  taskRef?: string;
  driver?: Driver;
  vehicle?: Vehicle;
};

async function fetchAssignments() {
  const res = await apiClient.get('/assignments');
  return res.data as Assignment[];
}

async function fetchVehicles() {
  const res = await apiClient.get('/vehicles');
  return res.data as Vehicle[];
}

async function fetchDrivers() {
  const res = await apiClient.get('/drivers');
  return res.data as Driver[];
}

type CreateAssignmentForm = {
  driverId: string;
  vehicleId: string;
  taskRef?: string;
};

export default function AssignmentsPage() {
  const queryClient = useQueryClient();
  const assignments = useQuery({ queryKey: ['assignments'], queryFn: fetchAssignments });
  const vehicles = useQuery({ queryKey: ['vehicles'], queryFn: fetchVehicles });
  const drivers = useQuery({ queryKey: ['drivers'], queryFn: fetchDrivers });

  const { register, handleSubmit, reset } = useForm<CreateAssignmentForm>();

  const onSubmit = handleSubmit(async (form) => {
    await apiClient.post('/assignments', form);
    reset();
    queryClient.invalidateQueries({ queryKey: ['assignments'] });
  });

  const updateStatus = async (id: string, status: string) => {
    await apiClient.patch(`/assignments/${id}/status`, { status });
    queryClient.invalidateQueries({ queryKey: ['assignments'] });
  };

  return (
    <AppLayout>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Crear asignación</h2>
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-sm text-gray-600">Vehículo</label>
              <select className="mt-1 w-full rounded border px-3 py-2 text-sm" {...register('vehicleId', { required: true })}>
                <option value="">Selecciona</option>
                {vehicles.data?.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Driver</label>
              <select className="mt-1 w-full rounded border px-3 py-2 text-sm" {...register('driverId', { required: true })}>
                <option value="">Selecciona</option>
                {drivers.data?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Referencia</label>
              <input className="mt-1 w-full rounded border px-3 py-2 text-sm" {...register('taskRef')} />
            </div>
            <Button type="submit">Crear</Button>
          </form>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Asignaciones</h2>
          {assignments.isLoading ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : (
            <div className="mt-3 overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-gray-500">
                    <th className="py-2">Vehículo</th>
                    <th className="py-2">Driver</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.data?.map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="py-2">{a.vehicle?.plate || a.vehicleId}</td>
                      <td className="py-2">{a.driver?.name || a.driverId}</td>
                      <td className="py-2">{a.status}</td>
                      <td className="py-2 space-x-2">
                        {['IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'PAUSED'].map((st) => (
                          <Button
                            key={st}
                            type="button"
                            className="bg-gray-800 hover:bg-gray-900"
                            onClick={() => updateStatus(a.id, st)}
                          >
                            {st}
                          </Button>
                        ))}
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
