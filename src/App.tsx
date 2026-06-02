import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bike,
  Camera,
  ChefHat,
  ChevronRight,
  CreditCard,
  Flame,
  Home,
  LayoutDashboard,
  Menu as MenuIcon,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Timer,
  Trophy,
  Utensils,
  WalletCards,
  X,
} from 'lucide-react'
import cinematicPizza from './assets/pizza-cinematic.png'
import './App.css'

type Category = 'Classic' | 'Chicken' | 'Veggie' | 'Feast' | 'Signature' | 'Sides'
type Size = 'Small 9"' | 'Medium 12"' | 'Large 14"'
type Crust = 'Italian' | 'Normal' | 'Deep pan' | 'Thin crust' | 'Stuffed crust'
type Fulfilment = 'Delivery' | 'Collection'

type Product = {
  id: string
  name: string
  category: Category
  description: string
  tags: string[]
  badge: string
  accent: string
  heat: number
  spicy?: boolean
  prices: Record<Size, number>
}

type CartItem = {
  key: string
  product: Product
  size: Size
  crust: Crust
  toppings: string[]
  quantity: number
  notes: string
}

const sizes: Size[] = ['Small 9"', 'Medium 12"', 'Large 14"']
const crusts: Crust[] = ['Italian', 'Normal', 'Deep pan', 'Thin crust', 'Stuffed crust']
const toppings = [
  'Cheese',
  'Tomato',
  'Mushroom',
  'Chicken',
  'Ham',
  'Tuna',
  'Sweetcorn',
  'Pineapple',
  'Jalapeno',
  'Onion',
  'Green peppers',
  'Pepperoni',
  'Sausage',
  'Beef',
  'Spicy beef',
  'Chilli peppers',
  'Olives',
  'Anchovies',
  'Prawns',
  'Bacon',
  'Chicken tikka',
  'BBQ sauce',
  'Chinese chicken',
]

const products: Product[] = [
  { id: 'margherita', name: 'Margherita', category: 'Classic', description: 'Tomato base, mozzarella and a clean basil finish.', tags: ['Fresh basil', 'Mozzarella'], badge: 'New classic', accent: '#ffd33d', heat: 18, prices: { 'Small 9"': 6.99, 'Medium 12"': 8.99, 'Large 14"': 10.99 } },
  { id: 'hawaiian', name: 'Hawaiian', category: 'Classic', description: 'Ham, pineapple and mozzarella over house tomato sauce.', tags: ['Sweet hit', 'Ham'], badge: 'Retro icon', accent: '#ffb037', heat: 24, prices: { 'Small 9"': 7.99, 'Medium 12"': 9.99, 'Large 14"': 12.49 } },
  { id: 'pepperoni', name: 'Pepperoni', category: 'Classic', description: 'Loaded pepperoni cups, mozzarella and tomato sauce.', tags: ['Best seller', 'Crispy cups'], badge: 'Most ordered', accent: '#ff2d3d', heat: 42, prices: { 'Small 9"': 7.99, 'Medium 12"': 10.49, 'Large 14"': 12.99 } },
  { id: 'bbq-chicken', name: 'BBQ Chicken', category: 'Chicken', description: 'Smoky BBQ base, roast chicken, onions and sweetcorn.', tags: ['Smoky', 'Chicken'], badge: 'Sauce boss', accent: '#ff8f1f', heat: 37, prices: { 'Small 9"': 8.49, 'Medium 12"': 11.49, 'Large 14"': 13.99 } },
  { id: 'chicken-feast', name: 'Chicken Feast', category: 'Chicken', description: 'Chicken, mushroom, sweetcorn and green peppers.', tags: ['Loaded', 'Crunch'], badge: 'Stacked', accent: '#ff7a33', heat: 35, prices: { 'Small 9"': 8.49, 'Medium 12"': 11.49, 'Large 14"': 13.99 } },
  { id: 'vegetarian-hot', name: 'Vegetarian Hot', category: 'Veggie', description: 'Onions, peppers, jalapenos, olives and chilli peppers.', tags: ['Veggie', 'Jalapeno'], badge: 'Fire veg', accent: '#43d66c', heat: 71, spicy: true, prices: { 'Small 9"': 7.99, 'Medium 12"': 10.99, 'Large 14"': 13.49 } },
  { id: 'meat-feast', name: 'Meat Feast', category: 'Feast', description: 'Ham, pepperoni, sausage, beef and smoky bacon.', tags: ['Protein', 'Bacon'], badge: 'Beast mode', accent: '#f2162f', heat: 58, prices: { 'Small 9"': 8.99, 'Medium 12"': 12.49, 'Large 14"': 14.99 } },
  { id: 'new-yorker', name: 'New Yorker', category: 'Signature', description: 'Pepperoni, ham, mushroom, onion and a big city cheese pull.', tags: ['Signature', 'Big slice'], badge: 'City heat', accent: '#f7c637', heat: 46, prices: { 'Small 9"': 8.99, 'Medium 12"': 12.49, 'Large 14"': 14.99 } },
  { id: 'tikka-masala', name: 'Tikka Masala', category: 'Signature', description: 'Chicken tikka, onion, green peppers and masala-spiced sauce.', tags: ['Fusion', 'Masala'], badge: 'Cult pick', accent: '#ff4f1f', heat: 77, spicy: true, prices: { 'Small 9"': 8.99, 'Medium 12"': 12.49, 'Large 14"': 14.99 } },
  { id: 'garlic-cheese', name: 'Garlic Bread with Cheese', category: 'Sides', description: 'Garlic butter, melted cheese and crisp golden edges.', tags: ['Side', 'Share'], badge: 'Perfect add-on', accent: '#ffd33d', heat: 12, prices: { 'Small 9"': 3.99, 'Medium 12"': 5.99, 'Large 14"': 7.49 } },
]

