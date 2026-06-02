import { describe, expect, test } from 'vitest'
import { applyMenu, filterProducts, sortProducts, DEFAULT_FILTERS } from './menuFilters'
import { menuRepository } from '../data/repository'

const all = menuRepository.getProducts()

describe('filterProducts', () => {
  test('no filters returns everything', () => {
    expect(filterProducts(all, DEFAULT_FILTERS)).toHaveLength(all.length)
  })
  test('veg filter excludes non-veg', () => {
    const veg = filterProducts(all, { ...DEFAULT_FILTERS, diet: 'veg' })
    expect(veg.every((p) => p.diet === 'veg')).toBe(true)
  })
  test('spicyOnly keeps spice >= 3', () => {
    const spicy = filterProducts(all, { ...DEFAULT_FILTERS, spicyOnly: true })
    expect(spicy.every((p) => p.spice >= 3)).toBe(true)
    expect(spicy.length).toBeGreaterThan(0)
  })
  test('halalOnly keeps halal', () => {
    expect(filterProducts(all, { ...DEFAULT_FILTERS, halalOnly: true }).every((p) => p.halal)).toBe(true)
  })
  test('query matches name and tags case-insensitively', () => {
    const r = filterProducts(all, { ...DEFAULT_FILTERS, query: 'DIAVOLA' })
    expect(r.some((p) => p.id === 'diavola')).toBe(true)
  })
  test('query with no match returns empty', () => {
    expect(filterProducts(all, { ...DEFAULT_FILTERS, query: 'zzzzz' })).toHaveLength(0)
  })
})

describe('sortProducts', () => {
  test('price ascending', () => {
    const r = sortProducts(all, 'price-asc')
    for (let i = 1; i < r.length; i++) expect(r[i].basePrice).toBeGreaterThanOrEqual(r[i - 1].basePrice)
  })
  test('spice descending', () => {
    const r = sortProducts(all, 'spice')
    expect(r[0].spice).toBeGreaterThanOrEqual(r[r.length - 1].spice)
  })
  test('does not mutate input', () => {
    const before = [...all]
    sortProducts(all, 'price-desc')
    expect(all).toEqual(before)
  })
})

describe('applyMenu', () => {
  test('filters then sorts', () => {
    const r = applyMenu(all, { ...DEFAULT_FILTERS, diet: 'veg' }, 'price-asc')
    expect(r.every((p) => p.diet === 'veg')).toBe(true)
    for (let i = 1; i < r.length; i++) expect(r[i].basePrice).toBeGreaterThanOrEqual(r[i - 1].basePrice)
  })
})
