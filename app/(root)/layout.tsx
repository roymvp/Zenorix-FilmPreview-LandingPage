import type { ReactNode } from 'react'
import { SiteHtml, baseMetadata, baseViewport } from '@/components/site-html'
import { localeMeta, defaultLocale } from '@/lib/i18n/config'
import '../globals.css'
import '../landing.css'

export const metadata = baseMetadata
export const viewport = baseViewport

/**
 * Root layout for `/` only. It exists as a route-group layout so that
 * `app/[lang]` can own its own <html> and emit the right `lang` per market —
 * see components/site-html.
 */
export default function RootRouteLayout({ children }: { children: ReactNode }) {
  return <SiteHtml lang={localeMeta[defaultLocale].htmlLang}>{children}</SiteHtml>
}
