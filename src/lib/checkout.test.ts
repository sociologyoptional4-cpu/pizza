import { describe, expect, test } from 'vitest'
import {
  buildOrder,
  checkoutSchema,
  currentStageIndex,
  estimateEta,
  stagesFor,
  stepIsValid,
  type CheckoutForm,
} from './checkout'
import { createDraft } from './draft'
import { computePrice } from './pricing'
import { computeTotals } from './cartTotals'
import type { CartLine, PizzaDraft } from '../data/types'

function line(productId: string, quantity = 1): CartLine {
  const draft: PizzaDraft = { ...createDraft(productId), quantity }
  const price = computePrice(draft)
  return { key: productId, draft, unitPrice: price.unitPrice, lineTotal: price.total }
}

const validForm: CheckoutForm = {
  orderType: 'Delivery',
  name: 'Sam Patel',
  phone: '07700900000',
  email: '',
  postcode: 'E1 6QL',
  addressLine: '12 Ember Lane',
  instructions: '',
  timingMode: 'asap',
  scheduledFor: '',
  payment: 'Cash',
  contactless: true,
  cutlery: false,
  allergyAck: true,
}

describe('checkoutSchema', () => {
  test('accepts a valid form', () => {
    expect(checkoutSchema.safeParse(validForm).success).toBe(true)
  })
  test('rejects short name and bad phone', () => {
    expect(checkoutSchema.safeParse({ ...validForm, name: 'A' }).success).toBe(false)
    expect(checkoutSchema.safeParse({ ...validForm, phone: '123' }).success).toBe(false)
  })
  test('requires allergy acknowledgement', () => {
    expect(checkoutSchema.safeParse({ ...validForm, allergyAck: false }).success).toBe(false)
  })
  test('optional email empty string is allowed', () => {
    expect(checkoutSchema.safeParse({ ...validForm, email: '' }).success).toBe(true)
  })
})

describe('stepIsValid', () => {
  test('gates details step on name + phone', () => {
    expect(stepIsValid(1, { name: 'Sam', phone: '07700900000' })).toBe(true)
    expect(stepIsValid(1, { name: '', phone: '' })).toBe(false)
  })
  test('address step skipped for collection', () => {
    expect(stepIsValid(2, { orderType: 'Collection' })).toBe(true)
    expect(stepIsValid(2, { orderType: 'Delivery', postcode: '', addressLine: '' })).toBe(false)
  })
  test('confirm step needs allergy ack', () => {
    expect(stepIsValid(6, { allergyAck: true })).toBe(true)
    expect(stepIsValid(6, { allergyAck: false as unknown as true })).toBe(false)
  })
})

describe('estimateEta', () => {
  test('delivery slower than collection', () => {
    expect(estimateEta('Delivery', 'asap')).toBe(35)
    expect(estimateEta('Collection', 'asap')).toBe(20)
    expect(estimateEta('Delivery', 'scheduled')).toBe(0)
  })
})

describe('stage progression', () => {
  const order = buildOrder({
    form: validForm,
    lines: [line('margherita', 3)],
    totals: computeTotals([line('margherita', 3)], 'Delivery'),
    couponCode: undefined,
    now: new Date('2026-06-02T18:00:00Z'),
    rand: 0.5,
  })

  test('delivery has 6 stages, collection 5', () => {
    expect(stagesFor('Delivery')).toHaveLength(6)
    expect(stagesFor('Collection')).toHaveLength(5)
  })
  test('starts at received', () => {
    expect(currentStageIndex(order, new Date('2026-06-02T18:00:30Z'))).toBe(0)
  })
  test('advances one stage per ~6 minutes', () => {
    expect(currentStageIndex(order, new Date('2026-06-02T18:13:00Z'))).toBe(2)
  })
  test('clamps to final stage', () => {
    expect(currentStageIndex(order, new Date('2026-06-02T20:00:00Z'))).toBe(5)
  })
})

describe('buildOrder', () => {
  const lines = [line('margherita', 3)]
  const totals = computeTotals(lines, 'Delivery', 'FORNO10')

  test('assembles a delivery order with address and totals', () => {
    const order = buildOrder({ form: validForm, lines, totals, couponCode: 'FORNO10', rand: 0.1 })
    expect(order.type).toBe('Delivery')
    expect(order.address?.line).toBe('12 Ember Lane')
    expect(order.coupon).toBe('FORNO10')
    expect(order.totals.total).toBe(totals.total)
    expect(order.number).toMatch(/^FRN-/)
  })

  test('collection order omits address', () => {
    const order = buildOrder({
      form: { ...validForm, orderType: 'Collection' },
      lines,
      totals: computeTotals(lines, 'Collection'),
    })
    expect(order.address).toBeUndefined()
  })
})
