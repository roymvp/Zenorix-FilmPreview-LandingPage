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

/** Per-market copy for one film. */
export type MovieCopy = {
  title: string
  /** One-line hook, used in og:title and the info block. */
  tagline: string
  /** 2–3 lines. Never longer: the info block is a conversion step, not a wiki. */
  synopsis: string
  /** 2–3 genre tags. */
  genres: string[]
}

export type Movie = {
  slug: string
  releaseYear: number
  runtimeMinutes: number
  /**
   * Badges shown in the metadata row. Non-localized on purpose.
   * Keep this to two entries — the row is one line on a phone and a third
   * badge pushes it to wrap.
   */
  qualityTags: string[]
  /** Portrait key art (2:3). Not used by the player — see `previewFrame`. */
  poster: string
  /** Landscape key art, used for the og:image / twitter:image share card. */
  backdrop: string
  /**
   * Landscape (16:9) opening frame of the film.
   *
   * RESERVED INTEGRATION POINT (artwork): currently
   * `PLACEHOLDER_PREVIEW_FRAME` for every title. Drop the real per-film frame
   * into `public/media/` and point this field at it — no component changes.
   *
   * ONE image, TWO placements, on purpose:
   *  1. the player's `poster`, i.e. what the viewer sees before playback
   *     resolves (and again behind the fade while it buffers);
   *  2. the preview-gate sheet's header art.
   * Sharing the asset is what makes the sheet feel like it grew out of the
   * frame the viewer was just watching, so keep these two in sync.
   *
   * Must be landscape: both placements crop with `object-fit: cover`, so a
   * portrait source loses most of its height. (This is why the field exists —
   * the player used to borrow `backdrop`, which on two of the three titles
   * pointed at a 2:3 poster and got cropped to a narrow center strip.)
   */
  previewFrame: string
  /** RESERVED: production HLS/DASH manifest or MP4 from the media CDN. */
  videoSrc: string
  videoType: string
  /** Playable window in seconds. The progress bar still shows full runtime. */
  previewLimitSeconds: number
  copy: Record<Locale, MovieCopy>
}

/** Placeholder stream. RESERVED: replace with the licensed per-film source. */
const SAMPLE_STREAM =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

/**
 * Neutral stand-in for the opening frame — deliberately an empty asset slot
 * rather than art, so an unconfigured film is obvious instead of looking
 * finished. Every title points here until real frames are supplied.
 *
 * RESERVED: replace per film by setting `previewFrame` below; delete this
 * constant once all titles carry their own frame.
 */
const PLACEHOLDER_PREVIEW_FRAME = '/media/placeholder-preview-frame.svg'

export const movies: Movie[] = [
  {
    slug: 'nocturne-protocol',
    releaseYear: 2026,
    runtimeMinutes: 128,
    qualityTags: ['4K', 'Dolby'],
    poster: '/media/poster-nocturne-protocol.png',
    backdrop: '/media/nocturne-protocol-backdrop.png',
    previewFrame: PLACEHOLDER_PREVIEW_FRAME,
    videoSrc: SAMPLE_STREAM,
    videoType: 'video/mp4',
    previewLimitSeconds: 600,
    copy: {
      en: {
        title: 'Nocturne Protocol',
        tagline: 'One agent. One night. Every system watching.',
        synopsis:
          'A burned intelligence officer wakes with no memory and eleven hours to stop a blackout that will erase a city. Every ally he finds is already compromised. The only person he can trust is the one he was sent to kill.',
        genres: ['Sci-Fi', 'Thriller', 'Action'],
      },
      'pt-br': {
        title: 'Nocturne Protocol',
        tagline: 'Um agente. Uma noite. Todos os sistemas vigiando.',
        synopsis:
          'Um oficial de inteligência queimado acorda sem memória e com onze horas para impedir um apagão que vai apagar uma cidade. Todo aliado que ele encontra já está comprometido. A única pessoa em quem pode confiar é justamente a que ele foi enviado para matar.',
        genres: ['Ficção científica', 'Suspense', 'Ação'],
      },
      th: {
        title: 'Nocturne Protocol',
        tagline: 'สายลับหนึ่งคน หนึ่งคืน กับทุกระบบที่จับตามอง',
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
    qualityTags: ['4K', 'Dolby'],
    poster: '/media/poster-crimson-harbor.png',
    backdrop: '/media/poster-crimson-harbor.png',
    previewFrame: PLACEHOLDER_PREVIEW_FRAME,
    videoSrc: SAMPLE_STREAM,
    videoType: 'video/mp4',
    previewLimitSeconds: 600,
    copy: {
      en: {
        title: 'Crimson Harbor',
        tagline: 'The docks keep every secret but one.',
        synopsis:
          'A harbor inspector finds a container that was never on any manifest. Pulling the thread costs her the badge, the city and almost the people she loves.',
        genres: ['Crime', 'Drama', 'Mystery'],
      },
      'pt-br': {
        title: 'Crimson Harbor',
        tagline: 'O porto guarda todos os segredos, menos um.',
        synopsis:
          'Uma inspetora portuária encontra um contêiner que nunca constou em nenhum manifesto. Puxar esse fio lhe custa o cargo, a cidade e quase todos que ela ama.',
        genres: ['Crime', 'Drama', 'Mistério'],
      },
      th: {
        title: 'Crimson Harbor',
        tagline: 'ท่าเรือเก็บได้ทุกความลับ ยกเว้นเรื่องเดียว',
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
    qualityTags: ['4K', 'Dolby'],
    poster: '/media/poster-the-last-signal.png',
    backdrop: '/media/poster-the-last-signal.png',
    previewFrame: PLACEHOLDER_PREVIEW_FRAME,
    videoSrc: SAMPLE_STREAM,
    videoType: 'video/mp4',
    previewLimitSeconds: 600,
    copy: {
      en: {
        title: 'The Last Signal',
        tagline: 'Something answered. It used her voice.',
        synopsis:
          'A decommissioned desert array picks up a transmission that predates the station itself. The astronomer who decodes it realizes the message is a countdown — and it is already halfway done.',
        genres: ['Sci-Fi', 'Mystery', 'Drama'],
      },
      'pt-br': {
        title: 'The Last Signal',
        tagline: 'Algo respondeu. E usou a voz dela.',
        synopsis:
          'Um radiotelescópio desativado no deserto capta uma transmissão mais antiga que a própria estação. A astrônoma que a decodifica descobre que a mensagem é uma contagem regressiva — e já passou da metade.',
        genres: ['Ficção científica', 'Mistério', 'Drama'],
      },
      th: {
        title: 'The Last Signal',
        tagline: 'มีบางอย่างตอบกลับมา ด้วยเสียงของเธอเอง',
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
