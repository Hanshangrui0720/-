import { useRef } from 'react'
import {
  motion,
  useAnimationControls,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import './DraggableCertificateGallery.css'

const springConfig = {
  stiffness: 100,
  damping: 20,
  mass: 0.5,
}

const classNames = (...values) => values.filter(Boolean).join(' ')

function DraggableCardBody({ children, className, constraintsRef, rotate = 0 }) {
  const cardRef = useRef(null)
  const controls = useAnimationControls()
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const mouseXSpring = useSpring(mouseX, springConfig)
  const mouseYSpring = useSpring(mouseY, springConfig)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['8deg', '-8deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-8deg', '8deg'])
  const velocityX = useVelocity(mouseX)
  const velocityY = useVelocity(mouseY)
  const glareOpacity = useTransform(
    [velocityX, velocityY],
    ([latestX, latestY]) => Math.min(Math.sqrt(latestX * latestX + latestY * latestY) / 1200, 0.34),
  )
  const handleMouseMove = (event) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      drag
      dragConstraints={constraintsRef}
      dragElastic={0.28}
      dragMomentum
      dragTransition={{ power: 0.22, timeConstant: 260, bounceStiffness: 360, bounceDamping: 24 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.045 }}
      whileTap={{ scale: 0.985, zIndex: 30 }}
      animate={controls}
      onDragStart={() => controls.start({ scale: 1.06, zIndex: 40 })}
      onDragEnd={() => controls.start({ scale: 1, zIndex: 10 })}
      style={{
        rotateX,
        rotateY,
        rotate: `${rotate}deg`,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      className={classNames('drag-card', className)}
    >
      <motion.div className="drag-card-glare" style={{ opacity: glareOpacity }} />
      {children}
    </motion.div>
  )
}

export default function DraggableCertificateGallery({ items }) {
  const stageRef = useRef(null)

  return (
    <div ref={stageRef} className="drag-cert-stage" aria-label="可拖拽证书画廊">
      <div className="drag-cert-grid" />
      <div className="drag-cert-watermark">
        <span>DRAG TO EXPLORE</span>
        <strong>CERTIFICATE WALL</strong>
      </div>
      <div className="drag-cert-hint">按住证书卡片拖动 / HOVER TO INSPECT</div>
      {items.map((item, index) => (
        <DraggableCardBody
          key={item.label}
          rotate={item.rotate}
          constraintsRef={stageRef}
          className={`cert-drag-card cert-position-${index + 1}`}
        >
          <img src={item.image} alt={item.alt} draggable="false" loading="lazy" decoding="async" />
          <div className="cert-card-meta">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{item.label}</h3>
          </div>
        </DraggableCardBody>
      ))}
    </div>
  )
}
