import { BASES, COUPONS, CRUSTS, OPENING_HOURS, REVIEWS } from '../../../data/catalog'
import { menuRepository, storeRepository } from '../../../data/repository'
import { useOrdersStore } from '../../../store/ordersStore'
import { useAdminStore } from '../../../store/adminStore'
import { STAGE_LABELS, currentStageIndex, stagesFor } from '../../../lib/checkout'
import { formatMoney } from '../../../lib/money'
import { summarizeDraft } from '../../../lib/draftSummary'
import { Panel, Table } from '../AdminUI'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function OrdersPanel() {
  const orders = useOrdersStore((s) => s.orders)
  return (
    <Panel title="Orders" subtitle={`${orders.length} total`}>
      {orders.length === 0 ? (
        <p className="admin-panel__sub">No orders yet.</p>
      ) : (
        <Table head={['Number', 'Date', 'Type', 'Items', 'Stage', 'Total']}>
          {orders.map((o) => {
            const stage = stagesFor(o.type)[currentStageIndex(o)]
            return (
              <tr key={o.id}>
                <td><strong>{o.number}</strong></td>
                <td>{new Date(o.createdAt).toLocaleString()}</td>
                <td>{o.type}</td>
                <td>{o.lines.map((l) => `${l.draft.quantity}× ${summarizeDraft(l.draft).title}`).join(', ')}</td>
                <td><span className="adm-pill">{STAGE_LABELS[stage]}</span></td>
                <td className="tnum">{formatMoney(o.totals.total)}</td>
              </tr>
            )
          })}
        </Table>
      )}
    </Panel>
  )
}

export function ProductsPanel() {
  const products = menuRepository.getProducts()
  const unavailable = useAdminStore((s) => s.unavailable)
  const toggle = useAdminStore((s) => s.toggleAvailable)
  return (
    <Panel title="Products" subtitle="Toggle availability live">
      <Table head={['Name', 'Category', 'Diet', 'Price', 'Rating', 'Status']}>
        {products.map((p) => {
          const off = unavailable.includes(p.id)
          return (
            <tr key={p.id}>
              <td><strong>{p.name}</strong></td>
              <td>{p.category}</td>
              <td>{p.diet === 'veg' ? 'Veg' : 'Meat'}</td>
              <td className="tnum">{formatMoney(p.basePrice)}</td>
              <td className="tnum">{p.rating}</td>
              <td>
                <button className={`adm-toggle ${off ? 'is-off' : 'is-on'}`} onClick={() => toggle(p.id)}>
                  {off ? 'Hidden' : 'Live'}
                </button>
              </td>
            </tr>
          )
        })}
      </Table>
    </Panel>
  )
}

export function SizesPanel() {
  return (
    <Panel title="Pizza sizes" subtitle="Size tiers and price multipliers">
      <Table head={['Size', 'Inches', 'Price factor']}>
        {menuRepository.getSizes().map((s) => (
          <tr key={s.id}>
            <td><strong>{s.label}</strong></td>
            <td className="tnum">{s.inches}"</td>
            <td className="tnum">×{s.priceFactor}</td>
          </tr>
        ))}
      </Table>
      <div className="admin-block" style={{ marginTop: 'var(--space-6)' }}>
        <h2>Bases &amp; crusts</h2>
        <Table head={['Option', 'Type', 'Surcharge']}>
          {BASES.map((b) => (
            <tr key={b.id}><td>{b.label}</td><td>Base</td><td className="tnum">{b.surcharge ? formatMoney(b.surcharge) : '—'}</td></tr>
          ))}
          {CRUSTS.map((c) => (
            <tr key={c.id}><td>{c.label}</td><td>Crust</td><td className="tnum">{c.surcharge ? formatMoney(c.surcharge) : '—'}</td></tr>
          ))}
        </Table>
      </div>
    </Panel>
  )
}

export function ToppingsPanel() {
  return (
    <Panel title="Toppings" subtitle="By category">
      <Table head={['Topping', 'Category', 'Diet', 'Price']}>
        {menuRepository.getToppings().map((t) => (
          <tr key={t.id}>
            <td><strong>{t.name}</strong>{t.premium && <span className="adm-pill" style={{ marginLeft: 8 }}>Premium</span>}</td>
            <td>{t.category}</td>
            <td>{t.diet === 'veg' ? 'Veg' : 'Meat'}</td>
            <td className="tnum">{formatMoney(t.price)}</td>
          </tr>
        ))}
      </Table>
    </Panel>
  )
}

