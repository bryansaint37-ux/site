'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Download, X, Ticket, Calendar, CreditCard, Settings,
  Bell, Heart, LogOut, ChevronRight, Package, LayoutDashboard,
} from 'lucide-react';
import type { Booking } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const STATUS_BADGE: Record<string, string> = {
  confirmed: 'badge-green', pending: 'badge-amber', cancelled: 'badge-red', refunded: 'badge-gray',
};
const STATUS_FR:   Record<string, string> = { confirmed:'Confirmé', pending:'En attente', cancelled:'Annulé', refunded:'Remboursé' };
const PAY_BADGE:   Record<string, string> = { paid:'badge-green', pending:'badge-amber', failed:'badge-red', refunded:'badge-gray' };
const PAY_FR:      Record<string, string> = { paid:'Payé', pending:'En attente', failed:'Échoué', refunded:'Remboursé' };

const TABS = [
  { key:'bookings',  label:'Mes billets',   Icon:Ticket         },
  { key:'orders',    label:'Commandes',     Icon:Package        },
  { key:'favorites', label:'Favoris',       Icon:Heart          },
  { key:'settings',  label:'Paramètres',    Icon:Settings       },
  { key:'notifs',    label:'Notifications', Icon:Bell, badge:3  },
];

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [tab, setTab] = useState('bookings');

  const { data, isLoading } = useQuery<{ success: boolean; data: Booking[] }>({
    queryKey: ['my-bookings'],
    queryFn: () => api.get('/bookings').then(r => r.data),
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => api.patch(`/bookings/${id}/cancel`),
    onSuccess: () => { toast.success('Réservation annulée'); qc.invalidateQueries({ queryKey: ['my-bookings'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || "Échec de l'annulation"),
  });

  const handleLogout = async () => {
    await api.post('/auth/logout', { refreshToken: useAuthStore.getState().refreshToken }).catch(() => null);
    logout(); router.push('/');
  };

  const bookings = data?.data ?? [];
  const paid = bookings.filter(b => b.payment_status === 'paid');

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <div className="container-app pt-24 pb-12">
        <div className="flex flex-col lg:flex-row gap-7">

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-64 shrink-0">
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
              className="card card-p sticky top-24">
              {/* Avatar */}
              <div className="flex items-center gap-3 pb-5 border-b border-[#F3F4F6] mb-3">
                <div className="w-11 h-11 rounded-full bg-[#111827] flex items-center justify-center text-white font-bold text-base shrink-0">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#111827] text-sm truncate">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-[#9CA3AF] truncate">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-0.5">
                {TABS.map(({ key, label, Icon, badge }) => (
                  <button key={key} onClick={() => setTab(key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      tab === key ? 'bg-[#111827] text-white' : 'text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827]'
                    }`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left">{label}</span>
                    {badge && (
                      <span className={`text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                        tab === key ? 'bg-white/20 text-white' : 'bg-[#FEF9E7] text-[#92750C]'
                      }`}>{badge}</span>
                    )}
                  </button>
                ))}
                <div className="pt-3 mt-3 border-t border-[#F3F4F6]">
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" /> Déconnexion
                  </button>
                </div>
              </nav>
            </motion.div>
          </aside>

          {/* ── Main ── */}
          <main className="flex-1 min-w-0">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="heading-md">{TABS.find(t => t.key === tab)?.label}</h1>
                  <p className="body-sm mt-0.5">Bonjour {user?.first_name}, bienvenue.</p>
                </div>
                <Link href="/matches" className="btn-gold btn-sm hidden sm:flex">
                  <Ticket className="w-3.5 h-3.5" /> Acheter des billets
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
                {[
                  { label:'Réservations',    val: bookings.length,                                                     Icon:Package,   bg:'bg-blue-50   text-blue-600'   },
                  { label:'Confirmés',       val: bookings.filter(b => b.status==='confirmed').length,                 Icon:Ticket,    bg:'bg-emerald-50 text-emerald-600' },
                  { label:'En attente',      val: bookings.filter(b => b.status==='pending').length,                   Icon:Calendar,  bg:'bg-amber-50  text-amber-600'   },
                  { label:'Total dépensé',   val: paid.reduce((s,b)=>s+b.total_amount,0).toLocaleString('fr')+' €',   Icon:CreditCard,bg:'bg-purple-50 text-purple-600'  },
                ].map(({ label, val, Icon, bg }) => (
                  <div key={label} className="card card-p py-4 px-5">
                    <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-xl font-extrabold text-[#111827]">{val}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Bookings tab */}
              {tab === 'bookings' && (
                isLoading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-36 card animate-pulse" />)}
                  </div>
                ) : !bookings.length ? (
                  <div className="card card-p text-center py-20">
                    <div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center mx-auto mb-4">
                      <Ticket className="w-8 h-8 text-[#9CA3AF]" />
                    </div>
                    <h3 className="font-semibold text-[#111827] mb-2">Aucun billet pour le moment</h3>
                    <p className="body-sm mb-6">Explorez les matchs disponibles et réservez votre place.</p>
                    <Link href="/matches" className="btn-dark btn-md mx-auto">
                      Voir les matchs <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map(b => (
                      <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="card overflow-hidden">
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                              <p className="text-[11px] text-[#9CA3AF] font-mono">#{b.booking_reference}</p>
                              <p className="text-xs text-[#6B7280] mt-0.5">
                                {format(new Date(b.created_at), "d MMM yyyy · HH'h'mm", { locale: fr })}
                              </p>
                            </div>
                            <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                              <span className={STATUS_BADGE[b.status]}>{STATUS_FR[b.status]}</span>
                              <span className={PAY_BADGE[b.payment_status]}>{PAY_FR[b.payment_status]}</span>
                            </div>
                          </div>

                          {b.items?.map(item => (
                            <div key={item.id} className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl p-3.5 mb-2">
                              <p className="font-semibold text-[#111827] text-sm">
                                {item.match.home_team} — {item.match.away_team}
                              </p>
                              <p className="text-xs text-[#9CA3AF] mt-0.5">
                                {format(new Date(item.match.match_date), "EEE d MMM yyyy", { locale: fr })} · {item.match.stadium}
                              </p>
                              <p className="text-xs text-[#6B7280] mt-1">
                                {item.category.name} × {item.quantity} — {item.subtotal.toLocaleString('fr')} €
                              </p>
                            </div>
                          ))}

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F3F4F6]">
                            <span className="font-extrabold text-[#111827]">
                              {b.total_amount.toLocaleString('fr')} €
                            </span>
                            <div className="flex gap-2">
                              {b.payment_status === 'paid' && (
                                <a href={`${process.env.NEXT_PUBLIC_API_URL}/tickets/booking/${b.id}`}
                                  className="btn-outline btn-sm gap-1.5 text-xs">
                                  <Download className="w-3.5 h-3.5" /> Télécharger
                                </a>
                              )}
                              {['pending','confirmed'].includes(b.status) && (
                                <button onClick={() => cancelMut.mutate(b.id)} disabled={cancelMut.isPending}
                                  className="btn-danger btn-sm gap-1.5 text-xs">
                                  <X className="w-3.5 h-3.5" /> Annuler
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )
              )}

              {tab !== 'bookings' && (
                <div className="card card-p text-center py-20">
                  <LayoutDashboard className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
                  <p className="body-sm">Cette section sera disponible prochainement.</p>
                </div>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
