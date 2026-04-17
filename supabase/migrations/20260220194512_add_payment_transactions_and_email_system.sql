/*
  # Payment Transactions and Email System

  ## Summary
  Implements a comprehensive payment tracking and email notification system for the e-commerce platform.

  ## New Tables

  1. **payment_transactions**
     - `id` (uuid, primary key) - Transaction identifier
     - `order_id` (uuid, references orders) - Associated order
     - `transaction_id` (text) - External payment provider transaction ID
     - `amount` (numeric) - Transaction amount
     - `currency` (text) - Currency code (EUR, USD, etc.)
     - `status` (text) - Transaction status (pending, success, failed)
     - `provider` (text) - Payment provider (lemfi, stripe, etc.)
     - `provider_response` (jsonb) - Full provider webhook payload
     - `created_at` (timestamptz) - Transaction timestamp

  ## Modifications

  1. **orders table**
     - Add `email_sent` (boolean) - Tracks if order confirmation email was sent
     - Add `payment_confirmed_at` (timestamptz) - Timestamp when payment was confirmed

  ## Security

  - Enable RLS on payment_transactions table
  - Users can view their own transactions
  - Admin can view all transactions
  - Webhook function uses service role key (bypasses RLS)

  ## Important Notes

  1. **Email System:**
     - Automatic order confirmation email after order creation
     - Payment confirmation email when payment is received via webhook
     - Shipping notification email when order status changes to 'shipped'
     - Delivery notification email when order status changes to 'delivered'

  2. **Payment Webhook:**
     - LemFi webhook endpoint: /functions/v1/lemfi-webhook
     - Automatically updates order payment_status to 'paid'
     - Records all transactions in payment_transactions table
     - Triggers payment confirmation email

  3. **Email Function:**
     - Endpoint: /functions/v1/send-order-email
     - Supports multiple email types: order_confirmation, payment_confirmed, order_shipped, order_delivered
     - Multi-language support: German (DE), French (FR), Lingala (LN)
*/

CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  transaction_id text NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  provider text NOT NULL DEFAULT 'lemfi',
  provider_response jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'email_sent'
  ) THEN
    ALTER TABLE orders ADD COLUMN email_sent boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_confirmed_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_confirmed_at timestamptz;
  END IF;
END $$;

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payment transactions" ON payment_transactions;
CREATE POLICY "Users can view own payment transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payment_transactions.order_id
      AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admin can view all payment transactions" ON payment_transactions;
CREATE POLICY "Admin can view all payment transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

COMMENT ON TABLE payment_transactions IS 'Stores all payment transaction records from payment providers';
