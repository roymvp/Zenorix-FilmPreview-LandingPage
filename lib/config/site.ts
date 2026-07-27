/**
 * Global, non-localized product configuration.
 *
 * RESERVED INTEGRATION POINT (backend / CMS):
 * Every value here is expected to be replaced by the content-configuration
 * backend at build time. Keep it flat and serializable so it can be produced
 * from a single API response without touching component code.
 */
export const SITE = {
  name: 'Zenorix',
  /** Canonical origin. Set NEXT_PUBLIC_SITE_URL at build time in production. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zenorix.app',
  /** RESERVED: point at the signed APK on the CDN. */
  apkUrl: process.env.NEXT_PUBLIC_APK_URL ?? '/download/zenorix.apk',
  apkVersion: '3.4.1',
  apkSize: '28 MB',
  minAndroid: '7.0',
  library: {
    movies: '28,000+',
    series: '8,000+',
    channels: '900+',
    total: '36,000+',
  },
} as const

export type SiteConfig = typeof SITE
