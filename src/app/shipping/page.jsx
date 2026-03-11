'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '@/context/CheckoutContext';
import CheckoutProgress from '@/components/CheckoutProgress';
import { AlertTriangle, Plus, MapPin, Pencil, Trash2, Check, X, Home, Briefcase } from 'lucide-react';

const ADDRESS_TYPES = [
  { value: 'home', label: 'Home', Icon: Home },
  { value: 'office', label: 'Office', Icon: Briefcase },
  { value: 'other', label: 'Other', Icon: MapPin },
];

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];

const EMPTY = { fullName: '', email: '', phone: '', address: '', pinCode: '', city: '', state: '', type: 'home' };

function validate(v) {
  const e = {};
  if (!v.fullName.trim()) e.fullName = 'Full name is required.';
  else if (v.fullName.trim().length < 3) e.fullName = 'Name must be at least 3 characters.';
  if (!v.email.trim()) e.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = 'Please enter a valid email address.';
  if (!v.phone.trim()) e.phone = 'Phone number is required.';
  else if (!/^[6-9]\d{9}$/.test(v.phone)) e.phone = 'Enter a valid 10-digit Indian mobile number.';
  if (!v.address.trim()) e.address = 'Street address is required.';
  if (!v.pinCode.trim()) e.pinCode = 'PIN code is required.';
  else if (!/^\d{6}$/.test(v.pinCode)) e.pinCode = 'PIN code must be exactly 6 digits.';
  if (!v.city.trim()) e.city = 'City is required.';
  if (!v.state) e.state = 'Please select a state.';
  return e;
}

