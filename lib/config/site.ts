/**
 * The only configuration surface of the site.
 *
 * Everything a deploy needs to change lives here: the two store links and the
 * hero trailer reel. There is no backend, no API and no CMS — the pages are
 * fully static, so these values are inlined at build time.
 */
export const SITE = {
  name: 'Zenorix',
  /** Canonical origin. Set NEXT_PUBLIC_SITE_URL at build time in production. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zenorix.app',

  /** CONFIGURE: Android download target. */
  ANDROID_DOWNLOAD_URL: process.env.NEXT_PUBLIC_ANDROID_DOWNLOAD_URL ?? '#android-download',
  /** CONFIGURE: iOS download target. */
  IOS_DOWNLOAD_URL: process.env.NEXT_PUBLIC_IOS_DOWNLOAD_URL ?? '#ios-download',

  logo: '/assets/images/logo.png',
  /* JPEG, not WebP: this is the one asset third-party crawlers fetch, and some
     chat clients still fail to render a WebP share card. */
  ogImage: '/assets/images/og.jpg',
} as const

/**
 * Hero background reel — 3 to 5 entries.
 *
 * `src` is the trailer file, `poster` its first frame. Only the FIRST entry is
 * preloaded (poster included); the rest are armed one at a time as the reel
 * advances, so the hero costs one video on load no matter how many are listed.
 *
 * Drop the encoded trailers into `public/assets/trailers/` under these names to
 * activate them. Until then each slot falls back to its own first frame, so the
 * reel still crossfades.
 *
 * Posters are 1920x1080 WebP. Keep replacements at a TRUE 16:9 ratio with no
 * baked-in letterbox bars: the reel scales them with `background-size: cover`,
 * so any bars in the file are scaled up and read as a broken layer.
 */
export const TRAILERS = [
  { src: '/assets/trailers/trailer-1.mp4', poster: '/assets/trailers/trailer-1.webp' },
  { src: '/assets/trailers/trailer-2.mp4', poster: '/assets/trailers/trailer-2.webp' },
  { src: '/assets/trailers/trailer-3.mp4', poster: '/assets/trailers/trailer-3.webp' },
] as const
