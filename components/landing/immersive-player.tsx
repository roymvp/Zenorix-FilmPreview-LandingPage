'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useConversion } from '@/components/landing/conversion-provider'
import { trackEvent } from '@/lib/analytics'

export type PlayerCopy = {
  play: string
  pause: string
  mute: string
  unmute: string
  seek: string
  tapForSound: string
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

  const cap = Math.min(limitSeconds, runtimeSeconds)

  // Autoplay muted on mount. Failure is expected on some browsers and simply
  // leaves the poster + big play affordance in place.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video
      .play()
      .then(() => {
        setPlaying(true)
        setStarted(true)
      })
      .catch(() => {
        setPlaying(false)
      })
  }, [])

  const enforceGate = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.currentTime = cap
    setPlaying(false)
    setCurrent(cap)
    if (!gateHit) {
      setGateHit(true)
      trackEvent('preview_limit_reached', { seconds: cap })
    }
    openPreview('limit')
  }, [cap, gateHit, openPreview])

  function handleTimeUpdate() {
    const video = videoRef.current
    if (!video) return
    if (video.currentTime >= cap) {
      enforceGate()
      return
    }
    setCurrent(video.currentTime)
  }

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.currentTime >= cap) {
      enforceGate()
      return
    }
    if (video.paused) {
      void video.play()
      setPlaying(true)
      setStarted(true)
      trackEvent('preview_play', {})
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    const next = !video.muted
    video.muted = next
    setMuted(next)
    if (!next) {
      trackEvent('preview_unmute', {})
      if (video.paused && video.currentTime < cap) {
        void video.play()
        setPlaying(true)
        setStarted(true)
      }
    }
  }

  /** Seeking is allowed inside the preview window and blocked past it. */
  function handleSeek(event: Event) {
    const video = videoRef.current
    const target = event.target as HTMLInputElement | null
    if (!video || !target) return
    const requested = Number(target.value)
    if (requested >= cap) {
      trackEvent('preview_scrub_locked', { requested: Math.round(requested) })
      target.value = String(Math.floor(cap))
      enforceGate()
      return
    }
    video.currentTime = requested
    setCurrent(requested)
  }

  const lockedFraction = 1 - cap / runtimeSeconds
  const atCap = current >= cap - 0.25

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
        onEnded={enforceGate}
        aria-label={posterAlt}
        tabIndex={-1}
      >
        <source src={src} type={type} />
      </video>

      <div className="zx-stage-scrim" aria-hidden="true" />
      <div className="zx-stage-glow" aria-hidden="true" />

      {/* Full-stage tap target: the expected mobile gesture for play/pause. */}
      <button
        type="button"
        className="zx-stage-tap"
        onClick={togglePlay}
        aria-label={playing ? copy.pause : copy.play}
      />

      {!playing && !gateHit ? (
        <div className="zx-bigplay" aria-hidden="true">
          <md-fab size="medium">
            <md-icon slot="icon">play_arrow</md-icon>
          </md-fab>
        </div>
      ) : null}

      {muted && playing ? (
        <div className="zx-sound-nudge" aria-hidden="true">
          <span>
            <md-icon>volume_up</md-icon>
            {copy.tapForSound}
          </span>
        </div>
      ) : null}

      <div className="zx-player-bar">
        <div className="zx-controls">
          <div className="zx-scrub">
            <md-slider
              min={0}
              max={runtimeSeconds}
              step={1}
              value={Math.floor(current)}
              aria-label={copy.seek}
              oninput={handleSeek}
            />
            <span
              className="zx-scrub-lock"
              style={{ width: `calc(${(lockedFraction * 100).toFixed(2)}% - 12px)` }}
              aria-hidden="true"
            />
          </div>

          <div className="zx-controls-row">
            <md-icon-button
              onClick={togglePlay}
              aria-label={playing ? copy.pause : copy.play}
            >
              <md-icon>{playing ? 'pause' : 'play_arrow'}</md-icon>
            </md-icon-button>
            <md-icon-button
              onClick={toggleMute}
              aria-label={muted ? copy.unmute : copy.mute}
            >
              <md-icon>{muted ? 'volume_off' : 'volume_up'}</md-icon>
            </md-icon-button>
            <span className={atCap ? 'zx-time zx-time-locked' : 'zx-time'}>
              {formatTime(current)} / {formatTime(runtimeSeconds)}
            </span>
            <span className="zx-controls-spacer" />
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds))
  const h = Math.floor(safe / 3600)
  const m = Math.floor((safe % 3600) / 60)
  const s = safe % 60
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m)
  return h > 0
    ? `${h}:${mm}:${String(s).padStart(2, '0')}`
    : `${mm}:${String(s).padStart(2, '0')}`
}
