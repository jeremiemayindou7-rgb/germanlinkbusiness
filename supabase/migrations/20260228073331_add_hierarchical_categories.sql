/*
  # Hierarchical Category System

  1. Changes
    - Create `categories` table for hierarchical category structure
    - Add main categories and subcategories
    - Add category icons mapping
    - Update products table to reference categories

  2. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name_de` (text, German name)
      - `name_fr` (text, French name)
      - `name_ln` (text, Lingala name)
      - `parent_id` (uuid, nullable, references categories)
      - `icon` (text, icon identifier)
      - `sort_order` (integer)
      - `created_at` (timestamp)

  3. Security
    - Enable RLS on `categories` table
    - Add policy for public read access
    - Add policy for admin write access
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_de text NOT NULL,
  name_fr text NOT NULL,
  name_ln text NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  icon text NOT NULL DEFAULT 'package',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public can read categories
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO public
  USING (true);

-- Only admins can modify categories
CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Insert main categories
INSERT INTO categories (id, name_de, name_fr, name_ln, parent_id, icon, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Landwirtschaft & Agrartechnik', 'Agriculture & Agrotechnique', 'Bilanga & Masini ya bilanga', NULL, 'tractor', 10),
  ('22222222-2222-2222-2222-222222222222', 'Solar & Energie', 'Solaire & Énergie', 'Solar & Nguya', NULL, 'solar_power', 20),
  ('33333333-3333-3333-3333-333333333333', 'Elektronik & IT', 'Électronique & IT', 'Biloko ya elektroniki & IT', NULL, 'laptop', 30),
  ('44444444-4444-4444-4444-444444444444', 'Auto & Moto', 'Auto & Moto', 'Mituka & Moto', NULL, 'car', 40),
  ('55555555-5555-5555-5555-555555555555', 'Werkzeuge & Maschinen', 'Outils & Machines', 'Bisaleli & Masini', NULL, 'wrench', 50),
  ('66666666-6666-6666-6666-666666666666', 'Kühlung & Markt-Ausrüstung', 'Réfrigération & Équipement de marché', 'Kongolisaka & Biloko ya zando', NULL, 'snowflake', 60)
ON CONFLICT (id) DO NOTHING;

-- Insert subcategories for Landwirtschaft & Agrartechnik
INSERT INTO categories (name_de, name_fr, name_ln, parent_id, icon, sort_order) VALUES
  ('Landwirtschaftsmaschinen', 'Machines agricoles', 'Masini ya bilanga', '11111111-1111-1111-1111-111111111111', 'tractor', 11),
  ('Lebensmittelverarbeitungsgeräte', 'Équipements de transformation alimentaire', 'Masini ya kobongisa bilei', '11111111-1111-1111-1111-111111111111', 'package', 12)
ON CONFLICT DO NOTHING;

-- Insert subcategories for Solar & Energie
INSERT INTO categories (name_de, name_fr, name_ln, parent_id, icon, sort_order) VALUES
  ('Solarpanels', 'Panneaux solaires', 'Ba panels solaire', '22222222-2222-2222-2222-222222222222', 'solar_power', 21),
  ('Solarsysteme & Installation', 'Systèmes solaires & Installation', 'Ba systèmes solaire & Installation', '22222222-2222-2222-2222-222222222222', 'solar_power', 22),
  ('Mini-Grids', 'Mini-réseaux', 'Mini-réseaux', '22222222-2222-2222-2222-222222222222', 'zap', 23),
  ('Solarlampen & Powerbanks', 'Lampes solaires & Powerbanks', 'Ba lampes solaire & Powerbanks', '22222222-2222-2222-2222-222222222222', 'lightbulb', 24),
  ('Off-Grid-Lösungen', 'Solutions hors réseau', 'Ba solutions hors réseau', '22222222-2222-2222-2222-222222222222', 'battery', 25),
  ('Solarbetriebene Kühltruhen', 'Congélateurs solaires', 'Ba congélateurs solaire', '22222222-2222-2222-2222-222222222222', 'snowflake', 26),
  ('Generatoren', 'Générateurs', 'Ba générateurs', '22222222-2222-2222-2222-222222222222', 'zap', 27)
ON CONFLICT DO NOTHING;

-- Insert subcategories for Elektronik & IT
INSERT INTO categories (name_de, name_fr, name_ln, parent_id, icon, sort_order) VALUES
  ('Gebrauchte Smartphones', 'Smartphones d''occasion', 'Ba smartphones ya kala', '33333333-3333-3333-3333-333333333333', 'smartphone', 31),
  ('Gebrauchte Laptops', 'Ordinateurs portables d''occasion', 'Ba laptops ya kala', '33333333-3333-3333-3333-333333333333', 'laptop', 32),
  ('Gebrauchte Tablets', 'Tablettes d''occasion', 'Ba tablets ya kala', '33333333-3333-3333-3333-333333333333', 'tablet', 33),
  ('Zubehör', 'Accessoires', 'Biloko ya kobakisa', '33333333-3333-3333-3333-333333333333', 'package', 34)
ON CONFLICT DO NOTHING;

-- Insert subcategories for Auto & Moto
INSERT INTO categories (name_de, name_fr, name_ln, parent_id, icon, sort_order) VALUES
  ('Auto-Ersatzteile (Bremsen, Filter, Reifen)', 'Pièces détachées auto (Freins, Filtres, Pneus)', 'Biloko ya mituka (Ba freins, ba filtres, ba pneus)', '44444444-4444-4444-4444-444444444444', 'settings', 41),
  ('Motorrad-Ersatzteile', 'Pièces détachées moto', 'Biloko ya moto', '44444444-4444-4444-4444-444444444444', 'bike', 42),
  ('Werkstatt-Werkzeuge', 'Outils d''atelier', 'Bisaleli ya atelier', '44444444-4444-4444-4444-444444444444', 'wrench', 43),
  ('Verbrauchsmaterialien', 'Consommables', 'Biloko ya kosalela', '44444444-4444-4444-4444-444444444444', 'package', 44)
ON CONFLICT DO NOTHING;

-- Insert subcategories for Werkzeuge & Maschinen
INSERT INTO categories (name_de, name_fr, name_ln, parent_id, icon, sort_order) VALUES
  ('Elektrowerkzeuge (Bohrer, Flex)', 'Outils électriques (Perceuse, Meuleuse)', 'Bisaleli ya nguya (Perceuse, Meuleuse)', '55555555-5555-5555-5555-555555555555', 'zap', 51),
  ('Industriemaschinen', 'Machines industrielles', 'Masini ya industriel', '55555555-5555-5555-5555-555555555555', 'cog', 52),
  ('Handwerkzeuge', 'Outils à main', 'Bisaleli ya maboko', '55555555-5555-5555-5555-555555555555', 'wrench', 53)
ON CONFLICT DO NOTHING;

-- Insert subcategories for Kühlung & Markt-Ausrüstung
INSERT INTO categories (name_de, name_fr, name_ln, parent_id, icon, sort_order) VALUES
  ('Solarkühltruhen', 'Congélateurs solaires', 'Ba congélateurs solaire', '66666666-6666-6666-6666-666666666666', 'snowflake', 61),
  ('Gewerbekühlungen', 'Réfrigération commerciale', 'Kongolisaka ya commerce', '66666666-6666-6666-6666-666666666666', 'snowflake', 62)
ON CONFLICT DO NOTHING;

-- Add category_id column to products table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE products ADD COLUMN category_id uuid REFERENCES categories(id);
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
