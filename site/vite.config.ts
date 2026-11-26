import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { fileURLToPath, URL } from 'node:url'

const alias = { '@': fileURLToPath(new URL('./src', import.meta.url)) }

// Preload the display font so the hero headline paints in its real face sooner.
function preloadDisplayFont(): Plugin {
  return {
    name: 'preload-display-font',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const file = Object.keys(ctx.bundle ?? {}).find((f) => /archivo-.*\.woff2$/.test(f))
        if (!file) return []
        return [
          {
            tag: 'link',
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `${ctx.server ? '/' : base}${file}`, crossorigin: '' },
            injectTo: 'head-prepend',
          },
        ]
      },
    },
  }
}
const base = process.env.BASE_PATH ?? '/TrackFinder/'

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
    base,
    resolve: { alias },
    plugins: [react(), tailwindcss(), preloadDisplayFont()],
  }
})
