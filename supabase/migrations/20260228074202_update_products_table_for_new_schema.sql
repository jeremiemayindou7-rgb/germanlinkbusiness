/*
  # Update Products Table for New Schema

  1. Overview
    - Adds subcategory_id column to products table
    - Adds location column for Kinshasa/Brazzaville
    - Adds title column (alias for name)
    - Ensures all fields match the new schema requirements

  2. Changes
    - Add subcategory_id column with foreign key to categories
    - Add location column with default value
    - Add title column as alias for name
    - Update indexes for performance

  3. Security
    - Maintains existing RLS policies
    - No data loss
*/

-- Add subcategory_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'subcategory_id'
  ) THEN
    ALTER TABLE products ADD COLUMN subcategory_id uuid REFERENCES categories(id);
  END IF;
END $$;

-- Add location column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'location'
  ) THEN
    ALTER TABLE products ADD COLUMN location text DEFAULT 'Kinshasa / Brazzaville';
  END IF;
END $$;

-- Add title column if it doesn't exist (as alias for name)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'title'
  ) THEN
    ALTER TABLE products ADD COLUMN title text;
  END IF;
END $$;

-- Update existing products to have title = name if title is null
UPDATE products
SET title = name
WHERE title IS NULL;

-- Update existing products to have location if null
UPDATE products
SET location = 'Kinshasa / Brazzaville'
WHERE location IS NULL;

-- Add index for subcategory_id for better query performance
CREATE INDEX IF NOT EXISTS idx_products_subcategory_id ON products(subcategory_id);

-- Add index for location for filtering
CREATE INDEX IF NOT EXISTS idx_products_location ON products(location);

-- Add comment to subcategory_id column
COMMENT ON COLUMN products.subcategory_id IS 'Reference to the subcategory of the product';
COMMENT ON COLUMN products.location IS 'Product location: Kinshasa or Brazzaville';
COMMENT ON COLUMN products.title IS 'Product title (alias for name field)';
