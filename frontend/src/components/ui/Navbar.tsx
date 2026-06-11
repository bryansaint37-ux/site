'use client';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, User, LogOut, Trophy, Menu, X } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const { totalItems } = useCartStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    await api.post('/auth/logout', { refreshToken }).catch(() => null);
    logout();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <Trophy className="w-6 h-6" />
            <span>WorldCup Tickets</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/matches" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Matches</Link>
            {isAuthenticated() && (
              <Link href="/dashboard" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">My Bookings</Link>
            )}
            {isAdmin() && (
              <Link href="/admin" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Admin</Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/booking/cart" className="relative p-2 text-gray-600 hover:text-primary-600">
              <ShoppingCart className="w-5 h-5" />
              {totalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems()}
                </span>
              )}
            </Link>

            {isAuthenticated() ? (
              <div className="relative group">
                <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-600">
                  <User className="w-4 h-4" />
                  {user?.first_name}
                </button>
                <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-lg shadow-lg py-1 min-w-[160px] hidden group-hover:block">
                  <Link href="/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-50">My Bookings</Link>
                  <Link href="/dashboard/profile" className="block px-4 py-2 text-sm hover:bg-gray-50">Profile</Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
                <Link href="/auth/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </div>
            )}

            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-3 space-y-2">
            <Link href="/matches" className="block text-gray-700 hover:text-primary-600 py-2">Matches</Link>
            {isAuthenticated() && <Link href="/dashboard" className="block text-gray-700 py-2">My Bookings</Link>}
            {isAdmin() && <Link href="/admin" className="block text-gray-700 py-2">Admin</Link>}
          </div>
        )}
      </div>
    </nav>
  );
}
