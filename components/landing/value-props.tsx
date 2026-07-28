/**
 * Why people switch — three icon bullets, price first, because price is the
 * wedge. Deliberately a plain list rather than cards: the claims are short
 * enough that card chrome only added weight.
 */
export function ValueProps({
  heading,
  items,
}: {
  heading: string
  items: { icon: string; title: string; body: string }[]
}) {
  return (
    <section className="zx-section" aria-labelledby="zx-value-heading">
      <div className="zx-shell">
        <h2 id="zx-value-heading" className="zx-section-title">
          {heading}
        </h2>

        <ul className="zx-values">
          {items.map((item) => (
            <li key={item.title} className="zx-value">
              <md-icon className="zx-value-icon" aria-hidden="true">
                {item.icon}
              </md-icon>
              <span className="zx-value-text">
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
