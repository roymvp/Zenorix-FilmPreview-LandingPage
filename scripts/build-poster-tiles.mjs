/**
 * Normalizes every source poster into ONE tile format, shared by the hero wall
 * and the two chart rails.
 *
 * Every source in `assets/posters/` is a real licensed poster, and they arrive at
 * two different sizes (197x276 for the Netflix set, 350x525 for the rest). Laying
 * those out directly would give tiles of two aspect ratios, so each one is
 * covered into a single 2:3 tile at a fixed size and written as WebP: the wall
 * paints twelve tiles at once behind a scrim and the rails paint twenty more, so
 * per-file weight matters far more than pixel-perfect fidelity.
 *
 * SOURCES LIVE OUTSIDE `public/` ON PURPOSE. They are build inputs, not site
 * assets: nothing at runtime requests them. While they sat in `public/media/
 * posters/` all 4.4 MB was deployed and publicly downloadable, for files the page
 * never references — 69% of the entire public directory.
 *
 * These posters carry their own BURNED-IN title lettering, and some carry the
 * service logo too. That is fine — in fact it is why the data is worth keeping
 * exact. A rail card renders no title text of its own, and the platform badge it
 * overlays is read from the same entry in `chartPool`, so as long as each entry
 * names the service that actually streams that title, the badge AGREES with
 * anything printed on the art. Getting a platform wrong is therefore a visible
 * bug, not just a metadata slip.
 *
 * Re-run with `node scripts/build-poster-tiles.mjs` after adding a source, then
 * reference the new tile from `lib/content/poster-wall.ts` (hero) or the chart
 * pool in `lib/content/charts.ts` (rails).
 */
import { mkdir, readdir } from 'node:fs/promises'
import sharp from 'sharp'

/* Tile geometry. 2:3 is the standard key-art ratio; 420x630 is ~2x the largest
   size a tile is ever painted at in the 420px-wide phone column. */
const WIDTH = 420
const HEIGHT = 630

const SOURCE_DIR = 'assets/posters'
const OUT_DIR = 'public/media/tiles'

/**
 * Crop anchor for the few sources that are TALLER than 2:3 (the 2026 theatrical
 * one-sheets run 0.60 rather than 0.667). Cover has to lose ~10% of their height,
 * and the default centre anchor takes half off each end — which on a one-sheet
 * lands mid-glyph on the release-date line and leaves a row of sliced letters.
 *
 * Losing a whole line reads as a crop; half a line reads as a broken image. So
 * anchor these to whichever end carries the title lettering and let the crop take
 * the other end cleanly:
 *   - `top` for posters logotyped at the top (the date block below is expendable)
 *   - `bottom` for posters logotyped at the bottom (the cast row above is)
 * Everything not listed is within a percent of 2:3 and crops invisibly.
 */
const CROP_ANCHOR = {
  'minions-and-monsters': 'top',
  'the-invite': 'bottom',
}

await mkdir(OUT_DIR, { recursive: true })

/* Directory-driven rather than a hardcoded list: the source folder holds nothing
   but chart posters, so dropping a file in is the whole "add a title" step. */
const files = (await readdir(SOURCE_DIR)).filter((file) => /\.(png|jpe?g|webp)$/i.test(file))

for (const file of files) {
  const name = file.replace(/\.\w+$/, '')
  const out = `${OUT_DIR}/${name}.webp`

  const info = await sharp(`${SOURCE_DIR}/${file}`)
    /* The small Netflix posters ship with a thin flat border; trim removes it so
       the cover crop below does not keep a rim on one edge. Generous threshold
       because the border is near-black rather than pure black after
       quantization. */
    .trim({ threshold: 20 })
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: CROP_ANCHOR[name] ?? 'centre' })
    .webp({ quality: 78 })
    .toFile(out)

  console.log('[v0] wrote', out, `${Math.round(info.size / 1024)}KB`)
}
