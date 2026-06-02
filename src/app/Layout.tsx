/* App shell. Minimal header/footer scaffold for Phase 1 — full header lands in Phase 4.
   Hosts the cart drawer mount point + scroll-to-top on route change. */
import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { ShoppingBag, User } from 'lucide-react'
import { STORE } from '../data/catalog'
import { getStoreStatus } from '../lib/storeStatus'
import { useCartStore } from '../store/cartStore'
import { useUIStore } from '../store/uiStore'
import { CART_PILL_ID } from './domIds'
import { BuilderSheet } from '../components/builder/BuilderSheet'
import { CartDrawer } from '../components/cart/CartDrawer'
import { FlightLayer } from '../components/cart/FlightLayer'
import { AfterAddUpsell } from '../components/upsell/AfterAddUpsell'
import './layout.css'

export function Layout() {
  const { pathname } = useLocation()
  const count = useCartStore((s) => s.lines.reduce((n, l) => n + l.draft.quantity, 0))
  const openCart = useUIStore((s) => s.openCart)
  const status = getStoreStatus()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="app-header">
        <div className="container app-header__inner">
          <Link to="/" className="app-header__logo">
            🍕 {STORE.name}
          </Link>
          <span className={`status-pill ${status.open ? 'is-open' : 'is-closed'}`}>
            <span className="status-dot" /> {status.open ? 'Open now' : 'Closed'} · {status.label}
          </span>
          <Link to="/account" className="account-link" aria-label="Your account">
            <User size={18} />
          </Link>
          <button id={CART_PILL_ID} className="cart-pill" onClick={openCart} aria-label={`Open cart, ${count} items`}>
            <ShoppingBag size={18} />
            {count > 0 && <span className="cart-pill__count tnum">{count}</span>}
          </button>
        </div>
      </header>

      <div id="main">
        <Outlet />
      </div>

      <footer className="app-footer">
        <div className="container">
          <nav className="app-footer__links" aria-label="Footer">
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/delivery-areas">Delivery areas</Link>
            <Link to="/hours">Opening hours</Link>
            <Link to="/reviews">Reviews</Link>
            <Link to="/offers">Offers</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
          </nav>
          <p>
            {STORE.name} · {STORE.address} · {STORE.phone}
          </p>
          <p className="app-footer__dim">Order via WhatsApp · Delivery &amp; Collection</p>
        </div>
      </footer>

      <BuilderSheet />
      <CartDrawer />
      <AfterAddUpsell />
      <FlightLayer />
    </>
  )
}
