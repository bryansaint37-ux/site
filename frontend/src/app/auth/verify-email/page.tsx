'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailPageContent() {
  const params = useSearchParams();
  const token = params.get('token');

  const { isLoading, isSuccess, isError } = useQuery({
    queryKey: ['verify-email', token],
    queryFn: () => api.get(`/auth/verify-email/${token}`),
    enabled: !!token,
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center py-10">
        {isLoading && <p className="text-gray-500">Verifying your email...</p>}
        {isSuccess && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Email Verified!</h2>
            <p className="text-gray-500 mb-6">Your account is now active. You can sign in.</p>
            <Link href="/auth/login" className="btn-primary">Sign In</Link>
          </>
        )}
        {isError && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Verification Failed</h2>
            <p className="text-gray-500 mb-6">The link is invalid or expired. Request a new one.</p>
            <Link href="/auth/login" className="btn-primary">Back to Login</Link>
          </>
        )}
        {!token && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-500">No verification token provided.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading verification status...</div>}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
