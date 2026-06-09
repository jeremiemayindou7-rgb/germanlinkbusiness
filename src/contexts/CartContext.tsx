import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    sale_price: number;
    image_url: string;
    stock_status: string;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  cartCount: number;
  cartTotal: number;
  addToCart: (productId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!user) { setCartItems([]); setLoading(false); return; }
    try {
      const { data: cartData, error } = await supabase
        .from('cart_items').select('id, product_id, quantity').eq('user_id', user.id);
      if (error) throw error;
      if (!cartData || cartData.length === 0) { setCartItems([]); return; }

      const productIds = cartData.map(i => i.product_id);
      const { data: productsData } = await supabase
        .from('products').select('id, name, sale_price, image_url, stock_status').in('id', productIds);

      const productsMap = new Map((productsData || []).map(p => [p.id, p]));
      setCartItems(cartData.map(item => ({ ...item, product: productsMap.get(item.product_id) })) as any);
    } catch (error) {
      console.error('Cart error:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (productId: string) => {
    if (!user) return;
    const existing = cartItems.find(i => i.product_id === productId);
    if (existing) {
      await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({ user_id: user.id, product_id: productId, quantity: 1 });
    }
    await fetchCart();
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    await fetchCart();
  };

  const removeFromCart = async (itemId: string) => {
    await supabase.from('cart_items').delete().eq('id', itemId);
    await fetchCart();
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    await fetchCart();
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + (i.product?.sale_price || 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, loading, cartCount, cartTotal, addToCart, updateQuantity, removeFromCart, clearCart, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
};