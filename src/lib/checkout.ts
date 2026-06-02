/* Pure checkout logic: form schema, ETA, order assembly, stage progression. Fully testable. */
import { z } from 'zod'
import type { CartLine, Order, OrderStage, OrderType } from '../data/types'
import type { CartTotals } from './cartTotals'
import { generateOrderNumber } from './orderNumber'

export const checkoutSchema = z.object({
  orderType: z.enum(['Delivery', 'Collection', 'Dine-in']),
  name: z.string().trim().min(2, 'Enter your name'),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s()-]{7,}$/, 'Enter a valid phone number'),
  email: z.string().trim().email('Enter a valid email').or(z.literal('')).optional(),
  postcode: z.string().trim().optional(),
  addressLine: z.string().trim().optional(),
  instructions: z.string().trim().max(200).optional(),
  timingMode: z.enum(['asap', 'scheduled']),
  scheduledFor: z.string().optional(),
  payment: z.string().min(1),
  contactless: z.boolean(),
  cutlery: z.boolean(),
  allergyAck: z.literal(true, { message: 'Please confirm the allergy notice' }),
})

export type CheckoutForm = z.infer<typeof checkoutSchema>

/** Fields required at each step; used to gate "Next". */
export function stepIsValid(step: number, form: Partial<CheckoutForm>): boolean {
  switch (step) {
    case 0:
      return !!form.orderType
    case 1:
      return checkoutSchema.shape.name.safeParse(form.name).success &&
        checkoutSchema.shape.phone.safeParse(form.phone).success
    case 2:
      if (form.orderType !== 'Delivery') return true
      return !!form.postcode?.trim() && !!form.addressLine?.trim()
    case 3:
      return form.timingMode === 'asap' || !!form.scheduledFor
    case 4:
      return !!form.payment
    case 5:
      return true
    case 6:
      return form.allergyAck === true
    default:
      return true
  }
}

export function estimateEta(orderType: OrderType, timingMode: 'asap' | 'scheduled'): number {
  if (timingMode === 'scheduled') return 0
  return orderType === 'Delivery' ? 35 : 20
}

const STAGES_DELIVERY: OrderStage[] = [
  'received',
  'preparing',
  'in-oven',
  'quality-check',
  'out-for-delivery',
  'completed',
]
const STAGES_COLLECTION: OrderStage[] = [
  'received',
  'preparing',
  'in-oven',
  'quality-check',
  'completed',
]

export function stagesFor(orderType: OrderType): OrderStage[] {
  return orderType === 'Delivery' ? STAGES_DELIVERY : STAGES_COLLECTION
}

export const STAGE_LABELS: Record<OrderStage, string> = {
  received: 'Order received',
  preparing: 'Preparing',
  'in-oven': 'In the oven',
  'quality-check': 'Quality check',
  'out-for-delivery': 'Out for delivery',
  completed: 'Completed',
}

/** Mock live progression: advance one stage per ~6 minutes elapsed since order. */
export function currentStageIndex(order: Order, now: Date = new Date()): number {
  const stages = stagesFor(order.type)
  const elapsedMin = (now.getTime() - new Date(order.createdAt).getTime()) / 60000
  const advanced = Math.floor(elapsedMin / 6)
  return Math.min(stages.length - 1, Math.max(0, advanced))
}

type BuildArgs = {
  form: CheckoutForm
  lines: CartLine[]
  totals: CartTotals
  couponCode?: string
  now?: Date
  rand?: number
}

export function buildOrder({
  form,
  lines,
  totals,
  couponCode,
  now = new Date(),
  rand = Math.random(),
}: BuildArgs): Order {
  const etaMinutes = estimateEta(form.orderType, form.timingMode)
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `ord-${now.getTime()}-${Math.floor(rand * 1e6)}`
  return {
    id,
    number: generateOrderNumber(now, rand),
    createdAt: now.toISOString(),
    type: form.orderType,
    lines,
    customer: { name: form.name, phone: form.phone, email: form.email || undefined },
    address:
      form.orderType === 'Delivery'
        ? {
            postcode: form.postcode ?? '',
            line: form.addressLine ?? '',
            instructions: form.instructions || undefined,
          }
        : undefined,
    timing: { mode: form.timingMode, scheduledFor: form.scheduledFor, etaMinutes },
    payment: form.payment,
    options: { contactless: form.contactless, cutlery: form.cutlery },
    coupon: totals.discount > 0 ? couponCode : undefined,
    totals: {
      subtotal: totals.subtotal,
      discount: totals.discount,
      deliveryFee: totals.deliveryFee,
      serviceCharge: totals.serviceCharge,
      total: totals.total,
    },
    stage: 'received',
  }
}
