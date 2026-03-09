import CartClient from './CartClient';
import { getMockCartData } from '@/lib/cartData';

export default async function CartPage() {
  const cartData = getMockCartData();
  return <CartClient initialCartData={cartData} />;
}
