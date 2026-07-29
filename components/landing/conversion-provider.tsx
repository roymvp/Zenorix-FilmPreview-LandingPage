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
 * Every CTA on the page — hero pill, info block, chart card, the rail's "see
 * more" tail, both dialogs — routes through `download()`, so the APK URL and
 * the conversion
 * event exist in exactly one place. Dialog state lives here too, which is what
 * lets the player trigger the upsell without knowing the dialog exists.
 */
/** Exported so the player names the two triggers from this one source. */
export type PreviewReason = 'limit' | 'scrub'

type ConversionState = {
  /** Fires the APK download and reports the source that earned the click. */
  download: (source: string) => void
  /** Locked-content upsell, triggered from the Top 10 rail. */
  contentTitle: string | null
  openContent: (title: string) => void
  closeContent: () => void
  /** Preview-exhausted upsell, triggered from the player. */
  previewReason: PreviewReason | null
  openPreview: (reason: PreviewReason) => void
  closePreview: () => void
  /**
   * Set once the visitor has hit the preview wall — intent is proven from that
   * point on. RESERVED for higher-urgency CTA copy.
   */
  urgent: boolean
}

const ConversionContext = createContext<ConversionState | null>(null)

export function ConversionProvider({ children }: { children: ReactNode }) {
  const [contentTitle, setContentTitle] = useState<string | null>(null)
  const [previewReason, setPreviewReason] = useState<PreviewReason | null>(null)
  const [urgent, setUrgent] = useState(false)

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

  const openPreview = useCallback((reason: PreviewReason) => {
    trackEvent('modal_view', { modal: 'preview_gate', reason })
    setPreviewReason(reason)
    setUrgent(true)
  }, [])

  /**
   * Must actually run for the gate to keep working: the player refuses to
   * re-open the upsell while `previewReason` is non-null, so a dismissal that
   * never reaches this function latches the gate permanently shut.
   */
  const closePreview = useCallback(() => {
    if (previewReason === null) return
    trackEvent('modal_dismiss', { modal: 'preview_gate' })
    setPreviewReason(null)
  }, [previewReason])

  const value = useMemo<ConversionState>(
    () => ({
      download,
      contentTitle,
      openContent,
      closeContent,
      previewReason,
      openPreview,
      closePreview,
      urgent,
    }),
    [
      download,
      contentTitle,
      openContent,
      closeContent,
      previewReason,
      openPreview,
      closePreview,
      urgent,
    ],
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
