/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-core': '#0F1115',
        'surface-glass': 'rgba(255, 255, 255, 0.05)',
        'border-subtle': 'rgba(255, 255, 255, 0.08)',
        'accent-primary': '#3B82F6',
        'signal-success': '#00FF94',
        'signal-danger': '#FF4B4B',
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
      },
      fontFamily: {
        'display': ['Montserrat', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Roboto Mono', 'monospace'],
      },
      backdropBlur: {
        'glass': '12px',
      },
    },
  },
  plugins: [],
};
