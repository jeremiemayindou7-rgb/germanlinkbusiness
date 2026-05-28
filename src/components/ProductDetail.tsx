import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Star, MessageCircle, Send, Lock, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { chatWithProduct } from '../lib/openai';
import { initializeOpenAI } from '../lib/openai';
import { AuthModal } from './AuthModal';
import { CheckoutModal } from './CheckoutModal';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  sale_price: number;
  condition: string;
  image_url: string;
  stock_status: string;
  source_type: 'own' | 'ebay' | 'vendor';
  ebay_url?: string;
  seller_id?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewer_name: string;
  created_at: string;
}

interface ChatMessage {
  role: string;
  content: string;
  timestamp: number;
}

interface ProductDetailProps {
  productId: string;
  onClose: () => void;
  onCategoryFilter?: (category: string) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onClose }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [userQuestion, setUserQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showMessageSent, setShowMessageSent] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_location: '',
    message: '',
    price_proposal: '',
  });
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);

  const fallbackImage = 'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg';

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    reviewer_name: '',
  });

  useEffect(() => {
    fetchProductDetails();
    fetchReviews();
    if (user) {
      fetchChatHistory();
      loadOpenAIKey();
    }
  }, [productId, user]);

  const fetchSimilarProducts = async (category: string) => {
    const { data } = await supabase
      .from('products')
      .select('id, name, name_fr, name_de, sale_price, image_url, source_type')
      .eq('stock_status', 'available')
      .eq('category', category)
      .neq('id', productId)
      .limit(3);
    setSimilarProducts(data || []);
  };

  const loadOpenAIKey = async () => {
    try {
      const { data } = await supabase.from('admin_settings').select('value').eq('key', 'openai_api_key').maybeSingle();
      if (data?.value) initializeOpenAI(data.value);
    } catch (error) { console.error('Error loading API key:', error); }
  };

  const fetchProductDetails = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
      if (error) throw error;
      setProduct(data);
      if (data?.category) fetchSimilarProducts(data.category);
    } catch (error) { console.error('Error fetching product:', error); }
    finally { setLoading(false); }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false });
      if (error) throw error;
      setReviews(data || []);
      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (error) { console.error('Error fetching reviews:', error); }
  };

  const fetchChatHistory = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('product_chats').select('*').eq('product_id', productId).eq('user_id', user.id).maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) { setChatMessages(data.messages || []); setQuestionCount(data.question_count || 0); }
    } catch (error) { console.error('Error fetching chat history:', error); }
  };

  const handleAskQuestion = async () => {
    if (!userQuestion.trim() || !product || !user) return;
    if (questionCount >= 3) {
      const whatsappMsg = encodeURIComponent(`Bonjour, j'ai des questions sur le produit: ${product.name}`);
      window.open(`https://wa.me/?text=${whatsappMsg}`, '_blank');
      return;
    }
    setChatLoading(true);
    try {
      const newUserMessage: ChatMessage = { role: 'user', content: userQuestion, timestamp: Date.now() };
      const response = await chatWithProduct(product.name, product.description || '', chatMessages, userQuestion);
      const newAssistantMessage: ChatMessage = { role: 'assistant', content: response, timestamp: Date.now() };
      const updatedMessages = [...chatMessages, newUserMessage, newAssistantMessage];
      const updatedCount = questionCount + 1;
      const { data: existingChat } = await supabase.from('product_chats').select('id').eq('product_id', productId).eq('user_id', user.id).maybeSingle();
      if (existingChat) {
        await supabase.from('product_chats').update({ messages: updatedMessages, question_count: updatedCount }).eq('id', existingChat.id);
      } else {
        await supabase.from('product_chats').insert({ product_id: productId, user_id: user.id, messages: updatedMessages, question_count: updatedCount });
      }
      setChatMessages(updatedMessages);
      setQuestionCount(updatedCount);
      setUserQuestion('');
    } catch (error: any) { alert(error.message || 'Erreur'); }
    finally { setChatLoading(false); }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: productId, user_id: user.id, rating: reviewForm.rating,
        comment: reviewForm.comment, reviewer_name: reviewForm.reviewer_name || 'Anonyme',
      });
      if (error) throw error;
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: '', reviewer_name: '' });
      fetchReviews();
    } catch (error: any) { alert(error.message); }
  };

  const handleSendMessage = async () => {
    if (!user) { setShowAuthModal(true); return; }
    if (!messageText.trim()) return;
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: user.id, product_id: productId, type: 'message', message: messageText, read: false,
      });
      if (error) throw error;
      setMessageText('');
      setShowMessageSent(true);
      setTimeout(() => setShowMessageSent(false), 3000);
    } catch (error: any) { alert(error.message); }
  };

  const handleSubmitQuote = async () => {
    if (!quoteForm.customer_name || !quoteForm.customer_phone) {
      alert('Bitte Name und Telefonnummer angeben.');
      return;
    }
    setQuoteLoading(true);
    try {
      const { error } = await supabase.from('quote_requests').insert({
        product_id: productId,
        customer_name: quoteForm.customer_name,
        customer_phone: quoteForm.customer_phone,
        customer_location: quoteForm.customer_location || null,
        message: quoteForm.message || null,
        price_proposal: quoteForm.price_proposal ? parseFloat(quoteForm.price_proposal) : null,
        status: 'pending',
      });
      if (error) throw error;
      setQuoteSent(true);
      setShowQuoteForm(false);
    } catch (error: any) { alert(error.message); }
    finally { setQuoteLoading(false); }
  };

  const SourceBadge = () => {
    if (!product) return null;
    const badges = {
      own:    { label: 'GLB Produkt', color: 'bg-[#0A5EB0] text-white' },
      vendor: { label: 'Händler',     color: 'bg-[#00A86B] text-white' },
      ebay:   { label: 'eBay Import', color: 'bg-orange-500 text-white' },
    };
    const b = badges[product.source_type] || badges.own;
    return <span className={`text-xs font-bold px-2 py-1 rounded-full ${b.color}`}>{b.label}</span>;
  };

  const ActionButtons = () => {
    if (!product) return null;
    if (product.source_type === 'ebay') {
      return (
        <div className="space-y-3">
          {quoteSent ? (
            <div className="bg-green-50 border border-green-300 text-green-700 rounded-lg p-4 text-center font-bold text-sm">
              ✅ {t('quote_sent_success')}
            </div>
          ) : (
            <button
              onClick={() => setShowQuoteForm(!showQuoteForm)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition text-sm"
            >
              <FileText className="w-4 h-4" />
              {language === 'de' ? 'Preis mit Lieferung erhalten'
                : language === 'ln' ? 'Zwa prix na livraison'
                : 'Obtenir le prix avec livraison'}
            </button>
          )}
          {showQuoteForm && !quoteSent && (
            <div className="border-2 border-orange-200 rounded-xl p-3 space-y-2 bg-orange-50">
              <h4 className="font-bold text-[#1C1C1C] text-sm">{t('quote_form_title')}</h4>
              {[
                { ph: t('quote_name_placeholder'),     key: 'customer_name',     type: 'text'   },
                { ph: t('quote_phone_placeholder'),    key: 'customer_phone',    type: 'tel'    },
                { ph: t('quote_location_placeholder'), key: 'customer_location', type: 'text'   },
                { ph: t('quote_price_placeholder'),    key: 'price_proposal',    type: 'number' },
              ].map(f => (
                <input key={f.key} type={f.type} placeholder={f.ph}
                  value={quoteForm[f.key as keyof typeof quoteForm]}
                  onChange={e => setQuoteForm({ ...quoteForm, [f.key]: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm" />
              ))}
              <textarea placeholder={t('quote_message_placeholder')} value={quoteForm.message}
                onChange={e => setQuoteForm({ ...quoteForm, message: e.target.value })}
                rows={2} className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm resize-none" />
              <div className="flex gap-2">
                <button onClick={handleSubmitQuote} disabled={quoteLoading}
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg font-bold text-sm disabled:opacity-50">
                  {quoteLoading ? t('quote_sending') : t('quote_submit')}
                </button>
                <button onClick={() => setShowQuoteForm(false)}
                  className="flex-1 py-2 border border-[#E5E5E5] rounded-lg font-bold text-sm text-gray-600">
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <button
          onClick={() => {
            if (!user) { setShowAuthModal(true); return; }
            setShowCheckout(true);
          }}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#009543] hover:bg-[#007a36] text-white rounded-lg font-bold transition text-sm shadow-md"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{language === 'de' ? 'Commander' : language === 'ln' ? 'Singa' : 'Commander'}</span>
        </button>
        {user && (
          <button onClick={() => setShowChat(!showChat)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#0A5EB0] hover:bg-[#00A86B] text-white rounded-lg font-bold transition text-sm">
            <MessageCircle className="w-5 h-5" />
            <span>{t('ask_question')}</span>
          </button>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0A5EB0] border-t-transparent mx-auto"></div>
      </div>
    </div>
  );

  if (!product) return null;

  return (
    <>
      {/*
        OVERLAY: covers full screen.
        Modal is centered with margin, pushed UP by 4rem on mobile
        so it sits above the bottom nav (h-16 = 4rem).
        On desktop (md+) no bottom nav exists so mb-0.
      */}
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-3 py-3 pb-20 md:pb-3">
        <div className="bg-white w-full max-w-4xl rounded-2xl flex flex-col max-h-full overflow-hidden">

          {/* ── Sticky header ── */}
          <div className="flex-shrink-0 border-b px-4 py-3 flex items-center justify-between">
            <h2 className="text-base sm:text-xl font-bold text-gray-900 truncate pr-4">{t('product_details')}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Scrollable body ── */}
          <div className="overflow-y-auto flex-1">
            <div className="p-3 sm:p-6">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">

                {/* Bild */}
                <div>
                  <div className="relative pb-[75%] sm:pb-[100%] bg-gray-200 rounded-lg overflow-hidden mb-3">
                    {product.image_url && !imageError ? (
                      <img src={product.image_url} alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={() => setImageError(true)} />
                    ) : (
                      <img src={fallbackImage} alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover" />
                    )}
                  </div>
                </div>

                {/* Infos */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs text-[#0099CC] uppercase font-bold">{t(product.category)}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-[#F4B400] font-bold bg-[#F4B400] bg-opacity-10 px-2 py-0.5 rounded">{t(product.condition)}</span>
                    <SourceBadge />
                  </div>

                  <h1 className="text-lg sm:text-2xl font-bold text-[#1C1C1C] mb-2 sm:mb-3 leading-tight">{product.name}</h1>

                  {averageRating > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} className={`w-4 h-4 ${star <= averageRating ? 'fill-[#FBDE4A] text-[#FBDE4A]' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">{averageRating} ({reviews.length})</span>
                    </div>
                  )}

                  <div className="mb-3 sm:mb-4">
                    <h3 className="text-sm font-bold text-[#1C1C1C] mb-1">{t('description')}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 sm:line-clamp-none">{product.description}</p>
                  </div>

                  <div className="text-2xl sm:text-3xl font-bold text-[#00A86B] mb-3 sm:mb-4">
                    {product.sale_price > 0
                      ? `${product.sale_price.toFixed(2)} €`
                      : <span className="text-xl text-gray-400">–</span>}
                    {product.source_type === 'ebay' && (
                      <span className="block text-xs text-orange-500 font-normal mt-0.5">GLB-Preis inkl. 20% Aufschlag</span>
                    )}
                  </div>

                  <ActionButtons />

                  {product.source_type !== 'ebay' && (
                    <div className="mt-3 sm:mt-4 bg-gray-50 border border-[#E5E5E5] rounded-lg p-3">
                      <h3 className="text-sm font-bold text-[#1C1C1C] mb-2">{t('write_message')}</h3>
                      {!user && (
                        <div className="bg-[#F4B400] bg-opacity-10 border border-[#F4B400] rounded-lg p-2 mb-2 text-xs">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-[#1C1C1C] flex-shrink-0" />
                            <span className="text-[#1C1C1C] font-bold">{t('login_anti_spam')}</span>
                          </div>
                        </div>
                      )}
                      {showMessageSent && (
                        <div className="bg-[#00A86B] bg-opacity-10 text-[#00A86B] border border-[#00A86B] p-2 rounded-lg text-xs mb-2 font-bold">
                          {t('message_sent_success')}
                        </div>
                      )}
                      <textarea value={messageText} onChange={e => setMessageText(e.target.value)}
                        placeholder={t('message_placeholder')} rows={2} disabled={!user}
                        className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg disabled:bg-gray-100 resize-none text-sm mb-2" />
                      <button onClick={handleSendMessage}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#F4B400] hover:bg-[#FF6F00] rounded-lg font-bold transition text-[#1C1C1C] text-sm">
                        <MessageCircle className="w-4 h-4" />
                        <span>{t('send_message')}</span>
                      </button>
                    </div>
                  )}

                  {product.source_type !== 'ebay' && showChat && user && (
                    <div className="mt-3 border-2 border-[#0A5EB0] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-[#1C1C1C] text-sm">{t('chat_with_ai')}</h3>
                        <span className="text-xs text-[#0099CC] font-medium">
                          {t('questions_remaining').replace('{count}', String(3 - questionCount))}
                        </span>
                      </div>
                      <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
                        {chatMessages.map((msg, idx) => (
                          <div key={idx} className={`p-2 rounded-lg text-xs ${msg.role === 'user' ? 'bg-[#0A5EB0] text-white ml-4' : 'bg-[#E5E5E5] text-[#1C1C1C] mr-4'}`}>
                            {msg.content}
                          </div>
                        ))}
                      </div>
                      {questionCount < 3 ? (
                        <div className="flex gap-2">
                          <input type="text" value={userQuestion} onChange={e => setUserQuestion(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleAskQuestion()}
                            placeholder={t('type_your_question')} disabled={chatLoading}
                            className="flex-1 px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm" />
                          <button onClick={handleAskQuestion} disabled={chatLoading || !userQuestion.trim()}
                            className="px-3 py-2 bg-[#0A5EB0] text-white rounded-lg disabled:opacity-50">
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => { const msg = encodeURIComponent(`Bonjour, questions sur: ${product.name}`); window.open(`https://wa.me/?text=${msg}`, '_blank'); }}
                          className="w-full py-2 bg-[#DC241F] text-white rounded-lg text-sm font-medium">
                          {t('contact_support')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {product.source_type === 'ebay' && similarProducts.length > 0 && (
                <div className="border-t pt-4 mb-4">
                  <h3 className="text-base font-bold text-[#1C1C1C] mb-3">
                    {language === 'de' ? 'Ähnliche Produkte' : language === 'ln' ? 'Biloko ya ndenge moko' : 'Produits similaires'}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {similarProducts.map(p => {
                      const name = p[`name_${language}`] || p.name;
                      return (
                        <div key={p.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:border-[#0A5EB0] transition">
                          <div className="relative pb-[75%] bg-gray-100">
                            <img src={p.image_url || '/glblogo.png'} alt={name}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={e => (e.currentTarget.src = '/glblogo.png')} />
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">{name}</p>
                            <p className="text-xs font-bold text-[#0A5EB0] mt-1">{p.sale_price.toFixed(0)} €</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base sm:text-xl font-bold text-[#1C1C1C]">{t('reviews')} ({reviews.length})</h3>
                  {user && !showReviewForm && (
                    <button onClick={() => setShowReviewForm(true)}
                      className="px-3 py-1.5 bg-[#F4B400] rounded-lg font-bold transition text-[#1C1C1C] text-sm">
                      {t('add_review')}
                    </button>
                  )}
                </div>

                {showReviewForm && (
                  <form onSubmit={handleSubmitReview} className="bg-gray-50 p-3 rounded-lg mb-4 border border-[#E5E5E5]">
                    <div className="mb-3">
                      <label className="block text-sm font-bold text-[#1C1C1C] mb-1">{t('your_rating')}</label>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(star => (
                          <button key={star} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: star })}>
                            <Star className={`w-7 h-7 ${star <= reviewForm.rating ? 'fill-[#FBDE4A] text-[#FBDE4A]' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      rows={2} placeholder={t('your_review')}
                      className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm resize-none mb-2" />
                    <input type="text" value={reviewForm.reviewer_name}
                      onChange={e => setReviewForm({ ...reviewForm, reviewer_name: e.target.value })}
                      placeholder={t('your_name_optional')}
                      className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg text-sm mb-2" />
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 py-2 bg-[#0A5EB0] text-white rounded-lg font-bold text-sm">{t('submit_review')}</button>
                      <button type="button" onClick={() => setShowReviewForm(false)} className="flex-1 py-2 bg-[#E5E5E5] rounded-lg font-medium text-sm">{t('cancel')}</button>
                    </div>
                  </form>
                )}

                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-6 text-sm">{t('no_reviews')}</p>
                ) : (
                  <div className="space-y-3">
                    {reviews.map(review => (
                      <div key={review.id} className="border-b pb-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1,2,3,4,5].map(star => (
                                <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-[#FBDE4A] text-[#FBDE4A]' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <span className="font-medium text-sm text-gray-900">{review.reviewer_name || 'Anonyme'}</span>
                          </div>
                          <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        {review.comment && <p className="text-gray-600 text-sm">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>{/* end scrollable body */}
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      {showCheckout && product && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          singleProduct={{
            id: product.id,
            name: product.name,
            sale_price: product.sale_price,
            source_type: product.source_type,
          }}
        />
      )}
    </>
  );
};

