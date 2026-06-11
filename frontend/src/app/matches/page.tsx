'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import MatchCard from '@/components/match/MatchCard';
import type { Match, PaginatedResponse } from '@/types';

const STAGES = ['group', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final'];
const STAGE_LABELS: Record<string, string> = {
  group: 'Group Stage', round_of_16: 'Round of 16', quarter_final: 'Quarter Final',
  semi_final: 'Semi Final', third_place: '3rd Place', final: 'Final',
};

export default function MatchesPage() {
  const [filters, setFilters] = useState({ search: '', stage: '', date_from: '', date_to: '', team: '' });
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<Match>>({
    queryKey: ['matches', filters, page],
    queryFn: () => api.get('/matches', { params: { ...filters, page, limit: 12 } }).then(r => r.data),
  });

  const updateFilter = (key: string, value: string) => { setFilters(f => ({ ...f, [key]: value })); setPage(1); };
  const clearFilters = () => { setFilters({ search: '', stage: '', date_from: '', date_to: '', team: '' }); setPage(1); };
  const hasFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">All Matches</h1>
          <p className="text-gray-500 mt-1">{data?.pagination.total ?? 0} matches available</p>
        </div>

        {/* Search & Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" placeholder="Search teams or stadiums..."
                className="input pl-10"
                value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
              />
            </div>
            <select className="input md:w-48" value={filters.stage} onChange={e => updateFilter('stage', e.target.value)}>
              <option value="">All Stages</option>
              {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
            </select>
            <input type="date" className="input md:w-44" value={filters.date_from} onChange={e => updateFilter('date_from', e.target.value)} />
            <input type="date" className="input md:w-44" value={filters.date_to} onChange={e => updateFilter('date_to', e.target.value)} />
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-2 btn-secondary text-sm whitespace-nowrap">
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Matches Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card animate-pulse h-64 bg-gray-100" />
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">⚽</p>
            <p className="text-xl font-semibold">No matches found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.data.map(match => <MatchCard key={match.id} match={match} />)}
            </div>

            {/* Pagination */}
            {data && data.pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
                <span className="flex items-center px-4 text-sm text-gray-600">Page {page} of {data.pagination.pages}</span>
                <button disabled={page >= data.pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
