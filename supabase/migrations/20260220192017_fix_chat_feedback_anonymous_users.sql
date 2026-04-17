/*
  # Fix Chat Feedback for Anonymous Users

  1. Changes
    - Allow anonymous users to submit chat feedback
    - Keep authenticated users restricted to their own feedback
    - Maintain security: anonymous users can only INSERT, not SELECT other feedback

  2. Security
    - Anonymous users can INSERT feedback with user_id = NULL
    - Authenticated users can INSERT feedback with their own user_id
    - Only authenticated users can SELECT their own feedback
    - No one can SELECT anonymous feedback (user_id = NULL)

  3. Impact
    - Fixes 500 error when anonymous users try to give chatbot feedback
    - Maintains data privacy and security
*/

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can insert feedback" ON chat_feedback;

-- Allow both authenticated and anonymous users to insert feedback
CREATE POLICY "Anyone can insert feedback"
  ON chat_feedback FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    CASE
      WHEN auth.uid() IS NULL THEN user_id IS NULL
      ELSE user_id = auth.uid()
    END
  );
