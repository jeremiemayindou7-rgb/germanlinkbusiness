import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Package, Download, Ruler } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { translateLongText } from '../../lib/translateText';
import { translateToLingala, getCategoryLingala } from '../../lib/lingalaTranslate';
import { categoryTranslations } from '../../lib/translateProduct';

interface Category {
  id: string;
  name_de: string;
  name_fr: string;
  name_ln: string;
  parent_id: string | null;
}

interface Product {
  id?: string;
  name: string;
  name_de?: string;
  name_fr?: string;
  name_ln?: string;
  description: string;
  description_de?: string;
  description_fr?: string;
  description_ln?: string;
  category: string;
  category_de?: string;
  category_fr?: string;
  category_ln?: string;
  purchase_price: number;
  sale_price: number;
  condition: string;
  image_url: string;
  stock_status: string;
  stock_quantity: number;
  // ── Maße & Gewicht ──
  length_cm?: number | null;
  width_cm?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  volume_cbm?: number | null;
}

interface ProductManagementProps {
  onEbayImport?: () => void;
}

const conditions = ['new', 'very_good', 'good', 'acceptable'];

// CBM live berechnen
const calcCbm = (l?: number | null, w?: number | null, h?: number | null): number | null => {
  if (!l || !w || !h) return null;
  return Math.round((l * w * h) / 1_000_000 * 10000) / 10000;
};

// Versandkostenhinweis
const shippingHint = (cbm: number | null): string => {
  if (!cbm) return '– Maße nicht eingetragen';
  if (cbm < 0.05) return `${cbm} m³ → Pauschalversand (klein)`;
  return `${cbm} m³ × 250 €/m³ ≈ ${Math.max(15, Math.round(cbm * 250))} € Versand (Schätzwert)`;
};

