import CartClient from './CartClient';
import { headers } from 'next/headers';

// Server Component — data is fetched on the server (SSR)
async function getCartData() {
  // During SSR we construct an absolute URL using the request host header
  const hdrs = await headers();
  const host = hdrs.get('host') ?? 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

  const res = await fetch(`${protocol}://${host}/api/cart`, {
    cache: 'no-store', // always fresh — no caching for cart data
  });

  if (!res.ok) throw new Error('Failed to fetch cart data');
  return res.json();
}

export default async function CartPage() {
  const cartData = await getCartData();

  return <CartClient initialCartData={cartData} />;
}
