import type { PlatformId } from '@/lib/content/platforms'
import type { Locale } from '@/lib/i18n/config'

/**
 * Centralized movie catalog.
 *
 * RESERVED INTEGRATION POINT (content backend):
 * This module is the ONLY place film content lives. Swap the two exported
 * constants for an API/CMS fetch and every landing page — in every language —
 * regenerates without touching a single component. Nothing about a specific
 * film is hardcoded in the UI layer.
 */

/**
 * Per-market copy for one film.
 *
 * NOTE: none of this is rendered on the page any more — the landing page leads
 * with the brand and the catalogue, not with one film. Every field below feeds
 * the document head (metadata + the `Movie` JSON-LD node), which is what keeps
 * each /movie/[slug] route independently indexable.
 */
export type MovieCopy = {
  title: string
  /** 2–3 lines. Becomes the Movie node's `description`. */
  synopsis: string
  /** 2–3 genre tags. Becomes the Movie node's `genre`. */
  genres: string[]
}

export type Movie = {
  slug: string
  releaseYear: number
  /** Full runtime. Emitted as the Movie node's ISO 8601 `duration`. */
  runtimeMinutes: number
  /**
   * Portrait key art (2:3) — the real licensed poster, shared with the chart
   * rails. The Movie node's `image`.
   */
  poster: string
  /**
   * Landscape share card (1200x630) for og:image / twitter:image, built from the
   * poster above by `scripts/build-share-cards.mjs`.
   *
   * Never point this at the portrait poster: the dimensions declared in
   * `lib/seo.ts` are landscape, so an unfurl would letterbox the card or crop the
   * title lettering straight off the art.
   */
  backdrop: string
  copy: Record<Locale, MovieCopy>
}

/* NOTE: `previewFrame`, `videoSrc`, `videoType`, `previewLimitSeconds`,
   `qualityTags` and `tagline` lived here, along with a `SAMPLE_STREAM` constant
   and a `PLACEHOLDER_PREVIEW_FRAME` SVG. They existed for the hero's in-page
   preview player and its 10-minute gate, both of which are gone: the hero is a
   brand billboard now, so there is no video element to feed, no poster frame to
   show behind it and no metadata row to badge. */

/**
 * The films that own a route. Real titles, real release years, real runtimes —
 * every value here is emitted into the document head and the `Movie` JSON-LD
 * node, so an invented figure is a factual claim made to crawlers and answer
 * engines. `runtimeMinutes` in particular becomes `duration: PT{n}M`; leave a
 * film out rather than guess it.
 *
 * Titles are NOT translated per market: these are the distributed international
 * titles, and localizing them would break the match against what a user actually
 * searches for. Only `synopsis` and `genres` are localized.
 */
