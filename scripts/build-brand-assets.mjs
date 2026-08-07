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

// The mark alone: top of the artwork down to the gap.
await crop(firstInk, splitY, 'public/brand/zenorix-mark.webp', 256)
// The full lockup: mark + wordmark, for the hero.
await crop(firstInk, lastInk + 1, 'public/brand/zenorix-lockup.webp', 640)
