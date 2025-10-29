/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0a',
        'bg-secondary': '#141414',
        'text-primary': '#ffffff',
        'text-secondary': '#a0a0a0',
        'accent': '#3b82f6',
        'accent-hover': '#2563eb',
        'border': '#262626',
        'wave-active': '#3b82f6',
        'wave-inactive': '#2a2a2a',
      },
      keyframes: {
        waveform: {
          '0%, 100%': { height: '20%', opacity: '0.7' },
          '50%': { height: '100%', opacity: '1' },
        },
      },
      animation: {
        waveform: 'waveform 1.2s ease-in-out infinite',
        'waveform-reverse': 'waveform 1.2s ease-in-out infinite reverse',
      },
    },
  },
  plugins: [],
}

