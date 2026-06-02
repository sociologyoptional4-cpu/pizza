/* Full-page entry into the builder — pick a pizza to start customizing. */
import { menuRepository } from '../data/repository'
import { ProductGrid } from '../components/menu/ProductGrid'

export function BuilderPage() {
  const pizzas = menuRepository.getProducts().filter((p) => p.customizable)
  return (
    <main className="container" style={{ paddingBlock: 'var(--space-section)' }}>
      <p className="eyebrow">Build your own</p>
      <h1 style={{ fontSize: 'var(--text-h2)' }}>Start with a pizza</h1>
      <p className="lead" style={{ maxWidth: '46ch', margin: 'var(--space-3) 0 var(--space-8)' }}>
        Pick a base recipe, then choose size, base, crust, toppings, half &amp; half and more. The
        visual and price update on every tap.
      </p>
      <ProductGrid products={pizzas} />
    </main>
  )
}
