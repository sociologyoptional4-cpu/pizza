import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MessageCircle, Phone } from 'lucide-react'
import { STORE } from '../data/catalog'
import { useOrdersStore } from '../store/ordersStore'
import { buildWhatsAppLink } from '../lib/whatsapp'
import { STAGE_LABELS, currentStageIndex, stagesFor } from '../lib/checkout'
import { OrderTimeline } from '../components/order/OrderTimeline'
import { Button } from '../components/ui/Button'
import './confirmation.css'

export function TrackOrder() {
  const [params] = useSearchParams()
  const orders = useOrdersStore((s) => s.orders)
  const [query, setQuery] = useState(params.get('order') ?? '')

  // tick every 15s so the live timeline + ETA advance without reload
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15000)
    return () => clearInterval(id)
  }, [])

  const order = orders.find((o) => o.number === query.trim().toUpperCase()) ?? orders[0]

  if (!orders.length) {
    return (
      <main className="container confirm">
        <h1>No orders yet</h1>
        <p className="lead">Place an order and track it live here.</p>
        <Link to="/" className="eyebrow">← Browse the menu</Link>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="container confirm">
        <h1>Track your order</h1>
        <input
          className="track-input"
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          placeholder="Enter order number (FRN-…)"
        />
        <p className="zone-bad">No order matches that number.</p>
      </main>
    )
  }

  const stages = stagesFor(order.type)
  const idx = currentStageIndex(order)
  const isComplete = idx >= stages.length - 1
  const remaining = Math.max(0, order.timing.etaMinutes - Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000))

  return (
    <main className="container confirm">
      <div className="confirm__hero">
        <p className="eyebrow">Tracking {order.number}</p>
        <h1 className="confirm__num">{STAGE_LABELS[stages[idx]]}</h1>
        <p className="lead">
          {isComplete
            ? 'All done. Enjoy! 🍕'
            : order.type === 'Delivery'
              ? `Estimated arrival in ~${remaining || order.timing.etaMinutes} min`
              : `Ready in ~${remaining || order.timing.etaMinutes} min`}
        </p>
      </div>

      <div className="confirm__grid">
        <section className="confirm__card">
          <h2>Progress</h2>
          <OrderTimeline order={order} />
        </section>
        <section className="confirm__card">
          <h2>Need us?</h2>
          <p className="lead" style={{ marginBottom: 'var(--space-4)' }}>
            {STORE.name} · {STORE.address}
          </p>
          <div className="confirm__actions">
            <a href={`tel:${STORE.phone}`}>
              <Button><Phone size={16} /> Call store</Button>
            </a>
            <a href={buildWhatsAppLink(order)} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost"><MessageCircle size={16} /> Message on WhatsApp</Button>
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}
