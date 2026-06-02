/* Repository interfaces — UI depends on these, not on the data source.
   Current impl is in-memory mock; swap for Supabase/REST without touching callers. */
import {
  BASES,
  COUPONS,
  CRUSTS,
  DEALS,
  OPENING_HOURS,
  PRODUCTS,
  SIZES,
  STORE,
  TOPPINGS,
  ZONES,
} from './catalog'
import type {
  Base,
  Category,
  Coupon,
  Crust,
  Deal,
  DeliveryZone,
  OpeningHour,
  Product,
  Size,
  StoreSettings,
  Topping,
} from './types'

export interface MenuRepository {
  getProducts(): Product[]
  getProduct(id: string): Product | undefined
  getByCategory(category: Category): Product[]
  getSizes(): Size[]
  getBases(): Base[]
  getCrusts(): Crust[]
  getToppings(): Topping[]
  getTopping(id: string): Topping | undefined
  getDeals(): Deal[]
}

export interface StoreRepository {
  getSettings(): StoreSettings
  getOpeningHours(): OpeningHour[]
  getZones(): DeliveryZone[]
  getCoupon(code: string): Coupon | undefined
}

const productById = new Map(PRODUCTS.map((p) => [p.id, p]))
const toppingById = new Map(TOPPINGS.map((t) => [t.id, t]))

export const menuRepository: MenuRepository = {
  getProducts: () => PRODUCTS,
  getProduct: (id) => productById.get(id),
  getByCategory: (category) => PRODUCTS.filter((p) => p.category === category),
  getSizes: () => SIZES,
  getBases: () => BASES,
  getCrusts: () => CRUSTS,
  getToppings: () => TOPPINGS,
  getTopping: (id) => toppingById.get(id),
  getDeals: () => DEALS,
}

export const storeRepository: StoreRepository = {
  getSettings: () => STORE,
  getOpeningHours: () => OPENING_HOURS,
  getZones: () => ZONES,
  getCoupon: (code) =>
    COUPONS.find((c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.active),
}
