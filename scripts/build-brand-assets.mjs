/**
 * One-off asset pipeline for the supplied Zenorix logo.
 *
 * The source file is a square PNG on a SOLID BLACK plate carrying two things
 * stacked: the "Z" mark on top and the ZENORIX wordmark below it. Neither can be
 * used as-is on the site — a black plate over the hero's poster wall would read
 * as a rectangle sitting on the art — so this script does two jobs:
 *
 *  1. knocks the black out to real alpha (`alpha = max(r,g,b)`, i.e. the plate's
 *     own luminance becomes opacity, which keeps the mark's soft bevels and glow
 *     as semi-transparent pixels instead of hard-edging them);
 *  2. splits the lockup at the widest dark row-gap between the two elements, so
 *     the mark and the wordmark become independent assets: the top bar wants the
 *     mark alone in a 30px box, the hero wants the full lockup.
 *
 * Re-run with `node scripts/build-brand-assets.mjs` if the source logo changes.
 */
import sharp from 'sharp'

/* Lives OUTSIDE `public/` on purpose: the 3.2MB master is a build input, and
   anything under `public/` is served and deployed verbatim. */
const SOURCE = 'assets/zenorix-logo-source.png'

const base = sharp(SOURCE).ensureAlpha()
const { width, height } = await base.metadata()
const { data } = await base.raw().toBuffer({ resolveWithObject: true })

/* Row luminance profile, used to find both the content bounds and the gap
   between the mark and the wordmark. */
const rowMax = new Array(height).fill(0)
for (let y = 0; y < height; y += 1) {
  let max = 0
  for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * 4
    const lum = Math.max(data[i], data[i + 1], data[i + 2])
    if (lum > max) max = lum
  }
  rowMax[y] = max
}

/* Anything under this is the black plate, not artwork. */
const INK = 40

/** Widest run of plate rows inside the middle of the image = the lockup's gap. */
function widestGap(from, to) {
  let best = { start: 0, end: 0 }
  let run = null
  for (let y = from; y < to; y += 1) {
    if (rowMax[y] < INK) {
      run ??= y
    } else if (run !== null) {
      if (y - run > best.end - best.start) best = { start: run, end: y }
      run = null
    }
  }
  if (run !== null && to - run > best.end - best.start) best = { start: run, end: to }
  return best
}

const firstInk = rowMax.findIndex((v) => v >= INK)
const lastInk = rowMax.length - 1 - [...rowMax].reverse().findIndex((v) => v >= INK)
/* Searched between 45% and 85% of the height: the gap sits below the mark and
   above the wordmark, and bounding the search stops it locking onto the plate
   margins at either end. */
const gap = widestGap(Math.round(height * 0.45), Math.round(height * 0.85))
const splitY = Math.round((gap.start + gap.end) / 2)

console.log('[v0] logo bounds', { width, height, firstInk, lastInk, gap, splitY })

/** Black plate -> alpha, so the artwork can sit on any background. */
async function toTransparent(input) {
  const img = sharp(input).ensureAlpha()
  const meta = await img.metadata()
  const raw = await img.raw().toBuffer()
  for (let i = 0; i < raw.length; i += 4) {
    const lum = Math.max(raw[i], raw[i + 1], raw[i + 2])
    // Hard floor first: JPEG-era noise in the plate sits around 8–12 and would
    // otherwise survive as a faint grey haze once the logo is laid over the
    // hero's poster wall. Above it, 1.5x so mid-tone bevels stay solid instead
    // of washing out; clamped at 255.
    raw[i + 3] = lum < 14 ? 0 : Math.min(255, Math.round(lum * 1.5))
  }
  return sharp(raw, {
    raw: { width: meta.width, height: meta.height, channels: 4 },
  })
    .png()
    .toBuffer()
}

async function crop(top, bottom, out, resizeWidth) {
  const cropped = await sharp(SOURCE)
    .extract({ left: 0, top, width, height: bottom - top })
    .png()
    .toBuffer()
  const transparent = await toTransparent(cropped)
  // `trim` runs last so it works on the alpha channel and removes the plate's
  // own margin rather than a black border it can no longer see.
  const resized = sharp(transparent)
    .trim({ threshold: 4 })
    .resize({ width: resizeWidth, withoutEnlargement: true })

  /* WebP, not PNG: these are smooth gradient artwork with an alpha channel, and
     the equivalent PNG of the lockup is ~390KB against ~35KB here. The hero
     lockup is painted in the first viewport, so that difference is LCP budget. */
  const info = await resized.webp({ quality: 90, effort: 6 }).toFile(out)
  console.log('[v0] wrote', out, `${Math.round(info.size / 1024)}KB`, info.width, info.height)
}

