import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        volcanic: {
          DEFAULT: '#0A0A0A',
          100: '#111111',
          200: '#1C1815',
          300: '#1F1C19',
          400: '#2A2520',
          500: '#3A332B',
        },
        sunset: {
          DEFAULT: '#E8703A',
          light: '#F08457',
          dark: '#C05420',
          glow: 'rgba(232,112,58,0.2)',
        },
        gold: {
          DEFAULT: '#D4A843',
          light: '#E8C060',
          dark: '#B08020',
          glow: 'rgba(212,168,67,0.15)',
        },
        cream: {
          DEFAULT: '#F0E6D6',
          dark: '#B8A899',
          muted: '#8A7A6A',
        },
        ocean: {
          DEFAULT: '#1E6FAF',
          light: '#2589C8',
          dark: '#155A8F',
        },
        jungle: {
          DEFAULT: '#2D6A4F',
          light: '#3A8A65',
          dark: '#1F4D38',
        },
        lava: '#C0392B',
        wa: {
          DEFAULT: '#25D366',
          dark: '#128C7E',
        },
        brand: 'hsl(var(--brand))',
        'brand-foreground': 'hsl(var(--brand-foreground))',
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-2xl': ['clamp(3.5rem, 8vw, 7rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-xl': ['clamp(2.5rem, 6vw, 5.5rem)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2rem, 4vw, 4rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'display-md': ['clamp(1.5rem, 3vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      keyframes: {
        appear: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'appear-zoom': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        spotlight: {
          '0%': { opacity: '0', transform: 'translate(-72%, -62%) skewX(-30deg)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -40%) skewX(-30deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(232,112,58,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(232,112,58,0.6)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'counter': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        appear: 'appear 0.6s ease-out forwards',
        'appear-zoom': 'appear-zoom 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.8s ease-out forwards',
        'slide-up': 'slide-up 0.7s ease-out forwards',
        spotlight: 'spotlight 2s ease-out forwards',
        float: 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'marquee': 'marquee 25s linear infinite',
        counter: 'counter 0.5s ease-out forwards',
      },
      backgroundImage: {
        'volcanic-gradient': 'linear-gradient(to bottom, #0A0A0A, #1C1815)',
        'sunset-gradient': 'linear-gradient(135deg, #E8703A, #D4A843)',
        'hero-gradient': 'linear-gradient(to bottom, transparent 0%, rgba(10,10,10,0.4) 50%, #0A0A0A 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        'mesh-gradient': 'radial-gradient(at 40% 20%, rgba(232,112,58,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(212,168,67,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(30,111,175,0.1) 0px, transparent 50%)',
        'wa-gradient': 'linear-gradient(135deg, #25D366, #128C7E)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-sunset': '0 0 30px rgba(232,112,58,0.25), 0 0 80px rgba(232,112,58,0.1)',
        'glow-gold': '0 0 30px rgba(212,168,67,0.25), 0 0 80px rgba(212,168,67,0.1)',
        'card-dark': '0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset',
        'card-hover': '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(232,112,58,0.2)',
      },
      maxWidth: {
        container: '1320px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
    },
  },
  plugins: [],
}

export default config
