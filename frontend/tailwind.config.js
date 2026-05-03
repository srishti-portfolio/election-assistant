/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f0f4ff',
          100: '#dde5ff',
          200: '#c4cffe',
          300: '#a1b0fd',
          400: '#7c87fb',
          500: '#5b63f8',
          600: '#3f3fed',
          700: '#3130d0',
          800: '#2929a8',
          900: '#272884',
          950: '#181748',
        },
        parchment: {
          50: '#fdfcf7',
          100: '#f9f5e7',
          200: '#f3eacc',
          300: '#e9d9a4',
          400: '#ddc374',
          500: '#d1a84a',
          600: '#b8883a',
          700: '#97692f',
          800: '#7b542b',
          900: '#664627',
        },
        slate: {
          50: '#f8fafc',
          950: '#0a0f1e',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'typing': 'typing 1.2s steps(3) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        typing: { '0%,100%': { content: "'●'" }, '33%': { content: "'● ●'" }, '66%': { content: "'● ● ●'" } },
      }
    },
  },
  plugins: [],
}