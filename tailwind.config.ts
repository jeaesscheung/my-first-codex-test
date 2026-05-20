import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#07090f',
        panel: '#101622',
        gold: '#d9b46d',
        cyan: '#44d9ff'
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(68,217,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(68,217,255,.08) 1px, transparent 1px)',
      },
      boxShadow: {
        glow: '0 0 35px rgba(68,217,255,.35)',
      }
    },
  },
  plugins: [],
} satisfies Config;
