/* Data-driven upsell rules. Merchandising changes here need no UI edits. */
export type UpsellTrigger = 'after-add-pizza' | 'in-cart' | 'checkout'

export type UpsellSuggestion = {
  id: string
  label: string
  productId?: string
  /** action upgrades the just-added draft instead of adding a product */
  action?: 'upgrade-large' | 'add-stuffed-crust'
  priceHint?: number
}

export const UPSELLS: Record<UpsellTrigger, UpsellSuggestion[]> = {
  'after-add-pizza': [
    { id: 'u-garlic', label: 'Add garlic bread?', productId: 'garlic-bread', priceHint: 4.5 },
    { id: 'u-drink', label: 'Add a drink?', productId: 'cola', priceHint: 1.8 },
    { id: 'u-large', label: 'Upgrade to large?', action: 'upgrade-large' },
    { id: 'u-stuffed', label: 'Add stuffed crust?', action: 'add-stuffed-crust', priceHint: 2.5 },
    { id: 'u-dessert', label: 'Add dessert?', productId: 'brownie', priceHint: 3.9 },
  ],
  'in-cart': [
    { id: 'c-garlic', label: 'Garlic bread', productId: 'garlic-bread', priceHint: 4.5 },
    { id: 'c-drink', label: 'Cola 330ml', productId: 'cola', priceHint: 1.8 },
    { id: 'c-dessert', label: 'Triple choc brownie', productId: 'brownie', priceHint: 3.9 },
  ],
  checkout: [
    { id: 'k-drink', label: 'Popular with your order: Cola', productId: 'cola', priceHint: 1.8 },
    { id: 'k-dessert', label: 'Last chance: brownie', productId: 'brownie', priceHint: 3.9 },
  ],
}
