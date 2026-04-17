/*
  # Fix Security and Performance Issues

  ## Changes Made
  
  1. **Performance Optimizations**
     - Add missing index on `chat_feedback.user_id` foreign key
     - Optimize RLS policy for `chat_feedback` to use subquery pattern
     - Remove unused indexes to reduce maintenance overhead
  
  2. **Security Fixes**
     - Fix overly permissive RLS policy on `chat_feedback` INSERT
     - Consolidate multiple permissive policies into single policies with OR conditions
     - Restrict chat_feedback INSERT to authenticated users only
  
  3. **Index Cleanup**
     - Drop unused indexes that are not being utilized by queries
     - Keep only indexes that improve actual query performance
  
  ## Security Impact
  - Closes unrestricted access vulnerability on chat_feedback
  - Improves RLS policy performance at scale
  - Simplifies policy evaluation logic
*/

-- 1. Add missing index for chat_feedback foreign key
CREATE INDEX IF NOT EXISTS idx_chat_feedback_user_id ON chat_feedback(user_id);

-- 2. Drop and recreate chat_feedback policies with optimized patterns
DROP POLICY IF EXISTS "Users can view own feedback" ON chat_feedback;
DROP POLICY IF EXISTS "Anyone can insert chat feedback" ON chat_feedback;

-- Optimized SELECT policy using subquery pattern
CREATE POLICY "Users can view own feedback"
  ON chat_feedback FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Restricted INSERT policy - only authenticated users
CREATE POLICY "Authenticated users can insert feedback"
  ON chat_feedback FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- 3. Consolidate multiple permissive policies on orders table
DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

-- Single consolidated SELECT policy
CREATE POLICY "Users and admins can read orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

-- Single consolidated UPDATE policy
CREATE POLICY "Users and admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

-- 4. Consolidate multiple permissive policies on product_chats table
DROP POLICY IF EXISTS "Admins can read all chats" ON product_chats;
DROP POLICY IF EXISTS "Users can read own chats" ON product_chats;

CREATE POLICY "Users and admins can read chats"
  ON product_chats FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

-- 5. Drop unused indexes to reduce maintenance overhead
DROP INDEX IF EXISTS idx_products_category;
DROP INDEX IF EXISTS idx_orders_order_number;
DROP INDEX IF EXISTS idx_reviews_user_id;
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_is_read;
DROP INDEX IF EXISTS idx_order_notes_order_id;
DROP INDEX IF EXISTS idx_customer_notes_user_id;
DROP INDEX IF EXISTS idx_profiles_is_admin;
DROP INDEX IF EXISTS idx_customer_notes_created_by;
DROP INDEX IF EXISTS idx_notifications_order_id;
DROP INDEX IF EXISTS idx_order_notes_created_by;
DROP INDEX IF EXISTS idx_product_chats_user_id;
DROP INDEX IF EXISTS idx_reviews_order_id;
DROP INDEX IF EXISTS idx_products_name_translations;
DROP INDEX IF EXISTS idx_products_category_translations;
