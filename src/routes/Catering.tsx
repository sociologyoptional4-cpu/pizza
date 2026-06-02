/* Catering / party orders — info + party deals + enquiry form (honeypot + validation). */
import { useState } from 'react'
import { menuRepository } from '../data/repository'
import { STORE } from '../data/catalog'
import { DealCard } from '../components/menu/DealCard'
import { Button } from '../components/ui/Button'
import '../components/menu/menu-layout.css'
import '../components/menu/deal.css'
import '../components/checkout/checkout.css'

type Errors = Partial<Record<'name' | 'phone' | 'date' | 'guests', string>>

export function Catering() {
  const partyDeals = menuRepository.getDeals().filter((d) => (d.serves ?? 0) >= 4)
  const [form, setForm] = useState({ name: '', phone: '', date: '', guests: '', message: '', website: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (form.website) return // honeypot tripped — silently drop
    const next: Errors = {}
    if (form.name.trim().length < 2) next.name = 'Enter your name'
    if (!/^[+\d][\d\s()-]{7,}$/.test(form.phone.trim())) next.phone = 'Enter a valid phone'
    if (!form.date) next.date = 'Pick a date'
    if (!form.guests || Number(form.guests) < 1) next.guests = 'How many guests?'
    setErrors(next)
    if (Object.keys(next).length === 0) setSent(true)
  }

  const waLink = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(
    `Catering enquiry from ${form.name} (${form.phone}) — ${form.guests} guests on ${form.date}. ${form.message}`,
  )}`

  return (
    <main className="container menu-page">
      <header className="menu-page__head">
        <p className="eyebrow">Feed the crowd</p>
        <h1>Catering &amp; party orders</h1>
        <p className="lead">From office lunches to birthday blowouts — wood-fired pizza by the dozen, delivered hot.</p>
      </header>

      <section style={{ marginBottom: 'var(--space-section)' }}>
        <h2 style={{ fontSize: 'var(--text-h3)', marginBottom: 'var(--space-5)' }}>Party deals</h2>
        <div className="deals-grid">
          {partyDeals.map((d) => (
            <DealCard key={d.id} deal={d} />
          ))}
        </div>
      </section>

      <section className="checkout__panel" style={{ maxWidth: 560 }}>
        <h2 className="checkout__title">Request a quote</h2>
        {sent ? (
          <div>
            <p className="lead" style={{ color: 'var(--color-basil)' }}>Thanks {form.name.split(' ')[0]} — we’ll be in touch shortly.</p>
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <Button>Send on WhatsApp now</Button>
            </a>
          </div>
        ) : (
          <form className="form-grid" onSubmit={submit} noValidate>
            <label className="field">
              <span className="field__label">Name</span>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
              {errors.name && <span className="field__err">{errors.name}</span>}
            </label>
            <label className="field">
              <span className="field__label">Phone</span>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} inputMode="tel" />
              {errors.phone && <span className="field__err">{errors.phone}</span>}
            </label>
            <label className="field">
              <span className="field__label">Date</span>
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
              {errors.date && <span className="field__err">{errors.date}</span>}
            </label>
            <label className="field">
              <span className="field__label">Guests</span>
              <input type="number" min={1} value={form.guests} onChange={(e) => set('guests', e.target.value)} />
              {errors.guests && <span className="field__err">{errors.guests}</span>}
            </label>
            <label className="field">
              <span className="field__label">Anything else?</span>
              <input value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="Dietary needs, theme, timing…" />
            </label>
            {/* honeypot — hidden from humans, bots fill it */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => set('website', e.target.value)}
              style={{ position: 'absolute', left: '-9999px' }}
              aria-hidden
            />
            <Button type="submit" size="lg">Request quote</Button>
          </form>
        )}
      </section>
    </main>
  )
}
