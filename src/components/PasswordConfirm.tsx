import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { Lock, CheckCircle, Loader2 } from 'lucide-react';

export const PasswordConfirm: React.FC = () => {
  const { updatePassword } = useAuth();
  const { t } = useLanguage();
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    console.log('[PasswordConfirm] Component mounted');
    console.log('[PasswordConfirm] Checking URL hash:', window.location.hash);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[PasswordConfirm] Auth event:', event);
        console.log('[PasswordConfirm] Session:', session ? 'Active' : 'None');

        if (event === 'PASSWORD_RECOVERY') {
          console.log('[PasswordConfirm] Recovery session active — show form');
          setSessionReady(true);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('[PasswordConfirm] Existing session found');
        setSessionReady(true);
      }
    });

    return () => {
      console.log('[PasswordConfirm] Component unmounting, cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(formData.newPassword);
      setSuccess(true);

      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      console.error('[PasswordConfirm] Error:', err);
      setError(err.message || 'Passwort konnte nicht aktualisiert werden.');
    } finally {
      setLoading(false);
    }
  };

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-[#009543] mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Sitzung wird geprüft...
          </h2>
          <p className="text-gray-600 text-sm">
            Bitte warten Sie einen Moment.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Passwort erfolgreich geändert!
          </h2>
          <p className="text-gray-600">
            Sie werden zur Startseite weitergeleitet...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-center w-16 h-16 bg-[#009543] rounded-full mx-auto mb-6">
          <Lock className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Neues Passwort festlegen
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Bitte geben Sie Ihr neues Passwort ein.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Neues Passwort *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009543] focus:border-transparent"
              placeholder="Mindestens 8 Zeichen"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passwort bestätigen *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009543] focus:border-transparent"
              placeholder="Passwort wiederholen"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FBDE4A] hover:bg-[#e5c842] rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Wird aktualisiert...
              </>
            ) : (
              'Passwort aktualisieren'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Nach erfolgreicher Änderung können Sie sich mit Ihrem neuen Passwort anmelden.
        </p>
      </div>
    </div>
  );
};
