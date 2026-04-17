/*
  # Add Product Translation Columns

  ## Overview
  Adds multilingual support for product names, descriptions, and categories.
  Supports German (de), French (fr), and Lingala (ln).

  ## Changes
  1. New Columns Added to products table:
     - `name_de` (text) - German product name
     - `name_fr` (text) - French product name
     - `name_ln` (text) - Lingala product name
     - `description_de` (text) - German product description
     - `description_fr` (text) - French product description
     - `description_ln` (text) - Lingala product description
     - `category_de` (text) - German category name
     - `category_fr` (text) - French category name
     - `category_ln` (text) - Lingala category name

  ## Translation Strategy
  - Original `name` and `description` columns remain as German fallback
  - Translation columns are nullable - if empty, system falls back to German
  - Translations can be filled via:
    1. Admin panel manual entry
    2. Auto-translation API (LibreTranslate for DE→FR)
    3. Manual review for Lingala (most accurate)

  ## Notes
  - Existing products will have NULL translations until filled
  - Frontend will use fallback chain: translated → German → original
  - Lingala auto-translation not available - requires manual input
*/

-- Add translation columns for product names
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS name_de TEXT,
  ADD COLUMN IF NOT EXISTS name_fr TEXT,
  ADD COLUMN IF NOT EXISTS name_ln TEXT;

-- Add translation columns for descriptions
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS description_de TEXT,
  ADD COLUMN IF NOT EXISTS description_fr TEXT,
  ADD COLUMN IF NOT EXISTS description_ln TEXT;

-- Add translation columns for categories
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category_de TEXT,
  ADD COLUMN IF NOT EXISTS category_fr TEXT,
  ADD COLUMN IF NOT EXISTS category_ln TEXT;

-- Create index for faster multilingual product searches
CREATE INDEX IF NOT EXISTS idx_products_name_translations ON products(name_de, name_fr, name_ln);
CREATE INDEX IF NOT EXISTS idx_products_category_translations ON products(category_de, category_fr, category_ln);
