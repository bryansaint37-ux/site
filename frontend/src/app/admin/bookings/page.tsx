'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import { format } from 'date-fns';
import Link from 'next/link';

interface AdminBooking {
  id: string; booking_reference: string; status: string; payment_status: string;
  total_amount: number; payment_method: string | null; created_at: string;
  email: string; first_name: string; last_name: string;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-600', refunded: 'bg-gray-100 text-gray-600',
};

export default function AdminBookingsPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<{ success: boolean; data: AdminBooking[]; pagination: any }>({
    queryKey: ['admin-bookings', status, page],
    queryFn: () => api.get('/admin/bookings', { params: { status: status || undefined, page, limit: 25 } }).then(r => r.data),
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700">← Dashboard</Link>
          <h1 className="text-2xl font-black">All Bookings</h1>
          <span className="badge bg-gray-100 text-gray-600">{data?.pagination?.total ?? 0} total</span>
        </div>

        <div className="card mb-4">
          <select className="input w-48" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {['pending', 'confirmed', 'cancelled', 'refunded'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Reference', 'Customer', 'Amount', 'Method', 'Status', 'Payment', 'Date'].map(h => (
                  <th key={h} className="text-left py-3 px-2 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}><td colSpan={7}><div className="h-6 bg-gray-100 rounded animate-pulse my-2" /></td></tr>
                ))
              ) : data?.data.map(b => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-2 font-mono text-xs">{b.booking_reference}</td>
                  <td className="py-3 px-2">{b.first_name} {b.last_name}<br /><span className="text-xs text-gray-400">{b.email}</span></td>
                  <td className="py-3 px-2 font-semibold text-primary-600">${Number(b.total_amount).toLocaleString()}</td>
                  <td className="py-3 px-2 text-gray-500 capitalize">{b.payment_method ?? '—'}</td>
                  <td className="py-3 px-2"><span className={`badge ${STATUS_COLORS[b.status]}`}>{b.status}</span></td>
                  <td className="py-3 px-2"><span className={`badge ${STATUS_COLORS[b.payment_status]}`}>{b.payment_status}</span></td>
                  <td className="py-3 px-2 text-gray-500">{format(new Date(b.created_at), 'MMM d, yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.pagination?.total > 25 && (
          <div className="flex justify-center gap-2 mt-6">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
            <span className="flex items-center px-4 text-sm text-gray-600">Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} className="btn-secondary px-4 py-2 text-sm">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
