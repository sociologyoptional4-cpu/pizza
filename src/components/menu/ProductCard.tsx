import { Clock, Flame, Plus, Star } from 'lucide-react'
import type { Product } from '../../data/types'
import { formatMoney } from '../../lib/money'
import { createDraft } from '../../lib/draft'
import { useCartStore } from '../../store/cartStore'
import { useUIStore } from '../../store/uiStore'
import { Badge, Sticker } from '../ui/Badge'
import './menu.css'

export function ProductCard({ product }: { product: Product }) {
  const openBuilder = useUIStore((s) => s.openBuilder)
  const showUpsell = useUIStore((s) => s.showUpsell)
  const addDraft = useCartStore((s) => s.addDraft)

  function handleClick() {
    if (product.customizable) openBuilder(product.id)
    else {
      addDraft({ ...createDraft(product.id), quantity: 1 })
      showUpsell(product.id)
    }
  }

  return (
    <article className="pcard">
      <button className="pcard__media" onClick={handleClick} aria-label={`Customize ${product.name}`}>
        {product.badge && <Sticker>{product.badge}</Sticker>}
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="pcard__add">
          <Plus size={18} />
        </span>
      </button>
      <div className="pcard__body">
        <div className="pcard__titlerow">
          <h3 className="pcard__name">{product.name}</h3>
          <span className="pcard__price tnum">
            {product.customizable ? 'from ' : ''}
            {formatMoney(product.basePrice)}
          </span>
        </div>
        <p className="pcard__desc">{product.description}</p>
        <div className="pcard__meta">
          <Badge tone={product.diet === 'veg' ? 'veg' : 'nonveg'}>
            {product.diet === 'veg' ? 'Veg' : 'Non-veg'}
          </Badge>
          {product.spice > 0 && (
            <span className="pcard__chip">
              <Flame size={13} /> {product.spice}/5
            </span>
          )}
          <span className="pcard__chip">
            <Star size={13} /> {product.rating}
          </span>
          <span className="pcard__chip">
            <Clock size={13} /> {product.prepMinutes}m
          </span>
        </div>
      </div>
    </article>
  )
}
