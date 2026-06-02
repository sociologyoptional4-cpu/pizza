import { describe, expect, test } from 'vitest'
import { buildOrderMessage, buildWhatsAppLink, describeLine } from './whatsapp'
import { createDraft } from './draft'
import { computePrice } from './pricing'
import type { CartLine, Order, PizzaDraft } from '../data/types'

function makeLine(patch: Partial<PizzaDraft> = {}): CartLine {
  const draft: PizzaDraft = { ...createDraft('diavola'), ...patch }
  const price = computePrice(draft)
  return { key: 'k', draft, unitPrice: price.unitPrice, lineTotal: price.total }
}

const order: Order = {
  id: '1',
  number: 'FRN-260602-00A1',
  createdAt: '2026-06-02T18:00:00Z',
  type: 'Delivery',
  lines: [makeLine({ addedToppings: ['mushroom'], removedToppings: ['onion'], notes: 'Extra crispy' })],
  customer: { name: 'Sam', phone: '07700900000' },
  address: { postcode: 'E1 6QL', line: '12 Ember Lane', instructions: 'Buzz flat 3' },
  timing: { mode: 'asap', etaMinutes: 35 },
  payment: 'Cash',
  options: { contactless: true, cutlery: false },
  coupon: 'FORNO10',
  totals: { subtotal: 12.5, discount: 1.25, deliveryFee: 2.5, serviceCharge: 0, total: 13.75 },
  stage: 'received',
}

describe('describeLine', () => {
  test('includes name, size, extras, removals, notes, price', () => {
    const text = describeLine(order.lines[0])
    expect(text).toContain('Diavola Inferno')
    expect(text).toContain('Medium 12"')
    expect(text).toContain('Mushrooms')
    expect(text).toContain('No: Red onion')
    expect(text).toContain('Note: Extra crispy')
  })

  test('renders half & half halves', () => {
    const line = makeLine({
      halfAndHalf: true,
      halves: {
        left: { productId: 'margherita', addedToppings: [], removedToppings: [] },
        right: { productId: 'tartufo', addedToppings: ['truffle'], removedToppings: [] },
      },
    })
    const text = describeLine(line)
    expect(text).toContain('Half & half')
    expect(text).toContain('Margherita Regina')
    expect(text).toContain('Tartufo Nero')
    expect(text).toContain('R extras: Truffle shavings')
  })
})

describe('buildOrderMessage', () => {
  test('contains order number, totals, address, coupon', () => {
    const msg = buildOrderMessage(order)
    expect(msg).toContain('FRN-260602-00A1')
    expect(msg).toContain('Deliver to:* 12 Ember Lane, E1 6QL')
    expect(msg).toContain('Instructions: Buzz flat 3')
    expect(msg).toContain('Discount (FORNO10): -£1.25')
    expect(msg).toContain('Total: £13.75')
    expect(msg).toContain('Contactless')
  })

  test('collection orders omit address', () => {
    const msg = buildOrderMessage({ ...order, type: 'Collection', address: undefined })
    expect(msg).toContain('Collection from store')
    expect(msg).not.toContain('Deliver to')
  })
})

describe('buildWhatsAppLink', () => {
  test('produces an encoded wa.me link to the store number', () => {
    const link = buildWhatsAppLink(order)
    expect(link.startsWith('https://wa.me/447700900123?text=')).toBe(true)
    expect(link).toContain(encodeURIComponent('FRN-260602-00A1'))
  })
})
