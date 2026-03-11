# Ecoyaan Checkout — Evaluation Notes

> Personal reference for "What We're Looking For" criteria.
> This file lives **outside** `ecoyaan-checkout/` and is not included in the project repo.

---

## 1. Code Quality & Architecture

### Modular & Readable
- Each screen is its own file (`cart/`, `shipping/`, `payment/`, `order-success/`).
- Shared UI split into reusable components: `Navbar.jsx`, `CheckoutProgress.jsx`.
- Global state isolated in `context/CheckoutContext.jsx` — zero prop-drilling across pages.
- Validation logic is a **pure standalone function** (`validate(values)`) in `shipping/page.jsx` — independently testable, not tangled with component code.

### Next.js SSR Best Practices
- `cart/page.jsx` is an **async Server Component** — data is fetched on the server before the page is sent to the client. No client-side loading spinner for cart data.
- Uses `headers()` to dynamically resolve the host for the absolute API URL during SSR (works in both dev and prod).
- `cache: 'no-store'` on the cart fetch — ensures cart is always fresh (correct for user-specific data).
- `cart/CartClient.jsx` hydrates Context via `useEffect` so SSR-rendered HTML stays consistent with client state.
- Route Handlers (`app/api/cart/route.js`) follow the App Router convention using `NextResponse.json()`.

### Client vs Server Component split
| File | Type | Reason |
|---|---|---|
| `cart/page.jsx` | Server | Fetches data via `fetch()` |
| `cart/CartClient.jsx` | Client | Uses `useRouter`, `useEffect`, Context |
| `shipping/page.jsx` | Client | Form state, validation, router |
| `payment/page.jsx` | Client | Radio state, async pay handler, router |
| `order-success/page.jsx` | Client | Reads context, `useMemo` for orderId |
| `Navbar.jsx` | use client(useState+useCheckout) | Static UI, no interactivity |
| `CheckoutProgress.jsx` | Server | Props-only, no hooks |

---

## 2. UI/UX

### Intuitive Flow
- `/` → redirects to `/cart` automatically.
- Linear progression: Cart → Shipping → Payment → Order Success.
- `CheckoutProgress` bar with animated green connector line shows which step the user is on.
- "Back" buttons on every screen — no dead ends.
- "Edit" link on Payment page jumps back to `/shipping` with the form **pre-filled**.

### Smooth Interactions
- Payment button disables itself + shows a CSS spinner (`animate-spin`) during the 1800ms simulated processing delay — prevents double-submit.
- Progress connector line animates via CSS `transition-all duration-500`.
- Step circles animate between states (todo / active / done) with `transition-all duration-300`.
- Cart items show `hover:shadow-md transition-shadow` on hover.
- Sticky order summary sidebar (`sticky top-20`) stays in view while scrolling a long cart.
- `CheckCircle2` success icon bounces (`animate-bounce`) on the Order Success screen.

### Responsive Design
- Max-width containers (`max-w-5xl`, `max-w-2xl`) with `px-4 sm:px-6` padding.
- Cart and Payment: two-column (`flex-col lg:flex-row`) on desktop, stacked on mobile.
- Shipping and Order Success: single-column, centred.
- Shipping form action buttons: `flex-col sm:flex-row` — stack on mobile, side-by-side on tablet+.
- Navbar subtitle hidden on small screens (`hidden sm:block`).

---

## 3. State & Form Management

### Form Validation
- Validation function covers all 7 fields:
  - `fullName` — required, min 3 chars
  - `email` — required, regex `[^\s@]+@[^\s@]+\.[^\s@]+`
  - `phone` — required, Indian mobile regex `^[6-9]\d{9}$`
  - `address` — required (street / flat no.)
  - `pinCode` — required, exactly 6 digits `^\d{6}$`
  - `city` — required
  - `state` — required (dropdown)
- **Blur validation** — errors appear when a field loses focus, not on first load.
- **Touched map** — only fields the user has interacted with show errors.
- **Submit validation** — marks all fields touched and re-validates; blocks navigation if any errors remain.

### Persisting Data Between Steps
- `CheckoutContext` holds three pieces of state:
  - `cartData` — set once from SSR payload in `CartClient`
  - `shippingAddress` — set on successful shipping form submission
  - `orderPlaced` — set to `true` just before navigating to Order Success
- Shipping form initialises from `shippingAddress ?? defaultEmpty` — navigating back pre-fills all fields.
- Payment page reads both `cartData` and `shippingAddress` from context for the order review panel.
- Order Success reads all three to render the full summary.

