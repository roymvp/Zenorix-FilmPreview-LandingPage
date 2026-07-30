import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BrandLanding } from '@/components/landing/brand-landing'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { buildHomeMetadata } from '@/lib/seo'

type RouteParams = { lang: string }

async function resolve(params: Promise<RouteParams>) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const locale: Locale = lang
  return { locale, dict: await getDictionary(locale) }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { locale, dict } = await resolve(params)
  return buildHomeMetadata({ locale, dict })
}

export default async function MarketHomePage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  const { locale, dict } = await resolve(params)
  return <BrandLanding locale={locale} dict={dict} />
}
