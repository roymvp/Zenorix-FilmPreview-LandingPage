import { homePath, locales, localeMeta, type Locale } from '@/lib/i18n/config'

/**
 * Language selection is NAVIGATION, not client-side string swapping: each
 * market is a plain anchor to its own URL, so every language keeps an
 * indexable page and its own link equity.
 *
 * Three flat anchors rather than a dropdown — with only three markets a menu
 * costs interactive JavaScript to hide two links, and this ships none.
 */
export function LanguageSwitcher({
  current,
  menuLabel,
}: {
  current: Locale
  menuLabel: string
}) {
  return (
    <nav className="zx-lang" aria-label={menuLabel}>
      {locales.map((locale) => {
        const { short, name, htmlLang } = localeMeta[locale]
        const isCurrent = locale === current

        return (
          <a
            key={locale}
            className="zx-lang-link"
            href={homePath(locale)}
            hrefLang={htmlLang}
            /* The short code is the visible label; the endonym is the
               accessible name, so "PT" is announced as "Português". */
            aria-label={name}
            aria-current={isCurrent ? 'page' : undefined}
          >
            {short}
          </a>
        )
      })}
    </nav>
  )
}
