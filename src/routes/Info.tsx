/* Info cluster: About, Contact, Delivery Areas, Hours, Reviews, FAQ, Terms, Privacy, Offers. */
import { useState } from 'react'
import { Clock, Mail, MapPin, Phone, Star } from 'lucide-react'
import { FAQS, OPENING_HOURS, REVIEWS, STORE, ZONES, COUPONS } from '../data/catalog'
import { checkDeliveryArea, getStoreStatus } from '../lib/storeStatus'
import { formatMoney } from '../lib/money'
import { Button } from '../components/ui/Button'
import './info.css'
import '../components/checkout/checkout.css'
import '../components/menu/menu-layout.css'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function PageHead({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <header className="menu-page__head">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
    </header>
  )
}

/* ---------- About ---------- */
export function About() {
  return (
    <main className="container info">
      <PageHead eyebrow="Our story" title="About Forno" lead="One oven, one obsession: the perfect slice." />
      <div className="info-prose">
        <p>Forno started with a second-hand wood-fired oven in a railway arch and a stubborn belief that great pizza shouldn’t need a white tablecloth. We slow-ferment our dough for 48 hours, source San Marzano tomatoes, and char every base in 90 seconds at 450°C.</p>
        <p>Today we deliver across East London and beyond — but the obsession hasn’t changed. Every pizza is built to order, fired fresh, and sent out the moment it’s ready.</p>
        <p>Family-run, halal-certified, and proudly local.</p>
      </div>
    </main>
  )
}

/* ---------- Contact ---------- */
export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' })
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string>()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (form.website) return // honeypot
    if (form.name.trim().length < 2 || !form.message.trim()) {
      setErr('Add your name and a message')
      return
    }
    setErr(undefined)
    setSent(true)
  }

  return (
    <main className="container info">
      <PageHead eyebrow="Say hello" title="Contact us" />
      <div className="info-grid">
        <div className="info-contact">
          <a href={`tel:${STORE.phone}`}><Phone size={16} /> {STORE.phone}</a>
          <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noopener noreferrer"><Mail size={16} /> Message on WhatsApp</a>
          <p><MapPin size={16} /> {STORE.address}</p>
        </div>
        <div className="account-card">
          {sent ? (
            <p className="lead" style={{ color: 'var(--color-basil)' }}>Thanks — we’ll get back to you soon.</p>
          ) : (
            <form className="form-grid" onSubmit={submit} noValidate>
              <label className="field"><span className="field__label">Name</span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label className="field"><span className="field__label">Email</span>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} inputMode="email" /></label>
              <label className="field"><span className="field__label">Message</span>
                <input value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
              <input type="text" tabIndex={-1} aria-hidden autoComplete="off" value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })} style={{ position: 'absolute', left: '-9999px' }} />
              {err && <span className="field__err">{err}</span>}
              <Button type="submit">Send message</Button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

