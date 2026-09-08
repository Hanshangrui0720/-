import { lazy, Suspense, useEffect, useRef, useState } from 'react'

const Lanyard = lazy(() => import('./Lanyard'))

export default function DeferredLanyard({ videoPlaying }) {
  const [enabled, setEnabled] = useState(false)
  const ready = useRef(videoPlaying)
  ready.current = videoPlaying

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 921px) and (hover: hover)')
    const update = () => setEnabled(desktop.matches && ready.current)
    const delay = window.setTimeout(update, 1400)
    desktop.addEventListener('change', update)
    return () => { window.clearTimeout(delay); desktop.removeEventListener('change', update) }
  }, [videoPlaying])

  return enabled ? <Suspense fallback={null}><Lanyard /></Suspense> : null
}
