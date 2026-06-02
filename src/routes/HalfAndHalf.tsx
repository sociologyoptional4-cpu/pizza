/* Half & half entry — pick a pizza, open the builder pre-set to half & half. */
import { menuRepository } from '../data/repository'
import { createDraft } from '../lib/draft'
import { useUIStore } from '../store/uiStore'
import { Sticker } from '../components/ui/Badge'
import '../components/menu/menu.css'

export function HalfAndHalf() {
  const pizzas = menuRepository.getProducts().filter((p) => p.customizable)
  const openBuilder = useUIStore((s) => s.openBuilder)

  function start(id: string) {
    openBuilder(id, undefined, { ...createDraft(id), halfAndHalf: true })
  }

  return (
    <main className="container menu-page">
      <header className="menu-page__head">
        <p className="eyebrow">Two halves, one pizza</p>
        <h1>Half &amp; half pizza</h1>
        <p className="lead">Can’t choose? Don’t. Pick a base to start, then set each half in the builder.</p>
      </header>
      <div className="product-grid">
        {pizzas.map((p) => (
          <article className="pcard" key={p.id}>
            <button className="pcard__media" onClick={() => start(p.id)} aria-label={`Start half & half with ${p.name}`}>
              <Sticker>½ + ½</Sticker>
              <img src={p.image} alt={p.name} loading="lazy" />
            </button>
            <div className="pcard__body">
              <h3 className="pcard__name">{p.name}</h3>
              <p className="pcard__desc">{p.description}</p>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
