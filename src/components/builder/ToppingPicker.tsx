import { Minus, Plus } from 'lucide-react'
import { menuRepository } from '../../data/repository'
import type { Topping, ToppingCategory } from '../../data/types'
import { formatMoney } from '../../lib/money'
import { Badge } from '../ui/Badge'
import './builder.css'

type Props = {
  added: string[]
  onToggle: (id: string) => void
}

const ORDER: ToppingCategory[] = ['Extra Cheese', 'Extra Meat', 'Extra Vegetables', 'Sauces', 'Premium']

function groupByCategory(toppings: Topping[]): Map<ToppingCategory, Topping[]> {
  const map = new Map<ToppingCategory, Topping[]>()
  for (const cat of ORDER) map.set(cat, [])
  for (const t of toppings) map.get(t.category)?.push(t)
  return map
}

export function ToppingPicker({ added, onToggle }: Props) {
  const grouped = groupByCategory(menuRepository.getToppings())
  return (
    <div className="topping-picker">
      {ORDER.map((cat) => {
        const items = grouped.get(cat) ?? []
        if (!items.length) return null
        return (
          <section key={cat} className="topping-group">
            <h4 className="topping-group__title">
              {cat}
              {cat === 'Premium' && <Badge tone="gold">Chef’s</Badge>}
            </h4>
            <div className="topping-list">
              {items.map((t) => {
                const on = added.includes(t.id)
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={on}
                    className={`topping ${on ? 'is-on' : ''} ${t.premium ? 'is-premium' : ''}`}
                    onClick={() => onToggle(t.id)}
                  >
                    <span className={`diet-dot diet-dot--${t.diet === 'veg' ? 'veg' : 'nonveg'}`} />
                    <span className="topping__name">{t.name}</span>
                    <span className="topping__price tnum">+{formatMoney(t.price)}</span>
                    <span className="topping__icon">{on ? <Minus size={15} /> : <Plus size={15} />}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
