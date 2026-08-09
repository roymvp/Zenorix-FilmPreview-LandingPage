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
   * Accessible name. The visible label is usually just "Contact us", which does
   * not say that the link leaves for Telegram — the destination belongs in the
   * name, not only in the icon.
   */
  ariaLabel,
  /** Leading glyph. Omitted in the footer, where the row is plain text links. */
  icon,
}: {
  label: string
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
      onClick={() => trackEvent('contact_click', { source })}
    >
      {icon ? <md-icon aria-hidden="true">{icon}</md-icon> : null}
      {label}
    </a>
  )
}
