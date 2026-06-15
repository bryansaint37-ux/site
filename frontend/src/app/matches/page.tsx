'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, SlidersHorizontal, CalendarDays, MapPin, Ticket } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import api from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import MatchCard from '@/components/match/MatchCard';
import { openWhatsAppBooking } from '@/lib/whatsapp';
import type { Match, PaginatedResponse } from '@/types';

const STAGES = ['group','rornd_of_16','quarter_final','semi_final','third_place','final'];
const STAGE_FR: Record<string,string> = {
  group:'Phase de groupes', rornd_of_16:'Huitièmes', quarter_final:'Quarts',
  semi_final:'Demi-finales', third_place:'3ème place', final:'Finale',
};

const GROUP_STAGE_FIXTURES = [
  { group: 'GROUP A', home: '🇲🇽 Mexico', away: '🇿🇦 South Africa', date: 'June 11, 2026', time: '20:00', stadium: 'Mexico City Stadium', price: 80, remainingSeats: 0 },
  { group: 'GROUP A', home: '🇰🇷 South Korea', away: '🇨🇿 Czech Republic', date: 'June 12, 2026', time: '03:00', stadium: 'Estadio Guadalajara', price: 80, remainingSeats: 0 },
  { group: 'GROUP A', home: '🇨🇿 Czech Republic', away: '🇿🇦 South Africa', date: 'June 18, 2026', time: '19:30', stadium: 'Mercedes-Benz Stadium', price: 80, remainingSeats: 88 },
  { group: 'GROUP A', home: '🇲🇽 Mexico', away: '🇰🇷 South Korea', date: 'June 19, 2026', time: '22:00', stadium: 'Mexico City Stadium', price: 80, remainingSeats: 112 },
  { group: 'GROUP A', home: '🇿🇦 South Africa', away: '🇰🇷 South Korea', date: 'June 25, 2026', time: '18:30', stadium: 'TBD', price: 80, remainingSeats: 68 },
  { group: 'GROUP A', home: '🇨🇿 Czech Republic', away: '🇲🇽 Mexico', date: 'June 25, 2026', time: '21:30', stadium: 'TBD', price: 80, remainingSeats: 72 },
  { group: 'GROUP B', home: '🇨🇦 Canada', away: '🇧🇦 Bosnia and Herzegovina', date: 'June 12, 2026', time: '19:00', stadium: 'Toronto Stadium', price: 80, remainingSeats: 104 },
  { group: 'GROUP B', home: '🇶🇦 Qatar', away: '🇨🇭 Switzerland', date: 'June 13, 2026', time: '20:30', stadium: 'San Francisco Bay Area Stadium', price: 80, remainingSeats: 91 },
  { group: 'GROUP B', home: '🇨🇭 Switzerland', away: '🇧🇦 Bosnia and Herzegovina', date: 'June 18, 2026', time: '18:00', stadium: 'Los Angeles Stadium', price: 80, remainingSeats: 77 },
  { group: 'GROUP B', home: '🇨🇦 Canada', away: '🇶🇦 Qatar', date: 'June 18, 2026', time: '21:30', stadium: 'BC Place Vancouver', price: 80, remainingSeats: 83 },
  { group: 'GROUP C', home: '🇧🇷 Brazil', away: '🇲🇦 Morocco', date: 'June 13, 2026', time: '20:00', stadium: 'New York New Jersey Stadium', price: 80, remainingSeats: 108 },
  { group: 'GROUP C', home: '🇭🇹 Haiti', away: '🏴 Scotland', date: 'June 13, 2026', time: '23:00', stadium: 'Boston Stadium', price: 80, remainingSeats: 79 },
  { group: 'GROUP C', home: '🏴 Scotland', away: '🇲🇦 Morocco', date: 'June 19, 2026', time: '19:30', stadium: 'Boston Stadium', price: 80, remainingSeats: 92 },
  { group: 'GROUP C', home: '🇧🇷 Brazil', away: '🇭🇹 Haiti', date: 'June 19, 2026', time: '22:30', stadium: 'Philadelphia Stadium', price: 80, remainingSeats: 87 },
  { group: 'GROUP D', home: '🇺🇸 United States', away: '🇵🇾 Paraguay', date: 'June 12, 2026', time: '22:00', stadium: 'Los Angeles Stadium', price: 80, remainingSeats: 118 },
  { group: 'GROUP D', home: '🇦🇺 Australia', away: '🇹🇷 Turkey', date: 'June 13, 2026', time: '18:00', stadium: 'BC Place Vancouver', price: 80, remainingSeats: 99 },
  { group: 'GROUP D', home: '🇺🇸 United States', away: '🇦🇺 Australia', date: 'June 19, 2026', time: '21:00', stadium: 'Seattle Stadium', price: 80, remainingSeats: 109 },
  { group: 'GROUP I', home: '🇫🇷 France', away: '🇸🇳 Senegal', date: 'June 13, 2026', time: '19:30', stadium: 'New York New Jersey Stadium', price: 80, remainingSeats: 103 },
  { group: 'GROUP I', home: '🇮🇶 Iraq', away: '🇳🇴 Norway', date: 'June 13, 2026', time: '23:30', stadium: 'Boston Stadium', price: 80, remainingSeats: 75 },
  { group: 'GROUP I', home: '🇫🇷 France', away: '🇮🇶 Iraq', date: 'TBD', time: 'TBD', stadium: 'TBD', price: 80, remainingSeats: 63 },
  { group: 'GROUP I', home: '🇳🇴 Norway', away: '🇸🇳 Senegal', date: 'TBD', time: 'TBD', stadium: 'TBD', price: 80, remainingSeats: 54 },
  { group: 'GROUP I', home: '🇳🇴 Norway', away: '🇫🇷 France', date: 'TBD', time: 'TBD', stadium: 'TBD', price: 80, remainingSeats: 66 },
  { group: 'GROUP I', home: '🇸🇳 Senegal', away: '🇮🇶 Iraq', date: 'TBD', time: 'TBD', stadium: 'TBD', price: 80, remainingSeats: 57 },
  { group: 'GROUP J', home: '🇦🇷 Argentina', away: '🇩🇿 Algeria', date: 'June 13, 2026', time: '20:30', stadium: 'Kansas City Stadium', price: 80, remainingSeats: 95 },
  { group: 'GROUP J', home: '🇦🇹 Austria', away: '🇯🇴 Jordan', date: 'June 13, 2026', time: '23:00', stadium: 'San Francisco Bay Area Stadium', price: 80, remainingSeats: 82 },
  { group: 'GROUP L', home: '🏴 England', away: '🇭🇷 Croatia', date: 'June 17, 2026', time: '18:30', stadium: 'Dallas Stadium', price: 80, remainingSeats: 111 },
  { group: 'GROUP L', home: '🇬🇭 Ghana', away: '🇵🇦 Panama', date: 'June 17, 2026', time: '21:30', stadium: 'Toronto Stadium', price: 80, remainingSeats: 73 },
];

