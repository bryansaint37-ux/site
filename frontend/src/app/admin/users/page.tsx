'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import { Search, ShieldCheck, ShieldOff } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface User {
  id: string; email: string; first_name: string; last_name: string;
  role: string; is_verified: boolean; is_active: boolean; last_login: string | null; created_at: string;
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ success: boolean; data: User[]; pagination: any }>({
    queryKey: ['admin-users', search],
    queryFn: () => api.get('/admin/users', { params: { search, limit: 50 } }).then(r => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      api.patch(`/admin/users/${id}`, { is_active }),
    onSuccess: () => { toast.success('User updated'); qc.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: () => toast.error('Failed to update user'),
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="text-gray-500 hover:text-gray-700">← Dashboard</Link>
          <h1 className="text-2xl font-black">Manage Users</h1>
          <span className="badge bg-gray-100 text-gray-600">{data?.pagination?.total ?? 0} total</span>
        </div>

        <div className="card mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by name or email..." className="input pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Name', 'Email', 'Role', 'Verified', 'Last Login', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-2 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="py-3"><div className="h-6 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : data?.data.map(user => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">{user.first_name} {user.last_name}</td>
                  <td className="py-3 px-2 text-gray-600">{user.email}</td>
                  <td className="py-3 px-2">
                    <span className={`badge ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`badge ${user.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {user.is_verified ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-500">{user.last_login ? format(new Date(user.last_login), 'MMM d, yyyy') : 'Never'}</td>
                  <td className="py-3 px-2 text-gray-500">{format(new Date(user.created_at), 'MMM d, yyyy')}</td>
                  <td className="py-3 px-2">
                    {user.role !== 'super_admin' && (
                      <button
                        onClick={() => toggleMutation.mutate({ id: user.id, is_active: !user.is_active })}
                        className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${user.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                      >
                        {user.is_active ? <><ShieldOff className="w-3.5 h-3.5" /> Deactivate</> : <><ShieldCheck className="w-3.5 h-3.5" /> Activate</>}
                      </button>
                    )}
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
