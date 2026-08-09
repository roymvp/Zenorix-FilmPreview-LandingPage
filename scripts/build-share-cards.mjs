/**
 * Builds the Open Graph share card for each market — the image that appears when
 * someone pastes a zenorix.app link into WhatsApp, Telegram, X or iMessage.
 *
 * Run: `node scripts/build-share-cards.mjs`
 * Out: `public/media/share/zenorix-{en,pt-br,th}.jpg` (1200x630)
 *
 * THREE CARDS, NOT ONE. The pitch on the card is the price, and the price differs
 * in every market ($1.25 / R$ 6,20 / 43 บาท per month). One English card would
 * quote US dollars to a Brazilian reader.
 *
 * WHY THE COPY IS NOT WRITTEN HERE: every string is read out of
 * `dictionaries/*.json` — the same file the page renders from. Hardcoding card
 * copy is how a share card ends up advertising a price the site no longer
 * charges, silently, because nobody re-reads a generated PNG.
 *
 * WHY THE POSTERS GO THROUGH SHARP: the tiles are WebP and satori's image support
 * does not cover WebP. Each is converted to a PNG buffer and inlined as a data
 * URI, so this script needs no network and no undocumented decoder path.
 *
 * WHY THE FONTS ARE VENDORED: satori has no system fonts to fall back on and
 * cannot read woff2. `assets/fonts/*.ttf` are real TrueType files committed to
 * the repo. Without them every glyph renders as a tofu box — and it fails
 * SILENTLY, producing a card that looks fine to the script and broken to
 * everyone else. Thai needs its own face; Roboto carries no Thai glyphs.
 *
 * The 1200x630 output must stay in sync with the dimensions declared in
 * `lib/seo.ts`, or scrapers reserve the wrong box and crop the card.
 */

import { createElement as h } from 'react'
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import sharp from 'sharp'

/* `next/og` ships as CommonJS with no ESM export condition, so a bare
   `import ... from 'next/og'` throws ERR_MODULE_NOT_FOUND here. */
const { ImageResponse } = createRequire(import.meta.url)('next/og')

const WIDTH = 1200
const HEIGHT = 630

const TILE_DIR = 'public/media/tiles'
const FONT_DIR = 'assets/fonts'
const OUT_DIR = 'public/media/share'

/** Must match `locales` in `lib/i18n/config.ts`. */
const LOCALES = ['en', 'pt-br', 'th']

/** Mirrors `--md-sys-color-*` in `app/globals.css`. */
const SURFACE = '#08090b'
const ON_SURFACE = '#ffffff'
const MUTED = '#a4aebc'

