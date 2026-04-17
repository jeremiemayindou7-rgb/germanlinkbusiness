/*
  # Security Improvements and Performance Optimization

  1. Performance Improvements
    - Add missing indexes for all foreign keys to improve query performance
    - Optimize RLS policies by wrapping auth.uid() in SELECT subqueries

  2. Security Improvements
    - Restrict admin-only operations to users with is_admin flag
    - Fix overly permissive RLS policies (USING true)
    - Secure function search paths
    - Ensure proper access control for all tables

  3. Changes by Table
    - `cart_items`: Add index on product_id, optimize RLS policies
    - `customer_notes`: Add index on created_by, restrict to admin only
    - `notifications`: Add index on order_id, optimize RLS policies
    - `order_notes`: Add index on created_by, restrict to admin only
    - `product_chats`: Add index on user_id, optimize RLS policies
    - `reviews`: Add index on order_id, optimize RLS policies
    - `profiles`: Optimize RLS policies
    - `orders`: Optimize RLS policies
    - `products`: Restrict management to admin only
    - `containers`: Restrict to admin only
    - `admin_settings`: Restrict to admin only
    - `functions`: Fix search path security
*/

-- Add missing indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_created_by ON public.customer_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON public.notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_order_notes_created_by ON public.order_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_product_chats_user_id ON public.product_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON public.reviews(order_id);

-- Fix function search paths for security
ALTER FUNCTION public.update_updated_at_column() SET search_path = pg_catalog, public;
ALTER FUNCTION public.set_admin_by_email(text) SET search_path = pg_catalog, public;
ALTER FUNCTION public.handle_new_user_auto_admin() SET search_path = pg_catalog, public;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$;

-- Drop and recreate optimized RLS policies for profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- Drop and recreate optimized RLS policies for cart_items
DROP POLICY IF EXISTS "Users can read own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON public.cart_items;

CREATE POLICY "Users can read own cart items"
  ON public.cart_items FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own cart items"
  ON public.cart_items FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own cart items"
  ON public.cart_items FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own cart items"
  ON public.cart_items FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Drop and recreate optimized RLS policies for orders
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can read all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;

CREATE POLICY "Users can read own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can read all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Drop and recreate optimized RLS policies for reviews
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;

CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Drop and recreate optimized RLS policies for product_chats
DROP POLICY IF EXISTS "Users can read own chats" ON public.product_chats;
DROP POLICY IF EXISTS "Users can create own chats" ON public.product_chats;
DROP POLICY IF EXISTS "Users can update own chats" ON public.product_chats;
DROP POLICY IF EXISTS "Admins can read all chats" ON public.product_chats;

CREATE POLICY "Users can read own chats"
  ON public.product_chats FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own chats"
  ON public.product_chats FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own chats"
  ON public.product_chats FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can read all chats"
  ON public.product_chats FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Drop and recreate optimized RLS policies for notifications
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Restrict products to admin-only management
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Restrict containers to admin-only
DROP POLICY IF EXISTS "Authenticated users can read containers" ON public.containers;
DROP POLICY IF EXISTS "Authenticated users can create containers" ON public.containers;
DROP POLICY IF EXISTS "Authenticated users can update containers" ON public.containers;
DROP POLICY IF EXISTS "Authenticated users can delete containers" ON public.containers;

CREATE POLICY "Admins can read containers"
  ON public.containers FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can create containers"
  ON public.containers FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update containers"
  ON public.containers FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete containers"
  ON public.containers FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Restrict order_notes to admin-only
DROP POLICY IF EXISTS "Authenticated users can read order notes" ON public.order_notes;
DROP POLICY IF EXISTS "Authenticated users can create order notes" ON public.order_notes;

CREATE POLICY "Admins can read order notes"
  ON public.order_notes FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can create order notes"
  ON public.order_notes FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Restrict customer_notes to admin-only
DROP POLICY IF EXISTS "Authenticated users can read customer notes" ON public.customer_notes;
DROP POLICY IF EXISTS "Authenticated users can create customer notes" ON public.customer_notes;

CREATE POLICY "Admins can read customer notes"
  ON public.customer_notes FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can create customer notes"
  ON public.customer_notes FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Restrict admin_settings to admin-only
DROP POLICY IF EXISTS "Authenticated users can read settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Authenticated users can manage settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Authenticated users can update settings" ON public.admin_settings;

CREATE POLICY "Admins can read settings"
  ON public.admin_settings FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can manage settings"
  ON public.admin_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update settings"
  ON public.admin_settings FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());