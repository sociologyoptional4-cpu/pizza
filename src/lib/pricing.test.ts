import { describe, expect, test } from 'vitest'
import { computePrice } from './pricing'
import { createDraft } from './draft'
import type { PizzaDraft } from '../data/types'

describe('computePrice', () => {
  test('returns base price for a default medium pizza with no extras', () => {
    const draft = createDraft('margherita') // basePrice 8.5, medium factor 1
    const result = computePrice(draft)
    expect(result.base).toBe(8.5)
    expect(result.unitPrice).toBe(8.5)
    expect(result.total).toBe(8.5)
    expect(result.additions).toHaveLength(0)
  })

  test('scales base price by size factor', () => {
    const draft: PizzaDraft = { ...createDraft('margherita'), sizeId: 'large' } // 8.5 * 1.28
    expect(computePrice(draft).base).toBe(10.88)
  })

  test('adds base and crust surcharges', () => {
    const draft: PizzaDraft = {
      ...createDraft('margherita'),
      baseId: 'deep-pan', // +1.5
      crustId: 'stuffed', // +2.5
    }
    const result = computePrice(draft)
    expect(result.additions).toEqual([
      { label: 'Deep pan', amount: 1.5 },
      { label: 'Stuffed crust', amount: 2.5 },
    ])
    expect(result.unitPrice).toBe(12.5) // 8.5 + 1.5 + 2.5
  })

  test('charges added toppings scaled by size', () => {
    const draft: PizzaDraft = {
      ...createDraft('margherita'),
      sizeId: 'large', // factor 1.28
      addedToppings: ['pepperoni'], // 1.8 * 1.28 = 2.304 -> 2.3
    }
    const result = computePrice(draft)
    const extras = result.additions.find((a) => a.label === 'Extra toppings')
    expect(extras?.amount).toBe(2.3)
  })

  test('multiplies unit price by quantity', () => {
    const draft: PizzaDraft = { ...createDraft('margherita'), quantity: 3 }
    expect(computePrice(draft).total).toBe(25.5)
  })

  test('half & half takes the dearer half base and half-rate toppings', () => {
    const draft: PizzaDraft = {
      ...createDraft('margherita'), // 8.5
      halfAndHalf: true,
      halves: {
        left: { productId: 'margherita', addedToppings: [], removedToppings: [] }, // 8.5
        right: { productId: 'tartufo', addedToppings: ['pepperoni'], removedToppings: [] }, // 14.9, +0.9 half-rate
      },
    }
    const result = computePrice(draft)
    expect(result.base).toBe(14.9) // dearer of 8.5 / 14.9
    const right = result.additions.find((a) => a.label === 'Right half toppings')
    expect(right?.amount).toBe(0.9) // 1.8 * 1 * 0.5
  })

  test('returns zero for unknown product', () => {
    const draft = { ...createDraft('margherita'), productId: 'nope' }
    expect(computePrice(draft).total).toBe(0)
  })
})
