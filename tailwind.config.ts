import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: { DEFAULT: '#F093FB', deep: '#D462E5' },
        coral: { DEFAULT: '#F5576C', deep: '#E03E54' },
        gold: { DEFAULT: '#FFD452', deep: '#F0B429' },
        bg: { DEFAULT: '#FBF8F3', alt: '#F4EFE6', dark: '#1A1215' },
        text: {
          900: '#1A1215',
          800: '#2D2328',
          700: '#4A3F46',
          600: '#6B5E64',
          500: '#8B7E84',
          400: '#A89CA2',
          300: '#C4BAC0',
        },
        teal: '#2DD4BF',
        blue: '#60A5FA',
        purple: '#A78BFA',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        sm: '0 1px 6px rgba(0,0,0,0.035)',
        md: '0 4px 16px rgba(0,0,0,0.06)',
        lg: '0 12px 40px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
