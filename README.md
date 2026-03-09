# 🌿 Ecoyaan Checkout Flow

A simplified, full-stack checkout flow inspired by the Ecoyaan sustainable e-commerce platform — built with **Next.js 15 (App Router)**, **JavaScript**, and **Tailwind CSS**.

## Live Demo

> Deploy to [Vercel](https://vercel.com) (see instructions below) and paste the URL here.

---

## Features

| Screen | Details |
|---|---|
| **Cart / Order Summary** | SSR via Next.js Server Component + `/api/cart` route; shows product list, subtotal, shipping fee, grand total |
| **Shipping Address** | Controlled form with real-time validation (email regex, 10-digit Indian mobile, 6-digit PIN, required fields, state dropdown) |
| **Payment / Confirmation** | Final order review, three simulated payment methods (UPI / Card / COD), loading state during "payment" |
| **Order Success** | Confirmation with auto-generated order ID, eco-friendly message, direct-URL guard |

---

## Architectural Choices

### SSR with Server Components
The `/cart` route is a **React Server Component** that calls the internal `/api/cart` API route on the server before responding to the browser. This ensures the page is pre-rendered with cart data (no client-side loading flash) and demonstrates Next.js SSR best practices.

### State Management — Context API
A single `CheckoutContext` (in `src/context/CheckoutContext.tsx`) holds three pieces of cross-page state:
- `cartData` — hydrated from SSR props on the Cart page
- `shippingAddress` — written on form submission, read on the Payment page
- `orderPlaced` — boolean flag to guard the success page

This keeps the state minimal and co-located without the overhead of an external library.

### Mock Backend
`src/app/api/cart/route.ts` is a **Next.js Route Handler** that returns the mock JSON data. The server component fetches it with `cache: 'no-store'` to always get fresh data, simulating a real cart API.

### Form Validation
Client-side only (no server round-trip needed for simple field checks). Validation runs:
- **on blur** — validates the individual field immediately
- **on submit** — marks all fields touched and blocks navigation if errors exist

### Styling
Tailwind CSS with a custom eco-green palette (`#2d6a4f`, `#40916c`, `#52b788`). Mobile-first responsive layout: single-column on small screens, two-column on `lg+`. Sticky summary card in the cart and payment views.

---

## Project Structure

```
src/
├── app/
│   ├── api/cart/route.ts        # Mock API endpoint (GET /api/cart)
│   ├── cart/
│   │   ├── page.tsx             # Server Component — fetches cart via SSR
│   │   └── CartClient.tsx       # Client Component — renders cart UI
│   ├── shipping/page.tsx        # Shipping address form with validation
│   ├── payment/page.tsx         # Payment method selection + order review
│   ├── order-success/page.tsx   # Success screen
│   ├── layout.tsx               # Root layout — wraps with CheckoutProvider + Navbar
│   ├── page.tsx                 # Redirects / → /cart
│   └── globals.css              # Global styles + CSS variables
├── components/
│   ├── Navbar.tsx               # Sticky header with brand logo
│   └── CheckoutProgress.tsx     # Step indicator (Cart → Shipping → Payment)
├── context/
│   └── CheckoutContext.tsx      # Global checkout state (Context API)
└── types/
    └── index.ts                 # Shared TypeScript types
```

## Workflow

![Checkout Flow Diagram](./Workflow.png)

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Install & Run Locally

```bash
# Clone the repo
git clone <your-repo-url>
cd ecoyaan-checkout

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the cart automatically.

### Build for Production

```bash
npm run build
npm start
```

---

## Deploy to Vercel

1. Push the `ecoyaan-checkout` folder to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Set the **Root Directory** to `ecoyaan-checkout` (if needed).
4. Click **Deploy** — no environment variables required.

---

## Tech Stack

- **Next.js 15** (App Router, Server Components, Route Handlers)
- **React 19**
- **JavaScript**
- **Tailwind CSS v4**


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
