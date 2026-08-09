'use client'

import { useConversion } from '@/components/landing/conversion-provider'

/**
 * The one and only download control. Rendered at every scroll depth with the
 * same label treatment so the primary action is never ambiguous.
 *
 * Intentionally has NO leading icon: the label is a full sentence, and an icon
 * beside it pushed the text toward wrapping on a phone while adding nothing —
 * the button's meaning is already unambiguous from its copy.
 */
export function DownloadCta({
  label,
  sub,
  source,
  className = 'zx-cta-button',
  autoFocus = false,
}: {
  label: string
  /** Risk-reducing microcopy directly under the button. */
  sub?: string
  /** Funnel position, reported with the conversion event. */
  source: string
  className?: string
  /**
   * Make this the initial focus target inside an md-dialog. Only the dialog
   * instances set it: md-dialog otherwise focuses the first focusable child,
   * which is the corner close button, putting a bright focus ring on "dismiss"
   * and making it the visual focal point instead of this CTA.
   */
  autoFocus?: boolean
}) {
  const { download } = useConversion()

  const button = (
    <md-filled-button
      className={className}
      onClick={() => download(source)}
      aria-label={label}
      /* Empty string, and omitted entirely when false: md-dialog matches on the
         attribute's PRESENCE, so `autofocus="false"` would still be picked up. */
      {...(autoFocus ? { autofocus: '' } : {})}
    >
      {label}
    </md-filled-button>
  )

  return (
    <div className="zx-cta">
      {button}
      {sub ? (
        <p className="zx-cta-sub">
          <md-icon aria-hidden="true">verified_user</md-icon>
          {sub}
        </p>
      ) : null}
    </div>
  )
}
