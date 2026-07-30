import { LanguageSwitcher } from '@/components/landing/language-switcher'
import { SITE } from '@/lib/config/site'
import { homePath, type Locale } from '@/lib/i18n/config'

/**
 * Brand mark and language links. That is the entire navigation — there are no
 * menu items, because there is nowhere else to go: the site is one page per
 * market.
 */
export function TopBar({
  locale,
  homeLabel,
  languageMenuLabel,
}: {
  locale: Locale
  homeLabel: string
  languageMenuLabel: string
}) {
  return (
    <header className="zx-topbar">
      {/* The light band spans the viewport while its CONTENT stays in the shared
          page column, so the brand mark lines up with the hero lockup below. */}
      <div className="zx-shell zx-topbar-inner">
        <a className="zx-brand" href={homePath(locale)} aria-label={homeLabel}>
          <img className="zx-brand-mark" src={SITE.logo} alt="" width={30} height={30} />
          {/* aria-hidden: the link already announces itself via homeLabel, so
              reading the wordmark too would just duplicate it. */}
          <span className="zx-brand-name" aria-hidden="true">
            {SITE.name}
          </span>
        </a>

        <LanguageSwitcher current={locale} menuLabel={languageMenuLabel} />
      </div>
    </header>
  )
}
