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

## Production build (GitHub Pages)

```bash
npm run build
```

Output goes to `dist/`, served from `/TrackFinder/`. The build prerenders the page into `dist/index.html`.

Fonts in `src/fonts/` are trimmed copies; regenerate them with `scripts/fonts.sh` (needs `pip install fonttools brotli`). For a custom domain, build with `BASE_PATH=/`.

Design rules live in [DESIGN.md](DESIGN.md).
