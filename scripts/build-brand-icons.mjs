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
 * TWO SETS, ONE SCRIPT. The reference-site marks were added second and needed the
 * exact same operation at a different output size, so they are a row in this table
 * rather than a `build-reference-icons.mjs` that would have been this file with two
 * constants changed.
 *
 * `size` is the largest size the set is ever painted at, x3 for high-DPR screens:
 * the platform icons reach 48px (Top 10 badges), the reference marks only 20px in
 * the footer directory. Building the second set at 144 too would trade 9 files'
 * worth of bytes for pixels no screen can resolve.
 *
 * `withoutEnlargement` on the reference set is the honest half of that: two of
 * those sites publish nothing bigger than a 16 or 32px favicon (see the source
 * table below), and upscaling them to 60 would ship a blurred bitmap that CLAIMS a
 * resolution the original never had. Left at native size, the browser does the
 * same interpolation for fewer bytes. The platform sources are all >=480px so the
 * flag is a no-op there, but it stays per-set rather than global so adding a small
 * platform logo fails visibly instead of silently shipping soft.
 */
const SETS = [
  { source: 'assets/brands', out: 'public/brands', size: 144 },
  { source: 'assets/reference', out: 'public/reference', size: 60, withoutEnlargement: true },
]

/**
 * `assets/reference/` provenance — each file is the site's OWN published icon,
 * fetched once and committed so the build never needs the network:
 *
 *   imdb.svg            theSVG (thesvg.org/icons/imdb) — IMDb's own apple-touch-icon
 *                       is a two-line "IMDb / Mobile" lockup whose second line is an
 *                       illegible smudge at 20px; this is the plain mark.
 *   rotten-tomatoes.jpg rottentomatoes.com apple-touch-icon-152
 *   metacritic.svg      metacritic.com/a/img/favicon.svg
 *   letterboxd.png      a.ltrbxd.com 500px decal
 *   justwatch.png       justwatch.com android_icon_192x192 (from its manifest.json)
 *   adorocinema.png     assets.adorocinema.com apple-touch-icon
 *   filmow.png          32px favicon (filmow.com 403s direct icon requests)
 *   sanook-movie.png    s.isanook.com 144px touch icon
 *   kapook-movie.png    kapook.com/favicon.ico, 16px BMP frame decoded to PNG
 *
 * Every mark remains the trademark of its owner; they are used here to identify the
 * site each link points at, which is what the footer's reference note says.
 */
let before = 0
let after = 0
let count = 0

for (const set of SETS) {
  await mkdir(set.out, { recursive: true })

  /* `.svg` is in the filter for the reference set — two of those sites publish a
     vector favicon, and sharp rasterises it at `density` rather than at its
     intrinsic 24-88px box, which is what keeps the mark crisp at 60px. */
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
