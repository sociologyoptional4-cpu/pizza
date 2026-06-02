/* Pure loyalty points. 1 point per £1 spent (completed orders). Tiers by lifetime points. */
import type { Order } from '../data/types'

export const POINTS_PER_POUND = 1

export type Tier = { name: string; min: number; perk: string }

export const TIERS: Tier[] = [
  { name: 'Dough', min: 0, perk: 'Welcome — start earning' },
  { name: 'Bronze', min: 100, perk: 'Free garlic bread monthly' },
  { name: 'Silver', min: 300, perk: '10% off every order' },
  { name: 'Gold', min: 600, perk: 'Free large pizza each month + priority kitchen' },
]

export function pointsFromOrders(orders: Order[]): number {
  return Math.floor(orders.reduce((sum, o) => sum + o.totals.total, 0) * POINTS_PER_POUND)
}

export function tierForPoints(points: number): Tier {
  return [...TIERS].reverse().find((t) => points >= t.min) ?? TIERS[0]
}

export function nextTier(points: number): Tier | undefined {
  return TIERS.find((t) => t.min > points)
}

/** Progress 0..1 toward the next tier (1 when at top tier). */
export function tierProgress(points: number): number {
  const current = tierForPoints(points)
  const next = nextTier(points)
  if (!next) return 1
  return (points - current.min) / (next.min - current.min)
}
