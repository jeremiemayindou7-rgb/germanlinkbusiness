import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Star, MessageCircle, Send, Lock, ExternalLink, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';
import { supabase } from '../lib/supabase';
import { chatWithProduct } from '../lib/openai';
import { initializeOpenAI } from '../lib/openai';
import { AuthModal } from './AuthModal';

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
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onClose }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addToCart } = useCart();
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
  const [addingToCart, setAddingToCart] = useState(false);
  const [showCartAdded, setShowCartAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // ── eBay Anfrage-Formular State ──
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

  const loadOpenAIKey = async () => {
    try {
      const { data } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'openai_api_key')
        .maybeSingle();
      if (data?.value) initializeOpenAI(data.value);
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const fetchProductDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setReviews(data || []);
      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchChatHistory = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('product_chats')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setChatMessages(data.messages || []);
        setQuestionCount(data.question_count || 0);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
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
      const { data: existingChat } = await supabase
        .from('product_chats').select('id')
        .eq('product_id', productId).eq('user_id', user.id).maybeSingle();
      if (existingChat) {
        await supabase.from('product_chats').update({ messages: updatedMessages, question_count: updatedCount }).eq('id', existingChat.id);
      } else {
        await supabase.from('product_chats').insert({ product_id: productId, user_id: user.id, messages: updatedMessages, question_count: updatedCount });
      }
      setChatMessages(updatedMessages);
      setQuestionCount(updatedCount);
      setUserQuestion('');
    } catch (error: any) {
      alert(error.message || 'Erreur lors de l\'envoi de la question');
    } finally {
      setChatLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;
    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        user_id: user.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        reviewer_name: reviewForm.reviewer_name || 'Anonyme',
      });
      if (error) throw error;
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: '', reviewer_name: '' });
      fetchReviews();
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la publication de l\'avis');
    }
  };

  const handleAddToCart = async () => {
    if (!user) { setShowAuthModal(true); return; }
    if (!product) return;
    setAddingToCart(true);
    try {
      await addToCart(product.id);
      setShowCartAdded(true);
      setTimeout(() => setShowCartAdded(false), 3000);
    } catch (error: any) {
      alert(error.message || 'Erreur lors de l\'ajout au panier');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user) { setShowAuthModal(true); return; }
    if (!messageText.trim()) return;
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: user.id,
        product_id: productId,
        type: 'message',
        message: messageText,
        read: false,
      });
      if (error) throw error;
      setMessageText('');
      setShowMessageSent(true);
      setTimeout(() => setShowMessageSent(false), 3000);
    } catch (error: any) {
      alert(error.message || 'Erreur lors de l\'envoi du message');
    }
  };

  // ── eBay Anfrage absenden ──
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
    } catch (error: any) {
      alert(error.message || 'Fehler beim Senden der Anfrage');
    } finally {
      setQuoteLoading(false);
    }
  };

  // ── Badge je source_type ──
  const SourceBadge = () => {
    if (!product) return null;
    const badges = {
      own:    { label: 'GLB Produkt',    color: 'bg-[#0A5EB0] text-white' },
      vendor: { label: 'Händler',         color: 'bg-[#00A86B] text-white' },
      ebay:   { label: 'eBay – Anfrage nötig', color: 'bg-orange-500 text-white' },
    };
    const b = badges[product.source_type] || badges.own;
    return (
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${b.color}`}>
        {b.label}
      </span>
    );
  };

  // ── Aktions-Buttons je source_type ──
  const ActionButtons = () => {
    if (!product) return null;

    if (product.source_type === 'ebay') {
      return (
        <div className="space-y-3">
          {product.ebay_url && (
            <a
              href={product.ebay_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-orange-400 text-orange-500 rounded-lg font-bold hover:bg-orange-50 transition"
            >
              <ExternalLink className="w-5 h-5" />
              {t('view_on_ebay')}
            </a>
          )}

          {quoteSent ? (
            <div className="bg-green-50 border border-green-300 text-green-700 rounded-lg p-4 text-center font-bold">
              ✅ {t('quote_sent_success')}
            </div>
          ) : (
            <button
              onClick={() => setShowQuoteForm(!showQuoteForm)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition shadow-md"
            >
              <FileText className="w-5 h-5" />
              {t('request_quote')}
            </button>
          )}

          {showQuoteForm && !quoteSent && (
            <div className="border-2 border-orange-200 rounded-xl p-4 space-y-3 bg-orange-50">
              <h4 className="font-bold text-[#1C1C1C]">{t('quote_form_title')}</h4>
              <input
                type="text"
                placeholder={t('quote_name_placeholder')}
                value={quoteForm.customer_name}
                onChange={e => setQuoteForm({ ...quoteForm, customer_name: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-orange-400 text-sm"
              />
              <input
                type="tel"
                placeholder={t('quote_phone_placeholder')}
                value={quoteForm.customer_phone}
                onChange={e => setQuoteForm({ ...quoteForm, customer_phone: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-orange-400 text-sm"
              />
              <input
                type="text"
                placeholder={t('quote_location_placeholder')}
                value={quoteForm.customer_location}
                onChange={e => setQuoteForm({ ...quoteForm, customer_location: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-orange-400 text-sm"
              />
              <input
                type="number"
                placeholder={t('quote_price_placeholder')}
                value={quoteForm.price_proposal}
                onChange={e => setQuoteForm({ ...quoteForm, price_proposal: e.target.value })}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-orange-400 text-sm"
              />
              <textarea
                placeholder={t('quote_message_placeholder')}
                value={quoteForm.message}
                onChange={e => setQuoteForm({ ...quoteForm, message: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-orange-400 text-sm resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitQuote}
                  disabled={quoteLoading}
                  className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition disabled:opacity-50"
                >
                  {quoteLoading ? t('quote_sending') : t('quote_submit')}
                </button>
                <button
                  onClick={() => setShowQuoteForm(false)}
                  className="flex-1 py-2 border border-[#E5E5E5] rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition"
                >
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
        {showCartAdded && (
          <div className="bg-[#00A86B] bg-opacity-10 text-[#00A86B] border border-[#00A86B] p-3 rounded-lg text-sm mb-3 font-bold">
            {t('added_to_cart') || 'Produit ajouté au panier!'}
          </div>
        )}
        <button
          onClick={handleAddToCart}
          disabled={addingToCart}
          className="w-full flex items-center justify-center space-x-2 py-3 bg-[#F4B400] hover:bg-[#FF6F00] rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed text-[#1C1C1C] shadow-md hover:shadow-lg"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{addingToCart ? t('adding_to_cart') : t('add_to_cart')}</span>
        </button>

        {user && (
          <button
            onClick={() => setShowChat(!showChat)}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-[#0A5EB0] hover:bg-[#00A86B] text-white rounded-lg font-bold transition shadow-md hover:shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{t('ask_question')}</span>
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0A5EB0] border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">{t('product_details')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Bild */}
            <div>
              <div className="relative pb-[100%] bg-gray-200 rounded-lg overflow-hidden mb-4">
                {product.image_url && !imageError ? (
                  <img src={product.image_url} alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={() => setImageError(true)} />
                ) : imageError ? (
                  <img src={fallbackImage} alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShoppingCart className="w-20 h-20 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Infos */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-sm text-[#0099CC] uppercase font-bold tracking-wide">{t(product.category)}</span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-[#F4B400] font-bold bg-[#F4B400] bg-opacity-10 px-2 py-1 rounded">{t(product.condition)}</span>
                <SourceBadge />
              </div>

              <h1 className="text-3xl font-bold text-[#1C1C1C] mb-4">{product.name}</h1>

              {averageRating > 0 && (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-5 h-5 ${star <= averageRating ? 'fill-[#FBDE4A] text-[#FBDE4A]' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{averageRating} ({reviews.length} {t('reviews')})</span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-[#1C1C1C] mb-2">{t('description')}</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>

              {/* Nachricht schreiben – nur für own/vendor */}
              {product.source_type !== 'ebay' && (
                <div className="mb-6 bg-[#E5E5E5] bg-opacity-30 border border-[#E5E5E5] rounded-lg p-4">
                  <h3 className="text-lg font-bold text-[#1C1C1C] mb-3">{t('write_message')}</h3>
                  {!user && (
                    <div className="bg-[#F4B400] bg-opacity-10 border border-[#F4B400] rounded-lg p-3 mb-3 text-sm">
                      <div className="flex items-start space-x-2 mb-2">
                        <Lock className="w-5 h-5 text-[#1C1C1C] flex-shrink-0 mt-0.5" />
                        <span className="text-[#1C1C1C] font-bold">{t('login_anti_spam')}</span>
                      </div>
                    </div>
                  )}
                  {showMessageSent && (
                    <div className="bg-[#00A86B] bg-opacity-10 text-[#00A86B] border border-[#00A86B] p-3 rounded-lg text-sm mb-3 font-bold">
                      {t('message_sent_success')}
                    </div>
                  )}
                  <div className="space-y-2">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={t('message_placeholder')}
                      rows={3}
                      disabled={!user}
                      className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#0A5EB0] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="w-full flex items-center justify-center space-x-2 py-3 bg-[#F4B400] hover:bg-[#FF6F00] rounded-lg font-bold transition text-[#1C1C1C]"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{t('send_message')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Preis */}
              <div className="text-4xl font-bold text-[#00A86B] mb-6">
                {product.source_type === 'ebay'
                  ? <span className="text-2xl text-orange-500">{t('price_on_request')}</span>
                  : `${product.sale_price.toFixed(2)} €`
                }
              </div>

              {/* Aktions-Buttons */}
              <ActionButtons />

              {/* AI Chat – nur für own/vendor */}
              {product.source_type !== 'ebay' && showChat && user && (
                <div className="mt-4 border-2 border-[#0A5EB0] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-[#1C1C1C]">{t('chat_with_ai')}</h3>
                    <span className="text-sm text-[#0099CC] font-medium">
                      {t('questions_remaining').replace('{count}', String(3 - questionCount))}
                    </span>
                  </div>
                  <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-[#0A5EB0] text-white ml-8' : 'bg-[#E5E5E5] text-[#1C1C1C] mr-8'}`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                  {questionCount < 3 ? (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={userQuestion}
                        onChange={(e) => setUserQuestion(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                        placeholder={t('type_your_question')}
                        disabled={chatLoading}
                        className="flex-1 px-4 py-2 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#0A5EB0]"
                      />
                      <button
                        onClick={handleAskQuestion}
                        disabled={chatLoading || !userQuestion.trim()}
                        className="px-4 py-2 bg-[#0A5EB0] hover:bg-[#00A86B] text-white rounded-lg transition disabled:opacity-50 font-bold"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { const msg = encodeURIComponent(`Bonjour, j'ai des questions sur le produit: ${product.name}`); window.open(`https://wa.me/?text=${msg}`, '_blank'); }}
                      className="w-full py-3 bg-[#DC241F] hover:bg-[#b51d19] text-white rounded-lg font-medium transition"
                    >
                      {t('contact_support')}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-[#1C1C1C]">{t('reviews')} ({reviews.length})</h3>
              {user && !showReviewForm && (
                <button onClick={() => setShowReviewForm(true)}
                  className="px-4 py-2 bg-[#F4B400] hover:bg-[#0A5EB0] hover:text-white rounded-lg font-bold transition text-[#1C1C1C]">
                  {t('add_review')}
                </button>
              )}
            </div>

            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="bg-[#E5E5E5] bg-opacity-30 p-4 rounded-lg mb-6 border border-[#E5E5E5]">
                <div className="mb-3">
                  <label className="block text-sm font-bold text-[#1C1C1C] mb-2">{t('your_rating')}</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: star })} className="focus:outline-none">
                        <Star className={`w-8 h-8 ${star <= reviewForm.rating ? 'fill-[#FBDE4A] text-[#FBDE4A]' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-bold text-[#1C1C1C] mb-1">{t('your_review')}</label>
                  {/* ✅ FIX 3: resize-none hinzugefügt */}
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#0A5EB0] resize-none"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-bold text-[#1C1C1C] mb-1">{t('your_name_optional')}</label>
                  <input type="text" value={reviewForm.reviewer_name} onChange={(e) => setReviewForm({ ...reviewForm, reviewer_name: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#0A5EB0]" />
                </div>
                <div className="flex space-x-2">
                  <button type="submit" className="flex-1 py-2 bg-[#0A5EB0] hover:bg-[#00A86B] text-white rounded-lg font-bold transition">{t('submit_review')}</button>
                  <button type="button" onClick={() => setShowReviewForm(false)} className="flex-1 py-2 bg-[#E5E5E5] hover:bg-[#1C1C1C] hover:text-white rounded-lg font-medium transition">{t('cancel')}</button>
                </div>
              </form>
            )}

            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t('no_reviews')}</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-[#FBDE4A] text-[#FBDE4A]' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="font-medium text-gray-900">{review.reviewer_name || 'Anonyme'}</span>
                      </div>
                      <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    {review.comment && <p className="text-gray-600">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

