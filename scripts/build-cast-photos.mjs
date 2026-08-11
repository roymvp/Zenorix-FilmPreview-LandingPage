/**
 * Fetches a headshot for every billed cast member in `lib/content/titles.ts`.
 *
 * WHY WIKIMEDIA COMMONS AND NOT A STREAMING SERVICE'S CDN.
 *
 * The obvious source for actor headshots is whatever the big catalogues paint on
 * their own cast rails, and those are all editorial stills licensed to that
 * service. Re-hosting them is a straight copyright problem, and hotlinking them is
 * that plus a broken image the day they rotate the path.
 *
 * Commons is free-licensed BY POLICY — it does not accept fair-use uploads at all
 * — so every file this script can reach is one that may legitimately be
 * republished. The cost is attribution: most of these are CC BY or CC BY-SA, which
 * require crediting the photographer. That is why the manifest carries `artist` and
 * `license` per person and why the page renders a credits disclosure under the cast
 * grid. Dropping those fields would turn a licensed image into an unlicensed one.
 *
 * WHY THIS BATCHES INSTEAD OF LOOPING.
 *
 * The first version of this script resolved one name at a time: search, then fetch
 * the entity, then fetch the Commons metadata. At 175 cast members that is ~525
 * calls, and Wikidata started returning a plain-text "too many requests" body
 * partway through — no amount of per-request backoff got it to the end, because the
 * problem was the request COUNT, not the spacing.
 *
 * So the lookup is batched instead. `wbgetentities` accepts 50 titles per call and
 * resolves English Wikipedia article titles straight to entities, which is exactly
 * what a cast name is; Commons `imageinfo` likewise takes 50 files per call. That
 * turns ~525 requests into about a dozen. Only the names that miss the batch fall
 * back to a per-name search, and in the current data that is a short list.
 *
 * The image bytes then come from upload.wikimedia.org, which is a CDN rather than
 * an API and is not the thing that was rate-limiting.
 *
 * DISAMBIGUATION. There are two notable Tom Hollands (the Spider-Man lead and the
 * Fright Night director). Matching on the enwiki article title gets the right one
 * because that is the name the record already uses, and the search fallback checks
 * for `instance of human` before accepting a hit. The script prints the Wikidata
 * description it matched for every person — read that report when adding cast,
 * because a confidently wrong face is worse than no face.
 *
 *   node scripts/build-cast-photos.mjs
 *
 * Writes `public/cast/<slug>.webp` and `lib/content/cast-photos.json`. Both are
 * committed; this does not run at build time, so a Wikimedia outage can never break
 * a deploy.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

/** Painted at 44px (mobile) and 56px (desktop); 168 covers 56 at 3x DPR. */
const SIZE = 168

const UA = {
  'User-Agent': 'zenorix-site/1.0 (static asset build; one-off, cached to repo)',
}

const OUT_DIR = 'public/cast'
const MANIFEST = 'lib/content/cast-photos.json'

/** Both APIs cap multi-value title parameters at 50. */
const BATCH = 50

/** Matches `castPhotoSlug` in lib/content/cast.ts. Keep the two in step. */
const slugify = (name) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * A GET that survives Wikidata's rate limiter.
 *
 * The limiter answers with a PLAIN-TEXT "too many requests" body and a 200, not a
 * 429, so the only way to detect it is that the body does not parse as JSON.
 *
 * Returns `{}` rather than throwing once the retries are spent. Throwing was the
 * previous behaviour and it was wrong: this script's phases are independent, so a
 * limiter that trips during the last-ditch name search should cost the handful of
 * names that search was for, not the 138 portraits already resolved by the batch
 * phase before it. An empty object flows through every caller as "no data for this
 * request", and the person lands in the no-photo report at the end.
 */
async function json(url, attempt = 1) {
  await sleep(400)
  const response = await fetch(url, { headers: UA })
  const body = await response.text()
  try {
    return JSON.parse(body)
  } catch {
    if (attempt > 4) {
      console.log(`  !! gave up on ${url.slice(0, 80)}: ${body.slice(0, 60)}`)
      return {}
    }
    await sleep(attempt * 4000)
    console.log(`  ...throttled, retry ${attempt}`)
    return json(url, attempt + 1)
  }
}

const chunk = (items, size) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, i * size + size),
  )

/* Cast names come from a regex over titles.ts rather than an import: the module
   uses `@/` path aliases that plain node cannot resolve, and standing up a TS
   loader to read some arrays of strings is more machinery than the job needs. */
