import { ContactLink } from '@/components/landing/contact-link'

/**
 * Minimal footer: support, then legal links, then the copyright line.
 *
 * Everything else that used to live here has been removed on purpose — brand
 * block, tagline, trademark disclaimer, language selector (it already exists in
 * the top bar) and the theme toggle (the app is dark-only). The page closes on
 * the install CTA, so the footer carries the legal minimum plus the one thing a
 * footer is genuinely looked in for.
 *
 * Support is its OWN row above the legal list, not a fourth item inside it.
 * Dropping it in beside Privacy/Terms/DMCA would file "talk to a human" under
 * legal boilerplate — the row people skip — and it is the only actionable link
 * down here, so it is also the only one that should read as an offer.
 */
export function SiteFooter({
  links,
  copyright,
  contact,
}: {
  /** RESERVED: point these at the real legal pages once they exist. */
  links: { label: string; href: string }[]
  copyright: string
  contact: { label: string; aria: string }
}) {
  return (
    <footer className="zx-footer">
      {/* No <nav> landmark: three legal links inside the footer element are
          already reachable, and a second landmark here would just add noise to
          the screen-reader landmark list. */}
      <div className="zx-shell zx-footer-inner">
        <ContactLink
          label={contact.label}
          ariaLabel={contact.aria}
          source="footer"
          className="zx-contact zx-contact--footer"
          icon="chat"
        />

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
