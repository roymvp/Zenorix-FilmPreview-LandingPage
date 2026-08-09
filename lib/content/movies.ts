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
  /** Portrait key art (2:3). The Movie node's `image`. */
  poster: string
  /** Landscape key art, used for the og:image / twitter:image share card. */
  backdrop: string
  copy: Record<Locale, MovieCopy>
}

/* NOTE: `previewFrame`, `videoSrc`, `videoType`, `previewLimitSeconds`,
   `qualityTags` and `tagline` lived here, along with a `SAMPLE_STREAM` constant
   and a `PLACEHOLDER_PREVIEW_FRAME` SVG. They existed for the hero's in-page
   preview player and its 10-minute gate, both of which are gone: the hero is a
   brand billboard now, so there is no video element to feed, no poster frame to
   show behind it and no metadata row to badge. */

export const movies: Movie[] = [
  {
    slug: 'nocturne-protocol',
    releaseYear: 2026,
    runtimeMinutes: 128,
    poster: '/media/poster-nocturne-protocol.png',
    backdrop: '/media/nocturne-protocol-backdrop.png',
    copy: {
      en: {
        title: 'Nocturne Protocol',
        synopsis:
          'A burned intelligence officer wakes with no memory and eleven hours to stop a blackout that will erase a city. Every ally he finds is already compromised. The only person he can trust is the one he was sent to kill.',
        genres: ['Sci-Fi', 'Thriller', 'Action'],
      },
      'pt-br': {
        title: 'Nocturne Protocol',
        synopsis:
          'Um oficial de inteligência queimado acorda sem memória e com onze horas para impedir um apagão que vai apagar uma cidade. Todo aliado que ele encontra já está comprometido. A única pessoa em quem pode confiar é justamente a que ele foi enviado para matar.',
        genres: ['Ficção científica', 'Suspense', 'Ação'],
      },
      th: {
        title: 'Nocturne Protocol',
        synopsis:
          'เจ้าหน้าที่ข่าวกรองที่ถูกทิ้งตื่นขึ้นมาโดยไม่มีความจำ และเหลือเวลาเพียงสิบเอ็ดชั่วโมงเพื่อหยุดเหตุไฟดับที่จะลบเมืองทั้งเมือง พันธมิตรทุกคนที่เขาเจอถูกซื้อตัวไปแล้ว คนเดียวที่เขาไว้ใจได้ คือคนที่เขาถูกส่งมาสังหาร',
        genres: ['ไซไฟ', 'ระทึกขวัญ', 'แอ็กชัน'],
      },
    },
  },
  {
    slug: 'crimson-harbor',
    releaseYear: 2025,
    runtimeMinutes: 116,
    poster: '/media/poster-crimson-harbor.png',
    backdrop: '/media/poster-crimson-harbor.png',
    copy: {
      en: {
        title: 'Crimson Harbor',
        synopsis:
          'A harbor inspector finds a container that was never on any manifest. Pulling the thread costs her the badge, the city and almost the people she loves.',
        genres: ['Crime', 'Drama', 'Mystery'],
      },
      'pt-br': {
        title: 'Crimson Harbor',
        synopsis:
          'Uma inspetora portuária encontra um contêiner que nunca constou em nenhum manifesto. Puxar esse fio lhe custa o cargo, a cidade e quase todos que ela ama.',
        genres: ['Crime', 'Drama', 'Mistério'],
      },
      th: {
        title: 'Crimson Harbor',
        synopsis:
          'เจ้าหน้าที่ตรวจท่าเรือพบตู้คอนเทนเนอร์ที่ไม่เคยปรากฏในเอกสารใด การสาวไปถึงต้นตอทำให้เธอเสียทั้งตำแหน่ง เมือง และเกือบเสียคนที่เธอรัก',
        genres: ['อาชญากรรม', 'ดราม่า', 'สืบสวน'],
      },
    },
  },
  {
    slug: 'the-last-signal',
    releaseYear: 2026,
    runtimeMinutes: 134,
    poster: '/media/poster-the-last-signal.png',
    backdrop: '/media/poster-the-last-signal.png',
    copy: {
      en: {
        title: 'The Last Signal',
        synopsis:
          'A decommissioned desert array picks up a transmission that predates the station itself. The astronomer who decodes it realizes the message is a countdown — and it is already halfway done.',
        genres: ['Sci-Fi', 'Mystery', 'Drama'],
      },
      'pt-br': {
        title: 'The Last Signal',
        synopsis:
          'Um radiotelescópio desativado no deserto capta uma transmissão mais antiga que a própria estação. A astrônoma que a decodifica descobre que a mensagem é uma contagem regressiva — e já passou da metade.',
        genres: ['Ficção científica', 'Mistério', 'Drama'],
      },
      th: {
        title: 'The Last Signal',
        synopsis:
          'จานรับสัญญาณกลางทะเลทรายที่ถูกปลดระวางจับสัญญาณที่เก่าแก่กว่าตัวสถานีเอง นักดาราศาสตร์ที่ถอดรหัสได้พบว่าข้อความนั้นคือการนับถอยหลัง และมันผ่านมาครึ่งทางแล้ว',
        genres: ['ไซไฟ', 'สืบสวน', 'ดราม่า'],
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
