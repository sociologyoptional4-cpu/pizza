import { describe, expect, test } from 'vitest'
import { computeKpis, isToday, ordersByType, revenueByDay, topItems } from './analytics'
import { createDraft } from './draft'
import { computePrice } from './pricing'
import type { CartLine, Order, OrderType, PizzaDraft } from '../data/types'

function line(productId: string, quantity = 1): CartLine {
  const draft: PizzaDraft = { ...createDraft(productId), quantity }
  const price = computePrice(draft)
  return { key: productId + quantity, draft, unitPrice: price.unitPrice, lineTotal: price.total }
}

function order(total: number, createdAt: string, type: OrderType = 'Delivery', lines: CartLine[] = []): Order {
  return {
    id: Math.random().toString(), number: 'FRN', createdAt, type, lines,
    customer: { name: 'A', phone: '1' }, timing: { mode: 'asap', etaMinutes: 35 }, payment: 'Cash',
    options: { contactless: false, cutlery: false },
    totals: { subtotal: total, discount: 0, deliveryFee: 0, serviceCharge: 0, total },
    stage: 'received',
  }
}

const now = new Date('2026-06-02T12:00:00')

describe('isToday', () => {
  test('matches same calendar day', () => {
    expect(isToday('2026-06-02T20:00:00', now)).toBe(true)
    expect(isToday('2026-06-01T20:00:00', now)).toBe(false)
  })
})

describe('computeKpis', () => {
  const orders = [
    order(20, '2026-06-02T10:00:00'),
    order(30, '2026-06-02T11:00:00'),
    order(50, '2026-05-30T11:00:00'),
  ]
  test('today revenue and count', () => {
    const k = computeKpis(orders, now)
    expect(k.ordersToday).toBe(2)
    expect(k.revenueToday).toBe(50)
    expect(k.revenueTotal).toBe(100)
    expect(k.avgOrder).toBeCloseTo(33.33)
  })
  test('empty orders are zero', () => {
    expect(computeKpis([], now).avgOrder).toBe(0)
  })
})

describe('revenueByDay', () => {
  test('returns one bucket per day, newest last', () => {
    const buckets = revenueByDay([order(20, '2026-06-02T10:00:00')], 7, now)
    expect(buckets).toHaveLength(7)
    expect(buckets[6].revenue).toBe(20)
    expect(buckets[0].revenue).toBe(0)
  })
})

describe('ordersByType', () => {
  test('counts per type', () => {
    const r = ordersByType([order(1, 'x', 'Delivery'), order(1, 'x', 'Collection'), order(1, 'x', 'Delivery')])
    expect(r.Delivery).toBe(2)
    expect(r.Collection).toBe(1)
  })
})

describe('topItems', () => {
  test('aggregates quantities across orders, sorted desc', () => {
    const orders = [
      order(10, 'x', 'Delivery', [line('margherita', 2)]),
      order(10, 'x', 'Delivery', [line('margherita', 1), line('diavola', 4)]),
    ]
    const top = topItems(orders)
    expect(top[0].name).toBe('Diavola Inferno')
    expect(top[0].count).toBe(4)
    expect(top.find((t) => t.name === 'Margherita Regina')?.count).toBe(3)
  })
})
