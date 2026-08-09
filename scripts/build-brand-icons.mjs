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

/** Largest painted size (48px) x 3 for high-DPR screens. */
const SIZE = 144

const SOURCE_DIR = 'assets/brands'
const OUT_DIR = 'public/brands'

await mkdir(OUT_DIR, { recursive: true })

const files = (await readdir(SOURCE_DIR)).filter((file) => /\.(png|jpe?g|webp)$/i.test(file))

let before = 0
let after = 0

for (const file of files) {
  const name = file.replace(/\.\w+$/, '')
  const out = `${OUT_DIR}/${name}.webp`

  const info = await sharp(`${SOURCE_DIR}/${file}`)
    /* `fit: 'contain'` with an opaque background, NOT 'cover': these are square
       logos already, so contain is a no-op on geometry, but it guarantees a
       non-square source would letterbox rather than have its edges cropped. */
    .resize(SIZE, SIZE, { fit: 'contain', background: '#000000' })
    .webp({ quality: 82 })
    .toFile(out)

  before += statSync(`${SOURCE_DIR}/${file}`).size
  after += info.size
  console.log('[v0] wrote', out, `${Math.round(info.size / 1024)}KB`)
}

console.log(
  `[v0] ${files.length} icons: ${Math.round(before / 1024)}KB -> ${Math.round(after / 1024)}KB`,
)
