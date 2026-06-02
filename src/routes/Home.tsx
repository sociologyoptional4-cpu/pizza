import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { menuRepository } from '../data/repository'
import { getStoreStatus } from '../lib/storeStatus'
import { HERO_SLIDES, photo } from '../data/images'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { ProductGrid } from '../components/menu/ProductGrid'
import { DealCard } from '../components/menu/DealCard'
import { Button } from '../components/ui/Button'
import '../components/menu/deal.css'
import './home.css'

const NAV_LINKS = [
  { to: '/menu', label: 'Full menu' },
  { to: '/menu/pizza', label: 'Pizzas' },
  { to: '/deals', label: 'Deals' },
  { to: '/half-and-half', label: 'Half & half' },
  { to: '/vegetarian', label: 'Vegetarian' },
  { to: '/halal', label: 'Halal' },
  { to: '/spicy', label: '🌶️ Spicy' },
  { to: '/kids', label: 'Kids' },
  { to: '/sides', label: 'Sides' },
  { to: '/drinks', label: 'Drinks' },
  { to: '/desserts', label: 'Desserts' },
  { to: '/catering', label: 'Catering' },
]

export function Home() {
  const products = menuRepository.getProducts()
  const pizzas = products.filter((p) => p.customizable)
  const extras = products.filter((p) => !p.customizable && p.category !== 'Kids')
  const deals = menuRepository.getDeals().slice(0, 3)
  const status = getStoreStatus()
  const reduced = useReducedMotion()
  const [slide, setSlide] = useState(0)
  const active = HERO_SLIDES[slide]

  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5000)
    return () => clearInterval(id)
  }, [reduced])

  return (
    <main>
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero__copy">
          <p className="eyebrow">Wood-fired · {status.open ? 'Open now' : status.label}</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 id="hero-heading" className="hero__title">
                {active.title}
              </h1>
              <p className="lead hero__lead">{active.sub}</p>
            </motion.div>
          </AnimatePresence>
          <div className="hero__cta">
            <Link to="/builder">
              <Button size="lg">
                Build your pizza <ArrowRight size={18} />
              </Button>
            </Link>
            <a href="#menu">
              <Button variant="ghost" size="lg">
                See the menu
              </Button>
            </a>
          </div>
          <div className="hero__dots" role="tablist" aria-label="Hero slides">
            {HERO_SLIDES.map((s, i) => (
              <button
                key={s.key}
                className={`hero__dot ${i === slide ? 'is-active' : ''}`}
                aria-label={`Slide ${i + 1}`}
                aria-selected={i === slide}
                role="tab"
                onClick={() => setSlide(i)}
              />
            ))}
          </div>
        </div>
        <div className="hero__visual">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={slide}
              src={active.image ?? photo(active.key)}
              alt={active.title}
              fetchPriority="high"
              width={620}
              height={620}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.06, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </AnimatePresence>
        </div>
      </section>

      <nav className="home-nav container" aria-label="Menu categories">
        {NAV_LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="home-nav__chip">
            {l.label}
          </Link>
        ))}
      </nav>

      <section className="home-section container" aria-labelledby="deals-h">
        <header className="home-section__head home-section__head--row">
          <h2 id="deals-h">Deals &amp; combos</h2>
          <Link to="/deals" className="eyebrow">
            All deals →
          </Link>
        </header>
        <div className="deals-grid">
          {deals.map((d) => (
            <DealCard key={d.id} deal={d} />
          ))}
        </div>
      </section>

      <section id="menu" className="home-section container" aria-labelledby="signature">
        <header className="home-section__head">
          <h2 id="signature">Signature pizzas</h2>
          <p className="lead">Tap any pizza to size, top and make it yours.</p>
        </header>
        <ProductGrid products={pizzas} />
      </section>

      <section className="home-section container" aria-labelledby="extras">
        <header className="home-section__head">
          <h2 id="extras">Sides, drinks &amp; sweets</h2>
        </header>
        <ProductGrid products={extras} />
      </section>
    </main>
  )
}
