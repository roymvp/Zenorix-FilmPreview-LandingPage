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
  bare = false,
}: {
  label: string
  /** Risk-reducing microcopy directly under the button. */
  sub?: string
  /** Funnel position, reported with the conversion event. */
  source: string
  className?: string
  /**
   * Render just the button, without the `.zx-cta` column wrapper. Used by the
   * compact top-bar instance, which sits in a flex row of its own.
   */
  bare?: boolean
}) {
  const { download } = useConversion()

  const button = (
    <md-filled-button
      className={className}
      onClick={() => download(source)}
      aria-label={label}
    >
      {label}
    </md-filled-button>
  )

  if (bare) return button

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
