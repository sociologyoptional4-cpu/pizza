/* Account cluster: Login/Register, Account, Previous Orders, Reorder, Loyalty Rewards. */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, MapPin, Plus, RotateCcw, Trophy, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useOrdersStore } from '../store/ordersStore'
import { useCartStore } from '../store/cartStore'
import { STAGE_LABELS, currentStageIndex, stagesFor } from '../lib/checkout'
import { pointsFromOrders, tierForPoints, nextTier, tierProgress, TIERS } from '../lib/loyalty'
import { formatMoney } from '../lib/money'
import { Button } from '../components/ui/Button'
import { summarizeDraft } from '../lib/draftSummary'
import '../components/menu/menu-layout.css'
import '../components/checkout/checkout.css'
import './account.css'

/* ---------- Login / Register ---------- */
export function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState<string>()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^[+\d][\d\s()-]{7,}$/.test(phone.trim())) {
      setErr('Enter a valid phone number')
      return
    }
    login(phone.trim(), name.trim() || 'Guest')
    navigate('/account')
  }

  return (
    <main className="container account account--narrow">
      <header className="menu-page__head">
        <p className="eyebrow">Welcome back</p>
        <h1>Login or register</h1>
        <p className="lead">Phone-first — no passwords. We’ll text a code in production.</p>
      </header>
      <form className="form-grid account-card" onSubmit={submit} noValidate>
        <label className="field">
          <span className="field__label">Phone</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" />
          {err && <span className="field__err">{err}</span>}
        </label>
        <label className="field">
          <span className="field__label">Name (new customers)</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </label>
        <Button type="submit" size="lg">Continue</Button>
        <p className="account-fine">By continuing you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.</p>
      </form>
    </main>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user) {
    return (
      <main className="container account account--narrow">
        <h1>Please log in</h1>
        <Link to="/login"><Button>Login / register</Button></Link>
      </main>
    )
  }
  return <>{children}</>
}

/* ---------- Account ---------- */
export function AccountHome() {
  return (
    <RequireAuth>
      <AccountInner />
    </RequireAuth>
  )
}

function AccountInner() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)!
  const logout = useAuthStore((s) => s.logout)
  const addAddress = useAuthStore((s) => s.addAddress)
  const removeAddress = useAuthStore((s) => s.removeAddress)
  const orders = useOrdersStore((s) => s.orders)
  const points = pointsFromOrders(orders)
  const tier = tierForPoints(points)

  const [addr, setAddr] = useState({ label: '', postcode: '', line: '' })

  function saveAddr(e: React.FormEvent) {
    e.preventDefault()
    if (!addr.line.trim() || !addr.postcode.trim()) return
    addAddress({ label: addr.label || 'Home', postcode: addr.postcode.toUpperCase(), line: addr.line })
    setAddr({ label: '', postcode: '', line: '' })
  }

  return (
    <main className="container account">
      <header className="menu-page__head account-head">
        <div>
          <p className="eyebrow">Your account</p>
          <h1>Hi, {user.name.split(' ')[0]}</h1>
          <p className="lead">{user.phone}{user.email ? ` · ${user.email}` : ''}</p>
        </div>
        <Button variant="ghost" onClick={() => { logout(); navigate('/') }}>
          <LogOut size={16} /> Log out
        </Button>
      </header>

      <div className="account-grid">
        <Link to="/account/orders" className="account-tile">
          <span className="account-tile__big tnum">{orders.length}</span>
          <span>Previous orders</span>
        </Link>
        <Link to="/rewards" className="account-tile account-tile--gold">
          <span className="account-tile__big tnum">{points}</span>
          <span>{tier.name} · loyalty points</span>
        </Link>
        <Link to="/account/reorder" className="account-tile">
          <RotateCcw size={22} />
          <span>Reorder a favourite</span>
        </Link>
      </div>

      <section className="account-card">
        <h2><MapPin size={18} /> Saved addresses</h2>
        {user.addresses.length === 0 && <p className="lead">No saved addresses yet.</p>}
        <ul className="addr-list">
          {user.addresses.map((a) => (
            <li key={a.id}>
              <span><strong>{a.label}</strong> — {a.line}, {a.postcode}</span>
              <button aria-label="Remove address" onClick={() => removeAddress(a.id)}><X size={15} /></button>
            </li>
          ))}
        </ul>
        <form className="addr-form" onSubmit={saveAddr}>
          <input placeholder="Label" value={addr.label} onChange={(e) => setAddr({ ...addr, label: e.target.value })} />
          <input placeholder="Postcode" value={addr.postcode} onChange={(e) => setAddr({ ...addr, postcode: e.target.value })} />
          <input placeholder="Flat / street" value={addr.line} onChange={(e) => setAddr({ ...addr, line: e.target.value })} />
          <Button type="submit" size="sm"><Plus size={15} /> Add</Button>
        </form>
      </section>
    </main>
  )
}

