import { describe, expect, test } from 'vitest'
import { checkDeliveryArea, getStoreStatus } from './storeStatus'

describe('getStoreStatus', () => {
  test('open during trading hours (Tue 13:00)', () => {
    const status = getStoreStatus(new Date('2026-06-02T13:00:00')) // Tuesday
    expect(status.open).toBe(true)
    expect(status.label).toContain('Open until')
  })

  test('closed before opening (Tue 09:00)', () => {
    const status = getStoreStatus(new Date('2026-06-02T09:00:00'))
    expect(status.open).toBe(false)
    expect(status.label).toContain('Opens')
  })

  test('closed after close (Tue 23:30, closes 23:00)', () => {
    expect(getStoreStatus(new Date('2026-06-02T23:30:00')).open).toBe(false)
  })
})

describe('checkDeliveryArea', () => {
  test('accepts a covered postcode and matches longest prefix', () => {
    const result = checkDeliveryArea('EC1A 1BB') // EC1 over E1
    expect(result.ok && result.zone.postcodePrefix).toBe('EC1')
  })

  test('accepts lowercase / spaced input', () => {
    expect(checkDeliveryArea(' e2 7dg ').ok).toBe(true)
  })

  test('rejects out-of-area postcode', () => {
    expect(checkDeliveryArea('SW1A 1AA').ok).toBe(false)
  })

  test('rejects empty input', () => {
    expect(checkDeliveryArea('').ok).toBe(false)
  })
})
