import CartClient from './CartClient';
import { getMockCartData } from '@/lib/cartData';

async function getCartData() {
  // Small delay to simulate real API latency
  await new Promise((res) => setTimeout(res, 50));
  return getMockCartData();
}

export default async function CartPage() {
  const cartData = await getCartData();
  return <CartClient initialCartData={cartData} />;
}
