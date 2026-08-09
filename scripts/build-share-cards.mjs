/**
 * Builds the brand share card (og:image / twitter:image) for the three market
 * pages.
 *
 * There is ONE card, not one per film. The site is a single page per market, so a
 * card showing one film would promise a destination about that film and deliver
 * the generic landing page instead. The card previews what the link actually
 * opens: the brand, over the same poster wall the hero renders behind its scrim.
 *
 * Why generated rather than hand-made: the licensed art is portrait 2:3 and a
 * share card is ~1.91:1, so pointing og:image at a poster makes every unfurl
 * letterbox it or crop the lettering off. Inventing fresh landscape art would
 * mean fabricating key art, which is what this project just finished removing —
 * so every pixel here comes from real art plus the real brand lockup.
 *
 * Run after changing the lockup or the wall tiles:
 *   node scripts/build-share-cards.mjs
 */
import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'

/* The size Facebook, X, WhatsApp and LinkedIn all document, and the value
   declared in `lib/seo.ts`. Keep the two in sync or scrapers crop the card. */
const WIDTH = 1200
const HEIGHT = 630

const OUT = 'public/media/share/zenorix.png'

/* The same six posters as the hero wall in `lib/content/poster-wall.ts`, in the
   same order, so the card and the page agree. */
const TILES = [
  'house-of-the-dragon',
  'avatar-fire-and-ash',
  'rick-and-morty',
  'project-hail-mary',
  'mortal-kombat-2',
  'devil-wears-prada-2',
]

const COLUMN_W = Math.ceil(WIDTH / TILES.length)

/* Each poster fills one full-bleed column. `cover` at a taller-than-column box
   keeps the art's own proportions and crops the overflow, rather than squashing a
   2:3 poster into a narrow strip. */
const columns = await Promise.all(
  TILES.map((slug, i) =>
    sharp(`public/media/posters/${slug}.png`)
      .resize(COLUMN_W, HEIGHT, {
        fit: 'cover',
        /* Alternate the crop window so six posters cropped identically don't
           produce a visible repeating band across the card. */
        position: i % 2 === 0 ? 'top' : 'centre',
      })
      .toBuffer(),
  ),
)

/* Scrim: the lockup is light silver, and raw key art behind it leaves the
   wordmark unreadable at the ~500px a chat client actually renders. */
const scrim = Buffer.from(
  `<svg width="${WIDTH}" height="${HEIGHT}">
     <rect width="${WIDTH}" height="${HEIGHT}" fill="#000" opacity="0.74"/>
   </svg>`,
)

const LOCKUP_W = 440
const lockup = await sharp('public/brand/zenorix-lockup.webp')
  .resize({ width: LOCKUP_W })
  .toBuffer()
const { height: lockupH = 0 } = await sharp(lockup).metadata()

await mkdir('public/media/share', { recursive: true })

const info = await sharp({
  create: { width: WIDTH, height: HEIGHT, channels: 3, background: '#000' },
})
  .composite([
    ...columns.map((input, i) => ({ input, left: i * COLUMN_W, top: 0 })),
    { input: scrim, left: 0, top: 0 },
    {
      input: lockup,
      left: Math.round((WIDTH - LOCKUP_W) / 2),
      top: Math.round((HEIGHT - lockupH) / 2),
    },
  ])
  .png({ quality: 90 })
  .toFile(OUT)

console.log('[v0] wrote', OUT, `${Math.round(info.size / 1024)}KB`)
