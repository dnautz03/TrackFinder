// Injects the server-rendered app into a built index.html and inlines the
// stylesheet, so the first paint needs no extra request.
// Usage: node scripts/prerender.mjs <html file> <ssr entry> [page]
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const [htmlPath, entry, page = 'home'] = process.argv.slice(2)
const { render } = await import(pathToFileURL(resolve(entry)).href)
let html = readFileSync(htmlPath, 'utf8')
if (!html.includes('<div id="root"></div>')) throw new Error(`No empty #root in ${htmlPath}`)
html = html.replace('<div id="root"></div>', `<div id="root">${render(page)}</div>`)

// <link rel="stylesheet" href=".../assets/x.css"> → <style>…</style>
html = html.replace(/<link rel="stylesheet"[^>]*href="[^"]*\/(assets\/[^"]+\.css)"[^>]*>/g, (tag, file) => {
  const path = join(dirname(htmlPath), file)
  return existsSync(path) ? `<style>${readFileSync(path, 'utf8')}</style>` : tag
})

writeFileSync(htmlPath, html)
console.log(`prerendered ${htmlPath}`)
