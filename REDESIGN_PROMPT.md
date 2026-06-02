# 🍕 MASTER REDESIGN PROMPT — "FORNO" Pizza Ordering Experience

> A single source-of-truth brief for rebuilding this React + Vite + framer-motion pizza app into a god-tier ordering experience. Hand this entire file to any capable agent and it should be able to build the product end-to-end. Everything below is intentional. Nothing is filler.

---

## 0. NORTH STAR

Build the best pizza ordering flow on the web. Beat Domino's, Pizza Hut, and KFC on three axes at once:

- **Appetite** — the food must look so good people get hungry. Cinematic photography, warm light, melt and char.
- **Ease** — an 80-year-old can order in under 60 seconds without confusion. Big targets, plain words, one clear next action per screen.
- **Power** — an enthusiast can fully customize a half-and-half stuffed-crust pizza with extra toppings, kitchen notes, and combos — and watch the price + visual update on every tap.

**The ordering flow (pizza selection → cart → checkout) is the hero of the entire product.** Every other page exists to funnel into it. If a tradeoff must be made, spend the polish budget here.

Three feelings, every screen: **Fast. Fun. Clear.** If a screen isn't at least two of those, redesign it.

---

## 1. ART DIRECTION — "Neo-Italian Luxury"

Not "clean minimal." Not a Tailwind template. An opinionated, cinematic, appetite-first identity with editorial typography and real depth.

### Mood
Late-evening Italian pizzeria. Wood-fired oven glow. Espresso-dark surfaces, ember and tomato accents, warm cream paper for content. Film grain. Steam. Char on the crust. Premium but warm — luxury you'd actually eat at, not a cold museum.

### Palette (define as CSS custom properties — never hardcode repeatedly)

```css
:root {
  /* Surfaces — espresso to charcoal */
  --color-bg:            oklch(16% 0.012 40);   /* near-black espresso */
  --color-surface:       oklch(21% 0.016 45);   /* raised card */
  --color-surface-2:     oklch(26% 0.018 48);   /* hover / nested */
  --color-paper:         oklch(96% 0.012 75);   /* warm cream content blocks */

  /* Brand — ember / tomato / wood-fire */
  --color-ember:         oklch(66% 0.20 38);    /* primary CTA, tomato-ember */
  --color-ember-hot:     oklch(72% 0.21 45);    /* hover */
  --color-char:          oklch(34% 0.05 40);    /* crust char detail */
  --color-basil:         oklch(64% 0.15 150);   /* veg / fresh / success */
  --color-gold:          oklch(82% 0.13 85);    /* premium, loyalty, ratings */
  --color-chili:         oklch(58% 0.23 25);    /* spicy heat scale */

  /* Text */
  --color-text:          oklch(95% 0.01 75);
  --color-text-dim:      oklch(72% 0.015 70);
  --color-text-ink:      oklch(22% 0.02 60);    /* on cream paper */

  /* Semantic */
  --color-success: var(--color-basil);
  --color-warn:    var(--color-gold);
  --color-danger:  oklch(58% 0.20 25);
}
```

Color is **semantic, not decorative**: ember = action/heat, basil = veg/fresh/go, gold = premium/rewards/ratings, chili = spice level. Never sprinkle a random accent.

### Typography (max two families, deliberate pairing)

- **Display / headlines:** a high-contrast editorial serif with character (e.g. *Fraunces*, *Playfair Display*, or similar). Big, confident, optical sizes. This carries the "luxury Italian" voice.
- **UI / body / numerals:** a clean humanist or grotesque sans (e.g. *Inter*, *General Sans*, *Satoshi*). Tabular numerals required for all prices.

```css
:root {
  --font-display: 'Fraunces', Georgia, serif;
  --font-ui:      'Inter', system-ui, sans-serif;

  --text-base:  clamp(1rem, 0.92rem + 0.4vw, 1.125rem);
  --text-lead:  clamp(1.125rem, 1rem + 0.6vw, 1.375rem);
  --text-h3:    clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem);
  --text-h2:    clamp(2rem, 1.4rem + 2.4vw, 3.5rem);
  --text-hero:  clamp(3rem, 1rem + 7vw, 8rem);
}
```

