import manifest from '@/lib/content/cast-photos.json'

/**
 * Free-licensed headshots for the cast names in `titles.ts`.
 *
 * The images are built by `scripts/build-cast-photos.mjs` and committed as WebP
 * under `public/cast`. Nothing here fetches at request time: the manifest is a
 * JSON import, so a Wikimedia outage cannot affect a page render or a deploy.
 *
 * WHY EVERY ENTRY CARRIES AN ARTIST AND A LICENCE. The source is Wikimedia
 * Commons, which is free-licensed by policy — but "free" is mostly CC BY or
 * CC BY-SA, and both require crediting the photographer. Rendering the face and
 * dropping the credit turns a licensed image into an unlicensed one, so the
 * credit fields are part of the data rather than an optional extra, and
 * `castCredits()` exists to make the disclosure a one-liner at the call site.
 *
 * COVERAGE IS PARTIAL AND THAT IS FINE. Roughly a third of the billed cast in the
 * current data has no free portrait on Commons at all. `castPhoto()` returns
 * `undefined` for them and the page falls back to initials, which is why the
 * lookup is a function over a partial record rather than a required field on
 * `TitleRecord`.
 */
export type CastPhoto = {
  src: string
  /** Photographer, as Commons records them. Rendered in the credits disclosure. */
  artist: string
  /** Short licence name, e.g. `CC BY-SA 4.0`. */
  license: string
  /** The Commons file page, so a reader can verify both of the above. */
  source: string
}

const photos = manifest as Record<string, CastPhoto>

/**
 * Mirrors `slugify` in `scripts/build-cast-photos.mjs`. Kept as a named export so
 * the two are easy to diff; if they drift, the file on disk and the `src` in the
 * manifest disagree and every photo 404s.
 */
export function castPhotoSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** The portrait for one cast member, or `undefined` if Commons has none. */
export function castPhoto(name: string): CastPhoto | undefined {
  return photos[name]
}

/** Initials for the fallback tile: "Sadie Sink" -> "SS". */
export function castInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : ''
  return (first + last).toUpperCase()
}

/**
 * One credit line per distinct photographer across a cast list, deduplicated and
 * sorted. Deduplicated because a single Commons contributor often shoots a whole
 * red carpet, and eight identical credit lines under one cast grid is noise that
 * makes the disclosure less likely to be read, not more.
 */
export function castCredits(
  cast: readonly string[],
): { artist: string; license: string; source: string }[] {
  const byArtist = new Map<string, { artist: string; license: string; source: string }>()
  for (const name of cast) {
    const photo = photos[name]
    if (!photo) continue
    const key = `${photo.artist} · ${photo.license}`
    if (!byArtist.has(key)) {
      byArtist.set(key, {
        artist: photo.artist,
        license: photo.license,
        source: photo.source,
      })
    }
  }
  return [...byArtist.values()].sort((a, b) => a.artist.localeCompare(b.artist))
}
