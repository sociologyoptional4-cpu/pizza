/* Full-page cart — roomier mirror of the drawer. */
import { useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { computeTotals } from '../lib/cartTotals'
import { formatMoney } from '../lib/money'
import { CartLineRow } from '../components/cart/CartLineRow'
import { CheckoutSummary } from '../components/checkout/CheckoutSummary'
import { Button } from '../components/ui/Button'
import '../components/cart/cart.css'
import '../components/checkout/checkout.css'

export function CartPage() {
  const navigate = useNavigate()
  const lines = useCartStore((s) => s.lines)
  const fulfilment = useCartStore((s) => s.fulfilment)
  const couponCode = useCartStore((s) => s.couponCode)
  const totals = useMemo(() => computeTotals(lines, fulfilment, couponCode), [lines, fulfilment, couponCode])

  if (lines.length === 0) {
    return (
      <main className="container checkout-empty">
        <span style={{ fontSize: '3rem' }}>🍕</span>
        <h1>Your cart is empty</h1>
        <Link to="/">
          <Button>Build your first pizza</Button>
        </Link>
      </main>
    )
  }

  return (
    <main className="container checkout">
      <header className="menu-page__head">
        <p className="eyebrow">Your order</p>
        <h1 style={{ fontSize: 'var(--text-h2)' }}>Cart</h1>
      </header>
      <div className="checkout__grid">
        <section>
          <ul className="cart__lines" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 'var(--space-3)' }}>
            <AnimatePresence initial={false}>
              {lines.map((l) => (
                <CartLineRow key={l.key} line={l} />
              ))}
            </AnimatePresence>
          </ul>
        </section>
        <aside className="checkout__rail">
          <CheckoutSummary lines={lines} totals={totals} />
          {!totals.meetsMinOrder && (
            <p className="zone-bad">Minimum order {formatMoney(totals.minOrder)} not met.</p>
          )}
          <Button
            size="lg"
            className="cart__checkout"
            style={{ width: '100%', marginTop: 'var(--space-4)' }}
            disabled={!totals.meetsMinOrder}
            onClick={() => navigate('/checkout')}
          >
            Checkout · {formatMoney(totals.total)}
          </Button>
        </aside>
      </div>
    </main>
  )
}
