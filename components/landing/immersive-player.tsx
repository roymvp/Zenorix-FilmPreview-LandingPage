'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { useConversion } from '@/components/landing/conversion-provider'
import { trackEvent } from '@/lib/analytics'

/** m:ss, or h:mm:ss once the film runs past an hour. */
function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds))
  const h = Math.floor(safe / 3600)
  const m = Math.floor((safe % 3600) / 60)
  const s = String(safe % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}

export type PlayerCopy = {
  play: string
  pause: string
  mute: string
  unmute: string
  seek: string
}

/**
 * Cinematic hero player.
 *
 * Conversion mechanics, deliberate and all in one place:
 *  - autoplays muted (the only way autoplay is allowed) so the page opens on
 *    moving film rather than a static banner;
 *  - the scrub bar spans the FULL runtime while only `limitSeconds` is
 *    playable, so the locked remainder is visible, not merely stated;
 *  - hitting the limit pauses and hands off to the upsell dialog.
 *
 * The frame itself carries no badges, watermark or CTA: the film is the hook,
 * and the download ask lives in the content flow directly below it.
 *
 * The control set is deliberately exactly three things, with no duplicates:
 *  1. play/pause  — tap anywhere on the frame (`.zx-stage-tap`);
 *  2. mute/unmute — the single top-right icon button;
 *  3. seek        — the scrub bar.
 * No fullscreen, no time readout, no second play button, no tap-for-sound
 * nudge. If you add a control here, make sure it isn't already reachable by
 * tapping the frame.
 *
 * RESERVED: `src` is a plain MP4 for the template. For production HLS/DASH,
 * attach hls.js (or Shaka) to the same `videoRef` inside the mount effect —
 * no other component needs to change.
 */
