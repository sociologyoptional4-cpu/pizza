/* Admin-editable overlays on top of repository data. Persisted. The storefront reads
   STORE/etc directly today; in production these writes would hit the same backend the
   repositories read from. Here they persist locally to demonstrate the admin surface. */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORE } from '../data/catalog'
import type { StoreSettings } from '../data/types'

export type Banner = { id: string; text: string; active: boolean }
export type Staff = { id: string; name: string; role: 'Owner' | 'Manager' | 'Kitchen' | 'Driver' }

type AdminState = {
  settings: StoreSettings
  payments: Record<string, boolean>
  whatsappTemplate: string
  banners: Banner[]
  staff: Staff[]
  unavailable: string[] // product ids toggled off
  hiddenReviews: string[]

  updateSettings: (patch: Partial<StoreSettings>) => void
  togglePayment: (method: string) => void
  setWhatsappTemplate: (t: string) => void
  addBanner: (text: string) => void
  removeBanner: (id: string) => void
  toggleBanner: (id: string) => void
  toggleAvailable: (productId: string) => void
  toggleReview: (id: string) => void
  addStaff: (name: string, role: Staff['role']) => void
  removeStaff: (id: string) => void
}

const DEFAULT_PAYMENTS = {
  Cash: true,
  Card: true,
  'Apple Pay': true,
  'Google Pay': true,
  'Pay by link': false,
  'Pay on collection': true,
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      settings: { ...STORE },
      payments: { ...DEFAULT_PAYMENTS },
      whatsappTemplate: '🍕 New order {number} — {type}. Total {total}.',
      banners: [{ id: 'b1', text: 'Free delivery over £25', active: true }],
      staff: [
        { id: 's1', name: 'Marco Rossi', role: 'Owner' },
        { id: 's2', name: 'Lena Ortiz', role: 'Manager' },
      ],
      unavailable: [],
      hiddenReviews: [],

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      togglePayment: (m) => set((s) => ({ payments: { ...s.payments, [m]: !s.payments[m] } })),
      setWhatsappTemplate: (whatsappTemplate) => set({ whatsappTemplate }),
      addBanner: (text) =>
        set((s) => ({ banners: [...s.banners, { id: `b-${Date.now()}`, text, active: true }] })),
      removeBanner: (id) => set((s) => ({ banners: s.banners.filter((b) => b.id !== id) })),
      toggleBanner: (id) =>
        set((s) => ({ banners: s.banners.map((b) => (b.id === id ? { ...b, active: !b.active } : b)) })),
      toggleAvailable: (id) =>
        set((s) => ({
          unavailable: s.unavailable.includes(id)
            ? s.unavailable.filter((x) => x !== id)
            : [...s.unavailable, id],
        })),
      toggleReview: (id) =>
        set((s) => ({
          hiddenReviews: s.hiddenReviews.includes(id)
            ? s.hiddenReviews.filter((x) => x !== id)
            : [...s.hiddenReviews, id],
        })),
      addStaff: (name, role) =>
        set((s) => ({ staff: [...s.staff, { id: `st-${Date.now()}`, name, role }] })),
      removeStaff: (id) => set((s) => ({ staff: s.staff.filter((x) => x.id !== id) })),
    }),
    { name: 'forno-admin' },
  ),
)