/* ---------- Delivery Areas ---------- */
export function DeliveryAreas() {
  const [pc, setPc] = useState('')
  const result = pc.trim() ? checkDeliveryArea(pc) : undefined
  return (
    <main className="container info">
      <PageHead eyebrow="Where we deliver" title="Delivery areas" lead="Pop in your postcode to check." />
      <div className="account-card" style={{ maxWidth: 460, marginBottom: 'var(--space-8)' }}>
        <label className="field">
          <span className="field__label">Postcode</span>
          <input value={pc} onChange={(e) => setPc(e.target.value.toUpperCase())} placeholder="e.g. E1 6QL" />
        </label>
        {result && (
          <p className={result.ok ? 'zone-ok' : 'zone-bad'} style={{ marginTop: 'var(--space-3)' }}>
            {result.ok
              ? `✓ We deliver to ${result.zone.area} — fee ${formatMoney(result.zone.fee)}, min ${formatMoney(result.zone.minOrder)}`
              : result.reason}
          </p>
        )}
      </div>
      <ul className="zone-list">
        {ZONES.filter((z) => z.active).map((z) => (
          <li key={z.postcodePrefix}>
            <strong>{z.postcodePrefix}</strong> {z.area}
            <span className="tnum">{formatMoney(z.fee)} · min {formatMoney(z.minOrder)}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}

/* ---------- Opening Hours ---------- */
export function Hours() {
  const status = getStoreStatus()
  const today = new Date().getDay()
  return (
    <main className="container info">
      <PageHead eyebrow="When we’re open" title="Opening hours" />
      <p className={`hours-status ${status.open ? 'is-open' : 'is-closed'}`}>
        <Clock size={16} /> {status.open ? 'Open now' : 'Closed'} · {status.label}
      </p>
      <ul className="hours-list">
        {OPENING_HOURS.map((h) => (
          <li key={h.day} className={h.day === today ? 'is-today' : ''}>
            <span>{DAY_NAMES[h.day]}</span>
            <span className="tnum">{h.closed ? 'Closed' : `${h.open} – ${h.close}`}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}

/* ---------- Reviews ---------- */
export function Reviews() {
  const avg = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1)
  return (
    <main className="container info">
      <PageHead eyebrow="What people say" title="Reviews" />
      <div className="reviews-summary">
        <span className="reviews-summary__avg tnum">{avg}</span>
        <span className="reviews-summary__stars">{'★'.repeat(5)}</span>
        <span className="reviews-summary__count">{REVIEWS.length} reviews</span>
      </div>
      <div className="reviews-grid">
        {REVIEWS.map((r) => (
          <article key={r.id} className="review-card">
            <div className="review-card__stars" aria-label={`${r.rating} out of 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill={i < r.rating ? 'currentColor' : 'none'} />
              ))}
            </div>
            <p className="review-card__body">“{r.body}”</p>
            <p className="review-card__meta">
              <strong>{r.author}</strong>{r.dish ? ` · ${r.dish}` : ''} · {new Date(r.date).toLocaleDateString()}
            </p>
          </article>
        ))}
      </div>
    </main>
  )
}

/* ---------- FAQ ---------- */
export function Faq() {
  const [open, setOpen] = useState<string>()
  const categories = [...new Set(FAQS.map((f) => f.category))]
  return (
    <main className="container info info--narrow">
      <PageHead eyebrow="Questions" title="FAQ" />
      {categories.map((cat) => (
        <section key={cat} className="faq-section">
          <h2 className="faq-cat">{cat}</h2>
          {FAQS.filter((f) => f.category === cat).map((f) => {
            const id = f.q
            const isOpen = open === id
            return (
              <div key={id} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
                <button className="faq-q" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? undefined : id)}>
                  {f.q}<span className="faq-q__icon">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && <p className="faq-a">{f.a}</p>}
              </div>
            )
          })}
        </section>
      ))}
    </main>
  )
}

/* ---------- Legal (Terms / Privacy) ---------- */
function Legal({ title, intro, sections }: { title: string; intro: string; sections: { h: string; p: string }[] }) {
  return (
    <main className="container info info--narrow">
      <PageHead eyebrow="Legal" title={title} />
      <div className="info-prose">
        <p>{intro}</p>
        {sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            <p>{s.p}</p>
          </section>
        ))}
        <p className="account-fine">Last updated 1 June 2026.</p>
      </div>
    </main>
  )
}

export function Terms() {
  return (
    <Legal
      title="Terms & Conditions"
      intro="These terms govern your use of the Forno ordering service. By placing an order you accept them."
      sections={[
        { h: 'Orders', p: 'Orders are confirmed once we accept them via WhatsApp. Prices include VAT. We may refuse or cancel an order and refund you in full.' },
        { h: 'Delivery', p: 'Estimated times are guidance, not guarantees. We deliver only to areas listed on our Delivery Areas page.' },
        { h: 'Allergies', p: 'Allergen information is provided per product. Our kitchen handles gluten, dairy and nuts; we cannot guarantee zero cross-contamination.' },
        { h: 'Payment', p: 'Payment is taken at checkout or on collection per the method you choose. Card processing is handled by our payment provider.' },
      ]}
    />
  )
}

export function Privacy() {
  return (
    <Legal
      title="Privacy Policy"
      intro="We respect your privacy and collect only what we need to take and deliver your order."
      sections={[
        { h: 'What we collect', p: 'Your name, phone, delivery address and order details. We do not store card numbers.' },
        { h: 'How we use it', p: 'To process, deliver and support your order, and — only if you opt in — to send offers.' },
        { h: 'Sharing', p: 'We share order details with our kitchen and delivery riders. We never sell your data.' },
        { h: 'Your rights', p: 'You can ask us to access or delete your data at any time via the contact page.' },
      ]}
    />
  )
}

/* ---------- Offers & Coupons ---------- */
export function Offers() {
  const [copied, setCopied] = useState<string>()
  function copy(code: string) {
    navigator.clipboard?.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(undefined), 1500)
  }
  return (
    <main className="container info">
      <PageHead eyebrow="Save more" title="Offers & coupons" lead="Tap a code to copy, then paste it in your cart." />
      <div className="offers-grid">
        {COUPONS.filter((c) => c.active).map((c) => (
          <article key={c.code} className="offer-card">
            <div className="offer-card__value">
              {c.type === 'percent' ? `${c.value}% off` : `${formatMoney(c.value)} off`}
            </div>
            <p className="offer-card__desc">{c.description}</p>
            <button className="offer-card__code" onClick={() => copy(c.code)}>
              {copied === c.code ? 'Copied!' : c.code}
            </button>
          </article>
        ))}
      </div>
    </main>
  )
}
