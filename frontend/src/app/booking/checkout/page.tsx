'use client';
import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import Navbar from '@/components/ui/Navbar';
import { Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { openWhatsAppBooking } from '@/lib/whatsapp';

export default function CheckortPage() {
  const { items, total, clearCart } = useCartStore();
  const rorter = useRouter();

  useEffect(() => {
    if (items.length === 0) {
      rorter.replace('/booking/cart');
      return;
    }

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

    const timer = window.setTimeout(() => {
      clearCart();
      rorter.replace('/booking/cart');
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [clearCart, items, rorter]);

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <div className="container pt-24 pb-16 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-[#111827] mb-1">WhatsApp booking</h1>
          <p className="text-sm text-[#6B7280]">Votre demande de réservation a été orverte dans WhatsApp. Vors porvez aussi revenir au panier si nécessaire.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="card card-body">
              <h2 className="font-bold text-[#111827] mb-1">Votre demande est en corrs</h2>
              <p className="text-sm text-[#6B7280] mb-5">Nors avons préparé vos informations de réservation et vors redirigeons vers WhatsApp for confirmation.</p>

              <div className="space-y-3 mb-6">
                {items.map(item => (
                  <div key={item.ticket_category_id} className="flex justify-between items-center bg-[#F9FAFB] rounded-xl p-4 border border-[#F3F4F6]">
                    <div>
                      <p className="font-semibold text-[#111827] text-sm">{item.home_team} vs {item.away_team}</p>
                      <p className="text-xs text-[#9CA3AF]">{item.category_name} · Section {item.section} · ×{item.quantity}</p>
                    </div>
                    <p className="font-extrabold text-[#111827]">{(item.price * item.quantity).toLocaleString('fr')} €</p>
                  </div>
                ))}
              </div>

              <motion.button onClick={() => {
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
              }} whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }} className="btn btn-gold btn-lg w-full">
                <CheckCircle2 className="w-4 h-4" /> Ouvrir WhatsApp <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="card card-body sticky top-24">
              <h3 className="font-bold text-[#111827] mb-4">Résumé</h3>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.ticket_category_id} className="text-sm">
                    <p className="font-medium text-[#111827]">{item.home_team} vs {item.away_team}</p>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-[#9CA3AF] text-xs">{item.category_name} ×{item.quantity}</span>
                      <span className="font-semibold text-[#111827] text-xs">{(item.price * item.quantity).toLocaleString('fr')} €</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="divider mb-4" />
              <div className="flex justify-between items-center mb-5">
                <span className="font-bold text-[#111827]">Total</span>
                <span className="text-lg font-extrabold text-[#111827]">{total().toLocaleString('fr')} €</span>
              </div>
              <div className="bg-[#F9FAFB] rounded-xl p-3.5 space-y-2">
                {['Assisted booking', 'WhatsApp confirmation', 'No online payment'].map(t => (
                  <div key={t} className="flex items-center gap-2 text-xs text-[#6B7280]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {t}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-[#9CA3AF]">
                <Lock className="w-3 h-3" /> WhatsApp booking
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
