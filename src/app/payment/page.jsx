'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/context/CheckoutContext';
import CheckoutProgress from '@/components/CheckoutProgress';
import { Smartphone, CreditCard, Banknote, Lock, Tag, MapPin } from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const { cartData, shippingAddress, setOrderPlaced, hydrated } = useCheckout();
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  // Guard: redirect if missing upstream data
  useEffect(() => {
    if (hydrated && (!cartData || !shippingAddress)) router.replace('/cart');
  }, [cartData, shippingAddress, router, hydrated]);

  if (!hydrated || !cartData || !shippingAddress) return null;

  const subtotal = cartData.cartItems.reduce(
    (acc, item) => acc + item.product_price * item.quantity,
    0
  );
  const grandTotal = subtotal + cartData.shipping_fee - cartData.discount_applied;

  async function handlePay() {
    setIsProcessing(true);
    // Simulate payment processing delay
    await new Promise((res) => setTimeout(res, 1800));
    setOrderPlaced(true);
    router.push('/order-success');
  }

  const methodOptions = [
    { id: 'upi', label: 'UPI', Icon: Smartphone, description: 'Pay via Google Pay, PhonePe, Paytm' },
    { id: 'card', label: 'Credit / Debit Card', Icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
    { id: 'cod', label: 'Cash on Delivery', Icon: Banknote, description: 'Pay when delivered' },
  ];

  return (
    <>
    <div className="animate-fade-in-up max-w-5xl mx-auto px-4 sm:px-6 py-4 pb-24">
      <div className="bg-[#f6faf6] rounded-2xl border border-[#d8e8e0] shadow-md p-4 lg:p-6">
        <CheckoutProgress currentStep={3} />

      <div className="bg-white rounded-xl border border-[#d8e8e0] shadow-sm px-5 py-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Review &amp; Pay</h1>
        <p className="text-sm text-gray-400 mt-0.5">Almost there — confirm your order details and pay securely.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column */}
        <div className="flex-1 space-y-5">
          {/* Shipping Summary */}
          <div className="bg-white rounded-xl border border-[#d8e8e0] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivering to</h2>
              <button
                onClick={() => router.push('/shipping')}
                className="text-xs text-[#2d6a4f] hover:underline font-medium"
              >
                Edit
              </button>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#f0f9f4] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin size={17} className="text-[#2d6a4f]" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{shippingAddress.fullName}</p>
                {shippingAddress.address && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{shippingAddress.address}</p>
                )}
                <p className="text-xs text-gray-500">{shippingAddress.city}, {shippingAddress.state} &ndash; {shippingAddress.pinCode}</p>
                <p className="text-xs text-gray-400 mt-1">{shippingAddress.phone} &middot; {shippingAddress.email}</p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl border border-[#d8e8e0] p-5 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">Payment Method</h2>
            <div className="space-y-3">
              {methodOptions.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${selectedMethod === m.id
                      ? 'border-[#2d6a4f] bg-[#f0fcf6] shadow-[0_2px_12px_rgba(45,106,79,0.12)]'
                      : 'border-[#d8e8e0] bg-white hover:border-[#40916c] hover:shadow-sm'
                    }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.id}
                    checked={selectedMethod === m.id}
                    onChange={() => setSelectedMethod(m.id)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200
                    ${selectedMethod === m.id ? 'bg-[#2d6a4f] text-white' : 'bg-[#f0f9f4] text-[#2d6a4f]'}`}>
                    <m.Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{m.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200
                    ${selectedMethod === m.id ? 'border-[#2d6a4f] bg-[#2d6a4f]' : 'border-[#d8e8e0]'}`}>
                    {selectedMethod === m.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </label>
              ))}
            </div>

            {/* Simulated input hint */}
            {(selectedMethod === 'card' || selectedMethod === 'upi') && (
              <div className="mt-4 flex items-start gap-3 bg-[#f0f9f4] border border-[#d8e8e0] rounded-xl p-4">
                <div className="w-8 h-8 rounded-full bg-[#d8f3dc] flex items-center justify-center shrink-0">
                  <Lock size={14} className="text-[#2d6a4f]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#2d6a4f]">
                    {selectedMethod === 'upi' ? 'UPI payment ready' : 'Card payment ready'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                     &ldquo;Pay Securely&rdquo; in the bar below to complete your order.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column — Order Summary */}
        <div className="lg:w-80 xl:w-96">
          <div className="bg-white rounded-xl border border-[#d8e8e0] p-6 shadow-sm sticky top-20">
            <h2 className="font-bold text-gray-800 text-lg mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm mb-4">
              {cartData.cartItems.map((item) => (
                <div key={item.product_id} className="flex justify-between text-gray-600">
                  <span className="truncate max-w-45">{item.product_name} × {item.quantity}</span>
                  <span className="font-medium ml-2">₹{(item.product_price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#d8e8e0] pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>₹{cartData.shipping_fee.toLocaleString()}</span>
              </div>
              {cartData.discount_applied > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>− ₹{cartData.discount_applied.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-[#d8e8e0] pt-2 flex justify-between font-bold text-gray-800 text-base">
                <span>Total</span>
                <span className="text-[#2d6a4f]">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#d8e8e0] flex items-center gap-2 text-xs text-gray-400">
              <Lock size={13} className="text-[#52b788] shrink-0" />
              <span>256-bit SSL encrypted. Safe &amp; secure checkout.</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#d8e8e0] shadow-[0_-4px_20px_rgba(0,0,0,0.07)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push('/shipping')}
            className="py-3 px-5 rounded-xl border border-[#d8e8e0] text-gray-600 font-semibold text-sm hover:border-[#40916c] hover:text-[#2d6a4f] transition-colors shrink-0"
          >
            &larr; Back
          </button>
          <div className="flex-1" />
          <div className="text-right hidden sm:block mr-2">
            <p className="text-xs text-gray-500">Grand Total</p>
            <p className="text-base font-bold text-[#2d6a4f]">&#8377;{grandTotal.toLocaleString()}</p>
          </div>
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className={`py-3 px-6 rounded-xl font-semibold text-sm flex items-center gap-2 shrink-0 transition-all
              ${isProcessing
                ? 'bg-[#40916c] text-white cursor-not-allowed opacity-75'
                : 'btn-primary cursor-pointer'
              }`}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Processing&hellip;
              </>
            ) : (
              <><Lock size={14} className="mr-0.5" /> Pay Securely</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
