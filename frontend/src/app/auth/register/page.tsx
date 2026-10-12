import { Shield } from 'lucide-react';
import RegisterForm from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-10">
      <div className="mb-8 flex flex-col items-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 shadow-xl shadow-zinc-100/10">
          <Shield className="h-10 w-10 text-zinc-950" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-white">Cloud Sentinel</h1>
      </div>

      <RegisterForm />

      <p className="mt-8 text-center text-sm text-zinc-500">
        &copy; 2026 Cloud Sentinel Platform. All rights reserved.
      </p>
    </main>
  );
}
