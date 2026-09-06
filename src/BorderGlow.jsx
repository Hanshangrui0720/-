import { useCallback, useEffect, useRef } from 'react'
import './BorderGlow.css'

const BorderGlow = ({ children, className = '', edgeSensitivity = 18, glowColor = '4 82 58', backgroundColor = 'transparent', borderRadius = 10, glowRadius = 24, glowIntensity = 1, coneSpread = 24, animated = false, colors = ['#f3392c', '#ff7867', '#f5f1ea'] }) => {
  const ref = useRef(null)
  const update = useCallback(event => {
    const card = ref.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const dx = x - rect.width / 2
    const dy = y - rect.height / 2
    const proximity = Math.max(0, Math.min(1, Math.max(Math.abs(dx) / (rect.width / 2), Math.abs(dy) / (rect.height / 2))))
    const threshold = edgeSensitivity / 100
    const edge = proximity <= threshold ? 0 : (proximity - threshold) / (1 - threshold)
    const angle = Math.atan2(dy, dx) * 180 / Math.PI + 90
    card.style.setProperty('--edge-proximity', edge.toFixed(3))
    card.style.setProperty('--cursor-angle', `${angle}deg`)
    card.style.setProperty('--pointer-x', `${x}px`)
    card.style.setProperty('--pointer-y', `${y}px`)
  }, [])
  useEffect(() => {
    if (!animated || !ref.current) return undefined
    const card = ref.current
    card.classList.add('sweep-active')
    const timer = setTimeout(() => card.classList.remove('sweep-active'), 1500)
    return () => clearTimeout(timer)
  }, [animated])
  return <div ref={ref} onPointerMove={update} className={`border-glow-card ${className}`} style={{ '--card-bg': backgroundColor, '--edge-sensitivity': edgeSensitivity / 100, '--border-radius': `${borderRadius}px`, '--glow-padding': `${glowRadius}px`, '--glow-intensity': glowIntensity, '--cone-spread': `${coneSpread}%`, '--color-one': colors[0], '--color-two': colors[1] || colors[0], '--color-three': colors[2] || colors[0] }}><span className="edge-light" /><div className="border-glow-inner">{children}</div></div>
}

export default BorderGlow
