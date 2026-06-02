/* WhatsApp order message builder. Pure → fully testable. Produces the complete order text
   and a wa.me deep link. This is the actual order channel; it must be correct and complete. */
import { menuRepository, storeRepository } from '../data/repository'
import type { CartLine, Order, PizzaDraft } from '../data/types'
import { formatMoney } from './money'

function productName(id: string): string {
  return menuRepository.getProduct(id)?.name ?? id
}

function toppingNames(ids: string[]): string {
  return ids.map((id) => menuRepository.getTopping(id)?.name ?? id).join(', ')
}

function sizeLabel(draft: PizzaDraft): string {
  return menuRepository.getSizes().find((s) => s.id === draft.sizeId)?.label ?? draft.sizeId
}
function baseLabel(draft: PizzaDraft): string {
  return menuRepository.getBases().find((b) => b.id === draft.baseId)?.label ?? draft.baseId
}
function crustLabel(draft: PizzaDraft): string {
  return menuRepository.getCrusts().find((c) => c.id === draft.crustId)?.label ?? draft.crustId
}

export function describeLine(line: CartLine): string {
  const { draft } = line
  const head = `${draft.quantity}× ${productName(draft.productId)} — ${sizeLabel(draft)}`
  const parts: string[] = [`   ${baseLabel(draft)} base, ${crustLabel(draft)}`]

  if (draft.halfAndHalf && draft.halves) {
    parts.push(`   Half & half: L=${productName(draft.halves.left.productId)} / R=${productName(draft.halves.right.productId)}`)
    if (draft.halves.left.addedToppings.length)
      parts.push(`   L extras: ${toppingNames(draft.halves.left.addedToppings)}`)
    if (draft.halves.right.addedToppings.length)
      parts.push(`   R extras: ${toppingNames(draft.halves.right.addedToppings)}`)
  } else if (draft.addedToppings.length) {
    parts.push(`   Extra: ${toppingNames(draft.addedToppings)}`)
  }
  if (draft.removedToppings.length) parts.push(`   No: ${toppingNames(draft.removedToppings)}`)
  if (draft.notes.trim()) parts.push(`   Note: ${draft.notes.trim()}`)
  parts.push(`   ${formatMoney(line.lineTotal)}`)

  return `${head}\n${parts.join('\n')}`
}

export function buildOrderMessage(order: Order): string {
  const store = storeRepository.getSettings()
  const lines: string[] = []
  lines.push(`🍕 *${store.name} order ${order.number}*`)
  lines.push(`Type: ${order.type}`)
  lines.push('')
  lines.push('*Items*')
  order.lines.forEach((l) => lines.push(describeLine(l)))
  lines.push('')

  if (order.type === 'Delivery' && order.address) {
    lines.push(`*Deliver to:* ${order.address.line}, ${order.address.postcode}`)
    if (order.address.instructions) lines.push(`Instructions: ${order.address.instructions}`)
  } else if (order.type === 'Collection') {
    lines.push('*Collection from store*')
  }

  lines.push(
    order.timing.mode === 'asap'
      ? `Time: ASAP (~${order.timing.etaMinutes} min)`
      : `Time: Scheduled ${order.timing.scheduledFor ?? ''}`,
  )
  lines.push(`Customer: ${order.customer.name}, ${order.customer.phone}`)
  if (order.options.contactless) lines.push('Contactless / leave at door')
  lines.push(order.options.cutlery ? 'Cutlery: yes' : 'Cutlery: no')
  lines.push('')

  const t = order.totals
  lines.push(`Subtotal: ${formatMoney(t.subtotal)}`)
  if (t.discount > 0) lines.push(`Discount${order.coupon ? ` (${order.coupon})` : ''}: -${formatMoney(t.discount)}`)
  if (t.deliveryFee > 0) lines.push(`Delivery: ${formatMoney(t.deliveryFee)}`)
  if (t.serviceCharge > 0) lines.push(`Service: ${formatMoney(t.serviceCharge)}`)
  lines.push(`*Total: ${formatMoney(t.total)}*`)
  lines.push(`Payment: ${order.payment}`)

  return lines.join('\n')
}

export function buildWhatsAppLink(order: Order): string {
  const store = storeRepository.getSettings()
  return `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(buildOrderMessage(order))}`
}
