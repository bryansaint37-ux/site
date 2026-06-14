'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import {
  Trophy, ShoppingCart, User, LogOut,
  Menu, X, ChevronDown, LayoutDashboard, Search,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

const LINKS = [
  { href: '/',        label: 'Home' },
  { href: '/matches', label: 'Matches'  },
  { href: '/matches', label: 'Tickets' },
  { href: '/stades',  label: 'Stadiums'  },
  { href: '/faq',     label: 'FAQ'     },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const { totalItems } = useCartStore();
  const pathname = usePathname();

  const [open,     setOpen]     = useState(false);
  const [drop,     setDrop]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const isHeroPage = pathname === '/';

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDrop(false);
    };
    document.addEventListener('morsedown', fn);
    return () => document.removeEventListener('morsedown', fn);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await api.post('/auth/logout', { refreshToken: useAuthStore.getState().refreshToken }).catch(() => null);
    logout(); setDrop(false);
  };

  /* When the page starts with a hero, navbar starts transparent */
  const useSolid = scrolled || !isHeroPage;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        useSolid ? 'glass-nav shadow-sm' : 'bg-transparent'
      }`}
    >
      <nav className="container-app">
        <div className="flex items-center justify-between h-16 gap-6">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
              useSolid ? 'bg-[#111827]' : 'bg-[#D4AF37]'
            }`}>
              <Trophy className={`w-4 h-4 ${useSolid ? 'text-[#D4AF37]' : 'text-[#111827]'}`} />
            </div>
            <span className={`font-bold text-[15px] tracking-tight transition-colors ${
              useSolid ? 'text-[#111827]' : 'text-white'
            }`}>
              WorldCup<span className="text-[#D4AF37]"> Tickets</span>
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {LINKS.map(({ href, label }) => (
              <Link key={label} href={href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  useSolid
                    ? 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}>
                {label}
              </Link>
            ))}
            {isAdmin() && (
              <Link href="/admin"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  useSolid ? 'text-[#4B5563] hover:bg-[#F3F4F6]' : 'text-white/75 hover:bg-white/10'
                }`}>
                Admin
              </Link>
            )}
          </div>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Search */}
            <button className={`hidden md:flex p-2 rounded-lg transition-all ${
              useSolid ? 'text-[#6B7280] hover:bg-[#F3F4F6]' : 'text-white/70 hover:bg-white/10'
            }`}>
              <Search className="w-4 h-4" />
            </button>

            {/* Cart */}
            <Link href="/booking/cart"
              className={`relative p-2 rounded-lg transition-all ${
                useSolid ? 'text-[#6B7280] hover:bg-[#F3F4F6]' : 'text-white/70 hover:bg-white/10'
              }`}>
              <ShoppingCart className="w-4 h-4" />
              <AnimatePresence>
                {totalItems() > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-[#D4AF37] text-[#111827] text-[9px] font-black rounded-full flex items-center justify-center leading-none"
                  >
                    {totalItems()}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* User menu */}
            {isAuthenticated() ? (
              <div className="relative hidden lg:block" ref={dropRef}>
                <button
                  onClick={() => setDrop(v => !v)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    useSolid
                      ? 'border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]'
                      : 'border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#111827] text-[10px] font-black flex items-center justify-center uppercase">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                  {user?.first_name}
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${drop ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {drop && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.14 }}
                      className="absolute right-0 top-12 w-56 bg-white border border-[#E5E7EB] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.11)] py-1.5 overflow-hidden"
                    >
                      <div className="px-4 py-2.5 border-b border-[#F3F4F6]">
                        <p className="text-xs font-semibold text-[#111827] truncate">{user?.first_name} {user?.last_name}</p>
                        <p className="text-[11px] text-[#9CA3AF] truncate mt-0.5">{user?.email}</p>
                      </div>
                      <Link href="/dashboard" onClick={() => setDrop(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors">
                        <LayoutDashboard className="w-4 h-4 text-[#9CA3AF]" /> My dashboard
                      </Link>
                      {isAdmin() && (
                        <Link href="/admin" onClick={() => setDrop(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#374151] hover:bg-[#F9FAFB] transition-colors">
                          <User className="w-4 h-4 text-[#9CA3AF]" /> Administration
                        </Link>
                      )}
                      <div className="border-t border-[#F3F4F6] my-1" />
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" /> Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link href="/auth/login"
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    useSolid
                      ? 'border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]'
                      : 'border-white/20 text-white/90 hover:bg-white/10'
                  }`}>
                  Login
                </Link>
                <Link href="/auth/register" className="btn-gold btn-sm px-5 py-2">
                  Register
                </Link>
              </div>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setOpen(v => !v)}
              className={`lg:hidden p-2 rounded-lg transition-all ${
                useSolid ? 'text-[#374151] hover:bg-[#F3F4F6]' : 'text-white hover:bg-white/10'
              }`}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="lg:hidden overflow-hidden bg-white border-t border-[#E5E7EB] shadow-lg"
          >
            <div className="container-app py-3 space-y-0.5">
              {LINKS.map(({ href, label }) => (
                <Link key={label} href={href}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827] transition-colors">
                  {label}
                </Link>
              ))}
              {isAuthenticated() && (
                <Link href="/dashboard"
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors">
                  My account
                </Link>
              )}
              <div className="pt-3 pb-1 border-t border-[#F3F4F6] flex gap-2 mt-2">
                {isAuthenticated() ? (
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-red-500 hover:bg-red-50 px-3 py-2.5 rounded-xl transition-colors w-full">
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                ) : (
                  <>
                    <Link href="/auth/login"
                      className="flex-1 text-center border border-[#E5E7EB] text-[#111827] py-2.5 rounded-xl text-sm font-semibold hover:bg-[#F9FAFB] transition-colors">
                      Login
                    </Link>
                    <Link href="/auth/register"
                      className="flex-1 text-center bg-[#D4AF37] text-[#111827] py-2.5 rounded-xl text-sm font-bold hover:bg-[#C9A227] transition-colors">
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
