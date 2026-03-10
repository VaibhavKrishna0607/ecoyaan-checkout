'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CheckoutContext = createContext(undefined);

const STORAGE_KEY = 'ecoyaan_checkout_v1';

function loadStorage() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function persistStorage(patch) {
  try {
    const current = loadStorage();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
  } catch {}
}

export function CheckoutProvider({ children }) {
  const [cartData, _setCartData] = useState(null);
  const [shippingAddress, _setShippingAddress] = useState(null);
  const [savedAddresses, _setSavedAddresses] = useState([]);
  const [orderPlaced, _setOrderPlaced] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStorage();
    if (stored.cartData) _setCartData(stored.cartData);
    if (stored.shippingAddress) _setShippingAddress(stored.shippingAddress);
    if (Array.isArray(stored.savedAddresses)) _setSavedAddresses(stored.savedAddresses);
    if (stored.orderPlaced) _setOrderPlaced(stored.orderPlaced);
    setHydrated(true);
  }, []);

  const setCartData = useCallback((data) => {
    _setCartData(data);
    persistStorage({ cartData: data });
  }, []);

  const setShippingAddress = useCallback((addr) => {
    _setShippingAddress(addr);
    persistStorage({ shippingAddress: addr });
  }, []);

  const setSavedAddresses = useCallback((addrs) => {
    _setSavedAddresses(addrs);
    persistStorage({ savedAddresses: addrs });
  }, []);

  const setOrderPlaced = useCallback((val) => {
    _setOrderPlaced(val);
    persistStorage({ orderPlaced: val });
  }, []);

  return (
    <CheckoutContext.Provider
      value={{
        cartData,
        setCartData,
        shippingAddress,
        setShippingAddress,
        savedAddresses,
        setSavedAddresses,
        orderPlaced,
        setOrderPlaced,
        hydrated,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error('useCheckout must be used inside CheckoutProvider');
  return ctx;
}
