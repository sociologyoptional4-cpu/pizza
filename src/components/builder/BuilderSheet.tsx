import { useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Clock, Flame, Star, X } from 'lucide-react'
import { menuRepository } from '../../data/repository'
import type { PizzaDraft } from '../../data/types'
import { computePrice } from '../../lib/pricing'
import { createDraft } from '../../lib/draft'
import { useCartStore } from '../../store/cartStore'
import { useUIStore } from '../../store/uiStore'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Stepper } from '../ui/Stepper'
import { PriceCounter } from '../ui/PriceCounter'
import { PizzaVisual } from './PizzaVisual'
import { ChoiceGrid, type Choice } from './ChoiceGrid'
import { ToppingPicker } from './ToppingPicker'
import './builder.css'

const STEPS = ['Size', 'Base', 'Crust', 'Toppings', 'Half & half', 'Quantity', 'Notes', 'Review'] as const
const NOTE_CHIPS = ['No onions', 'Extra spicy', 'Well done', 'Light cheese']
const MAX_NOTE = 200

export function BuilderSheet() {
  const builder = useUIStore((s) => s.builder)
  const closeBuilder = useUIStore((s) => s.closeBuilder)
  return (
    <Sheet open={!!builder} onClose={closeBuilder} variant="modal" label="Customize your pizza">
      {builder && (
        <BuilderBody
          key={builder.productId + (builder.editKey ?? '')}
          productId={builder.productId}
          editKey={builder.editKey}
          initialDraft={builder.initialDraft}
        />
      )}
    </Sheet>
  )
}

type BuilderBodyProps = { productId: string; editKey?: string; initialDraft?: PizzaDraft }

