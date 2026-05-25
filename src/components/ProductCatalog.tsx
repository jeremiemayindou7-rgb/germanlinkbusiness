import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { ProductCard } from './ProductCard';
import { ProductDetail } from './ProductDetail';
import { AuthModal } from './AuthModal';
import { getIconComponent } from '../lib/categoryIcons';

interface Product {
  id: string;
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
  category_id?: string;
  sale_price: number;
  condition: string;
  image_url: string;
  stock_status: string;
}

interface Category {
  id: string;
  name_de: string;
  name_fr: string;
  name_ln: string;
  parent_id: string | null;
  icon: string;
  sort_order: number;
  subcategories?: Category[];
}

interface ProductCatalogProps {
  onCartOpen?: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ onCartOpen }) => {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]); // flat list for lookup
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, selectedCategory, sortBy, allCategories]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const flat = data || [];
      setAllCategories(flat); // speichere flat list für Lookup

      const categoryMap = new Map<string, Category>();
      const rootCategories: Category[] = [];

      flat.forEach((cat) => {
        categoryMap.set(cat.id, { ...cat, subcategories: [] });
      });

      categoryMap.forEach((cat) => {
        if (cat.parent_id) {
          const parent = categoryMap.get(cat.parent_id);
          if (parent) {
            parent.subcategories = parent.subcategories || [];
            parent.subcategories.push(cat);
          }
        } else {
          rootCategories.push(cat);
        }
      });

      setCategories(rootCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('stock_status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Kategorie-Name aus flat list holen ───────────────────────────────────────
  const getCatNames = (catId: string): string[] => {
    const cat = allCategories.find(c => c.id === catId);
    if (!cat) return [];
    return [cat.name_de, cat.name_fr, cat.name_ln].filter(Boolean);
  };

  // ── Alle Unterkategorie-IDs + Namen einer Elternkategorie ────────────────────
  const getSubcategoryData = (parentId: string): { ids: string[], names: string[] } => {
    const subs = allCategories.filter(c => c.parent_id === parentId);
    return {
      ids: subs.map(s => s.id),
      names: subs.flatMap(s => [s.name_de, s.name_fr, s.name_ln]).filter(Boolean),
    };
  };

  // ── Produkt matcht Kategorie wenn: ───────────────────────────────────────────
  // 1. category_id stimmt überein (für Produkte mit category_id)
  // 2. category String stimmt mit Kategorie-Name überein (für eBay-Imports)
  // 3. Bei Elternkategorie: auch Unterkategorien berücksichtigen
  const productMatchesCategory = (product: Product, categoryId: string): boolean => {
    // Direkt per category_id
    if (product.category_id === categoryId) return true;

    // Kategorie-Namen der gewählten Kategorie
    const catNames = getCatNames(categoryId);

    // Produktkategorie-Felder
    const productCatValues = [
      product.category,
      product.category_de,
      product.category_fr,
      product.category_ln,
    ].filter(Boolean).map(v => v!.toLowerCase().trim());

    // Direkt per Name
    if (catNames.some(name =>
      productCatValues.some(val => val === name.toLowerCase().trim() || val.includes(name.toLowerCase().trim()) || name.toLowerCase().trim().includes(val))
    )) return true;

    // Elternkategorie: auch Unterkategorien checken
    const { ids: subIds, names: subNames } = getSubcategoryData(categoryId);

    if (subIds.some(subId => product.category_id === subId)) return true;

    if (subNames.some(name =>
      productCatValues.some(val => val === name.toLowerCase().trim() || val.includes(name.toLowerCase().trim()))
    )) return true;

    return false;
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Suche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => {
        const searchFields = [
          p.name, p.name_de, p.name_fr, p.name_ln,
          p.description, p.description_de, p.description_fr, p.description_ln
        ].filter(Boolean);
        return searchFields.some(field => field?.toLowerCase().includes(query));
      });
    }

    // Kategorie-Filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => productMatchesCategory(p, selectedCategory));
    }

    // Sortierung
    switch (sortBy) {
      case 'price_low_high':
        filtered.sort((a, b) => a.sale_price - b.sale_price);
        break;
      case 'price_high_low':
        filtered.sort((a, b) => b.sale_price - a.sale_price);
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    setSelectedProductId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryName = (category: Category): string => {
    switch (language) {
      case 'de': return category.name_de;
      case 'fr': return category.name_fr;
      case 'ln': return category.name_ln;
      default: return category.name_de;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#0A5EB0] focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <Filter className="w-5 h-5" />
            <span>{t('categories')}</span>
          </button>
        </div>

        <div className={`mt-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-[#1C1C1C] mb-3">
                {t('categories')}
              </label>
              <div className="space-y-2">
                {/* Alle Kategorien */}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-2 ${
                    selectedCategory === 'all'
                      ? 'bg-[#0A5EB0] text-white'
                      : 'bg-[#E5E5E5] text-[#1C1C1C] hover:bg-[#F4B400] hover:text-[#1C1C1C]'
                  }`}
                >
                  {getIconComponent('package') && React.createElement(getIconComponent('package'), { className: 'w-4 h-4' })}
                  <span className="flex-1 text-left">{t('all_categories') || 'Alle Kategorien'}</span>
                </button>

                {categories.map((cat) => {
                  const Icon = getIconComponent(cat.icon);
                  const isExpanded = expandedCategories.has(cat.id);
                  const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;

                  return (
                    <div key={cat.id} className="space-y-1">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition flex items-center space-x-2 ${
                            selectedCategory === cat.id
                              ? 'bg-[#0A5EB0] text-white'
                              : 'bg-[#E5E5E5] text-[#1C1C1C] hover:bg-[#F4B400] hover:text-[#1C1C1C]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="flex-1 text-left">{getCategoryName(cat)}</span>
                        </button>
                        {hasSubcategories && (
                          <button
                            onClick={() => toggleCategory(cat.id)}
                            className="px-2 py-2 hover:bg-[#E5E5E5] rounded-lg transition"
                          >
                            {isExpanded
                              ? <ChevronUp className="w-4 h-4 text-[#1C1C1C]" />
                              : <ChevronDown className="w-4 h-4 text-[#1C1C1C]" />
                            }
                          </button>
                        )}
                      </div>

                      {hasSubcategories && isExpanded && (
                        <div className="ml-6 space-y-1">
                          {cat.subcategories!.map((subcat) => {
                            const SubIcon = getIconComponent(subcat.icon);
                            return (
                              <button
                                key={subcat.id}
                                onClick={() => setSelectedCategory(subcat.id)}
                                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-2 ${
                                  selectedCategory === subcat.id
                                    ? 'bg-[#0099CC] text-white'
                                    : 'bg-white border border-[#E5E5E5] text-[#1C1C1C] hover:bg-[#F4B400] hover:text-[#1C1C1C]'
                                }`}
                              >
                                <SubIcon className="w-4 h-4" />
                                <span className="flex-1 text-left">{getCategoryName(subcat)}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="md:w-48">
              <label className="block text-sm font-bold text-[#1C1C1C] mb-2">
                {t('sort_by')}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#0A5EB0] focus:border-transparent"
              >
                <option value="newest">{t('newest')}</option>
                <option value="price_low_high">{t('price_low_high')}</option>
                <option value="price_high_low">{t('price_high_low')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#0A5EB0] border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">{t('no_products')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={setSelectedProductId}
              onAuthRequired={() => setShowAuthModal(true)}
              onCartOpen={onCartOpen}
              onCategoryFilter={handleCategoryFilter}
            />
          ))}
        </div>
      )}

      {selectedProductId && (
        <ProductDetail
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
          onCategoryFilter={handleCategoryFilter}
        />
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

