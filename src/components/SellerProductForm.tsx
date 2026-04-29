import React, { useState, useRef } from 'react';
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
  const { user, session } = useAuth(); // ← session hinzugefügt
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '', category: CATEGORIES[0], sale_price: '',
    condition: 'good', description: ''
  });

  // Bild auswählen & Vorschau anzeigen
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Maximale Größe: 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Bild zu groß! Maximal 5MB erlaubt.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Bild zu Supabase Storage hochladen
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !user) return null;

    setUploadProgress(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err: any) {
      console.error('Image upload error:', err);
      alert('Bild-Upload fehlgeschlagen: ' + err.message);
      return null;
    } finally {
      setUploadProgress(false);
    }
  };

  const handleSubmit = async () => {
    // ← Sicherheitscheck: user UND session prüfen
    if (!user || !session) {
      alert('Bitte erst einloggen!');
      return;
    }
    if (!form.name || !form.sale_price) return;

    setLoading(true);
    try {
      // Bild hochladen falls ausgewählt
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const { error } = await supabase.from('products').insert({
        name: form.name,
        name_de: form.name,
        title: form.name,           // ← title auch setzen
        category: form.category,
        sale_price: parseFloat(form.sale_price),
        condition: form.condition,
        description: form.description,
        image_url: imageUrl,
        stock_status: 'available',
        seller_id: user.id,         // ← wird jetzt korrekt gesetzt
        is_seller_product: true,
        location: 'Deutschland',
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

          {/* Bild Upload */}
          <div>
            <label className="block text-sm font-bold text-[#1C1C1C] mb-1">
              Produktbild
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 border-2 border-dashed border-[#E5E5E5] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#0A5EB0] hover:bg-blue-50 transition overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Vorschau" className="w-full h-full object-cover" />
              ) : (
                <>
                  <ImageIcon className="w-10 h-10 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Bild auswählen</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · max. 5MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            {imagePreview && (
              <button
                onClick={() => { setImageFile(null); setImagePreview(''); }}
                className="text-xs text-red-500 mt-1 hover:underline"
              >
                Bild entfernen
              </button>
            )}
          </div>

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
            disabled={loading || uploadProgress || !form.name || !form.sale_price}
            className="flex-1 py-3 bg-[#FF6F00] text-white rounded-xl font-bold hover:bg-[#E66000] transition disabled:opacity-50"
          >
            {loading || uploadProgress ? (
              <span className="flex items-center justify-center gap-2">
                <Upload className="w-4 h-4 animate-bounce" />
                {uploadProgress ? 'Bild wird hochgeladen...' : t('loading')}
              </span>
            ) : t('seller_publish')}
          </button>
        </div>
      </div>
    </div>
  );
};

