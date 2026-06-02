/* Route table — all 35 pages. Real pages replace placeholders in later phases.
   Admin bundle is lazy-loaded. */
import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Layout } from './Layout'
import { PagePlaceholder } from '../routes/PagePlaceholder'
import { Home } from '../routes/Home'
import { BuilderPage } from '../routes/BuilderPage'

// Lazy: only Home (+ the always-mounted builder/cart in Layout) ship in the landing bundle.
const named = (p: Promise<Record<string, unknown>>, key: string) =>
  p.then((m) => ({ default: m[key] as React.ComponentType }))

const AdminDashboard = lazy(() => import('../components/admin/AdminDashboard'))
const LegacyHome = lazy(() => import('../App'))
const CartPage = lazy(() => named(import('../routes/CartPage'), 'CartPage'))
const Checkout = lazy(() => named(import('../routes/Checkout'), 'Checkout'))
const OrderConfirmation = lazy(() => named(import('../routes/OrderConfirmation'), 'OrderConfirmation'))
const TrackOrder = lazy(() => named(import('../routes/TrackOrder'), 'TrackOrder'))
const HalfAndHalf = lazy(() => named(import('../routes/HalfAndHalf'), 'HalfAndHalf'))

const FullMenu = lazy(() => named(import('../routes/menus'), 'FullMenu'))
const PizzaMenu = lazy(() => named(import('../routes/menus'), 'PizzaMenu'))
const VegetarianMenu = lazy(() => named(import('../routes/menus'), 'VegetarianMenu'))
const HalalMenu = lazy(() => named(import('../routes/menus'), 'HalalMenu'))
const SpicyMenu = lazy(() => named(import('../routes/menus'), 'SpicyMenu'))
const KidsMeals = lazy(() => named(import('../routes/menus'), 'KidsMeals'))
const Sides = lazy(() => named(import('../routes/menus'), 'Sides'))
const Drinks = lazy(() => named(import('../routes/menus'), 'Drinks'))
const Desserts = lazy(() => named(import('../routes/menus'), 'Desserts'))
const DealsCombos = lazy(() => named(import('../routes/Deals'), 'DealsCombos'))
const MealDeals = lazy(() => named(import('../routes/Deals'), 'MealDeals'))
const Catering = lazy(() => named(import('../routes/Catering'), 'Catering'))
const Login = lazy(() => named(import('../routes/Account'), 'Login'))
const AccountHome = lazy(() => named(import('../routes/Account'), 'AccountHome'))
const PreviousOrders = lazy(() => named(import('../routes/Account'), 'PreviousOrders'))
const Reorder = lazy(() => named(import('../routes/Account'), 'Reorder'))
const Loyalty = lazy(() => named(import('../routes/Account'), 'Loyalty'))
const About = lazy(() => named(import('../routes/Info'), 'About'))
const Contact = lazy(() => named(import('../routes/Info'), 'Contact'))
const DeliveryAreas = lazy(() => named(import('../routes/Info'), 'DeliveryAreas'))
const Hours = lazy(() => named(import('../routes/Info'), 'Hours'))
const Reviews = lazy(() => named(import('../routes/Info'), 'Reviews'))
const Faq = lazy(() => named(import('../routes/Info'), 'Faq'))
const Terms = lazy(() => named(import('../routes/Info'), 'Terms'))
const Privacy = lazy(() => named(import('../routes/Info'), 'Privacy'))
const Offers = lazy(() => named(import('../routes/Info'), 'Offers'))

const lazyRoute = (el: React.ReactNode) => (
  <Suspense fallback={<PagePlaceholder title="Loading…" />}>{el}</Suspense>
)

const page = (title: string, note?: string) => <PagePlaceholder title={title} note={note} />

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // Discovery & menu
      { index: true, element: <Home /> },
      { path: 'menu', element: lazyRoute(<FullMenu />) },
      { path: 'menu/pizza', element: lazyRoute(<PizzaMenu />) },
      { path: 'builder', element: <BuilderPage /> },
      { path: 'deals', element: lazyRoute(<DealsCombos />) },
      { path: 'meal-deals', element: lazyRoute(<MealDeals />) },
      { path: 'sides', element: lazyRoute(<Sides />) },
      { path: 'drinks', element: lazyRoute(<Drinks />) },
      { path: 'desserts', element: lazyRoute(<Desserts />) },
      { path: 'kids', element: lazyRoute(<KidsMeals />) },
      { path: 'vegetarian', element: lazyRoute(<VegetarianMenu />) },
      { path: 'halal', element: lazyRoute(<HalalMenu />) },
      { path: 'spicy', element: lazyRoute(<SpicyMenu />) },
      { path: 'create', element: <BuilderPage /> },
      { path: 'half-and-half', element: lazyRoute(<HalfAndHalf />) },
      { path: 'catering', element: lazyRoute(<Catering />) },
      { path: 'offers', element: lazyRoute(<Offers />) },

      // Ordering core
      { path: 'cart', element: lazyRoute(<CartPage />) },
      { path: 'checkout', element: lazyRoute(<Checkout />) },
      { path: 'order-confirmation', element: lazyRoute(<OrderConfirmation />) },
      { path: 'track', element: lazyRoute(<TrackOrder />) },

      // Account
      { path: 'login', element: lazyRoute(<Login />) },
      { path: 'account', element: lazyRoute(<AccountHome />) },
      { path: 'account/orders', element: lazyRoute(<PreviousOrders />) },
      { path: 'account/reorder', element: lazyRoute(<Reorder />) },
      { path: 'rewards', element: lazyRoute(<Loyalty />) },

      // Info & trust
      { path: 'about', element: lazyRoute(<About />) },
      { path: 'contact', element: lazyRoute(<Contact />) },
      { path: 'delivery-areas', element: lazyRoute(<DeliveryAreas />) },
      { path: 'hours', element: lazyRoute(<Hours />) },
      { path: 'reviews', element: lazyRoute(<Reviews />) },
      { path: 'faq', element: lazyRoute(<Faq />) },
      { path: 'terms', element: lazyRoute(<Terms />) },
      { path: 'privacy', element: lazyRoute(<Privacy />) },

      // Legacy reference (the original single-file design)
      {
        path: 'legacy',
        element: (
          <Suspense fallback={<PagePlaceholder title="Loading…" />}>
            <LegacyHome />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <Suspense fallback={<PagePlaceholder title="Admin" note="Loading dashboard…" />}>
        <AdminDashboard />
      </Suspense>
    ),
  },
  { path: '*', element: <Layout />, children: [{ index: true, element: page('Not found', 'That page doesn’t exist.') }] },
])
