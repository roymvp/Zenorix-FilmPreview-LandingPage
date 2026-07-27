/**
 * Objection handling, immediately before the final CTA.
 *
 * Native <details> rather than a JS accordion: it ships zero JavaScript, is
 * keyboard- and screen-reader-correct by default, and its content is crawlable
 * for the FAQ rich result emitted alongside it in JSON-LD.
 */
export function FaqSection({
  heading,
  items,
}: {
  heading: string
  items: { q: string; a: string }[]
}) {
  return (
    <section className="zx-section" aria-labelledby="zx-faq-heading">
      <div className="zx-shell">
        <div className="zx-section-head">
          <span className="zx-eyebrow md-typescale-label-small">
            <md-icon aria-hidden="true">help</md-icon>
            FAQ
          </span>
          <h2 id="zx-faq-heading" className="md-typescale-headline-medium">
            {heading}
          </h2>
        </div>

        <div className="zx-faq-list">
          {items.map((item, index) => (
            <details
              key={item.q}
              className="zx-faq-item"
              name="zx-faq"
              open={index === 0}
            >
              <summary className="md-typescale-title-small">
                {item.q}
                <md-icon aria-hidden="true">expand_more</md-icon>
              </summary>
              <p className="zx-faq-answer md-typescale-body-medium">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
