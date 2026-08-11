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
 * is eighteen films to twelve shows, and the headings are written without a count
 * (`chart.headingMovies` / `chart.headingSeries`) precisely so neither rail has
 * to invent an entry to satisfy a "Top 10" label — nor trim one to fit it. Adding
 * a title means adding a poster, not renaming a row.
 */
/* prettier-ignore */
const chartPool: Record<string, ChartEntry> = {
  /* Films — 2026 theatrical slate, ranked 1-10.

     Each `platform` is the service that holds the title's streaming window, not
     a guess from the genre: Universal/Illumination -> Peacock (odyssey,
     oneNight, minions), Disney/Pixar -> Disney+ (toyStory5, moana), Searchlight
     -> Hulu (superTroopers3), A24 -> HBO Max (invite), Sony's Spider-Man ->
     Netflix. Several of these one-sheets print the studio logo in the art, so a
     badge naming a different service would contradict the poster it sits on. */
  spiderMan:  { id: 'spiderMan',  title: 'Spider-Man: Brand New Day',          kind: 'movie',  platform: 'netflix',        poster: '/media/tiles/spider-man-brand-new-day.webp' },
  odyssey:    { id: 'odyssey',    title: 'The Odyssey',                        kind: 'movie',  platform: 'peacock',        poster: '/media/tiles/the-odyssey.webp' },
  oneNight:   { id: 'oneNight',   title: 'One Night Only',                     kind: 'movie',  platform: 'peacock',        poster: '/media/tiles/one-night-only.webp' },
  toyStory5:  { id: 'toyStory5',  title: 'Toy Story 5',                        kind: 'movie',  platform: 'disney-plus',    poster: '/media/tiles/toy-story-5.webp' },
  troopers3:  { id: 'troopers3',  title: 'Super Troopers 3',                   kind: 'movie',  platform: 'hulu',           poster: '/media/tiles/super-troopers-3.webp' },
  minions:    { id: 'minions',    title: 'Minions & Monsters',                 kind: 'movie',  platform: 'peacock',        poster: '/media/tiles/minions-and-monsters.webp' },
  moana:      { id: 'moana',      title: 'Moana',                              kind: 'movie',  platform: 'disney-plus',    poster: '/media/tiles/moana.webp' },
  iceCream:   { id: 'iceCream',   title: "Eli Roth's Ice Cream Man",           kind: 'movie',  platform: 'hbo-max',        poster: '/media/tiles/ice-cream-man.webp' },
  invite:     { id: 'invite',     title: 'The Invite',                         kind: 'movie',  platform: 'hbo-max',        poster: '/media/tiles/the-invite.webp' },
  catFest:    { id: 'catFest',    title: 'CatVideoFest 2026',                  kind: 'movie',  platform: 'prime-video',    poster: '/media/tiles/cat-video-fest.webp' },

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
 * Per-market ranking. Each array must be a permutation of its half of the pool,
 * never a subset — a market that drops a title silently shrinks its rail.
 *
 * The two rails handle market variation differently, on purpose:
 *
 * - SHOWS vary per market. Same twelve titles, three different orders, which is
 *   what makes the rail read as a chart rather than a static shelf.
 * - FILMS are ranked identically in all three markets, by explicit request: the
 *   ten 2026 releases are numbered 1-10 in the order they were supplied, and the
 *   eight carry-overs follow. Keeping one canonical film order means a change to
 *   the slate is one edit instead of three, at the cost of the rail no longer
 *   looking regional. If a market ever needs its own film ranking, split this
 *   back into three permutations — the loop below does not care.
 */
/* prettier-ignore */
const filmRanking = [
  /* 1-10: the 2026 slate, in supplied order. */
  'spiderMan', 'odyssey', 'oneNight', 'toyStory5', 'troopers3',
  'minions', 'moana', 'iceCream', 'invite', 'catFest',
  /* 11-18: carry-overs. */
  'avatar', 'kombat', 'hailMary', 'prada', 'masters', 'lastHouse', 'devilMouth', 'hours72',
]

const movieOrder: Record<Locale, string[]> = {
  en: filmRanking,
  'pt-br': filmRanking,
  th: filmRanking,
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

/**
 * Every title this market's page shows, in the order it shows them — films then
 * shows, matching the rail order in the DOM.
 *
 * This exists for the head: `lib/seo.ts` needs the titles for `keywords` and for
 * the `ItemList` in the JSON-LD, and derives them from HERE rather than keeping a
 * second hand-written list. The posters carry their own title lettering and the
 * cards render no title text, so this function is the only machine-readable form
 * these thirty names have — if it drifts from the pool, the head starts naming
 * films the page does not show, which is the one thing keyword metadata must
 * never do.
 */
/**
 * One pool entry by id, for the title detail route.
 *
 * This does NOT reintroduce the deleted `/movie/[slug]` route. That route failed
 * because it rendered the landing page under a different `<title>` — the entry it
 * looked up carried nothing but a name and a poster, exactly what this type still
 * holds. The per-title FACTS live in `lib/content/titles.ts`, and a detail page
 * only exists where a record there does. This function supplies the two fields
 * that file deliberately does not duplicate: display title and poster.
 */
export function getChartEntry(id: string): ChartEntry | undefined {
  return chartPool[id]
}

export function getChartTitles(locale: Locale): string[] {
  return [...getMovieChart(locale), ...getSeriesChart(locale)].map(
    (entry) => entry.title,
  )
}
