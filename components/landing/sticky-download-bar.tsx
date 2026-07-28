'use client'

import { useEffect, useState } from 'react'
import { useConversion } from '@/components/landing/conversion-provider'
import { SITE } from '@/lib/config/site'

/**
 * Persistent download bar.
 *
 * Appears only after the visitor scrolls past the hero — while the film is on
 * screen nothing is allowed to cover it. Copy escalates once the preview wall
 * has been hit, because at that point intent is proven rather than assumed.
 */
export function StickyDownloadBar({
  defaultLabel,
  urgentLabel,
  title,
  meta,
}: {
  defaultLabel: string
  urgentLabel: string
  /** Film title shown on wide viewports where there is room for context. */
  title: string
  meta: string
}) {
  const { download, urgent } = useConversion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.62)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Reserve page-bottom space only while the bar is on screen.
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--zx-sticky-space',
      visible ? '80px' : '0px',
    )
  }, [visible])

  return (
    <div
      className="zx-sticky"
      data-visible={visible ? 'true' : 'false'}
      aria-hidden={!visible}
    >
      <div className="zx-sticky-inner">
        <div className="zx-sticky-meta">
          <strong>{title}</strong>
          <span>{meta}</span>
        </div>
        <md-filled-button
          className="zx-cta-button"
          onClick={() => download(urgent ? 'sticky_urgent' : 'sticky')}
          tabIndex={visible ? 0 : -1}
        >
          {urgent ? urgentLabel : defaultLabel}
        </md-filled-button>
        <span className="zx-visually-hidden">
          {SITE.apkSize} · Android {SITE.minAndroid}+
        </span>
      </div>
    </div>
  )
}
