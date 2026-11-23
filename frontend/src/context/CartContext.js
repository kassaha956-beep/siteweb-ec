'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('biyodo_cart');
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
      const storedCoupon = localStorage.getItem('biyodo_coupon');
      if (storedCoupon) {
        setAppliedCoupon(JSON.parse(storedCoupon));
      }
    } catch (e) {
      console.error('Error loading cart from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('biyodo_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      if (appliedCoupon) {
        localStorage.setItem('biyodo_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('biyodo_coupon');
      }
    }
  }, [appliedCoupon, isLoaded]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const effectivePrice = product.discount_price && parseFloat(product.discount_price) > 0
        ? parseFloat(product.discount_price)
        : parseFloat(product.price);

      const maxStock = product.stock_quantity !== undefined ? product.stock_quantity : 999;

      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, maxStock);
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        const initialQty = Math.min(quantity, maxStock);
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: effectivePrice,
            original_price: parseFloat(product.price),
            image_url: product.primary_image || (product.images && product.images[0]?.image_url) || '',
            category_name: product.category_name || '',
            quantity: initialQty,
            stock_quantity: maxStock,
          },
        ];
      }
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const maxStock = item.stock_quantity !== undefined ? item.stock_quantity : 999;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem('biyodo_cart');
    localStorage.removeItem('biyodo_coupon');
  };

  const applyCoupon = (coupon) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const couponDiscount = appliedCoupon
    ? appliedCoupon.discount_type === 'percentage'
      ? Math.round((cartSubtotal * appliedCoupon.discount_value) / 100)
      : Math.min(appliedCoupon.discount_value, cartSubtotal)
    : 0;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoaded,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        appliedCoupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
