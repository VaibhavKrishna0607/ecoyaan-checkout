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
| `Navbar.jsx` | Server | Static UI, no interactivity |
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
      api/cart/route.js        ← Mock GET API (50ms delay, returns cart JSON)
      cart/
        page.jsx               ← Async Server Component, SSR fetch
        CartClient.jsx         ← Client UI, hydrates Context
      shipping/page.jsx        ← Shipping form + full validation
      payment/page.jsx         ← Payment method + order review + pay button
      order-success/page.jsx   ← Success screen with order summary
      layout.jsx               ← Root layout: CheckoutProvider + Navbar
      page.jsx                 ← redirect('/cart')
    components/
      Navbar.jsx               ← Sticky header with Leaf icon
      CheckoutProgress.jsx     ← Animated 3-step progress bar
    context/
      CheckoutContext.jsx      ← cartData, shippingAddress, orderPlaced
```
