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
          with the film art for attention. */}
      <a className="zx-brand" href={homeHref} aria-label={homeLabel}>
        <span className="zx-brand-mark" aria-hidden="true">
          Z
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
