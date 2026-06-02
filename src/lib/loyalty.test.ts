import { describe, expect, test } from 'vitest'
import { pointsFromOrders, tierForPoints, nextTier, tierProgress } from './loyalty'
import type { Order } from '../data/types'

function order(total: number): Order {
  return {
    id: 'x', number: 'FRN', createdAt: '2026-06-02T00:00:00Z', type: 'Delivery', lines: [],
    customer: { name: 'A', phone: '1' }, timing: { mode: 'asap', etaMinutes: 35 }, payment: 'Cash',
    options: { contactless: false, cutlery: false },
    totals: { subtotal: total, discount: 0, deliveryFee: 0, serviceCharge: 0, total },
    stage: 'received',
  }
}

describe('pointsFromOrders', () => {
  test('1 point per pound, floored', () => {
    expect(pointsFromOrders([order(25.5), order(13.9)])).toBe(39)
  })
  test('empty is zero', () => {
    expect(pointsFromOrders([])).toBe(0)
  })
})

describe('tiers', () => {
  test('tierForPoints picks highest reached', () => {
    expect(tierForPoints(0).name).toBe('Dough')
    expect(tierForPoints(150).name).toBe('Bronze')
    expect(tierForPoints(350).name).toBe('Silver')
    expect(tierForPoints(700).name).toBe('Gold')
  })
  test('nextTier returns the upcoming one, undefined at top', () => {
    expect(nextTier(50)?.name).toBe('Bronze')
    expect(nextTier(700)).toBeUndefined()
  })
  test('tierProgress is fraction toward next, 1 at top', () => {
    expect(tierProgress(200)).toBeCloseTo(0.5) // Bronze(100)->Silver(300), 100/200
    expect(tierProgress(700)).toBe(1)
  })
})
