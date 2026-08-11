import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LegalPage } from '@/components/landing/legal-page'
import { isLegalSlug, LEGAL_SLUGS, type LegalSlug } from '@/lib/content/legal'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { isLocale, locales, type Locale } from '@/lib/i18n/config'
import { buildLegalMetadata } from '@/lib/seo'

type RouteParams = { lang: string; slug: string }

/**
 * The three legal documents: `/[lang]/privacy`, `/[lang]/terms`, `/[lang]/dmca`.
 *
 * A `[slug]` route at this depth is exactly the shape that used to be a problem
 * here — `/[lang]/[segment]/[slug]` rendered the landing page under nine film
 * titles and was deleted as doorway pages. The difference is what the segment
 * resolves to: `isLegalSlug` accepts three values and 404s everything else, and
 * each of the three renders substantially different prose. Nothing about this
 * route can generate a near-duplicate of another URL.
 *
 * These carry real weight beyond compliance. The site had three URLs total, all
 * of them the same page in different languages; nine more genuinely distinct
 * pages is the difference between a domain with one document and a domain with a
 * structure. The DMCA page in particular states the licensing position in
 * crawlable prose, which is the claim the SafeSearch classifier is currently
 * getting wrong.
 */
async function resolve(params: Promise<RouteParams>) {
  const { lang, slug } = await params
  if (!isLocale(lang) || !isLegalSlug(slug)) notFound()

  const locale: Locale = lang
  const doc: LegalSlug = slug
  return { locale, doc, dict: await getDictionary(locale) }
}

/**
 * Nine static pages at build time — three documents in three markets.
 *
 * Worth prerendering: the copy is fixed, so there is nothing to resolve per
 * request, and a crawler that follows the footer should never wait on a render.
 */
export function generateStaticParams() {
  return locales.flatMap((lang) => LEGAL_SLUGS.map((slug) => ({ lang, slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { locale, doc, dict } = await resolve(params)
  return buildLegalMetadata({ locale, dict, doc })
}

export default async function LegalDocumentPage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  const { locale, doc, dict } = await resolve(params)
  return <LegalPage locale={locale} dict={dict} doc={doc} />
}
