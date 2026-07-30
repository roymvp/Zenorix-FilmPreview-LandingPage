import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { SiteHtml, baseMetadata, baseViewport } from '@/components/site-html'
import { isLocale, localeMeta, locales } from '@/lib/i18n/config'
import '../globals.css'
import '../landing.css'

/** Every market is prerendered at build time — no request-time work. */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export const metadata = baseMetadata
export const viewport = baseViewport

/**
 * A ROOT layout: it renders its own <html>, so each market's exported HTML
 * carries the correct `lang` from the first byte. See components/site-html for
 * why the app has two root layouts instead of one.
 */
export default async function LocaleRootLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  return <SiteHtml lang={localeMeta[lang].htmlLang}>{children}</SiteHtml>
}
