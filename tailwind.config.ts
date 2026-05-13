import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
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
    },
  },
  plugins: [],
}

export default config
