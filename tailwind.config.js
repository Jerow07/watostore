/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wato: {
          red: '#E60412',
          'red-light': '#F14555',
          cyan: '#4CC3E3',
          charcoal: '#414548',
          gray: '#989898',
        },
        bg: {
          0: '#0a0a0c',
          1: '#111114',
          2: '#1a1a1f',
          3: '#25252c',
        },
        fg: {
          0: '#fafafa',
          1: '#e5e5ea',
          2: '#989898',
          3: '#6b6b73',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        'glow-red': '0 0 32px rgba(230, 4, 18, 0.35)',
        'glow-cyan': '0 0 32px rgba(76, 195, 227, 0.35)',
        'glow-red-sm': '0 0 16px rgba(230, 4, 18, 0.25)',
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'pulse-dot': 'pulseDot 1.6s ease-in-out infinite',
        'shimmer': 'shimmer 1.6s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

