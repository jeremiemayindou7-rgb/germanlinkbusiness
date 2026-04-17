import { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, ExternalLink, MapPin, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { germanMarketplaceService, MarketplaceProduct, SearchFilters } from '../services/germanMarketplaceService';
import { useLanguage } from '../contexts/LanguageContext';

export default function MarketplaceSearch() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    condition: 'all',
    marketplace: 'all',
    sortBy: 'relevance'
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await germanMarketplaceService.searchAllMarketplaces(searchQuery, filters);
      setProducts(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, filters]);

  const getMarketplaceColor = (marketplace: MarketplaceProduct['marketplace']) => {
    const colors = {
      ebay: 'bg-yellow-500',
      kleinanzeigen: 'bg-green-500',
      amazon: 'bg-orange-500',
      rebuy: 'bg-blue-500',
      vinted: 'bg-teal-500'
    };
    return colors[marketplace];
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Suche nach Produkten auf deutschen Marktplätzen..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg flex items-center gap-2 transition ${
                showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter size={20} />
              <span>Filter</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zustand
                </label>
                <select
                  value={filters.condition || 'all'}
                  onChange={(e) => setFilters({ ...filters, condition: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alle</option>
                  <option value="new">Neu</option>
                  <option value="used">Gebraucht</option>
                  <option value="refurbished">Generalüberholt</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marktplatz
                </label>
                <select
                  value={filters.marketplace || 'all'}
                  onChange={(e) => setFilters({ ...filters, marketplace: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alle</option>
                  <option value="ebay">eBay.de</option>
                  <option value="kleinanzeigen">Kleinanzeigen.de</option>
                  <option value="amazon">Amazon.de</option>
                  <option value="rebuy">reBuy.de</option>
                  <option value="vinted">Vinted.de</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sortierung
                </label>
                <select
                  value={filters.sortBy || 'relevance'}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">Relevanz</option>
                  <option value="price_asc">Preis aufsteigend</option>
                  <option value="price_desc">Preis absteigend</option>
                  <option value="newest">Neueste zuerst</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preisbereich
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {isSearching && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!isSearching && products.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Keine Produkte gefunden</p>
            <p className="text-sm text-gray-500 mt-2">
              Versuchen Sie es mit anderen Suchbegriffen
            </p>
          </div>
        )}

        {!isSearching && products.length === 0 && !searchQuery && (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Deutsche Marktplätze durchsuchen
            </h2>
            <p className="text-gray-600">
              Suchen Sie nach Produkten auf eBay.de, Kleinanzeigen.de, Amazon.de und mehr
            </p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className={`w-12 h-12 ${getMarketplaceColor('ebay')} rounded-full mx-auto mb-2`}></div>
                <p className="text-sm font-medium">eBay.de</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className={`w-12 h-12 ${getMarketplaceColor('kleinanzeigen')} rounded-full mx-auto mb-2`}></div>
                <p className="text-sm font-medium">Kleinanzeigen</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className={`w-12 h-12 ${getMarketplaceColor('amazon')} rounded-full mx-auto mb-2`}></div>
                <p className="text-sm font-medium">Amazon.de</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className={`w-12 h-12 ${getMarketplaceColor('rebuy')} rounded-full mx-auto mb-2`}></div>
                <p className="text-sm font-medium">reBuy.de</p>
              </div>
              <div className="p-4 bg-teal-50 rounded-lg">
                <div className={`w-12 h-12 ${getMarketplaceColor('vinted')} rounded-full mx-auto mb-2`}></div>
                <p className="text-sm font-medium">Vinted.de</p>
              </div>
            </div>
          </div>
        )}

        {!isSearching && products.length > 0 && (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                <span className="font-semibold">{products.length}</span> Produkte gefunden
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {product.imageUrl && (
                    <div className="relative h-48 bg-gray-100">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute top-2 left-2 px-3 py-1 ${getMarketplaceColor(product.marketplace)} text-white text-xs font-semibold rounded-full`}>
                        {germanMarketplaceService.getMarketplaceName(product.marketplace)}
                      </div>
                      <div className="absolute top-2 right-2 px-3 py-1 bg-black bg-opacity-60 text-white text-xs font-semibold rounded-full">
                        {germanMarketplaceService.getConditionLabel(product.condition)}
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                      {product.title}
                    </h3>

                    {product.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin size={16} />
                      <span>{product.location}</span>
                    </div>

                    {product.seller && (
                      <div className="text-sm text-gray-600 mb-3">
                        Verkäufer: <span className="font-medium">{product.seller}</span>
                      </div>
                    )}

                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {formatPrice(product.price, product.currency)}
                          </div>
                          {product.shippingCost !== undefined && (
                            <div className="text-xs text-gray-500">
                              {product.shippingCost === 0 ? 'Versandkostenfrei' : `+ ${formatPrice(product.shippingCost, product.currency)} Versand`}
                            </div>
                          )}
                        </div>
                      </div>

                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                      >
                        <span>Zum Angebot</span>
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{products.length} Ergebnisse</span>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-blue-600 font-medium"
          >
            Filter anzeigen
          </button>
        </div>
      </div>
    </div>
  );
}
