import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { isLocale, localeMeta, locales } from '@/lib/i18n/config'

/** Every market is prerendered at build time — no request-time work. */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

/**
 * Sets the market's real BCP-47 language on <html> before paint. Next.js owns
 * the single <html> element in the root layout, so each locale segment corrects
 * the attribute here — search engines and screen readers both read the final
 * value, and it is applied synchronously so there is no flash of the wrong lang.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()

  const { htmlLang } = localeMeta[lang]

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify(htmlLang)}`,
        }}
      />
      {children}
    </>
  )
}
