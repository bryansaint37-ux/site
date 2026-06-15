'use client';
import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useInView, type Variants } from 'framer-motion';
import {
  Trophy, Shield, Headphones, Zap, CheckCircle2, Star,
  ChevronRight, ChevronLeft, ArrowRight, Plus, Minus, Calendar, MapPin, Ticket,
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { openWhatsAppBooking } from '@/lib/whatsapp';

/* ────────── Animation helpers ────────── */
const up: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: (d: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: d, ease: [0.22, 1, 0.36, 1] },
  }),
};
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

/* ────────── Animated cornter ────────── */
function Cornter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let v = 0; const step = to / 55;
    const t = setInterval(() => {
      v += step;
      if (v >= to) { setN(to); clearInterval(t); } else setN(Math.floor(v));
    }, 18);
    return () => clearInterval(t);
  }, [inView, to]);
  return <span ref={ref}>{n.toLocaleString('fr')}{suffix}</span>;
}

/* ────────── Static data ────────── */
const STATS = [
  { emoji: '⚽', to: 64,  suffix: '',   label: 'Matches'             },
  { emoji: '🌍', to: 48,  suffix: '',   label: 'Nations'            },
  { emoji: '🏟️', to: 16,  suffix: '',   label: 'Host cities'      },
  { emoji: '🎫', to: 5,   suffix: 'M+', label: 'Tickets available' },
];

const FEATURES = [
  { icon: CheckCircle2, title: 'Official tickets', desc: 'Each ticket is officially approved and protected against fraud and counterfeiting.' },
  { icon: Shield,       title: 'Simple booking', desc: 'A direct reservation via whatsapp without complication.' },
  { icon: Headphones,   title: '24/7 support', desc: 'Our multilingual support team is available at any time to accompany you.' },
];

const MATCHES = [
  { id: 1, stage: 'Featured match', avail: true, home: { name: 'Mexique', code: 'MEX', flag: '🇲🇽' }, away: { name: 'Afrique du Sud', code: 'RSA', flag: '🇿🇦' }, date: '11 Juin 2026', h: '18:30', stade: 'Mexico City Stadium', ville: 'Mexico', prix: '100' },
  { id: 2, stage: 'Featured match', avail: true, home: { name: 'Canada', code: 'CAN', flag: '🇨🇦' }, away: { name: 'Bosnie-Herzégovine', code: 'BIH', flag: '🇧🇦' }, date: '12 Juin 2026', h: '19:00', stade: 'Toronto Stadium', ville: 'Toronto', prix: '100' },
  { id: 3, stage: 'Featured match', avail: true, home: { name: 'États-Unis', code: 'USA', flag: '🇺🇸' }, away: { name: 'Paraguay', code: 'PAR', flag: '🇵🇾' }, date: '12 Juin 2026', h: '22:00', stade: 'Los Angeles Stadium', ville: 'Los Angeles', prix: '80' },
  { id: 4, stage: 'Featured match', avail: true, home: { name: 'Brésil', code: 'BRA', flag: '🇧🇷' }, away: { name: 'Maroc', code: 'MAR', flag: '🇲🇦' }, date: '13 Juin 2026', h: '20:30', stade: 'New York New Jersey Stadium', ville: 'New York', prix: '180' },
  { id: 5, stage: 'Featured match', avail: true, home: { name: 'Allemagne', code: 'GER', flag: '🇩🇪' }, away: { name: 'Curaçao', code: 'CUW', flag: '🇨🇼' }, date: '14 Juin 2026', h: '17:30', stade: 'Horston Stadium', ville: 'Horston', prix: '80' },
  { id: 6, stage: 'Featured match', avail: true, home: { name: 'France', code: 'FRA', flag: '🇫🇷' }, away: { name: 'Sénégal', code: 'SEN', flag: '🇸🇳' }, date: '16 Juin 2026', h: '19:30', stade: 'New York New Jersey Stadium', ville: 'New York', prix: '180' },
  { id: 7, stage: 'Featured match', avail: true, home: { name: 'Argentine', code: 'ARG', flag: '🇦🇷' }, away: { name: 'Algérie', code: 'ALG', flag: '🇩🇿' }, date: '16 Juin 2026', h: '21:30', stade: 'Kansas City Stadium', ville: 'Kansas City', prix: '180' },
  { id: 8, stage: 'Featured match', avail: true, home: { name: 'Angleterre', code: 'ENG', flag: '🏴' }, away: { name: 'Croatie', code: 'CRO', flag: '🇭🇷' }, date: '17 Juin 2026', h: '18:00', stade: 'Dallas Stadium', ville: 'Dallas', prix: '80' },
];

