import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the site from /TrackFinder/.
// Set BASE_PATH=/ when a custom domain is configured.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/TrackFinder/',
  plugins: [react(), tailwindcss()],
})
