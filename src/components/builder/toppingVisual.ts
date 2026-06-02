/* Maps topping ids to an emoji + a deterministic scatter so the pizza visual updates per tap. */
import type { PizzaDraft } from '../../data/types'

const EMOJI: Record<string, string> = {
  mozzarella: '🧀',
  cheddar: '🧀',
  'buffalo-moz': '🧀',
  pepperoni: '🔴',
  chicken: '🍗',
  beef: '🥩',
  ham: '🥓',
  mushroom: '🍄',
  peppers: '🫑',
  onion: '🧅',
  sweetcorn: '🌽',
  jalapeno: '🌶️',
  olives: '🫒',
  truffle: '🟤',
  nduja: '🌶️',
}

const SAUCES = new Set(['bbq', 'garlic', 'hot-sauce'])

export type Placed = { emoji: string; x: number; y: number; key: string }

const GOLDEN = 137.508 * (Math.PI / 180)

/** Place N pieces of a topping in a seeded spiral within the given radius (0..1 from center). */
function scatter(toppingId: string, seedIndex: number, count: number, region: [number, number]): Placed[] {
  const emoji = EMOJI[toppingId]
  if (!emoji || SAUCES.has(toppingId)) return []
  const out: Placed[] = []
  for (let i = 0; i < count; i++) {
    const t = seedIndex * 7.13 + i
    const angle = t * GOLDEN
    const radius = 0.16 + 0.62 * Math.sqrt((i + 0.5) / count)
    const cx = 50 + Math.cos(angle) * radius * 42
    const cy = 50 + Math.sin(angle) * radius * 42
    // clamp x into the region (for half & half): [0,50] left, [50,100] right
    const x = Math.min(region[1] - 3, Math.max(region[0] + 3, cx))
    out.push({ emoji, x, y: cy, key: `${toppingId}-${i}` })
  }
  return out
}

const PER_TOPPING = 5

export function placeToppings(draft: PizzaDraft): Placed[] {
  if (draft.halfAndHalf && draft.halves) {
    const left = draft.halves.left.addedToppings.flatMap((id, idx) =>
      scatter(id, idx, PER_TOPPING, [0, 50]),
    )
    const right = draft.halves.right.addedToppings.flatMap((id, idx) =>
      scatter(id, idx + 50, PER_TOPPING, [50, 100]),
    )
    return [...left, ...right]
  }
  const visible = draft.addedToppings.filter((id) => !draft.removedToppings.includes(id))
  return visible.flatMap((id, idx) => scatter(id, idx, PER_TOPPING, [0, 100]))
}
