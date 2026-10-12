'use client';

import { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { authApi } from '../api';
import type { RegisterCredentials } from '../types';

const registrationSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Use at least 3 characters.')
      .max(50, 'Use no more than 50 characters.'),
    email: z.string().email('Enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Use at least 8 characters.')
      .max(72, 'Use no more than 72 characters.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

type RegistrationValues = z.infer<typeof registrationSchema>;

function registrationError(error: unknown): string {
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 400) {
    return 'That username or email is already registered. Try signing in or use different details.';
  }
  if (status === 422) {
    return 'Check the username, email, and password requirements, then try again.';
  }
  if (!status) {
    return 'Unable to reach the registration service. Check your connection and try again.';
  }
  return 'Registration could not be completed. Please try again.';
}

export default function RegisterForm() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationValues>({ resolver: zodResolver(registrationSchema) });

  const onSubmit = async ({ username, email, password }: RegistrationValues) => {
    setErrorMessage(null);
    try {
      const payload: RegisterCredentials = { username, email, password };
      await authApi.register(payload);
      setRegistered(true);
    } catch (error) {
      setErrorMessage(registrationError(error));
    }
  };

  return (
    <section className="w-full max-w-md space-y-7 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-2xl shadow-black/20 sm:p-8">
      <header className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">Create your account</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Register a viewer account for the Cloud Sentinel platform.
        </p>
      </header>

      {registered ? (
        <div className="space-y-4 text-center" role="status">
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            Registration complete. Sign in to continue.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-zinc-100 px-5 text-sm font-semibold text-zinc-950 hover:bg-white focus:ring-2 focus:ring-zinc-300 focus:outline-none"
          >
            Continue to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div>
            <label htmlFor="register-username" className="block text-sm font-medium text-zinc-300">
              Username{' '}
              <span aria-hidden="true" className="text-amber-300">
                *
              </span>
            </label>
            <div className="relative mt-1.5">
              <User
                className="pointer-events-none absolute top-3 left-3 h-5 w-5 text-zinc-500"
                aria-hidden="true"
              />
              <input
                id="register-username"
                autoComplete="username"
                required
                maxLength={50}
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? 'register-username-error' : undefined}
                {...register('username')}
                className="block min-h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2.5 pr-3 pl-11 text-zinc-100 placeholder-zinc-600 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-500/40 aria-[invalid=true]:border-red-500"
              />
            </div>
            {errors.username && (
              <p id="register-username-error" className="mt-1 text-sm text-red-300">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-zinc-300">
              Email{' '}
              <span aria-hidden="true" className="text-amber-300">
                *
              </span>
            </label>
            <div className="relative mt-1.5">
              <Mail
                className="pointer-events-none absolute top-3 left-3 h-5 w-5 text-zinc-500"
                aria-hidden="true"
              />
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'register-email-error' : undefined}
                {...register('email')}
                className="block min-h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2.5 pr-3 pl-11 text-zinc-100 placeholder-zinc-600 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-500/40 aria-[invalid=true]:border-red-500"
              />
            </div>
            {errors.email && (
              <p id="register-email-error" className="mt-1 text-sm text-red-300">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-zinc-300">
              Password{' '}
              <span aria-hidden="true" className="text-amber-300">
                *
              </span>
            </label>
            <div className="relative mt-1.5">
              <Lock
                className="pointer-events-none absolute top-3 left-3 h-5 w-5 text-zinc-500"
                aria-hidden="true"
              />
              <input
                id="register-password"
                type={passwordVisible ? 'text' : 'password'}
                autoComplete="new-password"
                required
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? 'register-password-error' : 'register-password-help'
                }
                {...register('password')}
                className="block min-h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2.5 pr-12 pl-11 text-zinc-100 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-500/40 aria-[invalid=true]:border-red-500"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible((visible) => !visible)}
                aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                aria-pressed={passwordVisible}
                className="absolute inset-y-0 right-0 flex min-h-11 w-11 items-center justify-center rounded-r-lg text-zinc-400 hover:text-white focus:ring-2 focus:ring-zinc-400 focus:outline-none focus:ring-inset"
              >
                {passwordVisible ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password ? (
              <p id="register-password-error" className="mt-1 text-sm text-red-300">
                {errors.password.message}
              </p>
            ) : (
              <p id="register-password-help" className="mt-1 text-xs text-zinc-500">
                Use at least 8 characters.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="register-confirm-password"
              className="block text-sm font-medium text-zinc-300"
            >
              Confirm password{' '}
              <span aria-hidden="true" className="text-amber-300">
                *
              </span>
            </label>
            <input
              id="register-confirm-password"
              type={passwordVisible ? 'text' : 'password'}
              autoComplete="new-password"
              required
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword ? 'register-confirm-password-error' : undefined
              }
              {...register('confirmPassword')}
              className="mt-1.5 block min-h-11 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-500/40 aria-[invalid=true]:border-red-500"
            />
            {errors.confirmPassword && (
              <p id="register-confirm-password-error" className="mt-1 text-sm text-red-300">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {errorMessage && (
            <p
              className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-white focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Creating account…
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>
      )}

      {!registered && (
        <p className="border-t border-zinc-800 pt-5 text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-medium text-zinc-100 underline decoration-zinc-600 underline-offset-4 hover:text-white focus:ring-2 focus:ring-zinc-400 focus:outline-none"
          >
            Sign in
          </Link>
        </p>
      )}
    </section>
  );
}
