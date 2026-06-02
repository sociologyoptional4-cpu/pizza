import { AnimatePresence, motion } from 'framer-motion'
import { CART_PILL_ID } from '../../app/domIds'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useUIStore } from '../../store/uiStore'

/** Animates a clone of the pizza image arcing into the cart pill. No-op under reduced motion. */
export function FlightLayer() {
  const flight = useUIStore((s) => s.flight)
  const clearFlight = useUIStore((s) => s.clearFlight)
  const reduced = useReducedMotion()

  if (reduced || !flight) return null

  const target = document.getElementById(CART_PILL_ID)?.getBoundingClientRect()
  const tx = target ? target.left + target.width / 2 : window.innerWidth - 40
  const ty = target ? target.top + target.height / 2 : 40

  return (
    <AnimatePresence>
      <motion.img
        key="flight"
        src={flight.image}
        aria-hidden
        initial={{
          position: 'fixed',
          left: flight.from.x,
          top: flight.from.y,
          width: flight.from.w,
          height: flight.from.h,
          borderRadius: '50%',
          zIndex: 500,
          pointerEvents: 'none',
          opacity: 1,
        }}
        animate={{
          left: tx - 24,
          top: ty - 24,
          width: 48,
          height: 48,
          opacity: 0.2,
          rotate: 220,
        }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        onAnimationComplete={clearFlight}
      />
    </AnimatePresence>
  )
}
