/**
 * Rasterises the app mark into the PNG sizes the manifest and iOS need.
 * Run with `bun run icons` after editing the artwork below.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const BG = '#0e1116'

/** Two chevrons climbing: the upper one Fire, the lower one Water. */
const MARK = `
  <polyline points="132,262 256,150 380,262" fill="none" stroke="#EE8130"
    stroke-width="58" stroke-linecap="round" stroke-linejoin="round"/>
  <polyline points="132,358 256,246 380,358" fill="none" stroke="#6390F0"
    stroke-width="58" stroke-linecap="round" stroke-linejoin="round"/>`

/** Rounded-corner version, used as the favicon and for the "any" purpose icons. */
const rounded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="112" fill="${BG}"/>${MARK}
</svg>`

/** Full-bleed version: Android crops maskable icons to its own shape. */
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="${BG}"/>${MARK}
</svg>`

const OUT = new URL('../public/', import.meta.url).pathname

await mkdir(OUT, { recursive: true })
await writeFile(`${OUT}icon.svg`, rounded)

const jobs: Array<[string, string, number]> = [
  ['pwa-192.png', rounded, 192],
  ['pwa-512.png', rounded, 512],
  ['icon-180.png', maskable, 180],
  ['maskable-512.png', maskable, 512],
]

for (const [name, svg, size] of jobs) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(`${OUT}${name}`)
  console.log(`wrote public/${name}`)
}
console.log('wrote public/icon.svg')
