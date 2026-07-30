'use client'

import { useEffect, useRef, useState } from 'react'
import { TRAILERS } from '@/lib/config/site'

/** Crossfade duration. Must match `--zx-trailer-fade` in landing.css. */
const FADE_MS = 3000

/**
 * Fallback dwell time. A clip normally advances on its own `ended` event, but a
 * slot whose video file is missing (or blocked from autoplaying) never fires
 * one, so this timer guarantees the reel keeps moving regardless.
 */
const MAX_DWELL_MS = 10000

/**
 * The hero's background layer: a reel of muted trailers that crossfade into one
 * another and loop forever.
 *
 * NOT a player. There are no controls, no progress bar, no play/pause, and no
 * seek or timeupdate listeners — the only event read is `ended`, purely to know
 * when to advance. The whole layer is `pointer-events: none` in CSS and sits at
 * the bottom of the stacking order, so a click reaches the page rather than the
 * video and there is nothing for a visitor to operate.
 *
 * LCP cost is one video, not N: only the first entry gets `preload="auto"` and a
 * poster attribute. Every other slot renders as a bare <video> with no `src`
 * until the reel is about to need it, so the browser cannot open extra
 * connections on load.
 */
export function TrailerBackdrop() {
  const [active, setActive] = useState(0)
  /* Which slots are allowed to have a `src` yet. The first is armed
     immediately; each next one is armed only once it becomes reachable. */
  const [armed, setArmed] = useState(() => new Set([0]))
  const videosRef = useRef<(HTMLVideoElement | null)[]>([])

  /* Arm the slot after the active one so it can buffer during the current clip
     and the crossfade has something to fade into. */
  useEffect(() => {
    const next = (active + 1) % TRAILERS.length
    setArmed((prev) => (prev.has(next) ? prev : new Set(prev).add(next)))
  }, [active])

  /* Drive the active clip: rewind, play muted, and hand over on `ended` or when
     the dwell cap expires — whichever comes first. */
  useEffect(() => {
    const advance = () => setActive((i) => (i + 1) % TRAILERS.length)
    const timer = window.setTimeout(advance, MAX_DWELL_MS)

    const video = videosRef.current[active]
    if (video) {
      video.currentTime = 0
      /* Autoplay is only permitted while muted, and a rejected promise here is
         an expected outcome (a data-saver profile, a missing file) — the dwell
         timer already covers it, so it needs no handling beyond not throwing. */
      void video.play().catch(() => {})
    }

    return () => window.clearTimeout(timer)
  }, [active])

  return (
    <div className="zx-reel" aria-hidden="true" role="presentation">
      {TRAILERS.map((trailer, index) => (
        /* The poster is painted as the SLOT's background rather than the video's
           `poster` attribute, because Chrome letterboxes a poster inside the
           video box and ignores `object-fit: cover` on it — which left black
           bands above and below the frame on any viewport that did not match the
           poster's aspect ratio. As a background it is covered by
           `background-size: cover` in CSS, so it fills the hero at every size and
           matches how the video itself is fitted. */
        <div
          key={trailer.src}
          className="zx-reel-slot"
          data-active={index === active}
          style={{ backgroundImage: `url(${trailer.poster})` }}
        >
          <video
            ref={(node) => {
              videosRef.current[index] = node
            }}
            className="zx-reel-clip"
            src={armed.has(index) ? trailer.src : undefined}
            muted
            playsInline
            /* Single-clip loops are handled by advancing the reel, so `loop` is
               deliberately absent: it would suppress the `ended` event. */
            preload={index === 0 ? 'auto' : 'none'}
            tabIndex={-1}
            onEnded={() => setActive((i) => (i + 1) % TRAILERS.length)}
          />
        </div>
      ))}

      {/* Sole purpose: hold the brand copy legible over moving footage. */}
      <div className="zx-reel-scrim" />
    </div>
  )
}
