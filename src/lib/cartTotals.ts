/* Pure cart total + coupon + free-delivery logic. Consumed by cart + checkout. */
import { storeRepository } from '../data/repository'
import type { CartLine, Coupon, Fulfilment } from '../data/types'
import { round2 } from './money'

export type CartTotals = {
  subtotal: number
  discount: number
  deliveryFee: number
  serviceCharge: number
  total: number
  freeDeliveryThreshold: number
  amountToFreeDelivery: number
  qualifiesFreeDelivery: boolean
  meetsMinOrder: boolean
  minOrder: number
}

export function subtotalOf(lines: CartLine[]): number {
  return round2(lines.reduce((sum, l) => sum + l.lineTotal, 0))
}

export type CouponCheck =
  | { ok: true; coupon: Coupon; discount: number }
  | { ok: false; reason: string }

export function validateCoupon(code: string, subtotal: number): CouponCheck {
  const coupon = storeRepository.getCoupon(code)
  if (!coupon) return { ok: false, reason: 'Coupon not found or inactive.' }
  if (new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { ok: false, reason: 'Coupon expired.' }
  }
  if (subtotal < coupon.minOrder) {
    return { ok: false, reason: `Spend ${coupon.minOrder} to use this coupon.` }
  }
  const discount =
    coupon.type === 'percent'
      ? round2((subtotal * coupon.value) / 100)
      : round2(Math.min(coupon.value, subtotal))
  return { ok: true, coupon, discount }
}

export function computeTotals(
  lines: CartLine[],
  fulfilment: Fulfilment,
  appliedCouponCode?: string,
  deliveryFeeOverride?: number,
): CartTotals {
  const settings = storeRepository.getSettings()
  const subtotal = subtotalOf(lines)

  const couponResult = appliedCouponCode ? validateCoupon(appliedCouponCode, subtotal) : undefined
  const discount = couponResult?.ok ? couponResult.discount : 0

  const threshold = settings.freeDeliveryThreshold
  const qualifiesFreeDelivery = subtotal >= threshold
  const rawDeliveryFee = deliveryFeeOverride ?? settings.defaultDeliveryFee
  const deliveryFee =
    fulfilment === 'Collection' || qualifiesFreeDelivery ? 0 : round2(rawDeliveryFee)

  const serviceCharge = round2(settings.serviceCharge)
  const total = round2(Math.max(0, subtotal - discount) + deliveryFee + serviceCharge)

  return {
    subtotal,
    discount,
    deliveryFee,
    serviceCharge,
    total,
    freeDeliveryThreshold: threshold,
    amountToFreeDelivery: round2(Math.max(0, threshold - subtotal)),
    qualifiesFreeDelivery,
    meetsMinOrder: subtotal >= settings.minOrder,
    minOrder: settings.minOrder,
  }
}
