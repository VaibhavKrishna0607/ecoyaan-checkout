'use client';

import React, { createContext, useContext, useState } from 'react';

const CheckoutContext = createContext(undefined);

export function CheckoutProvider({ children }) {
  const [cartData, setCartData] = useState(null);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  return (
    <CheckoutContext.Provider
      value={{
        cartData,
        setCartData,
        shippingAddress,
        setShippingAddress,
        orderPlaced,
        setOrderPlaced,
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
