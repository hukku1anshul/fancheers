/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          900: '#070b12',
          800: '#0d131f',
          700: '#131b2c',
          600: '#1c263b',
          500: '#2a3752'
        },
        stadium: {
          neon: '#00ff88',
          cyan: '#00f2fe',
          orange: '#ff6b35',
          gold: '#ffd166',
          danger: '#ef233c',
          // Bright theme accents
          turf: '#10B981',
          sky: '#0284C7',
          blue: '#2563EB',
          flame: '#EA580C',
          sun: '#F59E0B'
        }
      },
      boxShadow: {
        'bright-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'bright-md': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.07)',
        'bright-lg': '0 10px 20px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'bright-glow': '0 0 20px rgba(16, 185, 129, 0.2)'
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite',
        'ripple': 'ripple 1.5s ease-out forwards',
        'float-up': 'floatUp 3s ease-out forwards',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' }
        },
        ripple: {
          '0%': { transform: 'scale(0.2)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' }
        },
        floatUp: {
          '0%': { transform: 'translateY(0) scale(0.8)', opacity: '0' },
          '15%': { transform: 'translateY(-10px) scale(1)', opacity: '1' },
          '80%': { transform: 'translateY(-40px) scale(1)', opacity: '0.9' },
          '100%': { transform: 'translateY(-60px) scale(0.95)', opacity: '0' }
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        }
      }
    },
  },
  plugins: [],
}
