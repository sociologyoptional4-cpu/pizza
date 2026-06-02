/* Domain model — single source of truth for storefront + admin + pricing. */

export type Category =
  | 'Classic'
  | 'Chicken'
  | 'Veggie'
  | 'Feast'
  | 'Signature'
  | 'Sides'
  | 'Drinks'
  | 'Desserts'
  | 'Kids'

export type SizeId = 'small' | 'medium' | 'large'
export type BaseId = 'normal' | 'italian' | 'deep-pan' | 'thin'
export type CrustId = 'regular' | 'stuffed' | 'cheesy-bites'
export type Fulfilment = 'Delivery' | 'Collection'
export type Half = 'left' | 'right'

export type Diet = 'veg' | 'non-veg'

export type Size = { id: SizeId; label: string; inches: number; priceFactor: number }
export type Base = { id: BaseId; label: string; surcharge: number }
export type Crust = { id: CrustId; label: string; surcharge: number; available: boolean }

export type ToppingCategory =
  | 'Extra Cheese'
  | 'Extra Meat'
  | 'Extra Vegetables'
  | 'Sauces'
  | 'Premium'

export type Topping = {
  id: string
  name: string
  category: ToppingCategory
  price: number
  diet: Diet
  premium?: boolean
}

/** Base menu product. `basePrice` is the price for the default/medium size. */
export type Product = {
  id: string
  name: string
  category: Category
  description: string
  image: string
  basePrice: number
  diet: Diet
  halal: boolean
  spice: number // 0..5
  rating: number // 0..5
  prepMinutes: number
  allergens: string[]
  defaultToppings: string[] // topping ids included by default (removable)
  tags: string[]
  badge?: string
  customizable: boolean // pizzas true; drinks/desserts false
}

/** Per-half customization for half & half pizzas. */
export type HalfSpec = {
  productId: string
  addedToppings: string[]
  removedToppings: string[]
}

/** A fully-specified line item draft produced by the builder, consumed by pricing + cart. */
export type PizzaDraft = {
  productId: string
  sizeId: SizeId
  baseId: BaseId
  crustId: CrustId
  addedToppings: string[]
  removedToppings: string[]
  halfAndHalf: boolean
  halves?: { left: HalfSpec; right: HalfSpec }
  quantity: number
  notes: string
}

export type CartLine = {
  key: string // stable id for this line
  draft: PizzaDraft
  unitPrice: number
  lineTotal: number
}

export type Review = {
  id: string
  author: string
  rating: number // 1..5
  date: string
  body: string
  dish?: string
}

export type Faq = { q: string; a: string; category: string }

export type DealKind = 'combo' | 'meal'
export type Deal = {
  id: string
  name: string
  kind: DealKind
  description: string
  image: string
  items: string[] // human-readable contents
  price: number
  was: number // original total for savings display
  badge?: string
  serves?: number
}

export type CouponType = 'percent' | 'fixed'
export type Coupon = {
  code: string
  type: CouponType
  value: number
  minOrder: number
  expiresAt: string // ISO date
  active: boolean
  description: string
}

export type DeliveryZone = {
  postcodePrefix: string
  area: string
  fee: number
  minOrder: number
  active: boolean
}

export type OpeningHour = {
  day: number // 0=Sun..6=Sat
  open: string // "HH:mm"
  close: string // "HH:mm"
  closed: boolean
}

export type StoreSettings = {
  name: string
  phone: string
  whatsapp: string // digits only, intl format
  address: string
  freeDeliveryThreshold: number
  defaultDeliveryFee: number
  serviceCharge: number
  minOrder: number
  currency: string // symbol e.g. "£"
}

export type OrderStage =
  | 'received'
  | 'preparing'
  | 'in-oven'
  | 'quality-check'
  | 'out-for-delivery'
  | 'completed'

export type OrderType = 'Delivery' | 'Collection' | 'Dine-in'

export type Order = {
  id: string
  number: string
  createdAt: string
  type: OrderType
  lines: CartLine[]
  customer: { name: string; phone: string; email?: string }
  address?: { postcode: string; line: string; instructions?: string }
  timing: { mode: 'asap' | 'scheduled'; scheduledFor?: string; etaMinutes: number }
  payment: string
  options: { contactless: boolean; cutlery: boolean }
  coupon?: string
  totals: { subtotal: number; discount: number; deliveryFee: number; serviceCharge: number; total: number }
  stage: OrderStage
}
