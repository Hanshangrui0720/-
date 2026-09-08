import { useCallback, useEffect, useRef, useState } from 'react'
import { heroPoster, heroSources } from './media'

export default function HeroVideo({ onPlaying }) {
  const videoRef = useRef(null)
  const [sources] = useState(heroSources)
  const [sourceIndex, setSourceIndex] = useState(0)
  const [needsPlay, setNeedsPlay] = useState(false)
  const [playing, setPlaying] = useState(false)
  const alive = useRef(true)

  const play = useCallback(() => {
    const video = videoRef.current
    if (!video || !alive.current) return
    // Set both the property and HTML attribute before calling play on iOS/WebKit.
    video.muted = true
    video.defaultMuted = true
    video.setAttribute('muted', '')
    video.play()?.then(() => {
      if (alive.current) setNeedsPlay(false)
    }).catch(error => {
      if (alive.current && error.name === 'NotAllowedError') setNeedsPlay(true)
    })
  }, [])

  const nextSource = useCallback(() => {
    if (sourceIndex + 1 < sources.length) {
      setPlaying(false)
      setSourceIndex(sourceIndex + 1)
    } else setNeedsPlay(true)
  }, [sourceIndex, sources.length])

  useEffect(() => {
    alive.current = true
    play()
    // Keep gesture retries until playback succeeds; an early touch may happen
    // before the video has buffered. No undocumented WeChat bridge calls.
    document.addEventListener('touchend', play, { passive: true })
    document.addEventListener('pointerup', play, { passive: true })
    document.addEventListener('WeixinJSBridgeReady', play)
    const resume = () => { if (!document.hidden) play() }
    document.addEventListener('visibilitychange', resume)
    const watchdog = window.setTimeout(() => {
      const video = videoRef.current
      if (video && video.readyState < 2 && video.buffered.length === 0) nextSource()
    }, 8000)
    return () => {
      alive.current = false
      window.clearTimeout(watchdog)
      document.removeEventListener('touchend', play)
      document.removeEventListener('pointerup', play)
      document.removeEventListener('WeixinJSBridgeReady', play)
      document.removeEventListener('visibilitychange', resume)
    }
  }, [play, sourceIndex, nextSource])

  return <>
    <video
      ref={videoRef}
      className={`hero-media hero-video${playing ? ' is-playing' : ''}`}
      src={sources[sourceIndex]}
      poster={heroPoster()}
      autoPlay muted loop playsInline preload="auto"
      webkit-playsinline="true" x5-playsinline="true"
      disablePictureInPicture
      onCanPlay={play}
      onError={nextSource}
      onPlaying={() => { setPlaying(true); setNeedsPlay(false); onPlaying?.() }}
      aria-label="首页背景视频"
    />
    {needsPlay && !playing && <button type="button" className="hero-play-button" onClick={play}>▶ 播放背景视频</button>}
  </>
}
