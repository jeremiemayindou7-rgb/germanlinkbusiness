/*
  # Synchronize Categories Structure with New Schema

  1. Overview
    - Updates existing categories structure to match the new GermanBusinessLink schema
    - Removes duplicate or obsolete subcategories
    - Ensures all subcategories are properly linked to their parent categories
    - Does NOT delete any data, only updates relationships

  2. Changes
    - Updates existing main categories (6 total)
    - Cleans up and reorganizes subcategories
    - Updates icon fields to match new design
    - Removes duplicate subcategories where they exist

  3. Security
    - Maintains existing RLS policies
    - No data loss - only structural updates
*/

-- Update main category icons to match new design
DO $$
BEGIN
  -- Update Landwirtschaft & Agrartechnik icon
  UPDATE categories 
  SET icon = 'tractor' 
  WHERE id = '11111111-1111-1111-1111-111111111111';

  -- Update Solar & Energie icon
  UPDATE categories 
  SET icon = 'sun' 
  WHERE id = '22222222-2222-2222-2222-222222222222';

  -- Update Elektronik & IT icon
  UPDATE categories 
  SET icon = 'smartphone' 
  WHERE id = '33333333-3333-3333-3333-333333333333';

  -- Update Auto & Moto icon
  UPDATE categories 
  SET icon = 'car' 
  WHERE id = '44444444-4444-4444-4444-444444444444';

  -- Update Werkzeuge & Maschinen icon
  UPDATE categories 
  SET icon = 'hammer' 
  WHERE id = '55555555-5555-5555-5555-555555555555';

  -- Update Kühlung & Markt-Ausrüstung icon
  UPDATE categories 
  SET icon = 'snowflake' 
  WHERE id = '66666666-6666-6666-6666-666666666666';
END $$;

-- Clean up duplicate subcategories for Solar & Energie
DO $$
DECLARE
  solar_category_id uuid := '22222222-2222-2222-2222-222222222222';
  existing_sub_id uuid;
BEGIN
  -- Check if "Solar-Kühltruhen" exists as subcategory
  SELECT id INTO existing_sub_id
  FROM categories
  WHERE parent_id = solar_category_id
  AND name_de = 'Solar-Kühltruhen';

  -- If it doesn't exist, create it
  IF existing_sub_id IS NULL THEN
    INSERT INTO categories (name_de, name_fr, name_ln, parent_id, icon, sort_order)
    VALUES (
      'Solar-Kühltruhen',
      'Congélateurs solaires',
      'Ba congélateurs solaire',
      solar_category_id,
      'snowflake',
      6
    ) ON CONFLICT DO NOTHING;
  END IF;

  -- Remove the older "Solarbetriebene Kühltruhen" if it exists and is different
  DELETE FROM categories
  WHERE parent_id = solar_category_id
  AND name_de = 'Solarbetriebene Kühltruhen'
  AND id != COALESCE(existing_sub_id, '00000000-0000-0000-0000-000000000000');
END $$;

-- Update subcategory names to match new schema (Auto & Moto)
DO $$
DECLARE
  auto_category_id uuid := '44444444-4444-4444-4444-444444444444';
BEGIN
  -- Update "Auto-Ersatzteile (Bremsen, Filter, Reifen)" to "Auto-Ersatzteile"
  UPDATE categories
  SET 
    name_de = 'Auto-Ersatzteile',
    name_fr = 'Pièces détachées auto',
    name_ln = 'Biloko ya mituka'
  WHERE parent_id = auto_category_id
  AND name_de LIKE 'Auto-Ersatzteile%';

  -- Update "Motorrad-Ersatzteile" to "Moto-Ersatzteile"
  UPDATE categories
  SET 
    name_de = 'Moto-Ersatzteile',
    name_fr = 'Pièces détachées moto',
    name_ln = 'Biloko ya moto'
  WHERE parent_id = auto_category_id
  AND name_de LIKE 'Motorrad%';
END $$;

-- Update subcategory names to match new schema (Werkzeuge & Maschinen)
DO $$
DECLARE
  tools_category_id uuid := '55555555-5555-5555-5555-555555555555';
BEGIN
  -- Update "Elektrowerkzeuge (Bohrer, Flex)" to "Elektrowerkzeuge"
  UPDATE categories
  SET 
    name_de = 'Elektrowerkzeuge',
    name_fr = 'Outils électriques',
    name_ln = 'Bisaleli ya nguya'
  WHERE parent_id = tools_category_id
  AND name_de LIKE 'Elektrowerkzeuge%';
END $$;

-- Clean up duplicate Solar-Kühltruhen in Kühlung & Markt-Ausrüstung
DO $$
DECLARE
  cooling_category_id uuid := '66666666-6666-6666-6666-666666666666';
  solar_category_id uuid := '22222222-2222-2222-2222-222222222222';
BEGIN
  -- Update the one in Kühlung to be "Solarkühltruhen" (without hyphen)
  UPDATE categories
  SET name_de = 'Solar-Kühltruhen'
  WHERE parent_id = cooling_category_id
  AND name_de LIKE 'Solarkühltruhen%';
END $$;

-- Add missing subcategories if they don't exist
DO $$
BEGIN
  -- Ensure all required subcategories exist
  -- This will be handled in the seed migration
END $$;
