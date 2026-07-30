import { SITE } from '@/lib/config/site'

/**
 * Minimal linear platform glyphs, inline so they cost no request and inherit
 * `currentColor` from the button label. Stroked only — they sit beside a text
 * label at 18px and a filled mark would out-weigh it.
 */
function AndroidGlyph() {
  return (
    <svg
      className="zx-cta-glyph"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 10.5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" />
      <path d="M9 9.5 7.4 6.6M15 9.5l1.6-2.9" />
      <path d="M3.5 11.5v4M20.5 11.5v4" />
      <path d="M9.5 18.5v2M14.5 18.5v2" />
    </svg>
  )
}

function AppleGlyph() {
  return (
    <svg
      className="zx-cta-glyph"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 8.2c-1-.6-2-.7-3.1-.2-1.7.8-2.6 2.7-2.2 5 .4 2.4 1.9 5 3.3 6 .8.6 1.5.3 2-.1.5-.4 1.1-.4 1.6 0 .6.4 1.3.6 2 0 1.3-1 2.7-3.5 3.2-5.8" />
      <path d="M15.4 7.7c1 .1 2 .7 2.6 1.6" />
      <path d="M12.4 7.3c-.2-1.5.8-3 2.3-3.3" />
    </svg>
  )
}

/**
 * The two store entry points, rendered in the hero where the old install CTA
 * sat. Equal-width plain anchors — they navigate straight to the configured
 * download URL with no dialog, no interstitial and no JavaScript, so this stays
 * a server component.
 */
export function DownloadCta({
  androidLabel,
  iosLabel,
}: {
  androidLabel: string
  iosLabel: string
}) {
  return (
    <div className="zx-cta">
      <a className="zx-cta-button" href={SITE.ANDROID_DOWNLOAD_URL}>
        <AndroidGlyph />
        {androidLabel}
      </a>
      <a className="zx-cta-button" href={SITE.IOS_DOWNLOAD_URL}>
        <AppleGlyph />
        {iosLabel}
      </a>
    </div>
  )
}
