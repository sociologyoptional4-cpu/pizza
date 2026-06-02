/* Content-matched food photography, fetched via image search and served locally from
   /public/images/<key>.jpg (resized ≤900px, q78). One image per semantic key — no reuse.
   photo() returns the public path; swap the files in /public/images to re-theme. */
import fallback from '../assets/pizza-cinematic.png'
import heroPizza from '../assets/pizza-hero.png'

export const FALLBACK_IMAGE = fallback

/** Semantic image keys → public path. Files live in /public/images. */
export const PHOTO_KEYS = [
  'margherita', 'pepperoni', 'chicken', 'veggie', 'feast', 'truffle', 'garlic',
  'cola', 'brownie', 'cheesepull', 'oven', 'family', 'stuffed', 'spicy', 'wings',
  'fries', 'icecream', 'milkshake', 'nuggets', 'softdrink', 'dessertcombo',
] as const

export type PhotoKey = (typeof PHOTO_KEYS)[number]

export function photo(key: PhotoKey): string {
  return `/images/${key}.jpg`
}

/** Kept for call-site compatibility; width param is a no-op now images are pre-sized. */
export function img(key: PhotoKey): string {
  return photo(key)
}

/** Hero carousel — same layout, richer cinematic banner photos. */
export const HERO_SLIDES: { key: PhotoKey; image?: string; title: string; sub: string }[] = [
  { key: 'pepperoni', image: fallback, title: 'Pizza with fire in it.', sub: 'Double pepperoni, blistered crust, straight from the wood oven.' },
  { key: 'cheesepull', image: heroPizza, title: 'That cheese pull.', sub: 'Fior di latte stretched over San Marzano tomato.' },
  { key: 'stuffed', title: 'Stuffed crust, no regrets.', sub: 'A molten cheese rim around every slice.' },
  { key: 'spicy', title: 'Bring the heat.', sub: "'Nduja, chilli and honey for the brave." },
  { key: 'garlic', title: 'Start with garlic bread.', sub: 'Wood-fired dough, roasted garlic butter, sea salt.' },
]
