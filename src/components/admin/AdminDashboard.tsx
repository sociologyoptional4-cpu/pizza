/* Admin shell — sidebar + 18 panels. Lazy-loaded as its own bundle at /admin.
   Panels read from repositories/stores; settings/banners/staff write via adminStore. */
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3, ChefHat, ClipboardList, Clock, FileText, Gift, LayoutDashboard,
  MapPin, MessageCircle, Percent, Pizza, Ruler, ShoppingBag, Star, Store,
  Tags, Users, UserCog, WalletCards,
} from 'lucide-react'
import { STORE } from '../../data/catalog'
import { DashboardPanel, AnalyticsPanel, ReportsPanel } from './panels/Overview'
import {
  OrdersPanel, ProductsPanel, SizesPanel, ToppingsPanel, DealsPanel, CouponsPanel,
  ZonesPanel, HoursPanel, CustomersPanel, ReviewsPanel,
} from './panels/DataPanels'
import {
  StoreSettingsPanel, WhatsappSettingsPanel, PaymentSettingsPanel, BannersPanel, StaffPanel,
} from './panels/SettingsPanels'
import './admin.css'

type Entry = { id: string; label: string; icon: typeof LayoutDashboard; render: () => ReactNode }

const PANELS: Entry[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, render: () => <DashboardPanel /> },
  { id: 'orders', label: 'Orders', icon: ClipboardList, render: () => <OrdersPanel /> },
  { id: 'products', label: 'Products', icon: Pizza, render: () => <ProductsPanel /> },
  { id: 'sizes', label: 'Pizza sizes', icon: Ruler, render: () => <SizesPanel /> },
  { id: 'toppings', label: 'Toppings', icon: ChefHat, render: () => <ToppingsPanel /> },
  { id: 'deals', label: 'Deals', icon: Gift, render: () => <DealsPanel /> },
  { id: 'coupons', label: 'Coupons', icon: Percent, render: () => <CouponsPanel /> },
  { id: 'zones', label: 'Delivery areas', icon: MapPin, render: () => <ZonesPanel /> },
  { id: 'hours', label: 'Opening hours', icon: Clock, render: () => <HoursPanel /> },
  { id: 'customers', label: 'Customers', icon: Users, render: () => <CustomersPanel /> },
  { id: 'reviews', label: 'Reviews', icon: Star, render: () => <ReviewsPanel /> },
  { id: 'banners', label: 'Banners', icon: Tags, render: () => <BannersPanel /> },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, render: () => <WhatsappSettingsPanel /> },
  { id: 'payment', label: 'Payments', icon: WalletCards, render: () => <PaymentSettingsPanel /> },
  { id: 'store', label: 'Store settings', icon: Store, render: () => <StoreSettingsPanel /> },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, render: () => <AnalyticsPanel /> },
  { id: 'reports', label: 'Reports', icon: FileText, render: () => <ReportsPanel /> },
  { id: 'staff', label: 'Staff access', icon: UserCog, render: () => <StaffPanel /> },
]

export default function AdminDashboard() {
  const [active, setActive] = useState('dashboard')
  const current = PANELS.find((p) => p.id === active) ?? PANELS[0]

  return (
    <div className="admin">
      <nav className="admin-side" aria-label="Admin sections">
        <div className="admin-side__brand">
          {STORE.name} <small>Admin</small>
        </div>
        {PANELS.map((p) => {
          const Icon = p.icon
          return (
            <button
              key={p.id}
              className={`admin-nav-btn ${active === p.id ? 'is-active' : ''}`}
              onClick={() => setActive(p.id)}
            >
              <Icon size={16} /> {p.label}
            </button>
          )
        })}
        <div className="admin-side__foot">
          <Link to="/" className="admin-nav-btn">
            <ShoppingBag size={16} /> Back to store
          </Link>
        </div>
      </nav>

      <main className="admin-main">{current.render()}</main>
    </div>
  )
}
