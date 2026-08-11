/**
 * Downscales the platform logos to the size the page actually paints them at.
 *
 * The sources in `assets/brands/` are 480-512px app-store icons, but every one of
 * the 42 <img> elements that reference them renders at 24px or 48px CSS. At the
 * original size the eleven files came to 1.1 MB for roughly 30 KB of visible
 * pixels — and each one decoded a ~500x500 bitmap into memory to paint a 24px
 * square.
 *
 * 144px = the largest painted size (48px) at 3x DPR, which covers every phone
 * these markets use. Going higher only pays for pixels no screen can resolve.
 *
 * WebP because none of the sources have an alpha channel (verified) and WebP's
 * lossy mode is far smaller than PNG on this kind of flat logo artwork.
 *
 * Re-run with `node scripts/build-brand-icons.mjs` after adding a logo, then
 * register it in `lib/content/platforms.ts`.
 */
import { mkdir, readdir } from 'node:fs/promises'
import { statSync } from 'node:fs'
import sharp from 'sharp'

/**
 * ONE SET: the platform app icons, for the trust strip and the Top 10 badges.
 *
 * There was a second set here — `assets/reference` -> `public/reference`, the nine
 * rating-site marks for the footer directory. It has been removed along with its
 * sources, and the reason is worth keeping: those nine were each sourced by hand from
 * whatever the site happened to publish, so the set mixed app icons, apple-touch
 * icons, an SVG favicon, a wordmark and a 16px `.ico` frame. Beside this set's eleven
 * uniform App Store icons, the footer ended up showing three different visual
 * families in two adjacent rows.
 *
 * The footer now builds ALL twenty of its icons from a single provider in
 * `build-footer-icons.mjs`. That script owns the footer; this one owns the app icons
 * that appear on product surfaces, where "the app" is the right referent.
 *
 * 144px = the largest painted size (48px) at 3x DPR, which covers every phone these
 * markets use. Going higher only pays for pixels no screen can resolve.
 */
const SETS = [{ source: 'assets/brands', out: 'public/brands', size: 144 }]
let before = 0
let after = 0
let count = 0

for (const set of SETS) {
  await mkdir(set.out, { recursive: true })

  /* `.svg` stays in the filter even though every current source is a raster: it costs
     nothing, and sharp rasterises vectors at `density` rather than at their intrinsic
     box, so a vector logo dropped in here builds crisp instead of being skipped. */
  const files = (await readdir(set.source)).filter((file) =>
    /\.(png|jpe?g|webp|svg)$/i.test(file),
  )

  for (const file of files) {
    const name = file.replace(/\.\w+$/, '')
    const out = `${set.out}/${name}.webp`

    const info = await sharp(`${set.source}/${file}`, { density: 600 })
      /* `fit: 'contain'` with an opaque background, NOT 'cover': these are square
         logos already, so contain is a no-op on geometry, but it guarantees a
         non-square source would letterbox rather than have its edges cropped.
         
         Opaque black, and it has to be: the page background is black, and most of
         these marks ship with a transparent field. Flattening here rather than
         leaving alpha to the browser is what gives every chip the same solid tile
         the platform icons have. */
      .resize(set.size, set.size, {
        fit: 'contain',
        background: '#000000',
        withoutEnlargement: set.withoutEnlargement ?? false,
      })
      .flatten({ background: '#000000' })
      .webp({ quality: 82 })
      .toFile(out)

    before += statSync(`${set.source}/${file}`).size
    after += info.size
    count += 1
    console.log('[v0] wrote', out, `${info.width}px`, `${Math.round(info.size / 1024)}KB`)
  }
}

console.log(
  `[v0] ${count} icons: ${Math.round(before / 1024)}KB -> ${Math.round(after / 1024)}KB`,
)
