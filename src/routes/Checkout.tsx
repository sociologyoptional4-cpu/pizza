import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Bike, Check, Store, Utensils } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useCheckoutStore } from '../store/checkoutStore'
import { useOrdersStore } from '../store/ordersStore'
import { useUIStore } from '../store/uiStore'
import { computeTotals } from '../lib/cartTotals'
import { checkoutSchema, buildOrder, estimateEta, stepIsValid, type CheckoutForm } from '../lib/checkout'
import { checkDeliveryArea } from '../lib/storeStatus'
import { getStoreStatus } from '../lib/storeStatus'
import { buildWhatsAppLink } from '../lib/whatsapp'
import { formatMoney } from '../lib/money'
import { Button } from '../components/ui/Button'
import { CheckoutSummary } from '../components/checkout/CheckoutSummary'
import '../components/checkout/checkout.css'

const STEPS = ['Order type', 'Details', 'Address', 'Time', 'Payment', 'Review', 'Confirm']
const PAYMENTS = ['Cash', 'Card', 'Apple Pay', 'Google Pay', 'Pay by link', 'Pay on collection']

export function Checkout() {
  const navigate = useNavigate()
  const lines = useCartStore((s) => s.lines)
  const couponCode = useCartStore((s) => s.couponCode)
  const clearCart = useCartStore((s) => s.clear)
  const form = useCheckoutStore((s) => s.form)
  const step = useCheckoutStore((s) => s.step)
  const setForm = useCheckoutStore((s) => s.setForm)
  const setStep = useCheckoutStore((s) => s.setStep)
  const resetCheckout = useCheckoutStore((s) => s.reset)
  const placeOrder = useOrdersStore((s) => s.place)
  const setLastOrder = useUIStore((s) => s.setLastOrder)

  const [showErrors, setShowErrors] = useState(false)
  const status = getStoreStatus()

  const fulfilment = form.orderType === 'Collection' ? 'Collection' : 'Delivery'
  const zone = form.orderType === 'Delivery' && form.postcode ? checkDeliveryArea(form.postcode) : undefined
  const deliveryFee = zone?.ok ? zone.zone.fee : undefined
  const totals = useMemo(
    () => computeTotals(lines, fulfilment, couponCode, deliveryFee),
    [lines, fulfilment, couponCode, deliveryFee],
  )

  if (lines.length === 0) {
    return (
      <main className="container checkout-empty">
        <h1>Your cart is empty</h1>
        <Button onClick={() => navigate('/')}>Browse the menu</Button>
      </main>
    )
  }

  const isLast = step === STEPS.length - 1
  const canAdvance = stepIsValid(step, form)
  const skipAddress = form.orderType !== 'Delivery'

  function next() {
    if (!canAdvance) {
      setShowErrors(true)
      return
    }
    setShowErrors(false)
    // skip address step for collection / dine-in
    let target = step + 1
    if (target === 2 && skipAddress) target = 3
    setStep(target)
  }
  function back() {
    let target = step - 1
    if (target === 2 && skipAddress) target = 1
    setStep(Math.max(0, target))
  }

  function confirm() {
    const parsed = checkoutSchema.safeParse(form)
    if (!parsed.success || !totals.meetsMinOrder || !status.open) {
      setShowErrors(true)
      return
    }
    const order = buildOrder({ form: parsed.data, lines, totals, couponCode })
    placeOrder(order)
    setLastOrder(order)
    // Open WhatsApp with the full order, then clear and route to confirmation.
    window.open(buildWhatsAppLink(order), '_blank', 'noopener,noreferrer')
    clearCart()
    resetCheckout()
    navigate(`/order-confirmation?order=${order.number}`)
  }

  const fieldErr = (field: keyof CheckoutForm) => {
    if (!showErrors) return undefined
    const result = checkoutSchema.shape[field].safeParse(form[field])
    return result.success ? undefined : result.error.issues[0]?.message
  }

  return (
    <main className="container checkout">
      <ol className="checkout__progress" aria-label="Checkout steps">
        {STEPS.map((label, i) => (
          <li key={label} className={`checkout__pip ${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`}>
            <span>{i < step ? <Check size={12} /> : i + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      <div className="checkout__grid">
        <section className="checkout__panel" aria-live="polite">
          <h2 className="checkout__title">{STEPS[step]}</h2>

          {step === 0 && (
            <div className="ordertype">
              {([
                { id: 'Delivery', icon: Bike, sub: `~${estimateEta('Delivery', 'asap')} min` },
                { id: 'Collection', icon: Store, sub: `~${estimateEta('Collection', 'asap')} min` },
                { id: 'Dine-in', icon: Utensils, sub: 'Eat in' },
              ] as const).map(({ id, icon: Icon, sub }) => (
                <button
                  key={id}
                  className={`ordertype__card ${form.orderType === id ? 'is-selected' : ''}`}
                  onClick={() => setForm({ orderType: id })}
                >
                  <Icon size={24} />
                  <span className="ordertype__name">{id}</span>
                  <span className="ordertype__sub">{sub}</span>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="form-grid">
              <Field label="Full name" error={fieldErr('name')}>
                <input value={form.name} onChange={(e) => setForm({ name: e.target.value })} autoComplete="name" />
              </Field>
              <Field label="Phone" error={fieldErr('phone')}>
                <input value={form.phone} onChange={(e) => setForm({ phone: e.target.value })} inputMode="tel" autoComplete="tel" />
              </Field>
              <Field label="Email (optional)" error={fieldErr('email')}>
                <input value={form.email ?? ''} onChange={(e) => setForm({ email: e.target.value })} inputMode="email" autoComplete="email" />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="form-grid">
              <Field label="Postcode">
                <input value={form.postcode ?? ''} onChange={(e) => setForm({ postcode: e.target.value.toUpperCase() })} autoComplete="postal-code" />
              </Field>
              {form.postcode && zone && (
                <p className={zone.ok ? 'zone-ok' : 'zone-bad'}>
                  {zone.ok
                    ? `✓ ${zone.zone.area} — delivery ${formatMoney(zone.zone.fee)}, min ${formatMoney(zone.zone.minOrder)}`
                    : zone.reason}
                </p>
              )}
              <Field label="Flat / house no. and street">
                <input value={form.addressLine ?? ''} onChange={(e) => setForm({ addressLine: e.target.value })} autoComplete="street-address" />
              </Field>
              <Field label="Delivery instructions (optional)">
                <input value={form.instructions ?? ''} onChange={(e) => setForm({ instructions: e.target.value })} placeholder="e.g. buzz flat 3" />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="time-step">
              <div className="seg">
                <button className={form.timingMode === 'asap' ? 'is-on' : ''} onClick={() => setForm({ timingMode: 'asap' })}>
                  ASAP {form.orderType === 'Delivery' ? `(~${estimateEta('Delivery', 'asap')} min)` : `(~${estimateEta('Collection', 'asap')} min)`}
                </button>
                <button className={form.timingMode === 'scheduled' ? 'is-on' : ''} onClick={() => setForm({ timingMode: 'scheduled' })}>
                  Schedule for later
                </button>
              </div>
              {form.timingMode === 'scheduled' && (
                <Field label="Pick a time">
                  <input type="time" value={form.scheduledFor ?? ''} onChange={(e) => setForm({ scheduledFor: e.target.value })} />
                </Field>
              )}
              {!status.open && <p className="zone-bad">Store is currently closed — {status.label}.</p>}
            </div>
          )}

          {step === 4 && (
            <div className="pay-grid">
              {PAYMENTS.map((p) => (
                <button key={p} className={`pay-card ${form.payment === p ? 'is-selected' : ''}`} onClick={() => setForm({ payment: p })}>
                  {p}
                </button>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="review-step">
              <CheckoutSummary lines={lines} totals={totals} editable onEdit={() => navigate('/cart')} />
              <label className="opt-row">
                <input type="checkbox" checked={form.contactless} onChange={(e) => setForm({ contactless: e.target.checked })} />
                Contactless — leave at door
              </label>
              <label className="opt-row">
                <input type="checkbox" checked={form.cutlery} onChange={(e) => setForm({ cutlery: e.target.checked })} />
                Include cutlery &amp; napkins
              </label>
              {!totals.meetsMinOrder && <p className="zone-bad">Minimum order {formatMoney(totals.minOrder)} not met.</p>}
            </div>
          )}

          {step === 6 && (
            <div className="confirm-step">
              <p className="lead">Almost there. Confirm and we’ll send your order to the kitchen via WhatsApp.</p>
              <label className="opt-row opt-row--warn">
                <input type="checkbox" checked={form.allergyAck} onChange={(e) => setForm({ allergyAck: e.target.checked as true })} />
                I’ve checked allergen info for everyone eating.
              </label>
              {fieldErr('allergyAck') && <p className="zone-bad">{fieldErr('allergyAck')}</p>}
              {!status.open && <p className="zone-bad">Store is closed right now — {status.label}.</p>}
            </div>
          )}

          <div className="checkout__nav">
            {step > 0 && (
              <Button variant="ghost" onClick={back}>
                <ArrowLeft size={16} /> Back
              </Button>
            )}
            {isLast ? (
              <Button size="lg" onClick={confirm} disabled={!status.open || !totals.meetsMinOrder}>
                Place order · {formatMoney(totals.total)}
              </Button>
            ) : (
              <Button onClick={next}>
                Next <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </section>

        <aside className="checkout__rail">
          <CheckoutSummary lines={lines} totals={totals} />
        </aside>
      </div>
    </main>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {error && <span className="field__err">{error}</span>}
    </label>
  )
}