const source = await readFile('lib/content/titles.ts', 'utf8')
const names = [
  ...new Set(
    [...source.matchAll(/^\s*cast:\s*\[([^\]]*)\]/gm)].flatMap((match) =>
      [...match[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((quoted) =>
        // The file escapes non-ASCII as \uXXXX, so unescape before searching.
        JSON.parse(`"${quoted[1].replace(/\\'/g, "'").replace(/"/g, '\\"')}"`),
      ),
    ),
  ),
].sort()

console.log(`${names.length} distinct cast members in titles.ts`)

/* ---- 1. name -> Wikidata entity, 50 at a time -------------------------- */

const pickImage = (entity) => {
  const claims = entity?.claims ?? {}
  const isHuman = (claims.P31 ?? []).some((c) => c.mainsnak?.datavalue?.value?.id === 'Q5')
  const image = claims.P18?.[0]?.mainsnak?.datavalue?.value
  return isHuman && image ? { image, description: entity.descriptions?.en?.value ?? '' } : null
}

/** name -> { image, description } */
const found = new Map()
const unresolved = []

for (const group of chunk(names, BATCH)) {
  const data = await json(
    `https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&titles=${encodeURIComponent(
      group.join('|'),
    )}&props=claims|descriptions|sitelinks&languages=en&redirects=yes&format=json`,
  )
  /* Re-key by the entity's own enwiki sitelink rather than trusting response
     order to line up with request order. It mostly does, but `redirects=yes` and
     title normalisation both perturb it, and an off-by-one here does not fail —
     it silently puts the wrong actor's face on a name, which is the single worst
     outcome this script can produce. */
  const bySitelink = new Map()
  for (const entity of Object.values(data.entities ?? {})) {
    const title = entity.sitelinks?.enwiki?.title
    if (title) bySitelink.set(title, entity)
  }

  let matched = 0
  for (const name of group) {
    const entity = bySitelink.get(name)
    const hit = entity ? pickImage(entity) : null
    if (hit) {
      found.set(name, hit)
      matched += 1
    } else {
      unresolved.push(name)
    }
  }
  console.log(`  batch of ${group.length}: ${matched} matched by article title`)
}

/* ---- 2. per-name search for whatever the batch missed ------------------ */

/* Two phases, not a per-name search-then-fetch loop.
   
   `wbsearchentities` takes one term per call, so the searches cannot be batched —
   but they are cheap, and it is the FOLLOW-UP entity fetch that doubles the request
   count. So: collect every candidate id from every search first, then fetch them
   all in 50s. On the current data that turns ~74 requests into ~40, which is the
   difference between finishing and getting hard-limited partway through (the
   previous version died here with "too many requests" that no backoff cleared).
   
   `limit=3` rather than 5 for the same reason: three hits is enough to get past a
   disambiguation page, and every extra candidate is an entity that has to be
   fetched and checked. */
const candidates = new Map()

for (const name of unresolved) {
  const search = await json(
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
      name,
    )}&language=en&type=item&limit=3&format=json`,
  )
  const ids = (search.search ?? []).map((hit) => hit.id)
  if (ids.length > 0) candidates.set(name, ids)
}

const entityById = new Map()
for (const group of chunk([...new Set([...candidates.values()].flat())], BATCH)) {
  const data = await json(
    `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${group.join(
      '|',
    )}&props=claims|descriptions&languages=en&format=json`,
  )
  for (const [id, entity] of Object.entries(data.entities ?? {})) {
    entityById.set(id, entity)
  }
}

/* First candidate that is a human WITH a portrait wins. Ranking is Wikidata's own
   search relevance, which for a personal name is reliable enough — and the
   `instance of human` gate in `pickImage` is what stops a film called "Ballerina"
   from supplying a face for the actor of the same name. */
for (const [name, ids] of candidates) {
  for (const id of ids) {
    const hit = pickImage(entityById.get(id))
    if (hit) {
      found.set(name, hit)
      unresolved.splice(unresolved.indexOf(name), 1)
      break
    }
  }
}

console.log(`\n${found.size}/${names.length} have a free portrait\n`)

/* ---- 3. Commons metadata + thumbnail URL, 50 files at a time ----------- */

const strip = (html) =>
  html
    ? html
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    : ''

/** Commons file name -> { thumburl, artist, license, source } */
const fileMeta = new Map()
const files = [...new Set([...found.values()].map((hit) => hit.image))]

for (const group of chunk(files, BATCH)) {
  const data = await json(
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=${
      SIZE * 2
    }&titles=${encodeURIComponent(group.map((f) => `File:${f}`).join('|'))}`,
  )
  for (const page of Object.values(data.query?.pages ?? {})) {
    const info = page.imageinfo?.[0]
    if (!info) continue
    const meta = info.extmetadata ?? {}
    fileMeta.set(page.title.replace(/^File:/, '').replace(/_/g, ' '), {
      url: info.thumburl ?? info.url,
      artist: strip(meta.Artist?.value) || 'Unknown',
      license: strip(meta.LicenseShortName?.value) || 'see source',
      source: info.descriptionurl,
    })
  }
  console.log(`  metadata for ${group.length} files`)
}

/* ---- 4. download, crop, write ----------------------------------------- */

await mkdir(OUT_DIR, { recursive: true })

const manifest = {}
const failed = []

for (const [name, hit] of [...found].sort(([a], [b]) => a.localeCompare(b))) {
  const meta = fileMeta.get(hit.image.replace(/_/g, ' '))
  if (!meta) {
    failed.push(`${name} (no Commons metadata for ${hit.image})`)
    continue
  }
  try {
    const bytes = Buffer.from(await (await fetch(meta.url, { headers: UA })).arrayBuffer())
    const slug = slugify(name)
    /* Square crop biased to the top of the frame: these are full portraits and a
       centre crop on a head-and-shoulders shot lands on the collarbone. */
    await sharp(bytes)
      .resize(SIZE, SIZE, { fit: 'cover', position: 'top' })
      .webp({ quality: 82 })
      .toFile(`${OUT_DIR}/${slug}.webp`)
    manifest[name] = {
      src: `/cast/${slug}.webp`,
      artist: meta.artist,
      license: meta.license,
      source: meta.source,
    }
    console.log(`  ${name.padEnd(26)} ${hit.description}`)
  } catch (error) {
    failed.push(`${name} (${error.message})`)
  }
}

await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`)

console.log(`\n${Object.keys(manifest).length}/${names.length} photographed`)
const noPhoto = [...unresolved, ...failed].sort()
if (noPhoto.length > 0) {
  console.log(`\nNo photo (page falls back to initials):`)
  for (const entry of noPhoto) console.log(`  ${entry}`)
}
