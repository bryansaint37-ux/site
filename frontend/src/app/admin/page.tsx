'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import { Users, DollarSign, Ticket, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format } from 'date-fns';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface Analytics {
  totalRevenue: number;
  totalBookings: number;
  totalUsers: number;
  verifiedUsers: number;
  dailyStats: { date: string; count: number; revenue: number }[];
  topMatches: { home_team: string; away_team: string; stadium: string; booking_count: number; revenue: number }[];
}

export default function AdminDashboard() {
  const { isAdmin } = useAuthStore();
  const router = useRouter();

  useEffect(() => { if (!isAdmin()) router.push('/'); }, []);

  const { data } = useQuery<{ success: boolean; data: Analytics }>({
    queryKey: ['analytics'],
    queryFn: () => api.get('/admin/analytics').then(r => r.data),
  });

  const stats = data?.data;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black">Admin Dashboard</h1>
          <div className="flex gap-3">
            <Link href="/admin/users" className="btn-secondary text-sm">Manage Users</Link>
            <Link href="/admin/matches" className="btn-secondary text-sm">Manage Matches</Link>
            <Link href="/admin/bookings" className="btn-secondary text-sm">All Bookings</Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Revenue', value: `$${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
            { label: 'Total Bookings', value: stats?.totalBookings ?? 0, icon: Ticket, color: 'text-blue-600 bg-blue-50' },
            { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-purple-600 bg-purple-50' },
            { label: 'Verified Users', value: stats?.verifiedUsers ?? 0, icon: TrendingUp, color: 'text-orange-600 bg-orange-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-black">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="font-bold mb-4">Daily Revenue (30 days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats?.dailyStats.map(d => ({ ...d, date: format(new Date(d.date), 'MMM d') })) ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Line type="monotone" dataKey="revenue" stroke="#1a56db" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="font-bold mb-4">Daily Bookings (30 days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats?.dailyStats.map(d => ({ ...d, date: format(new Date(d.date), 'MMM d') })) ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1a56db" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Matches */}
        <div className="card">
          <h3 className="font-bold mb-4">Top Performing Matches</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Match</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Stadium</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Bookings</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats?.topMatches.map((m, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 font-medium">{m.home_team} vs {m.away_team}</td>
                    <td className="py-3 text-gray-500">{m.stadium}</td>
                    <td className="py-3 text-right">{m.booking_count}</td>
                    <td className="py-3 text-right font-semibold text-primary-600">${Number(m.revenue).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
