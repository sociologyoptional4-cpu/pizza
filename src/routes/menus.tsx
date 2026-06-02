/* Thin menu-surface route wrappers. All share MenuLayout (filter/sort/search). */
import { menuRepository } from '../data/repository'
import { MenuLayout } from '../components/menu/MenuLayout'

const all = () => menuRepository.getProducts()
const pizzas = () => all().filter((p) => p.customizable)
const byCategory = (c: string) => all().filter((p) => p.category === c)

export function FullMenu() {
  return <MenuLayout eyebrow="Everything" title="Full menu" lead="Pizzas, sides, drinks and sweets — filter to taste." products={all()} />
}

export function PizzaMenu() {
  return <MenuLayout eyebrow="Wood-fired" title="Pizza menu" lead="Tap any pizza to size, top and make it yours." products={pizzas()} />
}

export function VegetarianMenu() {
  return <MenuLayout eyebrow="Garden" title="Vegetarian menu" lead="Meat-free, full of flavour." products={all()} initialFilters={{ diet: 'veg' }} />
}

export function HalalMenu() {
  return <MenuLayout eyebrow="Halal certified" title="Halal menu" lead="Every halal-certified dish in one place." products={all()} initialFilters={{ halalOnly: true }} />
}

export function SpicyMenu() {
  return <MenuLayout eyebrow="Bring the heat" title="Spicy menu" lead="For chilli lovers — heat scale 3 and up." products={all()} initialFilters={{ spicyOnly: true }} />
}

export function KidsMeals() {
  return <MenuLayout eyebrow="For the little ones" title="Kids meals" lead="Smaller portions, big smiles." products={byCategory('Kids')} />
}

export function Sides() {
  return <MenuLayout eyebrow="On the side" title="Sides" lead="Garlic bread, wings, dips and more." products={byCategory('Sides')} />
}

export function Drinks() {
  return <MenuLayout eyebrow="To wash it down" title="Drinks" lead="Ice-cold cans and bottles." products={byCategory('Drinks')} />
}

export function Desserts() {
  return <MenuLayout eyebrow="Sweet finish" title="Desserts" lead="Warm brownies, cookies and more." products={byCategory('Desserts')} />
}
