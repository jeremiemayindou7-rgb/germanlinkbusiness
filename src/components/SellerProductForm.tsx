import React, { useState, useRef } from 'react';
import { X, Upload, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const CATEGORIES = [
  'Elektronik & IT', 'Auto & Moto', 'Landwirtschaft & Agrartechnik',
  'Solar & Energie', 'Werkzeuge & Maschinen', 'Kühlung & Markt-Ausrüstung'
];

const MAX_IMAGES = 3;
const MAX_SIZE_MB = 5;

interface ImageSlot {
  file: File | null;
  preview: string;
  uploading: boolean;
  url: string | null;
}

interface Props { onClose: () => void; onSuccess: () => void; }

export const SellerProductForm: React.FC<Props> = ({ onClose, onSuccess }) => {
  const { t } = useLanguage();
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);

  // ── Ein file input pro Slot (iOS/Tablet fix) ─────────────────────────────
  const fileInput0 = useRef<HTMLInputElement>(null);
  const fileInput1 = useRef<HTMLInputElement>(null);
  const fileInput2 = useRef<HTMLInputElement>(null);
  const fileInputRefs = [fileInput0, fileInput1, fileInput2];

  // 3 Bild-Slots
  const [images, setImages] = useState<ImageSlot[]>([
    { file: null, preview: '', uploading: false, url: null },
    { file: null, preview: '', uploading: false, url: null },
    { file: null, preview: '', uploading: false, url: null },
  ]);

  const [form, setForm] = useState({
    name: '', category: CATEGORIES[0], sale_price: '',
    condition: 'good', description: ''
  });

  // Bild-Slot anklicken → Datei-Dialog öffnen (slot-spezifisch für iOS/Tablet)
  const openFileDialog = (slotIndex: number) => {
    fileInputRefs[slotIndex]?.current?.click();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Bild zu groß! Maximal ${MAX_SIZE_MB}MB erlaubt.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImages(prev => prev.map((img, i) =>
        i === slotIndex
          ? { ...img, file, preview: reader.result as string, url: null }
          : img
      ));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (slotIndex: number) => {
    setImages(prev => prev.map((img, i) =>
      i === slotIndex
        ? { file: null, preview: '', uploading: false, url: null }
        : img
    ));
  };

  // Alle Bilder hochladen → URLs zurückgeben
  const uploadAllImages = async (): Promise<string[]> => {
    const urls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const slot = images[i];
      if (!slot.file) continue;

      setImages(prev => prev.map((img, idx) =>
        idx === i ? { ...img, uploading: true } : img
      ));

      try {
        const fileExt = slot.file.name.split('.').pop();
        const fileName = `${user!.id}_${Date.now()}_${i}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error } = await supabase.storage
          .from('product-images')
          .upload(filePath, slot.file, { upsert: true });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        urls.push(urlData.publicUrl);

        setImages(prev => prev.map((img, idx) =>
          idx === i ? { ...img, uploading: false, url: urlData.publicUrl } : img
        ));
      } catch (err: any) {
        console.error(`Bild ${i + 1} Upload fehlgeschlagen:`, err);
        setImages(prev => prev.map((img, idx) =>
          idx === i ? { ...img, uploading: false } : img
        ));
      }
    }

    return urls;
  };

  const handleSubmit = async () => {
    if (!user || !session) { alert('Bitte erst einloggen!'); return; }
    if (!form.name || !form.sale_price) return;

    setLoading(true);
    try {
      const imageUrls = await uploadAllImages();

      const { error } = await supabase.from('products').insert({
        name:              form.name,
        name_de:           form.name,
        title:             form.name,
        category:          form.category,
        purchase_price:    parseFloat(form.sale_price), // ← Pflichtfeld
        sale_price:        parseFloat(form.sale_price),
        condition:         form.condition,
        description:       form.description,
        image_url:         imageUrls[0] || null,
        images:            imageUrls.length > 0 ? imageUrls : null,
        stock_status:      'available',
        seller_id:         user.id,
        is_seller_product: true,
        location:          'Deutschland',
      });

      if (error) throw error;
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const anyUploading = images.some(img => img.uploading);
  const filledSlots = images.filter(img => img.file).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E5E5]">
          <h2 className="text-xl font-bold text-[#1C1C1C]">{t('seller_new_product')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* ── 3 Bild-Slots ── */}
          <div>
            <label className="block text-sm font-bold text-[#1C1C1C] mb-2">
              Produktbilder
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({filledSlots}/{MAX_IMAGES} · max. {MAX_SIZE_MB}MB pro Bild)
              </span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square">
                  {img.preview ? (
                    /* Bild vorhanden */
                    <div className="w-full h-full rounded-xl overflow-hidden border-2 border-[#0A5EB0] relative">
                      <img
                        src={img.preview}
                        alt={`Bild ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Uploading Overlay */}
                      {img.uploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                        </div>
                      )}
                      {/* Remove Button */}
                      {!img.uploading && (
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                        >
                          <X className="w-3 h-3"/>
                        </button>
                      )}
                      {/* Slot-Nummer */}
                      {i === 0 && (
                        <div className="absolute bottom-1 left-1 bg-[#0A5EB0] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Haupt
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Leerer Slot */
                    <button
                      onClick={() => openFileDialog(i)}
                      className="w-full h-full rounded-xl border-2 border-dashed border-[#E5E5E5] flex flex-col items-center justify-center hover:border-[#0A5EB0] hover:bg-blue-50 transition"
                    >
                      <Plus className="w-6 h-6 text-gray-300 mb-1"/>
                      <span className="text-[10px] text-gray-400">
                        {i === 0 ? 'Hauptbild' : `Bild ${i + 1}`}
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* 3 versteckte file inputs — einer pro Slot */}
            {fileInputRefs.map((ref, i) => (
              <input
                key={i}
                ref={ref}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleImageSelect(e, i)}
                className="hidden"
              />
            ))}

            <p className="text-xs text-gray-400 mt-1.5">
              💡 Das erste Bild wird als Hauptbild im Marketplace angezeigt.
            </p>
          </div>

          {/* Titel */}
          <div>
            <label className="block text-sm font-bold text-[#1C1C1C] mb-1">{t('product_name')} *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#0A5EB0] outline-none"
              placeholder="z.B. Bosch Waschmaschine 7kg"
            />
          </div>

          {/* Kategorie */}
          <div>
            <label className="block text-sm font-bold text-[#1C1C1C] mb-1">{t('categories')}</label>
            <select
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#0A5EB0] outline-none"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Preis + Zustand */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-[#1C1C1C] mb-1">{t('price')} (€) *</label>
              <input
                type="number" min="0" step="0.01"
                value={form.sale_price}
                onChange={e => setForm({...form, sale_price: e.target.value})}
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#0A5EB0] outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1C1C1C] mb-1">{t('condition')}</label>
              <select
                value={form.condition}
                onChange={e => setForm({...form, condition: e.target.value})}
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#0A5EB0] outline-none"
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
              rows={4} maxLength={4000}
              className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#0A5EB0] outline-none resize-none"
              placeholder="Beschreibe das Produkt..."
            />
            <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/4000</p>
          </div>

          {/* Hinweis */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            {t('seller_shipping_notice')}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-[#E5E5E5] rounded-xl font-bold text-gray-600 hover:bg-gray-50"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || anyUploading || !form.name || !form.sale_price}
            className="flex-1 py-3 bg-[#FF6F00] text-white rounded-xl font-bold hover:bg-[#E66000] transition disabled:opacity-50"
          >
            {loading || anyUploading ? (
              <span className="flex items-center justify-center gap-2">
                <Upload className="w-4 h-4 animate-bounce"/>
                {anyUploading ? 'Bilder werden hochgeladen...' : t('loading')}
              </span>
            ) : t('seller_publish')}
          </button>
        </div>
      </div>
    </div>
  );
};

