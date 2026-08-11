import { PLATFORMS, PLATFORM_ORDER, type PlatformId } from '@/lib/content/platforms'
import type { Locale } from '@/lib/i18n/config'

/**
 * Outbound directory — the streaming services shown on this page, plus the
 * ratings and reference sites, as one registry.
 *
 * WHAT THIS IS NOT: a partner list. The footer heading over these links reads
 * "where to watch", never "partners" or "friends of Zenorix", and that wording is
 * load-bearing rather than modest. `dict.legal.terms` states that Zenorix "is an
 * independent application and is not affiliated with, endorsed by or operated by
 * any of those companies" — so a block on the same site announcing a partnership
 * with Netflix would contradict its own Terms, on an aggregator, in the one place
 * a trademark complaint would quote first. Linking to a company's official site
 * and naming it accurately is ordinary reference; claiming a relationship with it
 * is not. If the labels here ever change, that clause in all three dictionaries
 * has to change with them, in the same commit.
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
  /** Square app icon, platforms only. Reference sites are text links. */
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
    icon: PLATFORMS[id].icon,
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
  { name: 'IMDb', href: 'https://www.imdb.com' },
  { name: 'Rotten Tomatoes', href: 'https://www.rottentomatoes.com' },
  { name: 'Metacritic', href: 'https://www.metacritic.com' },
  { name: 'Letterboxd', href: 'https://letterboxd.com' },
  { name: 'JustWatch', href: 'https://www.justwatch.com' },
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
    { name: 'AdoroCinema', href: 'https://www.adorocinema.com' },
    { name: 'Filmow', href: 'https://filmow.com' },
  ],
  th: [
    { name: 'Sanook Movie', href: 'https://movie.sanook.com' },
    { name: 'Kapook Movie', href: 'https://movie.kapook.com' },
  ],
}

export function referenceLinks(locale: Locale): OutboundLink[] {
  return [...REFERENCE_GLOBAL, ...REFERENCE_LOCAL[locale]]
}
