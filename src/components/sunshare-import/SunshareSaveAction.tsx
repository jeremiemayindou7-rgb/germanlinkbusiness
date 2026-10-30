import React, { useState } from 'react';
import { Save, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SunshareProduct } from './types';

interface Props {
  product: SunshareProduct;
  onSaved: () => void;
  onReset: () => void;
}

// Sunshare-Kategorie → Supabase-Kategorie-Mapping
const CATEGORY_MAP: Record<string, string> = {
  solar_energie:       'solar_energie',
  balkonkraftwerk:     'solar_energie',
  solaranlage:         'solar_energie',
  wechselrichter:      'solar_energie',
  speicher:            'solar_energie',
  zubehör:             'solar_energie',
};

export function SunshareSaveAction({ product, onSaved, onReset }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const mappedCategory = CATEGORY_MAP[product.category] || 'solar_energie';

      const { error: dbError } = await supabase.from('products').insert({
        // Basisfelder
        name:              product.title_de || product.title,
        description:       product.description_de || product.description,
        category:          mappedCategory,

        // Mehrsprachig
        name_de:           product.title_de,
        name_fr:           product.title_fr,
        name_ln:           product.title_ln,
        description_de:    product.description_de,
        description_fr:    product.description_fr,
        description_ln:    product.description_ln,
        category_de:       'Solar & Energie',
        category_fr:       'Solaire & Énergie',
        category_ln:       'Solar mpe Énergie',

        // Preise
        purchase_price:    product.price_eur,
        sale_price:        product.glb_price_eur,

        // Bilder
        image_url:         product.images[0] || '',
        images:            product.images,

        // Meta
        condition:         'new',
        stock_status:      'available',
        stock_quantity:    10,
        source_type:       'sunshare',
        ebay_url:          product.url,   // Reuse field for source URL
        is_seller_product: false,
      });

      if (dbError) throw new Error(dbError.message);

      setSaved(true);
      setTimeout(() => onSaved(), 1500);
    } catch (err: any) {
      setError(err.message || 'Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-800">Produkt gespeichert!</p>
          <p className="text-xs text-green-600">Wird zum GLB Katalog hinzugefügt…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 bg-[#009543] hover:bg-[#007a36] disabled:opacity-60 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Wird gespeichert…
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              In GLB Katalog speichern
            </>
          )}
        </button>
        <button
          onClick={onReset}
          disabled={saving}
          className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition flex items-center gap-2 text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Neu
        </button>
      </div>
      <p className="text-xs text-gray-400 text-center">
        Das Produkt wird als <strong>Solar &amp; Energie</strong> Produkt mit +20% GLB-Aufschlag gespeichert.
      </p>
    </div>
  );
}
