'use client';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Trophy } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm<{ email: string }>();

  const mutation = useMutation({
    mutationFn: (data: { email: string }) => api.post('/auth/forgot-password', data),
    onSuccess: () => toast.success('If that email exists, a reset link has been sent.'),
    onError: () => toast.error('Something went wrong'),
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary-600 font-bold text-2xl">
            <Trophy className="w-7 h-7" /> WorldCup Tickets
          </Link>
          <h1 className="text-2xl font-black mt-4">Reset your password</h1>
          <p className="text-gray-500 mt-1 text-sm">Enter your email and we&apos;ll send a reset link.</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input {...register('email', { required: true })} type="email" className="input" placeholder="you@example.com" />
            </div>
            <button type="submit" disabled={mutation.isPending} className="w-full btn-primary py-3">
              {mutation.isPending ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            <Link href="/auth/login" className="text-primary-600 hover:underline">← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
