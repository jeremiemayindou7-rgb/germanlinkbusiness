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
    // Erlaubt alle internationalen Nummern: +[1-9] gefolgt von 6-14 Ziffern
    const isValid = /^\+[1-9]\d{6,14}$/.test(cleaned);
    if (!isValid) {
      setValidationError('Numéro invalide. Ex: +242XXXXXXXXX ou +49XXXXXXXXXXX');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    const cleanedPhone = phone.replace(/\s/g, '');

    if (!validatePhone(cleanedPhone)) return;

    try {
      await sendOtp(cleanedPhone);
      onCodeSent(cleanedPhone);
    } catch (err: any) {
      if (err.message === 'rate_limit_exceeded') {
        setValidationError(t('error_too_many'));
      } else {
        setValidationError('Erreur envoi. Vérifiez le numéro.');
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
          placeholder="+242XXXXXXXXX / +49XXXXXXXXXXX"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009543] focus:border-transparent"
          disabled={loading}
        />
        {displayError && (
          <p className="mt-2 text-sm text-red-600">{displayError}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          📱 WhatsApp – Congo: +242... · Deutschland: +49...
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#FBDE4A] hover:bg-[#e5c842] rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Envoi...
          </span>
        ) : (
          t('send_code')
        )}
      </button>
    </form>
  );
};