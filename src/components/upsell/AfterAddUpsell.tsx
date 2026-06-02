import { menuRepository } from '../../data/repository'
import { UPSELLS } from '../../data/upsell'
import { formatMoney } from '../../lib/money'
import { createDraft } from '../../lib/draft'
import { useCartStore } from '../../store/cartStore'
import { useUIStore } from '../../store/uiStore'
import { Sheet } from '../ui/Sheet'
import { Button } from '../ui/Button'
import './upsell.css'

/** Shown right after a pizza is added. Offers one-tap add-ons (garlic bread, drink, dessert). */
export function AfterAddUpsell() {
  const upsellFor = useUIStore((s) => s.upsellFor)
  const hideUpsell = useUIStore((s) => s.hideUpsell)
  const openCart = useUIStore((s) => s.openCart)
  const addDraft = useCartStore((s) => s.addDraft)

  const productSuggestions = UPSELLS['after-add-pizza'].filter((u) => u.productId)

  function openCartAfterUpsell() {
    hideUpsell()
    window.setTimeout(openCart, 240)
  }

  return (
    <Sheet open={!!upsellFor} onClose={hideUpsell} variant="modal" label="Anything else?">
      <div className="afteradd">
        <span className="afteradd__check">✓</span>
        <h3 className="afteradd__title">Added to your order</h3>
        <p className="afteradd__sub">Make it a feast — popular with your pizza</p>

        <div className="afteradd__grid">
          {productSuggestions.map((u) => {
            const p = menuRepository.getProduct(u.productId!)
            if (!p) return null
            return (
              <button
                key={u.id}
                className="afteradd__card"
                onClick={() => {
                  addDraft({ ...createDraft(p.id), quantity: 1 })
                  openCartAfterUpsell()
                }}
              >
                <img src={p.image} alt="" aria-hidden />
                <span className="afteradd__name">{p.name}</span>
                <span className="afteradd__price tnum">+{formatMoney(p.basePrice)}</span>
              </button>
            )
          })}
        </div>

        <div className="afteradd__actions">
          <Button variant="ghost" onClick={hideUpsell}>
            Keep browsing
          </Button>
          <Button onClick={openCartAfterUpsell}>View cart</Button>
        </div>
      </div>
    </Sheet>
  )
}
