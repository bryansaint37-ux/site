import { format } from 'date-fns';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Match } from '@/types';

const STAGE_LABELS: Record<string, string> = {
  group: 'Group Stage', round_of_16: 'Round of 16', quarter_final: 'Quarter Final',
  semi_final: 'Semi Final', third_place: 'Third Place', final: 'Final',
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700', live: 'bg-green-100 text-green-700 animate-pulse',
  completed: 'bg-gray-100 text-gray-600', cancelled: 'bg-red-100 text-red-700',
};

export default function MatchCard({ match }: { match: Match }) {
  const minPrice = match.ticket_categories.length
    ? Math.min(...match.ticket_categories.map(c => c.price))
    : null;

  const totalAvailable = match.ticket_categories.reduce((sum, c) => sum + c.available_seats, 0);

  return (
    <Link href={`/matches/${match.id}`} className="card hover:shadow-md transition-shadow group block">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1">
          <span className={`badge ${STATUS_COLORS[match.status]} self-start`}>
            {match.status === 'live' ? '● LIVE' : match.status.toUpperCase()}
          </span>
          <span className="text-xs text-gray-500 font-medium">{STAGE_LABELS[match.stage]}{match.group_name ? ` · Group ${match.group_name}` : ''}</span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
      </div>

      <div className="flex items-center justify-between my-4">
        <div className="text-center flex-1">
          {match.home_team.flag_url && (
            <img src={match.home_team.flag_url} alt={match.home_team.name} className="w-10 h-7 object-cover mx-auto mb-1 rounded" />
          )}
          <p className="font-bold text-gray-900">{match.home_team.name}</p>
          <p className="text-xs text-gray-500">{match.home_team.country_code}</p>
        </div>
        <div className="text-center px-4">
          <span className="text-2xl font-black text-gray-300">VS</span>
        </div>
        <div className="text-center flex-1">
          {match.away_team.flag_url && (
            <img src={match.away_team.flag_url} alt={match.away_team.name} className="w-10 h-7 object-cover mx-auto mb-1 rounded" />
          )}
          <p className="font-bold text-gray-900">{match.away_team.name}</p>
          <p className="text-xs text-gray-500">{match.away_team.country_code}</p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          {format(new Date(match.match_date), 'EEE, MMM d, yyyy · h:mm a')}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          {match.stadium.name}, {match.stadium.city}
        </div>
      </div>

      <div className="mt-3 flex justify-between items-center">
        {minPrice ? (
          <span className="text-primary-600 font-bold text-sm">From ${minPrice.toLocaleString()}</span>
        ) : (
          <span className="text-gray-400 text-sm">No tickets</span>
        )}
        <span className={`text-xs font-medium ${totalAvailable > 100 ? 'text-green-600' : totalAvailable > 0 ? 'text-orange-600' : 'text-red-600'}`}>
          {totalAvailable > 0 ? `${totalAvailable.toLocaleString()} seats left` : 'Sold Out'}
        </span>
      </div>
    </Link>
  );
}
