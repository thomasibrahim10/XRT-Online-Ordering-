import React, { createContext, useContext, useState, useMemo } from 'react';
import Toast from '../Component/UI/Toast';

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {

  const [cartItems, setCartItems] = useState([]);
  const [orderType, setOrderType] = useState(null); // 'pickup' or 'delivery'
  const [deliveryDetails, setDeliveryDetails] = useState(null); // { firstName, lastName, address }
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  // Reset orderType when cart becomes empty
  React.useEffect(() => {
    if (cartItems.length === 0) {
      setOrderType(null);
    }
  }, [cartItems]);

  const showToast = (message) => {
    setToast({ show: true, message });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      // Helper to generate a unique signature for the item options
      const getSignature = (item) => {
         const sortModifiers = (mods) => {
            if (!mods) return {};
            return Object.keys(mods).sort().reduce((acc, key) => {
               const value = mods[key];
               if (Array.isArray(value)) {
                  acc[key] = [...value].sort();
               } else if (typeof value === 'object' && value !== null) {
                   acc[key] = Object.keys(value).sort().reduce((subAcc, subKey) => {
                       subAcc[subKey] = value[subKey];
                       return subAcc;
                   }, {});
               } else {
                  acc[key] = value;
               }
               return acc;
            }, {});
         };

         return JSON.stringify({
           id: item.id,
           size: item.size || null,
           modifiers: sortModifiers(item.modifiers)
         });
      };

      const incomingSig = getSignature(product);
      const existingIndex = prev.findIndex(item => getSignature(item) === incomingSig);

      if (existingIndex >= 0) {
        // Update quantity if exact item exists
        const newCart = [...prev];
        newCart[existingIndex] = {
           ...newCart[existingIndex],
           qty: newCart[existingIndex].qty + quantity
        };
        return newCart;
      }
      
      // Add new item
      return [...prev, { ...product, qty: quantity }];
    });
    showToast("Added to cart");
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.qty, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const p = item.price;
      const price = typeof p === 'string' ? parseFloat(p.replace(/[^\d.]/g, '')) : parseFloat(p);
      return acc + (price * item.qty);
    }, 0);
  }, [cartItems]);

  const updateQuantity = (id, delta) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.id === id) {
          return { ...item, qty: item.qty + delta };
        }
        return item;
      }).filter(item => item.qty > 0);
    });
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    cartCount,
    cartTotal,
    orderType,
    setOrderType,
    deliveryDetails,
    setDeliveryDetails,
    showDeliveryModal,
    setShowDeliveryModal
  };

  return (
    <CartContext.Provider value={value}>
      <Toast 
        message={toast.message} 
        isVisible={toast.show} 
        onClose={hideToast} 
      />
      {children}
    </CartContext.Provider>
  );
}
