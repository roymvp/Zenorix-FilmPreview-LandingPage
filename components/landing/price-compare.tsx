import { DownloadCta } from '@/components/landing/download-cta'

export type CompareRow = {
  service: string
  price: string
  titles: string
  liveTv: string
  quality: string
  highlight?: boolean
}

/**
 * The price argument, made concrete.
 *
 * Zenorix sits in the first row with the competitor stack beneath it and their
 * combined monthly cost struck through at the bottom — the single strongest
 * conversion lever this product has.
 */
export function PriceCompare({
  heading,
  sub,
  labels,
  rows,
  totalLabel,
  totalPrice,
  footnote,
  cta,
  ctaSub,
}: {
  heading: string
  sub: string
  labels: {
    service: string
    price: string
    titles: string
    liveTv: string
    quality: string
  }
  rows: CompareRow[]
  totalLabel: string
  totalPrice: string
  footnote: string
  cta: string
  ctaSub: string
}) {
  return (
    <section
      className="zx-section zx-compare"
      aria-labelledby="zx-compare-heading"
    >
      <div className="zx-shell">
        <div className="zx-section-head">
          <span className="zx-eyebrow md-typescale-label-small">
            <md-icon aria-hidden="true">savings</md-icon>
            {labels.price}
          </span>
          <h2 id="zx-compare-heading" className="md-typescale-headline-medium">
            {heading}
          </h2>
          <p className="md-typescale-body-medium">{sub}</p>
        </div>

        <div className="zx-table-wrap">
          <table className="zx-table">
            <caption className="zx-visually-hidden">{heading}</caption>
            <thead>
              <tr>
                <th scope="col">{labels.service}</th>
                <th scope="col">{labels.price}</th>
                <th scope="col">{labels.titles}</th>
                <th scope="col">{labels.liveTv}</th>
                <th scope="col">{labels.quality}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.service} data-highlight={row.highlight ? 'true' : 'false'}>
                  <th scope="row">
                    <span className="zx-table-brand">
                      {row.highlight ? (
                        <md-icon aria-hidden="true">check_circle</md-icon>
                      ) : null}
                      {row.service}
                    </span>
                  </th>
                  <td>
                    <span className={row.highlight ? 'zx-table-price' : undefined}>
                      {row.price}
                    </span>
                  </td>
                  <td>{row.titles}</td>
                  <td>{row.liveTv}</td>
                  <td>{row.quality}</td>
                </tr>
              ))}
              <tr>
                <th scope="row">{totalLabel}</th>
                <td>
                  <span className="zx-strike">{totalPrice}</span>
                </td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="zx-footnote">{footnote}</p>

        <div style={{ marginBlockStart: 26 }}>
          <DownloadCta
            label={cta}
            sub={ctaSub}
            source="price_compare"
            icon="android"
          />
        </div>
      </div>
    </section>
  )
}
