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
  /**
   * Square app icon in `/public/brands`, GENERATED — do not hand-edit or point
   * this at a source file. `scripts/build-brand-icons.mjs` downscales the
   * originals in `assets/brands/` to 144px WebP (1040 KB -> 20 KB across the
   * eleven); the originals are 512px store icons and are not deployed.
   */
  icon: string
}

export const PLATFORMS: Record<PlatformId, Platform> = {
  netflix: { id: 'netflix', name: 'Netflix', icon: '/brands/netflix.webp' },
  'disney-plus': { id: 'disney-plus', name: 'Disney+', icon: '/brands/disney-plus.webp' },
  'hbo-max': { id: 'hbo-max', name: 'HBO Max', icon: '/brands/hbo-max.webp' },
  'prime-video': { id: 'prime-video', name: 'Prime Video', icon: '/brands/prime-video.webp' },
  'apple-tv': { id: 'apple-tv', name: 'Apple TV', icon: '/brands/apple-tv.webp' },
  'paramount-plus': { id: 'paramount-plus', name: 'Paramount+', icon: '/brands/paramount-plus.webp' },
  hulu: { id: 'hulu', name: 'Hulu', icon: '/brands/hulu.webp' },
  peacock: { id: 'peacock', name: 'Peacock', icon: '/brands/peacock.webp' },
  'amc-plus': { id: 'amc-plus', name: 'AMC+', icon: '/brands/amc-plus.webp' },
  nbc: { id: 'nbc', name: 'NBC', icon: '/brands/nbc.webp' },
  'fox-one': { id: 'fox-one', name: 'FOX One', icon: '/brands/fox-one.webp' },
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
