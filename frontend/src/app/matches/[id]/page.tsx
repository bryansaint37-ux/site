'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, CheckCircle, ShoppingCart } from 'lucide-react';
import api from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import type { Match } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem, items, totalItems } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery<{ success: boolean; data: Match }>({
    queryKey: ['match', id],
    queryFn: () => api.get(`/matches/${id}`).then(r => r.data),
  });

  if (isLoading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-60 bg-gray-200 rounded-xl" />
        <div className="h-40 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );

  const match = data?.data;
  if (!match) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-500">Match not found</div>
    </div>
  );

  const handleAddToCart = (cat: Match['ticket_categories'][0]) => {
    if (!isAuthenticated()) { toast.error('Please log in to book tickets'); return; }
    if (cat.available_seats === 0) { toast.error('No seats available'); return; }
    const inCart = items.find(i => i.ticket_category_id === cat.id);
    if (inCart && inCart.quantity >= Math.min(10, cat.available_seats)) {
      toast.error('Maximum quantity reached'); return;
    }
    addItem({
      ticket_category_id: cat.id,
      match_id: match.id,
      category_name: cat.name,
      home_team: match.home_team.name,
      away_team: match.away_team.name,
      match_date: match.match_date,
      stadium: match.stadium.name,
      price: cat.price,
      section: cat.section,
    });
    toast.success(`${cat.name} added to cart`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Match Hero */}
        <div className="bg-gradient-to-r from-primary-900 to-primary-700 rounded-2xl text-white p-8 mb-6">
          <div className="text-center mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-200">
              {match.stage.replace(/_/g, ' ')}{match.group_name ? ` · Group ${match.group_name}` : ''}
            </span>
          </div>
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="text-center flex-1">
              <p className="text-3xl font-black">{match.home_team.name}</p>
              <p className="text-sm text-blue-200">{match.home_team.country_code}</p>
            </div>
            <div className="text-center px-6">
              <p className="text-5xl font-black text-yellow-400">VS</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-3xl font-black">{match.away_team.name}</p>
              <p className="text-sm text-blue-200">{match.away_team.country_code}</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-blue-100">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(match.match_date), 'EEE, MMM d, yyyy · h:mm a')}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {match.stadium.name}, {match.stadium.city}
            </span>
          </div>
        </div>

        {/* Stadium Info */}
        <div className="card mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-bold">{match.stadium.name}</h3>
            <p className="text-sm text-gray-500">{match.stadium.city}, {match.stadium.country}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" /> Capacity: {match.stadium.capacity.toLocaleString()}
          </div>
        </div>

        {/* Ticket Categories */}
        <h2 className="text-xl font-bold mb-4">Select Tickets</h2>
        {match.status === 'cancelled' ? (
          <div className="card text-center py-8 text-red-600 font-semibold">This match has been cancelled.</div>
        ) : match.status === 'completed' ? (
          <div className="card text-center py-8 text-gray-500">This match has ended.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {match.ticket_categories.map(cat => {
              const cartItem = items.find(i => i.ticket_category_id === cat.id);
              const soldOut = cat.available_seats === 0;
              return (
                <div key={cat.id} className={`card ${soldOut ? 'opacity-60' : ''}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{cat.name}</h3>
                      <span className="text-xs text-gray-500 font-medium">Section {cat.section}</span>
                    </div>
                    <span className="text-2xl font-black text-primary-600">${cat.price.toLocaleString()}</span>
                  </div>
                  {cat.description && <p className="text-sm text-gray-600 mb-3">{cat.description}</p>}
                  {cat.benefits?.map(b => (
                    <div key={b} className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                      <CheckCircle className="w-3 h-3 text-green-500" /> {b}
                    </div>
                  ))}
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                    <span className={`text-sm font-medium ${soldOut ? 'text-red-500' : cat.available_seats < 50 ? 'text-orange-500' : 'text-green-600'}`}>
                      {soldOut ? 'Sold Out' : `${cat.available_seats} available`}
                    </span>
                    <button
                      onClick={() => handleAddToCart(cat)}
                      disabled={soldOut}
                      className="flex items-center gap-2 btn-primary text-sm py-2 px-4"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {cartItem ? `In Cart (${cartItem.quantity})` : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalItems() > 0 && (
          <div className="fixed bottom-6 right-6">
            <Link href="/booking/cart" className="flex items-center gap-3 bg-primary-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-primary-700 font-bold transition-colors">
              <ShoppingCart className="w-5 h-5" />
              View Cart ({totalItems()} items)
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
