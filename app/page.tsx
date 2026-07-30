import type { Metadata } from 'next'
import { BrandLanding } from '@/components/landing/brand-landing'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { defaultLocale } from '@/lib/i18n/config'
import { buildHomeMetadata } from '@/lib/seo'

/**
 * Root route. There is no middleware in a static export, so `/` is a real page
 * rather than a redirect — it serves the default market so `out/index.html`
 * works when opened directly.
 *
 * It canonicalizes to `/en` so this and the English market page are never
 * indexed as duplicates.
 */
export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(defaultLocale)
  return buildHomeMetadata({ locale: defaultLocale, dict, canonicalLocale: 'en' })
}

export default async function RootPage() {
  const dict = await getDictionary(defaultLocale)
  return <BrandLanding locale={defaultLocale} dict={dict} />
}
