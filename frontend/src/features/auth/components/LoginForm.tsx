'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Lock, User, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginValues) => {
    setIsSubmitting(true);
    try {
      await login(data);
      toast.success('Access Granted. Welcome back, Sentinel.');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-xl">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">Sentinel Access</h2>
        <p className="mt-2 text-sm text-zinc-400">Secure entry to the Cloud Sentinel Platform</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300">Username</label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                {...register('username')}
                className={cn(
                  'block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-3 pl-10 pr-3 text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 sm:text-sm',
                  errors.username && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                )}
                placeholder="sentinel_one"
              />
            </div>
            {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300">Password</label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                {...register('password')}
                type="password"
                className={cn(
                  'block w-full rounded-lg border border-zinc-800 bg-zinc-950 py-3 pl-10 pr-3 text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 sm:text-sm',
                  errors.password && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                )}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative flex w-full justify-center rounded-lg border border-transparent bg-zinc-100 py-3 px-4 text-sm font-semibold text-zinc-950 transition-all hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Authorize Access'
          )}
        </button>
      </form>
    </div>
  );
}
