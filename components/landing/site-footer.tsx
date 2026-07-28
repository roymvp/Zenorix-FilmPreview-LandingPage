import { LanguageSwitcher } from '@/components/landing/language-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import type { Locale } from '@/lib/i18n/config'

/**
 * Minimal footer: legal links on one line, copyright plus the two utility
 * controls (theme, language) on the next.
 *
 * The brand block, tagline and long trademark disclaimer were removed — the
 * page closes on the install CTA, and everything below it should be as light as
 * possible so it never competes with that action.
 */
export function SiteFooter({
  locale,
  localeHrefs,
  links,
  copyright,
  languageLabel,
  languageMenuLabel,
  themeLabel,
}: {
  locale: Locale
  localeHrefs: Record<Locale, string>
  /** RESERVED: point these at the real legal pages once they exist. */
  links: { label: string; href: string }[]
  copyright: string
  languageLabel: string
  languageMenuLabel: string
  themeLabel: string
}) {
  return (
    <footer className="zx-footer">
      <div className="zx-shell">
        <ul className="zx-footer-links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        <div className="zx-footer-bottom">
          <p className="zx-footer-copy">{copyright}</p>

          <div className="zx-footer-actions">
            <ThemeToggle label={themeLabel} />
            <LanguageSwitcher
              current={locale}
              hrefs={localeHrefs}
              label={languageLabel}
              menuLabel={languageMenuLabel}
              variant="footer"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
