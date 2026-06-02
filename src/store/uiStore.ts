/* Transient UI state: cart drawer + builder sheet + pizza-to-cart flight + after-add upsell. */
import { create } from 'zustand'
import type { Order, PizzaDraft } from '../data/types'

export type FlightPayload = { image: string; from: { x: number; y: number; w: number; h: number } }

type UIState = {
  cartOpen: boolean
  openCart: () => void
  closeCart: () => void

  // builder sheet: a fresh product id, or an existing cart line being edited
  builder?: { productId: string; editKey?: string; initialDraft?: PizzaDraft }
  openBuilder: (productId: string, editKey?: string, initialDraft?: PizzaDraft) => void
  closeBuilder: () => void

  // pizza-to-cart flight animation
  flight?: FlightPayload
  triggerFlight: (payload: FlightPayload) => void
  clearFlight: () => void

  // after-add upsell prompt (the just-added product context)
  upsellFor?: string
  showUpsell: (productId: string) => void
  hideUpsell: () => void

  lastOrder?: Order
  setLastOrder: (order: Order) => void
}

export const useUIStore = create<UIState>()((set) => ({
  cartOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),

  builder: undefined,
  openBuilder: (productId, editKey, initialDraft) =>
    set({ builder: { productId, editKey, initialDraft } }),
  closeBuilder: () => set({ builder: undefined }),

  flight: undefined,
  triggerFlight: (flight) => set({ flight }),
  clearFlight: () => set({ flight: undefined }),

  upsellFor: undefined,
  showUpsell: (upsellFor) => set({ upsellFor }),
  hideUpsell: () => set({ upsellFor: undefined }),

  lastOrder: undefined,
  setLastOrder: (lastOrder) => set({ lastOrder }),
}))
