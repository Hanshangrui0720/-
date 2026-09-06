import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import './AnimatedList.css'

function AnimatedItem({ item, index, selected, onSelect }) {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.35, once: false })

  return (
    <motion.button
      ref={ref}
      type="button"
      data-index={index}
      className={`animated-list-item${selected ? ' is-selected' : ''}`}
      initial={{ opacity: 0, scale: 0.86, y: 12 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.86, y: 12 }}
      transition={{ duration: 0.34, delay: Math.min(index * 0.035, 0.22) }}
      onMouseEnter={() => onSelect(index)}
      onFocus={() => onSelect(index)}
      onClick={() => onSelect(index)}
    >
      <span>{String(index + 1).padStart(2, '0')}</span>
      <strong>{item}</strong>
      <i>↗</i>
    </motion.button>
  )
}

export default function AnimatedList({ items, onItemSelect, showGradients = true, enableArrowNavigation = true, displayScrollbar = true, initialSelectedIndex = 0, className = '' }) {
  const listRef = useRef(null)
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex)
  const [topGradientOpacity, setTopGradientOpacity] = useState(0)
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1)

  const select = useCallback((index) => {
    setSelectedIndex(index)
    onItemSelect?.(items[index], index)
  }, [items, onItemSelect])

  const handleScroll = useCallback((event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    setTopGradientOpacity(Math.min(scrollTop / 48, 1))
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min((scrollHeight - scrollTop - clientHeight) / 48, 1))
  }, [])

  useEffect(() => {
    if (!enableArrowNavigation) return undefined
    const onKeyDown = (event) => {
      if (!listRef.current?.contains(document.activeElement)) return
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
      event.preventDefault()
      const nextIndex = Math.max(0, Math.min(items.length - 1, selectedIndex + (event.key === 'ArrowDown' ? 1 : -1)))
      select(nextIndex)
      listRef.current.querySelector(`[data-index="${nextIndex}"]`)?.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enableArrowNavigation, items.length, selectedIndex, select])

  return (
    <div className={`animated-list ${className}`}>
      <div ref={listRef} className={`animated-list-scroll${displayScrollbar ? '' : ' no-scrollbar'}`} onScroll={handleScroll}>
        {items.map((item, index) => <AnimatedItem key={item} item={item} index={index} selected={selectedIndex === index} onSelect={select} />)}
      </div>
      {showGradients && <><div className="animated-list-gradient top" style={{ opacity: topGradientOpacity }} /><div className="animated-list-gradient bottom" style={{ opacity: bottomGradientOpacity }} /></>}
    </div>
  )
}
