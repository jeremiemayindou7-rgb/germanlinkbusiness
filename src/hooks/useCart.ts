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
      console.log('[useCart] Fetching cart for user:', user.id);

      const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select('id, product_id, quantity')
        .eq('user_id', user.id);

      if (cartError) {
        console.error('[useCart] Cart fetch error:', cartError);
        throw cartError;
      }

      console.log('[useCart] Cart items:', cartData);

      if (!cartData || cartData.length === 0) {
        setCartItems([]);
        return;
      }

      const productIds = cartData.map(item => item.product_id);
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, sale_price, image_url, stock_status')
        .in('id', productIds);

      if (productsError) {
        console.error('[useCart] Products fetch error:', productsError);
      }

      const productsMap = new Map(
        (productsData || []).map(p => [p.id, p])
      );

      const enrichedCart = cartData.map(item => ({
        ...item,
        product: productsMap.get(item.product_id)
      }));

      console.log('[useCart] Enriched cart:', enrichedCart);
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
      console.log('[useCart] Adding to cart:', { userId: user.id, productId });

      const existingItem = cartItems.find(item => item.product_id === productId);

      if (existingItem) {
        console.log('[useCart] Updating existing item:', existingItem);
        const { error, data } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id)
          .select();

        if (error) {
          console.error('[useCart] Update error:', error);
          throw error;
        }
        console.log('[useCart] Update success:', data);
      } else {
        console.log('[useCart] Inserting new item');
        const { error, data } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: 1,
          })
          .select();

        if (error) {
          console.error('[useCart] Insert error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
        console.log('[useCart] Insert success:', data);
      }

      await fetchCart();
    } catch (error: any) {
      console.error('[useCart] Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchCart();
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
