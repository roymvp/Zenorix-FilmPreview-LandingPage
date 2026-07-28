import { DownloadCta } from '@/components/landing/download-cta'
import { LanguageSwitcher } from '@/components/landing/language-switcher'
import { SITE } from '@/lib/config/site'
import type { Locale } from '@/lib/i18n/config'

/** Transparent bar layered over the film — chrome must never steal from the art. */
export function TopBar({
  locale,
  homeHref,
  homeLabel,
  languageLabel,
  languageMenuLabel,
  installLabel,
  localeHrefs,
}: {
  locale: Locale
  homeHref: string
  homeLabel: string
  languageLabel: string
  languageMenuLabel: string
  /** Short label for the compact install button (the long sentence is used
      by the in-page CTAs, which have a full row to themselves). */
  installLabel: string
  localeHrefs: Record<Locale, string>
}) {
  return (
    <header className="zx-topbar">
      {/* TO REPLACE WITH THE REAL LOGO: swap the <span> below for an <img>
          (or inline SVG) and keep the `zx-brand-mark` class — it already owns
          the 30x30 box and the rounded corners, so no CSS change is needed:

            <img className="zx-brand-mark" src="/brands/zenorix.svg" alt="" /> */}
      <a className="zx-brand" href={homeHref} aria-label={homeLabel}>
        <span className="zx-brand-mark" data-placeholder="logo" aria-hidden="true">
          <md-icon>image</md-icon>
        </span>
        {/* aria-hidden: the link already announces itself via homeLabel, so
            reading the wordmark too would just duplicate it. */}
        <span className="zx-brand-name" aria-hidden="true">
          {SITE.name}
        </span>
      </a>

      <div className="zx-topbar-actions">
        <LanguageSwitcher
          current={locale}
          label={languageLabel}
          menuLabel={languageMenuLabel}
          hrefs={localeHrefs}
        />
        <DownloadCta
          label={installLabel}
          source="topbar"
          className="zx-topbar-cta"
          bare
        />
      </div>
    </header>
  )
}
