import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Single-page, fully client-side app. Static-deployable.
export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
  },
})
