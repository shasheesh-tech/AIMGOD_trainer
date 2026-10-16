/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#06070a',
          900: '#0b0e14',
          850: '#0f131c',
          800: '#141a26',
          750: '#1a2232',
          700: '#222c40',
          600: '#2e3a54',
          500: '#465677',
        },
        brand: {
          cyan: '#00f0ff',
          'cyan-dim': 'rgba(0, 240, 255, 0.15)',
          'cyan-glow': 'rgba(0, 240, 255, 0.35)',
          amber: '#ffaa00',
          'amber-dim': 'rgba(255, 170, 0, 0.15)',
          emerald: '#00f59b',
          'emerald-dim': 'rgba(0, 245, 155, 0.15)',
          rose: '#ff2e63',
          'rose-dim': 'rgba(255, 46, 99, 0.15)',
          purple: '#9d4edd',
        }
      },
      fontFamily: {
        display: ['Orbitron', 'Rajdhani', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px rgba(0, 240, 255, 0.35)',
        'glow-cyan-sm': '0 0 12px rgba(0, 240, 255, 0.25)',
        'glow-amber': '0 0 25px rgba(255, 170, 0, 0.35)',
        'glow-rose': '0 0 25px rgba(255, 46, 99, 0.35)',
        'glow-emerald': '0 0 25px rgba(0, 245, 155, 0.35)',
      },
      backgroundImage: {
        'tactical-grid': "radial-gradient(circle, rgba(0, 240, 255, 0.08) 1px, transparent 1px)",
        'radial-vignette': 'radial-gradient(circle at center, transparent 30%, rgba(6, 7, 10, 0.85) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
