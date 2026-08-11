/**
 * Builds the footer directory icons — ALL of them, both groups, from one source.
 *
 * WHY THIS EXISTS, and why it replaces the hand-assembled set in
 * `build-brand-icons.mjs` for the footer's purposes:
 *
 * The old reference-site icons were sourced per site by hand, and the provenance
 * table in that script is the confession: five came from app icons or touch icons
 * (full-bleed coloured tiles), IMDb came from a wordmark, Metacritic from an
 * `favicon.svg`, Filmow and Kapook from 32px and 16px `.ico` files. Set beside the
 * partner row — eleven genuine App Store icons, every one a full-bleed square — the
 * result was three visual families in two adjacent rows: full-bleed tiles, circles,
 * and bare transparent logos floating on the footer surface.
 *
 * No amount of CSS fixes that, because it is a property of the assets. So the fix is
 * at the source: ONE provider, ONE asset type, for all twenty links. Favicons are
 * the right choice for a link directory specifically because they are what a browser
 * shows next to a URL — the visual convention for "another website" — where an App
 * Store icon means "an app you can install", which is not what these links are.
 *
 * The partner row keeps its App Store icons everywhere ELSE (trust strip, poster
 * badges) — see `PLATFORMS[id].icon`. Those are product surfaces where "the app" is
 * the honest referent. Only the footer directory switches, and only because there it
 * has to sit next to nine reference sites.
 *
 * Google's favicon service is the provider rather than each site's own
 * `/favicon.ico`, and that is a deliberate trade. Fetching directly was tried first
 * and produced exactly the mess this script exists to end: nine of the twenty serve
 * a multi-image `.ico` container that sharp cannot decode at all, `filmow.com`
 * answers `/favicon.ico` with an HTML error page, and `imdb.com` returns zero bytes.
 * Normalising that by hand is how the original inconsistency happened. The service
 * returns a decoded raster at a predictable size for all twenty, which is the whole
 * point.
 *
 * Run it when the link list changes:
 *   node scripts/build-footer-icons.mjs
 *
 * Output is committed. There is NO runtime dependency on the service — this runs on
 * a developer machine, writes into `public/favicons/`, and the app only ever reads
 * the local files.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

/**
 * `slug -> domain`, in footer order: the eleven partners, then the reference sites.
 *
 * Domains, not the full hrefs from `outbound.ts`, because the favicon service keys
 * on the registrable domain. Two differ from the link URL on purpose:
 *   - `fox-one` links to `fox.com`, which is where the service streams (see the note
 *     on `PLATFORM_SITES`).
 *   - `sanook-movie` and `kapook-movie` link to their `movie.` subdomains, but the
 *     favicon lives on the parent domain, which is what a browser would show.
 */
const SITES = {
  netflix: 'netflix.com',
  'disney-plus': 'disneyplus.com',
  'hbo-max': 'hbomax.com',
  'prime-video': 'primevideo.com',
  'apple-tv': 'tv.apple.com',
  'paramount-plus': 'paramountplus.com',
  hulu: 'hulu.com',
  peacock: 'peacocktv.com',
  'amc-plus': 'amcplus.com',
  nbc: 'nbc.com',
  'fox-one': 'fox.com',
  imdb: 'imdb.com',
  'rotten-tomatoes': 'rottentomatoes.com',
  metacritic: 'metacritic.com',
  letterboxd: 'letterboxd.com',
  justwatch: 'justwatch.com',
  adorocinema: 'adorocinema.com',
  filmow: 'filmow.com',
  'sanook-movie': 'sanook.com',
  'kapook-movie': 'kapook.com',
}

/**
 * 64px for a mark displayed at 18–20px: enough for a 3x screen, and small enough
 * that twenty of them stay well under the weight of a single poster. Requesting 128
 * from the service and downsampling to 64 is deliberate — several sites' largest
 * native favicon IS 128, and asking for the larger size then reducing gives a
 * cleaner result than asking for 64 and getting an upscale.
 */
const OUT_PX = 64
const OUT_DIR = 'public/favicons'

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const entries = Object.entries(SITES)
  const small = []
  let total = 0

  for (const [slug, domain] of entries) {
    const url = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${slug}: HTTP ${res.status} for ${domain}`)

    const input = Buffer.from(await res.arrayBuffer())
    const meta = await sharp(input).metadata()

    // Worth surfacing rather than swallowing: a site whose best favicon is 16px
    // cannot be made sharp by this script, and the report is how that stays known.
    if (meta.width < OUT_PX) small.push(`${slug} (${meta.width}px)`)

    const output = await sharp(input)
      // `contain`, never `cover`. A favicon that is not square — and a few are not —
      // must be letterboxed, not cropped: cropping a mark is how you lose the part
      // that makes it recognisable.
      //
      // Transparent padding, so a mark with its own transparent background keeps it
      // and sits on the footer surface, while one with a baked-in tile keeps that.
      // Forcing a background here would put a light square behind every dark mark.
      .resize(OUT_PX, OUT_PX, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 90 })
      .toBuffer()

    await writeFile(`${OUT_DIR}/${slug}.webp`, output)
    total += output.length
    console.log(
      `  ${slug.padEnd(16)} ${String(`${meta.width}x${meta.height}`).padEnd(9)} ${meta.format.padEnd(4)} -> ${String(Math.round(output.length / 102.4) / 10).padStart(5)}KB`,
    )
  }

  console.log(`\n${entries.length} icons, ${Math.round(total / 1024)}KB total`)
  if (small.length) {
    console.log(`\nBelow ${OUT_PX}px natively (upscaled, will look soft):`)
    console.log(`  ${small.join(', ')}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
