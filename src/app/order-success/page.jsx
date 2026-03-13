'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCheckout } from '@/context/CheckoutContext';
import { CheckCircle2, Globe, Leaf, Truck } from 'lucide-react';

export default function OrderSuccessPage() {
  const router = useRouter();
  const { orderPlaced, cartData, shippingAddress, hydrated } = useCheckout();

  // Prevent direct access to success page without placing an order
  useEffect(() => {
    if (hydrated && !orderPlaced) {
      router.replace('/cart');
    }
  }, [orderPlaced, router, hydrated]);

  if (!hydrated || !orderPlaced || !cartData || !shippingAddress) {
    return null;
  }

  const subtotal = cartData.cartItems.reduce(
    (acc, item) => acc + item.product_price * item.quantity,
    0
  );
  const grandTotal = subtotal + cartData.shipping_fee - cartData.discount_applied;

  // Generate a stable order ID — useMemo prevents re-generating on re-renders
  const orderId = useMemo(() => `ECO-${Math.floor(100000 + Math.random() * 900000)}`, []);
  const deliveryDate = useMemo(() => {
    const businessDays = 5 + Math.floor(Math.random() * 3);
    let added = 0;
    const cursor = new Date();

    while (added < businessDays) {
      cursor.setDate(cursor.getDate() + 1);
      if (cursor.getDay() !== 0 && cursor.getDay() !== 6) added += 1;
    }

    return cursor.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
      <div className="bg-[#f6faf6] rounded-2xl border border-[#d8e8e0] shadow-md p-4 lg:p-6">
      {/* Success Banner */}
      <div className="text-center mb-6 bg-white rounded-2xl border border-[#d8e8e0] shadow-sm px-6 py-8">
        <div className="w-20 h-20 bg-[#d8f3dc] rounded-full flex items-center justify-center mx-auto mb-4 animate-pop">
          <CheckCircle2 size={44} className="text-[#2d6a4f]" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2d6a4f] to-[#52b788] bg-clip-text text-transparent mb-2">Order Successful!</h1>
        <p className="text-gray-500">
          Thank you, <span className="font-medium text-gray-700">{shippingAddress.fullName}</span>! <Leaf size={16} className="inline text-[#2d6a4f] mb-0.5" />
        </p>
        <p className="text-gray-500 text-sm mt-1">
          A confirmation has been sent to{' '}
          <span className="font-medium text-gray-700">{shippingAddress.email}</span>
        </p>
      </div>

      {/* Order Details Card */}
      <div className="bg-white rounded-xl border border-[#d8e8e0] shadow-sm overflow-hidden">
        <div className="bg-[#2d6a4f] px-6 py-4 flex items-center justify-between">
          <span className="text-white text-sm font-medium">Order ID</span>
          <span className="text-white font-bold tracking-wide">{orderId}</span>
        </div>

        <div className="p-6">
          {/* Items */}
          <h2 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Items Ordered</h2>
          <div className="space-y-2 mb-5">
            {cartData.cartItems.map((item) => (
              <div key={item.product_id} className="flex justify-between text-sm text-gray-600">
                <span>{item.product_name} × {item.quantity}</span>
                <span className="font-medium">₹{(item.product_price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-[#d8e8e0] pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>₹{cartData.shipping_fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-base border-t border-[#d8e8e0] pt-2">
              <span>Total Paid</span>
              <span className="text-[#2d6a4f]">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Shipping address */}
          <div className="border-t border-[#d8e8e0] mt-5 pt-5">
            <h2 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">Shipping To</h2>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-700">{shippingAddress.fullName}</p>
              {shippingAddress.address && <p>{shippingAddress.address}</p>}
              <p>{shippingAddress.city}, {shippingAddress.state} – {shippingAddress.pinCode}</p>
              <p>{shippingAddress.phone}</p>
            </div>
            <div className="mt-3 bg-[#f0f9f4] rounded-lg border border-[#d8e8e0] px-3 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck size={14} className="text-[#2d6a4f]" />
                <span>Estimated Delivery</span>
              </div>
              <span className="text-sm font-semibold text-[#2d6a4f]">{deliveryDate}</span>
            </div>
          </div>

          {/* Eco message */}
          <div className="mt-5 bg-[#f0f9f4] rounded-lg p-4 flex items-start gap-3">
            <Globe size={24} className="text-[#2d6a4f] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#2d6a4f]">Making the planet greener, one order at a time.</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Your purchase supports sustainable practices and eco-friendly packaging.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link
          href="/cart"
          className="inline-block btn-primary py-3 px-8 rounded-lg font-semibold text-sm"
        >
          Continue Shopping
        </Link>
      </div>
      </div>
    </div>
  );
}
