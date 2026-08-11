import { FooterContacts } from '@/components/landing/footer-contacts'
import { OutboundDirectory } from '@/components/landing/outbound-directory'
import { SITE, orgAddressLine, orgLine } from '@/lib/config/site'
import { legalLinks } from '@/lib/content/legal'
import { referenceLinks, watchLinks } from '@/lib/content/outbound'
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
 * - Brand. Wordmark, one line on what the product is, install CTA, and the
 *   operating entity. It is the only column with a coloured action, because "get
 *   the app" is the one thing the footer is allowed to still be selling.
 * - Get in touch. The four contact channels.
 * - Legal. The three legal pages.
 *
 * TWO COLUMNS WERE REMOVED: "Trending movies" and "Trending shows", six title-page
 * links each. The note here used to defend them on crawl grounds — every other
 * footer link points OUTWARD, at Netflix or IMDb, so the catalogue links were
 * described as the title pages' only site-wide internal path. That was overstated.
 * `app/sitemap.ts` enumerates all of them via `allTitles()`, `llms.txt` lists them
 * with descriptions, and `top-chart.tsx` links them from the rails; twelve of
 * eighty-seven titles in a footer added a fourth, partial path, not the only one.
 * What it cost was concrete: two columns of film names no reader came here for,
 * padding the band to twice the width it needed.
 *
 * Support and legal, which shared one column while the band was four wide, are two
 * columns now. That is not a new idea so much as the removal reversing the old
 * one's premise: they were merged because a fifth column holding three short links
 * "would leave most of its width empty", and with two columns gone the opposite is
 * true — the band has width to fill, and the two groups are not the same thing.
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

            {/* THE OPERATING ENTITY, moved up out of the baseline band — and the
                address is new here, having previously appeared only on the legal
                pages.
                
                The old placement had it alone above the copyright, on the reasoning
                that this line "exists to be FOUND rather than read". True, and the
                brand column is where someone looks: it already names the product, so
                naming the company that runs it belongs to the same thought. In the
                baseline it read as fine print attached to the copyright, which is a
                different claim than "here is who we are".
                
                `<address>` rather than a second `<p>`. This is the contact/provenance
                block for the whole document, which is exactly the element's meaning,
                and it turns two loose lines into one labelled group for a screen
                reader. Browsers italicise it by default, undone in the stylesheet.
                
                The registration line and the street address stay SEPARATE strings
                from `orgLine()` and `orgAddressLine()` rather than being concatenated:
                the legal pages render the same two facts from the same two helpers, so
                a footer that composed its own version would be a second source of
                truth for a detail that must not disagree. */}
            <address className="zx-footer-org">
              {/* Bare spans, no class. `.zx-footer-org` is a flex column, so these
                  stack as its items — a per-line class would have no rule to carry. */}
              <span>{orgLine()}</span>
              <span>{orgAddressLine()}</span>
            </address>
          </div>

          <div className="zx-footer-col">
            <h2 className="zx-footer-heading">{copy.helpHeading}</h2>
            {/* All four channels — support, X, community, email — in one uniform
                list. They used to be three components in a wrapper plus a fourth
                link stranded in the baseline band, each with its own format; see the
                note in `FooterContacts` for why that was worth collapsing. */}
            <FooterContacts contact={dict.contact} social={dict.social} />
          </div>

          {/* Legal, on its own again. `zx-footer-heading--second` and the wrapper it
              needed are gone with the merge — this heading is its column's first
              child, so the column's own `gap` spaces it correctly. */}
          <nav className="zx-footer-col" aria-labelledby="zx-footer-legal">
            <h2 className="zx-footer-heading" id="zx-footer-legal">
              {copy.legalHeading}
            </h2>
            <ul className="zx-footer-col-list">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* `referenceLinks` is market-specific by design — a Brazilian reader wants
            AdoroCinema, not only IMDb — whereas the partner list is the same in
            every market, so only one of the two takes a locale. */}
        <OutboundDirectory
          watch={watchLinks()}
          reference={referenceLinks(locale)}
          copy={{ ...copy.directory, newTab: dict.a11y.newTab }}
        />

        {/* The baseline, now the copyright alone.
            
            It has had two things taken off it. `ORG.email` went to the contact list,
            because an address of record hidden in a copyright band is not found by the
            rights holders who need it. The entity line went to the brand column, for
            the reason given there. Both were being kept down here to avoid crowding
            the columns, which stopped being a real constraint once the band lost two
            of them.
            
            What is left is the one line that genuinely belongs last, so the band is a
            single paragraph rather than a stack — see the stylesheet note on
            `.zx-footer-base`. */}
        <div className="zx-footer-base">
          {/* The year was hardcoded as `2026` in all three callers. It is derived
              now: this is a server component with no `use client` anywhere up its
              tree, so the call runs at build time only — no hydration mismatch is
              possible, and the difference is simply that a rebuild refreshes the
              year instead of it silently going stale in January. */}
          <p className="zx-footer-copy">
            {fill(copy.copyright, { year: String(new Date().getFullYear()) })}
          </p>
        </div>
      </div>
    </footer>
  )
}
