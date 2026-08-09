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
  /**
   * The APK endpoint. ABSOLUTE, and on its own host: it is an update channel
   * that always resolves to the newest build, not a file under this site.
   * Anything joining this to `SITE.url` is a bug — see `installUrl` in
   * lib/seo.ts, which consumes it as-is for exactly that reason.
   */
  apkUrl:
    process.env.NEXT_PUBLIC_APK_URL ?? 'https://update.vinextv.co/zenorix/latest',
  /** Support channel behind every "contact us" entry point. */
  contactUrl: 'https://t.me/roykay_mvp',
  apkVersion: '3.4.1',
  apkSize: '14MB',
  /** Install count shown under the download CTAs. RESERVED: feed from analytics. */
  apkDownloads: '3M+ Downloads',
  minAndroid: '7.0',
  library: {
    movies: '28,000+',
    series: '8,000+',
    channels: '900+',
    total: '36,000+',
  },
} as const

export type SiteConfig = typeof SITE
