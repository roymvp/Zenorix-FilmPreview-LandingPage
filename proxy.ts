import { NextResponse, type NextRequest } from 'next/server'
import {
  defaultLocale,
  isLocale,
  locales,
  localeMeta,
  type Locale,
} from '@/lib/i18n/config'

/** Geo-IP shortcut for the three launch markets. */
const countryToLocale: Record<string, Locale> = {
  US: 'en',
  BR: 'pt-br',
  TH: 'th',
}

function fromAcceptLanguage(header: string | null): Locale | undefined {
  if (!header) return undefined
  const tags = header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=')
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { tag } of tags) {
    for (const locale of locales) {
      if (localeMeta[locale].accept.some((prefix) => tag.startsWith(prefix))) {
        return locale
      }
    }
  }
  return undefined
}

function detectLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get('NEXT_LOCALE')?.value
  if (cookie && isLocale(cookie)) return cookie

  const country = request.headers.get('x-vercel-ip-country')?.toUpperCase()
  if (country && countryToLocale[country]) return countryToLocale[country]

  return fromAcceptLanguage(request.headers.get('accept-language')) ?? defaultLocale
}

/**
 * Locale-prefixes every unprefixed request. Localized pages themselves are
 * static, so this is the only request-time work the app performs.
 *
 * THIS FILE IS `proxy.ts`, NOT `middleware.ts`. Next.js 16 renamed the
 * convention (and the exported function with it) and emits a deprecation warning
 * on every build for the old name. The rename is not cosmetic: `proxy.ts` runs
 * only on the Node.js runtime, with no Edge option. That costs this app nothing —
 * all it reads are two request headers and a cookie — but it is why the old name
 * still works today and should not be relied on.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const first = decodeURIComponent(pathname.split('/')[1] ?? '')

  if (isLocale(first)) return NextResponse.next()

  const locale = detectLocale(request)
  const url = request.nextUrl.clone()

  /* EVERY unprefixed path lands on the market page, not just `/`.

     This used to preserve the path (`/${locale}${pathname}`), which was broken for
     anything but `/`: `/[lang]` is the app's ONLY page route, so a preserved path
     could never resolve. Measured, `/fr` became a 307 to `/en/fr` and then a 404 —
     a French visitor got an error page instead of the English site, and the old
     `/movie/<slug>` URLs (a deleted route that may still be indexed or linked)
     threw away their link equity the same way.

     Collapsing to the locale root fixes both: `/fr` reaches a real page, and the
     deleted film URLs redirect into the page whose rails actually list those
     films — a relevant destination, which is what Google asks for when a URL is
     retired.

     The tradeoff, stated plainly: junk paths (`/wp-login.php`) now 307 to the
     homepage instead of 404ing, which Google may log as a soft 404. That is
     acceptable here because those URLs are not ones we want indexed anyway, and
     it does not mask real 404s — anything ALREADY locale-prefixed skips this
     branch entirely, so `/en/nonsense` still returns a true 404.

     `/` itself once redirected to the featured film's deep URL, which sent every
     visitor to a doorway page and made the site's entry point a URL named after
     whichever film sorted first. */
  url.pathname = `/${locale}`

  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next|api|.*\\.[\\w]+$).*)'],
}
