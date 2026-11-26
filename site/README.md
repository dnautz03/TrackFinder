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

## Deploy: Cloudflare (Workers Builds, static assets)

Connect the repo `dnautz03/TrackFinder` in Cloudflare → Workers & Pages → Create → Import a repository.

| Setting | Value |
|---|---|
| Project name | `trackfinder` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` (default) |
| Non-production branch deploy command | default |
| Root directory / Path (advanced) | `site` |
| Build variable (optional, recommended) | `SITE_URL` = the live URL, e.g. `https://trackfinder.<account>.workers.dev` |

`wrangler.jsonc` tells Cloudflare to serve `dist/` as static assets (no server code).
Node 22 comes from `.nvmrc`. `public/_headers` sets long caching for hashed assets and
basic security headers. Branches other than `main` get preview URLs.

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
