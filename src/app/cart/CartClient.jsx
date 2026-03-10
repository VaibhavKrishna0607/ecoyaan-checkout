'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/context/CheckoutContext';
import CheckoutProgress from '@/components/CheckoutProgress';
import {
  Lock, Trash2, Heart, Plus, Minus, Tag, ShoppingCart,
  Leaf, ShieldCheck, Truck, RefreshCw, ArrowRight, History,
} from 'lucide-react';

export default function CartClient({ initialCartData }) {
  const router = useRouter();
  const { setCartData } = useCheckout();

  const [items, setItems] = useState(initialCartData.cartItems);
  const [savedItems, setSavedItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const { shipping_fee } = initialCartData;
  const subtotal = items.reduce((acc, i) => acc + i.product_price * i.quantity, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const grandTotal = subtotal + shipping_fee - discount;

  useEffect(() => {
    setCartData({ cartItems: items, shipping_fee, discount_applied: discount });
  }, [items, discount, setCartData, shipping_fee]);

  function updateQty(id, delta) {
    setItems(prev =>
      prev.map(item =>
        item.product_id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  }

  function removeItem(id) {
    setItems(prev => prev.filter(item => item.product_id !== id));
  }

  function saveForLater(id) {
    const found = items.find(i => i.product_id === id);
    if (found) {
      setSavedItems(prev => [...prev, found]);
      setItems(prev => prev.filter(i => i.product_id !== id));
    }
  }

  function moveToCart(id) {
    const found = savedItems.find(i => i.product_id === id);
    if (found) {
      setItems(prev => [...prev, { ...found, quantity: 1 }]);
      setSavedItems(prev => prev.filter(i => i.product_id !== id));
    }
  }

  function removeSaved(id) {
    setSavedItems(prev => prev.filter(i => i.product_id !== id));
  }

  function applyCoupon() {
    if (couponCode.trim().toUpperCase() === 'ECO10') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponApplied(false);
      setCouponError('Invalid code. Try ECO10 for 10% off.');
    }
  }

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <CheckoutProgress currentStep={1} />
        <div className="animate-fade-in-up text-center py-24">
          <div className="w-24 h-24 bg-[#f0f9f4] rounded-full flex items-center justify-center mx-auto mb-5">
            <ShoppingCart size={40} className="text-[#52b788]" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-400 text-sm mb-6">Fill it with eco-friendly goodness.</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2"
          >
            Continue Shopping <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  const SummaryPanel = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-[#d8e8e0] p-5 shadow-sm">
        <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
          <Tag size={14} className="text-[#2d6a4f]" /> Promo Code
        </h2>
        {couponApplied ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
            <div>
              <p className="text-sm font-semibold text-green-700">ECO10 applied ✓</p>
              <p className="text-xs text-green-600 mt-0.5">Saving ₹{discount.toLocaleString()}</p>
            </div>
            <button
              onClick={() => { setCouponApplied(false); setCouponCode(''); }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <div className="flex rounded-lg overflow-hidden border border-[#d8e8e0] focus-within:border-[#40916c] transition-colors">
              <input
                value={couponCode}
                onChange={e => { setCouponCode(e.target.value); setCouponError(''); }}
                onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                placeholder="Enter promo code"
                className="flex-1 px-3 py-1.5 text-sm bg-white outline-none placeholder-gray-400"
              />
              <button
                onClick={applyCoupon}
                className="btn-primary px-2.5 py-3 text-sm font-bold rounded-none"
              >
                Apply
              </button>
            </div>
            {couponError && (
              <p className="text-xs text-red-500 mt-1.5">{couponError}</p>
            )}
            <p className="text-[11px] text-gray-400 mt-1.5">
              Hint: try <span className="font-mono font-semibold text-[#2d6a4f]">ECO10</span> for 10% off
            </p>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[#d8e8e0] p-5 shadow-sm">
        <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-4">Order Summary</h2>
        <div className="space-y-2 text-sm mb-3">
          {items.map(item => (
            <div key={item.product_id} className="flex justify-between text-gray-500">
              <span className="truncate max-w-42.5">{item.product_name} x {item.quantity}</span>
              <span className="font-medium text-gray-700 ml-2 shrink-0">
                ₹{(item.product_price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-[#d8e8e0] pt-3 space-y-2 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span className="font-medium text-gray-700">₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Shipping</span>
            {shipping_fee === 0
              ? <span className="text-green-600 font-medium">Free</span>
              : <span className="font-medium text-gray-700">₹{shipping_fee.toLocaleString()}</span>}
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Promo (ECO10)</span>
              <span className="font-medium">- ₹{discount.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t border-[#d8e8e0] pt-2.5 flex justify-between font-bold text-gray-800 text-base">
            <span>Total</span>
            <span className="text-[#2d6a4f]">₹{grandTotal.toLocaleString()}</span>
          </div>
        </div>
        {discount > 0 && (
          <div className="mt-3 bg-green-50 rounded-lg px-3 py-2 text-xs text-green-700 font-medium text-center">
            You are saving ₹{discount.toLocaleString()} on this order!
          </div>
        )}
        <button
          onClick={() => router.push('/shipping')}
          disabled={items.length === 0}
          className="mt-4 w-full btn-primary py-3 px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Lock size={14} /> Begin Checkout
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">
          Secure and encrypted checkout
        </p>
        <div className="mt-4 pt-4 border-t border-[#d8e8e0] grid grid-cols-3 gap-2 text-center">
          {[
            { icon: ShieldCheck, label: '100% Secure' },
            { icon: Truck, label: 'Fast Delivery' },
            { icon: RefreshCw, label: 'Easy Returns' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon size={16} className="text-[#52b788]" />
              <span className="text-[10px] text-gray-400 leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in-up max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-32 lg:pb-10">
      <CheckoutProgress currentStep={1} />

      <div className="flex items-center justify-between mb-6 bg-white rounded-xl border border-[#d8e8e0] shadow-sm px-5 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Cart</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {items.length} item{items.length !== 1 ? 's' : ''} &middot; Free returns within 7 days
          </p>
        </div>
        <span className="hidden sm:flex items-center gap-1 text-xs font-medium text-[#2d6a4f] bg-[#f0f9f4] border border-[#b7e0c8] px-2.5 py-1 rounded-full">
          <Leaf size={12} /> Carbon-neutral shipping
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-3">
          {items.map(item => (
            <div
              key={item.product_id}
              className="bg-white rounded-xl border border-[#d8e8e0] p-4 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex gap-3 sm:gap-4">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-[#f0f9f4]">
                  <Image
                    src={item.image}
                    alt={item.product_name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="font-semibold text-gray-800 text-sm sm:text-base leading-snug">
                        {item.product_name}
                      </h2>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#40916c] bg-[#f0f9f4] px-1.5 py-0.5 rounded-md mt-1">
                        <Leaf size={9} /> Eco-certified
                      </span>
                    </div>
                    <p className="font-bold text-[#2d6a4f] text-base sm:text-lg shrink-0">
                      ₹{(item.product_price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    ₹{item.product_price.toLocaleString()} per unit
                  </p>
                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    <div className="flex items-center border border-[#d8e8e0] rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQty(item.product_id, -1)}
                        aria-label="Decrease quantity"
                        className="w-8 h-8 flex items-center justify-center text-[#2d6a4f] hover:bg-[#f0f9f4] active:bg-[#d8e8e0] transition-colors"
                      >
                        <Minus size={13} strokeWidth={2.5} />
                      </button>
                      <span className="w-9 text-center text-sm font-bold text-gray-800 select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.product_id, 1)}
                        aria-label="Increase quantity"
                        className="w-8 h-8 flex items-center justify-center text-[#2d6a4f] hover:bg-[#f0f9f4] active:bg-[#d8e8e0] transition-colors"
                      >
                        <Plus size={13} strokeWidth={2.5} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => saveForLater(item.product_id)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:text-[#2d6a4f] hover:bg-[#f0f9f4] border border-transparent hover:border-[#d8e8e0] transition-all"
                      >
                        <Heart size={13} />
                        <span>Save for Later</span>
                      </button>
                      <span className="text-gray-300 text-sm">|</span>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-right border-t border-[#f0f4f2] pt-2">
                    Item Total: <span className="font-semibold text-gray-600">₹{(item.product_price * item.quantity).toLocaleString()}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-3 bg-white rounded-xl border border-[#d8e8e0] shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <History size={18} className="text-gray-500" />
              <div>
                <h2 className="font-bold text-gray-700 text-base">
                  Saved for Later
                  {savedItems.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-400">({savedItems.length})</span>
                  )}
                </h2>
                <p className="text-xs text-gray-400">Stash ideas here, commitment-free!</p>
              </div>
            </div>
            {savedItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#d8e8e0] p-8 text-center text-sm text-gray-400">
                Any items you Save for Later will appear here
              </div>
            ) : (
              <div className="space-y-2">
                {savedItems.map(item => (
                  <div
                    key={item.product_id}
                    className="bg-white rounded-xl border border-dashed border-[#b7e0c8] p-3 flex gap-3 items-center"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[#f0f9f4]">
                      <Image
                        src={item.image}
                        alt={item.product_name}
                        fill
                        className="object-cover grayscale opacity-80"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-700 text-sm truncate">{item.product_name}</p>
                      <p className="text-sm text-[#2d6a4f] font-semibold">₹{item.product_price.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <button
                        onClick={() => moveToCart(item.product_id)}
                        className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
                      >
                        Move to Cart
                      </button>
                      <button
                        onClick={() => removeSaved(item.product_id)}
                        className="text-[11px] text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-72 xl:w-80 hidden lg:block">
          <div className="sticky top-20">
            {SummaryPanel()}
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#d8e8e0] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-4 py-3">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <div>
            <p className="text-xs text-gray-400">Grand Total</p>
            <p className="text-lg font-bold text-[#2d6a4f]">₹{grandTotal.toLocaleString()}</p>
            {discount > 0 && <p className="text-[10px] text-green-600">Saving ₹{discount.toLocaleString()}</p>}
          </div>
          <button
            onClick={() => router.push('/shipping')}
            disabled={items.length === 0}
            className="btn-primary py-3 px-6 rounded-xl font-semibold text-sm flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            Checkout <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}