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
        background: '#0a0a0a',
        surface:    '#111111',
        surface2:   '#1a1a1a',
        surface3:   '#242424',
        border: {
          DEFAULT: '#222222',
          subtle:  '#1a1a1a',
          strong:  '#333333',
        },
        blue: {
          DEFAULT: '#3b82f6',
          soft:    '#60a5fa',
          muted:   '#1d4ed8',
          dim:     '#1e40af',
          glow:    'rgba(59,130,246,0.15)',
        },
        accent: '#60a5fa',
        text: {
          primary:   '#f8fafc',
          secondary: '#94a3b8',
          muted:     '#475569',
          dim:       '#334155',
        },
        green:  { DEFAULT: '#22c55e', dim: '#166534', glow: 'rgba(34,197,94,0.15)' },
        orange: { DEFAULT: '#f97316', dim: '#7c2d12' },
        red:    { DEFAULT: '#ef4444', dim: '#7f1d1d' },
        purple: { DEFAULT: '#a855f7', dim: '#581c87' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      animation: {
        float:        'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'pulse-dot':  'pulseDot 2s ease-in-out infinite',
        'typing-dot': 'typingDot 1.4s ease-in-out infinite',
        'scroll-x':   'scrollX 40s linear infinite',
      },
      keyframes: {
        float:     { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 20px rgba(59,130,246,0.2)' }, '50%': { boxShadow: '0 0 50px rgba(59,130,246,0.5)' } },
        pulseDot:  { '0%, 100%': { opacity: '1', transform: 'scale(1)' }, '50%': { opacity: '0.4', transform: 'scale(0.8)' } },
        typingDot: { '0%, 60%, 100%': { transform: 'translateY(0)' }, '30%': { transform: 'translateY(-4px)' } },
        scrollX:   { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      borderRadius: { lg: '0.75rem', xl: '1rem', '2xl': '1.25rem' },
    },
  },
  plugins: [],
}

export default config
