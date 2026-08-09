'use client'

import { trackEvent } from '@/lib/analytics'
import { SITE } from '@/lib/config/site'

/**
 * The support entry point, rendered at three scroll depths (top bar, the end of
 * About, and the footer) from this one component so the URL, the safe-link
 * attributes and the tracking exist in exactly one place.
 *
 * A real anchor, not a button with an onClick: this navigates off-site, so
 * middle-click, long-press and "copy link address" all have to work, and only an
 * href gives them for free. The click handler only reports — it never
 * `preventDefault()`s — so tracking can never swallow the navigation.
 *
 * `rel="noreferrer"` alongside `noopener`: the target is a support channel, and
 * there is no reason to hand it the visitor's exact market URL as a referrer.
 */
export function ContactLink({
  label,
  source,
  className = 'zx-contact',
  /**
   * Accessible name, and the ONLY name when `label` is omitted. Always spelled
   * out ("Contact us on Telegram") rather than mirroring the visible label: the
   * destination belongs in the name, not just in the icon.
   */
  ariaLabel,
  /** Leading glyph. */
  icon,
}: {
  /**
   * Visible text. Omitted in the top bar, which renders the glyph alone — the
   * bar is 32px of content height shared with the wordmark and the locale, and
   * it already establishes itself as a row of icon controls. Dropping the text
   * costs nothing here because `ariaLabel` carries the accessible name either
   * way, so screen readers and the tooltip are unaffected.
   */
  label?: string
  source: string
  className?: string
  ariaLabel: string
  icon?: string
}) {
  return (
    <a
      className={className}
      href={SITE.contactUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      /* Only in the icon-only case: with a visible label a tooltip just repeats
         what is already on screen, but a lone glyph needs a hover affordance for
         sighted mouse users, who get nothing from `aria-label`. */
      title={label ? undefined : ariaLabel}
      onClick={() => trackEvent('contact_click', { source })}
    >
      {icon ? <md-icon aria-hidden="true">{icon}</md-icon> : null}
      {label}
    </a>
  )
}
