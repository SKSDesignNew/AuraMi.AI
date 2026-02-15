import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: { DEFAULT: '#00F5FF', deep: '#00C4CC' },
        coral: { DEFAULT: '#7B61FF', deep: '#5E48CC' },
        gold: { DEFAULT: '#BFFF00', deep: '#A3D900' },
        bg: { DEFAULT: '#080C18', alt: '#0E1324', dark: '#04060E', white: '#131830' },
        card: '#131830',
        text: {
          900: '#E8F4FF',
          800: '#C4DCF0',
          700: '#94B8D8',
          600: '#6E96BC',
          500: '#5078A0',
          400: '#3D5E82',
          300: '#2C4568',
          200: '#1E3050',
          100: '#142040',
        },
        teal: { DEFAULT: '#00F5FF', deep: '#00C4CC' },
        blue: { DEFAULT: '#7B61FF', deep: '#5E48CC' },
        purple: { DEFAULT: '#B388FF', deep: '#9060E8' },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        sm: '0 1px 6px rgba(0,0,0,0.15)',
        md: '0 4px 16px rgba(0,245,255,0.06)',
        lg: '0 12px 40px rgba(0,0,0,0.25)',
        hover: '0 16px 48px rgba(0,245,255,0.12), 0 4px 16px rgba(0,0,0,0.2)',
        glow: '0 4px 24px rgba(0,245,255,0.25)',
      },
      borderRadius: {
        card: '18px',
      },
      letterSpacing: {
        display: '-0.035em',
        section: '-0.025em',
        label: '0.18em',
      },
      keyframes: {
        'blob-morph-1': {
          '0%,100%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%', transform: 'rotate(0deg)' },
          '25%': { borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%', transform: 'rotate(45deg)' },
          '50%': { borderRadius: '50% 60% 30% 60%/40% 30% 60% 50%', transform: 'rotate(90deg)' },
          '75%': { borderRadius: '40% 60% 50% 40%/60% 50% 30% 70%', transform: 'rotate(135deg)' },
        },
        'blob-morph-2': {
          '0%,100%': { borderRadius: '40% 60% 50% 50%/50% 40% 60% 50%', transform: 'scale(1)' },
          '33%': { borderRadius: '50% 30% 60% 40%/40% 60% 30% 60%', transform: 'scale(1.02)' },
          '66%': { borderRadius: '60% 50% 40% 50%/30% 50% 60% 40%', transform: 'scale(.98)' },
        },
        'blob-morph-3': {
          '0%,100%': { borderRadius: '50% 40% 60% 40%/40% 50% 40% 60%', transform: 'scale(1)' },
          '50%': { borderRadius: '40% 50% 40% 60%/60% 40% 50% 40%', transform: 'scale(1.04)' },
        },
        'aura-shimmer': {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%,100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(0,245,255,0.3)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 0 6px rgba(0,245,255,0)' },
        },
        'glow-drift': {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(20px,-15px) scale(1.04)' },
          '66%': { transform: 'translate(-15px,10px) scale(0.96)' },
        },
      },
      animation: {
        'blob-1': 'blob-morph-1 8s ease-in-out infinite',
        'blob-2': 'blob-morph-2 6s ease-in-out infinite',
        'blob-3': 'blob-morph-3 5s ease-in-out infinite',
        'aura-shimmer': 'aura-shimmer 3s linear infinite',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        pulse: 'pulse 2s ease-in-out infinite',
        'glow-drift-1': 'glow-drift 16s ease-in-out infinite',
        'glow-drift-2': 'glow-drift 12s ease-in-out infinite reverse',
        'glow-drift-3': 'glow-drift 18s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
