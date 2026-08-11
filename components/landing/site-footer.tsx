import { ContactLink } from '@/components/landing/contact-link'
import { OutboundDirectory } from '@/components/landing/outbound-directory'
import { SocialLinks } from '@/components/landing/social-links'
import { ORG, SITE, orgLine } from '@/lib/config/site'
import { legalLinks } from '@/lib/content/legal'
import { referenceLinks, watchLinks } from '@/lib/content/outbound'
import { catalogueLinks } from '@/lib/content/titles'
import type { Locale } from '@/lib/i18n/config'
import { fill, type Dictionary } from '@/lib/i18n/dictionaries'
import { marketValues } from '@/lib/seo'

/**
 * The site masthead footer: brand, four link columns, the partner directory, then
 * the legal baseline.
 *
 * THIS REPLACES A DELIBERATELY MINIMAL FOOTER, and the reversal is the point.
 * The old one carried a single centred stack — contact, three legal links, a
 * copyright — on the theory that a page closing on an install CTA should not end
 * in a wall of links. That theory held while the footer had four things in it. It
 * does not hold now: the directory alone adds eighteen links, and the result was
 * twenty-odd destinations crammed into a band built for four, reading as clutter
 * rather than as structure. Past a certain volume, columns are what make a lot of
 * content feel ORDERED instead of dense — the fix for crowding here is more
 * structure, not fewer links.
 *
 * WHAT EACH COLUMN IS FOR, since the grouping is the whole design:
 *
 * - Brand. Wordmark, one line on what the product is, install CTA. It is the only
 *   column with a coloured action, because "get the app" is the one thing the
 *   footer is allowed to still be selling.
 * - Movies / Shows. Real internal links to title pages, drawn from the SAME chart
 *   the rails render (see `catalogueLinks`). These are new and they matter for a
 *   reason beyond navigation: every other footer link on this site pointed
 *   OUTWARD, at Netflix or IMDb, which for a crawler made the footer a pure
 *   outbound hub. Linking the catalogue gives the title pages a site-wide internal
 *   path they previously only had from the rails on one page.
 * - Support + legal. Contact, social, and the three legal pages.
 *
 * The partner directory stays BELOW the columns rather than becoming a fifth one.
 * It has its own two headings and two licensing notes, and squeezed into a
 * quarter-width column its chips would wrap one per line.
 */
export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  /**
   * ASSEMBLED HERE, NOT PASSED IN — and this is a deliberate reversal.
   *
   * The old signature took nine pre-built props (`links`, `directory`, `copy`,
   * `copyright`, `contact`, `social`, ...), which meant all three callers —
   * landing, title page, legal page — repeated the same twenty lines of
   * `legalLinks(...)` / `watchLinks()` / `fill(...)` assembly. That was already
   * redundant, and this redesign adds catalogue links and eight more copy strings
   * to it, so the duplication would have tripled in three files that must not
   * disagree about what the footer contains.
   *
   * Everything below is derived from `locale` and `dict` alone, both of which
   * every caller already has. The component stays a pure function of its props;
   * it just takes the two that actually vary instead of nine that never do.
   */
  const links = legalLinks(locale, {
    privacy: dict.footer.privacy,
    terms: dict.footer.terms,
    dmca: dict.footer.dmca,
  })

  const copy = dict.footer
  const values = marketValues(dict)
  /* Six per column: enough that the band reads as a real index, few enough that
     the two columns stay the same height as the brand block beside them. */
  const movies = catalogueLinks(locale, 'movie', 6)
  const series = catalogueLinks(locale, 'series', 6)

  return (
    <footer className="zx-footer">
      <div className="zx-shell">
        {/* THE COLUMN BAND. A <nav> is deliberately NOT used here even though this
            is now genuinely navigational: the columns contain four separate link
            groups, and one landmark wrapping all of them would announce "footer
            navigation" as a single unlabelled region. Each column's <h2> gives a
            screen reader the same grouping visually, through the heading outline,
            without inventing a landmark that has no single name. */}
        <div className="zx-footer-cols">
          {/* Brand column. Wider than the link columns, and first, so the band
              opens on what the product is rather than on a list. */}
          <div className="zx-footer-brand">
            <p className="zx-footer-wordmark">{SITE.name}</p>
            <p className="zx-footer-tagline">{fill(copy.tagline, values)}</p>

            <h2 className="zx-footer-heading zx-visually-hidden">
              {copy.installHeading}
            </h2>
            {/* The footer's one filled control. `apkUrl` is absolute and on its own
                host — an update channel, not a file under this site — so it is used
                as-is rather than joined to `SITE.url`. See the note in site.ts. */}
            <a className="zx-footer-install" href={SITE.apkUrl}>
              <md-icon aria-hidden="true">download</md-icon>
              {copy.installHeading}
            </a>
            <p className="zx-footer-install-note">{fill(copy.installNote, values)}</p>
          </div>

          <nav className="zx-footer-col" aria-labelledby="zx-footer-movies">
            <h2 className="zx-footer-heading" id="zx-footer-movies">
              {copy.browseHeading}
            </h2>
            <ul className="zx-footer-col-list">
              {movies.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="zx-footer-col" aria-labelledby="zx-footer-series">
            <h2 className="zx-footer-heading" id="zx-footer-series">
              {copy.seriesHeading}
            </h2>
            <ul className="zx-footer-col-list">
              {series.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support and legal share a column. They are both "the site itself"
              rather than content, and on desktop a fifth column of three short
              legal links would leave most of its width empty. */}
          <div className="zx-footer-col">
            <h2 className="zx-footer-heading">{copy.helpHeading}</h2>
            <div className="zx-footer-connect">
              <ContactLink
                label={dict.contact.label}
                ariaLabel={dict.contact.aria}
                source="footer"
                className="zx-contact zx-contact--footer"
                icon="chat_bubble"
              />
              <SocialLinks
                follow={dict.social.follow}
                community={dict.social.community}
              />
            </div>

            <h2 className="zx-footer-heading zx-footer-heading--second">
              {copy.legalHeading}
            </h2>
            <ul className="zx-footer-col-list">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* `referenceLinks` is market-specific by design — a Brazilian reader wants
            AdoroCinema, not only IMDb — whereas the partner list is the same in
            every market, so only one of the two takes a locale. */}
        <OutboundDirectory
          watch={watchLinks()}
          reference={referenceLinks(locale)}
          copy={{ ...copy.directory, newTab: dict.a11y.newTab }}
        />

        {/* The baseline: who operates this, and the copyright.
            
            One line each, not a block. The registered address and the notice
            address live on the legal pages, and reproducing them on every screen
            is what turned the old footer into a brand slab. What stays is the pair
            a reader — or a reviewer — checks first: who runs this, and under what
            registration. `ORG.email` is here rather than in the support column on
            purpose: it is the company's address of record for rights and privacy
            correspondence, NOT the support channel, and the two must not be
            presented as alternatives (see the note on `SITE.contactUrl`). */}
        <div className="zx-footer-base">
          <p className="zx-footer-org">{orgLine()}</p>
          <p className="zx-footer-baseline">
            <a className="zx-footer-mail" href={`mailto:${ORG.email}`}>
              {ORG.email}
            </a>
            {/* The year was hardcoded as `2026` in all three callers. It is derived
                now: this is a server component with no `use client` anywhere up its
                tree, so the call runs at build time only — no hydration mismatch is
                possible, and the difference is simply that a rebuild refreshes the
                year instead of it silently going stale in January. */}
            <span className="zx-footer-copy">
              {fill(copy.copyright, { year: String(new Date().getFullYear()) })}
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}