### Route Guards
- `/shipping` — redirects to `/cart` if `cartData` is null (user skipped cart).
- `/payment` — redirects to `/cart` if `cartData` or `shippingAddress` is null.
- `/order-success` — redirects to `/cart` if `orderPlaced` is false (prevents direct URL access).
- All guards run in `useEffect` to avoid SSR / static prerender crashes.

### Known Limitation (by design — "simplified" scope)
- State lives in-memory Context. A hard browser refresh clears state and redirects to `/cart`. Persisting to `sessionStorage` would fix this but is outside the simplified scope.

---

## Quick File Reference

```
ecoyaan-checkout/
  src/
    app/
      api/cart/route.js        ← Mock GET API (imports from lib/cartData.js)
      cart/
        page.jsx               ← Server Component, calls getMockCartData() synchronously
        CartClient.jsx         ← Client UI, hydrates Context
      shipping/page.jsx        ← Multi-address form + validation + sticky action bar
      payment/page.jsx         ← Payment method + order review + sticky action bar
      order-success/page.jsx   ← Success screen with order summary
      layout.jsx               ← Root layout: CheckoutProvider + Navbar
      page.jsx                 ← redirect('/cart')
    components/
      Navbar.jsx               ← Sticky 3-tier header (announcements / search / categories)
      CheckoutProgress.jsx     ← Animated 3-step progress bar
    context/
      CheckoutContext.jsx      ← cartData, shippingAddress, savedAddresses, orderPlaced, hydrated
    lib/
      cartData.js              ← Shared mock data (used by both page and API route)
```

---

## 4. Changes Made (March 10, 2026)

### Round 1: Sticky Action Bars + Multi-Address + localStorage Persistence

**What was asked:**
> "Enhance the UI to make it more elegant and user-friendly. The bottom action button should remain sticky, with both Back and Next Step buttons together. Allow users to add multiple addresses. Entered data should be persisted so context is maintained even after page reload."

**Changes made:**

#### `src/context/CheckoutContext.jsx` — Full rewrite
- Added `savedAddresses` state (array of address objects).
- Added `hydrated` boolean flag — stays `false` until the `useEffect` has finished reading from localStorage, preventing premature redirects on reload.
- All four state values (`cartData`, `shippingAddress`, `savedAddresses`, `orderPlaced`) now persist to and rehydrate from `localStorage` under the key `ecoyaan_checkout_v1`.
- Setter functions wrapped in `useCallback` to keep their references stable — prevents dependent `useEffect` hooks (e.g. in `CartClient`) from looping infinitely.

#### `src/app/shipping/page.jsx` — Full rewrite
- **Multiple addresses**: Users can save multiple addresses. Each is shown as a selectable card with a green border + checkmark when selected.
- **Edit / Remove**: Each saved address card has inline Edit (pencil) and Remove (trash) buttons.
- **Add New Address** button: dashed-border button opens the form to add another address without losing saved ones.
- **Address form**: 2-column responsive grid — Full Name (full-width), Email + Phone (side-by-side), Street Address (full-width), PIN Code + City (side-by-side), State dropdown (full-width). All fields validated on blur and on submit.
- **Sticky bottom bar**: `position: fixed` bar at the bottom with `← Back` (to cart) and `Continue to Payment →` (disabled until an address is selected and the form is closed). Moved outside the animated wrapper div to prevent CSS transform breakage.
- **Hydration guard**: redirects to `/cart` only after `hydrated === true`.

#### `src/app/payment/page.jsx` — Targeted changes
- Added `hydrated` to the `useCheckout()` destructure; guard now checks `hydrated &&` before redirecting.
- Added `pb-28` to the main container so content doesn't hide behind the sticky bar.
- **Pay button removed from sidebar** — replaced with an SSL encrypted note (`Lock` icon + "256-bit SSL encrypted").
- **Sticky bottom bar added**: `← Back` + grand total display (hidden on mobile) + `Pay Securely` button with spinner. Moved outside the animated wrapper div.

#### `src/app/order-success/page.jsx` — Minor guard update
- Added `hydrated` to destructure; guard now waits for hydration before redirecting.
- Fixed pre-existing `flex-shrink-0` → `shrink-0` Tailwind v4 warning.

---

### Round 2: Infinite Re-render Loop Fix

**What happened:** "Maximum update depth exceeded" error on the cart page.

**Root cause:** `setCartData` was a plain function defined inside `CheckoutProvider`, so it got a new reference on every render. `CartClient`'s `useEffect` had `setCartData` in its dependency array — the new reference triggered the effect, which called `setCartData`, which caused a re-render, infinitely.

