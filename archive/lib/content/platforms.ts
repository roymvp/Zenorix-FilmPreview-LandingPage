/**
 * Source-platform registry — the single place a streaming service is described.
 *
 * `icon` is the service's own store app icon (square, rounded by CSS), used
 * unmodified and in full color in two places: the trust strip and the badge on
 * each Top 10 poster. Both read the same entry, so a service can never appear
 * with two different marks.
 */
export type PlatformId =
  | 'netflix'
  | 'disney-plus'
  | 'hbo-max'
  | 'prime-video'
  | 'apple-tv'
  | 'paramount-plus'
  | 'hulu'
  | 'peacock'
  | 'amc-plus'
  | 'nbc'
  | 'fox-one'

export type Platform = {
  id: PlatformId
  name: string
  /** Square app icon in /public/brands. */
  icon: string
}

export const PLATFORMS: Record<PlatformId, Platform> = {
  netflix: { id: 'netflix', name: 'Netflix', icon: '/brands/netflix.png' },
  'disney-plus': { id: 'disney-plus', name: 'Disney+', icon: '/brands/disney-plus.png' },
  'hbo-max': { id: 'hbo-max', name: 'HBO Max', icon: '/brands/hbo-max.png' },
  'prime-video': { id: 'prime-video', name: 'Prime Video', icon: '/brands/prime-video.png' },
  'apple-tv': { id: 'apple-tv', name: 'Apple TV', icon: '/brands/apple-tv.png' },
  'paramount-plus': { id: 'paramount-plus', name: 'Paramount+', icon: '/brands/paramount-plus.png' },
  hulu: { id: 'hulu', name: 'Hulu', icon: '/brands/hulu.png' },
  peacock: { id: 'peacock', name: 'Peacock', icon: '/brands/peacock.png' },
  'amc-plus': { id: 'amc-plus', name: 'AMC+', icon: '/brands/amc-plus.png' },
  nbc: { id: 'nbc', name: 'NBC', icon: '/brands/nbc.png' },
  'fox-one': { id: 'fox-one', name: 'FOX One', icon: '/brands/fox-one.png' },
}

/** Display order of the trust strip. */
export const PLATFORM_ORDER: PlatformId[] = [
  'netflix',
  'disney-plus',
  'hbo-max',
  'prime-video',
  'apple-tv',
  'paramount-plus',
  'hulu',
  'peacock',
  'amc-plus',
  'nbc',
  'fox-one',
]
