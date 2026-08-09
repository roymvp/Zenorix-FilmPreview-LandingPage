/**
 * Builds the landscape share card (og:image / twitter:image) for each film in
 * `movies` — the deep `/movie/[slug]` routes and each market home.
 *
 * Why this exists at all: the licensed art in `public/media/posters/` is portrait
 * 2:3, and a share card is ~1.91:1. Declaring a portrait file at 1200x630 makes
 * every Facebook/X/WhatsApp unfurl letterbox or centre-crop the title lettering
 * off the poster. Generating fresh landscape art instead would mean inventing key
 * art for a real film, which is exactly what this project just finished removing.
 *
 * So the card is DERIVED from the real poster and nothing else: the poster
 * scaled up and blurred to fill the frame, with the untouched poster composited
 * on top at full height. Every pixel still comes from the real art, the poster's
 * own title lettering stays legible and uncropped, and the ratio is correct.
 *
 * Run after adding a film: `node scripts/build-share-cards.mjs`
 */
import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'

/* 1200x630 is the size Facebook, X and LinkedIn all document, and the value
   declared in `lib/seo.ts`. Keep the two in sync. */
const WIDTH = 1200
const HEIGHT = 630

const SOURCE_DIR = 'public/media/posters'
const OUT_DIR = 'public/media/share'

/* Only the films that own a route need a card, so this list is explicit rather
   than directory-driven: the poster folder also holds the twenty chart tiles,
   which are never shared as a link. Keys match the `slug` in `movies`. */
const CARDS = {
  'avatar-fire-and-ash': 'avatar-fire-and-ash.png',
  'project-hail-mary': 'project-hail-mary.png',
  'mortal-kombat-2': 'mortal-kombat-2.png',
}

await mkdir(OUT_DIR, { recursive: true })

for (const [slug, file] of Object.entries(CARDS)) {
  const src = `${SOURCE_DIR}/${file}`

  /* Blurred backdrop: cover the full frame, then blur hard enough that the
     stretched lettering underneath reads as texture rather than as a second,
     out-of-focus title competing with the sharp poster on top. */
  const backdrop = await sharp(src)
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' })
    .blur(40)
    .modulate({ brightness: 0.55 })
    .toBuffer()

  /* Foreground: full poster height, nothing cropped. */
  const poster = await sharp(src)
    .resize({ height: HEIGHT, fit: 'inside' })
    .toBuffer()

  const info = await sharp(backdrop)
    .composite([{ input: poster, gravity: 'centre' }])
    .png({ quality: 90 })
    .toFile(`${OUT_DIR}/${slug}.png`)

  console.log('[v0] wrote', `${OUT_DIR}/${slug}.png`, `${Math.round(info.size / 1024)}KB`)
}
