/* Pure analytics derived from placed orders. Testable. */
import type { CartLine, Order } from '../data/types'
import { menuRepository } from '../data/repository'

export type DayBucket = { label: string; revenue: number; orders: number }

export function isToday(iso: string, now: Date = new Date()): boolean {
  const d = new Date(iso)
  return d.toDateString() === now.toDateString()
}

export type Kpis = {
  ordersToday: number
  revenueToday: number
  revenueTotal: number
  avgOrder: number
  orderCount: number
}

export function computeKpis(orders: Order[], now: Date = new Date()): Kpis {
  const revenueTotal = orders.reduce((s, o) => s + o.totals.total, 0)
  const today = orders.filter((o) => isToday(o.createdAt, now))
  return {
    ordersToday: today.length,
    revenueToday: round2(today.reduce((s, o) => s + o.totals.total, 0)),
    revenueTotal: round2(revenueTotal),
    avgOrder: orders.length ? round2(revenueTotal / orders.length) : 0,
    orderCount: orders.length,
  }
}

/** Revenue + order count per day for the last `days` days, oldest→newest. */
export function revenueByDay(orders: Order[], days = 7, now: Date = new Date()): DayBucket[] {
  const buckets: DayBucket[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const label = d.toLocaleDateString(undefined, { weekday: 'short' })
    const dayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === d.toDateString())
    buckets.push({
      label,
      revenue: round2(dayOrders.reduce((s, o) => s + o.totals.total, 0)),
      orders: dayOrders.length,
    })
  }
  return buckets
}

export function ordersByType(orders: Order[]): Record<string, number> {
  return orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.type] = (acc[o.type] ?? 0) + 1
    return acc
  }, {})
}

export type TopItem = { name: string; count: number }

export function topItems(orders: Order[], limit = 5): TopItem[] {
  const counts = new Map<string, number>()
  const lines: CartLine[] = orders.flatMap((o) => o.lines)
  for (const l of lines) {
    const name = menuRepository.getProduct(l.draft.productId)?.name ?? l.draft.productId
    counts.set(name, (counts.get(name) ?? 0) + l.draft.quantity)
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}
