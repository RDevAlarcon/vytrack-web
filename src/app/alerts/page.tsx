'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { AppLayout } from '../../components/layout/AppLayout';
import { apiClient } from '../../lib/apiClient';
import { Button } from '../../components/ui/Button';

type AlertRule = { id: string; name: string; type: string; active: boolean };
type AlertEvent = { id: string; type: string; status: string; occurredAt: string; vehicle?: { plate: string }; alertRule?: { name: string } };

async function fetchRules() {
  const res = await apiClient.get('/alerts/rules');
  return res.data as AlertRule[];
}
async function fetchEvents() {
  const res = await apiClient.get('/alerts/events');
  return res.data as AlertEvent[];
}

type CreateRuleForm = {
  name: string;
  type: string;
  threshold?: string;
};

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const rules = useQuery({ queryKey: ['alert-rules'], queryFn: fetchRules });
  const events = useQuery({ queryKey: ['alert-events'], queryFn: fetchEvents });
  const { register, handleSubmit, reset } = useForm<CreateRuleForm>();

  const onSubmit = handleSubmit(async (form) => {
    let threshold: any = {};
    try {
      threshold = form.threshold ? JSON.parse(form.threshold) : {};
    } catch (e) {
      threshold = {};
    }
    await apiClient.post('/alerts/rules', { name: form.name, type: form.type, threshold });
    reset();
    queryClient.invalidateQueries({ queryKey: ['alert-rules'] });
  });

  const resolveEvent = async (id: string) => {
    await apiClient.patch(`/alerts/events/${id}/status`, { status: 'RESOLVED' });
    queryClient.invalidateQueries({ queryKey: ['alert-events'] });
  };

  return (
    <AppLayout>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Reglas</h2>
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-sm text-gray-600">Nombre</label>
              <input className="mt-1 w-full rounded border px-3 py-2 text-sm" {...register('name', { required: true })} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Tipo</label>
              <select className="mt-1 w-full rounded border px-3 py-2 text-sm" {...register('type', { required: true })}>
                <option value="SPEED">SPEED</option>
                <option value="GEOFENCE">GEOFENCE</option>
                <option value="IDLE">IDLE</option>
                <option value="DISCONNECT">DISCONNECT</option>
                <option value="NO_SIGNAL">NO_SIGNAL</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Threshold (JSON)</label>
              <input className="mt-1 w-full rounded border px-3 py-2 text-sm" placeholder='{"kmh":90}' {...register('threshold')} />
            </div>
            <Button type="submit">Crear regla</Button>
          </form>
          <div className="mt-4 space-y-2">
            {rules.data?.map((r) => (
              <div key={r.id} className="rounded border p-2">
                <div className="text-sm font-semibold">{r.name}</div>
                <div className="text-xs text-gray-500">{r.type}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Eventos</h2>
          {events.isLoading ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : (
            <div className="mt-3 space-y-2">
              {events.data?.map((e) => (
                <div key={e.id} className="rounded border p-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{e.alertRule?.name || e.type}</div>
                    <span className="text-xs text-gray-500">{new Date(e.occurredAt).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-500">Vehículo: {e.vehicle?.plate || '-'}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Status: {e.status}</span>
                    {e.status === 'OPEN' && (
                      <Button type="button" className="bg-green-600 hover:bg-green-700" onClick={() => resolveEvent(e.id)}>
                        Resolver
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
