/* Cart store — persisted to localStorage. Holds lines, fulfilment, applied coupon. */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartLine, Fulfilment, PizzaDraft } from '../data/types'
import { computePrice } from '../lib/pricing'
import { draftKey } from '../lib/draft'

function lineFromDraft(draft: PizzaDraft): CartLine {
  const price = computePrice(draft)
  return { key: draftKey(draft), draft, unitPrice: price.unitPrice, lineTotal: price.total }
}

type CartState = {
  lines: CartLine[]
  fulfilment: Fulfilment
  couponCode?: string
  addDraft: (draft: PizzaDraft) => void
  updateDraft: (key: string, draft: PizzaDraft) => void
  duplicate: (key: string) => void
  setQuantity: (key: string, quantity: number) => void
  remove: (key: string) => void
  clear: () => void
  setFulfilment: (f: Fulfilment) => void
  setCoupon: (code?: string) => void
  itemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      fulfilment: 'Delivery',
      couponCode: undefined,

      addDraft: (draft) =>
        set((state) => {
          const incoming = lineFromDraft(draft)
          const existing = state.lines.find((l) => l.key === incoming.key)
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.key === incoming.key ? rebuild(l, l.draft.quantity + draft.quantity) : l,
              ),
            }
          }
          return { lines: [...state.lines, incoming] }
        }),

      updateDraft: (key, draft) =>
        set((state) => ({
          lines: state.lines.map((l) => (l.key === key ? lineFromDraft(draft) : l)),
        })),

      duplicate: (key) =>
        set((state) => {
          const target = state.lines.find((l) => l.key === key)
          if (!target) return state
          return { lines: [...state.lines, rebuild(target, target.draft.quantity)] }
        }),

      setQuantity: (key, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (l.key === key ? rebuild(l, Math.max(0, quantity)) : l))
            .filter((l) => l.draft.quantity > 0),
        })),

      remove: (key) => set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [], couponCode: undefined }),
      setFulfilment: (fulfilment) => set({ fulfilment }),
      setCoupon: (couponCode) => set({ couponCode }),
      itemCount: () => get().lines.reduce((n, l) => n + l.draft.quantity, 0),
    }),
    { name: 'forno-cart' },
  ),
)

function rebuild(line: CartLine, quantity: number): CartLine {
  return lineFromDraft({ ...line.draft, quantity })
}
