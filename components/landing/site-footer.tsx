import { ContactLink } from '@/components/landing/contact-link'
import { OutboundDirectory } from '@/components/landing/outbound-directory'
import { SocialLinks } from '@/components/landing/social-links'
import { orgLine } from '@/lib/config/site'
import type { OutboundLink } from '@/lib/content/outbound'

/**
 * Minimal footer: the outbound directory, then support, legal links, and the
 * entity and copyright lines.
 *
 * Everything else that used to live here has been removed on purpose — brand
 * block, tagline, language selector (it already exists in the top bar) and the
 * theme toggle (the app is dark-only). The page closes on the install CTA, so the
 * footer carries the legal minimum plus the one thing a footer is genuinely
 * looked in for.
 *
 * The one exception to that minimalism is the directory, which is genuinely new
 * weight rather than the old brand slab creeping back: it is the only place on
 * the site that says where these services and ratings actually live, and it is
 * why the independence line the footer used to carry is back — see
 * `OutboundDirectory`.
 *
 * Support (with social beneath it) is its OWN group above the legal list, not a
 * fourth item inside it. Dropping it in beside Privacy/Terms/DMCA would file "talk
 * to a human" under legal boilerplate — the row people skip — and it is the most
 * actionable link down here, so it is also the one that should read as an offer.
 */
export function SiteFooter({
  links,
  directory,
  copyright,
  contact,
  social,
}: {
  /** Built by `legalLinks` in both callers, so the row is identical everywhere. */
  links: { label: string; href: string }[]
  /** Built by `watchLinks`/`referenceLinks` in both callers, for the same reason. */
  directory: {
    watch: OutboundLink[]
    reference: OutboundLink[]
    copy: {
      watchHeading: string
      referenceHeading: string
      note: string
      newTab: string
    }
  }
  copyright: string
  contact: { label: string; aria: string }
  social: { follow: string; community: { label: string; aria: string } }
}) {
  return (
    <footer className="zx-footer">
      {/* No <nav> landmark: three legal links inside the footer element are
          already reachable, and a second landmark here would just add noise to
          the screen-reader landmark list. */}
      {/* Its own shell above the meta row, not a fourth child of it. That row is a
          three-item `space-between` layout on desktop, and twenty links dropped
          into it would collapse the balance it is built on. */}
      <div className="zx-shell">
        <OutboundDirectory
          watch={directory.watch}
          reference={directory.reference}
          copy={directory.copy}
        />
      </div>

      <div className="zx-shell zx-footer-inner">
        {/* Support and social as ONE group — the "reach us" column.
            
            Grouped for the same reason the entity line is grouped with the
            copyright: on desktop `.zx-footer-inner` is a `space-between` row built
            around THREE items, and adding social as a fourth child would spread the
            row into something unbalanced and file "follow us" as a peer of the
            legal links. They also belong together on the merits — both are ways to
            reach a human, unlike the two rows that follow.
            
            Contact stays first and stays the only coloured link: it is the one
            people come down here looking for. Social sits under it, quieter. */}
        <div className="zx-footer-connect">
          <ContactLink
            label={contact.label}
            ariaLabel={contact.aria}
            source="footer"
            className="zx-contact zx-contact--footer"
            icon="chat_bubble"
          />
          <SocialLinks follow={social.follow} community={social.community} />
        </div>

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