**Fix — `src/context/CheckoutContext.jsx`:**
- Imported `useCallback`.
- All four setter functions (`setCartData`, `setShippingAddress`, `setSavedAddresses`, `setOrderPlaced`) wrapped in `useCallback` with `[]` deps so their references are permanently stable.

---

### Round 3: Elegant UI Polish

**What was asked:**
> "Enhance the UI to make it more elegant and user-friendly."

**Changes made:**

#### `src/app/globals.css`
- `btn-primary` upgraded: flat green → green gradient (`135deg, #2d6a4f → #40916c`), drop shadow (`0 2px 10px rgba(45,106,79,0.28)`), deeper shadow on hover.
- Input focus changed to `focus-visible` (ring only on keyboard navigation, not mouse click).
- Added `@keyframes fadeInUp` — smooth Y-axis entrance used on all pages.
- Added `@keyframes pop` — elastic scale-in (0.4→1.15→0.95→1) used on the order success icon.
- Added `.animate-fade-in-up` and `.animate-pop` utility classes.

#### `src/components/CheckoutProgress.jsx`
- Step circles enlarged: `w-8 h-8` → `w-10 h-10`.
- Active step gets a soft glow ring: `shadow-[0_0_0_4px_rgba(82,183,136,0.2)]`.
- Completed steps get `shadow-md` for depth.
- Connector line thicker (`3px`) with a green-to-teal gradient instead of flat green.
- Transition duration extended to `700ms` for a more satisfying animation.

#### `src/app/cart/CartClient.jsx`
- Page wrapper gets `animate-fade-in-up` on entry.
- Empty cart state also gets `animate-fade-in-up`.

#### `src/app/shipping/page.jsx`
- Page wrapper gets `animate-fade-in-up` (wrapper div, not the fixed bar).
- Selected address card: solid green border + light green tint background + outer glow `shadow-[0_0_0_4px_rgba(45,106,79,0.07)]`.

#### `src/app/payment/page.jsx`
- Page wrapper gets `animate-fade-in-up`.
- **"Delivering to" section** redesigned: MapPin icon in a square green badge, full address displayed (street, city/state/PIN, phone, email).
- **Payment method cards** redesigned: `border-2`, icon tile inverts to white-on-green when selected, custom circular radio indicator, shadow on active card.
- Simulated input hints replaced with a clean info banner (Lock icon + message).

#### `src/app/order-success/page.jsx`
- Page wrapper gets `animate-fade-in-up`.
- `animate-bounce` → `animate-pop` on the success icon (elastic, not jittery).
- "Order Successful!" heading renders as a green-to-teal gradient text using `bg-clip-text text-transparent`.
- "Continue Shopping" button slightly enlarged.

---

### Round 4: Sticky Bar Position Fix

**What happened:** The sticky bars on shipping and payment pages were moving/jumping during the page entry animation.

**Root cause:** CSS `transform` (used by `fadeInUp` animation) on a container element creates a new stacking/containing block. All `position: fixed` children position themselves relative to that transformed ancestor instead of the viewport — so they animated along with the page content.

**Fix — `src/app/shipping/page.jsx` and `src/app/payment/page.jsx`:**
- Wrapped each page's return in a React Fragment (`<>`).
- The animated content `<div>` and the `fixed` sticky bar are now **siblings** inside the fragment — the bar is no longer a descendant of the transformed element and correctly anchors to the viewport.

---

## 5. Data Persistence — What Survives a Reload

### What persists (stored in `localStorage` under key `ecoyaan_checkout_v1`)

| Data | Set when | Survives reload at |
|---|---|---|
| `savedAddresses` | User saves an address on `/shipping` | `/shipping`, `/payment`, everywhere |
| `shippingAddress` | User clicks "Continue to Payment" | `/payment`, `/order-success` |
| `cartData` (snapshot) | Any cart change on `/cart` | `/shipping`, `/payment`, `/order-success` |
| `orderPlaced` | After successful payment | `/order-success` |

All four are written to localStorage immediately inside each setter, and rehydrated in a single `useEffect` on mount in `CheckoutContext`. The `hydrated` flag ensures no page redirects until rehydration is complete.

### What does NOT persist across a hard reload

| Data | Lives in | Why it resets |
|---|---|---|
| Cart item quantities | `CartClient` local `useState` | Initialised from `getMockCartData()` on every `/cart` visit; the fresh data immediately overwrites `cartData` in localStorage |
| Coupon code / applied status | `CartClient` local `useState` | Same — scoped to the cart component session |
| Save-for-later items | `CartClient` local `useState` | Same |

**This is intentional.** The cart is the entry point of the flow and always loads fresh mock data. Persisting cart-level state would require initialising `CartClient` from localStorage instead of `getMockCartData()` — a deliberate trade-off given the "simplified" scope of this project.

