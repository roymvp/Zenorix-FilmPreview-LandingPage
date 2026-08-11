'use client'

import { useId, useState } from 'react'

/**
 * The synopsis, collapsed to one line until asked.
 *
 * WHY THIS IS ITS OWN CLIENT COMPONENT.
 * `TitlePage` is a server component and the note at the top of it is explicit
 * about why: the whole factual body has to be in the server-rendered HTML, because
 * an AI crawler that does not execute JS still has to read every credit and score.
 * Putting `useState` in that file would have turned the entire page — cast,
 * scores, structured data, all of it — into a client tree to make one paragraph
 * fold. So the state lives here, in the smallest possible island, exactly as
 * `DownloadCta` already does for the button.
 *
 * THE TEXT IS ALWAYS IN THE DOM, IN FULL, whether collapsed or not. The collapse
 * is `-webkit-line-clamp`, a purely visual truncation — no `.slice(0, 80) + '…'`,
 * which is the obvious implementation and the wrong one twice over:
 *
 *  - It would ship a truncated synopsis to crawlers in the collapsed state, which
 *    is the one factual paragraph on the page and the thing a model quotes.
 *  - Cutting a UTF-16 string at a fixed index splits grapheme clusters. Thai has
 *    combining vowels above and below the consonant they attach to (and this site
 *    ships a Thai locale), so a slice can land mid-cluster and render a floating
 *    diacritic on a dotted circle.
 *
 * Clamping also means the collapsed height is honest at every width and font size:
 * one line is one line on a 390px phone and on a 2111px desktop, with no character
 * budget to re-tune per breakpoint.
 */
export function TitleSynopsis({
  text,
  moreLabel,
  lessLabel,
}: {
  text: string
  moreLabel: string
  lessLabel: string
}) {
  const [open, setOpen] = useState(false)
  /* `useId` and not a hardcoded string: `aria-controls` has to point at an id that
     is unique in the document, and there is nothing stopping a future layout from
     rendering two of these on one page. */
  const id = useId()

  return (
    <div className="zx-title-synopsis-wrap">
      <p
        id={id}
        className="zx-title-synopsis"
        /* The clamp is driven by a data attribute rather than by toggling a class,
           so the CSS reads as one rule with one state selector instead of two
           rules that have to be kept in sync. */
        data-open={open ? 'true' : undefined}
      >
        {text}
      </p>

      {/* A real <button>, not a <span> with an onClick: this is a control, so it
          has to be reachable by keyboard and announced as a button. `type="button"`
          because a bare <button> inside any future <form> defaults to submit.

          `aria-expanded` + `aria-controls` are what make the collapsed state
          audible. Without them a screen reader user hears "More, button" with no
          indication of what it opens or that anything is currently hidden — and
          because the full text is always in the DOM, they would otherwise have
          already heard the whole paragraph and find the button meaningless. */}
      <button
        type="button"
        className="zx-title-synopsis-toggle"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? lessLabel : moreLabel}
      </button>
    </div>
  )
}
