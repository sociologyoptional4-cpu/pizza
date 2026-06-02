/* Money helpers. Work in pennies internally where rounding matters; format with the store symbol. */
import { STORE } from '../data/catalog'

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function formatMoney(amount: number, currency = STORE.currency): string {
  return `${currency}${round2(amount).toFixed(2)}`
}
