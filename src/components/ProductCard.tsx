import React, { useState } from 'react';
import { ShoppingCart, MapPin, MessageCircle, X, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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
  image_url: string | null;
  stock_status: string;
  source_type?: 'own' | 'ebay' | 'vendor';
}

interface ProductCardProps {
  product: Product;
  onViewDetails?: (productId: string) => void;
  onAuthRequired?: () => void;
  onCartOpen?: () => void;
  onCategoryFilter?: (category: string) => void;
}

interface QuoteFormProps {
  product: Product;
  productName: string;
  onClose: () => void;
  t: (k: string) => string;
}

const QuoteFormModal: React.FC<QuoteFormProps> = ({ product, productName, onClose, t }) => {
  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', customer_location: '', price_proposal: '', message: '',
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!form.customer_name || !form.customer_phone) {
      alert(t('quote_name_placeholder') + ' & ' + t('quote_phone_placeholder') + ' requis');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('quote_requests').insert({
        product_id: product.id,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_location: form.customer_location || null,
        price_proposal: form.price_proposal ? parseFloat(form.price_proposal) : null,
        message: form.message || null,
        status: 'pending',
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.65)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'0.75rem',paddingBottom:'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))'}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{background:'white',width:'100%',maxWidth:'24rem',display:'flex',flexDirection:'column',borderRadius:'1rem',maxHeight:'calc(100dvh - 144px)',overflow:'hidden'}}>

        {/* Header */}
        <div className="flex-shrink-0 bg-[#FF6F00] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="font-bold text-sm">{t('request_quote')}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollbarer Inhalt */}
        <div style={{overflowY:'auto',flex:1}}>
          {sent ? (
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Send className="w-7 h-7 text-green-600" />
              </div>
              <p className="font-bold text-gray-900 mb-1">{t('quote_sent_success')}</p>
              <p className="text-xs text-gray-500 mb-4">GLB vous contactera bientôt.</p>
              <button onClick={onClose} className="w-full py-2.5 bg-[#FF6F00] text-white rounded-xl font-bold text-sm">
                Fermer
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <p className="text-xs text-gray-500 font-medium truncate">📦 {productName}</p>
              <p className="text-xs font-bold text-gray-700">{t('quote_form_title')}</p>

              {[
                { key: 'customer_name',     type: 'text',   ph: `${t('quote_name_placeholder')} *`  },
                { key: 'customer_phone',    type: 'tel',    ph: `${t('quote_phone_placeholder')} *`  },
                { key: 'customer_location', type: 'text',   ph: t('quote_location_placeholder')       },
                { key: 'price_proposal',    type: 'number', ph: t('quote_price_placeholder')          },
              ].map(f => (
                <input key={f.key} type={f.type} placeholder={f.ph}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6F00]" />
              ))}
              <textarea placeholder={t('quote_message_placeholder')} value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6F00] resize-none" />

              <div className="flex gap-2 pt-1 pb-2">
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 py-2.5 bg-[#FF6F00] text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-1.5">
                  {loading ? '...' : <><Send className="w-3.5 h-3.5" />{t('quote_submit')}</>}
                </button>
                <button onClick={onClose}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-sm text-gray-600">
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product, onViewDetails, onAuthRequired, onCartOpen,
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [showAdded, setShowAdded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  const isEbay = product.source_type === 'ebay';
  const productName = (product[`name_${language}` as keyof Product] as string) || product.name || '';
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
      setTimeout(() => { setShowAdded(false); onCartOpen?.(); }, 800);
    } catch (error: any) {
      alert(error.message || 'Erreur lors de l\'ajout au panier');
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-[#E5E5E5]">
        <div className="relative pb-[75%] bg-gray-100 cursor-pointer" onClick={() => onViewDetails?.(product.id)}>
          <img src={imageSrc} alt={productName}
            className={`absolute inset-0 w-full h-full transition-transform duration-300 hover:scale-105 ${showFallback ? 'object-contain p-6 opacity-70' : 'object-cover'}`}
            loading="lazy" onError={() => setImageError(true)} />
          <div className="absolute top-3 right-3">
            <span className="bg-[#F4B400] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">{t(product.condition)}</span>
          </div>
          {isEbay && (
            <div className="absolute top-3 left-3">
              <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow">eBay</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-base font-semibold text-[#1C1C1C] mb-3 line-clamp-2 min-h-[3rem] cursor-pointer hover:text-[#0A5EB0] transition leading-snug"
            onClick={() => onViewDetails?.(product.id)}>{productName}</h3>

          <div className="flex items-center justify-between mb-3">
            <div className="text-2xl font-bold text-[#0A5EB0]">
              {product.sale_price > 0 ? `${product.sale_price.toFixed(2)} €` : <span className="text-lg text-gray-400">–</span>}
            </div>
            {isEbay && <span className="text-xs text-orange-500 font-semibold bg-orange-50 px-2 py-0.5 rounded-full">GLB-Preis</span>}
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-4">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span>Kinshasa / Brazzaville</span>
          </div>

          {showAdded && (
            <div className="mb-3 bg-green-50 text-green-600 p-2 rounded-lg text-sm text-center font-medium">
              ✅ {t('added_to_cart') || 'Ajouté au panier!'}
            </div>
          )}

          {isEbay ? (
            <button onClick={e => { e.stopPropagation(); setShowQuoteForm(true); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FF6F00] hover:bg-[#E66000] text-white rounded-lg font-bold text-sm transition shadow-md">
              <MessageCircle className="w-4 h-4" />
              <span>{t('contact_seller') || 'Contacter le vendeur'}</span>
            </button>
          ) : (
            <button onClick={handleAddToCart} disabled={adding}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#FF6F00] hover:bg-[#E66000] text-white rounded-lg font-bold text-sm transition disabled:opacity-50 shadow-md">
              <ShoppingCart className="w-4 h-4" />
              <span>{adding ? '...' : t('add_to_cart') || 'Ajouter au panier'}</span>
            </button>
          )}
        </div>
      </div>

      {showQuoteForm && (
        <QuoteFormModal product={product} productName={productName}
          onClose={() => setShowQuoteForm(false)} t={t} />
      )}
    </>
  );
};

