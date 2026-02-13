/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/renderer/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        bg: '#09090b',
        surface: '#18181b',
        'surface-hover': '#27272a',
        border: '#3f3f46',
        'text-primary': '#fafafa',
        'text-secondary': '#a1a1aa',
        'text-muted': '#71717a',
        accent: '#2A8F9D',
        'accent-hover': '#238490',
        'accent-light': 'rgba(42, 143, 157, 0.125)',
        success: '#17c964',
        warning: '#f5a524',
        error: '#f31260',
        'cat-eyes': '#17c964',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
