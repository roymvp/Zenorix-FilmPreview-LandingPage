import { LanguageSwitcher } from '@/components/landing/language-switcher'
import type { Locale } from '@/lib/i18n/config'

/** Transparent bar layered over the film — chrome must never steal from the art. */
export function TopBar({
  locale,
  homeHref,
  homeLabel,
  languageLabel,
  languageMenuLabel,
  localeHrefs,
}: {
  locale: Locale
  homeHref: string
  homeLabel: string
  languageLabel: string
  languageMenuLabel: string
  localeHrefs: Record<Locale, string>
}) {
  return (
    <header className="zx-topbar">
      {/* Home mark only — the wordmark is redundant next to it and competes
          with the film art for attention.

          TO REPLACE WITH THE REAL LOGO: swap the <span> below for an <img>
          (or inline SVG) and keep the `zx-brand-mark` class — it already owns
          the 30x30 box and the rounded corners, so no CSS change is needed:

            <img className="zx-brand-mark" src="/brands/zenorix.svg" alt="" /> */}
      <a className="zx-brand" href={homeHref} aria-label={homeLabel}>
        <span className="zx-brand-mark" data-placeholder="logo" aria-hidden="true">
          <md-icon>image</md-icon>
        </span>
      </a>

      <div className="zx-topbar-actions">
        <LanguageSwitcher
          current={locale}
          label={languageLabel}
          menuLabel={languageMenuLabel}
          hrefs={localeHrefs}
        />
      </div>
    </header>
  )
}
