'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Trophy, Eye, EyeOff, ArrowRight, User, Mail, Phone, Lock, Globe } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const schema = z.object({
  first_name: z.string().min(2, 'Minimum 2 caractères'),
  last_name:  z.string().min(2, 'Minimum 2 caractères'),
  email:      z.string().email('Email invalide'),
  phone:      z.string().optional(),
  country:    z.string().optional(),
  password:   z.string().min(8, 'Minimum 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Majuscule, minuscule, chiffre et symbole requis'),
  confirm_password: z.string(),
  terms: z.literal(true, { errorMap: () => ({ message: "Vous devez accepter les conditions" }) }),
}).refine(d => d.password === d.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password'],
});
type F = z.infer<typeof schema>;

function StrengthBar({ pwd }: { pwd: string }) {
  if (!pwd) return null;
  const checks = [pwd.length >= 8, /[A-Z]/.test(pwd), /[0-9]/.test(pwd), /[@$!%*?&]/.test(pwd)];
  const score = checks.filter(Boolean).length;
  const bar   = ['bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-500'][score - 1] ?? 'bg-[#E5E7EB]';
  const label = ['Très faible', 'Faible', 'Moyen', 'Fort'][score - 1] ?? '';
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= score ? bar : 'bg-[#E5E7EB]'}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${score >= 4 ? 'text-emerald-600' : score >= 3 ? 'text-amber-600' : 'text-red-500'}`}>
        {label}
      </p>
    </div>
  );
}

const COUNTRIES = ['France','Espagne','Allemagne','Italie','Portugal','Brésil','Argentine','Maroc','Sénégal',"Côte d'Ivoire",'USA','Mexique','Canada'];

export default function RegisterPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [pwd, setPwd] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) });

  const mut = useMutation({
    mutationFn: ({ confirm_password: _, terms: __, ...data }: F) => api.post('/auth/register', data),
    onSuccess: () => { toast.success('Compte créé ! Vérifiez votre email.'); router.push('/auth/login'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Inscription échouée'),
  });

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=85')" }} />
        <div className="absolute inset-0 bg-hero-overlay" />

        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center">
            <Trophy className="w-4 h-4 text-[#111827]" />
          </div>
          <span className="font-bold text-white text-[15px]">WorldCup<span className="text-[#D4AF37]"> Tickets</span></span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight">
            Rejoignez<br />
            <span className="text-gold-gradient">des millions de fans.</span>
          </h2>
          <p className="text-[#9CA3AF] text-sm leading-relaxed mb-7 max-w-xs">
            Créez votre compte et réservez vos places pour les matchs les plus attendus de 2026.
          </p>
          <div className="space-y-3">
            {['Confirmation immédiate par email','Billets PDF avec QR code unique','Gestion des réservations en ligne','Support client 24h/24'].map(t => (
              <div key={t} className="flex items-center gap-2.5 text-sm text-[#9CA3AF]">
                <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full shrink-0" /> {t}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[#4B5563] text-xs">© 2026 WorldCup Tickets</div>
      </div>

      {/* ── Right form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
          className="w-full max-w-lg">

          <Link href="/" className="flex lg:hidden items-center gap-2.5 mb-10 justify-center">
            <div className="w-8 h-8 bg-[#111827] rounded-lg flex items-center justify-center">
              <Trophy className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <span className="font-bold text-[#111827] text-[15px]">WorldCup<span className="text-[#D4AF37]"> Tickets</span></span>
          </Link>

          <div className="mb-8">
            <h1 className="heading-md mb-1.5">Créer un compte</h1>
            <p className="body-sm">Remplissez le formulaire pour rejoindre la communauté.</p>
          </div>

          <form onSubmit={handleSubmit(d => mut.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Prénom</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <input {...register('first_name')} placeholder="Jean"
                    className={`input pl-10 ${errors.first_name ? 'input-error' : ''}`} />
                </div>
                {errors.first_name && <p className="field-error">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="label">Nom</label>
                <input {...register('last_name')} placeholder="Dupont"
                  className={`input ${errors.last_name ? 'input-error' : ''}`} />
                {errors.last_name && <p className="field-error">{errors.last_name.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input {...register('email')} type="email" placeholder="vous@exemple.com"
                  className={`input pl-10 ${errors.email ? 'input-error' : ''}`} />
              </div>
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <input {...register('phone')} type="tel" placeholder="+33 6…" className="input pl-10" />
                </div>
              </div>
              <div>
                <label className="label">Pays</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <select {...register('country')} className="input pl-10 appearance-none">
                    <option value="">Sélectionner…</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input {...register('password')} type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  onChange={e => setPwd(e.target.value)} />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <StrengthBar pwd={pwd} />
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input {...register('confirm_password')} type="password" placeholder="••••••••"
                  className={`input pl-10 ${errors.confirm_password ? 'input-error' : ''}`} />
              </div>
              {errors.confirm_password && <p className="field-error">{errors.confirm_password.message}</p>}
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input {...register('terms')} type="checkbox"
                className="mt-0.5 w-4 h-4 rounded border-[#D1D5DB] accent-[#111827] shrink-0" />
              <span className="text-sm text-[#6B7280] leading-relaxed">
                J'accepte les{' '}
                <Link href="/terms" className="text-[#111827] font-medium underline underline-offset-2">conditions d'utilisation</Link>
                {' '}et la{' '}
                <Link href="/privacy" className="text-[#111827] font-medium underline underline-offset-2">politique de confidentialité</Link>
              </span>
            </label>
            {errors.terms && <p className="field-error">{errors.terms.message}</p>}

            <motion.button type="submit" disabled={mut.isPending}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="btn-gold btn-lg w-full">
              {mut.isPending
                ? <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Création…</span>
                : <span className="flex items-center gap-2">Créer mon compte <ArrowRight className="w-4 h-4" /></span>
              }
            </motion.button>
          </form>

          <p className="text-center text-sm text-[#6B7280] mt-6">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-[#111827] font-semibold hover:text-[#D4AF37] transition-colors">
              Se connecter
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
