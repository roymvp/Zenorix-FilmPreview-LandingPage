import type { OutboundLink } from '@/lib/content/outbound'

/**
 * The footer's outbound directory: where to watch, then where to look a film up.
 *
 * Two groups, deliberately styled differently rather than as one long link soup.
 * The services carry their app icons because those exact marks already appear
 * twice on the page (trust strip, poster badges) and a reader recognises them
 * faster than their names; the reference sites are plain text because IMDb and
 * Metacritic have no icon in this project and inventing favicon chips for them
 * would add eleven more requests to buy nothing.
 *
 * A server component with no click tracking. Every other outbound link here
 * (`SocialLinks`, `ContactLink`) is `'use client'` for its `trackEvent` call, and
 * copying that would ship a bundle for twenty anchors whose click-through nobody
 * is going to act on. Static markup, zero JavaScript, same as the legal row.
 *
 * `target="_blank"` throughout: this sits under an install CTA, and replacing the
 * page with imdb.com would end the visit. `noreferrer` rides along with
 * `noopener` for the same reason it does in `SocialLinks` — none of these
 * destinations needs to be handed the visitor's exact market URL.
 */
export function OutboundDirectory({
  watch,
  reference,
  copy,
}: {
  watch: OutboundLink[]
  reference: OutboundLink[]
  copy: {
    /** Group headings. Neutral by design — see the note in `lib/content/outbound.ts`. */
    watchHeading: string
    referenceHeading: string
    /**
     * The independence line. Re-added to the footer on purpose, having once been
     * deleted from it: with no brand links down here a blanket trademark
     * disclaimer was boilerplate nobody read, but a row of eleven studio marks is
     * exactly the context where "these are their sites, we are not them" is the
     * one sentence that keeps the block honest.
     */
    note: string
    /** Appended to every link for screen readers, since all of them leave. */
    newTab: string
  }
}) {
  return (
    /* Not a <nav>. These are twenty outbound references, not this site's
       navigation, and promoting them to a landmark would put "IMDb, Netflix,
       Letterboxd" ahead of the actual page structure in a screen reader's
       landmark list. The two <h2>s give the same jump-to targets without the
       false claim. */
    <div className="zx-directory">
      <section className="zx-directory-group" aria-labelledby="zx-directory-watch">
        <h2 className="zx-directory-title" id="zx-directory-watch">
          {copy.watchHeading}
        </h2>
        <ul className="zx-directory-list zx-directory-list--brand">
          {watch.map((link) => (
            <li key={link.href}>
              <a
                className="zx-directory-link"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* Decorative: the name sits right next to it in the same link,
                    so `alt=""` is correct and an alt here would double it up.
                    Rendered only when an icon exists rather than falling back to
                    an empty `src`, which browsers resolve against the current URL
                    and re-request the page as an image. */}
                {link.icon ? (
                  <img
                    className="zx-directory-icon"
                    src={link.icon}
                    alt=""
                    width={16}
                    height={16}
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                {link.name}
                {/* Leading space is inside the string, not JSX whitespace between
                    the two nodes — JSX drops that, and the accessible name came out
                    as "Netflixopens in a new tab" (verified in-browser). */}
                <span className="zx-visually-hidden">{` ${copy.newTab}`}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="zx-directory-group" aria-labelledby="zx-directory-reference">
        <h2 className="zx-directory-title" id="zx-directory-reference">
          {copy.referenceHeading}
        </h2>
        <ul className="zx-directory-list">
          {reference.map((link) => (
            <li key={link.href}>
              <a
                className="zx-directory-link"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.name}
                <span className="zx-visually-hidden">{copy.newTab}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <p className="zx-directory-note">{copy.note}</p>
    </div>
  )
}
