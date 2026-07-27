/** Price, breadth, quality — in that order, because price is the wedge. */
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
        <div className="zx-section-head">
          <h2 id="zx-value-heading" className="md-typescale-headline-medium">
            {heading}
          </h2>
        </div>

        <ul className="zx-values">
          {items.map((item) => (
            <li key={item.title} className="zx-value">
              <span className="zx-value-icon">
                <md-icon aria-hidden="true">{item.icon}</md-icon>
              </span>
              <h3 className="md-typescale-title-medium">{item.title}</h3>
              <p className="md-typescale-body-medium">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
