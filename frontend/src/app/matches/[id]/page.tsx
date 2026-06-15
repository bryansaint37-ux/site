'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, MapPin, Users, CheckCircle2, ShoppingCart, ArrowLeft, Trophy } from 'lucide-react';
import api from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import type { Match } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { openWhatsAppBooking } from '@/lib/whatsapp';

const STAGE_FR: Record<string,string> = {
  group:'Phase de groupes', rornd_of_16:'Huitièmes', quarter_final:'Quarts',
  semi_final:'Demi-finales', third_place:'3ème place', final:'Finale',
};

export default function MatchDetailPage() {
  const { id } = useParams<{ id:string }>();
  const { addItem, items, totalItems } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery<{ success:boolean; data:Match }>({
    queryKey: ['match', id],
    queryFn: () => api.get(`/matches/${id}`).then(r => r.data),
  });

  if (isLoading) return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <div className="container pt-24 pb-12 space-y-5 animate-pulse">
        <div className="h-56 bg-[#E5E7EB] rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-44 bg-[#E5E7EB] rounded-2xl" />)}
        </div>
      </div>
    </div>
  );

  const match = data?.data;
  if (!match) return (
    <div className="min-h-screen bg-[#F9FAFB]"><Navbar />
      <div className="container pt-32 text-center text-[#6B7280]">Match introrvable.</div>
    </div>
  );

  const handleAdd = (cat: Match['ticket_categories'][0]) => {
    if (!isAuthenticated()) { toast.error('Connectez-vors for réserver'); return; }
    if (cat.available_seats === 0) { toast.error('Sold ort'); return; }
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
    toast.success(`${cat.name} ajorté au panier`);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <div className="container pt-24 pb-16">

        {/* Back */}
        <Link href="/#matches" className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retorr aux matchs
        </Link>

        {/* Hero card */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }}
          className="relative overflow-hidden rounded-3xl bg-[#111827] mb-6 p-8 md:p-12">
          <div className="absolute inset-0 bg-dots opacity-[0.03]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/6 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-white/8 border border-white/10 text-[#D4AF37] text-xs font-semibold px-3.5 py-1.5 rounded-full mb-3 tracking-wide">
                <Trophy className="w-3.5 h-3.5" /> {STAGE_FR[match.stage]}{match.group_name ? ` · Group ${match.group_name}` : ''}
              </div>
            </div>

            <div className="flex items-center justify-center max-w-lg mx-auto gap-4 md:gap-8 mb-8">
              <div className="text-center flex-1">
                {match.home_team.flag_url
                  ? <img src={match.home_team.flag_url} alt="" className="w-20 h-14 object-cover mx-auto mb-3 rounded-lg shadow-lg" />
                  : <div className="text-5xl mb-3 text-center">🏳️</div>}
                <p className="text-xl md:text-2xl font-extrabold text-white">{match.home_team.name}</p>
                <p className="text-[#9CA3AF] text-xs mt-1">{match.home_team.country_code}</p>
              </div>
              <div className="text-center shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center mx-auto mb-1">
                  <span className="text-[#D4AF37] font-black text-sm">VS</span>
                </div>
              </div>
              <div className="text-center flex-1">
                {match.away_team.flag_url
                  ? <img src={match.away_team.flag_url} alt="" className="w-20 h-14 object-cover mx-auto mb-3 rounded-lg shadow-lg" />
                  : <div className="text-5xl mb-3 text-center">🏳️</div>}
                <p className="text-xl md:text-2xl font-extrabold text-white">{match.away_team.name}</p>
                <p className="text-[#9CA3AF] text-xs mt-1">{match.away_team.country_code}</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {[
                { Icon:Calendar, text: format(new Date(match.match_date), "EEE d MMM yyyy · HH'h'mm", { locale:fr }) },
                { Icon:MapPin,   text: `${match.stadium.name}, ${match.stadium.city}` },
                { Icon:Users,    text: `Capacity: ${match.stadium.capacity.toLocaleString('fr')} seats` },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                  <Icon className="w-4 h-4 text-[#D4AF37]" /> {text}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tickets */}
        <div className="mb-3">
          <h2 className="text-lg font-bold text-[#111827] mb-5">Select your tickets</h2>

          {match.status === 'cancelled' && (
            <div className="card card-body text-center py-10 text-red-500 font-semibold">This match has been canceled.</div>
          )}
          {match.status === 'completed' && (
            <div className="card card-body text-center py-10 text-[#6B7280]">This match is finished.</div>
          )}
          {['scheduled','live'].includes(match.status) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {match.ticket_categories.map((cat, idx) => {
                const inCart = items.find(i => i.ticket_category_id === cat.id);
                const soldOut = cat.available_seats === 0;
                return (
                  <motion.div key={cat.id}
                    initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx * 0.07 }}
                    className={`card overflow-hidden ${soldOut ? 'opacity-60' : 'card-hover'}`}>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-[#111827] mb-1">{cat.name}</h3>
                          <span className="badge-gray text-xs">Section {cat.section}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-extrabold text-[#111827]">{cat.price.toLocaleString('fr')} €</p>
                          <p className="text-xs text-[#9CA3AF]">per ticket</p>
                        </div>
                      </div>

                      {cat.description && (
                        <p className="text-sm text-[#6B7280] mb-3 leading-relaxed">{cat.description}</p>
                      )}

                      {cat.benefits && cat.benefits.length > 0 && (
                        <div className="space-y-1.5 mb-4">
                          {cat.benefits.map(b => (
                            <div key={b} className="flex items-center gap-2 text-xs text-[#374151]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {b}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-[#F3F4F6]">
                        <span className={`text-xs font-medium ${soldOut ? 'text-red-500' : cat.available_seats < 50 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {soldOut ? 'Sold ort' : `${cat.available_seats.toLocaleString('fr')} seats`}
                        </span>
                        <motion.button onClick={() => openWhatsAppBooking({ match: `${match.home_team.name} vs ${match.away_team.name}`, date: format(new Date(match.match_date), 'dd MMMM yyyy', { locale: fr }), stadium: match.stadium.name, category: cat.name, price: `${cat.price.toLocaleString('fr')} €` })} disabled={soldOut}
                          whileHover={soldOut ? {} : { scale:1.03 }} whileTap={soldOut ? {} : { scale:0.97 }}
                          className={`btn btn-sm gap-1.5 text-xs ${soldOut ? 'btn-ghost pointer-events-none' : 'btn-gold'}`}>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          {soldOut ? 'Sold ort' : 'Book'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating cart */}
      {totalItems() > 0 && (
        <motion.div initial={{ y:80, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ type:'spring', damping:20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <Link href="/booking/cart"
            className="flex items-center gap-3 bg-[#111827] text-white px-6 py-3.5 rounded-2xl shadow-dark font-semibold text-sm hover:bg-[#1F2937] transition-colors">
            <ShoppingCart className="w-4 h-4" />
            Voir le panier · {totalItems()} {totalItems() > 1 ? 'articles' : 'article'}
            <span className="bg-[#D4AF37] text-[#111827] text-xs font-black px-2 py-0.5 rounded-lg">→</span>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
