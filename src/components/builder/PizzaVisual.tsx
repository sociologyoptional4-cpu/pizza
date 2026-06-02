import { AnimatePresence, motion } from 'framer-motion'
import { menuRepository } from '../../data/repository'
import type { PizzaDraft } from '../../data/types'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { placeToppings } from './toppingVisual'
import './pizza-visual.css'

type Props = { draft: PizzaDraft; imageRef?: React.Ref<HTMLDivElement> }

const SIZE_SCALE: Record<string, number> = { small: 0.82, medium: 0.92, large: 1 }

/** Live pizza render. Scales by size, shows stuffed-crust rim, half divider, scattered toppings. */
export function PizzaVisual({ draft, imageRef }: Props) {
  const reduced = useReducedMotion()
  const product = menuRepository.getProduct(draft.productId)
  const pieces = placeToppings(draft)
  const scale = SIZE_SCALE[draft.sizeId] ?? 0.92
  const stuffed = draft.crustId !== 'regular'

  const leftImg = draft.halves && menuRepository.getProduct(draft.halves.left.productId)?.image
  const rightImg = draft.halves && menuRepository.getProduct(draft.halves.right.productId)?.image

  return (
    <div className="pizza-visual" ref={imageRef}>
      <motion.div
        className={`pizza-disc ${stuffed ? 'is-stuffed' : ''}`}
        animate={{ scale }}
        transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 22 }}
      >
        {draft.halfAndHalf && draft.halves ? (
          <>
            <div className="pizza-half pizza-half--left" style={{ backgroundImage: `url(${leftImg})` }} />
            <div className="pizza-half pizza-half--right" style={{ backgroundImage: `url(${rightImg})` }} />
            <div className="pizza-divider" />
          </>
        ) : (
          <img src={product?.image} alt={product?.name ?? 'Pizza'} className="pizza-base-img" />
        )}

        <AnimatePresence>
          {pieces.map((p) => (
            <motion.span
              key={p.key}
              className="topping-piece"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              initial={reduced ? { opacity: 1 } : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
              transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 18 }}
            >
              {p.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
