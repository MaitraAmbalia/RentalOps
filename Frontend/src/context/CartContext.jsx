import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('rentalops_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('rentalops_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('rentalops_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('rentalops_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product, qty = 1, variant = null, start = null, end = null) => {
    setCart(prev => {
      // Find duplicate product + variant combo
      const matchIndex = prev.findIndex(item => 
        item.product.id === product.id && 
        JSON.stringify(item.variant) === JSON.stringify(variant)
      );

      // Default dates to today & tomorrow if not specified
      const defaultStart = start || new Date().toISOString().split('T')[0];
      const defaultEnd = end || new Date(Date.now() + 86400000).toISOString().split('T')[0];

      if (matchIndex > -1) {
        const updated = [...prev];
        updated[matchIndex].qty += qty;
        return updated;
      } else {
        return [...prev, { product, qty, variant, rentalStartDate: defaultStart, scheduledReturnDate: defaultEnd }];
      }
    });
  };

  const removeFromCart = (productId, variant = null) => {
    setCart(prev => prev.filter(item => 
      !(item.product.id === productId && JSON.stringify(item.variant) === JSON.stringify(variant))
    ));
  };

  const updateCartItemQty = (productId, qty, variant = null) => {
    if (qty <= 0) {
      removeFromCart(productId, variant);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.product.id === productId && JSON.stringify(item.variant) === JSON.stringify(variant)) {
        return { ...item, qty };
      }
      return item;
    }));
  };

  const updateCartItemDates = (productId, start, end, variant = null) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId && JSON.stringify(item.variant) === JSON.stringify(variant)) {
        return { ...item, rentalStartDate: start, scheduledReturnDate: end };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const addToWishlist = (product) => {
    setWishlist(prev => {
      if (prev.some(item => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
  };

  const isWishlisted = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  return (
    <CartContext.Provider value={{
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      updateCartItemQty,
      updateCartItemDates,
      clearCart,
      addToWishlist,
      removeFromWishlist,
      isWishlisted
    }}>
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
