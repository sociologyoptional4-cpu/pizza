import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageCircle, Phone, RotateCcw } from 'lucide-react'
import { STORE } from '../data/catalog'
import { menuRepository } from '../data/repository'
import { useOrdersStore } from '../store/ordersStore'
import { useCartStore } from '../store/cartStore'
import { buildWhatsAppLink } from '../lib/whatsapp'
import { formatMoney } from '../lib/money'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { OrderTimeline } from '../components/order/OrderTimeline'
import { ProductGrid } from '../components/menu/ProductGrid'
import { Button } from '../components/ui/Button'
import './confirmation.css'

export function OrderConfirmation() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const number = params.get('order') ?? ''
  const orders = useOrdersStore((s) => s.orders)
  const order = orders.find((o) => o.number === number) ?? orders[0]
  const addDraft = useCartStore((s) => s.addDraft)

  if (!order) {
    return (
      <main className="container confirm">
        <h1>Order not found</h1>
        <Link to="/" className="eyebrow">← Back home</Link>
      </main>
    )
  }

  function reorder() {
    order!.lines.forEach((l) => addDraft(l.draft))
    navigate('/cart')
  }

  const recommended = menuRepository.getProducts().filter((p) => !p.customizable).slice(0, 3)

  return (
    <main className="container confirm">
      <motion.div
        className="confirm__hero"
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 18 }}
      >
        <span className="confirm__badge">🍕</span>
        <p className="eyebrow">Order confirmed</p>
        <h1 className="confirm__num">{order.number}</h1>
        <p className="lead">
          {order.type === 'Delivery'
            ? `On its way in about ${order.timing.etaMinutes} minutes.`
            : order.type === 'Collection'
              ? `Ready for collection in about ${order.timing.etaMinutes} minutes.`
              : 'We’ll bring it to your table.'}
        </p>
        <p className="confirm__total">Total paid: {formatMoney(order.totals.total)} · {order.payment}</p>
      </motion.div>

      <div className="confirm__grid">
        <section className="confirm__card">
          <h2>Order progress</h2>
          <OrderTimeline order={order} />
          <div className="confirm__actions">
            <a href={buildWhatsAppLink(order)} target="_blank" rel="noopener noreferrer">
              <Button><MessageCircle size={16} /> WhatsApp confirmation</Button>
            </a>
            <a href={`tel:${STORE.phone}`}>
              <Button variant="ghost"><Phone size={16} /> Call store</Button>
            </a>
            <Button variant="ghost" onClick={reorder}><RotateCcw size={16} /> Reorder</Button>
            <Link to={`/track?order=${order.number}`}>
              <Button variant="quiet">Track order</Button>
            </Link>
          </div>
        </section>

        <section className="confirm__card">
          <h2>For next time</h2>
          <ProductGrid products={recommended} />
        </section>
      </div>
    </main>
  )
}
