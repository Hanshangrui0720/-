import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './LogoLoop.css'

const config = { smoothTau: .25, minimumCopies: 2, headroom: 2 }

function LogoLoop({ logos, speed = 120, direction = 'left', logoHeight = 28, gap = 32, hoverSpeed = 0, fadeOut = false, fadeOutColor, scaleOnHover = false, ariaLabel = 'Logo loop', className }) {
  const containerRef = useRef(null); const trackRef = useRef(null); const sequenceRef = useRef(null)
  const [sequenceWidth, setSequenceWidth] = useState(0); const [copies, setCopies] = useState(2); const [hovered, setHovered] = useState(false)

  const update = useCallback(() => {
    const container = containerRef.current; const sequence = sequenceRef.current
    if (!container || !sequence) return
    const width = Math.ceil(sequence.getBoundingClientRect().width)
    if (!width) return
    setSequenceWidth(width)
    setCopies(Math.max(config.minimumCopies, Math.ceil(container.clientWidth / width) + config.headroom))
  }, [])

  useEffect(() => {
    const observer = new ResizeObserver(update); if (containerRef.current) observer.observe(containerRef.current); if (sequenceRef.current) observer.observe(sequenceRef.current); update(); return () => observer.disconnect()
  }, [update, logos, gap, logoHeight])

  useEffect(() => {
    const track = trackRef.current; if (!track || !sequenceWidth) return
    let frame; let previous; let offset = 0; let velocity = 0
    const directionSign = direction === 'right' ? -1 : 1
    const animate = time => {
      if (previous === undefined) previous = time
      const delta = Math.min(.05, (time - previous) / 1000); previous = time
      const target = (hovered ? hoverSpeed : speed) * directionSign
      velocity += (target - velocity) * (1 - Math.exp(-delta / config.smoothTau))
      offset = (offset + velocity * delta) % sequenceWidth
      if (offset < 0) offset += sequenceWidth
      track.style.transform = `translate3d(${-offset}px, 0, 0)`
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [direction, hoverSpeed, hovered, sequenceWidth, speed])

  const rootClass = ['logoloop', fadeOut && 'logoloop--fade', scaleOnHover && 'logoloop--scale-hover', className].filter(Boolean).join(' ')
  const style = { '--logoloop-gap': `${gap}px`, '--logoloop-logoHeight': `${logoHeight}px`, ...(fadeOutColor && { '--logoloop-fadeColor': fadeOutColor }) }
  return <div ref={containerRef} className={rootClass} style={style} role="region" aria-label={ariaLabel}><div ref={trackRef} className="logoloop__track" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>{Array.from({ length: copies }, (_, copy) => <ul className="logoloop__list" key={copy} aria-hidden={copy > 0} ref={copy === 0 ? sequenceRef : undefined}>{logos.map((logo, index) => <li className="logoloop__item" key={`${copy}-${index}`}><span className="logoloop__node">{logo.node}</span></li>)}</ul>)}</div></div>
}

export default memo(LogoLoop)
