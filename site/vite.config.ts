import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { fileURLToPath, URL } from 'node:url'

const alias = { '@': fileURLToPath(new URL('./src', import.meta.url)) }

export default defineConfig(({ mode }) => {
  // `npm run build:local` → one self-contained preview/index.html
  // that opens with a double-click (file://), no server needed.
  if (mode === 'standalone') {
    return {
      base: './',
      resolve: { alias },
      plugins: [react(), tailwindcss(), viteSingleFile()],
      build: { outDir: 'preview', emptyOutDir: true },
    }
  }
  // GitHub Pages serves the site from /TrackFinder/.
  // Set BASE_PATH=/ when a custom domain is configured.
  return {
    base: process.env.BASE_PATH ?? '/TrackFinder/',
    resolve: { alias },
    plugins: [react(), tailwindcss()],
  }
})
