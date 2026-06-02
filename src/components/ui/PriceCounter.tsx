import { useEffect, useRef, useState } from 'react'
import { formatMoney } from '../../lib/money'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './ui.css'

/** Animated rolling price. Tweens from previous to next value; instant under reduced-motion. */
export function PriceCounter({ value }: { value: number }) {
  const reduced = useReducedMotion()
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (reduced) {
      setDisplay(value)
      return
    }
    const from = fromRef.current
    const to = value
    if (from === to) return
    const duration = 320
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (to - from) * eased)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else fromRef.current = to
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      fromRef.current = value
    }
  }, [value, reduced])

  return (
    <span className="price-counter" aria-live="polite">
      {formatMoney(display)}
    </span>
  )
}
