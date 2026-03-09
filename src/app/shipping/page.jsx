'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/context/CheckoutContext';
import CheckoutProgress from '@/components/CheckoutProgress';
import { AlertTriangle } from 'lucide-react';

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];

function validate(values) {
  const errors = {};

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  } else if (values.fullName.trim().length < 3) {
    errors.fullName = 'Name must be at least 3 characters.';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!/^[6-9]\d{9}$/.test(values.phone)) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number.';
  }

  if (!values.address.trim()) {
    errors.address = 'Street address is required.';
  }

  if (!values.pinCode.trim()) {
    errors.pinCode = 'PIN code is required.';
  } else if (!/^\d{6}$/.test(values.pinCode)) {
    errors.pinCode = 'PIN code must be exactly 6 digits.';
  }

  if (!values.city.trim()) {
    errors.city = 'City is required.';
  }

  if (!values.state) {
    errors.state = 'Please select a state.';
  }

  return errors;
}

export default function ShippingPage() {
  const router = useRouter();
  const { cartData, shippingAddress, setShippingAddress } = useCheckout();

  const [values, setValues] = useState(
    shippingAddress ?? {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      pinCode: '',
      city: '',
      state: '',
    }
  );
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Redirect if no cart data (user navigated directly)
  useEffect(() => {
    if (!cartData) router.replace('/cart');
  }, [cartData, router]);

  if (!cartData) return null;

  function handleChange(field, value) {
    const updated = { ...values, [field]: value };
    setValues(updated);
    if (touched[field]) {
      setErrors(validate(updated));
    }
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(values));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {}
    );
    setTouched(allTouched);

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setShippingAddress(values);
      router.push('/payment');
    }
  }

  const fields = [
    { key: 'fullName', label: 'Full Name', placeholder: 'e.g. Priya Sharma' },
    { key: 'email', label: 'Email Address', type: 'email', placeholder: 'priya@example.com' },
    { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '9876543210' },
    { key: 'address', label: 'Street Address / Flat No.', placeholder: 'e.g. 42B, MG Road, Andheri West' },
    { key: 'pinCode', label: 'PIN Code', placeholder: '400001' },
    { key: 'city', label: 'City', placeholder: 'Mumbai' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <CheckoutProgress currentStep={2} />

      <h1 className="text-2xl font-bold text-gray-800 mb-2">Shipping Address</h1>
      <p className="text-gray-500 text-sm mb-6">Tell us where to deliver your eco-friendly goodies.</p>

      <form onSubmit={handleSubmit} noValidate className="bg-white rounded-xl border border-[#d8e8e0] p-6 shadow-sm space-y-5">
        {fields.map(({ key, label, type = 'text', placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={key}>
              {label} <span className="text-red-500">*</span>
            </label>
            <input
              id={key}
              type={type}
              value={values[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              onBlur={() => handleBlur(key)}
              placeholder={placeholder}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors bg-white
                ${touched[key] && errors[key]
                  ? 'border-red-400 bg-red-50'
                  : 'border-[#d8e8e0] hover:border-[#40916c]'
                }`}
            />
            {touched[key] && errors[key] && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertTriangle size={12} /> {errors[key]}
              </p>
            )}
          </div>
        ))}

        {/* State dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="state">
            State <span className="text-red-500">*</span>
          </label>
          <select
            id="state"
            value={values.state}
            onChange={(e) => handleChange('state', e.target.value)}
            onBlur={() => handleBlur('state')}
            className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors bg-white
              ${touched.state && errors.state
                ? 'border-red-400 bg-red-50'
                : 'border-[#d8e8e0] hover:border-[#40916c]'
              }`}
          >
            <option value="">Select your state</option>
            {INDIA_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {touched.state && errors.state && (
            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
              <AlertTriangle size={12} /> {errors.state}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/cart')}
            className="flex-1 py-3 px-6 rounded-lg border border-[#d8e8e0] text-gray-600 font-semibold text-sm hover:border-[#40916c] hover:text-[#2d6a4f] transition-colors"
          >
            ← Back to Cart
          </button>
          <button
            type="submit"
            className="flex-1 btn-primary py-3 px-6 rounded-lg font-semibold text-sm cursor-pointer"
          >
            Continue to Payment →
          </button>
        </div>
      </form>
    </div>
  );
}
