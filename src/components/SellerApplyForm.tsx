import React, { useState } from 'react';
import { MapPin, Phone, Briefcase, Send, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const SellerApplyForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    city: '',
    phone: '',
    business_type: 'private',
    message: ''
  });

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Prüfen ob schon eine Bewerbung existiert
      const { data: existing } = await supabase
        .from('seller_applications')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        alert(t('seller_already_applied'));
        return;
      }

      const { error } = await supabase.from('seller_applications').insert({
        user_id: user.id,
        ...form
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#1C1C1C] mb-2">{t('seller_applied_title')}</h2>
        <p className="text-gray-600 mb-6">{t('seller_applied_desc')}</p>
        <button onClick={onClose} className="w-full py-3 bg-[#0A5EB0] text-white rounded-xl font-bold">
          {t('cancel')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#1C1C1C] mb-1">{t('seller_apply_title')}</h2>
        <p className="text-gray-500 text-sm mb-6">{t('seller_apply_desc')}</p>

        {/* Bedingung-Hinweis */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
          <MapPin className="w-5 h-5 text-[#0A5EB0] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#0A5EB0]">{t('seller_germany_required')}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#1C1C1C] mb-1">{t('name')}</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm({...form, full_name: e.target.value})}
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#0A5EB0]"
              placeholder="Max Mustermann"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1C1C1C] mb-1">{t('seller_city')}</label>
            <input
              type="text"
              value={form.city}
              onChange={e => setForm({...form, city: e.target.value})}
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#0A5EB0]"
              placeholder="Berlin, Hamburg, München..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1C1C1C] mb-1">{t('phone')}</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({...form, phone: e.target.value})}
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#0A5EB0]"
              placeholder="+49 ..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1C1C1C] mb-1">{t('seller_business_type')}</label>
            <select
              value={form.business_type}
              onChange={e => setForm({...form, business_type: e.target.value})}
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#0A5EB0]"
            >
              <option value="private">{t('seller_private')}</option>
              <option value="business">{t('seller_business')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#1C1C1C] mb-1">{t('description')} (optional)</label>
            <textarea
              value={form.message}
              onChange={e => setForm({...form, message: e.target.value})}
              rows={3}
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#0A5EB0] resize-none"
              placeholder={t('seller_message_placeholder')}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 border border-[#E5E5E5] rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition">
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !form.full_name || !form.city || !form.phone}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0A5EB0] text-white rounded-xl font-bold hover:bg-[#094da0] transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? t('loading') : t('seller_apply_btn')}
          </button>
        </div>
      </div>
    </div>
  );
};