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

/* TWO WIDTHS, because one file cannot serve both ends of this layout.

   320 is 2:3 at ~1.05x the widest painted size (307px at a 2560px viewport, via
   `--zx-wall-col: max(184px, 12vw)`). Retina renders this slightly soft, which is
   invisible under the scrim and is the trade being made deliberately.

   240 exists for phones. The mobile tile is 130 CSS px, so 320 is more pixels
   than the device can show at any DPR under 2.5 — PageSpeed measured 21.4KB of
   pure waste on ONE tile of twenty, on the exact hardware these markets run
   (Moto G Power, DPR 1.75, painting 228px). 240 is the smallest step that covers
   that device without upscaling. `sizes` in hero-billboard.tsx picks between
   them, and a DPR-2 phone still takes the 320 because it genuinely needs 260px —
   so this adds a floor and takes nothing away.

   KEEP IN SYNC with the `srcset` in hero-billboard.tsx: a width added here does
   nothing until that component offers it, and a width REMOVED here 404s. */
const WIDTHS = [320, 240]
const HEIGHT = 480

/* Down from 68, and this is the cheapest 100KB on the page.

   The rails' pipeline justifies q78 by saying a card is clicked and inspected.
   The opposite is true here by construction: every tile sits behind a scrim
   running 50%→100% black, rotated -9deg, drifting continuously, at 130px wide.
   PageSpeed still called ~18KB per tile recoverable through compression alone at
   q68. Verified at q54 in the browser against the live wall — no visible
   difference through the scrim, ~35% off every file.

   Do NOT raise this to "improve the art". The art is not readable here at any
   quality; that is what the scrim is for. If a tile ever needs to be looked at
   directly it belongs in `build-poster-tiles.mjs`, not in this pool. */
const QUALITY = 54

const SOURCE_DIR = 'assets/hero-posters'
const OUT_DIR = 'public/media/wall'

await mkdir(OUT_DIR, { recursive: true })

const files = (await readdir(SOURCE_DIR)).filter((file) => /\.(png|jpe?g|webp)$/i.test(file))

let total = 0

for (const file of files) {
  const name = file.replace(/\.\w+$/, '')

  /* Decode and trim ONCE, then branch per width. `.clone()` after the shared
     stages means the JPEG is not decoded twice and the trim cannot land on a
     different pixel row for the two outputs, which would leave the widths
     framed a hair apart — visible as a jump when `srcset` swaps files on
     rotation. */
  const source = sharp(`${SOURCE_DIR}/${file}`)
    /* Several sources ship with a flat letterbox border; trimming first stops the
       cover crop below from preserving a rim on one edge. */
    .trim({ threshold: 20 })

  const sizes = []

  for (const width of WIDTHS) {
    /* The widest width keeps the bare name, so every existing reference in
       `poster-wall.ts` (and the `src` fallback for anything that ignores
       `srcset`) stays valid. Narrower ones get a `-<width>w` suffix. */
    const out =
      width === WIDTHS[0] ? `${OUT_DIR}/${name}.webp` : `${OUT_DIR}/${name}-${width}w.webp`

    const info = await source
      .clone()
      .resize(width, Math.round((HEIGHT / WIDTHS[0]) * width), {
        fit: 'cover',
        position: 'centre',
      })
      .webp({ quality: QUALITY })
      .toFile(out)

    total += info.size
    sizes.push(`${width}w ${Math.round(info.size / 1024)}KB`)
  }

  console.log('[v0]', name.padEnd(34), sizes.join('  '))
}

console.log(
  `[v0] ${files.length} tiles x ${WIDTHS.length} widths, ${Math.round(total / 1024)}KB total`,
)
