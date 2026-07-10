import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ThumbsUp, ThumbsDown, Minimize2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { SYSTEM_PROMPT, APP_CONTEXT } from '../lib/chatbot-system-prompt';
import { detectLanguage, type SupportedLanguage } from '../lib/detectLanguage';
import { responses } from '../lib/chatbot-responses';
import { getProductField } from '../lib/translateProduct';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  productCard?: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

const CHATBOT_AVATAR_URL = "/glb_suport.png";

const QUICK_REPLIES = {
  de: [
    { text: '📦 Produkt suchen', value: 'Ich suche ein Produkt' },
    { text: '🚢 Lieferinformationen', value: 'Wie funktioniert die Lieferung?' },
    { text: '💳 Zahlung & Preise', value: 'Welche Zahlungsmöglichkeiten gibt es?' },
    { text: '📞 Kundenservice', value: 'Ich möchte mit dem Kundenservice sprechen' },
  ],
  fr: [
    { text: '📦 Chercher produit', value: 'Je cherche un produit' },
    { text: '🚢 Informations livraison', value: 'Comment fonctionne la livraison?' },
    { text: '💳 Paiement & Prix', value: 'Quelles sont les options de paiement?' },
    { text: '📞 Service client', value: 'Je veux parler au service client' },
  ],
  ln: [
    { text: '📦 Luka biloko', value: 'Nazali koluka biloko' },
    { text: '🚢 Makambo ya kokabola', value: 'Ndenge nini kokabola esalemaka?' },
    { text: '💳 Kofuta & Ntalo', value: 'Nini ba moyens ya kofuta?' },
    { text: '📞 Service client', value: 'Nalingi kosolola na service client' },
  ],
};

const WELCOME_MESSAGES = {
  de: 'Willkommen bei GermanLink Business! 👋\nIch helfe Ihnen bei Produktfragen, Bestellungen und Lieferinformationen.\nWie kann ich Ihnen heute helfen?',
  fr: 'Bienvenue sur GermanLink Business! 👋\nJe vous aide avec les questions sur les produits, les commandes et les informations de livraison.\nComment puis-je vous aider aujourd\'hui?',
  ln: 'Boyei malamu na GermanLink Business! 👋\nNakoki kosalisa yo mpo na mituna ya biloko, ba commandes mpe makambo ya livraison.\nNakoki kosalisa yo ndenge nini lelo?',
};

