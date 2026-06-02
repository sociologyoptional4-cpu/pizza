import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import type { Product } from '../../data/types'
import {
  DEFAULT_FILTERS,
  applyMenu,
  type DietFilter,
  type MenuFilters,
  type SortKey,
} from '../../lib/menuFilters'
import { ProductGrid } from './ProductGrid'
import './menu-layout.css'

type Props = {
  eyebrow: string
  title: string
  lead?: string
  products: Product[]
  initialFilters?: Partial<MenuFilters>
}

const DIET_OPTIONS: { id: DietFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'veg', label: 'Veg' },
  { id: 'non-veg', label: 'Meat' },
]
const SORTS: { id: SortKey; label: string }[] = [
  { id: 'popular', label: 'Most popular' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'spice', label: 'Spiciest' },
]

const SORT_KEYS: SortKey[] = ['popular', 'price-asc', 'price-desc', 'spice']

export function MenuLayout({ eyebrow, title, lead, products, initialFilters }: Props) {
  // Filters + sort live in the URL so the view is shareable and back-button works.
  const [params, setParams] = useSearchParams()
  const base: MenuFilters = { ...DEFAULT_FILTERS, ...initialFilters }
  const filters: MenuFilters = {
    diet: (params.get('diet') as DietFilter) ?? base.diet,
    halalOnly: params.has('halal') ? params.get('halal') === '1' : base.halalOnly,
    spicyOnly: params.has('spicy') ? params.get('spicy') === '1' : base.spicyOnly,
    query: params.get('q') ?? base.query,
  }
  const sort: SortKey = SORT_KEYS.includes(params.get('sort') as SortKey)
    ? (params.get('sort') as SortKey)
    : 'popular'

  const results = useMemo(() => applyMenu(products, filters, sort), [products, filters, sort])

  const patch = (p: Partial<MenuFilters & { sort: SortKey }>) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (p.diet !== undefined) next.set('diet', p.diet)
        if (p.halalOnly !== undefined) next.set('halal', p.halalOnly ? '1' : '0')
        if (p.spicyOnly !== undefined) next.set('spicy', p.spicyOnly ? '1' : '0')
        if (p.query !== undefined) {
          if (p.query) next.set('q', p.query)
          else next.delete('q')
        }
        if (p.sort !== undefined) next.set('sort', p.sort)
        return next
      },
      { replace: true },
    )
  }
  const setSort = (s: SortKey) => patch({ sort: s })

  return (
    <main className="container menu-page">
      <header className="menu-page__head">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
      </header>

      <div className="menu-filters">
        <div className="menu-filters__search">
          <Search size={16} />
          <input
            value={filters.query}
            onChange={(e) => patch({ query: e.target.value })}
            placeholder="Search the menu…"
            aria-label="Search menu"
          />
        </div>

        <div className="seg seg--diet" role="group" aria-label="Diet">
          {DIET_OPTIONS.map((o) => (
            <button
              key={o.id}
              className={filters.diet === o.id ? 'is-on' : ''}
              onClick={() => patch({ diet: o.id })}
            >
              {o.label}
            </button>
          ))}
        </div>

        <button
          className={`menu-chip ${filters.halalOnly ? 'is-on' : ''}`}
          aria-pressed={filters.halalOnly}
          onClick={() => patch({ halalOnly: !filters.halalOnly })}
        >
          Halal
        </button>
        <button
          className={`menu-chip ${filters.spicyOnly ? 'is-on' : ''}`}
          aria-pressed={filters.spicyOnly}
          onClick={() => patch({ spicyOnly: !filters.spicyOnly })}
        >
          🌶️ Spicy
        </button>

        <label className="menu-sort">
          <SlidersHorizontal size={15} />
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort">
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="menu-count">{results.length} item{results.length === 1 ? '' : 's'}</p>

      {results.length > 0 ? (
        <ProductGrid products={results} />
      ) : (
        <div className="menu-empty">
          <span>🍕</span>
          <p>No items match those filters.</p>
        </div>
      )}
    </main>
  )
}
