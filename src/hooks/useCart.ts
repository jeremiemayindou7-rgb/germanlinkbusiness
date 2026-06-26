import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

export const useCart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select('id, product_id, quantity')
        .eq('user_id', user.id);

      if (cartError) throw cartError;

      if (!cartData || cartData.length === 0) {
        setCartItems([]);
        return;
      }

      const productIds = cartData.map(item => item.product_id);
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, sale_price, image_url, stock_status')
        .in('id', productIds);

      const productsMap = new Map(
        (productsData || []).map(p => [p.id, p])
      );

      const enrichedCart = cartData.map(item => ({
        ...item,
        product: productsMap.get(item.product_id),
      }));

      setCartItems(enrichedCart as any);
    } catch (error) {
      console.error('[useCart] Error fetching cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId: string) => {
    if (!user) {
      alert('Veuillez vous connecter pour ajouter au panier');
      return;
    }

    try {
      const existingItem = cartItems.find(item => item.product_id === productId);

      if (existingItem) {
        // ── Optimistisches Update: sofort lokal erhöhen ──
        setCartItems(prev =>
          prev.map(item =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );

        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (error) {
          await fetchCart(); // Rollback bei Fehler
          throw error;
        }

      } else {
        // Produkt-Daten holen für korrektes lokales Objekt
        const { data: productData } = await supabase
          .from('products')
          .select('id, name, sale_price, image_url, stock_status')
          .eq('id', productId)
          .maybeSingle();

        // ── Optimistisches Update: sofort lokal einfügen ──
        const tempId = `temp-${Date.now()}`;
        const tempItem: CartItem = {
          id: tempId,
          product_id: productId,
          quantity: 1,
          product: productData || {
            id: productId, name: '', sale_price: 0, image_url: '', stock_status: '',
          },
        };
        setCartItems(prev => [...prev, tempItem]);

        const { error, data } = await supabase
          .from('cart_items')
          .insert({ user_id: user.id, product_id: productId, quantity: 1 })
          .select();

        if (error) {
          // Rollback bei Fehler
          setCartItems(prev => prev.filter(i => i.id !== tempId));
          throw error;
        }

        // Echte ID vom Server übernehmen
        if (data?.[0]) {
          setCartItems(prev =>
            prev.map(i => i.id === tempId ? { ...i, id: data[0].id } : i)
          );
        }
      }
    } catch (error: any) {
      console.error('[useCart] Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    // Optimistisch
    setCartItems(prev =>
      prev.map(i => i.id === itemId ? { ...i, quantity } : i)
    );
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);
      if (error) { await fetchCart(); throw error; }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeFromCart = async (itemId: string) => {
    // Optimistisch
    setCartItems(prev => prev.filter(i => i.id !== itemId));
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
      if (error) { await fetchCart(); throw error; }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    setCartItems([]);
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
      if (error) { await fetchCart(); throw error; }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.sale_price || 0) * item.quantity,
    0
  );

  return {
    cartItems,
    loading,
    cartCount,
    cartTotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart,
  };
};

