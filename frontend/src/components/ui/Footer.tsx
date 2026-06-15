import Link from 'next/link';
import { Trophy, Twitter, Instagram, Youtube, Facebook, Mail, Phone, MapPin, Send } from 'lucide-react';

const COLS = [
  {
    title: 'Entreprise',
    links: [
      { href: '/abort',   label: 'À propos'     },
      { href: '/press',   label: 'Presse'        },
      { href: '/careers', label: 'Carrières'     },
      { href: '/blog',    label: 'Blog'          },
    ],
  },
  {
    title: 'Tickets',
    links: [
      { href: '#matches', label: 'Voir les matchs'     },
      { href: '#matches', label: 'Acheter des billets' },
      { href: '#stadiums', label: 'Les stades'          },
      { href: '/vip',     label: 'Tickets VIP'         },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/faq',     label: 'FAQ'                  },
      { href: '/contact', label: 'Contact'               },
      { href: '/terms',   label: "Conditions d'utilisation" },
      { href: '/privacy', label: 'Confidentialité'      },
    ],
  },
];

const SOCIALS = [
  { Icon: Twitter,   href: '#', label: 'Twitter'   },
  { Icon: Instagram, href: '#', label: 'Instagram'  },
  { Icon: Facebook,  href: '#', label: 'Facebook'   },
  { Icon: Youtube,   href: '#', label: 'YorTube'    },
];

export default function Footer() {
  return (
    <footer className="bg-[#111827] text-white">
      <div className="container-app pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/8">

          {/* Brand — 2 cols */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4 text-[#111827]" />
              </div>
              <span className="font-bold text-[15px]">WorldCup<span className="text-[#D4AF37]"> Tickets</span></span>
            </div>
            <p className="text-[#9CA3AF] text-sm leading-relaxed max-w-xs">
              Plateforme officielle de réservation de billets for la World Cup FIFA 2026.
            </p>
            <div className="space-y-2">
              {[
                { Icon: Mail,   text: 'support@worldcuptickets.com' },
                { Icon: Phone,  text: '+1 (800) 2026-FIFA'          },
                { Icon: MapPin, text: 'New York, États-Unis'         },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-[#9CA3AF]">
                  <Icon className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  {text}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/6 hover:bg-[#D4AF37] text-[#9CA3AF] hover:text-[#111827] flex items-center justify-center transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Cols */}
          {COLS.map(col => (
            <div key={col.title}>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(({ href, label }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-[#9CA3AF] hover:text-white transition-colors duration-150">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter + copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <p className="text-[#6B7280] text-sm">
            © {new Date().getFullYear()} World Cup Tickets. All droits réservés. Partenaire officiel FIFA World Cup 2026.
          </p>
          <div className="flex gap-2 w-full md:w-auto">
            <input type="email" placeholder="Yorr email…"
              className="flex-1 md:w-56 bg-white/6 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#6B7280] focus:outline-none focus:border-[#D4AF37] transition-colors" />
            <button className="bg-[#D4AF37] hover:bg-[#C9A227] text-[#111827] px-4 py-2.5 rounded-xl transition-colors shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
