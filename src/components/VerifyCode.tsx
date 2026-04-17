import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePhoneAuth } from '../hooks/usePhoneAuth';

interface VerifyCodeProps {
  phone: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const VerifyCode: React.FC<VerifyCodeProps> = ({ phone, onSuccess, onBack }) => {
  const { t } = useLanguage();
  const { verifyOtp, sendOtp, loading, error, clearError } = usePhoneAuth();
  const [code, setCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (code.length !== 6) {
      return;
    }

    try {
      await verifyOtp(phone, code);
      onSuccess();
    } catch (err) {
      setCode('');
      inputRef.current?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      await sendOtp(phone);
      setResendCountdown(30);
      setCanResend(false);
      setCode('');
      clearError();
    } catch (err) {
      console.error('Failed to resend code:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          {t('code_sent_to')} <span className="font-medium text-gray-900">{phone}</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Code *
        </label>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          required
          maxLength={6}
          value={code}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            setCode(value);
            clearError();
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009543] focus:border-transparent text-center text-2xl tracking-widest"
          placeholder="000000"
          disabled={loading}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{t('error_invalid_code')}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || code.length !== 6}
        className="w-full py-3 bg-[#FBDE4A] hover:bg-[#e5c842] rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            ...
          </span>
        ) : (
          t('verify')
        )}
      </button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          className="text-[#009543] hover:underline"
        >
          {t('back')}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend}
          className="text-[#009543] hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
        >
          {canResend ? t('resend') : `${t('resend_in')} ${resendCountdown}s`}
        </button>
      </div>
    </form>
  );
};