export const movies: Movie[] = [
  {
    slug: 'avatar-fire-and-ash',
    releaseYear: 2025,
    runtimeMinutes: 195,
    poster: '/media/posters/avatar-fire-and-ash.png',
    backdrop: '/media/share/avatar-fire-and-ash.png',
    copy: {
      en: {
        title: 'Avatar: Fire and Ash',
        synopsis:
          'Still grieving the son they lost, Jake Sully and Neytiri find Pandora turned against them by a Na’vi clan they never knew existed. The Ash People answer fire with fire, and their leader has no interest in peace with anyone.',
        genres: ['Sci-Fi', 'Adventure', 'Action'],
      },
      'pt-br': {
        title: 'Avatar: Fire and Ash',
        synopsis:
          'Ainda de luto pelo filho que perderam, Jake Sully e Neytiri encontram Pandora voltada contra eles por um clã Na’vi que desconheciam. O Povo das Cinzas responde fogo com fogo, e sua líder não tem interesse em paz com ninguém.',
        genres: ['Ficção científica', 'Aventura', 'Ação'],
      },
      th: {
        title: 'Avatar: Fire and Ash',
        synopsis:
          'ขณะที่ยังโศกเศร้ากับการสูญเสียลูกชาย เจค ซัลลี และเนย์ทีรี ต้องเผชิญกับแพนดอร่าที่หันมาเป็นศัตรู จากเผ่านาวีที่พวกเขาไม่เคยรู้ว่ามีอยู่ ชนเผ่าเถ้าถ่านตอบโต้ไฟด้วยไฟ และผู้นำของพวกเขาไม่ต้องการสันติภาพกับใคร',
        genres: ['ไซไฟ', 'ผจญภัย', 'แอ็กชัน'],
      },
    },
  },
  {
    slug: 'project-hail-mary',
    releaseYear: 2026,
    runtimeMinutes: 156,
    poster: '/media/posters/project-hail-mary.png',
    backdrop: '/media/share/project-hail-mary.png',
    copy: {
      en: {
        title: 'Project Hail Mary',
        synopsis:
          'Ryland Grace wakes alone on a spacecraft light years from Earth, with no memory of who he is or why he is there. Piecing it together, he learns he is the last surviving member of a mission to stop the sun from dying.',
        genres: ['Sci-Fi', 'Adventure', 'Drama'],
      },
      'pt-br': {
        title: 'Project Hail Mary',
        synopsis:
          'Ryland Grace acorda sozinho em uma nave a anos-luz da Terra, sem lembrar quem é nem por que está ali. Ao reconstruir a própria história, descobre que é o último sobrevivente de uma missão para impedir a morte do Sol.',
        genres: ['Ficção científica', 'Aventura', 'Drama'],
      },
      th: {
        title: 'Project Hail Mary',
        synopsis:
          'ไรแลนด์ เกรซ ตื่นขึ้นมาลำพังบนยานอวกาศที่อยู่ห่างจากโลกหลายปีแสง โดยไม่จำได้ว่าตัวเองเป็นใครหรือมาอยู่ที่นี่ได้อย่างไร เมื่อค่อย ๆ ปะติดปะต่อความจริง เขาพบว่าตนเป็นผู้รอดชีวิตคนสุดท้ายของภารกิจหยุดยั้งการดับสูญของดวงอาทิตย์',
        genres: ['ไซไฟ', 'ผจญภัย', 'ดราม่า'],
      },
    },
  },
  {
    slug: 'mortal-kombat-2',
    releaseYear: 2026,
    runtimeMinutes: 116,
    poster: '/media/posters/mortal-kombat-2.png',
    backdrop: '/media/share/mortal-kombat-2.png',
    copy: {
      en: {
        title: 'Mortal Kombat II',
        synopsis:
          'Earthrealm’s fighters are drawn back into the tournament, and this time the invitation comes from Outworld itself. Johnny Cage talks his way onto a roster that will not all be coming home.',
        genres: ['Action', 'Fantasy', 'Martial Arts'],
      },
      'pt-br': {
        title: 'Mortal Kombat II',
        synopsis:
          'Os lutadores do Reino da Terra são puxados de volta ao torneio, e desta vez o convite vem do próprio Outworld. Johnny Cage se enfia à força em uma escalação da qual não voltarão todos.',
        genres: ['Ação', 'Fantasia', 'Artes marciais'],
      },
      th: {
        title: 'Mortal Kombat II',
        synopsis:
          'นักสู้แห่งโลกมนุษย์ถูกดึงกลับเข้าสู่การประลองอีกครั้ง และคราวนี้คำเชิญมาจากเอาต์เวิร์ลด์โดยตรง จอห์นนี่ เคจ พูดจนได้เข้าร่วมทีมที่ไม่ใช่ทุกคนจะได้กลับบ้าน',
        genres: ['แอ็กชัน', 'แฟนตาซี', 'ศิลปะการต่อสู้'],
      },
    },
  },
]

export const featuredSlug = movies[0].slug

export function getMovie(slug: string): Movie | undefined {
  return movies.find((movie) => movie.slug === slug)
}

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
