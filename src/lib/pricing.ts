/* Pure pricing engine. Every builder tap calls this. No side effects → trivially testable.

   Rules:
   - Pizza base price scales by size factor.
   - Base + crust add flat surcharges.
   - Added toppings cost their topping price (×size factor for fairness on bigger pizzas).
   - Removed default toppings give no refund (industry standard) but are tracked for display.
   - Half & half: each half contributes the higher of the two product base prices is NOT used;
     instead the price = max(left product, right product) base + shared size/base/crust, plus
     each half's own added toppings at half rate. This mirrors how chains charge for split pizzas.
*/
import { menuRepository } from '../data/repository'
import type { HalfSpec, PizzaDraft } from '../data/types'
import { round2 } from './money'

export type PriceBreakdownItem = { label: string; amount: number }

export type PriceResult = {
  base: number
  additions: PriceBreakdownItem[]
  unitPrice: number // price for one pizza (qty 1)
  total: number // unitPrice × quantity
}

function sizeFactor(sizeId: PizzaDraft['sizeId']): number {
  return menuRepository.getSizes().find((s) => s.id === sizeId)?.priceFactor ?? 1
}

function toppingsCost(ids: string[], factor: number, rate = 1): number {
  return ids.reduce((sum, id) => {
    const t = menuRepository.getTopping(id)
    return sum + (t ? t.price * factor * rate : 0)
  }, 0)
}

function halfBasePrice(spec: HalfSpec): number {
  return menuRepository.getProduct(spec.productId)?.basePrice ?? 0
}

export function computePrice(draft: PizzaDraft): PriceResult {
  const product = menuRepository.getProduct(draft.productId)
  if (!product) {
    return { base: 0, additions: [], unitPrice: 0, total: 0 }
  }

  const factor = sizeFactor(draft.sizeId)
  const additions: PriceBreakdownItem[] = []

  // Base price: half & half takes the dearer of the two halves.
  let base: number
  if (draft.halfAndHalf && draft.halves) {
    base = Math.max(halfBasePrice(draft.halves.left), halfBasePrice(draft.halves.right)) * factor
  } else {
    base = product.basePrice * factor
  }

  // Base/crust surcharges.
  const baseChoice = menuRepository.getBases().find((b) => b.id === draft.baseId)
  if (baseChoice && baseChoice.surcharge > 0) {
    additions.push({ label: baseChoice.label, amount: baseChoice.surcharge })
  }
  const crustChoice = menuRepository.getCrusts().find((c) => c.id === draft.crustId)
  if (crustChoice && crustChoice.surcharge > 0) {
    additions.push({ label: crustChoice.label, amount: crustChoice.surcharge })
  }

  // Topping costs.
  if (draft.halfAndHalf && draft.halves) {
    const left = toppingsCost(draft.halves.left.addedToppings, factor, 0.5)
    const right = toppingsCost(draft.halves.right.addedToppings, factor, 0.5)
    if (left > 0) additions.push({ label: 'Left half toppings', amount: round2(left) })
    if (right > 0) additions.push({ label: 'Right half toppings', amount: round2(right) })
  } else {
    const added = toppingsCost(draft.addedToppings, factor)
    if (added > 0) additions.push({ label: 'Extra toppings', amount: round2(added) })
  }

  const unitPrice = round2(base + additions.reduce((s, a) => s + a.amount, 0))
  const quantity = Math.max(1, draft.quantity)

  return {
    base: round2(base),
    additions,
    unitPrice,
    total: round2(unitPrice * quantity),
  }
}
