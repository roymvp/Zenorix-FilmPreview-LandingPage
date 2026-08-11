import { PLATFORMS, PLATFORM_ORDER, type PlatformId } from '@/lib/content/platforms'
import type { Locale } from '@/lib/i18n/config'

/**
 * Outbound directory — the streaming services shown on this page, plus the
 * ratings and reference sites, as one registry.
 *
 * TWO GROUPS, TWO DIFFERENT RELATIONSHIPS — and the wording must keep them apart.
 *
 * The services are Zenorix's official distribution partners, so the footer heading
 * over them reads "Official streaming partners" and `dict.legal.dmca` states the
 * licensing relationship in full. The reference sites are NOT partners: they are
 * unpaid, editorially chosen destinations we link to, and both the footer note and
 * that same DMCA clause say so explicitly.
 *
 * This is the site's single most legally load-bearing pair of sentences, and the
 * two halves are kept in separate strings precisely so neither can be quietly
 * broadened to cover the other. If a heading or note here changes, the partner
 * clause in `legal.dmca` in ALL THREE dictionaries changes in the same commit —
 * a footer that claims a partnership the Terms deny (or vice versa) is exactly
 * what a trademark complaint would quote first.
 *
 * Names and icons are NOT repeated here. They are read from `PLATFORMS`, the same
 * registry the trust strip and the Top 10 badges read, so a service cannot appear
 * in the footer under a different mark or a stale name than it wears upstairs.
 * This file adds exactly one fact per service: where its official site is.
 */
export type OutboundLink = {
  /** Visible label. Brand names stay untranslated in every market. */
  name: string
  href: string
  /**
   * Square favicon, from `public/favicons/` — built for all twenty links by
   * `scripts/build-footer-icons.mjs`, which is where the provenance lives.
   *
   * ONE SOURCE FOR BOTH GROUPS, and that is the point. The partners used to render
   * their App Store icons here while the reference sites had no icon at all and
   * later a hand-picked mix of touch icons, wordmarks and 16px favicons — three
   * visual families across two adjacent rows. A favicon is also the honest asset for
   * a link directory: it is what a browser puts next to a URL, whereas an App Store
   * icon says "installable app", which these links are not.
   *
   * Note this is NOT `PLATFORMS[id].icon`. That registry still holds the app icons
   * and still feeds the trust strip and the Top 10 badges, where "the app" is the
   * right referent. Only the footer directory reads favicons.
   *
   * Still optional: a new link can ship the moment its URL is known and render as
   * plain text until `build-footer-icons.mjs` is re-run.
   */
  icon?: string
}

/**
 * Official destination per service — the marketing/sign-in home, not a deep link
 * into a title, because a title URL rots the moment a licence window closes.
 *
 * Every one of these was checked to resolve 200 (or a bot-block, for the two that
 * fingerprint curl) rather than typed from memory. Two are worth flagging because
 * the obvious guess is wrong:
 *   - HBO Max is back on `hbomax.com` after the Max era; `max.com` is the detour.
 *   - FOX One streams from `fox.com`. `foxone.com` appears in the launch press
 *     but is not where the service actually lives.
 * Several of these are geo-restricted (Hulu, Peacock and NBC are US-only), which
 * is a property of the service and not something a link can fix — the row is a
 * catalogue of who the sources are, not a promise that each opens in every market.
 */
const PLATFORM_SITES: Record<PlatformId, string> = {
  netflix: 'https://www.netflix.com',
  'disney-plus': 'https://www.disneyplus.com',
  'hbo-max': 'https://www.hbomax.com',
  'prime-video': 'https://www.primevideo.com',
  'apple-tv': 'https://tv.apple.com',
  'paramount-plus': 'https://www.paramountplus.com',
  hulu: 'https://www.hulu.com',
  peacock: 'https://www.peacocktv.com',
  'amc-plus': 'https://www.amcplus.com',
  nbc: 'https://www.nbc.com',
  'fox-one': 'https://www.fox.com',
}

/** Same order as the trust strip, for the same reason: one canonical sequence. */
export function watchLinks(): OutboundLink[] {
  return PLATFORM_ORDER.map((id) => ({
    name: PLATFORMS[id].name,
    href: PLATFORM_SITES[id],
    // Favicon, not `PLATFORMS[id].icon` — the slugs match the registry's ids by
    // construction, so this stays in step with it. See the note on `icon` above.
    icon: `/favicons/${id}.webp`,
  }))
}

/**
 * Ratings, credits and availability — the sites a visitor checks a film against.
 *
 * These are editorially chosen and unpaid, so they carry no `nofollow`: linking
 * out to the field's reference works is what a normal film page does, and marking
 * them would only signal that we think our own outbound links are untrustworthy.
 * Kept to five so the row stays scannable; JustWatch earns its slot by answering
 * the question the platform row above raises — which service has this title here.
 */
const REFERENCE_GLOBAL: OutboundLink[] = [
  { name: 'IMDb', href: 'https://www.imdb.com', icon: '/favicons/imdb.webp' },
  {
    name: 'Rotten Tomatoes',
    href: 'https://www.rottentomatoes.com',
    icon: '/favicons/rotten-tomatoes.webp',
  },
  { name: 'Metacritic', href: 'https://www.metacritic.com', icon: '/favicons/metacritic.webp' },
  { name: 'Letterboxd', href: 'https://letterboxd.com', icon: '/favicons/letterboxd.webp' },
  { name: 'JustWatch', href: 'https://www.justwatch.com', icon: '/favicons/justwatch.webp' },
]

/**
 * Market-local additions, appended after the global five.
 *
 * A Brazilian visitor reads reviews in Portuguese and a Thai visitor in Thai, so
 * an all-English row would be a reference section that half the audience cannot
 * use. `en` adds nothing: the five above already are its local sites, and padding
 * it to match the others' length would mean inventing entries.
 */
const REFERENCE_LOCAL: Record<Locale, OutboundLink[]> = {
  en: [],
  'pt-br': [
    {
      name: 'AdoroCinema',
      href: 'https://www.adorocinema.com',
      icon: '/favicons/adorocinema.webp',
    },
    { name: 'Filmow', href: 'https://filmow.com', icon: '/favicons/filmow.webp' },
  ],
  th: [
    {
      name: 'Sanook Movie',
      href: 'https://movie.sanook.com',
      icon: '/favicons/sanook-movie.webp',
    },
    { name: 'Kapook Movie', href: 'https://movie.kapook.com', icon: '/favicons/kapook-movie.webp' },
  ],
}

export function referenceLinks(locale: Locale): OutboundLink[] {
  return [...REFERENCE_GLOBAL, ...REFERENCE_LOCAL[locale]]
}
