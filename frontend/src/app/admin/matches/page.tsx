'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import { format } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { Match } from '@/types';

const STATUS_OPTIONS = ['scheduled', 'live', 'completed', 'cancelled'];

export default function AdminMatchesPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ success: boolean; data: Match[]; pagination: any }>({
    queryKey: ['admin-matches'],
    queryFn: () => api.get('/matches', { params: { limit: 50 } }).then(r => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/matches/${id}`, { status }),
    onSuccess: () => { toast.success('Match updated'); qc.invalidateQueries({ queryKey: ['admin-matches'] }); },
    onError: () => toast.error('Failed to update'),
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700">← Dashboard</Link>
          <h1 className="text-2xl font-black">Manage Matches</h1>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Match', 'Date', 'Stage', 'Stadium', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-2 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6}><div className="h-6 bg-gray-100 rounded animate-pulse my-2" /></td></tr>
                ))
              ) : data?.data.map(match => (
                <tr key={match.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">{match.home_team.name} vs {match.away_team.name}</td>
                  <td className="py-3 px-2 text-gray-500">{format(new Date(match.match_date), 'MMM d, yyyy h:mm a')}</td>
                  <td className="py-3 px-2 text-gray-500">{match.stage.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-2 text-gray-500">{match.stadium.name}</td>
                  <td className="py-3 px-2">
                    <span className={`badge ${match.status === 'live' ? 'bg-green-100 text-green-700' : match.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {match.status}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <select
                      value={match.status}
                      onChange={e => updateMutation.mutate({ id: match.id, status: e.target.value })}
                      className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-600"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
