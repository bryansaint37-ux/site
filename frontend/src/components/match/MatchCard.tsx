'use client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, MapPin, Ticket, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Match } from '@/types';

const STAGE_FR: Record<string, string> = {
  group:         'Phase de groupes',
  round_of_16:   'Huitièmes de finale',
  quarter_final: 'Quarts de finale',
  semi_final:    'Demi-finales',
  third_place:   'Troisième place',
  final:         'Finale',
};

export default function MatchCard({ match }: { match: Match }) {
  const minPrice     = match.ticket_categories.length
    ? Math.min(...match.ticket_categories.map(c => c.price)) : null;
  const totalSeats   = match.ticket_categories.reduce((s, c) => s + c.available_seats, 0);
  const isAvailable  = totalSeats > 0 && match.status === 'scheduled';
  const isLive       = match.status === 'live';

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Link href={`/matches/${match.id}`} className="block bg-white border border-[#E5E7EB] rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden group">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#F3F4F6]">
          <span className="badge-gray">{STAGE_FR[match.stage]}{match.group_name ? ` · Groupe ${match.group_name}` : ''}</span>
          <span className={isLive ? 'badge-green animate-pulse' : isAvailable ? 'badge-green' : 'badge-red'}>
            {isLive ? '● En direct' : isAvailable ? 'Disponible' : 'Complet'}
          </span>
        </div>

        {/* Teams */}
        <div className="px-5 py-5">
          <div className="flex items-center justify-between mb-5">
            <div className="text-center flex-1">
              {match.home_team.flag_url
                ? <img src={match.home_team.flag_url} alt="" className="w-12 h-8 object-cover mx-auto mb-1.5 rounded shadow-xs" />
                : <div className="text-3xl mb-1.5 text-center">{match.home_team.name.slice(0,2)}</div>}
              <p className="font-semibold text-[#111827] text-sm">{match.home_team.name}</p>
              <p className="text-[#9CA3AF] text-xs">{match.home_team.country_code}</p>
            </div>
            <div className="px-3">
              <span className="text-xs font-bold text-[#9CA3AF] bg-[#F9FAFB] border border-[#E5E7EB] px-2.5 py-1 rounded-lg">VS</span>
            </div>
            <div className="text-center flex-1">
              {match.away_team.flag_url
                ? <img src={match.away_team.flag_url} alt="" className="w-12 h-8 object-cover mx-auto mb-1.5 rounded shadow-xs" />
                : <div className="text-3xl mb-1.5 text-center">{match.away_team.name.slice(0,2)}</div>}
              <p className="font-semibold text-[#111827] text-sm">{match.away_team.name}</p>
              <p className="text-[#9CA3AF] text-xs">{match.away_team.country_code}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-2 text-xs text-[#6B7280]">
              <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
              {format(new Date(match.match_date), "EEE d MMM yyyy · HH'h'mm", { locale: fr })}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6B7280]">
              <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
              {match.stadium.name}, {match.stadium.city}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[#F3F4F6]">
            {minPrice ? (
              <div>
                <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-0.5">À partir de</p>
                <p className="text-base font-extrabold text-[#111827]">{minPrice.toLocaleString('fr')} €</p>
              </div>
            ) : <span className="text-xs text-[#9CA3AF]">Aucun billet</span>}

            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium ${totalSeats > 100 ? 'text-emerald-600' : totalSeats > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                {totalSeats > 0 ? `${totalSeats.toLocaleString('fr')} places` : 'Épuisé'}
              </span>
              <span className="w-8 h-8 rounded-lg bg-[#111827] group-hover:bg-[#1F2937] flex items-center justify-center transition-colors">
                <ChevronRight className="w-4 h-4 text-white" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
