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
 * Every CTA on the page — hero pill, info block, chart card, sticky bar, both
 * dialogs — routes through `download()`, so the APK URL and the conversion
 * event exist in exactly one place. Dialog state lives here too, which is what
 * lets the player trigger the upsell without knowing the dialog exists.
 */
type PreviewReason = 'limit' | 'scrub'

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
   * Set once the visitor has hit the preview wall. The sticky bar swaps to
   * higher-urgency copy, because at that point intent is proven.
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

  const closeContent = useCallback(() => {
    trackEvent('modal_dismiss', { modal: 'content_lock' })
    setContentTitle(null)
  }, [])

  const openPreview = useCallback((reason: PreviewReason) => {
    trackEvent('modal_view', { modal: 'preview_gate', reason })
    setPreviewReason(reason)
    setUrgent(true)
  }, [])

  const closePreview = useCallback(() => {
    trackEvent('modal_dismiss', { modal: 'preview_gate' })
    setPreviewReason(null)
  }, [])

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
