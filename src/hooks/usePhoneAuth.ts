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
        if (response.status === 429) {
          throw new Error('rate_limit_exceeded');
        }
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

      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (otpError) throw otpError;
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
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });

      if (verifyError) throw verifyError;
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
