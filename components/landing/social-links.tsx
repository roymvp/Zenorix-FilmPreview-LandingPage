'use client'

import { trackEvent } from '@/lib/analytics'
import { SOCIAL } from '@/lib/config/site'

/**
 * The X mark, inline.
 *
 * Hand-written rather than pulled from an icon font because the footer's glyphs
 * come from Material Symbols, which carries no brand logos at all — there is no
 * `md-icon` name that renders this. One path, `currentColor`, so it inherits the
 * link colour and the hover transition like every other icon down here.
 *
 * `aria-hidden`: the anchor supplies the accessible name. Without this the mark
 * would either be announced as a meaningless graphic or, worse, double up on the
 * label.
 */
function XMark() {
  return (
    <svg
      className="zx-social-mark"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

/**
 * Follow + community, as a compact icon row in the footer.
 *
 * Both destinations are on X, which is the whole design problem: rendering two
 * identical X marks side by side would give a reader no way to tell them apart,
 * and labelling one of them "X" next to the X logo is redundant. So the brand
 * account gets the mark alone — that logo needs no gloss — and the community gets
 * a `group` glyph plus a word, because "a community lives here" is not something
 * any icon conveys on its own.
 *
 * Same anchor discipline as `ContactLink`: real hrefs (middle-click and "copy
 * link" must work), `noreferrer` alongside `noopener` so neither destination is
 * handed the visitor's exact market URL, and a click handler that only reports
 * and never calls `preventDefault()`, so tracking cannot swallow a navigation.
 */
export function SocialLinks({
  follow,
  community,
}: {
  /** Accessible name for the brand account. The icon-only link's ONLY name. */
  follow: string
  /** `label` is visible text; `aria` spells out the destination. */
  community: { label: string; aria: string }
}) {
  return (
    <ul className="zx-social">
      <li>
        <a
          className="zx-social-link"
          href={SOCIAL.x.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={follow}
          /* A lone glyph needs a hover affordance for sighted mouse users, who
             get nothing from `aria-label`. */
          title={follow}
          onClick={() => trackEvent('social_click', { network: 'x' })}
        >
          <XMark />
        </a>
      </li>
      <li>
        <a
          className="zx-social-link"
          href={SOCIAL.xCommunity.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={community.aria}
          onClick={() => trackEvent('social_click', { network: 'x_community' })}
        >
          <md-icon aria-hidden="true">group</md-icon>
          {community.label}
        </a>
      </li>
    </ul>
  )
}
