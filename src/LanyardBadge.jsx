import { useEffect, useRef, useState } from 'react'
import './LanyardBadge.css'

export default function LanyardBadge() {
  const [motionState, setMotionState] = useState({ x: 0, y: 0, angle: -5 })
  const motion = useRef({ x: 0, y: 0, vx: 0, vy: 0, angle: -5 })
  const dragging = useRef(false)
  const pointerStart = useRef({ x: 0, y: 0 })
  const dragStart = useRef({ x: 0, y: 0 })
  const frame = useRef(0)

  useEffect(() => {
    const tick = () => {
      if (!dragging.current) {
        const body = motion.current
        // A light pendulum simulation: gravity pulls down while the tether springs back to its anchor.
        body.vx += -body.x * 0.016
        body.vy += 0.22 - body.y * 0.018
        body.vx *= 0.94
        body.vy *= 0.94
        body.x += body.vx
        body.y += body.vy
        if (body.x > 112 || body.x < -112) { body.x = Math.max(-112, Math.min(112, body.x)); body.vx *= -0.48 }
        if (body.y > 118 || body.y < -76) { body.y = Math.max(-76, Math.min(118, body.y)); body.vy *= -0.42 }
        body.angle += ((body.x * 0.18 + body.vx * 0.82) - body.angle) * 0.13
        setMotionState({ x: body.x, y: body.y, angle: body.angle })
      }
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [])

  const move = event => {
    if (!dragging.current) return
    const body = motion.current
    const nextX = Math.max(-112, Math.min(112, dragStart.current.x + event.clientX - pointerStart.current.x))
    const nextY = Math.max(-76, Math.min(118, dragStart.current.y + event.clientY - pointerStart.current.y))
    body.vx = (nextX - body.x) * 0.52
    body.vy = (nextY - body.y) * 0.52
    body.x = nextX
    body.y = nextY
    body.angle = nextX * 0.18 + body.vx * 0.7
    setMotionState({ x: body.x, y: body.y, angle: body.angle })
  }

  const release = event => {
    if (!dragging.current) return
    dragging.current = false
    event.currentTarget.releasePointerCapture?.(event.pointerId)
  }

  return (
    <aside className="hero-lanyard" aria-label="韩尚睿 AI designer badge">
      <div className="lanyard-pin" />
      <div className="lanyard-strap" style={{ '--rope-angle': `${Math.atan2(motionState.x, 153 + motionState.y) * 180 / Math.PI}deg`, '--rope-length': `${Math.hypot(motionState.x, 153 + motionState.y)}px` }}><span>WELCOME TO MY SPACE</span></div>
      <div className="lanyard-clasp" style={{ '--offset-x': `${motionState.x}px`, '--offset-y': `${motionState.y}px`, '--swing': `${motionState.angle * .55}deg` }} />
      <button
        className="lanyard-badge-card"
        style={{ '--offset-x': `${motionState.x}px`, '--offset-y': `${motionState.y}px`, '--swing': `${motionState.angle}deg` }}
        onPointerDown={event => {
          event.currentTarget.setPointerCapture?.(event.pointerId)
          dragging.current = true
          pointerStart.current = { x: event.clientX, y: event.clientY }
          dragStart.current = { x: motion.current.x, y: motion.current.y }
          motion.current.vx = 0
          motion.current.vy = 0
        }}
        onPointerMove={move}
        onPointerUp={release}
        onPointerCancel={release}
        aria-label="拖动 AI designer 挂牌"
      >
        <span className="lanyard-badge-index">AI / 01</span>
        <span className="lanyard-badge-name">韩尚睿</span>
        <span className="lanyard-badge-role">AI DESIGNER</span>
        <span className="lanyard-badge-meta">SHAOXING · 2026</span>
        <i>↗</i>
      </button>
    </aside>
  )
}
