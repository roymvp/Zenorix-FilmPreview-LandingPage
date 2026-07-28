'use client'

import { useId, useRef, useState } from 'react'
import { trackEvent } from '@/lib/analytics'
import { locales, localeMeta, type Locale } from '@/lib/i18n/config'

/**
 * Language selection is NAVIGATION, not client-side string swapping: each item
 * is a real anchor to that market's own URL, so every language keeps its own
 * indexable page and its own link equity.
 */
export function LanguageSwitcher({
  current,
  label,
  menuLabel,
  /** Same film, localized path, one per market. */
  hrefs,
  variant = 'topbar',
}: {
  current: Locale
  label: string
  menuLabel: string
  hrefs: Record<Locale, string>
  variant?: 'topbar' | 'footer'
}) {
  const [open, setOpen] = useState(false)
  const anchorId = useId().replace(/:/g, '')
  const wrapRef = useRef<HTMLDivElement>(null)

  return (
    <div className="zx-lang" ref={wrapRef}>
      {/* A plain button, not an outlined MD button: in the top bar this is a
          tertiary control next to the install CTA, and button chrome made the
          two read as competing actions. Just the locale code and a caret. */}
      <button
        type="button"
        id={anchorId}
        className="zx-lang-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={menuLabel}
        onClick={() => setOpen((value) => !value)}
      >
        {variant === 'footer'
          ? `${label}: ${localeMeta[current].name}`
          : localeMeta[current].short}
        <md-icon aria-hidden="true">expand_more</md-icon>
      </button>

      <md-menu
        anchor={anchorId}
        open={open}
        positioning="popover"
        onclosed={() => setOpen(false)}
      >
        {locales.map((locale) => (
          <md-menu-item
            key={locale}
            href={hrefs[locale]}
            selected={locale === current}
            onClick={() => {
              trackEvent('language_switch', { from: current, to: locale })
            }}
          >
            <span slot="headline" lang={localeMeta[locale].htmlLang}>
              {localeMeta[locale].name}
            </span>
            {locale === current ? (
              <md-icon slot="end" aria-hidden="true">
                check
              </md-icon>
            ) : null}
          </md-menu-item>
        ))}
      </md-menu>
    </div>
  )
}
