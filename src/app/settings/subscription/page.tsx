'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { AppLayout } from '../../../components/layout/AppLayout';
import { apiClient } from '../../../lib/apiClient';
import { Button } from '../../../components/ui/Button';

type Plan = { id: string; name: string; tier: string; maxVehicles: number; maxUsers: number; price: string };
type CompanySub = { id: string; plan: Plan };

async function fetchCurrent() {
  const res = await apiClient.get('/subscriptions/company/current');
  return res.data as CompanySub;
}

async function fetchPlans() {
  const res = await apiClient.get('/subscriptions/plans');
  return res.data as Plan[];
}

type ChangePlanForm = { planId: string };

export default function SubscriptionPage() {
  const queryClient = useQueryClient();
  const current = useQuery({ queryKey: ['sub-current'], queryFn: fetchCurrent });
  const plans = useQuery({ queryKey: ['sub-plans'], queryFn: fetchPlans });
  const { register, handleSubmit } = useForm<ChangePlanForm>();

  const onSubmit = handleSubmit(async (form) => {
    await apiClient.patch('/subscriptions/company/current', { planId: form.planId });
    queryClient.invalidateQueries({ queryKey: ['sub-current'] });
  });

  return (
    <AppLayout>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Suscripción actual</h2>
          {current.isLoading ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : current.data ? (
            <div className="mt-2">
              <div className="text-sm text-gray-700">{current.data.plan.name}</div>
              <div className="text-xs text-gray-500">
                Tier: {current.data.plan.tier} | Vehicles: {current.data.plan.maxVehicles} | Users: {current.data.plan.maxUsers} | Price:{' '}
                {current.data.plan.price}
              </div>
            </div>
          ) : (
            <p className="text-sm text-red-600">Sin suscripción activa</p>
          )}
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Cambiar plan</h2>
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <div>
              <label className="text-sm text-gray-600">Plan</label>
              <select className="mt-1 w-full rounded border px-3 py-2 text-sm" {...register('planId', { required: true })}>
                <option value="">Selecciona</option>
                {plans.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.tier})
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">Actualizar</Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
