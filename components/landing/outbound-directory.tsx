import type { OutboundLink } from '@/lib/content/outbound'

/**
 * The footer's outbound directory: the official streaming partners, then the
 * reference sites a visitor checks a title against.
 *
 * Two groups that are NOT peers, and the styling still says so — the partners are
 * filled chips and they come first, because whose content is in the catalogue is the
 * strongest claim this footer makes, while the reference sites are a plain muted row.
 * But BOTH now carry icons, from one source.
 *
 * They did not before, and the note here used to defend that: the reference sites
 * were text-only because "IMDb and Metacritic have no icon in this project" and
 * because favicon chips "would add requests to buy nothing". The first half was a
 * statement about the asset folder, not about the design. The second was answered by
 * measuring: all twenty marks together are 27KB of WebP, lazy-loaded in the last
 * block of the page, and what they buy is real — a row of nine foreign-language
 * brand names is a wall of text, which matters most in the two markets where
 * "Filmow" and "Kapook" mean nothing to a non-local visitor.
 *
 * The icons are FAVICONS for both groups (`public/favicons/`, built by
 * `scripts/build-footer-icons.mjs`). The partners' App Store icons were the wrong
 * asset for this block twice over: they made the two rows look like different kinds
 * of thing, and an app icon promises an installable app where these are just links
 * to websites. The app icons stay in the trust strip and the Top 10 badges.
 *
 * Hierarchy is carried by chip-versus-text and by order, which is where it belongs.
 * Icon presence was never what distinguished a licensed partner from a site we
 * merely link to.
 *
 * Each group carries its OWN closing note rather than sharing one, because the two
 * relationships are now genuinely different — see the `watchNote`/`referenceNote`
 * comment on the props below.
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
/**
 * One anchor, used by both groups — which is the reason this exists rather than the
 * two lists each rendering their own.
 *
 * When only the partners had icons, the two lists were legitimately different markup
 * and duplicating four lines was harmless. Now that both carry an icon and both need
 * the same `alt=""`, the same conditional guard and the same new-tab suffix, keeping
 * two copies means every future fix has to be made twice — and the codebase already
 * has evidence of that failing: the leading-space fix in the accessible name was
 * applied to the partner list and NOT to the reference list, so those nine links read
 * as "IMDbopens in a new tab" for as long as both copies existed. One renderer makes
 * that class of drift impossible.
 *
 * `variant` is the only real difference: the partners get the chip modifiers.
 */
function DirectoryLink({
  link,
  newTab,
  variant,
}: {
  link: OutboundLink
  newTab: string
  variant?: 'brand'
}) {
  return (
    <a
      className={variant === 'brand' ? 'zx-directory-link zx-directory-link--brand' : 'zx-directory-link'}
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {/* Decorative: the name sits right next to it in the same link, so `alt=""` is
          correct and an alt here would double it up. Rendered only when an icon
          exists rather than falling back to an empty `src`, which browsers resolve
          against the current URL and re-request the page as an image. */}
      {link.icon ? (
        <img
          className="zx-directory-icon"
          src={link.icon}
          alt=""
          width={20}
          height={20}
          loading="lazy"
          decoding="async"
        />
      ) : null}
      {link.name}
      {/* Leading space is inside the string, not JSX whitespace between the two nodes
          — JSX drops that, and the accessible name came out as "Netflixopens in a new
          tab" (verified in-browser). */}
      <span className="zx-visually-hidden">{` ${newTab}`}</span>
    </a>
  )
}

export function OutboundDirectory({
  watch,
  reference,
  copy,
}: {
  watch: OutboundLink[]
  reference: OutboundLink[]
  copy: {
    watchHeading: string
    referenceHeading: string
    /**
     * ONE NOTE PER GROUP, not one blanket note for both.
     *
     * There used to be a single sentence under the whole block saying Zenorix was
     * "not affiliated with any of them". That is now false of the first group and
     * still true of the second, so a shared line cannot be written without lying
     * about one of them: the services are licensed distribution partners, while
     * IMDb and Letterboxd are unpaid reference sites we simply link to. Splitting
     * the sentence is what lets each group state its own actual relationship —
     * which is also the part a trademark complaint would quote.
     *
     * Both strings must stay in step with `dict.legal.dmca`'s partner clause; see
     * the header note in `lib/content/outbound.ts`.
     */
    watchNote: string
    referenceNote: string
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
      {/* THE PARTNERS. Given the weight of the block and listed first, because
          "whose content is actually in here" is the strongest thing this footer
          has to say — it used to be one muted line of text among two. */}
      <section
        className="zx-directory-group zx-directory-group--partners"
        aria-labelledby="zx-directory-watch"
      >
        <h2 className="zx-directory-title" id="zx-directory-watch">
          {copy.watchHeading}
        </h2>
        <ul className="zx-directory-list zx-directory-list--brand">
          {watch.map((link) => (
            <li key={link.href}>
              <DirectoryLink link={link} newTab={copy.newTab} variant="brand" />
            </li>
          ))}
        </ul>
        <p className="zx-directory-note">{copy.watchNote}</p>
      </section>

      <section className="zx-directory-group" aria-labelledby="zx-directory-reference">
        <h2 className="zx-directory-title" id="zx-directory-reference">
          {copy.referenceHeading}
        </h2>
        <ul className="zx-directory-list">
          {reference.map((link) => (
            <li key={link.href}>
              <DirectoryLink link={link} newTab={copy.newTab} />
            </li>
          ))}
        </ul>
        <p className="zx-directory-note">{copy.referenceNote}</p>
      </section>
    </div>
  )
}