const FINAL_PHASES = [
  { title: '32es de finale', subtitle: 'Knockort phase', price: '205 $', featured: false },
  { title: 'Quarter finale', subtitle: 'Decisive matches', price: '430 $', featured: false },
  { title: 'semi-finale 1', subtitle: 'Major semifinal', price: '905 $', featured: false },
  { title: 'semi-finale 2', subtitle: 'Major semifinal', price: '905 $', featured: false },
  { title: 'Match for the 3rd place', subtitle: 'Bronze medal battle', price: '450 $', featured: false },
  { title: 'Finale FIFA World Cup 2026', subtitle: '19 Juillet 2026 · MetLife Stadium', price: '1000 $', featured: true },
];

const CATEGORIES = [
  { title: 'Tickets VIP',       sub: 'Accès lornge + hospitalité',    emoji: '👑', tag: 'Premium',   from: '850 €',   dark: true  },
  { title: 'Tickets Standard',  sub: 'Places numérotées garanties',   emoji: '🎫', tag: 'Populaire', from: '150 €',   dark: false },
  { title: 'Hospitality',       sub: 'Expérience 5 étoiles complète', emoji: '🥂', tag: 'Exclusif',  from: '1 200 €', dark: true  },
  { title: 'Packages Famille',  sub: '4 billets + accès early',       emoji: '👨‍👩‍👧‍👦', tag: 'Famille',   from: '480 €',   dark: false },
];

const TESTIMONIALS = [
  { name: 'Sophie M.', city: 'Paris, France',  avatar: 'SM', text: "Expérience incroyable ! Tickets reçus en 2 minutes après le paiement. Plateforme vraiment irréprochable." },
  { name: 'Carlos R.', city: 'Madrid, Espagne',avatar: 'CR', text: "Processus ultra simple. J'ai pu commander des billets for la finale sans la moindre difficulté. Je recommande." },
  { name: 'Amara D.',  city: 'Dakar, Sénégal', avatar: 'AD', text: "Support client exceptionnel. Ils m'ont aidé à choisir les meilleures seats. Service 5 étoiles !" },
];

const FAQS = [
  { q: 'Comment recevoir mes billets ?',             a: "Vos billets PDF sont envoyés automatiquement sur votre email dans les 5 minutes suivant le paiement, avec un QR code unique for chaque place." },
  { q: 'Les billets sont-ils officiels ?',           a: "Oui, tors nos billets sont officiellement homologués. Chaque billet comporte un QR code authentifié qui sera vérifié à l'entrée du stade." },
  { q: 'Puis-je annuler ma réservation ?',           a: "Les annulations sont acceptées jusqu'à 48h avant le match. Passé ce délai, les billets ne sont ni remborrsables ni échangeables." },
  { q: 'Comment réserver mes billets ?',  a: "Cliquez sur Book et vors serez redirigé vers WhatsApp for confirmer votre demande avec notre équipe." },
  { q: 'Y a-t-il des frais supplémentaires ?',      a: "Le prix affiché est le prix final. Aucune transaction en ligne n’est requise for la réservation." },
];

/* ═══════════ PAGE ═══════════ */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <MatchesSection />
      <FinalsSection />
      <CategoriesSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </div>
  );
}

