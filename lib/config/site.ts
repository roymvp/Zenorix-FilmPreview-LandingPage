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
  /**
   * Canonical origin. Set NEXT_PUBLIC_SITE_URL at build time in production.
   *
   * The fallback is `zenorix.space` — the registered domain of the operating
   * company below. It read `zenorix.app` until now, a domain this project does not
   * own, so any build missing the env var would have emitted canonical tags and
   * an og:url pointing at someone else's host.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zenorix.space',
  /**
   * The APK endpoint. ABSOLUTE, and on its own host: it is an update channel
   * that always resolves to the newest build, not a file under this site.
   * Anything joining this to `SITE.url` is a bug — see `installUrl` in
   * lib/seo.ts, which consumes it as-is for exactly that reason.
   */
  apkUrl:
    process.env.NEXT_PUBLIC_APK_URL ?? 'https://update.vinextv.co/zenorix/latest',
  /**
   * Support channel behind every "contact us" CTA — instant, low-friction, and the
   * right destination for a prospective user with a question.
   *
   * Deliberately NOT the channel the legal pages point at: see `ORG.email`. A
   * rights holder or a reviewer needs an address that belongs to the company
   * rather than a person's messaging handle.
   */
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

/**
 * The operating company.
 *
 * Separate from `SITE` because these are facts about a legal entity rather than
 * product copy: they are the same in every market, they are never translated, and
 * unlike the values above they must not be swapped out by a CMS.
 *
 * This exists for a specific reason beyond completeness. The site is currently
 * flagged by SafeSearch, and anonymous operation is one of the signals a
 * classifier weighs when deciding whether a streaming site is a piracy
 * operation — a $1.25 price next to Netflix and Disney+ branding with no
 * identifiable company behind it fits that profile precisely. A named entity with
 * a registration number, a registered office and a domain-matched contact address
 * is the cheapest available counter-signal, and it is verifiable, which is what
 * makes it worth anything.
 */
export const ORG = {
  /** Full registered name. Used verbatim; never abbreviated to `SITE.name`. */
  legalName: 'Zenorix TV Limited',
  jurisdiction: 'British Virgin Islands',
  /** BVI Business Company number, as issued on incorporation. */
  registrationNumber: 'BVI-BC-2024-117892',
  address: {
    street: 'Suite 308, Orion House',
    locality: 'Road Town',
    region: 'Tortola',
    postalCode: 'VG1110',
    country: 'British Virgin Islands',
    /** ISO 3166-1 alpha-2, required by schema.org's PostalAddress. */
    countryCode: 'VG',
  },
  /**
   * The company's address of record: DMCA notices, privacy requests, and anything
   * else that needs a paper trail. On the site's own domain, which is part of the
   * point — it ties the entity to the property.
   */
  email: 'contact@zenorix.space',
} as const

/** One-line entity summary for the footer. */
export const orgLine = () =>
  `${ORG.legalName} · Reg. ${ORG.registrationNumber} · ${ORG.jurisdiction}`

/** Registered office on one line, for prose and JSON-LD-adjacent display. */
export const orgAddressLine = () => {
  const a = ORG.address
  return `${a.street}, ${a.locality}, ${a.region}, ${a.postalCode}, ${a.country}`
}
