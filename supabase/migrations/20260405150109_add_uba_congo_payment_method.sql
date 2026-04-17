/*
  # Add UBA Congo Payment Method Support

  ## Changes
  
  1. New Columns in orders table
    - `payment_method` (text) - Either 'lemfi' or 'uba_congo', defaults to 'lemfi'
    - `customer_phone` (text) - Required for uba_congo orders, optional for lemfi
  
  2. Constraints
    - payment_method must be one of: 'lemfi' or 'uba_congo'
    - All existing orders default to 'lemfi' automatically
  
  ## Notes
  - No breaking changes to existing data
  - Existing LemFi flow remains completely unchanged
  - customer_phone validation enforced at application level
*/

-- Add payment_method column with default 'lemfi'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders 
      ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'lemfi'
        CHECK (payment_method IN ('lemfi', 'uba_congo'));
  END IF;
END $$;

-- Add customer_phone column (nullable, required at app level for uba_congo)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_phone'
  ) THEN
    ALTER TABLE orders 
      ADD COLUMN customer_phone TEXT;
  END IF;
END $$;

-- Create index for filtering by payment_method
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);