/* The mark alone: top of the artwork down to the gap.
   
   128px, down from 256. The mark is only ever rendered small — 26px tall in the top
   bar (`.zx-brand-mark`), 22px in the footer masthead, 18px on the footer contact
   row — and `height` + `width: auto` means the widest it is ever painted is about
   34 CSS px. At 128 that still covers a 3x display with room to spare; 256 was
   sending roughly 7x the pixels of the largest box that displays it.
   
   Kept a power-of-two multiple of the display size rather than trimming to an exact
   2x fit, because the browser's downscale is cleaner from a clean ratio and the
   saving past this point is a few hundred bytes on an already-tiny file. */
await crop(firstInk, splitY, 'public/brand/zenorix-mark.webp', 128)
// The full lockup: mark + wordmark, for the hero.
await crop(firstInk, lastInk + 1, 'public/brand/zenorix-lockup.webp', 640)

/**
 * THE STRUCTURED-DATA LOGO. Not used anywhere in the UI — this exists purely for
 * `Organization.logo` in the JSON-LD, and it is a SEPARATE FILE because Google's
 * requirements for that field and the page's requirements for the top bar
 * disagree on all three counts.
 *
 * The mark above is 128px wide because it is never painted larger than ~34 CSS px.
 * Google's logo guidelines say the image "must be 112x112px, at minimum" — and the
 * mark is 128x98, so its HEIGHT is under the floor. Pointing the schema at it
 * silently forfeited logo eligibility: no error anywhere, the file loads fine, it
 * is simply ignored. (That is exactly what happened — the schema had been declaring
 * a stale 256x196 from before the mark was optimised, so nothing looked wrong.)
 *
 * Three deliberate differences from the UI asset:
 *
 *  1. SQUARE, 512x512. The guidance is a square minimum, and a knowledge panel
 *     squares off whatever it is given; a 4:3 source risks being stretched or
 *     cropped. `contain` fits the artwork inside and pads it rather than distorting
 *     it.
 *  2. ON THE BLACK PLATE, not transparent. Google says to make sure the logo "looks
 *     how you intend it to look on a purely white background" — and this artwork
 *     fails that test badly, because `toTransparent` turns luminance into alpha, so
 *     the mark's dark navy outline and bevels become INVISIBLE on white. The plate
 *     is not a decoration here: the logo was designed on black, and restoring it is
 *     what makes the file render as intended against a white panel.
 *  3. PNG, not WebP. WebP is the right call for the UI assets, but this one is
 *     consumed by crawlers and knowledge-panel renderers rather than by browsers,
 *     and PNG is the format with no support questions attached. It is ~20KB and is
 *     never served to a visitor, so the size argument that governs the other two
 *     files does not apply.
 *
 * If the source logo changes, this regenerates with the rest. If the schema's
 * declared dimensions change, they must match SCHEMA_LOGO — `lib/seo.ts` states
 * them explicitly and a mismatch is the failure mode described above.
 */
const SCHEMA_LOGO = 256
const schemaSource = await sharp(SOURCE)
  .extract({ left: 0, top: firstInk, width, height: splitY - firstInk })
  .trim({ threshold: 4 })
  .png()
  .toBuffer()

const schemaInfo = await sharp(schemaSource)
  .resize({
    width: SCHEMA_LOGO,
    height: SCHEMA_LOGO,
    /* Pads instead of cropping or distorting. The plate colour is the source's own
       background, so the padding is indistinguishable from the artwork's own. */
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 1 },
  })
  .flatten({ background: { r: 0, g: 0, b: 0 } })
  .png()
  .toFile('public/brand/zenorix-logo-square.png')

console.log(
  '[v0] wrote public/brand/zenorix-logo-square.png',
  `${Math.round(schemaInfo.size / 1024)}KB`,
  `${schemaInfo.width}x${schemaInfo.height}`,
  schemaInfo.width >= 112 && schemaInfo.height >= 112 ? '(>= 112 floor OK)' : '(!! UNDER FLOOR)',
)
