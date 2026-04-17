import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { translateLongText } from '../../lib/translateText';
import { translateToLingala, getCategoryLingala } from '../../lib/lingalaTranslate';
import { categoryTranslations } from '../../lib/translateProduct';

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
}

const categories = ['electronics', 'clothing', 'furniture', 'household', 'auto_motor', 'other'];
const conditions = ['new', 'very_good', 'good', 'acceptable'];

export const ProductManagement: React.FC = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Product>({
    name: '',
    name_de: '',
    name_fr: '',
    name_ln: '',
    description: '',
    description_de: '',
    description_fr: '',
    description_ln: '',
    category: 'electronics',
    category_de: '',
    category_fr: '',
    category_ln: '',
    purchase_price: 0,
    sale_price: 0,
    condition: 'good',
    image_url: '',
    stock_status: 'available',
    stock_quantity: 1,
  });
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts(data || []);
  };

  const handleAutoTranslate = async () => {
    if (!formData.name || !formData.description) {
      alert('Bitte Name und Beschreibung eingeben');
      return;
    }

    setTranslating(true);
    setTranslationError(null);

    try {
      console.log('[AdminForm] Starting auto-translation...');
      console.log('[AdminForm] Source text:', formData.name, formData.description?.substring(0, 50));

      const sourceNameDE = formData.name_de || formData.name;
      const sourceDescDE = formData.description_de || formData.description;
      const sourceCategoryDE = formData.category_de || formData.category;

      console.log('[AdminForm] DE texts:', { sourceNameDE, sourceDescDE, sourceCategoryDE });

      /*
        TEST: Open browser console after clicking translate button.
        You should see:
        ✅ [Translation] Success de→fr: Mini-tracteur...
        ✅ [AdminForm] Translation complete

        If you see ❌ — check network tab for failed API call
      */

      const [nameFR, descriptionFR] = await Promise.all([
        translateLongText(sourceNameDE, 'de', 'fr'),
        translateLongText(sourceDescDE, 'de', 'fr')
      ]);

      console.log('[AdminForm] DE→FR done:', { nameFR, descriptionFR: descriptionFR.substring(0, 50) });

      const categoryKey = sourceCategoryDE.toUpperCase();
      const categoryFR = categoryTranslations[categoryKey]?.fr || sourceCategoryDE;

      const nameLN = translateToLingala(nameFR);
      const descriptionLN = translateToLingala(descriptionFR);
      const categoryLN = getCategoryLingala(categoryFR);

      console.log('[AdminForm] FR→LN done:', { nameLN, descriptionLN: descriptionLN.substring(0, 50), categoryLN });

      setFormData(prev => ({
        ...prev,
        name_de: sourceNameDE,
        description_de: sourceDescDE,
        category_de: sourceCategoryDE,
        name_fr: nameFR,
        description_fr: descriptionFR,
        category_fr: categoryFR,
        name_ln: nameLN,
        description_ln: descriptionLN,
        category_ln: categoryLN
      }));

      console.log('[AdminForm] ✅ Translation complete');
      alert('✅ Übersetzung erfolgreich! Lingala-Felder bitte manuell überprüfen und korrigieren.');

    } catch (err: any) {
      console.error('[AdminForm] Translation error:', err);
      console.error('[AdminForm] Error type:', err?.constructor?.name);
      console.error('[AdminForm] Message:', err?.message);
      console.error('[AdminForm] Status:', err?.status);

      const errorMessage = err?.message || 'Unbekannter Fehler';
      setTranslationError(`Übersetzung fehlgeschlagen: ${errorMessage}`);
      alert(`❌ Übersetzung fehlgeschlagen: ${errorMessage}\n\nBitte manuell eingeben oder erneut versuchen.`);
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = { ...formData };

    try {
      if (editingId) {
        await supabase.from('products').update(productData).eq('id', editingId);
      } else {
        await supabase.from('products').insert(productData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        name_de: '',
        name_fr: '',
        name_ln: '',
        description: '',
        description_de: '',
        description_fr: '',
        description_ln: '',
        category: 'electronics',
        category_de: '',
        category_fr: '',
        category_ln: '',
        purchase_price: 0,
        sale_price: 0,
        condition: 'good',
        image_url: '',
        stock_status: 'available',
        stock_quantity: 1,
      });
      fetchProducts();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const handleEdit = async (product: Product) => {
    console.log('[Modifier] Button clicked for product:', product.id, product.name);

    try {
      setLoadingId(product.id || null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', product.id)
        .maybeSingle();

      if (error) {
        console.error('[Modifier] Supabase error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        alert(`Fehler beim Laden des Produkts: ${error.message}`);
        return;
      }

      if (!data) {
        console.error('[Modifier] No data returned for id:', product.id);
        alert('Produkt nicht gefunden');
        return;
      }

      console.log('[Modifier] Product loaded:', data);

      setFormData({
        ...data,
        name_de: data.name_de || '',
        name_fr: data.name_fr || '',
        name_ln: data.name_ln || '',
        description_de: data.description_de || '',
        description_fr: data.description_fr || '',
        description_ln: data.description_ln || '',
        category_de: data.category_de || '',
        category_fr: data.category_fr || '',
        category_ln: data.category_ln || ''
      });

      setEditingId(data.id || null);
      setShowForm(true);

      console.log('[Modifier] Form opened for editing');
    } catch (err: any) {
      console.error('[Modifier] Unexpected error:', err);
      alert('Unerwarteter Fehler. Bitte erneut versuchen.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Produits</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-[#009543] text-white rounded-lg hover:bg-[#007a36] transition"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter</span>
        </button>
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
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="Nom du produit"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{t(cat)}</option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                required
                placeholder="Prix d'achat (€)"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) })}
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="number"
                step="0.01"
                required
                placeholder="Prix de vente (€)"
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) })}
                className="px-4 py-2 border rounded-lg"
              />
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              >
                {conditions.map(cond => (
                  <option key={cond} value={cond}>{t(cond)}</option>
                ))}
              </select>
              <input
                type="number"
                required
                placeholder="Stock"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="url"
                placeholder="URL Image"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                onBlur={(e) => {
                  const url = e.target.value.trim();
                  if (url && !url.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i)) {
                    alert('Bitte geben Sie eine gültige Bild-URL ein (jpg, jpeg, png, gif, webp, svg)');
                  }
                }}
                pattern="https?://.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?"
                title="Bitte geben Sie eine gültige Bild-URL ein"
                className="px-4 py-2 border rounded-lg"
              />
            </div>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg"
            />

            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-700">Traductions</h4>
                <button
                  type="button"
                  onClick={handleAutoTranslate}
                  disabled={translating || !formData.name || !formData.description}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition"
                >
                  {translating ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Übersetze...</span>
                    </>
                  ) : (
                    <>
                      <span>🌐</span>
                      <span>Auto-traduire DE→FR + LN</span>
                    </>
                  )}
                </button>
              </div>

              {translationError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                  ⚠️ {translationError}
                </div>
              )}

              <p className="text-xs text-gray-500 mb-3">
                💡 DE→FR: automatisch via MyMemory API. Lingala: bitte manuell prüfen und korrigieren.
              </p>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">🇩🇪 Nom (Deutsch)</label>
                  <input
                    type="text"
                    placeholder="Name auf Deutsch"
                    value={formData.name_de || ''}
                    onChange={(e) => setFormData({ ...formData, name_de: e.target.value })}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">🇫🇷 Nom (Français)</label>
                  <input
                    type="text"
                    placeholder="Nom en français"
                    value={formData.name_fr || ''}
                    onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">🇨🇩 Nom (Lingala)</label>
                  <input
                    type="text"
                    placeholder="Kombo na Lingala"
                    value={formData.name_ln || ''}
                    onChange={(e) => setFormData({ ...formData, name_ln: e.target.value })}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">🇩🇪 Description (Deutsch)</label>
                  <textarea
                    placeholder="Beschreibung"
                    value={formData.description_de || ''}
                    onChange={(e) => setFormData({ ...formData, description_de: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">🇫🇷 Description (Français)</label>
                  <textarea
                    placeholder="Description en français"
                    value={formData.description_fr || ''}
                    onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">🇨🇩 Description (Lingala)</label>
                  <textarea
                    placeholder="Ndimbola na Lingala"
                    value={formData.description_ln || ''}
                    onChange={(e) => setFormData({ ...formData, description_ln: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button type="submit" className="flex-1 py-2 bg-[#009543] text-white rounded-lg hover:bg-[#007a36]">
                <Save className="w-5 h-5 inline mr-2" />
                Enregistrer
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-gray-200 rounded-lg">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
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
                <td className="px-6 py-4 text-sm">{product.stock_quantity || 0}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    disabled={loadingId === product.id}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingId === product.id ? (
                      <>
                        <div className="w-4 h-4 mr-1 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                        Laden...
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-1" />
                        Modifier
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(product.id!)}
                    className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer
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
