import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePhoneAuth } from '../hooks/usePhoneAuth';

interface PhoneInputProps {
  onCodeSent: (phone: string) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ onCodeSent }) => {
  const { t } = useLanguage();
  const { sendOtp, loading, error, clearError } = usePhoneAuth();
  const [phone, setPhone] = useState('');
  const [validationError, setValidationError] = useState('');

  const validatePhone = (phoneNumber: string): boolean => {
    const cleaned = phoneNumber.replace(/\s/g, '');

    const isValid = /^\+[1-9]\d{7,14}$/.test(cleaned);

    if (!isValid) {
      setValidationError("Ungültige Nummer. Beispiel: +4917612345678");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    const cleanedPhone = phone.replace(/\s/g, '');

    if (!validatePhone(cleanedPhone)) {
      return;
    }

    try {
      await sendOtp(cleanedPhone);
      onCodeSent(cleanedPhone);
    } catch (err: any) {
      if (err.message === 'rate_limit_exceeded') {
        setValidationError(t('error_too_many'));
      } else {
        setValidationError(t('error_invalid_phone'));
      }
    }
  };

 const displayError = validationError || error;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('phone_label')} *
        </label>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setValidationError('');
            clearError();
          }}
          placeholder={t('phone_placeholder')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009543] focus:border-transparent"
          disabled={loading}
        />
        {displayError && (
          <p className="mt-2 text-sm text-red-600">{displayError}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
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
          t('send_code')
        )}
      </button>
    </form>
  );
};
