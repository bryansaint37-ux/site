import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold:    { DEFAULT: '#D4AF37', light: '#F0D060', dark: '#B8960C' },
        ink:     { DEFAULT: '#111827', soft: '#1F2937', muted: '#374151' },
        silver:  '#F9FAFB',
        border:  '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:       '0 4px 24px rgba(0,0,0,0.07)',
        'card-lg':  '0 12px 40px rgba(0,0,0,0.11)',
        gold:       '0 4px 20px rgba(212,175,55,0.40)',
        dark:       '0 8px 32px rgba(17,24,39,0.20)',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg,#D4AF37 0%,#F0D060 50%,#C9A227 100%)',
        'gradient-dark': 'linear-gradient(135deg,#111827 0%,#1F2937 100%)',
      },
    },
  },
  safelist: [
    'bg-[#D4AF37]/10',
    'bg-[#D4AF37]/30',
    'bg-[#FFFBEE]',
    'border-[#D4AF37]/30',
  ],
  plugins: [],
};

export default config;
