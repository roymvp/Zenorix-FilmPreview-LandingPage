import { LanguageSwitcher } from '@/components/landing/language-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { SITE } from '@/lib/config/site'
import type { Locale } from '@/lib/i18n/config'

export function SiteFooter({
  locale,
  localeHrefs,
  tagline,
  links,
  copyright,
  disclaimer,
  languageLabel,
  languageMenuLabel,
  themeLabel,
}: {
  locale: Locale
  localeHrefs: Record<Locale, string>
  tagline: string
  /** RESERVED: point these at the real legal pages once they exist. */
  links: { label: string; href: string }[]
  copyright: string
  disclaimer: string
  languageLabel: string
  languageMenuLabel: string
  themeLabel: string
}) {
  return (
    <footer className="zx-footer">
      <div className="zx-shell">
        <div className="zx-footer-top">
          <div>
            <span className="zx-brand">
              <span className="zx-brand-mark" aria-hidden="true">
                Z
              </span>
              <span className="zx-brand-name">{SITE.name}</span>
            </span>
            <p className="zx-footer-tagline">{tagline}</p>
          </div>

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

        <ul className="zx-footer-links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        <div className="zx-footer-legal">
          <p>{disclaimer}</p>
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  )
}
