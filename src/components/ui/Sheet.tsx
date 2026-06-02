import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import './ui.css'

type SheetProps = {
  open: boolean
  onClose: () => void
  variant?: 'drawer' | 'modal'
  label: string
  children: ReactNode
}

const SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

/** Accessible sheet: backdrop, ESC close, focus trap, spring motion (instant under reduced-motion).
    drawer = slide from right (bottom on mobile); modal = centered (bottom on mobile). */
export function Sheet({ open, onClose, variant = 'drawer', label, children }: SheetProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const node = ref.current
    node?.querySelector<HTMLElement>(SELECTOR)?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !node) return
      const items = Array.from(node.querySelectorAll<HTMLElement>(SELECTOR))
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus()
    }
  }, [open, onClose])

  const fromX = variant === 'drawer' ? '100%' : 0
  const initial = reduced
    ? { opacity: 0 }
    : variant === 'drawer'
      ? { x: fromX }
      : { opacity: 0, scale: 0.96 }
  const animate = reduced ? { opacity: 1 } : variant === 'drawer' ? { x: 0 } : { opacity: 1, scale: 1 }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            className={`sheet sheet--${variant}`}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={initial}
            animate={animate}
            exit={initial}
            transition={
              reduced ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 34 }
            }
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
