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
type ConversionState = {
  /** Fires the APK download and reports the source that earned the click. */
  download: (source: string) => void
  /** Locked-content upsell, triggered from the Top 10 rail. */
  contentTitle: string | null
  openContent: (title: string) => void
  closeContent: () => void
}

const ConversionContext = createContext<ConversionState | null>(null)

export function ConversionProvider({ children }: { children: ReactNode }) {
  const [contentTitle, setContentTitle] = useState<string | null>(null)

  const download = useCallback((source: string) => {
    trackEvent('apk_download_click', { source, version: SITE.apkVersion })
    // RESERVED: swap for a signed, per-market CDN URL or an attribution link.
    window.location.href = SITE.apkUrl
  }, [])

  const openContent = useCallback((title: string) => {
    trackEvent('modal_view', { modal: 'content_lock', title })
    setContentTitle(title)
  }, [])

  // Guarded so it is idempotent. Dismissal arrives from two places — the Close
  // button and the dialog's own `closed` event (scrim tap, Escape) — and the
  // button path triggers the event path too, which would double-report.
  const closeContent = useCallback(() => {
    if (contentTitle === null) return
    trackEvent('modal_dismiss', { modal: 'content_lock' })
    setContentTitle(null)
  }, [contentTitle])

  const value = useMemo<ConversionState>(
    () => ({ download, contentTitle, openContent, closeContent }),
    [download, contentTitle, openContent, closeContent],
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