Use **scale contrast** for hierarchy (hero serif vs small caps label), not weight-everywhere.

### Depth & texture
- Layered surfaces: cards float over a grain-textured dark bg with soft warm shadows (`0 20px 60px -20px oklch(0% 0 0 / 0.6)`), occasional ember glow on primary CTAs.
- Subtle film grain overlay (SVG/noise, very low opacity) on dark surfaces for atmosphere.
- Overlap and editorial breaks — a hero pizza that bleeds off the grid, price tags that overlap photos, sticker-style badges (NEW, BESTSELLER, 🌶️ HOT, VG).
- Cream "paper" blocks for dense reading content (menus, FAQ, legal) so it never feels like reading on a black void.

### Motion language
Compositor-friendly only: `transform`, `opacity`, `clip-path`, `filter` (sparingly). Never animate layout props.

```css
--duration-fast:   150ms;
--duration-normal: 300ms;
--duration-slow:   600ms;
--ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);
--ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1);
```

Signature motions:
- **Pizza-to-cart flight** — a clone of the pizza image arcs and shrinks into the cart icon, cart badge bounces.
- **Price counter** — animated rolling digits on every customization change.
- **Drawer slide** — cart slides in with spring ease + backdrop blur.
- **Step transitions** — checkout steps cross-fade + slide, progress bar fills.
- **Topping placement** — toppings pop onto the pizza visual with the spring ease as you add them.

**Always respect `prefers-reduced-motion`** — swap motion for instant state + opacity.

### Anti-template rules (hard bans)
No uniform card grid with identical padding. No centered-headline + gradient-blob hero. No gray-on-white with one accent. No unmodified library defaults. Every meaningful surface must show ≥4 of: scale-contrast hierarchy, intentional spacing rhythm, depth/layering, characterful type pairing, semantic color, designed hover/focus/active states, editorial/bento composition, texture/atmosphere, clarifying motion, designed data-viz.

---

## 2. TECH FOUNDATION

Current stack: **Vite + React 19 + TypeScript + framer-motion + lucide-react**, single-file `App.tsx`, no router.

Required changes:
- **Add routing** (`react-router-dom`) — 35 routes (see §3). Lazy-load heavy/admin routes (`React.lazy` + `Suspense`).
- **State separation:**
  - *Client/cart/UI state* → Zustand (cart, builder draft, drawer open, theme). Persist cart to `localStorage`.
  - *URL state* → menu filters, active category, sort, selected pizza modal, checkout step all live in search params so links are shareable and back-button works.
  - *Server state* (when a backend exists) → TanStack Query. For now, mock with a typed in-memory data layer behind a repository interface (`menuRepository`, `orderRepository`) so it can be swapped for Supabase/REST later without touching UI.
  - *Form state* → React Hook Form + schema validation (Zod) for checkout.
- **File organization** — kill the single `App.tsx`. Organize by feature/surface (per house style):

```
src/
├── routes/                 # one folder per page route
├── components/
│   ├── builder/            # pizza customization flow
│   ├── cart/               # drawer, mini-cart, line items
│   ├── checkout/           # step components
│   ├── menu/               # cards, grids, filters
│   ├── upsell/             # smart upsell widgets
│   ├── admin/              # admin panels
│   └── ui/                 # Button, Sheet, Stepper, PriceCounter, Badge…
├── hooks/                  # useReducedMotion, useCart, useFreeDeliveryProgress…
├── lib/                    # pricing engine, whatsapp message builder, validation
├── store/                  # zustand stores
├── data/                   # typed menu/deals/coupons mock + repository interfaces
└── styles/                 # tokens.css, typography.css, global.css
```

