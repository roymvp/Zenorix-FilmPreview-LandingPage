'use client'

import { useState } from 'react'

/**
 * Collapsible synopsis: 2 lines by default, expanding in place to the full text.
 *
 * Kept as its own client component so `FilmInfo` (and the rest of the info
 * block) can stay a server component — only this toggle needs state.
 *
 * The full text is always in the DOM and only visually clamped, so crawlers and
 * screen readers get the complete synopsis regardless of the collapsed state.
 */
export function FilmSynopsis({
  text,
  expandLabel,
  collapseLabel,
}: {
  text: string
  expandLabel: string
  collapseLabel: string
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="zx-synopsis-wrap">
      <p
        id="zx-synopsis"
        className="zx-synopsis md-typescale-body-medium"
        data-expanded={expanded ? 'true' : 'false'}
      >
        {text}
      </p>
      <button
        type="button"
        className="zx-synopsis-toggle"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-controls="zx-synopsis"
      >
        {expanded ? collapseLabel : expandLabel}
        <md-icon aria-hidden="true">{expanded ? 'expand_less' : 'expand_more'}</md-icon>
      </button>
    </div>
  )
}
