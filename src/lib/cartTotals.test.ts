import { describe, expect, test } from 'vitest'
import { computeTotals, subtotalOf, validateCoupon } from './cartTotals'
import { createDraft } from './draft'
import { computePrice } from './pricing'
import type { CartLine, PizzaDraft } from '../data/types'

function line(productId: string, quantity = 1, patch: Partial<PizzaDraft> = {}): CartLine {
  const draft: PizzaDraft = { ...createDraft(productId), quantity, ...patch }
  const price = computePrice(draft)
  return { key: productId, draft, unitPrice: price.unitPrice, lineTotal: price.total }
}

describe('subtotalOf', () => {
  test('sums line totals', () => {
    expect(subtotalOf([line('margherita'), line('diavola')])).toBe(20.4) // 8.5 + 11.9
  })
})

describe('validateCoupon', () => {
  test('applies percent discount above min order', () => {
    const result = validateCoupon('FORNO10', 20) // 10% of 20
    expect(result).toEqual({ ok: true, coupon: expect.anything(), discount: 2 })
  })

  test('rejects below min order', () => {
    const result = validateCoupon('FORNO10', 10)
    expect(result.ok).toBe(false)
  })

  test('rejects unknown coupon', () => {
    expect(validateCoupon('NOPE', 100).ok).toBe(false)
  })

  test('fixed coupon never exceeds subtotal', () => {
    const result = validateCoupon('FREEDEL', 12)
    expect(result.ok && result.discount).toBe(2.5)
  })
})

describe('computeTotals', () => {
  test('charges delivery fee below free-delivery threshold on delivery', () => {
    const totals = computeTotals([line('diavola')], 'Delivery') // 11.9 < 25
    expect(totals.deliveryFee).toBe(2.5)
    expect(totals.qualifiesFreeDelivery).toBe(false)
    expect(totals.amountToFreeDelivery).toBe(13.1)
    expect(totals.total).toBe(14.4)
  })

  test('free delivery at or above threshold', () => {
    const totals = computeTotals([line('margherita', 3)], 'Delivery') // 25.5 >= 25
    expect(totals.deliveryFee).toBe(0)
    expect(totals.qualifiesFreeDelivery).toBe(true)
  })

  test('collection never charges delivery', () => {
    const totals = computeTotals([line('diavola')], 'Collection')
    expect(totals.deliveryFee).toBe(0)
  })

  test('applies coupon discount to total', () => {
    const totals = computeTotals([line('margherita', 3)], 'Collection', 'FORNO10') // 25.5, -10%
    expect(totals.discount).toBe(2.55)
    expect(totals.total).toBe(22.95)
  })

  test('flags min order not met', () => {
    expect(computeTotals([line('cola')], 'Delivery').meetsMinOrder).toBe(false)
  })
})
