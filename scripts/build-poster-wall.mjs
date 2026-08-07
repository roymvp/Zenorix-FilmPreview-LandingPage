/**
 * Normalizes every source poster into ONE tile format for the hero wall.
 *
 * The sources are deliberately mismatched — the licensed platform posters are
 * small 197x276 JPGs, while the in-house key art is 1024x1024 with black
 * letterbox bars either side of a portrait image. Laying those out directly
 * would give the wall tiles of three different aspect ratios and visible black
 * gutters inside individual tiles.
 *
 * So every source is trimmed (which removes the letterbox bars, because they are
 * a uniform border) and then covered into a single 2:3 tile at a fixed size, and
 * written as WebP: the wall paints twelve tiles at once behind a scrim, so
 * per-file weight matters far more than pixel-perfect fidelity.
 *
 * Re-run with `node scripts/build-poster-wall.mjs` after adding a source poster,
 * and add the new file to `lib/content/poster-wall.ts`.
 */
import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'

/* Tile geometry. 2:3 is the standard key-art ratio; 420x630 is ~2x the largest
   size a tile is ever painted at in the 420px-wide phone column. */
const WIDTH = 420
const HEIGHT = 630

const sources = [
  'public/media/poster-nocturne-protocol.png',
  'public/media/poster-crimson-harbor.png',
  'public/media/poster-the-last-signal.png',
  'public/media/poster-72-hours.png',
  'public/media/poster-the-last-house.png',
  'public/media/poster-walter-boys.png',
]

await mkdir('public/media/wall', { recursive: true })

for (const source of sources) {
  const name = source.split('/').pop().replace(/^poster-/, '').replace(/\.\w+$/, '')
  const out = `public/media/wall/${name}.webp`

  await sharp(source)
    /* Generous threshold: the letterbox bars are near-black but not pure black
       after PNG quantization, and a tight threshold leaves a 1–2px rim. */
    .trim({ threshold: 20 })
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' })
    .webp({ quality: 78 })
    .toFile(out)

  console.log('[v0] wrote', out)
}