export function ImmersivePlayer({
  src,
  type,
  poster,
  posterAlt,
  runtimeSeconds,
  limitSeconds,
  copy,
}: {
  src: string
  type: string
  poster: string
  posterAlt: string
  runtimeSeconds: number
  limitSeconds: number
  copy: PlayerCopy
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { openPreview } = useConversion()

  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [gateHit, setGateHit] = useState(false)
  /** Controls fade out during playback; see `controlsVisible` below. */
  const [showControls, setShowControls] = useState(false)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cap = Math.min(limitSeconds, runtimeSeconds)

  /**
   * In-flight `play()` promise.
   *
   * `HTMLMediaElement.play()` is async: calling `pause()` while it is still
   * pending rejects it with `AbortError: The play() request was interrupted`.
   * That is easy to trigger here — autoplay races the preview gate, and a quick
   * double tap races itself — so every play/pause goes through safePlay/
   * safePause below, which serialize the pair and swallow the expected reject.
   */
  const playPromiseRef = useRef<Promise<void> | null>(null)
  /** Guards against re-entrant gating while an awaited pause settles. */
  const gatingRef = useRef(false)

  /** Resolves true if playback actually started. Never rejects. */
  const safePlay = useCallback(async () => {
    const video = videoRef.current
    if (!video) return false
    const attempt = video.play()
    // Legacy browsers return undefined rather than a promise.
    if (!attempt || typeof attempt.then !== 'function') return true
    const settled = attempt.then(
      () => true,
      () => false,
    )
    playPromiseRef.current = settled.then(() => undefined)
    return settled
  }, [])

  /**
   * Shows the controls and re-arms the 2s auto-hide. Called on every tap, so
   * an interaction during playback always brings the controls back first.
   */
  const revealControls = useCallback(() => {
    setShowControls(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setShowControls(false), 2000)
  }, [])

  // Drop the pending timer on unmount so it cannot set state on a dead component.
  useEffect(
    () => () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    },
    [],
  )

  /** Waits for any pending play() so pause() cannot interrupt it. */
  const safePause = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    const pending = playPromiseRef.current
    if (pending) await pending
    playPromiseRef.current = null
    video.pause()
  }, [])

  // Autoplay muted on mount. Failure is expected on some browsers and simply
  // leaves the poster + big play affordance in place.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    let cancelled = false
    void safePlay().then((ok) => {
      if (cancelled) return
      setPlaying(ok)
      if (ok) {
        setStarted(true)
        // Autoplay counts as "playback began", so start the hide countdown too.
        revealControls()
      }
    })
    return () => {
      cancelled = true
    }
  }, [safePlay, revealControls])

  const enforceGate = useCallback(async () => {
    const video = videoRef.current
    if (!video || gatingRef.current) return
    gatingRef.current = true
    // `timeupdate` keeps firing until the pause lands, so the ref above stops
    // this from re-entering and opening the upsell dialog several times.
    await safePause()
    video.currentTime = cap
    setPlaying(false)
    setCurrent(cap)
    if (!gateHit) {
      setGateHit(true)
      trackEvent('preview_limit_reached', { seconds: cap })
    }
    openPreview('limit')
    gatingRef.current = false
  }, [cap, gateHit, openPreview, safePause])

  function handleTimeUpdate() {
    const video = videoRef.current
    if (!video) return
    if (video.currentTime >= cap) {
      void enforceGate()
      return
    }
    setCurrent(video.currentTime)
  }

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.currentTime >= cap) {
      void enforceGate()
      return
    }
    // If the controls are currently hidden mid-playback, the first tap only
    // brings them back — it does not also pause. That matches how native
    // players behave and avoids an accidental pause when reaching for a control.
    if (playing && !showControls) {
      revealControls()
      return
    }
    if (video.paused) {
      setPlaying(true)
      setStarted(true)
      trackEvent('preview_play', {})
      revealControls()
      // Roll the optimistic state back if the browser refuses to play.
      void safePlay().then((ok) => {
        if (!ok) setPlaying(false)
      })
    } else {
      setPlaying(false)
      // Paused: controls stay up, so cancel the pending hide.
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      setShowControls(true)
      void safePause()
    }
  }

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    const next = !video.muted
    video.muted = next
    setMuted(next)
    revealControls()
    if (!next) {
      trackEvent('preview_unmute', {})
      if (video.paused && video.currentTime < cap) {
        setStarted(true)
        setPlaying(true)
        void safePlay().then((ok) => {
          if (!ok) setPlaying(false)
        })
      }
    }
  }

  /** Seeking is allowed inside the preview window and blocked past it. */
  function handleSeek(event: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current
    const target = event.currentTarget
    if (!video) return
    const requested = Number(target.value)
    if (requested >= cap) {
      trackEvent('preview_scrub_locked', { requested: Math.round(requested) })
      target.value = String(Math.floor(cap))
      void enforceGate()
      return
    }
    video.currentTime = requested
    setCurrent(requested)
  }

  const lockedFraction = 1 - cap / runtimeSeconds
  const playedPercent = ((Math.min(current, runtimeSeconds) / runtimeSeconds) * 100).toFixed(2)

  /**
   * Controls are visible while paused and fade out 2s into playback, which is
   * the standard player convention and keeps the frame clean once the film has
   * the viewer's attention. Any tap brings them back (see togglePlay).
   */
  const controlsVisible = !playing || showControls

  return (
    <div className="zx-stage" data-playing={started ? 'true' : 'false'}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="zx-stage-poster" src={poster} alt={posterAlt} />

      <video
        ref={videoRef}
        className="zx-stage-media"
        poster={poster}
        muted
        playsInline
        loop={false}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => void enforceGate()}
        aria-label={posterAlt}
        tabIndex={-1}
      >
        <source src={src} type={type} />
      </video>

      <div className="zx-stage-scrim" aria-hidden="true" />

      {/* Full-stage tap target: the expected mobile gesture for play/pause. */}
      <button
        type="button"
        className="zx-stage-tap"
        onClick={togglePlay}
        aria-label={playing ? copy.pause : copy.play}
      />

      {/* Sound toggle, top-right. It is the ONE control that cannot live on the
          tap layer, since tapping the frame is already play/pause. A bare
          button rather than <md-icon-button> — no pill, no blur, just the
          glyph with a shadow for legibility over a bright frame. */}
      <button
        type="button"
        className="zx-mute"
        data-visible={controlsVisible ? 'true' : 'false'}
        onClick={toggleMute}
        aria-label={muted ? copy.unmute : copy.mute}
      >
        <md-icon aria-hidden="true">{muted ? 'volume_off' : 'volume_up'}</md-icon>
      </button>

      {/* Center play/pause affordance. Still not a button — the frame tap owns
          the action, so a real button here would duplicate one control — but it
          now mirrors state, showing pause while playing. It hides with the rest
          of the controls 2s into playback. */}
      {!gateHit ? (
        <div
          className="zx-bigplay"
          data-visible={controlsVisible ? 'true' : 'false'}
          aria-hidden="true"
        >
          {/* A plain circle rather than <md-fab>: the FAB painted its own
              rounded-square container underneath the circular ring we added on
              top, so the glyph read as two overlapping shapes. */}
          <span className="zx-bigplay-disc">
            <md-icon>{playing ? 'pause' : 'play_arrow'}</md-icon>
          </span>
        </div>
      ) : null}

      <div className="zx-player-bar" data-visible={controlsVisible ? 'true' : 'false'}>
        {/* Elapsed / total sits above the bar so it never crowds the track. */}
        <p className="zx-player-time">
          <span>{formatTime(current)}</span>
          <span className="zx-player-time-total">{formatTime(runtimeSeconds)}</span>
        </p>

        {/* A native range input rather than <md-slider>: the MD slider brings a
            large handle, ripple and value bubble, which is far heavier chrome
            than a preview scrubber needs. Styled thin in landing.css. */}
        <div className="zx-scrub">
          <input
            className="zx-scrub-input"
            type="range"
            min={0}
            max={runtimeSeconds}
            step={1}
            value={Math.floor(current)}
            aria-label={copy.seek}
            onChange={handleSeek}
            style={{ '--zx-progress': `${playedPercent}%` } as CSSProperties}
          />
          <span
            className="zx-scrub-lock"
            style={{ width: `${(lockedFraction * 100).toFixed(2)}%` }}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  )
}
