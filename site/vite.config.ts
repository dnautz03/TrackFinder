import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { fileURLToPath, URL } from 'node:url'
import { FAQ } from './src/lib/faq'

const alias = { '@': fileURLToPath(new URL('./src', import.meta.url)) }

/**
 * Hosting:
 * - Cloudflare Pages (default): site served from the root, base "/".
 * - GitHub Pages: build with BASE_PATH=/Underset/.
 * SITE_URL sets the public address used for canonical/og:url, absolute
 * share-image URLs and sitemap.xml (defaults to the workers.dev address).
 */
const base = process.env.BASE_PATH ?? '/'
// Live address; override with SITE_URL (e.g. after adding a custom domain).
const siteUrl = (process.env.SITE_URL ?? 'https://underset.dnautz.workers.dev').replace(/\/+$/, '')

const TITLE = 'Underset — Less Digging. More Mixing.'
const SHARE_DESCRIPTION = 'Discover the tracks your favourite DJs play. Free for Windows and macOS.'

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

// Social sharing tags, robots.txt and (with SITE_URL) canonical + sitemap.xml.
function seo(): Plugin {
  const abs = (path: string) => (siteUrl ? `${siteUrl}${base}${path}` : `${base}${path}`)
  return {
    name: 'seo',
    transformIndexHtml() {
      const meta = (attrs: Record<string, string>): HtmlTagDescriptor => ({ tag: 'meta', attrs, injectTo: 'head' })
      const tags: HtmlTagDescriptor[] = [
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: `${base}apple-touch-icon.png` }, injectTo: 'head' },
        meta({ property: 'og:type', content: 'website' }),
        meta({ property: 'og:site_name', content: 'Underset' }),
        meta({ property: 'og:title', content: TITLE }),
        meta({ property: 'og:description', content: SHARE_DESCRIPTION }),
        meta({ property: 'og:image', content: abs('og.png') }),
        meta({ property: 'og:image:width', content: '1200' }),
        meta({ property: 'og:image:height', content: '630' }),
        meta({ property: 'og:image:alt', content: 'Underset: Less digging. More mixing.' }),
        meta({ name: 'twitter:card', content: 'summary_large_image' }),
        meta({ name: 'twitter:title', content: TITLE }),
        meta({ name: 'twitter:description', content: SHARE_DESCRIPTION }),
        meta({ name: 'twitter:image', content: abs('og.png') }),
      ]
      // Structured data: what the app is (no ratings: we don't invent any) + the FAQ
      const app = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Underset',
        description:
          'Free desktop app that finds the tracks a DJ played in their sets over a chosen period, from public tracklists on 1001Tracklists. Removes IDs and duplicates, links to Spotify and SoundCloud, and exports a TXT list.',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Windows 10, Windows 11, macOS 14 or later',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        downloadUrl: 'https://github.com/dnautz03/Underset/releases/latest',
        url: siteUrl ? `${siteUrl}${base}` : undefined,
        image: abs('og.png'),
      }
      const faq = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      }
      for (const data of [app, faq]) {
        tags.push({ tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify(data), injectTo: 'head' })
      }
      if (siteUrl) {
        tags.push({ tag: 'link', attrs: { rel: 'canonical', href: `${siteUrl}${base}` }, injectTo: 'head' })
        tags.push(meta({ property: 'og:url', content: `${siteUrl}${base}` }))
      }
      return tags
    },
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /', ...(siteUrl ? [`Sitemap: ${siteUrl}${base}sitemap.xml`] : [])]
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.join('\n') + '\n' })
      if (siteUrl) {
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}${base}</loc></url>\n</urlset>\n`,
        })
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  // `npm run build:local` → one self-contained preview/index.html
  // that opens with a double-click (file://), no server needed.
  if (mode === 'standalone') {
    return {
      base: './',
      publicDir: false,
      resolve: { alias },
      plugins: [react(), tailwindcss(), viteSingleFile()],
      build: { outDir: 'preview', emptyOutDir: true },
    }
  }
  return {
    base,
    resolve: { alias },
    plugins: [react(), tailwindcss(), preloadDisplayFont(), seo()],
  }
})
