import type { PlatformId } from '@/lib/content/platforms'
import type { Locale } from '@/lib/i18n/config'

/**
 * The two weekly chart rails.
 *
 * RESERVED INTEGRATION POINT (content backend):
 * This module is the ONLY place chart content lives. Swap `chartPool` and the two
 * order maps for an API/CMS fetch and both rails — in every market — regenerate
 * without touching a component.
 *
 * This file used to also hold per-film records (`Movie`, `movies`,
 * `featuredSlug`, `getMovie`) that fed a `/movie/[slug]` route. That route was a
 * doorway page — every URL rendered this same single landing page with only a
 * different <title> — so it and those records are gone. Titles on this page exist
 * to be looked at, not to be linked to individually.
 */

/**
 * Source platform whose app icon is badged on the poster. The mark itself lives
 * in `lib/content/platforms.ts` — this is only the key into that registry.
 */
export type ChartPlatform = PlatformId

/**
 * One entry of a regional weekly chart.
 */
export type ChartEntry = {
  id: string
  title: string
  kind: 'movie' | 'series'
  platform: ChartPlatform
  /**
   * 2:3 tile from `public/media/tiles/`, built by
   * `scripts/build-poster-tiles.mjs` out of the real poster in
   * `public/media/posters/`.
   *
   * These are licensed posters WITH their own title lettering, and several carry
   * the service logo burned in. A card renders no title text of its own, so the
   * only thing that can contradict the art is the badge — which means
   * `platform` below must name the service that actually streams the title. Get
   * that wrong and the card shows two different services at once.
   *
   * One tile per entry, never shared: a rail shows many cards at once, so a
   * repeat is immediately visible and makes the chart read as filler.
   */
  poster: string
}

/**
 * The catalogue behind both rails.
 *
 * Deliberately NOT padded to a round number. The real split of the licensed art
 * is eight films to twelve shows, and the headings are written without a count
 * (`chart.headingMovies` / `chart.headingSeries`) precisely so neither rail has
 * to invent an entry to satisfy a "Top 10" label. Adding a title means adding a
 * poster, not renaming a row.
 */
/* prettier-ignore */
const chartPool: Record<string, ChartEntry> = {
  /* Films */
  avatar:     { id: 'avatar',     title: 'Avatar: Fire and Ash',               kind: 'movie',  platform: 'disney-plus',    poster: '/media/tiles/avatar-fire-and-ash.webp' },
  kombat:     { id: 'kombat',     title: 'Mortal Kombat II',                  kind: 'movie',  platform: 'hbo-max',        poster: '/media/tiles/mortal-kombat-2.webp' },
  hailMary:   { id: 'hailMary',   title: 'Project Hail Mary',                 kind: 'movie',  platform: 'prime-video',    poster: '/media/tiles/project-hail-mary.webp' },
  prada:      { id: 'prada',      title: 'The Devil Wears Prada 2',           kind: 'movie',  platform: 'disney-plus',    poster: '/media/tiles/devil-wears-prada-2.webp' },
  masters:    { id: 'masters',    title: 'Masters of the Universe',           kind: 'movie',  platform: 'prime-video',    poster: '/media/tiles/masters-of-the-universe.webp' },
  lastHouse:  { id: 'lastHouse',  title: 'The Last House',                    kind: 'movie',  platform: 'netflix',        poster: '/media/tiles/the-last-house.webp' },
  devilMouth: { id: 'devilMouth', title: "The Devil's Mouth",                 kind: 'movie',  platform: 'hulu',           poster: '/media/tiles/the-devils-mouth.webp' },
  hours72:    { id: 'hours72',    title: '72 Hours',                          kind: 'movie',  platform: 'netflix',        poster: '/media/tiles/72-hours.webp' },

  /* Shows */
  dragon:     { id: 'dragon',     title: 'House of the Dragon',               kind: 'series', platform: 'hbo-max',        poster: '/media/tiles/house-of-the-dragon.webp' },
  findYou:    { id: 'findYou',    title: "Harlan Coben's I Will Find You",    kind: 'series', platform: 'netflix',        poster: '/media/tiles/i-will-find-you.webp' },
  lioness:    { id: 'lioness',    title: 'Special Ops: Lioness',              kind: 'series', platform: 'paramount-plus', poster: '/media/tiles/lioness.webp' },
  rickMorty:  { id: 'rickMorty',  title: 'Rick and Morty',                    kind: 'series', platform: 'hbo-max',        poster: '/media/tiles/rick-and-morty.webp' },
  walterBoys: { id: 'walterBoys', title: 'My Life with the Walter Boys',      kind: 'series', platform: 'netflix',        poster: '/media/tiles/walter-boys.webp' },
  shards:     { id: 'shards',     title: 'The Shards',                        kind: 'series', platform: 'disney-plus',    poster: '/media/tiles/the-shards.webp' },
  sterling:   { id: 'sterling',   title: 'Sterling Point',                    kind: 'series', platform: 'prime-video',    poster: '/media/tiles/sterling-point.webp' },
  furious:    { id: 'furious',    title: 'Furious',                           kind: 'series', platform: 'hulu',           poster: '/media/tiles/furious.webp' },
  idaho:      { id: 'idaho',      title: 'The Idaho Murders: College Nightmare', kind: 'series', platform: 'netflix',     poster: '/media/tiles/idaho-murders.webp' },
  offCampus:  { id: 'offCampus',  title: 'Off Campus',                        kind: 'series', platform: 'prime-video',    poster: '/media/tiles/off-campus.webp' },
  stuart:     { id: 'stuart',     title: 'Stuart Fails to Save the Universe', kind: 'series', platform: 'hbo-max',        poster: '/media/tiles/stuart-fails-to-save-the-universe.webp' },
  curtis:     { id: 'curtis',     title: 'President Curtis',                  kind: 'series', platform: 'hbo-max',        poster: '/media/tiles/president-curtis.webp' },
}

/**
 * Per-market ranking. Every market lists the same catalogue in a DIFFERENT order
 * — that is what makes the rails read as a chart rather than as a static shelf —
 * so each array must be a permutation of the pool, never a subset.
 */
/* prettier-ignore */
const movieOrder: Record<Locale, string[]> = {
  en:      ['avatar', 'kombat', 'hailMary', 'prada', 'masters', 'lastHouse', 'devilMouth', 'hours72'],
  'pt-br': ['avatar', 'prada', 'kombat', 'lastHouse', 'hailMary', 'hours72', 'masters', 'devilMouth'],
  th:      ['avatar', 'masters', 'kombat', 'devilMouth', 'hailMary', 'hours72', 'prada', 'lastHouse'],
}

/* prettier-ignore */
const seriesOrder: Record<Locale, string[]> = {
  en:      ['dragon', 'findYou', 'lioness', 'rickMorty', 'walterBoys', 'shards', 'sterling', 'furious', 'idaho', 'offCampus', 'stuart', 'curtis'],
  'pt-br': ['dragon', 'walterBoys', 'findYou', 'rickMorty', 'lioness', 'sterling', 'offCampus', 'shards', 'curtis', 'furious', 'stuart', 'idaho'],
  th:      ['dragon', 'rickMorty', 'findYou', 'sterling', 'shards', 'lioness', 'furious', 'walterBoys', 'stuart', 'offCampus', 'idaho', 'curtis'],
}

/** Regional weekly film chart. */
export function getMovieChart(locale: Locale): ChartEntry[] {
  return movieOrder[locale].map((id) => chartPool[id])
}

/** Regional weekly show chart. */
export function getSeriesChart(locale: Locale): ChartEntry[] {
  return seriesOrder[locale].map((id) => chartPool[id])
}