/* ---------- Previous Orders ---------- */
export function PreviousOrders() {
  const orders = useOrdersStore((s) => s.orders)
  return (
    <main className="container account">
      <header className="menu-page__head">
        <p className="eyebrow">History</p>
        <h1>Previous orders</h1>
      </header>
      {orders.length === 0 ? (
        <p className="lead">No orders yet. <Link to="/" className="eyebrow">Start one →</Link></p>
      ) : (
        <ul className="order-list">
          {orders.map((o) => {
            const stages = stagesFor(o.type)
            const stage = stages[currentStageIndex(o)]
            return (
              <li key={o.id} className="order-row">
                <div>
                  <span className="order-row__num">{o.number}</span>
                  <span className="order-row__meta">{new Date(o.createdAt).toLocaleDateString()} · {o.type} · {o.lines.length} item{o.lines.length === 1 ? '' : 's'}</span>
                </div>
                <span className="order-row__stage">{STAGE_LABELS[stage]}</span>
                <span className="order-row__total tnum">{formatMoney(o.totals.total)}</span>
                <Link to={`/track?order=${o.number}`}><Button variant="ghost" size="sm">Track</Button></Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}

/* ---------- Reorder ---------- */
export function Reorder() {
  const navigate = useNavigate()
  const orders = useOrdersStore((s) => s.orders)
  const addDraft = useCartStore((s) => s.addDraft)

  function reorder(idx: number) {
    orders[idx].lines.forEach((l) => addDraft(l.draft))
    navigate('/cart')
  }

  return (
    <main className="container account">
      <header className="menu-page__head">
        <p className="eyebrow">One tap, same again</p>
        <h1>Reorder</h1>
      </header>
      {orders.length === 0 ? (
        <p className="lead">Nothing to reorder yet.</p>
      ) : (
        <ul className="order-list">
          {orders.map((o, i) => (
            <li key={o.id} className="order-row">
              <div>
                <span className="order-row__num">{o.number}</span>
                <span className="order-row__meta">
                  {o.lines.map((l) => `${l.draft.quantity}× ${summarizeDraft(l.draft).title}`).join(', ')}
                </span>
              </div>
              <span className="order-row__total tnum">{formatMoney(o.totals.total)}</span>
              <Button size="sm" onClick={() => reorder(i)}><RotateCcw size={15} /> Add to cart</Button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

/* ---------- Loyalty Rewards ---------- */
export function Loyalty() {
  const orders = useOrdersStore((s) => s.orders)
  const points = pointsFromOrders(orders)
  const tier = tierForPoints(points)
  const next = nextTier(points)
  const progress = tierProgress(points)

  return (
    <main className="container account">
      <header className="menu-page__head">
        <p className="eyebrow"><Trophy size={14} /> Forno rewards</p>
        <h1>Loyalty</h1>
      </header>

      <section className="loyalty-hero account-card">
        <div className="loyalty-ring" style={{ ['--p' as string]: progress }}>
          <span className="loyalty-ring__pts tnum">{points}</span>
          <span className="loyalty-ring__lbl">points</span>
        </div>
        <div>
          <h2 className="loyalty-tier">{tier.name}</h2>
          <p className="lead">{tier.perk}</p>
          {next ? (
            <p>{next.min - points} points to <strong>{next.name}</strong></p>
          ) : (
            <p>Top tier — you legend. 🍕</p>
          )}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 'var(--text-h3)', margin: 'var(--space-6) 0 var(--space-4)' }}>Tiers</h2>
        <ul className="tier-list">
          {TIERS.map((t) => (
            <li key={t.name} className={`tier-row ${points >= t.min ? 'is-reached' : ''}`}>
              <span className="tier-row__name">{t.name}</span>
              <span className="tier-row__min tnum">{t.min}+ pts</span>
              <span className="tier-row__perk">{t.perk}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
