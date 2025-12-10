// src/app/login/page.tsx
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../lib/apiClient';
import { setToken, getToken } from '../../lib/auth';
import { Button } from '../../components/ui/Button';

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<LoginForm>();

  useEffect(() => {
    const token = getToken();
    if (token) {
      router.replace('/');
    }
  }, [router]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await apiClient.post('/auth/login', data);
      setToken(res.data.accessToken);
      router.replace('/');
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow">
        <h1 className="text-xl font-semibold text-gray-800">Iniciar sesión</h1>
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
            {...register('email', { required: true })}
          />
          {errors.email && <p className="text-xs text-red-600">Requerido</p>}
        </div>
        <div>
          <label className="text-sm text-gray-600">Password</label>
          <input
            type="password"
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
            {...register('password', { required: true })}
          />
          {errors.password && <p className="text-xs text-red-600">Requerido</p>}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </form>
    </div>
  );
}