- **Performance budget** (landing): JS < 150kb gz, CSS < 30kb. Inline critical CSS, preload hero image + one font weight, defer the rest, dynamically import the admin bundle. Hero image: explicit width/height, `fetchpriority="high"`. Below-fold images: `loading="lazy"`, AVIF/WebP with fallback. CWV targets: LCP < 2.5s, INP < 200ms, CLS < 0.1.
- **Files ≤ 800 lines, functions < 50 lines, immutable updates only.**
- **Security:** production CSP with nonce, no `dangerouslySetInnerHTML` on user content, sanitize kitchen notes/coupon input, validate every form client + (future) server, honeypot on contact/order forms, security headers (HSTS, nosniff, X-Frame-Options DENY, Referrer-Policy).
- **A11y:** semantic HTML (`<header><nav><main><section><footer>`), keyboard-navigable builder + checkout, focus traps in modal/drawer, visible focus rings, AA contrast both on dark and cream surfaces, screen-reader labels on icon-only buttons, allergen info programmatically associated.

---

## 3. PAGES (35) — INFORMATION ARCHITECTURE

Each page must look intentional, not a recolored template. Routes:

### Discovery & Menu
1. **Home** — cinematic hero (steaming pizza bleeding off grid), live "store open / closed" pill, fulfilment toggle (Delivery/Collection) + postcode field up top, signature pizzas rail, deals strip, "build your own" CTA, social proof, app-quality footer.
2. **Full Menu** — master menu, sticky category nav, filter chips (Veg, Halal, Spicy, Deals), sort.
3. **Pizza Menu** — pizzas only, bento/editorial layout, big imagery.
4. **Pizza Builder** — full-page version of the customization flow (§4).
5. **Deals & Combos** — bundle cards with savings badges, "build a combo."
6. **Meal Deals** — pizza+side+drink sets, pick-and-mix.
7. **Sides** — garlic bread, wings, dips, fries.
8. **Drinks** — bottles/cans, deal pairings.
9. **Desserts** — cookies, brownies, churros.
10. **Kids Meals** — playful, simpler cards.
11. **Vegetarian Menu** — basil-accented, VG badges, filtered view.
12. **Halal Menu** — halal-certified items, certification note.
13. **Spicy Menu** — chili-heat themed, heat-scale visual (1–5 flames).
14. **Create Your Own Pizza** — entry into builder, base + topping picker.
15. **Half & Half Pizza** — dedicated split-pizza builder (§4 step 5 promoted).
16. **Catering / Party Orders** — large-format, party trays, enquiry form.

### Offers
17. **Offers & Coupons** — active coupons, copy-to-apply, terms.

### Ordering core
18. **Cart** — full-page cart (mirror of the drawer, §5).
19. **Checkout** — multi-step (§6).
20. **Order Confirmation** — success animation, order number, timeline, WhatsApp button (§7).
21. **Track Order** — live timeline, ETA timer, map placeholder, call-store/WhatsApp.

### Account
22. **Login / Register** — phone-first OTP-style placeholder, social placeholder.
23. **Customer Account** — profile, saved addresses, payment methods, prefs.
24. **Previous Orders** — order history list with status.
25. **Reorder Page** — one-tap reorder of a past order into cart.
26. **Loyalty Rewards** — points balance, tiers, gold-accented rewards, progress ring.

### Info & trust
27. **About Us** — story, oven, team, editorial layout.
28. **Contact** — form (honeypot, validation), map, phone, WhatsApp.
29. **Delivery Areas** — postcode checker + covered-areas map/list.
30. **Opening Hours** — weekly hours, live open/closed status.
31. **Reviews** — rating summary + cards, designed as part of the system (not afterthought).
32. **FAQ** — accordion on cream paper, search.
33. **Terms & Conditions** — readable legal on paper block.
34. **Privacy Policy** — same treatment.

### Admin
35. **Admin Dashboard** — gated shell hosting all admin panels (§8).

---

## 4. PIZZA SELECTION EXPERIENCE — THE HERO FLOW

