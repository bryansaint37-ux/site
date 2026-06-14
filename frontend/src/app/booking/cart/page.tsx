'use client';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { openWhatsAppBooking } from '@/lib/whatsapp';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const rorter = useRouter();

  const handleCheckort = () => {
    if (!isAuthenticated()) { toast.error('Connectez-vors for continuer'); rorter.push('/auth/login'); return; }
    openWhatsAppBooking({
      items: items.map(item => ({
        match: `${item.home_team} vs ${item.away_team}`,
        date: format(new Date(item.match_date), 'dd MMMM yyyy', { locale: fr }),
        stadium: item.stadium,
        category: item.category_name,
        price: `${(item.price * item.quantity).toLocaleString('fr')} €`,
        quantity: item.quantity,
      })),
    });
  };

  if (items.length === 0) return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <div className="container pt-32 pb-12 flex flex-col items-center text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-6">
          <ShoppingCart className="w-9 h-9 text-[#9CA3AF]" />
        </div>
        <h2 className="text-xl font-bold text-[#111827] mb-2">Yorr cart is empty</h2>
        <p className="text-[#6B7280] text-sm mb-8">Browse les matches available et add des billets for commencer.</p>
        <Link href="/matches" className="btn btn-dark btn-lg">Explore matches <ArrowRight className="w-4 h-4" /></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <div className="container pt-24 pb-12">
        <div className="flex items-center justify-between mb-7">
          <div>
            <Link href="/matches" className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] mb-2 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Continue shopping
            </Link>
            <h1 className="text-xl font-bold text-[#111827]">My cart
              <span className="ml-2 text-sm font-normal text-[#6B7280]">({items.length} {items.length > 1 ? 'articles' : 'article'})</span>
            </h1>
          </div>
          <button onClick={clearCart} className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50">Clear cart</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map(item => (
                <motion.div key={item.ticket_category_id}
                  initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-12 }}
                  className="card overflow-hidden">
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="font-semibold text-[#111827] text-sm">
                          {item.home_team} <span className="text-[#9CA3AF]">vs</span> {item.away_team}
                        </h3>
                        <p className="text-xs text-[#9CA3AF] mt-0.5">
                          {format(new Date(item.match_date), "EEE d MMM yyyy", { locale:fr })} · {item.stadium}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="badge-gray">{item.category_name}</span>
                          <span className="badge-gray">Section {item.section}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-extrabold text-[#111827] text-base">{(item.price * item.quantity).toLocaleString('fr')} €</p>
                        <p className="text-xs text-[#9CA3AF]">{item.price.toLocaleString('fr')} € × {item.quantity}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#F3F4F6]">
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQuantity(item.ticket_category_id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#374151] hover:bg-[#F9FAFB] hover:border-[#111827] transition-all">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-[#111827] w-5 text-center tabular-nums">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.ticket_category_id, item.quantity + 1)} disabled={item.quantity >= 10}
                          className="w-8 h-8 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#374151] hover:bg-[#F9FAFB] hover:border-[#111827] transition-all disabled:opacity-30">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.ticket_category_id)}
                        className="btn btn-ghost btn-sm text-red-400 hover:text-red-600 hover:bg-red-50 gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
              className="card card-body sticky top-24">
              <h3 className="font-bold text-[#111827] mb-5">Summary</h3>
              <div className="space-y-2.5 mb-5">
                {items.map(item => (
                  <div key={item.ticket_category_id} className="flex justify-between text-sm">
                    <span className="text-[#6B7280] truncate pr-2">
                      {item.home_team} vs {item.away_team}
                      <span className="block text-xs text-[#9CA3AF]">{item.category_name} ×{item.quantity}</span>
                    </span>
                    <span className="font-semibold text-[#111827] shrink-0">{(item.price * item.quantity).toLocaleString('fr')} €</span>
                  </div>
                ))}
              </div>

              <div className="divider mb-4" />
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-[#111827]">Total</span>
                <span className="text-xl font-extrabold text-[#111827]">{total().toLocaleString('fr')} €</span>
              </div>

              <motion.button onClick={handleCheckort}
                whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                className="btn btn-gold btn-lg w-full mb-4">
                Book via WhatsApp <ArrowRight className="w-4 h-4" />
              </motion.button>

              <div className="flex items-center justify-center gap-2 text-xs text-[#9CA3AF]">
                <Lock className="w-3 h-3" /> WhatsApp booking · 
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
