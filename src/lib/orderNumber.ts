/* Order number generator. Format: FRN-YYMMDD-XXXX (X = base36 of time + random). */
export function generateOrderNumber(now: Date = new Date(), rand: number = Math.random()): string {
  const yy = String(now.getFullYear()).slice(2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const seq = (Math.floor(now.getSeconds() * 1000 + rand * 1000) % 1296)
    .toString(36)
    .toUpperCase()
    .padStart(4, '0')
  return `FRN-${yy}${mm}${dd}-${seq}`
}
