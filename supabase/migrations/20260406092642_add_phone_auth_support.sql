/*
  # Add Phone Authentication Support

  1. Changes
    - Add `phone` column to profiles table (nullable - user may register by email)
    - Add `auth_method` column to profiles table (tracks whether user registered via email or phone)
    - Create `otp_rate_limits` table for SMS rate limiting
    - Create trigger to auto-create profile after phone or email login

  2. Security
    - Maintain existing RLS policies on profiles table
    - Add RLS to otp_rate_limits table
*/

-- Add phone and auth_method columns to profiles (safe with IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'auth_method'
  ) THEN
    ALTER TABLE profiles ADD COLUMN auth_method TEXT DEFAULT 'email' CHECK (auth_method IN ('email','phone'));
  END IF;
END $$;

-- Create otp_rate_limits table for rate limiting SMS OTP requests
CREATE TABLE IF NOT EXISTS otp_rate_limits (
  phone TEXT PRIMARY KEY,
  request_count INT DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE otp_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to check rate limits (needed for edge function)
CREATE POLICY "Anyone can check rate limits"
  ON otp_rate_limits FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow anyone to insert/update rate limits (needed for edge function)
CREATE POLICY "Anyone can update rate limits"
  ON otp_rate_limits FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Create or replace trigger function to auto-create profile after login
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, auth_method)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    CASE WHEN NEW.phone IS NOT NULL THEN 'phone' ELSE 'email' END
  )
  ON CONFLICT (id) DO UPDATE SET
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    email = COALESCE(EXCLUDED.email, profiles.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();