export const ChatBot: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [showProactive, setShowProactive] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [useRuleBasedFallback, setUseRuleBasedFallback] = useState(true);
  const [detectedLang, setDetectedLang] = useState<SupportedLanguage>('fr');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadChatHistory();
    fetchProducts();

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'undefined' || apiKey === '' || apiKey === 'your-openai-api-key-here') {
      console.warn('[ChatBot] ⚠️ No valid API key found — using rule-based fallback');
      setUseRuleBasedFallback(true);
    } else {
      console.log('[ChatBot] ✅ API key found — AI responses enabled');
      setUseRuleBasedFallback(false);
    }

    const proactiveTimer = setTimeout(() => {
      if (!isOpen && messages.length === 0) {
        setShowProactive(true);
        setTimeout(() => setShowProactive(false), 8000);
      }
    }, 15000);

    return () => clearTimeout(proactiveTimer);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addWelcomeMessage();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    saveChatHistory();
  }, [messages]);

  const loadChatHistory = () => {
    const stored = localStorage.getItem('chatbot_history');
    if (stored) {
      const { messages: savedMessages, timestamp } = JSON.parse(stored);
      const age = Date.now() - timestamp;
      if (age < 24 * 60 * 60 * 1000) {
        setMessages(savedMessages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })));
      } else {
        localStorage.removeItem('chatbot_history');
      }
    }
  };

  const saveChatHistory = () => {
    if (messages.length > 0) {
      localStorage.setItem('chatbot_history', JSON.stringify({
        messages,
        timestamp: Date.now(),
      }));
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, category, sale_price, image_url, stock_status')
        .eq('stock_status', 'available');

      if (error) throw error;
      setProducts(data || []);
      console.log('[ChatBot] Products loaded:', data?.length);
    } catch (error) {
      console.error('[ChatBot] Error fetching products:', error);
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMsg: Message = {
      id: `welcome_${Date.now()}`,
      role: 'assistant',
      content: WELCOME_MESSAGES[language as keyof typeof WELCOME_MESSAGES] || WELCOME_MESSAGES.de,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getRuleBasedResponse = (message: string, availableProducts: any[]): string => {
    const lang = detectLanguage(message);
    const msg = message.toLowerCase().trim();

    console.log('[ChatBot] Detected language:', lang, 'for message:', message);

    const greetings = [
      'hallo', 'guten', 'hi', 'hey',
      'bonjour', 'bonsoir', 'salut', 'merci',
      'hello', 'good', 'thanks',
      'mbote', 'malamu', 'ndeko'
    ];
    if (greetings.some(g => msg.includes(g))) {
      return responses.greeting[lang];
    }

    const foundProduct = availableProducts.find(p => {
      const searchFields = [
        p.name,
        p.name_de,
        p.name_fr,
        p.name_ln,
        p.description,
        p.description_de,
        p.description_fr,
        p.description_ln
      ].filter(Boolean).map((f: string) => f.toLowerCase());

      return searchFields.some(field =>
        field.includes(msg) ||
        field.split(' ').some((word: string) => word.length > 3 && msg.includes(word))
      );
    });

    if (foundProduct) {
      const productName = getProductField(foundProduct, 'name', lang);
      const productDesc = getProductField(foundProduct, 'description', lang);

      return responses.productFound[lang](
        productName,
        foundProduct.sale_price,
        productDesc || 'Hochwertige Qualität'
      );
    }

    if (['zahlung', 'preis', 'bezahl', 'paiement', 'prix', 'payment', 'mbongo', 'kofuta', 'ntalo'].some(w => msg.includes(w))) {
      return responses.payment[lang];
    }

    if (['liefer', 'versand', 'livraison', 'schiff', 'flug', 'delivery', 'ship', 'kotinda', 'kokabola', 'masuwa', 'ndeke'].some(w => msg.includes(w))) {
      return responses.delivery[lang];
    }

    if (['kontakt', 'telefon', 'email', 'hilfe', 'contact', 'aide', 'help', 'service', 'lisalisi', 'kosolola'].some(w => msg.includes(w))) {
      return responses.contact[lang];
    }

    if (['produkt', 'artikel', 'haben sie', 'avez vous', 'do you have', 'ozali na', 'eloko', 'suche', 'cherche', 'luka'].some(w => msg.includes(w))) {
      return responses.productNotFound[lang];
    }

    return responses.default[lang];
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isTyping) return;

    console.log('[ChatBot] User message:', messageText);

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const lang = detectLanguage(messageText);
    setDetectedLang(lang);
    console.log('[ChatBot] Language switched to:', lang);

    try {
      let botResponse: string;

      if (useRuleBasedFallback) {
        console.log('[ChatBot] Using rule-based fallback');
        await new Promise(resolve => setTimeout(resolve, 800));
        botResponse = getRuleBasedResponse(messageText, products);
      } else {
        console.log('[ChatBot] Using OpenAI API');
        const productContext = `
## VERFÜGBARE PRODUKTE IM KATALOG:
${products.map(p =>
  `- ${p.name}: ${p.sale_price}€ | ${p.description || 'Keine Beschreibung'} | Kategorie: ${p.category}`
).join('\n')}
`;

        const fullSystemPrompt = SYSTEM_PROMPT + '\n\n' + APP_CONTEXT + '\n\n' + productContext;

        const conversationHistory = messages.map(m => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: fullSystemPrompt },
              ...conversationHistory,
              { role: 'user', content: messageText },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        });

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          console.error('[ChatBot] API Error:', response.status, errBody);
          throw new Error(`API ${response.status}: ${errBody?.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        botResponse = data.choices[0].message.content;
      }

      console.log('[ChatBot] Bot response received');

      const productMatch = products.find(p =>
        botResponse.toLowerCase().includes(p.name.toLowerCase())
      );

      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: botResponse,
        timestamp: new Date(),
        productCard: productMatch ? {
          id: productMatch.id,
          name: productMatch.name,
          price: productMatch.sale_price,
          image: productMatch.image_url || '',
        } : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (botResponse.toLowerCase().includes('kundenservice') ||
          botResponse.toLowerCase().includes('service client') ||
          botResponse.toLowerCase().includes('info@germanlink')) {
        setUnansweredCount(prev => prev + 1);
      }

      if (unansweredCount >= 2) {
        setTimeout(() => {
          const contactMessage: Message = {
            id: `contact_${Date.now()}`,
            role: 'assistant',
            content: `Ich empfehle, direkt mit unserem Team zu sprechen:\n\n📧 E-Mail: info@germanlink.de\n📞 Telefon / WhatsApp: +49 176 22896160\n⏰ Mo–Fr, 9:00–18:00 Uhr (MEZ)`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, contactMessage]);
          setUnansweredCount(0);
        }, 1000);
      }

    } catch (err: any) {
      console.error('[ChatBot] Error type:', err?.constructor?.name);
      console.error('[ChatBot] Error message:', err?.message);
      console.error('[ChatBot] Full error:', err);

      let errorMsg = '';

      if (err?.message?.includes('401') || err?.message?.includes('API key')) {
        errorMsg = 'Konfigurationsfehler. Unser Team wurde benachrichtigt.';
        console.error('[ChatBot] ❌ MISSING OR INVALID API KEY');
      } else if (err?.message?.includes('429')) {
        errorMsg = 'Zu viele Anfragen. Bitte warten Sie kurz.';
      } else if (err?.message?.includes('network') || !navigator.onLine) {
        errorMsg = 'Keine Internetverbindung. Bitte prüfen Sie Ihre Verbindung.';
      } else {
        errorMsg = 'Kurze Störung. Bitte kontaktieren Sie uns direkt:';
      }

      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: `${errorMsg}\n\n📧 info@germanlink.de\n📱 +49 176 22896160`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFeedback = async (messageId: string, rating: 'positive' | 'negative') => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    try {
      await supabase.from('chat_feedback').insert({
        session_id: sessionId,
        user_id: user?.id || null,
        message: message.content,
        rating,
      });
      console.log('[ChatBot] Feedback submitted:', rating);
    } catch (error) {
      console.error('[ChatBot] Error submitting feedback:', error);
    }
  };

  const handleQuickReply = (value: string) => {
    handleSendMessage(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const quickReplies = QUICK_REPLIES[language as keyof typeof QUICK_REPLIES] || QUICK_REPLIES.de;

  if (!isOpen && showProactive) {
    return (
      <div className="fixed bottom-24 right-6 z-50 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-xs border-2 border-green-500">
          <button
            onClick={() => setShowProactive(false)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-gray-600"
          >
            ×
          </button>
          <p className="text-sm text-gray-700">
            👋 {language === 'de' ? 'Hallo! Suchen Sie ein bestimmtes Produkt?' :
                language === 'fr' ? 'Bonjour! Cherchez-vous un produit spécifique?' :
                'Mbote! Ozali koluka biloko moko?'}
          </p>
          <button
            onClick={() => {
              setShowProactive(false);
              setIsOpen(true);
            }}
            className="mt-2 w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-green-700 transition"
          >
            {language === 'de' ? 'Chat öffnen' : language === 'fr' ? 'Ouvrir le chat' : 'Fungola chat'}
          </button>
        </div>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl overflow-hidden border-2 border-white hover:scale-110 transition-transform z-50 animate-pulse-slow"
        aria-label="Chat öffnen"
      >
        <img
          src={CHATBOT_AVATAR_URL}
          alt="Chat"
          className="w-full h-full object-cover"
        />
      </button>
    );
  }

  const isMobile = window.innerWidth < 768;

  return (
    <div
      className={`fixed z-50 ${
        isMobile
          ? 'inset-0 bg-white'
          : isMinimized
          ? 'bottom-6 right-6 w-80'
          : 'bottom-6 right-6 w-96 h-[520px]'
      } rounded-2xl shadow-2xl flex flex-col ${isMinimized ? 'h-auto' : ''}`}
      style={{ maxHeight: isMobile ? '100vh' : '600px' }}
    >
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 flex items-center justify-between rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="relative">
            <img
              src={CHATBOT_AVATAR_URL}
              alt="GermanLink Business"
              className="w-10 h-10 rounded-full border-2 border-white object-cover bg-white"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-semibold text-sm">GermanLink Business</span>
            <span className="text-green-200 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Online
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white/20 p-2 rounded-lg transition"
            aria-label="Minimieren"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-2 rounded-lg transition"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div key={message.id}>
                <div
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-green-600 text-white rounded-2xl rounded-br-none'
                        : 'bg-white text-gray-800 rounded-2xl rounded-bl-none shadow-md border border-gray-200'
                    } px-4 py-3`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {message.productCard && (
                  <div className="ml-0 mt-2 max-w-[80%]">
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 flex items-center gap-3">
                      {message.productCard.image && (
                        <img
                          src={message.productCard.image}
                          alt={message.productCard.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{message.productCard.name}</p>
                        <p className="text-green-600 font-bold text-lg">
                          {message.productCard.price.toFixed(2)} €
                        </p>
                        <button className="mt-1 bg-green-600 text-white text-xs px-3 py-1 rounded hover:bg-green-700 transition">
                          Jetzt anfragen
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {message.role === 'assistant' && index > 0 && (
                  <div className="flex gap-2 mt-2 ml-0">
                    <button
                      onClick={() => handleFeedback(message.id, 'positive')}
                      className="text-gray-400 hover:text-green-600 transition"
                      aria-label="Hilfreich"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, 'negative')}
                      className="text-gray-400 hover:text-red-600 transition"
                      aria-label="Nicht hilfreich"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-none shadow-md border border-gray-200 px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {messages.length === 1 && messages[0].role === 'assistant' && (
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickReply(reply.value)}
                    className="bg-white border-2 border-green-600 text-green-600 px-3 py-2 rounded-lg text-xs hover:bg-green-50 transition"
                  >
                    {reply.text}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 500))}
                onKeyPress={handleKeyPress}
                placeholder={
                  detectedLang === 'de' ? 'Ihre Frage...' :
                  detectedLang === 'en' ? 'Your question...' :
                  detectedLang === 'ln' ? 'Motuna na yo...' :
                  'Votre question...'
                }
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                maxLength={500}
                disabled={isTyping}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isTyping}
                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Senden"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {input.length > 0 && (
              <p className="text-xs text-gray-500 mt-1 text-right">
                {input.length}/500
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2 text-center">
              Powered by GermanLink Business
            </p>
          </div>
        </>
      )}

      {isMinimized && (
        <div className="p-3 bg-white rounded-b-2xl">
          <p className="text-sm text-gray-600">Chat minimiert</p>
        </div>
      )}
    </div>
  );
};