const allCategories = ['All', 'Classic', 'Chicken', 'Veggie', 'Feast', 'Signature', 'Sides'] as const
const whatsappNumber = '447700900123'

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)
}

function itemTotal(item: CartItem) {
  const toppingCost = item.toppings.length * 0.9
  const crustCost = item.crust === 'Stuffed crust' ? 2 : item.crust === 'Italian' ? 1 : 0
  return (item.product.prices[item.size] + toppingCost + crustCost) * item.quantity
}

function App() {
  const [category, setCategory] = useState<(typeof allCategories)[number]>('All')
  const [selected, setSelected] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [adminMode, setAdminMode] = useState(false)
  const [fulfilment, setFulfilment] = useState<Fulfilment>('Delivery')
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', notes: '' })
  const [cart, setCart] = useState<CartItem[]>([
    { key: 'seed-1', product: products[2], size: 'Medium 12"', crust: 'Italian', toppings: ['Extra cheese', 'Jalapeno'], quantity: 1, notes: '' },
  ])

  const filtered = category === 'All' ? products : products.filter((product) => product.category === category)
  const subtotal = cart.reduce((sum, item) => sum + itemTotal(item), 0)
  const deliveryFee = fulfilment === 'Delivery' && subtotal > 0 && subtotal < 25 ? 2.49 : 0
  const service = subtotal > 0 ? 0.5 : 0
  const total = subtotal + deliveryFee + service
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const orderMessage = useMemo(() => {
    const lines = [
      'New Pizza Rush order',
      `Name: ${customer.name || 'Not provided'}`,
      `Phone: ${customer.phone || 'Not provided'}`,
      `Mode: ${fulfilment}`,
      fulfilment === 'Delivery' ? `Address: ${customer.address || 'Not provided'}` : 'Address: Collection from store',
      '',
      'Items:',
      ...cart.map((item) => `- ${item.quantity}x ${item.product.name} (${item.size}, ${item.crust}) ${item.toppings.length ? `+ ${item.toppings.join(', ')}` : ''} ${item.notes ? `Note: ${item.notes}` : ''}`),
      '',
      `Subtotal: ${formatPrice(subtotal)}`,
      `Delivery: ${formatPrice(deliveryFee)}`,
      `Service: ${formatPrice(service)}`,
      `Total: ${formatPrice(total)}`,
      customer.notes ? `Order notes: ${customer.notes}` : '',
    ]
    return lines.filter(Boolean).join('\n')
  }, [cart, customer, deliveryFee, fulfilment, service, subtotal, total])

  function addToCart(product: Product, options?: Partial<CartItem>) {
    const item: CartItem = {
      key: crypto.randomUUID(),
      product,
      size: options?.size ?? 'Medium 12"',
      crust: options?.crust ?? 'Normal',
      toppings: options?.toppings ?? [],
      quantity: options?.quantity ?? 1,
      notes: options?.notes ?? '',
    }
    setCart((current) => [item, ...current])
    setCartOpen(true)
  }

  function updateQuantity(key: string, delta: number) {
    setCart((current) =>
      current
        .map((item) => (item.key === key ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  function openWhatsApp() {
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderMessage)}`, '_blank')
  }

  return (
    <div className="app">
      <Header cartCount={cartCount} onCart={() => setCartOpen(true)} onAdmin={() => setAdminMode((value) => !value)} />

      <main>
        <Hero onCart={() => setCartOpen(true)} onSelect={() => setSelected(products[2])} />
        <BestSellers products={products.slice(0, 6)} onAdd={addToCart} onSelect={setSelected} />
        <MenuStudio products={filtered} category={category} setCategory={setCategory} onAdd={addToCart} onSelect={setSelected} />
        <StorySections onAdd={() => addToCart(products[6])} />
        <CheckoutShowcase
          customer={customer}
          fulfilment={fulfilment}
          total={total}
          setCustomer={setCustomer}
          setFulfilment={setFulfilment}
          onWhatsApp={openWhatsApp}
        />
        <TrackingAndTrust />
        {adminMode && <AdminDashboard />}
      </main>

      <button className="floating-whatsapp" type="button" onClick={openWhatsApp} aria-label="Order through WhatsApp">
        <MessageCircle size={24} />
      </button>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        <a href="#home"><Home size={20} /> Home</a>
        <a href="#menu"><MenuIcon size={20} /> Menu</a>
        <button type="button" onClick={() => setCartOpen(true)}><ShoppingBag size={20} /> Cart</button>
        <a href="#track"><Bike size={20} /> Track</a>
      </nav>

      <AnimatePresence>
        {selected && (
          <Customizer
            product={selected}
            onClose={() => setSelected(null)}
            onAdd={(item) => {
              addToCart(selected, item)
              setSelected(null)
            }}
          />
        )}
      </AnimatePresence>

      <CartDrawer
        cart={cart}
        open={cartOpen}
        fulfilment={fulfilment}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        service={service}
        total={total}
        onClose={() => setCartOpen(false)}
        onQuantity={updateQuantity}
        onWhatsApp={openWhatsApp}
      />
    </div>
  )
}

function Header({ cartCount, onCart, onAdmin }: { cartCount: number; onCart: () => void; onAdmin: () => void }) {
  return (
    <header className="site-header">
      <a className="brand" href="#home" aria-label="Pizza Rush home">
        <span className="brand-mark"><Flame size={20} /></span>
        <span>Pizza Rush</span>
      </a>
      <nav aria-label="Primary navigation">
        {['Menu', 'Deals', 'Fresh', 'Track', 'FAQ'].map((item) => (
          <a key={item} href={`#${item === 'Fresh' ? 'made-fresh' : item.toLowerCase()}`}>{item}</a>
        ))}
      </nav>
      <div className="header-actions">
        <a className="call-chip" href="tel:+447700900123"><Phone size={17} /> Call store</a>
        <button className="ghost-button" type="button" onClick={onAdmin}><LayoutDashboard size={18} /> Admin</button>
        <button className="cart-button" type="button" onClick={onCart}><ShoppingBag size={18} /> {cartCount}</button>
      </div>
    </header>
  )
}

