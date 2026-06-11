'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import { format } from 'date-fns';
import { Download, X, Ticket } from 'lucide-react';
import type { Booking } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-600', refunded: 'bg-gray-100 text-gray-600',
};

const PAYMENT_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-600', refunded: 'bg-gray-100 text-gray-600',
};

export default function DashboardPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<{ success: boolean; data: Booking[] }>({
    queryKey: ['my-bookings'],
    queryFn: () => api.get('/bookings').then(r => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/bookings/${id}/cancel`),
    onSuccess: () => { toast.success('Booking cancelled'); qc.invalidateQueries({ queryKey: ['my-bookings'] }); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to cancel'),
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black mb-6">My Bookings</h1>

        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />)}</div>
        ) : !data?.data.length ? (
          <div className="card text-center py-16">
            <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold mb-4">No bookings yet</p>
            <Link href="/matches" className="btn-primary">Browse Matches</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data.data.map(booking => (
              <div key={booking.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-gray-400 font-mono">REF: {booking.booking_reference}</p>
                    <p className="text-sm text-gray-500">{format(new Date(booking.created_at), 'MMM d, yyyy · h:mm a')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${STATUS_COLORS[booking.status]}`}>{booking.status}</span>
                    <span className={`badge ${PAYMENT_COLORS[booking.payment_status]}`}>{booking.payment_status}</span>
                  </div>
                </div>

                {booking.items?.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3 mb-2">
                    <p className="font-semibold text-sm">{item.match.home_team} vs {item.match.away_team}</p>
                    <p className="text-xs text-gray-500">{format(new Date(item.match.match_date), 'EEE, MMM d, yyyy')} · {item.match.stadium}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.category.name} ×{item.quantity} — ${item.subtotal.toLocaleString()}</p>
                  </div>
                ))}

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <span className="font-bold text-primary-600">${booking.total_amount.toLocaleString()}</span>
                  <div className="flex gap-2">
                    {booking.payment_status === 'paid' && (
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}/tickets/booking/${booking.id}`}
                        className="flex items-center gap-1.5 btn-secondary text-sm py-1.5 px-3"
                      >
                        <Download className="w-3.5 h-3.5" /> Tickets
                      </a>
                    )}
                    {['pending', 'confirmed'].includes(booking.status) && (
                      <button
                        onClick={() => cancelMutation.mutate(booking.id)}
                        disabled={cancelMutation.isPending}
                        className="flex items-center gap-1.5 text-red-600 hover:bg-red-50 border border-red-200 text-sm py-1.5 px-3 rounded-lg transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
