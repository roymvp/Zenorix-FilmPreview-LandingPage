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
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const first = decodeURIComponent(pathname.split('/')[1] ?? '')

  if (isLocale(first)) return NextResponse.next()

  const locale = detectLocale(request)
  const url = request.nextUrl.clone()

  /* `/` lands on the market page itself. It used to redirect to the featured
     film's deep URL, which sent every single visitor to a doorway page (and made
     the site's real entry point a URL naming a film chosen by array order). */
  url.pathname = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`

  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next|api|.*\\.[\\w]+$).*)'],
}