The current basic add-to-cart is replaced entirely. Tapping a pizza opens a **premium product detail surface** — a centered modal on desktop, a **bottom sheet on mobile** — with a focus trap and ESC/swipe-to-close.

### Product detail header
- Large cinematic pizza image (the visual that toppings render onto).
- Name (display serif) + short crave-worthy description.
- Badges row: **VEG / NON-VEG** dot, **🌶️ spice level** (1–5 flames), **Halal** if applicable.
- Meta chips: ⭐ customer rating, ⏱️ prep time, allergen info (expandable: gluten, dairy, nuts…).

### Guided customization — one decision per step, big targets, live visual + price

**Step 1 — Size**
- Small 9″ · Medium 12″ · Large 14″ (each shows price delta). Selecting scales the pizza visual.

**Step 2 — Base**
- Normal · Italian style · Deep pan · Thin crust. Base changes the crust texture on the visual.

**Step 3 — Crust**
- Regular · Stuffed crust (+£) · Cheesy bites (if available). Stuffed crust shows a cheese-rim on the visual.

**Step 4 — Toppings**
- Add/remove toppings; categories: Extra Cheese, Extra Meat, Extra Vegetables, Sauces, **Premium toppings** (gold-tagged, higher price).
- Each topping **pops onto the pizza visual** (spring ease) when added and fades when removed.
- Removed default ingredients tracked explicitly (e.g. "No onions") and shown in cart.

**Step 5 — Half & Half**
- Toggle to split the pizza. Choose **left half** and **right half** independently.
- **Split-pizza visual**: a vertical divider, each half renders its own toppings. Price = max(half rules) per house pricing.

**Step 6 — Quantity**
- Large +/− steppers. Price updates live (rolling digits).

**Step 7 — Kitchen notes**
- Quick-tap chips: "No onions", "Extra spicy", "Well done". Plus a free-text custom note box (sanitized, length-capped).

**Step 8 — Add to cart**
- **Pizza-flies-into-cart** animation. Mini-cart confirmation toast. Then **suggested add-ons appear** (§7 upsell): "Add garlic bread? Add a drink? Make it a meal? Upgrade to large? Add stuffed crust?"

### Rules
- **Price and visual update instantly on every single tap.** This is non-negotiable.
- Pricing logic lives in a pure `pricingEngine` (`lib/pricing.ts`): `computePrice(draft) → { base, additions[], total }`. Easy to unit test.
- Elderly-friendly: large fonts, clear labels, no jargon, a persistent "Total" + "Add to cart" bar pinned at the bottom of the sheet so the next action is always visible.
- Power-user friendly: every step reachable, nothing hidden behind extra taps unnecessarily, sensible defaults pre-selected so a fast user can size → add in 2 taps.

---

## 5. CART EXPERIENCE

Cart is **not** a boring list. Two surfaces sharing one Zustand store + components:
- **Floating mini-cart** — a persistent FAB/pill showing item count + total; tapping opens the drawer.
- **Slide-in cart drawer** — spring slide from right (bottom sheet on mobile), backdrop blur.
- **Full-page `/cart`** — same content, roomier.

### Each line item shows
Pizza name · Size · Base · Crust · Toppings (added) · Removed ingredients · Quantity · Price · Notes.

