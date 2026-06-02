/* Pure product filtering + sorting for menu surfaces. Testable, no React. */
import type { Product } from '../data/types'

export type DietFilter = 'all' | 'veg' | 'non-veg'
export type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'spice'

export type MenuFilters = {
  diet: DietFilter
  halalOnly: boolean
  spicyOnly: boolean // spice >= 3
  query: string
}

export const DEFAULT_FILTERS: MenuFilters = {
  diet: 'all',
  halalOnly: false,
  spicyOnly: false,
  query: '',
}

const SPICY_THRESHOLD = 3

export function filterProducts(products: Product[], f: MenuFilters): Product[] {
  const q = f.query.trim().toLowerCase()
  return products.filter((p) => {
    if (f.diet !== 'all' && p.diet !== f.diet) return false
    if (f.halalOnly && !p.halal) return false
    if (f.spicyOnly && p.spice < SPICY_THRESHOLD) return false
    if (q && !`${p.name} ${p.description} ${p.tags.join(' ')}`.toLowerCase().includes(q)) return false
    return true
  })
}

export function sortProducts(products: Product[], key: SortKey): Product[] {
  const copy = [...products]
  switch (key) {
    case 'price-asc':
      return copy.sort((a, b) => a.basePrice - b.basePrice)
    case 'price-desc':
      return copy.sort((a, b) => b.basePrice - a.basePrice)
    case 'spice':
      return copy.sort((a, b) => b.spice - a.spice)
    case 'popular':
    default:
      return copy.sort((a, b) => b.rating - a.rating)
  }
}

export function applyMenu(products: Product[], f: MenuFilters, sort: SortKey): Product[] {
  return sortProducts(filterProducts(products, f), sort)
}
