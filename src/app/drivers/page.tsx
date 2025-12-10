'use client';

import { useState } from 'react';
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
  userEmail?: string;
};

async function fetchDrivers() {
  const res = await apiClient.get('/drivers');
  return res.data as Driver[];
}

type CreateDriverForm = {
  name: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  email: string;
  password: string;
};

export default function DriversPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['drivers'], queryFn: fetchDrivers });
  const { register, handleSubmit, reset, formState } = useForm<CreateDriverForm>();
  const { isSubmitting } = formState;
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (form) => {
    setError(null);
    setSuccess(null);
    try {
      const driverRes = await apiClient.post('/drivers', {
        name: form.name,
        licenseNumber: form.licenseNumber,
        licenseExpiry: form.licenseExpiry,
      });
      const driverId = driverRes.data?.id;
      if (!driverId) {
        throw new Error('No se obtuvo el ID del driver');
      }

      await apiClient.post('/users', {
        email: form.email,
        password: form.password,
        role: 'DRIVER',
        driverId,
      });

      setSuccess('Driver creado con acceso de login.');
      reset();
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al crear driver';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    }
  });

  return (
    <AppLayout>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Crear driver</h2>
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
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
            <div>
              <label className="text-sm text-gray-600">Correo electrónico (acceso app)</label>
              <input
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
                {...register('email', { required: true })}
                type="email"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Contraseña (acceso app)</label>
              <input
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
                {...register('password', { required: true, minLength: 6 })}
                type="password"
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear'}
            </Button>
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
                    <th className="py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((d) => (
                    <tr key={d.id} className="border-t">
                      <td className="py-2">{d.name}</td>
                      <td className="py-2">{d.licenseNumber || '-'}</td>
                      <td className="py-2">{d.licenseExpiry ? new Date(d.licenseExpiry).toLocaleDateString() : '-'}</td>
                      <td className="py-2 text-right">
                        <Button
                          variant="secondary"
                          onClick={async () => {
                            setError(null);
                            setSuccess(null);
                            try {
                              await apiClient.delete(`/drivers/${d.id}`);
                              queryClient.invalidateQueries({ queryKey: ['drivers'] });
                            } catch (err: any) {
                              const msg = err?.response?.data?.message || err?.message || 'Error al eliminar driver';
                              setError(Array.isArray(msg) ? msg.join(', ') : msg);
                            }
                          }}
                        >
                          Eliminar
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
