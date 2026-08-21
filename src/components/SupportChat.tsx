import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, AlertCircle, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatSession {
  sessionId: string;
  questionCount: number;
  messages: Message[];
}

const FEMALE_AVATAR_URL =
  "https://api.dicebear.com/7.x/avataaars/svg" +
  "?seed=KongoAssistant" +
  "&backgroundColor=ffdfbf" +
  "&hair=long01,long02,long03,long04,long05,long06" +
  "&hairColor=2c1b18,4a312c,724133" +
  "&skinColor=ae5d29,d08b5b,edb98a,f8d25c,ffdbb4" +
  "&accessories=prescription01" +
  "&clothesColor=d32f2f" +
  "&top=longHair" +
  "&facialHairProbability=0";

export const SupportChat: React.FC = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [questionCount, setQuestionCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getWelcomeMessage = () => {
    const messages = {
      de: 'Hallo! 👋 Ich bin Ihr GermanLink Business Assistent. Wie kann ich Ihnen heute helfen?',
      fr: 'Bonjour! 👋 Je suis votre assistant GermanLink Business. Comment puis-je vous aider?',
      ln: 'Mbote! 👋 Nazali assistant na yo ya GermanLink Business. Nakoki kosalisa yo ndenge nini?'
    };
    return messages[language];
  };

  const getPlaceholder = () => {
    const placeholders = {
      de: 'Schreiben Sie Ihre Nachricht...',
      fr: 'Écrivez votre message...',
      ln: 'Koma message na yo...'
    };
    return placeholders[language];
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('chat_session');
    if (saved) {
      try {
        const session: ChatSession = JSON.parse(saved);
        setMessages(session.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
        setQuestionCount(session.questionCount);
      } catch (e) {
        console.error('Failed to restore session:', e);
      }
    } else {
      const welcomeMessages = [
        {
          id: 'welcome',
          text: getWelcomeMessage(),
          sender: 'bot' as const,
          timestamp: new Date()
        }
      ];
      setMessages(welcomeMessages);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const session: ChatSession = {
        sessionId,
        questionCount,
        messages: messages.map(m => ({ ...m, timestamp: m.timestamp }))
      };
      sessionStorage.setItem('chat_session', JSON.stringify(session));
    }
  }, [messages, questionCount, sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const languageMap = { de: 'DE', fr: 'FR', ln: 'LN' };

      const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          sessionId,
          questionCount,
          language: languageMap[language]
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        text: data.response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setQuestionCount(data.questionCount);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Sorry, I encountered an error. Please try again or contact support directly.');

      const errorMessages = {
        de: 'Ich habe gerade Verbindungsprobleme. Bitte versuchen Sie es in einem Moment erneut oder kontaktieren Sie unser Support-Team direkt:\n📧 info@germanlink.business.de\n📱 WhatsApp: +49-157-35169452',
        fr: 'J\'ai des difficultés à me connecter en ce moment. Veuillez réessayer dans un instant ou contacter notre équipe de support directement:\n📧 info@germanlink.business.de\n📱 WhatsApp: +49-157-35169452',
        ln: 'Nazali na problème ya connexion sikoyo. Meka lisusu na mwa ntango to benga équipe na biso ya support directement:\n📧 info@germanlink.business.de\n📱 WhatsApp: +49-157-35169452'
      };

      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        text: errorMessages[language],
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    const resetMessages = {
      de: 'Chat zurückgesetzt. Wie kann ich Ihnen helfen?',
      fr: 'Chat réinitialisé. Comment puis-je vous aider?',
      ln: 'Chat ebongwani. Nakoki kosalisa yo ndenge nini?'
    };

    const welcomeMessages = [
      {
        id: 'welcome_new',
        text: resetMessages[language],
        sender: 'bot' as const,
        timestamp: new Date()
      }
    ];
    setMessages(welcomeMessages);
    setQuestionCount(0);
    sessionStorage.removeItem('chat_session');
    setError(null);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl overflow-hidden border-2 border-white hover:scale-110 transition-transform z-50"
          aria-label="Open chat"
        >
          <img
            src={FEMALE_AVATAR_URL}
            alt="Chat mit uns"
            className="w-full h-full object-cover"
          />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-[#DD0000] to-[#BB0000] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <img
                  src={FEMALE_AVATAR_URL}
                  alt="Assistant Kongo"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover bg-white"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-sm">Kongo Assistant</span>
                <span className="text-red-200 text-xs">Always here to help</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearChat}
                className="text-white/80 hover:text-white transition text-xs px-2 py-1 hover:bg-white/10 rounded"
                title="Clear chat"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {questionCount >= 4 && (
            <div className="bg-[#FFCE00] text-gray-900 p-3 flex items-start space-x-2 border-b border-gray-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Need more help?</p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="mailto:info@germanlink.business.de"
                    className="flex items-center space-x-1 bg-white px-2 py-1 rounded text-xs hover:bg-gray-100 transition"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Email</span>
                  </a>
                  <a
                    href="https://wa.me/4915735169452"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 bg-white px-2 py-1 rounded text-xs hover:bg-gray-100 transition"
                  >
                    <Phone className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {message.sender === 'user' ? (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#009543]">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0">
                      <img
                        src={FEMALE_AVATAR_URL}
                        alt="Assistant"
                        className="w-9 h-9 rounded-full border-2 border-red-200 object-cover bg-white shadow-sm"
                      />
                    </div>
                  )}
                  <div>
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-[#009543] text-white rounded-tr-none'
                          : 'bg-white text-gray-900 shadow-md rounded-tl-none border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    <img
                      src={FEMALE_AVATAR_URL}
                      alt="Assistant"
                      className="w-9 h-9 rounded-full border-2 border-red-200 object-cover bg-white shadow-sm"
                    />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-md border border-gray-200">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={getPlaceholder()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-[#DD0000] focus:ring-2 focus:ring-[#DD0000]/20 transition"
                disabled={isTyping}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-[#DD0000] to-[#BB0000] text-white p-3 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Questions: {questionCount} {questionCount >= 4 ? '• Contact support for detailed help' : ''}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