const up: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: (d: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: d } }),
};

export default function MatchesPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/'); }, [router]);
  const [filters, setFilters] = useState({ search:'', stage:'', date_from:'', date_to:'', team:'' });
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<Match>>({
    queryKey: ['matches', filters, page],
    queryFn: () => api.get('/matches', { params: { ...filters, page, limit: 12 } }).then(r => r.data),
  });

  const set = (k: string, v: string) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };
  const clear = () => { setFilters({ search:'', stage:'', date_from:'', date_to:'', team:'' }); setPage(1); };
  const hasFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Page header */}
      <div className="bg-[#111827] pt-28 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37] mb-3">World Cup 2026</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">All Matches</h1>
            <p className="text-[#9CA3AF] mt-2 text-base">{data?.pagination.total ?? '—'} matches available</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter bar */}
        <motion.div
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, delay:0.1 }}
          className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-4 mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="w-4 h-4 text-[#9CA3AF]" />
            <span className="text-sm font-semibold text-[#111827]">Filter</span>
            {hasFilters && (
              <button onClick={clear} className="ml-auto flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input type="text" placeholder="Team, stadium…" className="input pl-9"
                value={filters.search} onChange={e => set('search', e.target.value)} />
            </div>
            <select className="input md:w-52" value={filters.stage} onChange={e => set('stage', e.target.value)}>
              <option value="">All stages</option>
              {STAGES.map(s => <option key={s} value={s}>{STAGE_FR[s]}</option>)}
            </select>
            <input type="date" className="input md:w-40" value={filters.date_from} onChange={e => set('date_from', e.target.value)} />
            <input type="date" className="input md:w-40" value={filters.date_to}   onChange={e => set('date_to',   e.target.value)} />
          </div>
        </motion.div>

        <section className="mb-10">
          <div className="flex items-end justify-between gap-3 mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D4AF37]">Group stage</p>
              <h2 className="text-2xl md:text-3xl font-bold text-[#111827]">All group matches</h2>
              <p className="text-sm text-[#6B7280] mt-1">Complete fixtures with WhatsApp booking for every listed match.</p>
            </div>
            <span className="hidden md:inline-flex rounded-full bg-[#FFF8E5] px-3 py-1 text-xs font-semibold text-[#92750C]">3 cards / row desktop</span>
          </div>

          <div className="space-y-8">
            {['GROUP A','GROUP B','GROUP C','GROUP D','GROUP I','GROUP J','GROUP L'].map(groupName => {
              const items = GROUP_STAGE_FIXTURES.filter(item => item.group === groupName);
              if (!items.length) return null;

              return (
                <section key={groupName} className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                  <h3 className="text-xl font-bold text-[#111827] mb-5">{groupName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((match, i) => (
                      <motion.article
                        key={`${groupName}-${i}`}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.04 }}
                        className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[#6B7280] mb-4">
                          <span className="rounded-full bg-[#FFF8E5] px-3 py-1 text-[#92750C] font-semibold">{groupName}</span>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 font-semibold">Available</span>
                        </div>

                        <div className="space-y-3 text-sm text-[#111827]">
                          <div className="text-lg font-semibold leading-snug">{match.home} vs {match.away}</div>
                          <div className="flex items-center gap-2 text-[#4B5563]"><CalendarDays className="h-4 w-4 text-[#D4AF37]" /> {match.date}</div>
                          <div className="flex items-center gap-2 text-[#4B5563]"><CalendarDays className="h-4 w-4 text-[#D4AF37]" /> {match.time}</div>
                          <div className="flex items-center gap-2 text-[#4B5563]"><MapPin className="h-4 w-4 text-[#D4AF37]" /> {match.stadium}</div>
                          <div className="flex items-center justify-between rounded-xl bg-white border border-[#E5E7EB] px-3 py-2 text-sm">
                            <span className="font-semibold text-[#111827]">${match.price}</span>
                            <span className="text-[#6B7280]">{match.remainingSeats} seats left</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => openWhatsAppBooking({ match: `${match.home} vs ${match.away}`, date: `${match.date} · ${match.time}`, stadium: match.stadium, category: 'Group stage ticket', price: `$${match.price}` })}
                          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-[#111827] shadow-[0_10px_24px_rgba(212,175,55,0.25)] transition duration-300 hover:bg-[#28A745] hover:text-white"
                        >
                          <Ticket className="h-4 w-4" /> Book Now
                        </button>
                      </motion.article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </section>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl animate-pulse h-72" />
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">⚽</p>
            <h3 className="text-lg font-bold text-[#111827] mb-1">No matches found</h3>
            <p className="text-[#6B7280] text-sm">Essayez d'ajuster vos filtres.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {data?.data.map((match, i) => (
                <motion.div key={match.id} variants={up} initial="hidden" animate="visible" custom={i * 0.04}>
                  <MatchCard match={match} />
                </motion.div>
              ))}
            </div>

            {data && data.pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                <button
                  disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="btn-outline text-sm disabled:opacity-30 disabled:pointer-events-none"
                >
                  ← Previous
                </button>
                <span className="text-sm text-[#6B7280] font-medium">
                  Page {page} / {data.pagination.pages}
                </span>
                <button
                  disabled={page >= data.pagination.pages} onClick={() => setPage(p => p + 1)}
                  className="btn-outline text-sm disabled:opacity-30 disabled:pointer-events-none"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
