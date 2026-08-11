import { ContactLink } from '@/components/landing/contact-link'
import { orgLine } from '@/lib/config/site'

/**
 * Minimal footer: support, then legal links, then the entity and copyright lines.
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
  /** Built by `legalLinks` in both callers, so the row is identical everywhere. */
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
          icon="chat_bubble"
        />

        <ul className="zx-footer-links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        {/* Entity and copyright as ONE group, not two siblings.
            
            On desktop `.zx-footer-inner` becomes a `space-between` row built around
            three items — support, legal, identity. Adding the entity line as a
            fourth child would spread it as a peer of the legal links, where it
            reads as another nav column, so it is grouped with the copyright it
            belongs with instead.
            
            One line, not a block: the registered address and the notice address
            live on the legal pages, and reproducing them on every screen would
            turn the footer back into the brand slab that was deliberately deleted
            from it. What stays here is the pair a reader (or a reviewer) checks
            first — who operates this, and under what registration. */}
        <div className="zx-footer-meta">
          <p className="zx-footer-org">{orgLine()}</p>
          <p className="zx-footer-copy">{copyright}</p>
        </div>
      </div>
    </footer>
  )
}
