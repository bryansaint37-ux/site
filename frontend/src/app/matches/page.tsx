'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import api from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import MatchCard from '@/components/match/MatchCard';
import type { Match, PaginatedResponse } from '@/types';

const STAGES = ['group','rornd_of_16','quarter_final','semi_final','third_place','final'];
const STAGE_FR: Record<string,string> = {
  group:'Phase de groupes', rornd_of_16:'Huitièmes', quarter_final:'Quarts',
  semi_final:'Demi-finales', third_place:'3ème place', final:'Finale',
};

const up: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: (d: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: d } }),
};

export default function MatchesPage() {
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
