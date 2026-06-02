/* Live store open/closed status + delivery-zone validation. Pure, time injectable for tests. */
import { storeRepository } from '../data/repository'
import type { DeliveryZone, OpeningHour } from '../data/types'

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export type StoreStatus = { open: boolean; opensAt?: string; closesAt?: string; label: string }

export function getStoreStatus(now: Date = new Date()): StoreStatus {
  const hours: OpeningHour[] = storeRepository.getOpeningHours()
  const today = hours.find((h) => h.day === now.getDay())
  if (!today || today.closed) return { open: false, label: 'Closed today' }

  const minutes = now.getHours() * 60 + now.getMinutes()
  const open = minutes >= toMinutes(today.open) && minutes < toMinutes(today.close)
  return open
    ? { open: true, closesAt: today.close, label: `Open until ${today.close}` }
    : { open: false, opensAt: today.open, label: `Opens ${today.open}` }
}

export type ZoneCheck =
  | { ok: true; zone: DeliveryZone }
  | { ok: false; reason: string }

export function checkDeliveryArea(postcode: string): ZoneCheck {
  const normalized = postcode.trim().toUpperCase().replace(/\s+/g, '')
  if (!normalized) return { ok: false, reason: 'Enter a postcode.' }
  const zones = storeRepository.getZones().filter((z) => z.active)
  // Match the longest active prefix.
  const zone = zones
    .filter((z) => normalized.startsWith(z.postcodePrefix))
    .sort((a, b) => b.postcodePrefix.length - a.postcodePrefix.length)[0]
  if (!zone) return { ok: false, reason: 'Sorry, we don’t deliver to that area yet.' }
  return { ok: true, zone }
}
