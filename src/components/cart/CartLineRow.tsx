import { motion } from 'framer-motion'
import { Copy, Pencil, Trash2 } from 'lucide-react'
import type { CartLine } from '../../data/types'
import { formatMoney } from '../../lib/money'
import { summarizeDraft } from '../../lib/draftSummary'
import { menuRepository } from '../../data/repository'
import { useCartStore } from '../../store/cartStore'
import { useUIStore } from '../../store/uiStore'
import { Stepper } from '../ui/Stepper'

export function CartLineRow({ line }: { line: CartLine }) {
  const setQuantity = useCartStore((s) => s.setQuantity)
  const remove = useCartStore((s) => s.remove)
  const duplicate = useCartStore((s) => s.duplicate)
  const openBuilder = useUIStore((s) => s.openBuilder)
  const closeCart = useUIStore((s) => s.closeCart)

  const s = summarizeDraft(line.draft)
  const image = menuRepository.getProduct(line.draft.productId)?.image

  function edit() {
    closeCart()
    openBuilder(line.draft.productId, line.key, line.draft)
  }

  return (
    <motion.li
      layout
      className="cart-row"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.25 } }}
    >
      <img className="cart-row__img" src={image} alt="" aria-hidden />
      <div className="cart-row__body">
        <div className="cart-row__head">
          <span className="cart-row__title">{s.title}</span>
          <span className="cart-row__price tnum">{formatMoney(line.lineTotal)}</span>
        </div>
        <p className="cart-row__spec">
          {s.size} · {s.base} · {s.crust}
        </p>
        {s.halfAndHalf && (
          <p className="cart-row__spec">
            Half: {s.halfAndHalf.left} / {s.halfAndHalf.right}
          </p>
        )}
        {s.added && <p className="cart-row__spec">Extra: {s.added}</p>}
        {s.removed && <p className="cart-row__spec cart-row__removed">No: {s.removed}</p>}
        {s.notes && <p className="cart-row__spec cart-row__note">“{s.notes}”</p>}

        <div className="cart-row__actions">
          <Stepper value={line.draft.quantity} onChange={(q) => setQuantity(line.key, q)} min={1} />
          <div className="cart-row__icons">
            <button onClick={edit} aria-label="Edit item">
              <Pencil size={15} />
            </button>
            <button onClick={() => duplicate(line.key)} aria-label="Duplicate item">
              <Copy size={15} />
            </button>
            <button onClick={() => remove(line.key)} aria-label="Remove item">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </motion.li>
  )
}
