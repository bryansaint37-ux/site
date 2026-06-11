import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import { Trophy, Shield, Zap, Globe } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-[200px] leading-none select-none">⚽</div>
          <div className="absolute bottom-10 right-10 text-[150px] leading-none select-none rotate-12">🏆</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 text-center">
          <span className="inline-block bg-white/20 backdrop-blur text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            🏆 FIFA World Cup 2026 — Official Ticket Platform
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Be Part of<br />
            <span className="text-yellow-400">Football History</span>
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Secure your seats for the world's greatest sporting event. Group stages, knockouts, and the Final.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/matches" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-xl text-lg transition-colors">
              Browse Matches
            </Link>
            <Link href="/auth/register" className="bg-white/20 hover:bg-white/30 backdrop-blur text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors border border-white/30">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why Book With Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Shield, title: 'Official & Secure', desc: 'All tickets are officially licensed and fraud-protected.' },
            { icon: Zap, title: 'Instant Confirmation', desc: 'PDF tickets delivered to your email immediately after payment.' },
            { icon: Globe, title: 'Multiple Payments', desc: 'Stripe, PayPal, and Mobile Money accepted worldwide.' },
            { icon: Trophy, title: 'All Matches', desc: 'Group stage to the Final — every match available.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card text-center">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-white font-bold text-xl mb-4">
            <Trophy className="w-5 h-5 text-yellow-400" /> WorldCup Tickets
          </div>
          <p className="text-sm">© 2026 World Cup Tickets. All rights reserved. Not affiliated with FIFA.</p>
        </div>
      </footer>
    </div>
  );
}
