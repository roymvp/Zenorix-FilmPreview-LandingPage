'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  useConversion,
  type PreviewReason,
} from '@/components/landing/conversion-provider'
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
  /**
   * Landscape opening frame (`Movie.previewFrame`), shown before playback
   * resolves and behind the fade while it buffers. Set on BOTH the `<video
   * poster>` and the `.zx-stage-poster` <img>: the img is what actually renders
   * (and cross-fades out via `[data-playing]`), while the poster attribute
   * covers the moment before React paints and any state where the video shows
   * its own frame. Both must point at the same asset or the fade flickers.
   */
  poster: string
  posterAlt: string
  runtimeSeconds: number
  limitSeconds: number
  copy: PlayerCopy
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { openPreview, previewReason } = useConversion()

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

  /**
   * Pauses immediately.
   *
   * This used to await the in-flight `play()` promise first, on the theory that
   * pausing mid-play throws `AbortError`. It does — but that rejection is
   * already handled inside `safePlay`, so awaiting bought nothing and cost a
   * hang: an unresolved media element leaves `play()` pending indefinitely, and
   * a user tapping pause would be ignored forever. Pausing is a direct response
   * to a tap and must never wait on the network.
   */
  const safePause = useCallback(() => {
    const video = videoRef.current
    if (!video) return
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

  /**
   * The 10-minute wall. Pauses, snaps back to the cap and hands off to the
   * upsell dialog.
   *
   * Deliberately SYNCHRONOUS. This used to `await safePause()` first, which
   * deadlocked the entire gate: `safePause` awaits the pending `play()` promise,
   * and `play()` never settles while the media is still unresolved
   * (`readyState 0` — offline, a blocked CDN, a slow stream). The await then
   * never returned, so `openPreview()` was never reached AND `gatingRef` stayed
   * latched `true`, permanently disabling both triggers. The dialog is the whole
   * point of the feature, so nothing here may sit behind an await on the
   * network. `video.pause()` is safe to call directly because `safePlay`
   * already attached a rejection handler to that promise, so the resulting
   * AbortError is caught there rather than surfacing as an unhandled rejection.
   *
   * `reason` distinguishes the two entry points the spec calls for: running out
   * the preview vs. trying to scrub past it.
   */
  const enforceGate = useCallback(
    (reason: PreviewReason) => {
      const video = videoRef.current
      if (!video) return
      // The dialog is already up: `timeupdate` fires several times before the
      // pause lands, and this keeps those from re-reporting `modal_view`.
      // Reading live dialog state rather than a ref means dismissing the dialog
      // re-arms the gate, so hitting the wall again still converts.
      if (previewReason !== null) return

      video.pause()
      // Clamp only when past the wall; `onEnded` on a source shorter than the
      // cap must not seek forward into a black frame.
      if (video.currentTime > cap) video.currentTime = cap
      setPlaying(false)
      setCurrent(Math.min(video.currentTime, cap))
      if (!gateHit) {
        setGateHit(true)
        trackEvent('preview_limit_reached', { seconds: cap })
      }
      openPreview(reason)
    },
    [cap, gateHit, openPreview, previewReason],
  )

  function handleTimeUpdate() {
    const video = videoRef.current
    if (!video) return
    if (video.currentTime >= cap) {
      // Trigger 1: the preview simply ran out.
      enforceGate('limit')
      return
    }
    setCurrent(video.currentTime)
  }

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.currentTime >= cap) {
      // Already parked at the wall: re-surface the upsell instead of resuming.
      enforceGate('limit')
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
      safePause()
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
      // Trigger 2: dragged to or past the wall. Reported as 'scrub', not
      // 'limit' — this path used to mislabel itself, so the dialog and the
      // download attribution both blamed the wrong trigger.
      enforceGate('scrub')
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
        // Backstop for a source shorter than the cap (the template's sample MP4
        // ends at ~9:56, just under the 10:00 wall), so the gate still fires.
        onEnded={() => enforceGate('limit')}
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
