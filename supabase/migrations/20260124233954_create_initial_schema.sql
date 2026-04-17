/*
  # Initial Schema for Congo Export Platform

  ## Overview
  Creates the core database structure for a used goods export platform from Europe to Congo-Brazzaville.

  ## New Tables
  
  1. **profiles**
     - `id` (uuid, primary key, references auth.users)
     - `name` (text) - User's full name
     - `phone` (text) - Phone number
     - `whatsapp_number` (text) - WhatsApp contact
     - `delivery_address` (text) - Delivery address in Brazzaville
     - `notification_prefs` (jsonb) - Notification preferences (WhatsApp/SMS)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)
  
  2. **products**
     - `id` (uuid, primary key)
     - `name` (text) - Product name
     - `description` (text) - Product description
     - `category` (text) - Product category
     - `purchase_price` (numeric) - Original purchase price
     - `sale_price` (numeric) - Selling price (auto-calculated)
     - `condition` (text) - Product condition
     - `image_url` (text) - Main product image
     - `images` (jsonb) - Additional images array
     - `stock_status` (text) - Available/sold/reserved
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)
  
  3. **cart_items**
     - `id` (uuid, primary key)
     - `user_id` (uuid, references auth.users)
     - `product_id` (uuid, references products)
     - `quantity` (integer)
     - `created_at` (timestamptz)
  
  4. **orders**
     - `id` (uuid, primary key)
     - `order_number` (text, unique) - Order reference number
     - `user_id` (uuid, references auth.users)
     - `items` (jsonb) - Order items array
     - `subtotal` (numeric) - Products total
     - `shipping_cost` (numeric) - Shipping cost
     - `total_amount` (numeric) - Total amount
     - `payment_option` (text) - full/deposit
     - `payment_status` (text) - pending/paid/partial
     - `order_status` (text) - pending/processing/shipped/delivered
     - `next_shipment_date` (date) - Next container shipment date
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can read their own profile
  - Users can update their own profile
  - Anyone can read products (public catalog)
  - Only authenticated users can manage their cart
  - Users can only see their own orders
  - Admin functions will be handled separately
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  whatsapp_number text,
  delivery_address text,
  notification_prefs jsonb DEFAULT '{"whatsapp": true, "sms": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  purchase_price numeric(10, 2) NOT NULL,
  sale_price numeric(10, 2) NOT NULL,
  condition text NOT NULL DEFAULT 'good',
  image_url text,
  images jsonb DEFAULT '[]'::jsonb,
  stock_status text DEFAULT 'available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items jsonb NOT NULL,
  subtotal numeric(10, 2) NOT NULL,
  shipping_cost numeric(10, 2) NOT NULL DEFAULT 0,
  total_amount numeric(10, 2) NOT NULL,
  payment_option text NOT NULL DEFAULT 'full',
  payment_status text NOT NULL DEFAULT 'pending',
  order_status text NOT NULL DEFAULT 'pending',
  next_shipment_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Products policies (public read, authenticated write for admin)
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Cart items policies
CREATE POLICY "Users can read own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products(stock_status);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();