export const ProductManagement: React.FC<ProductManagementProps> = ({ onEbayImport }) => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const emptyForm: Product = {
    name: '', name_de: '', name_fr: '', name_ln: '',
    description: '', description_de: '', description_fr: '', description_ln: '',
    category: 'electronics', category_de: '', category_fr: '', category_ln: '',
    purchase_price: 0, sale_price: 0,
    condition: 'good', image_url: '',
    stock_status: 'available', stock_quantity: 1,
    length_cm: null, width_cm: null, height_cm: null, weight_kg: null,
  };

  const [formData, setFormData] = useState<Product>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);

  const liveCbm = calcCbm(formData.length_cm, formData.width_cm, formData.height_cm);

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories')
      .select('id, name_de, name_fr, name_ln, parent_id')
      .order('parent_id', { ascending: true, nullsFirst: true });
    setCategories(data || []);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
  };

  const handleAutoTranslate = async () => {
    if (!formData.name || !formData.description) { alert('Bitte Name und Beschreibung eingeben'); return; }
    setTranslating(true);
    setTranslationError(null);
    try {
      const sourceNameDE = formData.name_de || formData.name;
      const sourceDescDE = formData.description_de || formData.description;
      const sourceCategoryDE = formData.category_de || formData.category;
      const [nameFR, descriptionFR] = await Promise.all([
        translateLongText(sourceNameDE, 'de', 'fr'),
        translateLongText(sourceDescDE, 'de', 'fr'),
      ]);
      const categoryKey = sourceCategoryDE.toUpperCase();
      const categoryFR = categoryTranslations[categoryKey]?.fr || sourceCategoryDE;
      const nameLN = translateToLingala(nameFR);
      const descriptionLN = translateToLingala(descriptionFR);
      const categoryLN = getCategoryLingala(categoryFR);
      setFormData(prev => ({
        ...prev,
        name_de: sourceNameDE, description_de: sourceDescDE, category_de: sourceCategoryDE,
        name_fr: nameFR, description_fr: descriptionFR, category_fr: categoryFR,
        name_ln: nameLN, description_ln: descriptionLN, category_ln: categoryLN,
      }));
      alert('✅ Übersetzung erfolgreich! Lingala-Felder bitte manuell prüfen.');
    } catch (err: any) {
      setTranslationError(`Übersetzung fehlgeschlagen: ${err?.message}`);
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = { ...formData };
    // volume_cbm wird von DB automatisch berechnet — nicht senden
    delete productData.volume_cbm;
    try {
      if (editingId) {
        await supabase.from('products').update(productData).eq('id', editingId);
      } else {
        await supabase.from('products').insert(productData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);
      fetchProducts();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const handleEdit = async (product: Product) => {
    try {
      setLoadingId(product.id || null);
      const { data, error } = await supabase.from('products').select('*').eq('id', product.id).maybeSingle();
      if (error || !data) { alert('Produkt nicht gefunden'); return; }
      setFormData({
        ...data,
        name_de: data.name_de || '', name_fr: data.name_fr || '', name_ln: data.name_ln || '',
        description_de: data.description_de || '', description_fr: data.description_fr || '', description_ln: data.description_ln || '',
        category_de: data.category_de || '', category_fr: data.category_fr || '', category_ln: data.category_ln || '',
        length_cm: data.length_cm ?? null, width_cm: data.width_cm ?? null,
        height_cm: data.height_cm ?? null, weight_kg: data.weight_kg ?? null,
      });
      setEditingId(data.id || null);
      setShowForm(true);
    } catch (err: any) {
      alert('Unerwarteter Fehler.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  };

  const numInput = (field: keyof Product, placeholder: string, required = false) => (
    <input
      type="number" step="0.01" min="0"
      required={required}
      placeholder={placeholder}
      value={(formData[field] as number) ?? ''}
      onChange={e => setFormData({ ...formData, [field]: e.target.value === '' ? null : parseFloat(e.target.value) })}
      className="px-4 py-2 border rounded-lg text-sm w-full"
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Produits</h2>
        <div className="flex items-center gap-3">
          {onEbayImport && (
            <button onClick={onEbayImport}
              className="flex items-center space-x-2 px-4 py-2 bg-[#0052cc] text-white rounded-lg hover:bg-[#0747a6] transition shadow-sm">
              <Download className="w-4 h-4" />
              <span>eBay Import</span>
            </button>
          )}
          <button onClick={() => { setFormData(emptyForm); setEditingId(null); setShowForm(true); }}
            className="flex items-center space-x-2 px-4 py-2 bg-[#009543] text-white rounded-lg hover:bg-[#007a36] transition">
            <Plus className="w-5 h-5" />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">{editingId ? 'Modifier' : 'Nouveau'} Produit</h3>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Basis */}
            <div className="grid grid-cols-2 gap-4">
              <input type="text" required placeholder="Nom du produit"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border rounded-lg" />

              <select value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value, category_de: e.target.value })}
                className="px-4 py-2 border rounded-lg">
                <option value="">-- Kategorie wählen --</option>
                {categories.filter(c => !c.parent_id).map(parent => (
                  <optgroup key={parent.id} label={`── ${parent.name_de}`}>
                    <option value={parent.name_de}>{parent.name_de}</option>
                    {categories.filter(s => s.parent_id === parent.id).map(sub => (
                      <option key={sub.id} value={sub.name_de}>&nbsp;&nbsp;&nbsp;{sub.name_de}</option>
                    ))}
                  </optgroup>
                ))}
              </select>

              <input type="number" step="0.01" required placeholder="Prix d'achat (€)"
                value={formData.purchase_price}
                onChange={e => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) })}
                className="px-4 py-2 border rounded-lg" />

              <input type="number" step="0.01" required placeholder="Prix de vente (€)"
                value={formData.sale_price}
                onChange={e => setFormData({ ...formData, sale_price: parseFloat(e.target.value) })}
                className="px-4 py-2 border rounded-lg" />

              <select value={formData.condition}
                onChange={e => setFormData({ ...formData, condition: e.target.value })}
                className="px-4 py-2 border rounded-lg">
                {conditions.map(c => <option key={c} value={c}>{t(c)}</option>)}
              </select>

              <input type="number" required placeholder="Stock"
                value={formData.stock_quantity}
                onChange={e => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                className="px-4 py-2 border rounded-lg" />

              <input type="text" placeholder="URL Image"
                value={formData.image_url}
                onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                className="px-4 py-2 border rounded-lg col-span-2" />
            </div>

            <textarea placeholder="Description" value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3} className="w-full px-4 py-2 border rounded-lg" />

            {/* ── Maße & Gewicht ─────────────────────────────────────────── */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Ruler className="w-4 h-4 text-[#0A5EB0]" />
                <h4 className="font-semibold text-gray-700">Maße & Gewicht (für Versandkostenberechnung)</h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Länge (cm)</label>
                  {numInput('length_cm', 'z.B. 80')}
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Breite (cm)</label>
                  {numInput('width_cm', 'z.B. 60')}
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Höhe (cm)</label>
                  {numInput('height_cm', 'z.B. 170')}
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Gewicht (kg)</label>
                  {numInput('weight_kg', 'z.B. 65')}
                </div>
              </div>

              {/* Live CBM Vorschau */}
              <div className={`rounded-lg px-4 py-3 text-sm flex items-center gap-2 ${
                liveCbm ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-gray-50 border border-gray-200 text-gray-500'
              }`}>
                <Package className="w-4 h-4 flex-shrink-0" />
                <div>
                  <span className="font-medium">Volumen: </span>
                  {liveCbm ? (
                    <>
                      <span className="font-bold">{liveCbm} m³</span>
                      <span className="ml-2 text-gray-600">→ {shippingHint(liveCbm)}</span>
                    </>
                  ) : (
                    <span>Wird berechnet sobald Länge × Breite × Höhe eingetragen</span>
                  )}
                </div>
              </div>
            </div>

            {/* Übersetzungen */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-700">Traductions</h4>
                <button type="button" onClick={handleAutoTranslate}
                  disabled={translating || !formData.name || !formData.description}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition text-sm">
                  {translating ? <><span className="animate-spin">⏳</span><span>Übersetze...</span></> : <><span>🌐</span><span>Auto-traduire DE→FR + LN</span></>}
                </button>
              </div>

              {translationError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">⚠️ {translationError}</div>
              )}
              <p className="text-xs text-gray-500 mb-3">💡 DE→FR: automatisch via MyMemory API. Lingala: bitte manuell prüfen.</p>

              <div className="grid grid-cols-3 gap-4">
                {['de', 'fr', 'ln'].map(lang => (
                  <div key={lang}>
                    <label className="block text-xs text-gray-600 mb-1">
                      {lang === 'de' ? '🇩🇪 Nom (Deutsch)' : lang === 'fr' ? '🇫🇷 Nom (Français)' : '🇨🇩 Nom (Lingala)'}
                    </label>
                    <input type="text"
                      value={(formData[`name_${lang}` as keyof Product] as string) || ''}
                      onChange={e => setFormData({ ...formData, [`name_${lang}`]: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-3">
                {['de', 'fr', 'ln'].map(lang => (
                  <div key={lang}>
                    <label className="block text-xs text-gray-600 mb-1">
                      {lang === 'de' ? '🇩🇪 Description (Deutsch)' : lang === 'fr' ? '🇫🇷 Description (Français)' : '🇨🇩 Description (Lingala)'}
                    </label>
                    <textarea rows={2}
                      value={(formData[`description_${lang}` as keyof Product] as string) || ''}
                      onChange={e => setFormData({ ...formData, [`description_${lang}`]: e.target.value })}
                      className="w-full px-3 py-2 border rounded text-sm" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button type="submit" className="flex-1 py-2 bg-[#009543] text-white rounded-lg hover:bg-[#007a36] flex items-center justify-center gap-2">
                <Save className="w-5 h-5" /> Enregistrer
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-gray-200 rounded-lg">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Produktliste */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maße / CBM</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">{t(product.condition)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{t(product.category)}</td>
                <td className="px-6 py-4 text-sm font-medium text-[#009543]">{product.sale_price.toFixed(2)} €</td>
                <td className="px-6 py-4 text-sm">
                  {product.volume_cbm ? (
                    <div>
                      <span className="font-medium text-[#0A5EB0]">{product.volume_cbm} m³</span>
                      <span className="text-xs text-gray-400 block">
                        {product.length_cm}×{product.width_cm}×{product.height_cm} cm
                        {product.weight_kg ? ` · ${product.weight_kg} kg` : ''}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                      Maße fehlen
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">{product.stock_quantity || 0}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleEdit(product)} disabled={loadingId === product.id}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition disabled:opacity-50">
                    {loadingId === product.id ? (
                      <><div className="w-4 h-4 mr-1 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />Laden...</>
                    ) : (
                      <><Edit className="w-4 h-4 mr-1" />Modifier</>
                    )}
                  </button>
                  <button onClick={() => handleDelete(product.id!)}
                    className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition">
                    <Trash2 className="w-4 h-4 mr-1" />Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

