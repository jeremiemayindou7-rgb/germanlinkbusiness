import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const usePhoneAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const checkRateLimit = async (phone: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rate-limit-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ phone }),
        }
      );
      if (!response.ok) {
        if (response.status === 429) throw new Error('rate_limit_exceeded');
        throw new Error('rate_limit_check_failed');
      }
      return true;
    } catch (err: any) {
      throw err;
    }
  };

  const sendOtp = async (phone: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await checkRateLimit(phone);

      // WhatsApp OTP statt SMS
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-whatsapp-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ phone }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Senden des WhatsApp-Codes');
      }

    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (phone: string, token: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // WhatsApp OTP verifizieren
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-whatsapp-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ phone, code: token }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'invalid_code') {
          throw new Error('Code ungültig oder abgelaufen');
        }
        throw new Error(data.error || 'Verifizierung fehlgeschlagen');
      }

      // Magic Link einlösen um Session zu erstellen
      if (data.link) {
        const url = new URL(data.link);
        const token_hash = url.searchParams.get('token_hash') ||
                           new URLSearchParams(url.hash.substring(1)).get('access_token');

        if (token_hash) {
          const { error: sessionError } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'magiclink',
          });
          if (sessionError) throw sessionError;
        }
      }

    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendOtp,
    verifyOtp,
    loading,
    error,
    clearError,
  };
};