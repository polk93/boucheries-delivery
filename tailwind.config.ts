import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    screens: {
      'xs':  '400px',
      'sm':  '640px',
      'md':  '768px',
      'lg':  '1024px',
      'xl':  '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        rouge:        '#8B1A1A',
        'rouge-vif':  '#C0392B',
        'rouge-pale': '#F5E6E6',
        or:           '#C8953A',
        'or-pale':    '#FBF3E4',
        brun:         '#3D2012',
        'brun-clair': '#6B3A23',
        creme:        '#FAF7F2',
        'gris-bd':    '#F0ECE6',
      },
      fontFamily: {
        sans:  ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      maxWidth: {
        'app': '1100px',
      },
      spacing: {
        'nav': '72px',
        'header': '62px',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'card':   '0 2px 12px rgba(61,32,18,.08)',
        'card-hover': '0 8px 28px rgba(61,32,18,.15)',
        'modal':  '0 20px 60px rgba(61,32,18,.2)',
        'nav':    '0 -4px 20px rgba(61,32,18,.1)',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'bounce-sm':  'bounce 1s infinite',
      },
    },
  },
  plugins: [],
}

export default config
