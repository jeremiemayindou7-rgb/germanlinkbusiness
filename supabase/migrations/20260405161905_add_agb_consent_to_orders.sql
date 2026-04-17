/*
  # Add AGB Consent Tracking to Orders

  1. Changes to orders table
    - Add `agb_accepted` (boolean, required, default false)
      - Tracks whether customer accepted terms & conditions
    - Add `agb_accepted_at` (timestamptz, nullable)
      - Records exact timestamp when AGB was accepted
  
  2. Purpose
    - Legal compliance: document explicit consent to terms
    - Audit trail: track when consent was given
    - Required for all new orders going forward
  
  3. Notes
    - Existing orders will have agb_accepted = false (historical orders)
    - New orders must set agb_accepted = true via checkout UI
    - Timestamp captures consent moment for legal documentation
*/

-- Add AGB consent tracking columns to orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS agb_accepted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS agb_accepted_at TIMESTAMPTZ;