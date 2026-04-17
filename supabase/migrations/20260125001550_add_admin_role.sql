/*
  # Add Admin Role Support

  ## Overview
  Adds admin role functionality to profiles table.

  ## Modifications
  - Add `is_admin` column to profiles table
  - Add `role` column to profiles table for future role management

  ## Notes
  - Default is_admin is false for all users
  - Existing users remain non-admin
*/

-- Add is_admin column to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Add role column for future extensibility
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'customer';
  END IF;
END $$;

-- Create index on is_admin for quick admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
