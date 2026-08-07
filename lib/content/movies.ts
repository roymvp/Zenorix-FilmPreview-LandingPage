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
 * One entry of the regional weekly chart.
 *
 * RESERVED: there is deliberately no `poster` field. The rail renders a neutral
 * placeholder tile for every entry until real artwork is licensed. To wire
 * artwork up, add `poster: string` here, set it on each pool entry below, and
 * render it inside `.zx-chart-art` in `TopChart` (see the note there).
 */
export type ChartEntry = {
  id: string
  title: string
  /** Localized "Movie" / "Series" style label key. */
  kind: 'movie' | 'series'
  platform: ChartPlatform
}

const chartPool: Record<string, ChartEntry> = {
  nocturne: { id: 'nocturne', title: 'Nocturne Protocol', kind: 'movie', platform: 'netflix' },
  crimson: { id: 'crimson', title: 'Crimson Harbor', kind: 'movie', platform: 'hbo-max' },
  signal: { id: 'signal', title: 'The Last Signal', kind: 'movie', platform: 'apple-tv' },
  neon: { id: 'neon', title: 'Neon Requiem', kind: 'series', platform: 'prime-video' },
  orbit: { id: 'orbit', title: 'Silent Orbit', kind: 'movie', platform: 'disney-plus' },
  ember: { id: 'ember', title: 'Ash & Ember', kind: 'movie', platform: 'amc-plus' },
  cartel: { id: 'cartel', title: 'Midnight Cartel', kind: 'series', platform: 'paramount-plus' },
  glass: { id: 'glass', title: 'Glass Kingdom', kind: 'series', platform: 'hulu' },
  tigers: { id: 'tigers', title: 'Paper Tigers', kind: 'movie', platform: 'peacock' },
  solstice: { id: 'solstice', title: 'Solstice', kind: 'movie', platform: 'fox-one' },
  crown: { id: 'crown', title: 'Hollow Crown', kind: 'series', platform: 'nbc' },
}

const order: Record<Locale, string[]> = {
  en: ['nocturne', 'crimson', 'signal', 'neon', 'orbit', 'ember', 'cartel', 'glass', 'tigers', 'solstice'],
  'pt-br': ['crimson', 'nocturne', 'ember', 'cartel', 'crown', 'neon', 'signal', 'solstice', 'glass', 'tigers'],
  th: ['nocturne', 'neon', 'tigers', 'crown', 'signal', 'orbit', 'crimson', 'glass', 'cartel', 'ember'],
}

/** Regional weekly chart — different in every market, as a real chart would be. */
export function getChart(locale: Locale): ChartEntry[] {
  return order[locale].map((id) => chartPool[id])
}