/** Replaces `{token}` placeholders, matching `fill()` in `lib/i18n`. */
const fill = (template, values) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`))

const dataUri = async (file) => {
  const png = await sharp(file).png().toBuffer()
  return `data:image/png;base64,${png.toString('base64')}`
}

/**
 * The poster wall behind the copy: six staggered columns bleeding off every edge.
 * The stagger — plus columns taller than the card — is what stops it reading as a
 * tidy grid of thumbnails.
 */
function collage(posters) {
  const columns = 6
  const colWidth = Math.ceil(WIDTH / columns)
  const tileHeight = Math.round(colWidth * 1.5)
  /* Per-column vertical offsets so no two adjacent posters share a top edge. */
  const offsets = [-150, -40, -230, -90, -190, -20]

  return h(
    'div',
    {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: WIDTH,
        height: HEIGHT,
        display: 'flex',
        alignItems: 'flex-start',
      },
    },
    offsets.map((offset, col) =>
      h(
        'div',
        {
          key: col,
          style: {
            display: 'flex',
            flexDirection: 'column',
            width: colWidth,
            marginTop: offset,
          },
        },
        /* Three per column always overfills 630px given the offsets above. */
        [0, 1, 2].map((row) =>
          h('img', {
            key: row,
            src: posters[(col * 3 + row) % posters.length],
            width: colWidth,
            height: tileHeight,
            style: { objectFit: 'cover' },
          }),
        ),
      ),
    ),
  )
}

function card({ lockup, posters, headline, price, trial, specs }) {
  return h(
    'div',
    {
      style: {
        position: 'relative',
        display: 'flex',
        width: WIDTH,
        height: HEIGHT,
        backgroundColor: SURFACE,
        fontFamily: 'Roboto, NotoSansThai',
      },
    },
    collage(posters),
    /* Scrim: opaque behind the copy, thinning to the right so the posters still
       read as posters. Without it the headline sits on top of faces. */
    h('div', {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: WIDTH,
        height: HEIGHT,
        backgroundImage: `linear-gradient(100deg, ${SURFACE} 0%, rgba(8,9,11,0.96) 40%, rgba(8,9,11,0.72) 64%, rgba(8,9,11,0.42) 100%)`,
      },
    }),
    h(
      'div',
      {
        style: {
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: 760,
          height: HEIGHT,
          padding: '64px 72px',
        },
      },
      h('img', { src: lockup, width: 132, height: 123 }),
      h(
        'div',
        {
          style: {
            display: 'flex',
            marginTop: 26,
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.16,
            letterSpacing: -1.2,
            color: ON_SURFACE,
          },
        },
        headline,
      ),
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', marginTop: 30 } },
        /* Inverted pill — the price IS the pitch, so it gets the only solid fill. */
        h(
          'div',
          {
            style: {
              display: 'flex',
              backgroundColor: ON_SURFACE,
              color: SURFACE,
              fontSize: 30,
              fontWeight: 700,
              padding: '12px 24px',
              borderRadius: 999,
            },
          },
          price,
        ),
        h(
          'div',
          { style: { display: 'flex', marginLeft: 20, fontSize: 26, color: MUTED } },
          trial,
        ),
      ),
      h(
        'div',
        { style: { display: 'flex', marginTop: 26, fontSize: 22, color: MUTED } },
        specs,
      ),
    ),
  )
}

const tiles = (await readdir(TILE_DIR)).filter((f) => f.endsWith('.webp')).sort()
if (tiles.length === 0) {
  throw new Error(`No tiles in ${TILE_DIR} — run scripts/build-poster-tiles.mjs first`)
}

const posters = await Promise.all(tiles.map((f) => dataUri(path.join(TILE_DIR, f))))
const lockup = await dataUri('public/brand/zenorix-lockup.webp')

const fonts = [
  {
    name: 'Roboto',
    data: await readFile(path.join(FONT_DIR, 'roboto-700.ttf')),
    weight: 700,
    style: 'normal',
  },
  {
    name: 'NotoSansThai',
    data: await readFile(path.join(FONT_DIR, 'noto-sans-thai-700.ttf')),
    weight: 700,
    style: 'normal',
  },
]

await mkdir(OUT_DIR, { recursive: true })

for (const locale of LOCALES) {
  const dict = JSON.parse(await readFile(`dictionaries/${locale}.json`, 'utf8'))
  const viewing = dict.about.viewing.specs

  const element = card({
    lockup,
    posters,
    headline: dict.about.apps.label,
    price: fill(dict.hero.price, dict.market),
    trial: dict.about.trial.value,
    specs: `${viewing.resolution} · ${viewing.audio} · ${viewing.playback}`,
  })

  const png = Buffer.from(
    await new ImageResponse(element, { width: WIDTH, height: HEIGHT, fonts }).arrayBuffer(),
  )

  /* JPEG, not the PNG satori hands back. The card is 80% photographic poster art,
     which PNG cannot compress: the same image is 930 KB as PNG and 94 KB at q84,
     visually identical. Chat clients refetch this on every unfurl, so the extra
     836 KB buys nothing. `4:4:4` keeps full chroma resolution so the coloured
     wordmark and the white-on-dark type stay crisp — the usual `4:2:0` halves
     chroma and fringes exactly that kind of edge. No alpha channel is needed
     since the card is a full-bleed rectangle. */
  const buffer = await sharp(png)
    .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toBuffer()

  const out = path.join(OUT_DIR, `zenorix-${locale}.jpg`)
  await writeFile(out, buffer)
  console.log(`[v0] wrote ${out}  ${(buffer.length / 1024).toFixed(0)} KB`)
}
