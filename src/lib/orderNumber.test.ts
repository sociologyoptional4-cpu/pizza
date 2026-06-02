import { describe, expect, test } from 'vitest'
import { generateOrderNumber } from './orderNumber'

describe('generateOrderNumber', () => {
  test('encodes the date as FRN-YYMMDD-XXXX', () => {
    const n = generateOrderNumber(new Date('2026-06-02T18:30:05'), 0.5)
    expect(n).toMatch(/^FRN-260602-[0-9A-Z]{4}$/)
  })

  test('is deterministic for fixed time + rand', () => {
    const date = new Date('2026-06-02T18:30:05')
    expect(generateOrderNumber(date, 0.42)).toBe(generateOrderNumber(date, 0.42))
  })
})
