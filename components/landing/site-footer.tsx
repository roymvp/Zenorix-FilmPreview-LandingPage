/**
 * Minimal footer: legal links, then the copyright line. Nothing else.
 *
 * The page closes on the download CTAs, so the footer's whole job is to carry
 * the legal minimum without offering a single competing thing to click.
 */
export function SiteFooter({
  links,
  copyright,
}: {
  /** CONFIGURE: point these at the real legal pages once they exist. */
  links: { label: string; href: string }[]
  copyright: string
}) {
  return (
    <footer className="zx-footer">
      {/* No <nav> landmark: two legal links inside the footer element are
          already reachable, and a second landmark here would just add noise to
          the screen-reader landmark list. */}
      <div className="zx-shell zx-footer-inner">
        <ul className="zx-footer-links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        <p className="zx-footer-copy">{copyright}</p>
      </div>
    </footer>
  )
}
