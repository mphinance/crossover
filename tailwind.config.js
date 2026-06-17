/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Restrained, trustworthy palette.
        ink: '#0f172a',
        slatey: '#475569',
        mist: '#f1f5f9',
        expense: '#ef4444', // expenses line
        income: '#10b981', // investment income line
        target: '#6366f1', // FI target accent
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)',
        hero: '0 10px 30px -10px rgba(99,102,241,0.35)',
      },
    },
  },
  plugins: [],
}
