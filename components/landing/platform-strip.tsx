import { PLATFORMS, PLATFORM_ORDER } from '@/lib/content/platforms'

/**
 * Licensed-source trust strip.
 *
 * Renders each service's own app icon, unmodified and in full color (the same
 * asset badged on the Top 10 posters), captioned as a content source rather
 * than a partner endorsement. See the footer disclaimer for the trademark
 * notice.
 *
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
          {PLATFORM_ORDER.map((id) => {
            const platform = PLATFORMS[id]
            return (
              <li key={platform.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={platform.icon || '/placeholder.svg'}
                  alt={platform.name}
                  width={40}
                  height={40}
                  loading="lazy"
                  decoding="async"
                />
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
