'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/context/CheckoutContext';
import CheckoutProgress from '@/components/CheckoutProgress';
import { Smartphone, CreditCard, Banknote, Lock, Tag } from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const { cartData, shippingAddress, setOrderPlaced } = useCheckout();
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  // Guard: redirect if missing upstream data
  useEffect(() => {
    if (!cartData || !shippingAddress) router.replace('/cart');
  }, [cartData, shippingAddress, router]);

  if (!cartData || !shippingAddress) return null;

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <CheckoutProgress currentStep={3} />

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Review & Pay</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column */}
        <div className="flex-1 space-y-5">
          {/* Shipping Summary */}
          <div className="bg-white rounded-xl border border-[#d8e8e0] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Delivering to</h2>
              <button
                onClick={() => router.push('/shipping')}
                className="text-xs text-[#2d6a4f] hover:underline font-medium"
              >
                Edit
              </button>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-800">{shippingAddress.fullName}</p>
              <p>{shippingAddress.email}</p>
              <p>{shippingAddress.phone}</p>
              <p>
                {shippingAddress.city}, {shippingAddress.state} – {shippingAddress.pinCode}
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl border border-[#d8e8e0] p-5 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">Payment Method</h2>
            <div className="space-y-3">
              {methodOptions.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-4 p-3.5 rounded-lg border cursor-pointer transition-all
                    ${selectedMethod === m.id
                      ? 'border-[#2d6a4f] bg-[#f0f9f4]'
                      : 'border-[#d8e8e0] hover:border-[#40916c]'
                    }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.id}
                    checked={selectedMethod === m.id}
                    onChange={() => setSelectedMethod(m.id)}
                    className="accent-[#2d6a4f] w-4 h-4 shrink-0"
                  />
                  <m.Icon size={20} className="text-[#2d6a4f] shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{m.label}</p>
                    <p className="text-xs text-gray-500">{m.description}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Simulated input hint */}
            {selectedMethod === 'card' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 text-center">
                Card input is simulated — click "Pay Securely" to complete.
              </div>
            )}
            {selectedMethod === 'upi' && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 text-center">
                UPI is simulated — click "Pay Securely" to complete.
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

            <button
              onClick={handlePay}
              disabled={isProcessing}
              className={`mt-6 w-full py-3 px-6 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-all
                ${isProcessing
                  ? 'bg-[#40916c] text-white cursor-not-allowed opacity-75'
                  : 'btn-primary cursor-pointer'
                }`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Processing…
                </>
              ) : (
                <><Lock size={15} className="mr-1" /> Pay Securely ₹{grandTotal.toLocaleString()}</>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-2">
              By placing this order you agree to our Terms of Service.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push('/shipping')}
        className="mt-4 text-sm text-gray-500 hover:text-[#2d6a4f] transition-colors"
      >
        ← Back to Shipping
      </button>
    </div>
  );
}
