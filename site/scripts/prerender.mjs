// Injects the server-rendered app into a built index.html.
// Usage: node scripts/prerender.mjs <html file> <ssr entry>
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const [htmlPath, entry] = process.argv.slice(2)
const { render } = await import(pathToFileURL(resolve(entry)).href)
const html = readFileSync(htmlPath, 'utf8')
if (!html.includes('<div id="root"></div>')) throw new Error(`No empty #root in ${htmlPath}`)
writeFileSync(htmlPath, html.replace('<div id="root"></div>', `<div id="root">${render()}</div>`))
console.log(`prerendered ${htmlPath}`)
