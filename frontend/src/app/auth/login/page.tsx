import LoginForm from '@/features/auth/components/LoginForm';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="mb-8 flex flex-col items-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 shadow-xl shadow-zinc-100/10">
          <Shield className="h-10 w-10 text-zinc-950" />
        </div>
        <h1 className="text-2xl font-bold text-white">Cloud Sentinel</h1>
      </div>
      
      <LoginForm />
      
      <div className="mt-8 text-center text-sm text-zinc-500">
        <p>&copy; 2026 Cloud Sentinel Platform. All rights reserved.</p>
        <p className="mt-1 font-mono uppercase tracking-widest text-zinc-700">Security Clearance Level 3 Required</p>
      </div>
    </div>
  );
}
