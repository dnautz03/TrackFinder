# TrackFinder — landing page

Marketing site for TrackFinder. Static, built with Vite + React + Tailwind + Motion.

## Preview without a server

Open `preview/index.html` with a double-click. It is one self-contained file
(scripts, styles and fonts inlined), so it works from `file://`.

Rebuild it after changes:

```bash
npm install
npm run build:local
```

## Develop

```bash
npm run dev
```

## Deploy: Cloudflare Pages

Cloudflare Pages project settings (repo `dnautz03/TrackFinder`):

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | None |
| Root directory | `site` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variable | `SITE_URL` = `https://<project>.pages.dev` (or the custom domain) |

Node 22 is picked up from `.nvmrc`. `public/_headers` sets long caching for hashed
assets and basic security headers. Other branches get preview URLs automatically.

`SITE_URL` adds the canonical URL, absolute share-image URLs and `sitemap.xml`.
After adding a custom domain, update `SITE_URL` and redeploy.

## Production build

```bash
npm run build
```

Output goes to `dist/`, served from the site root. The build prerenders the page into
`dist/index.html`. For GitHub Pages instead, build with `BASE_PATH=/TrackFinder/`.

Fonts in `src/fonts/` are trimmed copies; regenerate them with `scripts/fonts.sh`
(needs `pip install fonttools brotli`). The share image is `public/og.png` (1200 × 630).

Design rules live in [DESIGN.md](DESIGN.md).