export default function ShippingPage() {
  const router = useRouter();
  const { cartData, shippingAddress, setShippingAddress, savedAddresses, setSavedAddresses, hydrated } = useCheckout();

  const [selectedId, setSelectedId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // After hydration: set initial selection and form visibility
  useEffect(() => {
    if (!hydrated) return;
    if (savedAddresses.length === 0) {
      setFormOpen(true);
    } else {
      const preferred = shippingAddress
        ? savedAddresses.find(a => a.id === shippingAddress.id)
        : null;
      setSelectedId(preferred?.id ?? savedAddresses[0].id);
    }
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hydrated && !cartData) router.replace('/cart');
  }, [cartData, hydrated, router]);

  if (!hydrated || !cartData) return null;

  function handleChange(field, val) {
    const updated = { ...values, [field]: val };
    setValues(updated);
    if (touched[field]) setErrors(validate(updated));
  }

  function handleBlur(field) {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(validate(values));
  }

  function saveAddress(e) {
    e.preventDefault();
    const allTouched = Object.keys(EMPTY).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (editingId) {
      setSavedAddresses(savedAddresses.map(a => a.id === editingId ? { ...values, id: editingId } : a));
      setSelectedId(editingId);
    } else {
      const id = 'addr_' + Date.now();
      setSavedAddresses([...savedAddresses, { ...values, id }]);
      setSelectedId(id);
    }
    closeForm();
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setValues(EMPTY);
    setErrors({});
    setTouched({});
  }

  function startEdit(addr) {
    const { id, ...rest } = addr;
    setEditingId(id);
    setValues(rest);
    setErrors({});
    setTouched({});
    setFormOpen(true);
  }

  function deleteAddr(id) {
    const updated = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(updated);
    if (selectedId === id) setSelectedId(updated[0]?.id ?? null);
    if (updated.length === 0) setFormOpen(true);
  }

  function handleContinue() {
    const sel = savedAddresses.find(a => a.id === selectedId);
    if (!sel) return;
    setShippingAddress(sel);
    router.push('/payment');
  }

  const canContinue = !!selectedId && !formOpen;

  return (
    <>
    <div className="animate-fade-in-up max-w-2xl mx-auto px-4 sm:px-6 py-4 pb-24">
      <div className="bg-[#f6faf6] rounded-2xl border border-[#d8e8e0] shadow-md p-4 lg:p-6">
        <CheckoutProgress currentStep={2} />

      <div className="mb-6 bg-white rounded-xl border border-[#d8e8e0] shadow-sm px-5 py-4">
        <h1 className="text-2xl font-bold text-gray-800">Shipping Address</h1>
        <p className="text-gray-500 text-sm mt-1">Choose or add a delivery address for your order.</p>
      </div>

      {/* Saved address cards */}
      {savedAddresses.length > 0 && (
        <div className="space-y-3 mb-4">
          {savedAddresses.map(addr => (
            <div
              key={addr.id}
              onClick={() => { if (!formOpen) setSelectedId(addr.id); }}
              className={[
                'relative bg-white rounded-xl border-2 p-4 transition-all',
                !formOpen ? 'cursor-pointer' : 'opacity-50 pointer-events-none',
                selectedId === addr.id && !formOpen
                  ? 'border-[#2d6a4f] bg-[#f0fcf6] shadow-[0_0_0_4px_rgba(45,106,79,0.07)]'
                  : 'border-[#d8e8e0] bg-white hover:border-[#b7e0c8]',
              ].join(' ')}
            >
              {selectedId === addr.id && !formOpen && (
                <div className="absolute top-3.5 right-3.5 w-5 h-5 bg-[#2d6a4f] rounded-full flex items-center justify-center">
                  <Check size={11} className="text-white" strokeWidth={3} />
                </div>
              )}
              <div className="flex gap-3">
                <MapPin
                  size={16}
                  className={['mt-0.5 shrink-0', selectedId === addr.id && !formOpen ? 'text-[#2d6a4f]' : 'text-gray-400'].join(' ')}
                />
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 text-sm">{addr.fullName}</p>
                    {addr.type && (
                      <span className="text-[10px] font-medium text-[#2d6a4f] bg-[#f0f9f4] border border-[#d8e8e0] px-1.5 py-0.5 rounded-full capitalize">{addr.type}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{addr.address}</p>
                  <p className="text-xs text-gray-500">{addr.city}, {addr.state} &ndash; {addr.pinCode}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{addr.phone} &middot; {addr.email}</p>
                </div>
              </div>
              <div className="flex gap-1 mt-3 pt-3 border-t border-[#f0f4f2]">
                <button
                  onClick={e => { e.stopPropagation(); startEdit(addr); }}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#2d6a4f] transition-colors px-2.5 py-1 rounded-lg hover:bg-[#f0f9f4]"
                >
                  <Pencil size={11} /> Edit
                </button>
                <button
                  onClick={e => { e.stopPropagation(); deleteAddr(addr.id); }}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors px-2.5 py-1 rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={11} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new address button */}
      {!formOpen && (
        <button
          onClick={() => { setEditingId(null); setValues(EMPTY); setErrors({}); setTouched({}); setFormOpen(true); }}
          className="w-full flex items-center justify-center gap-2 py-3 mb-4 rounded-xl border-2 bg-white border-[#b7e0c8] text-[#2d6a4f] font-medium text-sm hover:bg-[#f0fcf6] hover:border-[#40916c] transition-all"
        >
          <Plus size={15} /> Add New Address
        </button>
      )}

      {/* Address form */}
      {formOpen && (
        <div className="bg-white rounded-xl border border-[#d8e8e0] p-6 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">{editingId ? 'Edit Address' : 'New Address'}</h2>
            {savedAddresses.length > 0 && (
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100">
                <X size={16} />
              </button>
            )}
          </div>
          <form onSubmit={saveAddress} noValidate>
            {/* Address type selector */}
            <div className="flex gap-2 mb-5">
              {ADDRESS_TYPES.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleChange('type', value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                    values.type === value
                      ? 'border-[#2d6a4f] bg-[#f0f9f4] text-[#2d6a4f]'
                      : 'border-[#d8e8e0] text-gray-500 hover:border-[#40916c] hover:text-[#2d6a4f]'
                  }`}
                >
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FormField label="Full Name" id="fullName" placeholder="e.g. Priya Sharma"
                  value={values.fullName} onChange={v => handleChange('fullName', v)}
                  onBlur={() => handleBlur('fullName')} error={touched.fullName && errors.fullName} />
              </div>
              <FormField label="Email Address" id="email" type="email" placeholder="priya@example.com"
                value={values.email} onChange={v => handleChange('email', v)}
                onBlur={() => handleBlur('email')} error={touched.email && errors.email} />
              <FormField label="Phone Number" id="phone" type="tel" placeholder="9876543210"
                value={values.phone} onChange={v => handleChange('phone', v)}
                onBlur={() => handleBlur('phone')} error={touched.phone && errors.phone} />
              <div className="sm:col-span-2">
                <FormField label="Street Address / Flat No." id="address" placeholder="e.g. 42B, MG Road, Andheri West"
                  value={values.address} onChange={v => handleChange('address', v)}
                  onBlur={() => handleBlur('address')} error={touched.address && errors.address} />
              </div>
              <FormField label="PIN Code" id="pinCode" placeholder="400001"
                value={values.pinCode} onChange={v => handleChange('pinCode', v)}
                onBlur={() => handleBlur('pinCode')} error={touched.pinCode && errors.pinCode} />
              <FormField label="City" id="city" placeholder="Mumbai"
                value={values.city} onChange={v => handleChange('city', v)}
                onBlur={() => handleBlur('city')} error={touched.city && errors.city} />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="state">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  id="state"
                  value={values.state}
                  onChange={e => handleChange('state', e.target.value)}
                  onBlur={() => handleBlur('state')}
                  className={['w-full px-4 py-2.5 rounded-lg border text-sm bg-white transition-colors',
                    touched.state && errors.state ? 'border-red-400 bg-red-50' : 'border-[#d8e8e0] hover:border-[#40916c]'].join(' ')}
                >
                  <option value="">Select your state</option>
                  {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {touched.state && errors.state && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} /> {errors.state}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              {savedAddresses.length > 0 && (
                <button type="button" onClick={closeForm}
                  className="flex-1 py-2.5 rounded-lg border border-[#d8e8e0] text-gray-600 text-sm font-medium hover:border-[#40916c] hover:text-[#2d6a4f] transition-colors">
                  Cancel
                </button>
              )}
              <button type="submit"
                className="flex-1 btn-primary py-2.5 rounded-lg text-sm font-semibold cursor-pointer">
                {editingId ? 'Save Changes' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      )}
      </div>
    </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#d8e8e0] shadow-[0_-4px_20px_rgba(0,0,0,0.07)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => router.push('/cart')}
            className="w-full sm:w-auto py-3 px-5 rounded-xl border border-[#d8e8e0] text-gray-600 font-semibold text-sm hover:border-[#40916c] hover:text-[#2d6a4f] transition-colors"
          >
            &larr; Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full sm:flex-1 btn-primary py-3 px-4 rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Continue to Payment &rarr;
          </button>
        </div>
      </div>
    </>
  );
}

function FormField({ label, id, type = 'text', placeholder, value, onChange, onBlur, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={id}>
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        id={id} type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)} onBlur={onBlur}
        className={['w-full px-4 py-2.5 rounded-lg border text-sm transition-colors bg-white',
          error ? 'border-red-400 bg-red-50' : 'border-[#d8e8e0] hover:border-[#40916c]'].join(' ')}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertTriangle size={12} /> {error}
        </p>
      )}
    </div>
  );
}