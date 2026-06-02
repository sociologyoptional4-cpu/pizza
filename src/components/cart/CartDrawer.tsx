import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Tag, X } from 'lucide-react'
import { menuRepository } from '../../data/repository'
import { UPSELLS } from '../../data/upsell'
import { computeTotals, validateCoupon } from '../../lib/cartTotals'
import { formatMoney } from '../../lib/money'
import { createDraft } from '../../lib/draft'
import { useCartStore } from '../../store/cartStore'
import { useUIStore } from '../../store/uiStore'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { PriceCounter } from '../ui/PriceCounter'
import { CartLineRow } from './CartLineRow'
import './cart.css'

export function CartDrawer() {
  const open = useUIStore((s) => s.cartOpen)
  const closeCart = useUIStore((s) => s.closeCart)
  const navigate = useNavigate()

  const lines = useCartStore((s) => s.lines)
  const fulfilment = useCartStore((s) => s.fulfilment)
  const couponCode = useCartStore((s) => s.couponCode)
  const setCoupon = useCartStore((s) => s.setCoupon)
  const addDraft = useCartStore((s) => s.addDraft)

  const totals = useMemo(
    () => computeTotals(lines, fulfilment, couponCode),
    [lines, fulfilment, couponCode],
  )
  const [code, setCode] = useState(couponCode ?? '')
  const [couponError, setCouponError] = useState<string>()

  function applyCoupon() {
    const result = validateCoupon(code, totals.subtotal)
    if (result.ok) {
      setCoupon(result.coupon.code)
      setCouponError(undefined)
    } else {
      setCouponError(result.reason)
    }
  }

  const suggestions = UPSELLS['in-cart'].filter(
    (u) => !lines.some((l) => l.draft.productId === u.productId),
  )

  function goCheckout() {
    closeCart()
    navigate('/checkout')
  }

  return (
    <Sheet open={open} onClose={closeCart} variant="drawer" label="Your cart">
      <div className="cart">
        <header className="cart__head">
          <h3>
            <ShoppingBag size={18} /> Your order
          </h3>
          <button onClick={closeCart} aria-label="Close cart">
            <X size={20} />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="cart__empty">
            <span className="cart__empty-emoji">🍕</span>
            <p>Your cart is empty.</p>
            <Button onClick={() => { closeCart(); navigate('/') }}>Build your first pizza</Button>
          </div>
        ) : (
          <>
            <div className="cart__scroll">
              {/* free delivery progress */}
              {fulfilment === 'Delivery' && (
                <div className="freedel">
                  <div className="freedel__bar">
                    <span
                      style={{
                        width: `${Math.min(100, (totals.subtotal / totals.freeDeliveryThreshold) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="freedel__text">
                    {totals.qualifiesFreeDelivery
                      ? '🎉 You’ve unlocked free delivery!'
                      : `Add ${formatMoney(totals.amountToFreeDelivery)} more for free delivery`}
                  </p>
                </div>
              )}

              <ul className="cart__lines">
                <AnimatePresence initial={false}>
                  {lines.map((l) => (
                    <CartLineRow key={l.key} line={l} />
                  ))}
                </AnimatePresence>
              </ul>

              {suggestions.length > 0 && (
                <section className="cart__upsell">
                  <p className="cart__upsell-title">Complete your meal</p>
                  <div className="cart__upsell-list">
                    {suggestions.map((u) => {
                      const p = u.productId ? menuRepository.getProduct(u.productId) : undefined
                      if (!p) return null
                      return (
                        <button
                          key={u.id}
                          className="upsell-card"
                          onClick={() => addDraft({ ...createDraft(p.id), quantity: 1 })}
                        >
                          <img src={p.image} alt="" aria-hidden />
                          <span>{p.name}</span>
                          <span className="tnum">+{formatMoney(p.basePrice)}</span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* coupon */}
              <div className="cart__coupon">
                <div className="cart__coupon-row">
                  <Tag size={16} />
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Discount code"
                    aria-label="Discount code"
                  />
                  <Button variant="ghost" size="sm" onClick={applyCoupon}>
                    Apply
                  </Button>
                </div>
                {couponError && <p className="cart__coupon-err">{couponError}</p>}
                {couponCode && !couponError && (
                  <p className="cart__coupon-ok">Applied {couponCode}</p>
                )}
              </div>
            </div>

            <footer className="cart__foot">
              <dl className="cart__totals">
                <div>
                  <dt>Subtotal</dt>
                  <dd className="tnum">{formatMoney(totals.subtotal)}</dd>
                </div>
                {totals.discount > 0 && (
                  <div className="cart__discount">
                    <dt>Discount</dt>
                    <dd className="tnum">-{formatMoney(totals.discount)}</dd>
                  </div>
                )}
                <div>
                  <dt>{fulfilment === 'Collection' ? 'Collection' : 'Delivery'}</dt>
                  <dd className="tnum">
                    {totals.deliveryFee === 0 ? 'Free' : formatMoney(totals.deliveryFee)}
                  </dd>
                </div>
                <div className="cart__grand">
                  <dt>Total</dt>
                  <dd>
                    <PriceCounter value={totals.total} />
                  </dd>
                </div>
              </dl>

              {!totals.meetsMinOrder && (
                <p className="cart__min">Minimum order {formatMoney(totals.minOrder)} for {fulfilment.toLowerCase()}.</p>
              )}
              <Button size="lg" className="cart__checkout" disabled={!totals.meetsMinOrder} onClick={goCheckout}>
                Checkout · {formatMoney(totals.total)}
              </Button>
            </footer>
          </>
        )}
      </div>
    </Sheet>
  )
}
