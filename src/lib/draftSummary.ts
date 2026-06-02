/* Human-readable breakdown of a pizza draft for cart/checkout display. */
import { menuRepository } from '../data/repository'
import type { PizzaDraft } from '../data/types'

function names(ids: string[]): string {
  return ids.map((id) => menuRepository.getTopping(id)?.name ?? id).join(', ')
}

export type DraftSummary = {
  title: string
  size: string
  base: string
  crust: string
  added?: string
  removed?: string
  halfAndHalf?: { left: string; right: string }
  notes?: string
}

export function summarizeDraft(draft: PizzaDraft): DraftSummary {
  const product = menuRepository.getProduct(draft.productId)
  const size = menuRepository.getSizes().find((s) => s.id === draft.sizeId)?.label ?? draft.sizeId
  const base = menuRepository.getBases().find((b) => b.id === draft.baseId)?.label ?? draft.baseId
  const crust = menuRepository.getCrusts().find((c) => c.id === draft.crustId)?.label ?? draft.crustId

  const summary: DraftSummary = { title: product?.name ?? draft.productId, size, base, crust }

  if (draft.halfAndHalf && draft.halves) {
    summary.halfAndHalf = {
      left: menuRepository.getProduct(draft.halves.left.productId)?.name ?? '',
      right: menuRepository.getProduct(draft.halves.right.productId)?.name ?? '',
    }
    const added = [...draft.halves.left.addedToppings, ...draft.halves.right.addedToppings]
    if (added.length) summary.added = names(added)
  } else if (draft.addedToppings.length) {
    summary.added = names(draft.addedToppings)
  }
  if (draft.removedToppings.length) summary.removed = names(draft.removedToppings)
  if (draft.notes.trim()) summary.notes = draft.notes.trim()
  return summary
}
