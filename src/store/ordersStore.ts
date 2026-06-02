/* Placed orders — persisted for Track Order, confirmation reload, and order history. */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Order } from '../data/types'

type OrdersState = {
  orders: Order[]
  place: (order: Order) => void
  getByNumber: (num: string) => Order | undefined
  latest: () => Order | undefined
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      place: (order) => set((s) => ({ orders: [order, ...s.orders].slice(0, 50) })),
      getByNumber: (num) => get().orders.find((o) => o.number === num),
      latest: () => get().orders[0],
    }),
    { name: 'forno-orders' },
  ),
)