function Hero({ onCart, onSelect }: { onCart: () => void; onSelect: () => void }) {
  return (
    <section className="hero-theatre" id="home">
      <img className="hero-photo" src={cinematicPizza} alt="Cinematic hot pizza with smoke and flying toppings" />
      <div className="hero-vignette" />
      <div className="heat-orb heat-one" />
      <div className="heat-orb heat-two" />
      {['top-a', 'top-b', 'top-c', 'top-d', 'top-e', 'top-f'].map((item, index) => (
        <span className={`flying-topping ${item}`} key={item} style={{ '--delay': `${index * 0.4}s` } as React.CSSProperties} />
      ))}
      <motion.div className="hero-copy" initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <h1><span>This is</span> the best pizza place.</h1>
        <p>Hot dough, molten cheese, live deals and a checkout flow that feels faster than craving itself.</p>
        <div className="hero-actions">
          <a className="primary-button magnetic" href="#menu">Order now <ArrowRight size={20} /></a>
          <button className="secondary-button" type="button" onClick={onSelect}>Build my pizza</button>
          <button className="glass-button" type="button" onClick={onCart}>Open cart</button>
        </div>
      </motion.div>
      <motion.div className="hero-command" initial={{ opacity: 0, x: 42 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
        <div className="delivery-ring">
          <span>28</span>
          <b>mins</b>
        </div>
        <div>
          <strong>Live delivery promise</strong>
          <p>Kitchen is firing orders. Collection slots open now.</p>
        </div>
      </motion.div>
      <motion.div className="review-float" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div><Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} /></div>
        <strong>“Tastes like a global chain finally arrived locally.”</strong>
      </motion.div>
      <div className="hero-stats">
        <span><Activity size={16} /> 64 orders today</span>
        <span><Flame size={16} /> Dough fired fresh</span>
        <span><Trophy size={16} /> 4.8 Google rating</span>
      </div>
    </section>
  )
}

function BestSellers({ products, onAdd, onSelect }: { products: Product[]; onAdd: (product: Product) => void; onSelect: (product: Product) => void }) {
  return (
    <section className="best-sellers" id="deals">
      <div className="section-kicker"><Flame size={18} /> Trending now</div>
      <div className="section-heading dramatic">
        <h2>Best sellers, built like movie posters.</h2>
        <a href="#menu">Explore menu <ChevronRight size={18} /></a>
      </div>
      <div className="seller-rail">
        {products.map((product, index) => (
          <motion.article className="seller-card" key={product.id} whileHover={{ y: -10, rotate: index % 2 ? 1 : -1 }}>
            <div className="seller-art" style={{ '--accent': product.accent } as React.CSSProperties}>
              <img src={cinematicPizza} alt="" />
              <span>{product.badge}</span>
            </div>
            <div className="seller-copy">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <div className="seller-meta">
                <strong>{formatPrice(product.prices['Medium 12"'])}</strong>
                <button type="button" onClick={() => onSelect(product)}>Customize</button>
                <button type="button" className="round-add" onClick={() => onAdd(product)}><Plus size={18} /></button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

function MenuStudio(props: {
  products: Product[]
  category: (typeof allCategories)[number]
  setCategory: (category: (typeof allCategories)[number]) => void
  onAdd: (product: Product, options?: Partial<CartItem>) => void
  onSelect: (product: Product) => void
}) {
  return (
    <section className="menu-studio" id="menu">
      <div className="menu-top">
        <div>
          <div className="section-kicker"><Utensils size={18} /> Pizza builder studio</div>
          <h2>Make ordering feel like play.</h2>
        </div>
        <div className="search-shell">
          <Search size={19} />
          <span>Search pizza, side, topping</span>
          <SlidersHorizontal size={19} />
        </div>
      </div>
      <div className="sticky-categories">
        {allCategories.map((item) => (
          <button className={props.category === item ? 'active' : ''} key={item} type="button" onClick={() => props.setCategory(item)}>
            {item}
          </button>
        ))}
      </div>
      <motion.div className="product-grid" layout>
        <AnimatePresence mode="popLayout">
          {props.products.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={props.onAdd} onSelect={props.onSelect} />
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}

function ProductCard({ product, onAdd, onSelect }: { product: Product; onAdd: (product: Product, options?: Partial<CartItem>) => void; onSelect: (product: Product) => void }) {
  const [size, setSize] = useState<Size>('Medium 12"')
  const [quantity, setQuantity] = useState(1)

  return (
    <motion.article className="product-card" layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
      <button className="product-image" type="button" style={{ '--accent': product.accent } as React.CSSProperties} onClick={() => onSelect(product)} aria-label={`Customize ${product.name}`}>
        <img src={cinematicPizza} alt="" />
        <span className="badge">{product.badge}</span>
        <span className="heat-meter"><Flame size={13} /> {product.heat}% heat</span>
      </button>
      <div className="product-body">
        <div className="product-title">
          <h3>{product.name}</h3>
          <strong>{formatPrice(product.prices[size])}</strong>
        </div>
        <p>{product.description}</p>
        <div className="tag-row">{product.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <div className="inline-size">
          {sizes.map((item) => (
            <button className={size === item ? 'active' : ''} key={item} type="button" onClick={() => setSize(item)}>
              {item.replace(' ', '\u00a0')}
            </button>
          ))}
        </div>
        <div className="product-actions">
          <div className="qty-control">
            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button>
            <b>{quantity}</b>
            <button type="button" onClick={() => setQuantity(quantity + 1)}><Plus size={16} /></button>
          </div>
          <button className="add-cart" type="button" onClick={() => onAdd(product, { size, quantity })}>Add <Sparkles size={16} /></button>
          <button className="ghost-mini" type="button" onClick={() => onSelect(product)}>Tune</button>
        </div>
      </div>
    </motion.article>
  )
}

function StorySections({ onAdd }: { onAdd: () => void }) {
  return (
    <>
      <section className="combo-slider" id="made-fresh">
        <div className="combo-card mega">
          <span>Combo drop</span>
          <h2>Mega Feast Box</h2>
          <p>Two large pizzas, garlic bread, wedges and drinks. Built for the table, priced for the win.</p>
          <button type="button" onClick={onAdd}>Add feast <Plus size={18} /></button>
        </div>
        <div className="fresh-card">
          <ChefHat size={38} />
          <h3>Made fresh every run.</h3>
          <p>Dough, sauce, cheese and toppings move through a live prep line that feels visible to the customer.</p>
          <div className="fresh-bars"><i /><i /><i /></div>
        </div>
      </section>
      <section className="ingredient-showcase">
        <div>
          <div className="section-kicker"><Sparkles size={18} /> Ingredient theatre</div>
          <h2>Every topping gets a spotlight.</h2>
          <p>Interactive chips and animated ingredient moments make customization feel premium instead of administrative.</p>
        </div>
        <div className="ingredient-grid">
          {['Pepperoni', 'Chicken tikka', 'Jalapeno', 'Prawns', 'BBQ sauce', 'Sweetcorn', 'Olives', 'Bacon'].map((item, index) => (
            <motion.span key={item} whileHover={{ scale: 1.08, rotate: index % 2 ? 2 : -2 }}>{item}</motion.span>
          ))}
        </div>
      </section>
      <section className="activity-feed">
        <div className="video-review">
          <Camera size={34} />
          <h3>Customer video reviews</h3>
          <p>Instagram-style food gallery, short reactions and social proof slots ready for real content.</p>
        </div>
        <div className="feed-list">
          {['Pepperoni Feast sent to E1', 'Garlic Bread added by Sarah', 'Meat Feast moved to preparing', 'Collection order ready in 8m'].map((item, index) => (
            <div className="feed-row" key={item}>
              <span>{index + 1}</span>
              <p>{item}</p>
              <b>{index + 2}m ago</b>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function CheckoutShowcase(props: {
  customer: { name: string; phone: string; address: string; notes: string }
  fulfilment: Fulfilment
  total: number
  setCustomer: (customer: { name: string; phone: string; address: string; notes: string }) => void
  setFulfilment: (mode: Fulfilment) => void
  onWhatsApp: () => void
}) {
  return (
    <section className="checkout-showcase">
      <div className="checkout-copy">
        <div className="section-kicker"><WalletCards size={18} /> Luxury checkout</div>
        <h2>Slide up, pay fast, send to WhatsApp.</h2>
        <p>A multi-step drawer feeling with delivery timing, payment selector, address field, order notes and a generated message.</p>
      </div>
      <div className="checkout-phone">
        <div className="phone-handle" />
        <h3>Checkout</h3>
        <div className="step-dots"><span className="active" /><span className="active" /><span /></div>
        <div className="toggle-row">
          {(['Delivery', 'Collection'] as Fulfilment[]).map((mode) => (
            <button className={props.fulfilment === mode ? 'selected' : ''} key={mode} type="button" onClick={() => props.setFulfilment(mode)}>{mode}</button>
          ))}
        </div>
        <input placeholder="Name" value={props.customer.name} onChange={(event) => props.setCustomer({ ...props.customer, name: event.target.value })} />
        <input placeholder="Phone number" value={props.customer.phone} onChange={(event) => props.setCustomer({ ...props.customer, phone: event.target.value })} />
        <input placeholder="Start typing address" value={props.customer.address} onChange={(event) => props.setCustomer({ ...props.customer, address: event.target.value })} />
        <textarea placeholder="Kitchen notes" value={props.customer.notes} onChange={(event) => props.setCustomer({ ...props.customer, notes: event.target.value })} />
        <div className="payment-grid">
          <span><WalletCards size={18} /> Cash</span>
          <span><CreditCard size={18} /> Card</span>
          <span>Apple Pay</span>
          <span>Pay link</span>
        </div>
        <button className="whatsapp-checkout" type="button" onClick={props.onWhatsApp}>
          <MessageCircle size={20} /> Send order {formatPrice(props.total)}
        </button>
      </div>
    </section>
  )
}

function TrackingAndTrust() {
  return (
    <section className="tracking-section" id="track">
      <div>
        <div className="section-kicker"><Timer size={18} /> Live order timeline</div>
        <h2>Track the heat from oven to door.</h2>
      </div>
      <div className="timeline">
        {['New', 'Preparing', 'Ready', 'Out for Delivery', 'Completed'].map((status, index) => (
          <div className={`status-row ${index < 3 ? 'done' : ''}`} key={status}>
            <span>{index + 1}</span>
            <p>{status}</p>
          </div>
        ))}
      </div>
      <div className="trust-grid" id="faq">
        <article><Star size={24} /><strong>4.8 Google rating</strong><p>Local SEO and review-proof surface ready.</p></article>
        <article><Bike size={24} /><strong>28 minute delivery</strong><p>Delivery promise and fee logic update live.</p></article>
        <article><MessageCircle size={24} /><strong>WhatsApp ordering</strong><p>Prefilled order messages without API dependency.</p></article>
      </div>
    </section>
  )
}

function Customizer({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: (item: Partial<CartItem>) => void }) {
  const [size, setSize] = useState<Size>('Medium 12"')
  const [crust, setCrust] = useState<Crust>('Normal')
  const [selectedToppings, setSelectedToppings] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const total = (product.prices[size] + selectedToppings.length * 0.9 + (crust === 'Stuffed crust' ? 2 : crust === 'Italian' ? 1 : 0)) * quantity

  function toggleTopping(topping: string) {
    setSelectedToppings((current) => current.includes(topping) ? current.filter((item) => item !== topping) : [...current, topping])
  }

  return (
    <motion.div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`Customize ${product.name}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.section className="customizer" initial={{ y: 80, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 80, opacity: 0 }}>
        <button className="close-button" type="button" onClick={onClose}><X size={22} /></button>
        <div className="custom-visual" style={{ '--accent': product.accent } as React.CSSProperties}>
          <img src={cinematicPizza} alt="" />
          <span>{product.badge}</span>
        </div>
        <div className="custom-panel">
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <div className="choice-group">
            <strong>Size</strong>
            <div>{sizes.map((item) => <button className={size === item ? 'active' : ''} key={item} type="button" onClick={() => setSize(item)}>{item}</button>)}</div>
          </div>
          <div className="choice-group">
            <strong>Crust</strong>
            <div>{crusts.map((item) => <button className={crust === item ? 'active' : ''} key={item} type="button" onClick={() => setCrust(item)}>{item}</button>)}</div>
          </div>
          <div className="choice-group">
            <strong>Extra toppings</strong>
            <div className="topping-grid">{toppings.map((item) => <button className={selectedToppings.includes(item) ? 'active' : ''} key={item} type="button" onClick={() => toggleTopping(item)}>{item}</button>)}</div>
          </div>
          <textarea placeholder="Notes for kitchen" value={notes} onChange={(event) => setNotes(event.target.value)} />
          <div className="custom-footer">
            <div className="qty-control">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={18} /></button>
              <strong>{quantity}</strong>
              <button type="button" onClick={() => setQuantity(quantity + 1)}><Plus size={18} /></button>
            </div>
            <button className="primary-button" type="button" onClick={() => onAdd({ size, crust, toppings: selectedToppings, quantity, notes })}>
              Add {formatPrice(total)}
            </button>
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}

function CartDrawer(props: {
  cart: CartItem[]
  open: boolean
  fulfilment: Fulfilment
  subtotal: number
  deliveryFee: number
  service: number
  total: number
  onClose: () => void
  onQuantity: (key: string, delta: number) => void
  onWhatsApp: () => void
}) {
  return (
    <aside className={`cart-drawer ${props.open ? 'open' : ''}`} aria-label="Shopping cart">
      <button className="close-button" type="button" onClick={props.onClose}><X size={22} /></button>
      <h2>Your fire cart</h2>
      <p>{props.fulfilment} in around 28 minutes</p>
      <div className="cart-items">
        {props.cart.length === 0 ? (
          <div className="empty-cart"><Sparkles size={34} /><strong>Your cart is ready for greatness.</strong></div>
        ) : props.cart.map((item) => (
          <article className="cart-line" key={item.key}>
            <div>
              <h3>{item.product.name}</h3>
              <p>{item.size} / {item.crust}</p>
              {item.toppings.length > 0 && <span>{item.toppings.join(', ')}</span>}
            </div>
            <div className="line-actions">
              <strong>{formatPrice(itemTotal(item))}</strong>
              <div className="qty-control">
                <button type="button" onClick={() => props.onQuantity(item.key, -1)}><Minus size={16} /></button>
                <b>{item.quantity}</b>
                <button type="button" onClick={() => props.onQuantity(item.key, 1)}><Plus size={16} /></button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="totals">
        <span>Subtotal <b>{formatPrice(props.subtotal)}</b></span>
        <span>Delivery <b>{formatPrice(props.deliveryFee)}</b></span>
        <span>Service <b>{formatPrice(props.service)}</b></span>
        <strong>Total <b>{formatPrice(props.total)}</b></strong>
      </div>
      <button className="whatsapp-checkout" type="button" onClick={props.onWhatsApp}>Checkout on WhatsApp</button>
    </aside>
  )
}

function AdminDashboard() {
  return (
    <section className="admin-section" id="admin">
      <div className="admin-head">
        <div>
          <div className="section-kicker"><BarChart3 size={18} /> Owner command center</div>
          <h2>Admin dashboard</h2>
          <p>Manage menu, orders, prices, toppings, banners, delivery settings and customer activity.</p>
        </div>
        <button type="button">Create product</button>
      </div>
      <div className="analytics-grid">
        {[
          ['Today revenue', '£842', '+18%'],
          ['Active orders', '14', '6 preparing'],
          ['Avg prep time', '17m', '-3m'],
          ['Top pizza', 'Meat Feast', '42 sold'],
        ].map(([label, value, meta]) => (
          <article key={label}><span>{label}</span><strong>{value}</strong><p>{meta}</p></article>
        ))}
      </div>
      <div className="admin-grid">
        {['Products', 'Orders', 'Settings'].map((title, panelIndex) => (
          <div className="admin-panel" key={title}>
            <h3>{title}</h3>
            {(panelIndex === 0 ? products.slice(0, 6).map((p) => p.name) : panelIndex === 1 ? ['New', 'Preparing', 'Ready', 'Out for Delivery', 'Completed', 'Cancelled'] : ['WhatsApp number', 'Opening hours', 'Delivery areas', 'Delivery charges', 'Images', 'Banners']).map((row, index) => (
              <div className="admin-row" key={row}>
                <span>{row}</span>
                <b>{panelIndex === 0 ? formatPrice(products[index]?.prices['Medium 12"'] ?? 0) : 'Ready'}</b>
                <button type="button">Manage</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

export default App
