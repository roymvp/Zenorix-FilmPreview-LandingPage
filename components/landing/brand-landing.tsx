import { DownloadCta } from '@/components/landing/download-cta'
import { SiteFooter } from '@/components/landing/site-footer'
import { TopBar } from '@/components/landing/top-bar'
import { TrailerBackdrop } from '@/components/landing/trailer-backdrop'
import { SITE } from '@/lib/config/site'
import { fill, type Dictionary } from '@/lib/i18n/dictionaries'
import { homePath, type Locale } from '@/lib/i18n/config'

/**
 * The brand home page, shared by all three markets and by the root route.
 *
 * Three sections, and only three: the top bar, the hero, and the footer. The
 * hero fills the viewport — trailer reel at the back, brand lockup and the two
 * store buttons centered over it.
 */
export function BrandLanding({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <>
      <a className="zx-visually-hidden" href="#zx-get">
        {dict.a11y.skipToContent}
      </a>

      <div className="zx-page">
        <TopBar
          locale={locale}
          homeLabel={dict.nav.home}
          languageMenuLabel={dict.nav.languageMenu}
        />

        <main className="zx-hero">
          <TrailerBackdrop />

          <div className="zx-shell zx-hero-inner">
            <img
              className="zx-hero-logo"
              src={SITE.logo}
              alt=""
              width={72}
              height={72}
            />
            <h1 className="zx-hero-name">{SITE.name}</h1>

            <div id="zx-get" className="zx-hero-cta">
              <DownloadCta
                androidLabel={dict.hero.android}
                iosLabel={dict.hero.ios}
              />
            </div>
          </div>
        </main>

        <SiteFooter
          links={[
            { label: dict.footer.privacy, href: `${homePath(locale)}#privacy` },
            { label: dict.footer.terms, href: `${homePath(locale)}#terms` },
          ]}
          copyright={fill(dict.footer.copyright, { year: 2026 })}
        />
      </div>
    </>
  )
}
