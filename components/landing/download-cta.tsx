import { SITE } from '@/lib/config/site'

/**
 * Standard filled brand marks (Simple Icons path data), inline so they cost no
 * request and inherit `currentColor` from the button label. Filled rather than
 * hand-stroked: these are recognizable logos, and approximating them with
 * freehand strokes only ever reads as a broken icon.
 */
function AndroidGlyph() {
  return (
    <svg
      className="zx-cta-glyph"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17.523 15.341a1.001 1.001 0 1 1 0-2.002 1.001 1.001 0 0 1 0 2.002m-11.046 0a1.001 1.001 0 1 1 0-2.002 1.001 1.001 0 0 1 0 2.002m11.405-6.02 1.997-3.46a.416.416 0 0 0-.152-.567.416.416 0 0 0-.568.152l-2.022 3.503A12.293 12.293 0 0 0 12 7.332c-1.807 0-3.51.404-5.037 1.117L4.94 4.946a.416.416 0 0 0-.568-.152.416.416 0 0 0-.152.567L6.218 8.82C2.79 10.68.45 14.147 0 18.242h24c-.45-4.095-2.79-7.561-6.218-9.421" />
    </svg>
  )
}

function AppleGlyph() {
  return (
    <svg
      className="zx-cta-glyph"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.51 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
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
