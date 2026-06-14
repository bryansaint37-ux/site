'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Ticket } from '@/types';

function BookingSuccessPageContent() {
  const params = useSearchParams();
  const bookingId = params.get('booking');

  const { data: ticketsData, isLoading } = useQuery<{ success: boolean; data: Ticket[] }>({
    queryKey: ['tickets', bookingId],
    queryFn: () => api.get(`/tickets/booking/${bookingId}`).then(r => r.data),
    enabled: !!bookingId,
    retry: 5,
    retryDelay: 2000,
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-500 mb-8">Your tickets have been sent to your email. Check your inbox for the PDF ticket.</p>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-3 mb-8 text-left">
            {ticketsData?.data.map(ticket => (
              <div key={ticket.id} className="card flex justify-between items-center">
                <div>
                  <p className="font-bold">{ticket.home_team} vs {ticket.away_team}</p>
                  <p className="text-sm text-gray-500">{ticket.category_name} · Seat {ticket.seat_number}</p>
                  <p className="text-xs text-gray-400 font-mono">{ticket.ticket_number}</p>
                </div>
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL}/tickets/${ticket.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 btn-primary text-sm py-2 px-4"
                >
                  <Download className="w-4 h-4" /> PDF
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard" className="btn-primary flex items-center gap-2 justify-center">
            My Bookings <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/matches" className="btn-secondary">Browse More Matches</Link>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading booking details...</div>}>
      <BookingSuccessPageContent />
    </Suspense>
  );
}
