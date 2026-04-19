import React, { useState } from 'react';
import { X, Upload, ImageIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const CATEGORIES = [
  'Elektronik & IT', 'Auto & Moto', 'Landwirtschaft & Agrartechnik',
  'Solar & Energie', 'Werkzeuge & Maschinen', 'Kühlung & Markt-Ausrüstung'
];

interface Props { onClose: () => void; onSuccess: () => void; }

export const SellerProductForm: React.FC<Props> = ({ onClose, onSuccess }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', category: CATEGORIES[0], sale_price: '',
    condition: 'good', description: '', image_url: ''
  });

  const handleSubmit = async () => {
    if (!user || !form.name || !form.sale_price) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('products').insert({
        name: form.name,
        name_de: form.name,
        category: form.category,
        sale_price: parseFloat(form.sale_price),
        condition: form.condition,
        description: form.description,
        image_url: form.image_url || null,
        stock_status: 'available',
        seller_id: user.id,
        is_seller_product: true
      });
      if (error) throw error;
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5]">
          <h2 className="text-xl font-bold text-[#1C1C1C]">{t('seller_new_product')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Titel */}
          <div>
            <label className="block text-sm font-bold text-[#1C1C1C] mb-1">{t('product_name')} *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#0A5EB0]"
              placeholder="z.B. Bosch Waschmaschine 7kg"
            />
          </div>

          {/* Kategorie */}
          <div>
            <label className="block text-sm font-bold text-[#1C1C1C] mb-1">{t('categories')}</label>
            <select
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#0A5EB0]"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Preis + Zustand */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-[#1C1C1C] mb-1">{t('price')} (€) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.sale_price}
                onChange={e => setForm({...form, sale_price: e.target.value})}
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#0A5EB0]"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1C1C1C] mb-1">{t('condition')}</label>
              <select
                value={form.condition}
                onChange={e => setForm({...form, condition: e.target.value})}
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#0A5EB0]"
              >
                <option value="new">{t('new')}</option>
                <option value="very_good">{t('very_good')}</option>
                <option value="good">{t('good')}</option>
                <option value="acceptable">{t('acceptable')}</option>
              </select>
            </div>
          </div>

          {/* Beschreibung */}
          <div>
            <label className="block text-sm font-bold text-[#1C1C1C] mb-1">{t('description')}</label>
            <textarea
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={4}
              maxLength={4000}
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#0A5EB0] resize-none"
              placeholder="Beschreibe das Produkt..."
            />
            <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/4000</p>
          </div>

          {/* Bild URL */}
          <div>
            <label className="block text-sm font-bold text-[#1C1C1C] mb-1">{t('image_url')}</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={form.image_url}
                onChange={e => setForm({...form, image_url: e.target.value})}
                className="flex-1 px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#0A5EB0]"
                placeholder="https://..."
              />
              {form.image_url && (
                <img src={form.image_url} alt="preview"
                  className="w-12 h-12 rounded-lg object-cover border border-[#E5E5E5]"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">{t('seller_image_hint')}</p>
          </div>

          {/* Hinweis */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            {t('seller_shipping_notice')}
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-[#E5E5E5] rounded-xl font-bold text-gray-600 hover:bg-gray-50">
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !form.name || !form.sale_price}
            className="flex-1 py-3 bg-[#FF6F00] text-white rounded-xl font-bold hover:bg-[#E66000] transition disabled:opacity-50"
          >
            {loading ? t('loading') : t('seller_publish')}
          </button>
        </div>
      </div>
    </div>
  );
};