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

const TITLE = 'Underset — Free DJ Tracklist Finder for Windows & Mac'
const GUIDE_TITLE = 'Install Underset — Windows & macOS guide'
const GUIDE_DESCRIPTION = 'What the Windows and macOS warnings mean, and how to open Underset in a minute.'
const TRY_TITLE = 'Try Underset — See every set a DJ played'
const TRY_DESCRIPTION = 'Type a DJ and a period and see every set they played, with how many tracks are identified. Works on your phone.'
const pages = {
  main: fileURLToPath(new URL('./index.html', import.meta.url)),
  download: fileURLToPath(new URL('./download/index.html', import.meta.url)),
  try: fileURLToPath(new URL('./try/index.html', import.meta.url)),
}
const SHARE_DESCRIPTION = 'Underset finds every track a DJ played, from their tracklists, in one clean list. Free for Windows and Mac.'

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
    transformIndexHtml(_html, ctx) {
      const guide = ctx.path.includes('download')
      const tryPage = ctx.path.includes('try')
      const path = guide ? 'download/' : tryPage ? 'try/' : ''
      const title = guide ? GUIDE_TITLE : tryPage ? TRY_TITLE : TITLE
      const description = guide ? GUIDE_DESCRIPTION : tryPage ? TRY_DESCRIPTION : SHARE_DESCRIPTION
      const meta = (attrs: Record<string, string>): HtmlTagDescriptor => ({ tag: 'meta', attrs, injectTo: 'head' })
      const tags: HtmlTagDescriptor[] = [
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: `${base}apple-touch-icon.png` }, injectTo: 'head' },
        meta({ property: 'og:type', content: 'website' }),
        meta({ property: 'og:site_name', content: 'Underset' }),
        meta({ property: 'og:title', content: title }),
        meta({ property: 'og:description', content: description }),
        meta({ property: 'og:image', content: abs('og.png') }),
        meta({ property: 'og:image:width', content: '1200' }),
        meta({ property: 'og:image:height', content: '630' }),
        meta({ property: 'og:image:alt', content: 'Underset: Less digging. More mixing.' }),
        meta({ name: 'twitter:card', content: 'summary_large_image' }),
        meta({ name: 'twitter:title', content: title }),
        meta({ name: 'twitter:description', content: description }),
        meta({ name: 'twitter:image', content: abs('og.png') }),
      ]
      // Structured data: what the app is (no ratings: we don't invent any) + the FAQ
      const app = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Underset',
        alternateName: ['Underset app', 'Underset DJ tracklist finder'],
        description:
          'Free desktop app that finds the tracks a DJ played in their sets over a chosen period, from public tracklists on 1001Tracklists. Removes IDs and duplicates, links to Spotify and SoundCloud, and exports a TXT list.',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Windows 10, Windows 11, macOS 14 or later',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        downloadUrl: 'https://github.com/dnautz03/Underset/releases/latest',
        url: siteUrl ? `${siteUrl}${base}` : undefined,
        image: abs('og.png'),
        sameAs: ['https://github.com/dnautz03/Underset'],
      }
      // Tells Google the site's name ("Underset") for the search result header
      const site = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Underset',
        alternateName: ['Underset app', 'Underset DJ tracklist finder'],
        url: siteUrl ? `${siteUrl}${base}` : undefined,
      }
      const faq = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      }
      // The app + FAQ data belongs to the home page only
      for (const data of guide || tryPage ? [] : [site, app, faq]) {
        tags.push({ tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify(data), injectTo: 'head' })
      }
      if (siteUrl) {
        tags.push({ tag: 'link', attrs: { rel: 'canonical', href: `${siteUrl}${base}${path}` }, injectTo: 'head' })
        tags.push(meta({ property: 'og:url', content: `${siteUrl}${base}${path}` }))
      }
      return tags
    },
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /', ...(siteUrl ? [`Sitemap: ${siteUrl}${base}sitemap.xml`] : [])]
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.join('\n') + '\n' })
      if (siteUrl) {
        const lastmod = new Date().toISOString().slice(0, 10)
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}${base}</loc><lastmod>${lastmod}</lastmod></url>\n  <url><loc>${siteUrl}${base}try/</loc><lastmod>${lastmod}</lastmod></url>\n  <url><loc>${siteUrl}${base}download/</loc><lastmod>${lastmod}</lastmod></url>\n</urlset>\n`,
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
    build: { rollupOptions: { input: pages } },
  }
})
