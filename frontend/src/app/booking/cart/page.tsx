'use client';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleCheckout = () => {
    if (!isAuthenticated()) { toast.error('Please log in to checkout'); router.push('/auth/login'); return; }
    router.push('/booking/checkout');
  };

  if (items.length === 0) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Browse matches and add tickets to get started.</p>
        <Link href="/matches" className="btn-primary">Browse Matches</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black">Your Cart</h1>
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium">Clear All</button>
        </div>

        <div className="space-y-4 mb-6">
          {items.map(item => (
            <div key={item.ticket_category_id} className="card">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{item.home_team} vs {item.away_team}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {format(new Date(item.match_date), 'EEE, MMM d, yyyy · h:mm a')} · {item.stadium}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="badge bg-primary-50 text-primary-700">{item.category_name}</span>
                    <span className="badge bg-gray-100 text-gray-600">Section {item.section}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">${(item.price * item.quantity).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">${item.price.toLocaleString()} × {item.quantity}</p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.ticket_category_id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-semibold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.ticket_category_id, item.quantity + 1)}
                    disabled={item.quantity >= 10}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button onClick={() => removeItem(item.ticket_category_id)} className="text-red-500 hover:text-red-700 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card">
          <h3 className="font-bold text-lg mb-4">Order Summary</h3>
          {items.map(item => (
            <div key={item.ticket_category_id} className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{item.home_team} vs {item.away_team} · {item.category_name} ×{item.quantity}</span>
              <span>${(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary-600">${total().toLocaleString()}</span>
          </div>
          <button onClick={handleCheckout} className="w-full btn-primary mt-4 flex items-center justify-center gap-2 py-3">
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
