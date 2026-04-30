import React, { useState } from 'react';
import { ShoppingCart, MapPin, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
import { getProductField, getCategoryTranslation } from '../lib/translateProduct';

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
  sale_price: number;
  condition: string;
  image_url: string | null; // ← null erlaubt
  stock_status: string;
  source_type?: 'own' | 'ebay' | 'vendor'; // ← NEU für Badge
}

interface ProductCardProps {
  product: Product;
  onViewDetails?: (productId: string) => void;
  onAuthRequired?: () => void;
  onCartOpen?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onAuthRequired,
  onCartOpen
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [showAdded, setShowAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const productName = getProductField(product, 'name', language);

  // ── Bild-Logik: NULL oder kaputt → GLB Logo ──
  const fallbackImage = '/glblogo.png';
  const showFallback = !product.image_url || imageError;
  const imageSrc = showFallback ? fallbackImage : product.image_url!;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { onAuthRequired?.(); return; }
    setAdding(true);
    try {
      await addToCart(product.id);
      setShowAdded(true);
      setTimeout(() => {
        setShowAdded(false);
        onCartOpen?.();
      }, 800);
    } catch (error: any) {
      alert(error.message || 'Erreur lors de l\'ajout au panier');
    } finally {
      setAdding(false);
    }
  };

  const handleContactSeller = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { onAuthRequired?.(); return; }
    const message = encodeURIComponent(
      `Bonjour, je suis intéressé par: *${productName}* (${product.sale_price.toFixed(2)} €) sur GermanLink Business.`
    );
    window.open(`https://wa.me/4917622896160?text=${message}`, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-[#E5E5E5]">
      <div
        className="relative pb-[75%] bg-gray-100 cursor-pointer"
        onClick={() => onViewDetails?.(product.id)}
      >
        <img
          src={imageSrc}
          alt={productName}
          className={`absolute inset-0 w-full h-full transition-transform duration-300 hover:scale-105 ${
            showFallback
              ? 'object-contain p-6 opacity-70' // GLB Logo zentriert + etwas transparent
              : 'object-cover'
          }`}
          loading="lazy"
          onError={() => setImageError(true)} // ← kaputte URLs → Fallback
        />

        {/* Condition Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-[#F4B400] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            {t(product.condition)}
          </span>
        </div>

        {/* Source Badge – nur für eBay */}
        {product.source_type === 'ebay' && (
          <div className="absolute top-3 left-3">
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow">
              eBay
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3
          className="text-base font-semibold text-[#1C1C1C] mb-3 line-clamp-2 min-h-[3rem] cursor-pointer hover:text-[#0A5EB0] transition leading-snug"
          onClick={() => onViewDetails?.(product.id)}
        >
          {productName}
        </h3>

        <div className="flex items-center justify-between mb-3">
          <div className="text-2xl font-bold text-[#0A5EB0]">
            {product.source_type === 'ebay'
              ? <span className="text-lg text-orange-500">Auf Anfrage</span>
              : `${product.sale_price.toFixed(2)} €`
            }
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          <span>Kinshasa / Brazzaville</span>
        </div>

        {showAdded && (
          <div className="mb-3 bg-green-50 text-green-600 p-2 rounded-lg text-sm text-center font-medium">
            ✅ {t('added_to_cart') || 'Ajouté au panier!'}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleContactSeller}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t('contact_seller') || 'Contacter'}</span>
          </button>

          {/* eBay → "Anfragen", sonst → Warenkorb */}
          {product.source_type === 'ebay' ? (
            <button
              onClick={() => onViewDetails?.(product.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg"
            >
              <span>Anfragen</span>
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#FF6F00] hover:bg-[#E66000] text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{adding ? '...' : t('add_to_cart') || 'Acheter'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

