'use client';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Trophy } from 'lucide-react';

function ResetPasswordPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const { register, handleSubmit, watch } = useForm<{ password: string; confirm: string }>();

  const mutation = useMutation({
    mutationFn: (data: { password: string }) => api.post('/auth/reset-password', { token, ...data }),
    onSuccess: () => { toast.success('Password reset! Please sign in.'); router.push('/auth/login'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Reset failed'),
  });

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Invalid reset link. <Link href="/auth/forgot-password" className="text-primary-600 underline">Request a new one</Link></p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary-600 font-bold text-2xl">
            <Trophy className="w-7 h-7" /> WorldCup Tickets
          </Link>
          <h1 className="text-2xl font-black mt-4">Set new password</h1>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit(d => mutation.mutate({ password: d.password }))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input {...register('password', { required: true, minLength: 8 })} type="password" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input {...register('confirm', { validate: v => v === watch('password') || 'Passwords do not match' })} type="password" className="input" />
            </div>
            <button type="submit" disabled={mutation.isPending} className="w-full btn-primary py-3">
              {mutation.isPending ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading reset form...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