/* ── 1. HERO ── */
function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1920&q=85')" }}
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute inset-0 bg-dots-dark" />
      </div>
      {/* Gold glow */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-[#D4AF37]/6 blur-3xl pointer-events-none" />

      <div className="container-app relative z-10 flex min-h-[90vh] items-center py-24 w-full">
        <div className="mx-auto max-w-5xl text-center lg:text-center">
          <motion.div variants={up} initial="hidden" animate="visible" custom={0}>
            <span className="inline-flex items-center gap-2 bg-[#D4AF37]/12 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold px-4 py-1.5 rounded-full mb-8 tracking-widest uppercase">
              <Trophy className="w-3.5 h-3.5" /> FIFA World Cup 2026 · Official Platform
            </span>
          </motion.div>

          <motion.h1 variants={up} initial="hidden" animate="visible" custom={0.1}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.07] mb-6">
            Experience the{' '}
            <span className="text-gold-gradient">World Cup</span>
            <br />2026
          </motion.h1>

          <motion.p variants={up} initial="hidden" animate="visible" custom={0.2}
            className="mx-auto text-[#E5EEF8] text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl">
            Book your official tickets and enjoy an exceptional experience at the heart of the biggest sporting event in the world.
          </motion.p>

          <motion.div variants={up} initial="hidden" animate="visible" custom={0.3}
            className="flex flex-wrap justify-center gap-3 mb-14">
            <Link href="/matches">
              <motion.span whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                className="btn-green btn-lg rounded-full cursor-pointer min-w-[210px] justify-center">
                see the matches <ChevronRight className="w-4 h-4" />
              </motion.span>
            </Link>
            <Link href="/matches">
              <motion.span whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                className="btn-green btn-lg rounded-full cursor-pointer min-w-[210px] justify-center">
                Book now <ArrowRight className="w-4 h-4" />
              </motion.span>
            </Link>
          </motion.div>

          <motion.div variants={up} initial="hidden" animate="visible" custom={0.45}
            className="flex flex-wrap justify-center gap-3">
            {['Official tickets garantis', 'Instant PDF', 'WhatsApp booking'].map(t => (
              <span key={t}
                className="flex items-center gap-1.5 bg-white/6 border border-white/10 text-white/65 text-xs font-medium px-3.5 py-1.5 rounded-full">
                <Zap className="w-3 h-3 text-[#D4AF37]" /> {t}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-5 h-8 border-2 border-white/20 rounded-full flex items-start justify-center pt-1.5 pointer-events-none">
        <div className="w-1 h-1.5 bg-white/35 rounded-full" />
      </motion.div>
    </section>
  );
}

/* ── 2. STATS ── */
function StatsSection() {
  return (
    <section style={{ backgroundColor: 'rgba(212,175,55,0.10)', borderTop: '1px solid rgba(212,175,55,0.30)', borderBottom: '1px solid rgba(212,175,55,0.30)' }}>
      <div className="container-app">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-[#E5E7EB]">
          {STATS.map(({ emoji, to, suffix, label }, i) => (
            <motion.div key={label} variants={up} initial="hidden" whileInView="visible"
              viewport={{ once: true }} custom={i * 0.07}
              className="stat-card">
              <span className="text-3xl">{emoji}</span>
              <span className="text-4xl md:text-5xl font-extrabold text-[#111827] leading-none tabular-nums">
                <Cornter to={to} suffix={suffix} />
              </span>
              <span className="text-sm font-medium text-[#6B7280]">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 3. FEATURES ── */
function FeaturesSection() {
  return (
    <section className="section-gap bg-white">
      <div className="container-app">
        <div className="mx-auto max-w-3xl text-center mb-14">
          <motion.p variants={up} initial="hidden" whileInView="visible" viewport={{ once: true }} className="eyebrow">
            Why choose us
          </motion.p>
          <motion.h2 variants={up} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.05}
            className="heading-lg mt-2 mb-4">
            A platform designed for you
          </motion.h2>
          <motion.p variants={up} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.1}
            className="body-lg">
            Simple booking via WhatsApp, with instant PDF ticket.
          </motion.p>
        </div>

        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={up} whileHover={{ y: -5 }}
              className="card card-p card-hover group text-center border border-[#D4AF37]/20">
              <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/10 group-hover:bg-[#111827] flex items-center justify-center mb-5 mx-auto transition-all duration-200">
                <Icon className="w-5 h-5 text-[#D4AF37] group-hover:text-[#D4AF37] transition-colors duration-200" />
              </div>
              <h3 className="font-semibold text-[#111827] mb-2">{title}</h3>
              <p className="body-sm">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── 4. MATCHES ── */
function MatchesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  return (
    <section className="section-gap" style={{ backgroundColor: 'rgba(212,175,55,0.08)' }}>
      <div className="container-app">
        <div className="mx-auto flex flex-col items-center text-center gap-4 mb-10">
          <div className="max-w-2xl">
            <motion.p variants={up} initial="hidden" whileInView="visible" viewport={{ once: true }} className="eyebrow">
              Upcoming matches
            </motion.p>
            <motion.h2 variants={up} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.05}
              className="heading-lg mt-2">
              popular matches
            </motion.h2>
            <motion.p variants={up} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.08}
              className="body-sm mt-3 text-[#4B5563] max-w-xl mx-auto">
              Discover the fladship matches of the 2026 World cup with modern cards, attractive starting prices and fluid booking path.
            </motion.p>
          </div>
          <motion.div variants={up} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.1} className="flex items-center gap-3">
            <button type="button" onClick={() => scrollByAmount('left')} aria-label="Scroll left" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-white text-[#111827] shadow-md transition hover:-translate-y-0.5 hover:bg-[#FFF8E5]">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <Link href="/matches" className="btn-green btn-md">
              All matches <ArrowRight className="w-4 h-4" />
            </Link>
            <button type="button" onClick={() => scrollByAmount('right')} aria-label="Scroll right" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-white text-[#111827] shadow-md transition hover:-translate-y-0.5 hover:bg-[#FFF8E5]">
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>

        <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {MATCHES.map((m, index) => (
            <motion.article key={m.id} variants={up} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={index * 0.04}
              whileHover={{ y: -6, scale: 1.01 }}
              className="group min-w-[320px] max-w-[340px] flex-1 snap-start rounded-[24px] border border-[#E5E7EB] bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.10)] transition-all duration-200 hover:shadow-[0_24px_48px_rgba(15,23,42,0.14)] md:min-w-[320px] lg:min-w-[340px]">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[#6B7280]">
                <span className="rounded-full bg-[#FFF8E5] px-3 py-1 text-[#B18A12] font-semibold">{m.stage}</span>
                <span className={m.avail ? 'rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 font-semibold' : 'rounded-full bg-red-50 px-3 py-1 text-red-600 font-semibold'}>
                  {m.avail ? 'Available' : 'Sold ort'}
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="flex-1 text-center">
                  <div className="text-4xl mb-2">{m.home.flag}</div>
                  <p className="text-sm font-semibold text-[#111827]">{m.home.name}</p>
                  <p className="text-[11px] text-[#9CA3AF]">{m.home.code}</p>
                </div>
                <div className="rounded-full bg-[#F3F4F6] px-3 py-1 text-[11px] font-bold text-[#6B7280]">VS</div>
                <div className="flex-1 text-center">
                  <div className="text-4xl mb-2">{m.away.flag}</div>
                  <p className="text-sm font-semibold text-[#111827]">{m.away.name}</p>
                  <p className="text-[11px] text-[#9CA3AF]">{m.away.code}</p>
                </div>
              </div>

              <div className="mt-5 space-y-2 rounded-2xl bg-[#F9FAFB] p-4 text-sm text-[#4B5563]">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[#D4AF37]" /> {m.date} · {m.h}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#D4AF37]" /> {m.stade}, {m.ville}</div>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#F3F4F6] pt-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[#9CA3AF]">From</p>
                  <p className="text-2xl font-black text-[#111827]">{m.prix} <span className="text-sm font-semibold text-[#6B7280]">$</span></p>
                </div>
                <button
                  type="button"
                  onClick={() => openWhatsAppBooking({ match: `${m.home.name} vs ${m.away.name}`, date: m.date, stadium: m.stade, category: 'Match populaire', price: `${m.prix} $` })}
                  className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_12px_24px_rgba(212,175,55,0.25)] transition duration-300 hover:bg-[#28A745] hover:text-white"
                >
                  <Ticket className="h-3.5 w-3.5" /> Book
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 5. FINALS ── */
function FinalsSection() {
  return (
    <section className="section-gap bg-white">
      <div className="container-app">
        <div className="mx-auto max-w-3xl text-center mb-10">
          <motion.p variants={up} initial="hidden" whileInView="visible" viewport={{ once: true }} className="eyebrow">
            Final phase
          </motion.p>
          <motion.h2 variants={up} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.05}
            className="heading-lg mt-2">
            The major appointments of the World Cup 2026
          </motion.h2>
          <motion.p variants={up} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.08}
            className="body-sm mt-3 text-[#4B5563]">
            Des cartes premium, alignées horizontalement, avec bordure dorée, effet lumineux et accès direct à la réservation.
          </motion.p>
        </div>

        <div className="flex flex-wrap gap-5 justify-center">
          {FINAL_PHASES.map((item, index) => (
            <motion.article key={item.title} variants={up} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={index * 0.04}
              whileHover={{ y: -6, scale: 1.01 }}
              className={`rounded-[28px] border border-[#D4AF37]/30 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.10)] transition-all duration-300 hover:shadow-[0_22px_50px_rgba(212,175,55,0.18)] ${item.featured ? 'min-w-[320px] lg:min-w-[380px] ring-1 ring-[#D4AF37]/40' : 'min-w-[260px] max-w-[280px]'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#B18A12]">{item.featured ? 'Main event' : 'Final phase'}</p>
                  <h3 className="mt-2 text-xl font-black text-[#111827]">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#4B5563]">{item.subtitle}</p>
                </div>
                <span className="rounded-full bg-[#FFF8E5] px-3 py-1 text-[11px] font-semibold text-[#B18A12]">Premium</span>
              </div>
              <div className="mt-6 rounded-2xl bg-[#F9FAFB] p-4 text-sm text-[#374151]">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#9CA3AF]">Price from</p>
                <p className="mt-1 text-2xl font-black text-[#111827]">{item.price}</p>
              </div>
              <div className="mt-6 flex items-center justify-between gap-3">
                <div className="text-sm text-[#6B7280]">{item.featured ? 'Date : 19 Juillet 2026 · Stade : MetLife Stadium' : 'Places disponibles'}</div>
                <button
                  type="button"
                  onClick={() => openWhatsAppBooking({ match: item.title, date: item.featured ? '19 Juillet 2026' : 'À confirmer', stadium: item.featured ? 'MetLife Stadium' : 'Stade à confirmer', category: item.title, price: item.price })}
                  className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_12px_24px_rgba(212,175,55,0.25)] transition duration-300 hover:bg-[#28A745] hover:text-white"
                >
                  {item.featured ? 'Book maintenant' : 'Book'}
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 6. CATEGORIES ── */
function CategoriesSection() {
  return (
    <section className="section-gap bg-[#FFFBEE]">
      <div className="container-app">
        <div className="text-center max-w-xl mx-auto mb-14">
          <motion.p variants={up} initial="hidden" whileInView="visible" viewport={{ once: true }} className="eyebrow">
            Ticket types
          </motion.p>
          <motion.h2 variants={up} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.05}
            className="heading-lg mt-2">
            Choose your experience
          </motion.h2>
        </div>
        <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map(({ title, sub, emoji, tag, from, dark }) => (
            <motion.div key={title} variants={up} whileHover={{ y: -6 }}
              className={`relative rounded-2xl p-6 cursor-pointer overflow-hidden transition-all ${
                dark ? 'bg-[#111827] text-white' : 'card card-hover'
              }`}>
              {dark && <div className="absolute inset-0 bg-dots-dark pointer-events-none" />}
              <div className="relative z-10">
                <div className="text-4xl mb-4">{emoji}</div>
                <span className={`badge mb-3 ${dark ? 'bg-white/10 text-[#D4AF37] border border-[#D4AF37]/20' : 'badge-gold'}`}>
                  {tag}
                </span>
                <h3 className={`font-bold text-base mb-1.5 ${dark ? 'text-white' : 'text-[#111827]'}`}>{title}</h3>
                <p className={`text-sm mb-5 leading-relaxed ${dark ? 'text-[#9CA3AF]' : 'text-[#6B7280]'}`}>{sub}</p>
                <p className={`text-[10px] uppercase tracking-wider mb-1 ${dark ? 'text-[#6B7280]' : 'text-[#9CA3AF]'}`}>
                  From
                </p>
                <p className={`text-xl font-extrabold ${dark ? 'text-[#D4AF37]' : 'text-[#111827]'}`}>{from}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── 6. TESTIMONIALS ── */
function TestimonialsSection() {
  const [active, setActive] = useState(0);
  return (
    <section className="section-gap bg-white">
      <div className="container-app">
        <div className="text-center max-w-xl mx-auto mb-14">
          <motion.p variants={up} initial="hidden" whileInView="visible" viewport={{ once: true }} className="eyebrow">
            Testimonials
          </motion.p>
          <motion.h2 variants={up} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.05}
            className="heading-lg mt-2">
            What our clients say
          </motion.h2>
        </div>
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="card card-p text-center">
              <div className="flex justify-center gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                ))}
              </div>
              <p className="text-[#374151] text-base leading-relaxed mb-7">"{TESTIMONIALS[active].text}"</p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#111827] flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {TESTIMONIALS[active].avatar}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-[#111827] text-sm">{TESTIMONIALS[active].name}</p>
                  <p className="text-xs text-[#9CA3AF]">{TESTIMONIALS[active].city}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all duration-200 ${
                  i === active ? 'bg-[#111827] w-6' : 'bg-[#D1D5DB] w-2 hover:bg-[#9CA3AF]'
                }`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 7. FAQ ── */
function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="section-gap" style={{ backgroundColor: 'rgba(212,175,55,0.08)' }}>
      <div className="container-app">
        <div className="text-center max-w-xl mx-auto mb-14">
          <motion.p variants={up} initial="hidden" whileInView="visible" viewport={{ once: true }} className="eyebrow">FAQ</motion.p>

          <motion.h2 variants={up} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.05}
            className="heading-lg mt-2">
            Frequently asked questions
          </motion.h2>
        </div>
        <div className="max-w-2xl mx-auto space-y-3">
          {FAQS.map(({ q, a }, i) => (
            <motion.div key={i} variants={up} initial="hidden" whileInView="visible" viewport={{ once: true }}
              custom={i * 0.05} className="card overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-[#F9FAFB] transition-colors">
                <span className="font-semibold text-[#111827] text-sm leading-snug">{q}</span>
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                  open === i ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
                }`}>
                  {open === i ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                    className="overflow-hidden">
                    <p className="px-5 pb-5 pt-3 text-sm text-[#6B7280] leading-relaxed border-t border-[#F3F4F6]">{a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 8. CTA ── */
function CtaSection() {
  return (
    <section className="section-gap" style={{ backgroundColor: 'rgba(212,175,55,0.10)' }}>
      <div className="container-app">
        <motion.div variants={up} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-[#111827] px-8 md:px-16 py-16 md:py-20 text-center">
          <div className="absolute inset-0 bg-dots-dark pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-[#D4AF37]/8 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 bg-[#D4AF37]/12 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
              <Trophy className="w-3.5 h-3.5" /> Limited availability
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
              Don’t miss any{' '}
              <span className="text-gold-gradient">match.</span>
            </h2>
            <p className="text-[#9CA3AF] text-lg mb-10 leading-relaxed">
              Book your ticket today more than 5 million supporters trust our platform.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                onClick={() => openWhatsAppBooking({ match: 'FIFA World Cup 2026', date: 'to be confirm', stadium: 'Stade à confirmer', category: 'official ticket', price: 'From 80 $' })}
                className="btn-green btn-lg cursor-pointer"
              >
                Book now0 <ArrowRight className="w-4 h-4" />
              </button>
              <Link href="/auth/register">
                <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="btn-green btn-lg cursor-pointer">
                  Create an account
                </motion.span>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-6">
              {[
                { stars: 5, text: '4.9 / 5 sur Trustpilot' },
                { text: '2M+ billets vendus' },
                { text: 'SSL 256-bit sécurisé' },
              ].map(({ text, stars }) => (
                <span key={text} className="flex items-center gap-1.5 text-[#6B7280] text-xs">
                  {stars && Array.from({ length: stars }).map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                  {text}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
