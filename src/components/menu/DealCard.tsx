import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import type { Deal } from '../../data/types'
import { formatMoney } from '../../lib/money'
import { Sticker } from '../ui/Badge'
import { Button } from '../ui/Button'
import './deal.css'

export function DealCard({ deal }: { deal: Deal }) {
  const saving = deal.was - deal.price
  return (
    <article className="deal-card">
      <div className="deal-card__media">
        {deal.badge && <Sticker>{deal.badge}</Sticker>}
        <img src={deal.image} alt={deal.name} loading="lazy" />
      </div>
      <div className="deal-card__body">
        <div className="deal-card__titlerow">
          <h3>{deal.name}</h3>
          {deal.serves && <span className="deal-card__serves">Serves {deal.serves}</span>}
        </div>
        <p className="deal-card__desc">{deal.description}</p>
        <ul className="deal-card__items">
          {deal.items.map((it) => (
            <li key={it}>
              <Check size={14} /> {it}
            </li>
          ))}
        </ul>
        <div className="deal-card__foot">
          <div className="deal-card__price">
            <span className="deal-card__now tnum">{formatMoney(deal.price)}</span>
            <span className="deal-card__was tnum">{formatMoney(deal.was)}</span>
            <span className="deal-card__save">save {formatMoney(saving)}</span>
          </div>
          <Link to="/builder">
            <Button size="sm">Build deal</Button>
          </Link>
        </div>
      </div>
    </article>
  )
}
