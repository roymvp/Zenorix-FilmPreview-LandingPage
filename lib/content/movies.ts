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
  poster: string
  backdrop: string
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

export const movies: Movie[] = [
  {
    slug: 'nocturne-protocol',
    releaseYear: 2026,
    runtimeMinutes: 128,
    qualityTags: ['4K', 'Dolby'],
    poster: '/media/poster-nocturne-protocol.png',
    backdrop: '/media/nocturne-protocol-backdrop.png',
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

/** One entry of the regional weekly chart. */
export type ChartEntry = {
  id: string
  title: string
  poster: string
  /** Localized "Movie" / "Series" style label key. */
  kind: 'movie' | 'series'
}

const chartPool: Record<string, ChartEntry> = {
  nocturne: { id: 'nocturne', title: 'Nocturne Protocol', poster: '/media/poster-nocturne-protocol.png', kind: 'movie' },
  crimson: { id: 'crimson', title: 'Crimson Harbor', poster: '/media/poster-crimson-harbor.png', kind: 'movie' },
  signal: { id: 'signal', title: 'The Last Signal', poster: '/media/poster-the-last-signal.png', kind: 'movie' },
  neon: { id: 'neon', title: 'Neon Requiem', poster: '/media/poster-neon-requiem.png', kind: 'series' },
  orbit: { id: 'orbit', title: 'Silent Orbit', poster: '/media/poster-silent-orbit.png', kind: 'movie' },
  ember: { id: 'ember', title: 'Ash & Ember', poster: '/media/poster-ash-and-ember.png', kind: 'movie' },
  cartel: { id: 'cartel', title: 'Midnight Cartel', poster: '/media/poster-midnight-cartel.png', kind: 'series' },
  glass: { id: 'glass', title: 'Glass Kingdom', poster: '/media/poster-glass-kingdom.png', kind: 'series' },
  tigers: { id: 'tigers', title: 'Paper Tigers', poster: '/media/poster-paper-tigers.png', kind: 'movie' },
  solstice: { id: 'solstice', title: 'Solstice', poster: '/media/poster-solstice.png', kind: 'movie' },
  crown: { id: 'crown', title: 'Hollow Crown', poster: '/media/poster-hollow-crown.png', kind: 'series' },
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
