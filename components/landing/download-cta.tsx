'use client'

import { useConversion } from '@/components/landing/conversion-provider'
import type { CtaSource } from '@/lib/analytics'

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
  /**
   * Funnel position, reported as the `source` of `apk_download_click`. A closed
   * union rather than `string`, because it is a dashboard group-by key and an
   * interpolated value fragments the report — see `CtaSource` in lib/analytics.ts.
   */
  source: CtaSource
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

  /* A NATIVE BUTTON, not `md-filled-button`.
  
     This was the app's most load-bearing element gated behind its slowest dependency.
     `md-filled-button` is a custom element, so it cannot render until its definition
     arrives — and `MaterialWebLoader` registers definitions from a dynamic `import()`
     inside an effect, which means the chain was: hydrate all of React, run the effect,
     download the chunk, upgrade the element. Meanwhile the `md-filled-button:not(
     :defined)` guard in globals.css holds it at `visibility: hidden`, correctly, because
     an unupgraded Material button is bare unstyled text.
     
     Measured on this machine: FCP at 988ms, Material chunks settling at ~1450ms. So
     every CTA on the page stayed invisible for ~500ms AFTER the content around it had
     painted, and on a slow connection or a failed chunk it never appeared at all. The
     footer's install link was the only one unaffected — it is a plain `<a>`.
     
     Material was contributing almost nothing here. The silver plate, radius, shadows,
     hover and press states are all painted by `.zx-cta-button` on the HOST element, with
     `--md-filled-button-container-color: transparent` deliberately blanking Material's
     own fill. What it actually supplied was label typography (three custom properties),
     a ripple, and `role=button` — the first is four lines of CSS, and the last two a
     native `<button>` has for free. That is not a trade worth a 500ms invisible primary
     action.
     
     `type="button"`: the dialog instances render inside `md-dialog`, whose content sits
     in a form for its close behaviour, and a default `type="submit"` would submit it. */
  const button = (
    <button
      type="button"
      className={className}
      onClick={() => download(source)}
      /* No `aria-label` here, unlike the Material version. The label is now the
         button's own text content, so an identical `aria-label` would be a redundant
         override — and it silently breaks voice control when the two ever drift. */
      autoFocus={autoFocus}
    >
      {label}
    </button>
  )

  return (
    <div className="zx-cta">
      {button}
      {sub ? (
        <p className="zx-cta-sub">
          <span className="zx-icon" aria-hidden="true">
            verified_user
          </span>
          {sub}
        </p>
      ) : null}
    </div>
  )
}
