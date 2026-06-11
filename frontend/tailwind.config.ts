import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1a56db', 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#1a56db', 700: '#1e40af', 900: '#1e3a5f' },
        success: '#057a55',
        danger: '#e02424',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
export default config
