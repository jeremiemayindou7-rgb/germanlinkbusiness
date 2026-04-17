/*
  # Add Containers and Admin Features

  ## Overview
  Extends the database with container management, customer notes, and order notes.

  ## New Tables
  
  1. **containers**
     - `id` (uuid, primary key)
     - `name` (text) - Container name (e.g., "Container Januar 2026")
     - `shipping_date` (date) - Planned shipping date
     - `max_capacity` (integer) - Maximum number of orders
     - `status` (text) - planning/shipped/arrived
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)
  
  2. **order_notes**
     - `id` (uuid, primary key)
     - `order_id` (uuid, references orders)
     - `note` (text)
     - `created_by` (uuid, references auth.users)
     - `created_at` (timestamptz)
  
  3. **customer_notes**
     - `id` (uuid, primary key)
     - `user_id` (uuid, references auth.users)
     - `note` (text)
     - `created_by` (uuid, references auth.users)
     - `created_at` (timestamptz)

  ## Modifications
  - Add `container_id` to orders table
  - Add `stock_quantity` to products table

  ## Security
  - Enable RLS on all new tables
  - Authenticated users can manage containers
  - Authenticated users can manage notes
*/

-- Create containers table
CREATE TABLE IF NOT EXISTS containers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  shipping_date date NOT NULL,
  max_capacity integer NOT NULL DEFAULT 50,
  status text NOT NULL DEFAULT 'planning',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_notes table
CREATE TABLE IF NOT EXISTS order_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create customer_notes table
CREATE TABLE IF NOT EXISTS customer_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Add container_id to orders if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'container_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN container_id uuid REFERENCES containers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add stock_quantity to products if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_quantity integer DEFAULT 1;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;

-- Containers policies
CREATE POLICY "Authenticated users can read containers"
  ON containers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create containers"
  ON containers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update containers"
  ON containers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete containers"
  ON containers FOR DELETE
  TO authenticated
  USING (true);

-- Order notes policies
CREATE POLICY "Authenticated users can read order notes"
  ON order_notes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create order notes"
  ON order_notes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Customer notes policies
CREATE POLICY "Authenticated users can read customer notes"
  ON customer_notes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create customer notes"
  ON customer_notes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_containers_status ON containers(status);
CREATE INDEX IF NOT EXISTS idx_containers_shipping_date ON containers(shipping_date);
CREATE INDEX IF NOT EXISTS idx_orders_container_id ON orders(container_id);
CREATE INDEX IF NOT EXISTS idx_order_notes_order_id ON order_notes(order_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_user_id ON customer_notes(user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_containers_updated_at
  BEFORE UPDATE ON containers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();