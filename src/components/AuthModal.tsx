import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { PhoneInput } from './PhoneInput';
import { VerifyCode } from './VerifyCode';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMethod = 'email' | 'phone';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { signIn, signUp, resetPassword, updatePassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showVerifyCode, setShowVerifyCode] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        await resetPassword(formData.email);
        setSuccess(t('reset_link_sent'));
        setTimeout(() => {
          setIsForgotPassword(false);
          setSuccess('');
        }, 3000);
      } else if (isResetMode) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError(t('password') + ' ' + t('confirm_password'));
          setLoading(false);
          return;
        }
        await updatePassword(formData.newPassword);
        setSuccess(t('password_updated'));
        setTimeout(() => {
          setIsResetMode(false);
          setIsLogin(true);
          setSuccess('');
          setFormData({
            email: '',
            password: '',
            name: '',
            phone: '',
            whatsapp: '',
            address: '',
            newPassword: '',
            confirmPassword: '',
          });
        }, 2000);
      } else if (isLogin) {
        await signIn(formData.email, formData.password);
        onClose();
      } else {
        await signUp(formData.email, formData.password, formData.name);
        onClose();
      }

      if (!isForgotPassword && !isResetMode) {
        setFormData({
          email: '',
          password: '',
          name: '',
          phone: '',
          whatsapp: '',
          address: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneCodeSent = (phone: string) => {
    setPhoneNumber(phone);
    setShowVerifyCode(true);
  };

  const handlePhoneVerifySuccess = () => {
    setShowVerifyCode(false);
    setPhoneNumber('');
    setAuthMethod('email');
    onClose();
  };

  const handlePhoneVerifyBack = () => {
    setShowVerifyCode(false);
    setPhoneNumber('');
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    if (params.get('reset') === 'true' || hashParams.get('type') === 'recovery') {
      setIsResetMode(true);
      setIsLogin(false);
      setIsForgotPassword(false);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {isResetMode ? t('update_password') : isForgotPassword ? t('reset_password') : (isLogin ? t('login') : t('register'))}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!isResetMode && !isForgotPassword && (
            <div className="flex border-b border-gray-200 mb-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setShowVerifyCode(false);
                  setPhoneNumber('');
                  setError('');
                }}
                className={`flex-1 py-3 text-sm font-medium transition ${
                  authMethod === 'email'
                    ? 'border-b-2 border-[#009543] text-[#009543]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('toggle_email')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('phone');
                  setError('');
                }}
                className={`flex-1 py-3 text-sm font-medium transition ${
                  authMethod === 'phone'
                    ? 'border-b-2 border-[#009543] text-[#009543]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('toggle_phone')}
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {authMethod === 'phone' && !isResetMode && !isForgotPassword ? (
            showVerifyCode ? (
              <VerifyCode
                phone={phoneNumber}
                onSuccess={handlePhoneVerifySuccess}
                onBack={handlePhoneVerifyBack}
              />
            ) : (
              <PhoneInput onCodeSent={handlePhoneCodeSent} />
            )
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isResetMode ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('new_password')} *
                </label>
                <input
                  type="password"
                  required
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009543] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('confirm_password')} *
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009543] focus:border-transparent"
                />
              </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#FBDE4A] hover:bg-[#e5c842] rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '...' : t('update_password')}
                </button>
              </>
            ) : isForgotPassword ? (
              <>
                <div className="text-sm text-gray-600 mb-4">
                  {t('check_email')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('email')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009543] focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#FBDE4A] hover:bg-[#e5c842] rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '...' : t('reset_password')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="w-full text-sm text-[#009543] hover:underline"
                >
                  {t('back_to_login')}
                </button>
              </>
            ) : (
              <>
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('name')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009543] focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('email')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009543] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('password')} *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009543] focus:border-transparent"
                  />
                </div>

                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError('');
                    }}
                    className="text-sm text-[#009543] hover:underline"
                  >
                    {t('forgot_password')}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#FBDE4A] hover:bg-[#e5c842] rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '...' : (isLogin ? t('login') : t('register'))}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setSuccess('');
                  }}
                  className="w-full text-sm text-[#009543] hover:underline"
                >
                  {isLogin
                    ? `${t('register')} →`
                    : `← ${t('login')}`}
                </button>
              </>
            )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
