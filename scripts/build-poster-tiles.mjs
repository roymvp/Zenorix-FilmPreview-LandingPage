/**
 * Normalizes every source poster into ONE tile format, shared by the hero wall
 * and the Top 10 rail.
 *
 * The sources are deliberately mismatched — the licensed platform posters are
 * small 197x276 JPGs, while the in-house key art is 1024x1024 with black
 * letterbox bars either side of a portrait image. Laying those out directly
 * would give tiles of three different aspect ratios and visible black gutters
 * inside individual tiles.
 *
 * So every source is trimmed (which removes the letterbox bars, because they are
 * a uniform border) and then covered into a single 2:3 tile at a fixed size, and
 * written as WebP: the wall paints twelve tiles at once behind a scrim and the
 * rail paints ten more, so per-file weight matters far more than pixel-perfect
 * fidelity.
 *
 * Re-run with `node scripts/build-poster-tiles.mjs` after adding a source, then
 * reference the new tile from `lib/content/poster-wall.ts` (hero) or the chart
 * pool in `lib/content/movies.ts` (rail).
 */
import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'

/* Tile geometry. 2:3 is the standard key-art ratio; 420x630 is ~2x the largest
   size a tile is ever painted at in the 420px-wide phone column. */
const WIDTH = 420
const HEIGHT = 630

/**
 * Two kinds of source, and the difference decides where a tile may be used.
 *
 * `branded: true` marks a licensed platform poster that carries its own
 * BURNED-IN service logo and title lettering. Those can only ever appear in the
 * hero wall, where tiles are small background texture behind a scrim. They must
 * NOT go in the Top 10 rail: every card there overlays its own platform badge
 * and derives its title from data, so a poster with "NETFLIX" printed on it
 * under an Apple TV badge is a straight contradiction.
 *
 * Everything else is untitled, unbranded key art and is safe in either place.
 */
const sources = [
  { file: 'public/media/poster-nocturne-protocol.png', branded: false },
  { file: 'public/media/poster-crimson-harbor.png', branded: false },
  { file: 'public/media/poster-the-last-signal.png', branded: false },
  { file: 'public/media/poster-72-hours.png', branded: true },
  { file: 'public/media/poster-the-last-house.png', branded: true },
  { file: 'public/media/poster-walter-boys.png', branded: true },
  { file: 'public/media/poster-neon.png', branded: false },
  { file: 'public/media/poster-orbit.png', branded: false },
  { file: 'public/media/poster-ember.png', branded: false },
  { file: 'public/media/poster-cartel.png', branded: false },
  { file: 'public/media/poster-glass.png', branded: false },
  { file: 'public/media/poster-tigers.png', branded: false },
  { file: 'public/media/poster-solstice.png', branded: false },
  { file: 'public/media/poster-crown.png', branded: false },
]

await mkdir('public/media/tiles', { recursive: true })

for (const { file, branded } of sources) {
  const name = file.split('/').pop().replace(/^poster-/, '').replace(/\.\w+$/, '')
  const out = `public/media/tiles/${name}.webp`

  const info = await sharp(file)
    /* Generous threshold: the letterbox bars are near-black but not pure black
       after PNG quantization, and a tight threshold leaves a 1–2px rim. */
    .trim({ threshold: 20 })
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' })
    .webp({ quality: 78 })
    .toFile(out)

  console.log('[v0] wrote', out, `${Math.round(info.size / 1024)}KB`, branded ? '(wall only)' : '')
}