export function DealsPanel() {
  return (
    <Panel title="Deals" subtitle="Combos and meal deals">
      <Table head={['Name', 'Kind', 'Price', 'Was', 'Serves']}>
        {menuRepository.getDeals().map((d) => (
          <tr key={d.id}>
            <td><strong>{d.name}</strong></td>
            <td>{d.kind}</td>
            <td className="tnum">{formatMoney(d.price)}</td>
            <td className="tnum">{formatMoney(d.was)}</td>
            <td className="tnum">{d.serves ?? '—'}</td>
          </tr>
        ))}
      </Table>
    </Panel>
  )
}

export function CouponsPanel() {
  return (
    <Panel title="Coupons" subtitle="Active discount codes">
      <Table head={['Code', 'Type', 'Value', 'Min order', 'Expires']}>
        {COUPONS.map((c) => (
          <tr key={c.code}>
            <td><strong>{c.code}</strong></td>
            <td>{c.type}</td>
            <td className="tnum">{c.type === 'percent' ? `${c.value}%` : formatMoney(c.value)}</td>
            <td className="tnum">{formatMoney(c.minOrder)}</td>
            <td>{new Date(c.expiresAt).toLocaleDateString()}</td>
          </tr>
        ))}
      </Table>
    </Panel>
  )
}

export function ZonesPanel() {
  return (
    <Panel title="Delivery areas" subtitle="Postcode zones, fees and minimums">
      <Table head={['Prefix', 'Area', 'Fee', 'Min order', 'Status']}>
        {storeRepository.getZones().map((z) => (
          <tr key={z.postcodePrefix}>
            <td><strong>{z.postcodePrefix}</strong></td>
            <td>{z.area}</td>
            <td className="tnum">{formatMoney(z.fee)}</td>
            <td className="tnum">{formatMoney(z.minOrder)}</td>
            <td><span className={`adm-toggle ${z.active ? 'is-on' : 'is-off'}`}>{z.active ? 'Active' : 'Off'}</span></td>
          </tr>
        ))}
      </Table>
    </Panel>
  )
}

export function HoursPanel() {
  return (
    <Panel title="Opening hours" subtitle="Weekly schedule">
      <Table head={['Day', 'Opens', 'Closes', 'Status']}>
        {OPENING_HOURS.map((h) => (
          <tr key={h.day}>
            <td><strong>{DAYS[h.day]}</strong></td>
            <td className="tnum">{h.closed ? '—' : h.open}</td>
            <td className="tnum">{h.closed ? '—' : h.close}</td>
            <td><span className={`adm-toggle ${h.closed ? 'is-off' : 'is-on'}`}>{h.closed ? 'Closed' : 'Open'}</span></td>
          </tr>
        ))}
      </Table>
    </Panel>
  )
}

export function CustomersPanel() {
  const orders = useOrdersStore((s) => s.orders)
  const byPhone = new Map<string, { name: string; orders: number; spent: number }>()
  for (const o of orders) {
    const cur = byPhone.get(o.customer.phone) ?? { name: o.customer.name, orders: 0, spent: 0 }
    cur.orders += 1
    cur.spent += o.totals.total
    byPhone.set(o.customer.phone, cur)
  }
  const rows = [...byPhone.entries()]
  return (
    <Panel title="Customers" subtitle={`${rows.length} known`}>
      {rows.length === 0 ? (
        <p className="admin-panel__sub">No customers yet.</p>
      ) : (
        <Table head={['Name', 'Phone', 'Orders', 'Spent']}>
          {rows.map(([phone, c]) => (
            <tr key={phone}>
              <td><strong>{c.name}</strong></td>
              <td>{phone}</td>
              <td className="tnum">{c.orders}</td>
              <td className="tnum">{formatMoney(c.spent)}</td>
            </tr>
          ))}
        </Table>
      )}
    </Panel>
  )
}

export function ReviewsPanel() {
  const hidden = useAdminStore((s) => s.hiddenReviews)
  const toggle = useAdminStore((s) => s.toggleReview)
  return (
    <Panel title="Reviews" subtitle="Moderate customer reviews">
      <Table head={['Author', 'Rating', 'Review', 'Visibility']}>
        {REVIEWS.map((r) => {
          const isHidden = hidden.includes(r.id)
          return (
            <tr key={r.id}>
              <td><strong>{r.author}</strong></td>
              <td className="tnum">{'★'.repeat(r.rating)}</td>
              <td style={{ maxWidth: 360 }}>{r.body}</td>
              <td>
                <button className={`adm-toggle ${isHidden ? 'is-off' : 'is-on'}`} onClick={() => toggle(r.id)}>
                  {isHidden ? 'Hidden' : 'Visible'}
                </button>
              </td>
            </tr>
          )
        })}
      </Table>
    </Panel>
  )
}
