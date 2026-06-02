import type { CartLine } from '../../data/types'
import type { CartTotals } from '../../lib/cartTotals'
import { summarizeDraft } from '../../lib/draftSummary'
import { formatMoney } from '../../lib/money'
import './checkout.css'

type Props = {
  lines: CartLine[]
  totals: CartTotals
  editable?: boolean
  onEdit?: () => void
}

export function CheckoutSummary({ lines, totals, editable, onEdit }: Props) {
  return (
    <div className="summary">
      <div className="summary__head">
        <h3>Your order</h3>
        {editable && (
          <button className="summary__edit" onClick={onEdit}>
            Edit items
          </button>
        )}
      </div>
      <ul className="summary__lines">
        {lines.map((l) => {
          const s = summarizeDraft(l.draft)
          return (
            <li key={l.key} className="summary__line">
              <span className="summary__qty tnum">{l.draft.quantity}×</span>
              <span className="summary__info">
                <span className="summary__name">{s.title}</span>
                <span className="summary__spec">
                  {s.size} · {s.crust}
                  {s.added ? ` · +${s.added}` : ''}
                </span>
              </span>
              <span className="summary__price tnum">{formatMoney(l.lineTotal)}</span>
            </li>
          )
        })}
      </ul>
      <dl className="summary__totals">
        <div>
          <dt>Subtotal</dt>
          <dd className="tnum">{formatMoney(totals.subtotal)}</dd>
        </div>
        {totals.discount > 0 && (
          <div className="summary__discount">
            <dt>Discount</dt>
            <dd className="tnum">-{formatMoney(totals.discount)}</dd>
          </div>
        )}
        <div>
          <dt>Delivery</dt>
          <dd className="tnum">{totals.deliveryFee === 0 ? 'Free' : formatMoney(totals.deliveryFee)}</dd>
        </div>
        {totals.serviceCharge > 0 && (
          <div>
            <dt>Service</dt>
            <dd className="tnum">{formatMoney(totals.serviceCharge)}</dd>
          </div>
        )}
        <div className="summary__grand">
          <dt>Total</dt>
          <dd className="tnum">{formatMoney(totals.total)}</dd>
        </div>
      </dl>
    </div>
  )
}
