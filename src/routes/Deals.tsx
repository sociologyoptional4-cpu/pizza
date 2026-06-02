/* Deals & Combos + Meal Deals share this view, filtered by kind. */
import { menuRepository } from '../data/repository'
import type { DealKind } from '../data/types'
import { DealCard } from '../components/menu/DealCard'
import '../components/menu/menu-layout.css'
import '../components/menu/deal.css'

function DealsView({ eyebrow, title, lead, kind }: { eyebrow: string; title: string; lead: string; kind?: DealKind }) {
  const deals = menuRepository.getDeals().filter((d) => !kind || d.kind === kind)
  return (
    <main className="container menu-page">
      <header className="menu-page__head">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lead">{lead}</p>
      </header>
      <div className="deals-grid">
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
      </div>
    </main>
  )
}

export function DealsCombos() {
  return <DealsView eyebrow="Better together" title="Deals & combos" lead="Bundle up and save — sharing sorted." />
}

export function MealDeals() {
  return <DealsView eyebrow="Pick & mix" title="Meal deals" lead="Pizza, side and a drink for less." kind="meal" />
}
