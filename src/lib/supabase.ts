/*
  AUDIT RESULT:
  - resetPasswordForEmail found in: src/contexts/AuthContext.tsx
  - Confirm page exists: no → CREATING /auth/confirm
  - Route exists: no → ADDING /auth/confirm route to App.tsx
  - .env SITE_URL: not set (using window.location.origin dynamically)

  ⚠️ IMPORTANT — Supabase Dashboard Settings:
  Go to: Authentication → URL Configuration
  Set Site URL to your production domain (e.g. https://yourapp.com)
  Add to Redirect URLs:
    - https://yourapp.com/auth/confirm (production)
    - http://localhost:5173/auth/confirm (development)
    - http://localhost:3000/auth/confirm (development alternative)
*/

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          whatsapp_number: string | null;
          delivery_address: string | null;
          notification_prefs: {
            whatsapp: boolean;
            sms: boolean;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          phone?: string | null;
          whatsapp_number?: string | null;
          delivery_address?: string | null;
          notification_prefs?: {
            whatsapp: boolean;
            sms: boolean;
          };
        };
        Update: {
          name?: string;
          phone?: string | null;
          whatsapp_number?: string | null;
          delivery_address?: string | null;
          notification_prefs?: {
            whatsapp: boolean;
            sms: boolean;
          };
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          purchase_price: number;
          sale_price: number;
          condition: string;
          image_url: string | null;
          images: string[];
          stock_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          category: string;
          purchase_price: number;
          sale_price: number;
          condition: string;
          image_url?: string | null;
          images?: string[];
          stock_status?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          category?: string;
          purchase_price?: number;
          sale_price?: number;
          condition?: string;
          image_url?: string | null;
          images?: string[];
          stock_status?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          product_id: string;
          quantity?: number;
        };
        Update: {
          quantity?: number;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          items: Array<{
            product_id: string;
            product_name: string;
            quantity: number;
            price: number;
          }>;
          subtotal: number;
          shipping_cost: number;
          total_amount: number;
          payment_option: string;
          payment_status: string;
          order_status: string;
          next_shipment_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          order_number: string;
          user_id: string;
          items: Array<{
            product_id: string;
            product_name: string;
            quantity: number;
            price: number;
          }>;
          subtotal: number;
          shipping_cost: number;
          total_amount: number;
          payment_option: string;
          payment_status?: string;
          order_status?: string;
          next_shipment_date?: string | null;
        };
      };
    };
  };
};
