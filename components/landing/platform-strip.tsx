/**
 * Licensed-source trust strip.
 *
 * Marks are rendered unmodified from their source SVGs (only tinted for
 * contrast) and every logo is captioned as a content source, not a partner
 * endorsement. See the footer disclaimer for the trademark notice.
 */
const PLATFORMS = [
  { name: 'Netflix', src: '/brands/netflix.svg' },
  { name: 'Disney+', src: '/brands/disney-plus.svg' },
  { name: 'HBO Max', src: '/brands/hbo-max.svg' },
  { name: 'Apple TV+', src: '/brands/apple-tv.svg' },
  { name: 'Paramount+', src: '/brands/paramount-plus.svg' },
  { name: 'Prime Video', src: '/brands/prime-video.svg' },
] as const

/**
 * Standalone section. It owns its own `.zx-shell` because it is rendered as a
 * direct child of <main> (after the Top 10) rather than nested inside another
 * section's shell, and without it the logos would sit flush to the edges.
 */
export function PlatformStrip({ label }: { label: string }) {
  return (
    <section className="zx-shell" aria-labelledby="zx-strip-label">
      <div className="zx-strip">
        <p className="zx-strip-label" id="zx-strip-label">
          <md-icon aria-hidden="true">verified</md-icon>
          {label}
        </p>
        <ul className="zx-strip-logos">
          {PLATFORMS.map((platform) => (
            <li key={platform.name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={platform.src} alt={platform.name} loading="lazy" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
