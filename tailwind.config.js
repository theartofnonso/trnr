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
        'accent': '#22c55e',
        'accent-hover': '#16a34a',
        'border': '#262626',
        'wave-active': '#22c55e',
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

