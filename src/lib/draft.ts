/* Builder draft helpers — create sensible defaults so a fast user can size → add in 2 taps. */
import { menuRepository } from '../data/repository'
import type { PizzaDraft } from '../data/types'

export function createDraft(productId: string): PizzaDraft {
  const product = menuRepository.getProduct(productId)
  return {
    productId,
    sizeId: 'medium',
    baseId: 'normal',
    crustId: 'regular',
    addedToppings: [],
    removedToppings: [],
    halfAndHalf: false,
    quantity: 1,
    notes: '',
    // half specs default to the same product on both sides when toggled
    halves: product
      ? {
          left: { productId, addedToppings: [], removedToppings: [] },
          right: { productId, addedToppings: [], removedToppings: [] },
        }
      : undefined,
  }
}

/** Stable-ish key for deduping identical lines. */
export function draftKey(draft: PizzaDraft): string {
  return JSON.stringify({
    p: draft.productId,
    s: draft.sizeId,
    b: draft.baseId,
    c: draft.crustId,
    a: [...draft.addedToppings].sort(),
    r: [...draft.removedToppings].sort(),
    hh: draft.halfAndHalf,
    h: draft.halves,
    n: draft.notes.trim(),
  })
}
