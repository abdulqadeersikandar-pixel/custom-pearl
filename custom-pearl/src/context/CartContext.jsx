import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('customPearlCart') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('customPearlCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.Id === product.Id);
      if (existing) return prev.map(i => i.Id === product.Id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id)        => setCartItems(prev => prev.filter(i => i.Id !== id));
  const updateQty      = (id, qty)   => { if (qty < 1) return; setCartItems(prev => prev.map(i => i.Id === id ? { ...i, qty } : i)); };
  const clearCart      = ()          => setCartItems([]);
  const getCartTotal   = ()          => cartItems.reduce((t, i) => t + Number(i.Price) * i.qty, 0);
  const getCartCount   = ()          => cartItems.reduce((t, i) => t + i.qty, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, getCartTotal, getCartCount }}>
      {children}
    </CartContext.Provider>
  );
};
