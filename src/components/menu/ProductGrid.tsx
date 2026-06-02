import type { Product } from '../../data/types'
import { ProductCard } from './ProductCard'
import './menu.css'

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="product-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