function BuilderBody({ productId, editKey, initialDraft }: BuilderBodyProps) {
  const closeBuilder = useUIStore((s) => s.closeBuilder)
  const triggerFlight = useUIStore((s) => s.triggerFlight)
  const showUpsell = useUIStore((s) => s.showUpsell)
  const openCart = useUIStore((s) => s.openCart)
  const addDraft = useCartStore((s) => s.addDraft)
  const updateDraft = useCartStore((s) => s.updateDraft)

  const product = menuRepository.getProduct(productId)!
  const [draft, setDraft] = useState<PizzaDraft>(
    () => initialDraft ?? createDraft(productId),
  )
  const [step, setStep] = useState(0)
  const visualRef = useRef<HTMLDivElement>(null)

  const price = useMemo(() => computePrice(draft), [draft])
  const patch = (p: Partial<PizzaDraft>) => setDraft((d) => ({ ...d, ...p }))

  const pizzaChoices: Choice[] = menuRepository
    .getProducts()
    .filter((p) => p.customizable)
    .map((p) => ({ id: p.id, label: p.name, delta: undefined }))

  function toggleTopping(id: string) {
    setDraft((d) => ({
      ...d,
      addedToppings: d.addedToppings.includes(id)
        ? d.addedToppings.filter((x) => x !== id)
        : [...d.addedToppings, id],
    }))
  }
  function toggleDefault(id: string) {
    setDraft((d) => ({
      ...d,
      removedToppings: d.removedToppings.includes(id)
        ? d.removedToppings.filter((x) => x !== id)
        : [...d.removedToppings, id],
    }))
  }
  function toggleHalfTopping(side: 'left' | 'right', id: string) {
    setDraft((d) => {
      if (!d.halves) return d
      const half = d.halves[side]
      const next = half.addedToppings.includes(id)
        ? half.addedToppings.filter((x) => x !== id)
        : [...half.addedToppings, id]
      return { ...d, halves: { ...d.halves, [side]: { ...half, addedToppings: next } } }
    })
  }

  function addToCart() {
    if (editKey) updateDraft(editKey, draft)
    else addDraft(draft)

    const rect = visualRef.current?.getBoundingClientRect()
    if (rect) {
      triggerFlight({
        image: product.image,
        from: { x: rect.left, y: rect.top, w: rect.width, h: rect.height },
      })
    }
    closeBuilder()
    if (editKey) openCart()
    else showUpsell(product.id)
  }

  const isLast = step === STEPS.length - 1
  const stuffedAvailable = menuRepository.getCrusts()

  return (
    <div className="builder">
      <header className="builder__head">
        <div className="builder__progress" aria-hidden>
          <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
        <button className="builder__close" onClick={closeBuilder} aria-label="Close">
          <X size={20} />
        </button>
      </header>

      <div className="builder__body">
        <aside className="builder__visual">
          <PizzaVisual draft={draft} imageRef={visualRef} />
          <h3 className="builder__name">{product.name}</h3>
          <p className="builder__desc">{product.description}</p>
          <div className="builder__meta">
            <Badge tone={product.diet === 'veg' ? 'veg' : 'nonveg'}>
              {product.diet === 'veg' ? 'Veg' : 'Non-veg'}
            </Badge>
            {product.halal && <Badge tone="neutral">Halal</Badge>}
            <span className="meta-chip">
              <Flame size={14} /> Spice {product.spice}/5
            </span>
            <span className="meta-chip">
              <Star size={14} /> {product.rating}
            </span>
            <span className="meta-chip">
              <Clock size={14} /> {product.prepMinutes} min
            </span>
          </div>
          {product.allergens.length > 0 && (
            <p className="builder__allergens">Allergens: {product.allergens.join(', ')}</p>
          )}
        </aside>

        <section className="builder__step" aria-live="polite">
          <p className="eyebrow">
            Step {step + 1} / {STEPS.length}
          </p>
          <h4 className="builder__step-title">{STEPS[step]}</h4>

          {step === 0 && (
            <ChoiceGrid
              label="Size"
              value={draft.sizeId}
              onChange={(id) => patch({ sizeId: id as PizzaDraft['sizeId'] })}
              choices={menuRepository.getSizes().map((s) => ({
                id: s.id,
                label: s.label,
                sublabel: `${s.inches} inch`,
              }))}
            />
          )}
          {step === 1 && (
            <ChoiceGrid
              label="Base"
              value={draft.baseId}
              onChange={(id) => patch({ baseId: id as PizzaDraft['baseId'] })}
              choices={menuRepository.getBases().map((b) => ({ id: b.id, label: b.label, delta: b.surcharge }))}
            />
          )}
          {step === 2 && (
            <ChoiceGrid
              label="Crust"
              value={draft.crustId}
              onChange={(id) => patch({ crustId: id as PizzaDraft['crustId'] })}
              choices={stuffedAvailable.map((c) => ({
                id: c.id,
                label: c.label,
                delta: c.surcharge,
                disabled: !c.available,
              }))}
            />
          )}
          {step === 3 && (
            <>
              {product.defaultToppings.length > 0 && (
                <div className="included">
                  <p className="included__title">Included — tap to remove</p>
                  <div className="included__chips">
                    {product.defaultToppings.map((id) => {
                      const t = menuRepository.getTopping(id)
                      const removed = draft.removedToppings.includes(id)
                      return (
                        <button
                          key={id}
                          type="button"
                          className={`chip ${removed ? 'is-removed' : ''}`}
                          onClick={() => toggleDefault(id)}
                        >
                          {removed ? 'No ' : ''}
                          {t?.name ?? id}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              {!draft.halfAndHalf && <ToppingPicker added={draft.addedToppings} onToggle={toggleTopping} />}
              {draft.halfAndHalf && (
                <p className="hint">Toppings are set per half in the Half &amp; half step.</p>
              )}
            </>
          )}
          {step === 4 && (
            <div className="halfhalf">
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={draft.halfAndHalf}
                  onChange={(e) => patch({ halfAndHalf: e.target.checked })}
                />
                <span>Make it half &amp; half</span>
              </label>
              {draft.halfAndHalf && draft.halves && (
                <div className="halves">
                  <div className="half-col">
                    <h5>Left half</h5>
                    <ChoiceGrid
                      label="Left half pizza"
                      value={draft.halves.left.productId}
                      onChange={(id) =>
                        setDraft((d) => ({
                          ...d,
                          halves: { ...d.halves!, left: { ...d.halves!.left, productId: id } },
                        }))
                      }
                      choices={pizzaChoices}
                    />
                    <ToppingPicker
                      added={draft.halves.left.addedToppings}
                      onToggle={(id) => toggleHalfTopping('left', id)}
                    />
                  </div>
                  <div className="half-col">
                    <h5>Right half</h5>
                    <ChoiceGrid
                      label="Right half pizza"
                      value={draft.halves.right.productId}
                      onChange={(id) =>
                        setDraft((d) => ({
                          ...d,
                          halves: { ...d.halves!, right: { ...d.halves!.right, productId: id } },
                        }))
                      }
                      choices={pizzaChoices}
                    />
                    <ToppingPicker
                      added={draft.halves.right.addedToppings}
                      onToggle={(id) => toggleHalfTopping('right', id)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          {step === 5 && (
            <div className="qty-step">
              <p className="hint">How many of this pizza?</p>
              <Stepper value={draft.quantity} onChange={(q) => patch({ quantity: q })} />
            </div>
          )}
          {step === 6 && (
            <div className="notes-step">
              <div className="note-chips">
                {NOTE_CHIPS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="chip"
                    onClick={() =>
                      patch({ notes: draft.notes ? `${draft.notes}, ${c}` : c })
                    }
                  >
                    {c}
                  </button>
                ))}
              </div>
              <textarea
                className="note-box"
                maxLength={MAX_NOTE}
                placeholder="Kitchen notes (e.g. well done, no garlic)…"
                value={draft.notes}
                onChange={(e) => patch({ notes: e.target.value })}
              />
              <span className="note-count tnum">
                {draft.notes.length}/{MAX_NOTE}
              </span>
            </div>
          )}
          {step === 7 && <ReviewStep draft={draft} />}
        </section>
      </div>

      <footer className="builder__foot">
        <div className="builder__total">
          <span className="builder__total-label">Total</span>
          <PriceCounter value={price.total} />
        </div>
        <div className="builder__nav">
          {step > 0 && (
            <Button variant="ghost" size="md" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft size={16} /> Back
            </Button>
          )}
          {!isLast ? (
            <Button size="md" onClick={() => setStep((s) => s + 1)}>
              Next <ArrowRight size={16} />
            </Button>
          ) : (
            <Button size="lg" onClick={addToCart}>
              {editKey ? 'Update item' : 'Add to cart'} · <PriceCounter value={price.total} />
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}

function ReviewStep({ draft }: { draft: PizzaDraft }) {
  const breakdown = computePrice(draft)
  const size = menuRepository.getSizes().find((s) => s.id === draft.sizeId)
  const base = menuRepository.getBases().find((b) => b.id === draft.baseId)
  const crust = menuRepository.getCrusts().find((c) => c.id === draft.crustId)
  return (
    <ul className="review">
      <li>
        <span>Size</span>
        <span>{size?.label}</span>
      </li>
      <li>
        <span>Base / crust</span>
        <span>
          {base?.label}, {crust?.label}
        </span>
      </li>
      {breakdown.additions.map((a) => (
        <li key={a.label}>
          <span>{a.label}</span>
          <span className="tnum">+{a.amount.toFixed(2)}</span>
        </li>
      ))}
      <li>
        <span>Quantity</span>
        <span className="tnum">{draft.quantity}</span>
      </li>
      {draft.notes && (
        <li>
          <span>Notes</span>
          <span>{draft.notes}</span>
        </li>
      )}
    </ul>
  )
}
