'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { trackEvent } from '@/lib/analytics'
import { SITE } from '@/lib/config/site'

/**
 * Single source of truth for the download funnel.
 *
 * Every CTA on the page — hero, top bar, chart card, the rail's "see more" tail,
 * the locked-content dialog — routes through `download()`, so the APK URL and
 * the conversion event exist in exactly one place. Dialog state lives here too,
 * which is what lets the Top 10 rail trigger the upsell without knowing the
 * dialog exists.
 *
 * The preview gate that used to live here (`previewReason` / `openPreview` /
 * `urgent`) is gone along with the hero player: with no timed preview there is
 * no wall to hit, so a "preview exhausted" state could never be entered.
 */
/**
 * The card a visitor just hit, as the dialog needs it.
 *
 * The POSTER is here and not looked up from the charts by title, because the
 * dialog would then need the chart data and a title-to-entry index — and titles
 * are not guaranteed unique across the two rails. The card already has both
 * fields in hand at click time, so it passes them.
 */
export type LockedContent = {
  title: string
  /** Path to the card's own 2:3 tile, shown as the dialog's art panel. */
  poster: string
}

type ConversionState = {
  /** Fires the APK download and reports the source that earned the click. */
  download: (source: string) => void
  /** Locked-content upsell, triggered from the Top 10 rail. */
  content: LockedContent | null
  openContent: (content: LockedContent) => void
  closeContent: () => void
}

const ConversionContext = createContext<ConversionState | null>(null)

export function ConversionProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<LockedContent | null>(null)

  const download = useCallback((source: string) => {
    trackEvent('apk_download_click', { source, version: SITE.apkVersion })
    // RESERVED: swap for a signed, per-market CDN URL or an attribution link.
    window.location.href = SITE.apkUrl
  }, [])

  const openContent = useCallback((next: LockedContent) => {
    trackEvent('modal_view', { modal: 'content_lock', title: next.title })
    setContent(next)
  }, [])

  // Guarded so it is idempotent. Dismissal arrives from two places — the Close
  // button and the dialog's own `closed` event (scrim tap, Escape) — and the
  // button path triggers the event path too, which would double-report.
  const closeContent = useCallback(() => {
    if (content === null) return
    trackEvent('modal_dismiss', { modal: 'content_lock' })
    setContent(null)
  }, [content])

  const value = useMemo<ConversionState>(
    () => ({ download, content, openContent, closeContent }),
    [download, content, openContent, closeContent],
  )

  return (
    <ConversionContext.Provider value={value}>
      {children}
    </ConversionContext.Provider>
  )
}

export function useConversion(): ConversionState {
  const context = useContext(ConversionContext)
  if (!context) {
    throw new Error('useConversion must be used inside <ConversionProvider>')
  }
  return context
}
