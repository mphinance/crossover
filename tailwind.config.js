/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // The Lost Diary of FIRE — an aged-paper, fountain-pen-ink palette.
        ink: '#2b2118', // primary text: dark sepia brown-black
        slatey: '#6b5d4a', // secondary text (kept name to limit churn): faded ink
        faded: '#8a7a63', // tertiary / captions: pale ink
        mist: '#e9ddc2', // warm fill, was a cool slate
        paper: '#f7efdc', // a fresh page (cards)
        parchment: '#efe3c8', // an older page
        desk: '#e0d0ad', // the leather desk the diary sits on (page bg)
        rule: '#d8c39a', // notebook ruling lines
        margin: '#b9544a', // the red margin line / red pencil
        gold: '#b07a2c', // gilt highlight, underlines
        // Ink colors for the charts — like a hand-drawn diagram.
        expense: '#a23b2d', // oxblood
        income: '#5c6e3a', // olive-green ink
        target: '#2f5d62', // teal fountain-pen ink
      },
      fontFamily: {
        // Body + headings: a warm book serif. Margin notes: a fountain-pen hand.
        serif: ['Spectral', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Spectral', 'Georgia', 'Cambria', 'serif'],
        hand: ['Caveat', 'Bradley Hand', 'Comic Sans MS', 'cursive'],
      },
      boxShadow: {
        // Soft brown page-lift shadows instead of cool grey.
        card: '0 1px 2px rgba(60,40,20,0.10), 0 6px 16px -8px rgba(60,40,20,0.22)',
        hero: '0 2px 4px rgba(60,40,20,0.12), 0 18px 40px -16px rgba(60,40,20,0.40)',
      },
      backgroundImage: {
        // Faint horizontal ruling, like a notebook page.
        ruled:
          'repeating-linear-gradient(to bottom, transparent, transparent 31px, rgba(168,140,90,0.18) 31px, rgba(168,140,90,0.18) 32px)',
      },
    },
  },
  plugins: [],
}
