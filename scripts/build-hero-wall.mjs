/**
 * Builds the hero wall's tiles — a SEPARATE pipeline from the chart rails'
 * (`build-poster-tiles.mjs`), because the two have opposite requirements.
 *
 * A rail card is the subject of a click: it is inspected, its title is read off
 * the art, and it needs to survive that. A wall tile is texture. It sits behind a
 * scrim that runs from 50% to fully opaque black, rotated -9deg, at a painted
 * width of 130-307px, and the viewer never looks at one directly.
 *
 * So these are built SMALL and at lower quality on purpose. The wall shows every
 * tile in the pool at once (unlike a rail, which scrolls), so its weight is the
 * whole pool multiplied — at the rails' 420x630/q78 the twenty tiles here would
 * cost roughly 3x what they do at 320x480/q68, to deliver detail the scrim throws
 * away. Verify with the totals this script prints rather than assuming.
 *
 * These are theatrical one-sheets with burned-in titles and studio logos, which
 * is fine HERE and only here: the wall overlays no badge and makes no per-title
 * claim, so nothing can contradict the art. Do not reuse these for rail cards —
 * see the note in `build-poster-tiles.mjs`.
 *
 * Re-run with `node scripts/build-hero-wall.mjs` after adding a source, then add
 * the tile to `TILES` in `lib/content/poster-wall.ts`.
 */
import { mkdir, readdir } from 'node:fs/promises'
import sharp from 'sharp'

/* 2:3 at ~1.05x the widest painted size (307px at a 2560px viewport, via
   `--zx-wall-col: max(184px, 12vw)`). Retina renders this slightly soft, which is
   invisible under the scrim and is the trade being made deliberately. */
const WIDTH = 320
const HEIGHT = 480

const SOURCE_DIR = 'assets/hero-posters'
const OUT_DIR = 'public/media/wall'

await mkdir(OUT_DIR, { recursive: true })

const files = (await readdir(SOURCE_DIR)).filter((file) => /\.(png|jpe?g|webp)$/i.test(file))

let total = 0

for (const file of files) {
  const name = file.replace(/\.\w+$/, '')
  const out = `${OUT_DIR}/${name}.webp`

  const info = await sharp(`${SOURCE_DIR}/${file}`)
    /* Several sources ship with a flat letterbox border; trimming first stops the
       cover crop below from preserving a rim on one edge. */
    .trim({ threshold: 20 })
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' })
    .webp({ quality: 68 })
    .toFile(out)

  total += info.size
  console.log('[v0]', name.padEnd(34), `${Math.round(info.size / 1024)}KB`)
}

console.log(`[v0] ${files.length} tiles, ${Math.round(total / 1024)}KB total`)
