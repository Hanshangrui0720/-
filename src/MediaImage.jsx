import { useEffect, useRef, useState } from 'react'

// Native lazy loading plus an independent origin for failed/stalled images.
// The timeout only starts near the viewport, never for offscreen lazy images.
export default function MediaImage({ src, fallbackSrc, alt = '', loading = 'lazy', onLoad, ...props }) {
  const ref = useRef(null)
  const [fallback, setFallback] = useState(false)
  useEffect(() => {
    const image = ref.current
    if (!fallbackSrc || fallback || !image) return
    // On Netlify, keep a progressing compressed image instead of restarting a
    // much larger original on the same CDN. Timeout failover is for Pages only.
    if (!new URL(src, window.location.href).hostname.endsWith('github.io')) return
    let timer
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      observer.disconnect()
      timer = window.setTimeout(() => {
        if (!image.complete || !image.naturalWidth) setFallback(true)
      }, 5000)
    }, { rootMargin: '1200px' })
    observer.observe(image)
    return () => { observer.disconnect(); window.clearTimeout(timer) }
  }, [src, fallbackSrc, fallback])
  return <img {...props} ref={ref} src={fallback ? fallbackSrc : src} alt={alt}
    loading={loading} decoding="async" onLoad={onLoad}
    onError={() => { if (fallbackSrc && !fallback) setFallback(true) }} />
}
