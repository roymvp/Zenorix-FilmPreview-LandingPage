'use client'

import { useConversion } from '@/components/landing/conversion-provider'

/**
 * The one and only download control. Rendered at every scroll depth with the
 * same label treatment so the primary action is never ambiguous.
 */
export function DownloadCta({
  label,
  sub,
  source,
  icon = 'download',
  className = 'zx-cta-button',
}: {
  label: string
  /** Risk-reducing microcopy directly under the button. */
  sub?: string
  /** Funnel position, reported with the conversion event. */
  source: string
  icon?: string
  className?: string
}) {
  const { download } = useConversion()

  return (
    <div className="zx-cta">
      <md-filled-button
        className={className}
        onClick={() => download(source)}
        aria-label={label}
      >
        <md-icon slot="icon" aria-hidden="true">
          {icon}
        </md-icon>
        {label}
      </md-filled-button>
      {sub ? (
        <p className="zx-cta-sub">
          <md-icon aria-hidden="true">verified_user</md-icon>
          {sub}
        </p>
      ) : null}
    </div>
  )
}
