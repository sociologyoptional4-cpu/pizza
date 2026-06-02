import { beforeEach, describe, expect, test } from 'vitest'
import { useCartStore } from './cartStore'
import { createDraft } from '../lib/draft'

function reset() {
  useCartStore.setState({ lines: [], fulfilment: 'Delivery', couponCode: undefined })
}

describe('cartStore', () => {
  beforeEach(reset)

  test('adds a draft as a line', () => {
    useCartStore.getState().addDraft(createDraft('margherita'))
    expect(useCartStore.getState().lines).toHaveLength(1)
    expect(useCartStore.getState().itemCount()).toBe(1)
  })

  test('merges identical drafts by incrementing quantity', () => {
    const { addDraft } = useCartStore.getState()
    addDraft(createDraft('margherita'))
    addDraft(createDraft('margherita'))
    const lines = useCartStore.getState().lines
    expect(lines).toHaveLength(1)
    expect(lines[0].draft.quantity).toBe(2)
    expect(lines[0].lineTotal).toBe(17)
  })

  test('keeps differing drafts as separate lines', () => {
    const { addDraft } = useCartStore.getState()
    addDraft(createDraft('margherita'))
    addDraft({ ...createDraft('margherita'), sizeId: 'large' })
    expect(useCartStore.getState().lines).toHaveLength(2)
  })

  test('setQuantity to zero removes the line', () => {
    useCartStore.getState().addDraft(createDraft('margherita'))
    const key = useCartStore.getState().lines[0].key
    useCartStore.getState().setQuantity(key, 0)
    expect(useCartStore.getState().lines).toHaveLength(0)
  })

  test('duplicate creates a second identical-content line', () => {
    useCartStore.getState().addDraft(createDraft('diavola'))
    const key = useCartStore.getState().lines[0].key
    useCartStore.getState().duplicate(key)
    expect(useCartStore.getState().lines).toHaveLength(2)
  })

  test('clear empties cart and coupon', () => {
    useCartStore.getState().addDraft(createDraft('margherita'))
    useCartStore.getState().setCoupon('FORNO10')
    useCartStore.getState().clear()
    expect(useCartStore.getState().lines).toHaveLength(0)
    expect(useCartStore.getState().couponCode).toBeUndefined()
  })
})
