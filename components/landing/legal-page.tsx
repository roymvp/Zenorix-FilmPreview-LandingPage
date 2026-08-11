import { SiteFooter } from '@/components/landing/site-footer'
import { TopBar } from '@/components/landing/top-bar'
import { ORG, orgAddressLine } from '@/lib/config/site'
import { legalLinks, type LegalSlug } from '@/lib/content/legal'
import { referenceLinks, watchLinks } from '@/lib/content/outbound'
import { fill, type Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/config'
import { buildLegalStructuredData } from '@/lib/seo'

/**
 * The shell all three legal documents render in.
 *
 * One component for privacy, terms and DMCA because the only thing that differs
 * is the prose: same header, same measure, same footer. Splitting it into three
 * would be three copies of a layout whose whole job is to stay out of the way.
 *
 * It reuses `TopBar` and `SiteFooter` unchanged, so the language switcher and the
 * legal row work here exactly as on the landing page — a visitor who lands on the
 * DMCA page from a search result gets the same way back and the same way to
 * switch market. What it does NOT reuse is `ConversionProvider` and the download
 * CTA: there is no install button anywhere on these pages. Someone reading the
 * privacy policy is checking whether to trust the app, and interrupting that with
 * the pitch is what makes a policy page read as marketing.
 *
 * `path` deliberately keeps the document when switching language — /en/dmca goes
 * to /th/dmca, not to /th. The alternative silently drops you somewhere you were
 * not reading.
 */
export function LegalPage({
  locale,
  dict,
  doc,
}: {
  locale: Locale
  dict: Dictionary
  doc: LegalSlug
}) {
  const copy = dict.legal[doc]
  const path = (target: Locale) => `/${target}/${doc}`

  const structuredData = buildLegalStructuredData({
    locale,
    dict,
    doc,
    /* The same constant the "Last updated" line below renders, so the visible date
       and the graph's `dateModified` cannot disagree. */
    lastUpdated: LAST_UPDATED,
  })

  return (
    <>
      <script
        type="application/ld+json"
        // Emitted server-side; the object is built from typed content, not input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <a className="zx-visually-hidden" href="#zx-main">
        {dict.a11y.skipToContent}
      </a>

      <div className="zx-page zx-page--doc">
        {/* Not inside a hero: these pages have no poster wall, so the bar sits on
            the page's own background rather than being layered over art. The
            component handles both — it is translucent, and over a flat surface
            that simply resolves to the surface colour. */}
        <TopBar
          locale={locale}
          homeHref={`/${locale}`}
          homeLabel={dict.nav.home}
          languageMenuLabel={dict.nav.languageMenu}
          localeHrefs={{ en: path('en'), 'pt-br': path('pt-br'), th: path('th') }}
          contact={{ aria: dict.contact.aria }}
        />

        {/* tabIndex={-1} for the same measured reason as the landing page: <main>
            is not natively focusable, so without it the skip link scrolls the
            viewport while focus stays on <body> and the next Tab walks back into
            the top bar. */}
        <main id="zx-main" className="zx-doc" tabIndex={-1}>
          <article className="zx-doc-body">
            <header className="zx-doc-head">
              <h1 className="zx-doc-title">{copy.title}</h1>
              {/* A static date, not `new Date()`. "Last updated" has to mean the
                  date the WORDS changed — rendering today's date would restamp
                  all nine documents on every deploy and make the line worthless
                  precisely when a reader checks it to see if a policy is
                  current. It is a literal here so changing it is a deliberate
                  edit alongside the copy it describes. */}
              <p className="zx-doc-meta">{fill(dict.legal.updated, { date: LAST_UPDATED })}</p>
            </header>

            {/* The intro sits outside the section list: it frames the document
                rather than being its first clause, so it takes no heading. */}
            <p className="zx-doc-intro">{copy.intro}</p>

            {/* h2 per clause, in document order. Real headings rather than styled
                paragraphs so the document is navigable by heading in a screen
                reader — which is how these are actually read — and so a crawler
                can see the structure of the argument. */}
            {copy.sections.map((section) => (
              <section key={section.h} className="zx-doc-section">
                <h2 className="zx-doc-heading">{section.h}</h2>
                <p className="zx-doc-text">{section.p}</p>
              </section>
            ))}

            {/* WHO this document is a commitment by, at the end of every one of
                them.
                
                A policy is only worth as much as the identifiability of whoever
                wrote it: "we delete your data on request" means nothing without a
                named party bound by it and an address to send the request to. So
                this is not a footer decoration, it is the clause that makes the
                rest enforceable — which is why it repeats on all three documents
                rather than living on one "about" page.
                
                <address> is the correct element and it is NOT only for postal
                addresses: it marks up contact information for the nearest
                article, which is exactly what this is. Browsers italicise it by
                default; the stylesheet resets that. */}
            <address className="zx-doc-entity">
              <p className="zx-doc-entity-name">{ORG.legalName}</p>
              <dl className="zx-doc-entity-rows">
                <div className="zx-doc-entity-row">
                  <dt>{dict.legal.entity.registration}</dt>
                  <dd>{ORG.registrationNumber}</dd>
                </div>
                <div className="zx-doc-entity-row">
                  <dt>{dict.legal.entity.office}</dt>
                  <dd>{orgAddressLine()}</dd>
                </div>
                <div className="zx-doc-entity-row">
                  <dt>{dict.legal.entity.notices}</dt>
                  <dd>
                    {/* The company address, not the Telegram handle the landing
                        page's CTA uses. A rights holder filing a DMCA notice and a
                        regulator checking the operator both need a written channel
                        that belongs to the entity above — a personal messaging
                        handle reads as an individual running a side project, which
                        is the impression these pages exist to correct. */}
                    <a href={`mailto:${ORG.email}`}>{ORG.email}</a>
                  </dd>
                </div>
              </dl>
            </address>

            {/* The one link out, at the end: a reader who has finished should not
                have to go back up to the bar to leave. */}
            <p className="zx-doc-back">
              <a href={`/${locale}`}>{dict.legal.backToHome}</a>
            </p>
          </article>
        </main>

        <SiteFooter
          links={legalLinks(locale, {
            privacy: dict.footer.privacy,
            terms: dict.footer.terms,
            dmca: dict.footer.dmca,
          })}
          /* Same directory as the landing page. Worth keeping here rather than
             stripping it: the DMCA page's own trademark clause is the text this
             block's independence line echoes, so a reader who arrives on that
             page from a search result sees the links and the disclaimer that
             governs them in one place. */
          directory={{
            watch: watchLinks(),
            reference: referenceLinks(locale),
            copy: { ...dict.footer.directory, newTab: dict.a11y.newTab },
          }}
          copyright={fill(dict.footer.copyright, { year: 2026 })}
          contact={{ label: dict.contact.label, aria: dict.contact.aria }}
          social={dict.social}
        />
      </div>
    </>
  )
}

/**
 * The date the legal copy last changed, shared by all three documents because all
 * three were written at once. Split it per document the first time one is revised
 * on its own.
 */
const LAST_UPDATED = '2026-02-11'