---

## 6. Changes Made (March 11, 2026)

### Round 5: Card Boxes Around All Sections

**What was asked:** Wrap every component on every page in a visible card box — including the stepper circles.

**Changes made:**

#### `src/components/CheckoutProgress.jsx`
- Entire stepper wrapped in `bg-white rounded-2xl border border-[#d8e8e0] shadow-sm px-6 py-5` card.

#### `src/app/cart/CartClient.jsx`
- "My Cart" title section wrapped in `bg-white rounded-xl border border-[#d8e8e0] shadow-sm px-5 py-4` card.
- "Saved for Later" section wrapped in `bg-white rounded-xl border border-[#d8e8e0] shadow-sm p-4` card.

#### `src/app/shipping/page.jsx`
- "Shipping Address" title section wrapped in `bg-white rounded-xl border border-[#d8e8e0] shadow-sm px-5 py-4` card.

#### `src/app/payment/page.jsx`
- "Review & Pay" title section wrapped in card; added subtitle "Almost there — confirm your order details and pay securely."

#### `src/app/order-success/page.jsx`
- Success banner (icon + heading + email line) wrapped in `bg-white rounded-2xl border border-[#d8e8e0] shadow-sm px-6 py-8` card.

---

### Round 6: Single Outer Wrapper Box + Colour + Padding

**What was asked:** Put every page's entire content (stepper + all sections) inside one single large background box. Apply `bg-[#f6faf6]` to all wrapper boxes. Reduce padding to avoid unnecessary scrolling.

**Changes made — all 4 pages:**
- Wrapped all inner content with `bg-[#f6faf6] rounded-2xl border border-[#d8e8e0] shadow-md p-4 lg:p-6`.
- The outer container `py-8` reduced to `py-4`; bottom padding trimmed across all pages.
- Individual section cards remain white inside the tinted outer box, giving a clear layered visual hierarchy.
- `src/app/globals.css`: added `overflow-x: hidden` to `body` — fixes horizontal scroll on mobile that was clipping the navbar.

---

### Round 7: Mobile Fixes

**Three issues identified and fixed:**

#### 1. Coupon/summary panel invisible on mobile (`src/app/cart/CartClient.jsx`)
- The `SummaryPanel` was only rendered inside `.hidden lg:block` — completely invisible on mobile.
- Added a `lg:hidden` section below the items list that renders `SummaryPanel()` — coupon input and order summary are now visible on mobile.

#### 2. Sticky cart button floating mid-page (`src/app/cart/CartClient.jsx`)
- The `fixed bottom-0` bar was a *child* of the `animate-fade-in-up` div. CSS `transform` (from the entrance animation) creates a new containing block — `position:fixed` children position relative to it, not the viewport.
- Fixed by wrapping the return in a React Fragment (`<>`) — same pattern already used on shipping and payment pages.

#### 3. Action bar buttons not stacked on mobile (`src/app/shipping/page.jsx`, `src/app/payment/page.jsx`)
- Buttons in both sticky bars were `flex` (always side-by-side).
- Changed inner container to `flex-col sm:flex-row` — on mobile, Back stacks above Continue/Pay (each full-width); on `sm:+` they revert to horizontal layout.

#### 4. Navbar appearing cut off on mobile (`src/app/globals.css`)
- Overflowing elements caused horizontal scroll that shifted the entire page including the navbar.
- Fixed with `overflow-x: hidden` on `body`.

---

## 7. Final Checklist

| Objective | Status |
|---|---|
| Cart → Shipping → Payment → Order Success flow | ✅ |
| Route guards (hydration-aware) on all post-cart pages | ✅ |
| SSR cart data fetch (Server Component) | ✅ |
| Form validation: 7 fields, blur + submit, touched map | ✅ |
| Multi-address: add, edit, delete, select | ✅ |
| localStorage persistence (`ecoyaan_checkout_v1`) | ✅ |
| Sticky action bars on all pages | ✅ |
| Mobile: stacked buttons in action bars | ✅ |
| Mobile: coupon panel visible on cart page | ✅ |
| Mobile: fixed sticky bar (Fragment pattern) on all pages | ✅ |
| Mobile: navbar not clipped (`overflow-x: hidden`) | ✅ |
| Animated entrance (`fadeInUp`) on all pages | ✅ |
| Animated stepper with glow + gradient connector | ✅ |
| Card boxes on all sections + single outer wrapper box | ✅ |
| `animate-pop` success icon + gradient heading on order success | ✅ |
| `useCallback` on all context setters (no infinite loop) | ✅ |
| `hydrated` flag prevents premature redirects on reload | ✅ |
