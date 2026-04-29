import { useEffect, useRef } from 'react'

interface Props {
  src?: string
  src2?: string
  poster?: string
  loopDelay?: number  // ms to wait before replaying (omit = loop immediately)
}

export default function SwitchVideoBg({ src, src2, poster, loopDelay }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const lastScrollY = useRef(0)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const replayTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = 0.7

    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastScrollY.current)
      lastScrollY.current = window.scrollY
      video.playbackRate = Math.min(2.5, 0.4 + delta * 0.06)
      if (idleTimer.current) clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => {
        video.playbackRate = 0.7
      }, 200)
    }

    const onEnded = () => {
      if (loopDelay == null) return
      replayTimer.current = setTimeout(() => {
        video.currentTime = 0
        video.play()
      }, loopDelay)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    if (loopDelay != null) video.addEventListener('ended', onEnded)

    return () => {
      window.removeEventListener('scroll', onScroll)
      video.removeEventListener('ended', onEnded)
      if (idleTimer.current) clearTimeout(idleTimer.current)
      if (replayTimer.current) clearTimeout(replayTimer.current)
    }
  }, [loopDelay])

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isMobile =
    typeof window !== 'undefined' && window.innerWidth < 768

  if (prefersReduced || isMobile) {
    return (
      <div className="video-bg-wrapper">
        <div className="video-bg-overlay" />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 60% 40%, rgba(230,4,18,0.12) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(76,195,227,0.08) 0%, transparent 50%)',
          }}
        />
        <div className="tech-grid" style={{ position: 'absolute' }} />
      </div>
    )
  }

  return (
    <div className="video-bg-wrapper">
      <div style={{ position: 'absolute', inset: 0 }}>
        {src ? (
          <video
            ref={videoRef}
            autoPlay
            loop={loopDelay == null}
            muted
            playsInline
            preload="auto"
            poster={poster}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
              opacity: 0.40,
              filter: 'blur(6px) saturate(1.2)',
            }}
          >
            <source src={src} type="video/mp4" />
            {src2 && <source src={src2} type="video/webm" />}
          </video>
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse at 55% 35%, rgba(230,4,18,0.14) 0%, transparent 55%), radial-gradient(ellipse at 35% 65%, rgba(76,195,227,0.10) 0%, transparent 50%)',
            }}
          />
        )}
      </div>

      <div className="video-bg-overlay" />
      <div className="tech-grid" style={{ position: 'absolute' }} />
    </div>
  )
}