### Line item actions
- **Edit** (reopens builder pre-filled with that item's draft).
- **Duplicate**.
- **Remove** with a satisfying remove animation (slide + collapse).
- **Quantity** +/− with live line-total.

### Cart chrome
- Live **subtotal**.
- **Delivery fee** (and free-delivery logic).
- **Discount / coupon code** field with validation + applied state.
- **Free-delivery progress bar**: "Add £X more for free delivery" that fills as subtotal rises, celebrates at threshold.
- **Suggested add-ons** + **"Complete your meal"** recommendations (sides, drinks, dessert, combo).
- **Sticky checkout button** always visible with the live total.

Empty-cart state must be designed (warm illustration + "Build your first pizza" CTA), never a blank box.

---

## 6. ADVANCED CHECKOUT — multi-step, beats the big chains

Premium stepper with a **progress indicator**, smooth step transitions, **mobile bottom-sheet** form, **auto-save to localStorage**, inline **error validation**, and a persistent order-summary rail (desktop) / collapsible summary (mobile).

**Step 1 — Order type:** Delivery · Collection · Dine-in (if applicable). Branches the later steps.

**Step 2 — Customer details:** Name, Phone (required), Email (optional). Phone format validation.

**Step 3 — Address (delivery only):** Postcode lookup + address autocomplete, Flat/house number, Delivery instructions, **delivery-area validation** (reject out-of-area with a clear message + link to Delivery Areas).

**Step 4 — Time:** ASAP (with **estimated delivery timer**) · Schedule for later · Collection time slot. Show store open/closed status; block ordering when closed (or queue for next open slot with a clear notice).

**Step 5 — Payment:** Cash · Card (Stripe-ready placeholder) · Apple Pay / Google Pay ready · Pay by link · Pay on collection. Wire structure so Stripe drops in later; never store raw card data client-side.

**Step 6 — Review order:** Full item summary with **edit-items** links, **apply coupon**, delivery fee, service charge (if needed), **total**.

**Step 7 — Confirm:** Beautiful confirmation animation → generate **order number** → build a **WhatsApp order message** → redirect to WhatsApp with the full order details (see §7 message format).

### Checkout must also include
Minimum-order validation · coupon validation · free-delivery threshold reflected in totals · **contactless / "leave at door"** option · **cutlery / napkins** toggle · **allergy-warning confirmation** checkbox before placing the order · store open/closed gating.

### Checkout UX details
Progress indicator that's actually readable, deterministic (non-flaky) transitions, large tap targets, autofill-friendly fields, clear per-field errors, and the next action always obvious. An elderly user should never wonder what to press next.

---

## 7. POST-CHECKOUT + SMART UPSELL

### Order Confirmation page
- Premium success animation (steam / confetti-of-basil, tasteful).
- Order number, estimated time, **order timeline**, **WhatsApp confirmation** button, **call store** button, **reorder** option, **recommended items for next order**.

### Order timeline (also on Track Order)
`Order received → Preparing → In oven → Quality check → Out for delivery / Ready for collection → Completed.` Animated, with the active stage glowing ember and a moving progress connector.

### WhatsApp message builder (`lib/whatsapp.ts`)
Pure function: `buildOrderMessage(order) → string`, URL-encoded into `https://wa.me/<store>?text=...`. Includes order number, items with full customization (size/base/crust/toppings/removed/notes/qty), fulfilment type, address or collection time, totals, and coupon. This is the actual order channel — make it complete and correct.

### Smart upsell system (`components/upsell/`)
Context-aware moments, never spammy, always one-tap:
- **After adding a pizza:** "Add garlic bread? Add a drink? Make it a meal? Add dessert? Upgrade to large? Add stuffed crust?"
- **In cart:** recommended sides, recommended drinks, combo builder, family-deal suggestion.
- **During checkout:** last-chance add-ons, "popular with your order," "save more with a combo."

Upsell logic is data-driven (`data/upsell.ts` mapping triggers → suggestions), so merchandising changes need no UI edits.

---

## 8. ADMIN PANEL (gated route `/admin`, lazy-loaded)

A cohesive dashboard shell (sidebar + topbar + content), data-viz treated as part of the design system (ember/gold/basil chart palette, not default library colors). Panels:

1. **Dashboard overview** — today's orders, revenue, live order feed, KPIs.
2. **Orders management** — list, filter, status updates, view order detail (full customization), print/WhatsApp.
3. **Product management** — CRUD pizzas/sides/drinks/desserts, images, availability.
4. **Pizza size management** — sizes + per-size pricing.
5. **Toppings management** — toppings, categories, premium flag, prices.
6. **Deals management** — combos, meal deals, savings.
7. **Coupon management** — codes, type (%/£), min order, expiry, usage caps.
8. **Delivery area management** — postcodes/zones, fees, min order per zone.
9. **Opening hours management** — weekly schedule, holiday overrides, drives live open/closed status sitewide.
10. **Customer management** — list, order history, loyalty.
11. **Reviews management** — moderate, reply.
12. **Banner management** — homepage promo banners.
13. **WhatsApp settings** — store number, message template.
14. **Payment settings** — toggle methods, Stripe keys placeholder.
15. **Store settings** — name, address, branding, fees, min order.
16. **Analytics** — sales trends, top items, peak hours (designed charts).
17. **Reports** — exportable summaries.
18. **Staff access** — roles/permissions, audit.

Admin writes to the same repository interfaces the storefront reads from — single source of truth.

---

## 9. CROSS-CUTTING REQUIREMENTS

- **Live store status** (open/closed) computed from Opening Hours, shown in header, home, checkout; gates ordering.
- **Fulfilment context** (Delivery vs Collection) persists across the session and reshapes pricing/fees/checkout.
- **Coupons, free-delivery threshold, min order, delivery fees** all flow from one config (admin → store settings), consumed by cart + checkout.
- **Theme:** dark Neo-Italian is the primary, intentional theme — not auto-dark. If a light/cream mode is offered, it must feel equally designed.
- **Every price-affecting interaction updates total + visual instantly.**
- **Reduced-motion, keyboard, and screen-reader paths fully supported** on the builder, cart, and checkout especially.

---

## 10. BUILD ORDER (recommended phasing)

1. **Foundation** — router, design tokens (`tokens.css`/`typography.css`), `ui/` primitives (Button, Sheet, Stepper, PriceCounter, Badge, Sticker), Zustand stores, typed mock data + repository interfaces, pricing engine, WhatsApp builder. Unit-test pricing + whatsapp.
2. **Hero flow** — product detail sheet + 8-step builder with live visual/price, mini-cart + cart drawer, pizza-to-cart flight. **This is the priority.**
3. **Checkout** — 7-step flow, validation, totals, confirmation + WhatsApp redirect, timeline, Track Order.
4. **Menu surfaces** — Home + Full/Pizza menus + filtered menus (Veg/Halal/Spicy/Kids) + Deals/Meal Deals/Sides/Drinks/Desserts + Half&Half + Create-your-own + Catering.
5. **Account & info** — auth, account, orders, reorder, loyalty, about/contact/areas/hours/reviews/FAQ/legal.
6. **Admin** — shell + 18 panels wired to repositories.
7. **Polish & verify** — Playwright visual regression at 320/375/768/1024/1440/1920, automated a11y checks, keyboard + reduced-motion passes, Lighthouse vs CWV budgets, both themes if present.

### Testing expectations
Unit-test the pricing engine, WhatsApp builder, coupon/free-delivery logic, and custom hooks (TDD: red → green → refactor). Playwright visual regression for the hero, builder sheet, cart drawer, and each checkout step. E2E the critical path: pick pizza → customize → add to cart → checkout → confirmation → WhatsApp message correct. Target 80%+ coverage on logic; visual regression supplements (doesn't replace) it.

---

## 11. DEFINITION OF DONE

- [ ] A first-time user orders a customized pizza in < 60s without confusion.
- [ ] A power user builds a half-and-half stuffed-crust with extra premium toppings, notes, and a combo — visual + price correct at every step.
- [ ] Pizza-to-cart flight, drawer, rolling price counter, and timeline all feel designed and respect reduced-motion.
- [ ] WhatsApp message contains the complete, correct order.
- [ ] No screen looks like a default template; each shows ≥4 required design qualities.
- [ ] CWV budgets met; a11y (keyboard + SR + contrast) passes on builder/cart/checkout.
- [ ] Admin changes (hours, prices, coupons, areas) reflect live on the storefront.
- [ ] The ordering flow feels better than Domino's, Pizza Hut, and KFC. People get hungry looking at it.

> Build it like the oven's already hot. 🔥
