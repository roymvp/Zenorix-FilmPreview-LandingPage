import { ThemeToggle } from '@/components/theme-toggle'

/**
 * Minimal footer: legal links, then copyright and the theme toggle.
 *
 * The brand block, tagline and long trademark disclaimer were removed — the
 * page closes on the install CTA, and everything below it should be as light as
 * possible so it never competes with that action.
 *
 * The language selector was removed too: it already lives in the top bar, and a
 * second copy down here was a duplicate control on a page whose footer should
 * hold nothing but legal text.
 */
export function SiteFooter({
  links,
  copyright,
  themeLabel,
}: {
  /** RESERVED: point these at the real legal pages once they exist. */
  links: { label: string; href: string }[]
  copyright: string
  themeLabel: string
}) {
  return (
    <footer className="zx-footer">
      <div className="zx-shell zx-footer-inner">
        {/* No <nav> landmark: three legal links inside the footer element are
            already reachable, and a second landmark here would just add noise
            to the screen-reader landmark list. */}
        <ul className="zx-footer-links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        <div className="zx-footer-bottom">
          <p className="zx-footer-copy">{copyright}</p>
          <ThemeToggle label={themeLabel} />
        </div>
      </div>
    </footer>
  )
}
