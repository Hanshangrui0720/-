import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import './TiltedCard.css'
import { asset, legacyAsset } from './media'
import MediaImage from './MediaImage'

const spring = { damping: 26, stiffness: 135, mass: 1.25 }

export default function TiltedCard({ imageSrc, altText, captionText, overlayContent, rotateAmplitude = 8, scaleOnHover = 1.035 }) {
  const ref = useRef(null)
  const rotateX = useSpring(useMotionValue(0), spring)
  const rotateY = useSpring(useMotionValue(0), spring)
  const scale = useSpring(1, spring)
  const captionX = useMotionValue(0)
  const captionY = useMotionValue(0)
  const captionOpacity = useSpring(0)
  const resolvedImageSrc = imageSrc.startsWith('/assets/')
    ? asset(imageSrc)
    : imageSrc

  const handleMove = event => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const offsetX = event.clientX - rect.left - rect.width / 2
    const offsetY = event.clientY - rect.top - rect.height / 2
    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude * 1.55)
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude * 1.55)
    captionX.set(event.clientX - rect.left)
    captionY.set(event.clientY - rect.top)
  }

  const reset = () => {
    scale.set(1)
    rotateX.set(0)
    rotateY.set(0)
    captionOpacity.set(0)
  }

  return (
    <figure ref={ref} className="tilted-card-figure profile-tilted-card" onMouseMove={handleMove} onMouseEnter={() => { scale.set(Math.max(scaleOnHover, 1.065)); captionOpacity.set(1) }} onMouseLeave={reset}>
      <motion.div className="tilted-card-inner" style={{ rotateX, rotateY, scale }}>
        <MediaImage src={resolvedImageSrc} fallbackSrc={legacyAsset(imageSrc)} alt={altText} className="tilted-card-img" draggable="false" loading="eager" fetchPriority="high" />
        {overlayContent && <div className="tilted-card-overlay">{overlayContent}</div>}
      </motion.div>
      <motion.figcaption className="tilted-card-caption" style={{ x: captionX, y: captionY, opacity: captionOpacity }}>{captionText}</motion.figcaption>
    </figure>
  )
}
