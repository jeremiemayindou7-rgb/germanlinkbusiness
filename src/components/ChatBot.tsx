import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ThumbsUp, ThumbsDown, Minimize2, Package } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { SYSTEM_PROMPT, APP_CONTEXT } from '../lib/chatbot-system-prompt';
import { detectLanguage, type SupportedLanguage } from '../lib/detectLanguage';
import { responses } from '../lib/chatbot-responses';
import { getProductField } from '../lib/translateProduct';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
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
  trackingCard?: TrackingInfo;
}

interface TrackingInfo {
  orderNumber: string;
  trackingNumber?: string;
  status: string;
  estimatedDelivery?: string;
  carrier?: string;
  lastUpdate?: string;
  items?: { name: string; quantity: number }[];
}

interface Order {
  id: string;
  order_number: string;
  // Real Supabase columns:
  order_status: string;         // actual status column name
  next_shipment_date?: string;  // actual delivery date column (DATE)
  items?: Array<{               // JSONB column with ordered products
    name?: string;
    product_name?: string;
    quantity?: number;
    qty?: number;
  }>;
  total_amount?: number;
  payment_status?: string;
  updated_at: string;
  user_id?: string;
  // Optional – add via SQL if needed:
  tracking_number?: string;
  carrier?: string;
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const CHATBOT_AVATAR_URL = "/glb_suport.png";

const QUICK_REPLIES = {
  de: [
    { text: '📦 Paket tracken', value: 'Ich möchte mein Paket verfolgen' },
    { text: '🛍️ Meine Bestellungen', value: 'Zeig mir meine Bestellungen' },
    { text: '📋 Produkt suchen', value: 'Ich suche ein Produkt' },
    { text: '🚢 Lieferinformationen', value: 'Wie funktioniert die Lieferung?' },
    { text: '💳 Zahlung & Preise', value: 'Welche Zahlungsmöglichkeiten gibt es?' },
    { text: '📞 Kundenservice', value: 'Ich möchte mit dem Kundenservice sprechen' },
  ],
  fr: [
    { text: '📦 Suivre mon colis', value: 'Je veux suivre mon colis' },
    { text: '🛍️ Mes commandes', value: 'Montre-moi mes commandes' },
    { text: '📋 Chercher produit', value: 'Je cherche un produit' },
    { text: '🚢 Informations livraison', value: 'Comment fonctionne la livraison?' },
    { text: '💳 Paiement & Prix', value: 'Quelles sont les options de paiement?' },
    { text: '📞 Service client', value: 'Je veux parler au service client' },
  ],
  ln: [
    { text: '📦 Landa pake', value: 'Nalingi kolandi pake na ngai' },
    { text: '🛍️ Ba commandes', value: 'Lakisa ngai ba commandes na ngai' },
    { text: '📋 Luka biloko', value: 'Nazali koluka biloko' },
    { text: '🚢 Kokabola', value: 'Ndenge nini kokabola esalemaka?' },
    { text: '💳 Kofuta', value: 'Nini ba moyens ya kofuta?' },
    { text: '📞 Service client', value: 'Nalingi kosolola na service client' },
  ],
};

const WELCOME_MESSAGES = {
  de: 'Willkommen bei GermanLink Business! 👋\n\nIch helfe Ihnen bei:\n• 📦 Paketverfolgung & Lieferdaten\n• 🛍️ Bestellstatus abfragen\n• 🔍 Produktsuche & Verfügbarkeit\n• 💳 Zahlung & Lieferinfos\n\nWie kann ich Ihnen heute helfen?',
  fr: 'Bienvenue sur GermanLink Business! 👋\n\nJe vous aide avec:\n• 📦 Suivi de colis & dates de livraison\n• 🛍️ Statut de vos commandes\n• 🔍 Recherche de produits\n• 💳 Paiement & informations de livraison\n\nComment puis-je vous aider aujourd\'hui?',
  ln: 'Boyei malamu na GermanLink Business! 👋\n\nNakoki kosalisa yo na:\n• 📦 Kolandi pake & bileko ya kokabola\n• 🛍️ Etat ya ba commandes\n• 🔍 Koluka biloko\n• 💳 Kofuta & makambo ya livraison\n\nNakoki kosalisa yo ndenge nini lelo?',
};

// Status translations for display
const STATUS_LABELS: Record<string, Record<string, string>> = {
  // Standard values
  pending:    { de: 'Ausstehend',     fr: 'En attente',       ln: 'Kozela',      en: 'Pending' },
  confirmed:  { de: 'Bestätigt',      fr: 'Confirmée',        ln: 'Elongobani',  en: 'Confirmed' },
  processing: { de: 'In Bearbeitung', fr: 'En traitement',    ln: 'Na mosala',   en: 'Processing' },
  shipped:    { de: 'Versandt',       fr: 'Expédié',          ln: 'Etindamaki',  en: 'Shipped' },
  in_transit: { de: 'Unterwegs',      fr: 'En transit',       ln: 'Na nzela',    en: 'In Transit' },
  delivered:  { de: 'Geliefert',      fr: 'Livré',            ln: 'Ekómaki',     en: 'Delivered' },
  cancelled:  { de: 'Storniert',      fr: 'Annulée',          ln: 'Ebomamaki',   en: 'Cancelled' },
  // payment_status values
  paid:       { de: 'Bezahlt',        fr: 'Payé',             ln: 'Efulamaki',   en: 'Paid' },
  unpaid:     { de: 'Nicht bezahlt',  fr: 'Non payé',         ln: 'Efulamaki te',en: 'Unpaid' },
  partial:    { de: 'Teilweise',      fr: 'Partiel',          ln: 'Ndambu',      en: 'Partial' },
};

// ─────────────────────────────────────────────
// INTENT DETECTION
// ─────────────────────────────────────────────
type Intent =
  | 'tracking'
  | 'my_orders'
  | 'product_search'
  | 'container_info'   // nächster Container / Versanddatum
  | 'delivery_info'
  | 'payment'
  | 'contact'
  | 'greeting'
  | 'unknown';         // → immer an AI weitergeleitet

function detectIntent(message: string): Intent {
  const msg = message.toLowerCase();

  // Container / nächster Versand – VOR tracking prüfen
  const containerPatterns = [
    // DE
    'container', 'nächste', 'nächster', 'wann kommt der', 'wann fährt', 'wann verschiff',
    'nächste lieferung', 'versanddatum', 'abfahrt', 'schiffsabfahrt',
    // FR
    'prochain', 'prochaine', 'conteneur', 'quand part', 'date de départ',
    'prochaine livraison', 'prochaine expédition',
    // LN
    'bateau', 'ndeke oyo ekoya', 'ntango nini',
  ];

  // Tracking: NUR wenn explizit Paket-Tracking gemeint
  const trackingPatterns = [
    'tracken', 'tracking', 'paketnummer', 'sendungs', 'verfolgen',
    'wo ist mein paket', 'wo ist meine bestellung',
    'suivre mon colis', 'numéro de suivi', 'où est mon colis',
    'kolandi pake', 'numelo ya pake',
    'track my', 'parcel tracking',
  ];

  const myOrderPatterns = [
    'meine bestellung', 'meine bestellungen', 'mes commandes', 'ma commande',
    'bestellstatus', 'commandes en cours', 'zeig mir meine',
    'my order', 'ba commandes na ngai', 'historique',
  ];

  const productPatterns = [
    'produkt', 'artikel', 'sortiment', 'haben sie', 'gibt es', 'verfügbar',
    'solar', 'elektronik', 'haushalts', 'werkzeug', 'möbel',
    'produit', 'cherche', 'disponible', 'avez vous', 'est-ce que vous vendez',
    'biloko', 'luka', 'ozali na', 'ba produits',
  ];

  const deliveryPatterns = [
    'wie funktioniert', 'wie lange dauert', 'lieferzeit', 'versandkosten',
    'livraison', 'délai', 'combien de temps',
    'kotinda', 'kokabola ndenge nini',
  ];

  const paymentPatterns = [
    'zahlung', 'bezahl', 'paiement', 'prix', 'kosten', 'lemfi', 'bank',
    'mbongo', 'kofuta', 'ntalo', 'wie bezahl',
  ];

  const contactPatterns = [
    'kontakt', 'telefon', 'email', 'sprechen', 'anrufen',
    'contact', 'appeler', 'parler',
    'kosolola', 'lisalisi',
  ];

  const greetingPatterns = [
    'hallo', 'guten morgen', 'guten tag', 'hi,', 'hey,', 'hey!',
    'bonjour', 'bonsoir', 'salut',
    'mbote', 'hello',
  ];

  // Explizite Trackingnummer (alphanumerisch 8+ Zeichen, nicht nur Zahlen)
  const hasTrackingNumber = /\b[A-Z]{1,4}[0-9]{6,}\b/i.test(message);

  // Reihenfolge ist wichtig!
  if (containerPatterns.some(p => msg.includes(p))) return 'container_info';
  if (hasTrackingNumber || trackingPatterns.some(p => msg.includes(p))) return 'tracking';
  if (myOrderPatterns.some(p => msg.includes(p))) return 'my_orders';
  if (productPatterns.some(p => msg.includes(p))) return 'product_search';
  if (deliveryPatterns.some(p => msg.includes(p))) return 'delivery_info';
  if (paymentPatterns.some(p => msg.includes(p))) return 'payment';
  if (contactPatterns.some(p => msg.includes(p))) return 'contact';
  if (greetingPatterns.some(p => msg.includes(p.toLowerCase()))) return 'greeting';

  // Alles andere → AI beantwortet mit App-Kontext
  return 'unknown';
}

// Extract tracking/order number from message
function extractOrderOrTrackingNumber(message: string): string | null {
  // Match typical tracking/order number formats
  const patterns = [
    /\b([A-Z]{2,4}[0-9]{8,14})\b/i,       // e.g. DHL1234567890
    /\b([0-9]{10,14})\b/,                   // 10-14 digit numbers
    /\b(GLB-[A-Z0-9-]+)\b/i,               // GermanLink format
    /\b(ORD-[A-Z0-9-]+)\b/i,               // Order number format
    /\b([A-Z0-9]{8,20})\b/,                // Generic alphanumeric
  ];
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// ─────────────────────────────────────────────
// SUPABASE DATA FETCHERS
// ─────────────────────────────────────────────

/**
 * Fetch order by tracking number OR order number
 * Adjust the table/column names to match your Supabase schema
 */
async function fetchOrderByNumber(number: string): Promise<Order | null> {
  const cleanNumber = number.trim().toUpperCase();

  // SELECT maps to real column names in orders table
  const SELECT_FIELDS = `
    id,
    order_number,
    order_status,
    next_shipment_date,
    items,
    total_amount,
    payment_status,
    updated_at,
    user_id,
    tracking_number,
    carrier
  `;

  // Try tracking_number first (if column exists)
  if (cleanNumber.match(/[A-Z]{2,4}[0-9]{6,}/i)) {
    const { data: byTracking } = await supabase
      .from('orders')
      .select(SELECT_FIELDS)
      .ilike('tracking_number', cleanNumber)
      .maybeSingle();
    if (byTracking) return byTracking as Order;
  }

  // Try order_number (primary lookup)
  const { data: byOrder } = await supabase
    .from('orders')
    .select(SELECT_FIELDS)
    .ilike('order_number', cleanNumber)
    .maybeSingle();

  return byOrder as Order | null;
}

/**
 * Fetch all orders for the currently logged-in user
 */
async function fetchUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      order_status,
      next_shipment_date,
      items,
      total_amount,
      payment_status,
      updated_at,
      tracking_number,
      carrier
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('[ChatBot] fetchUserOrders error:', error);
    return [];
  }
  return (data || []) as Order[];
}

/**
 * Fetch upcoming containers / shipment dates
 */
async function fetchNextContainers(): Promise<any[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('containers')
    .select('id, name, departure_date, arrival_date, status, description')
    .gte('departure_date', today)
    .order('departure_date', { ascending: true })
    .limit(3);

  if (error) {
    console.error('[ChatBot] fetchNextContainers error:', error);
    return [];
  }
  return data || [];
}

function buildContainerResponse(containers: any[], lang: SupportedLanguage): string {
  const contact = '\n\n📧 info@germanlink.de\n📱 +49 176 22896160';

  if (containers.length === 0) {
    const noData: Record<SupportedLanguage, string> = {
      de: `📦 Aktuell sind keine geplanten Container-Abfahrten verfügbar. Bitte kontaktieren Sie uns direkt:${contact}`,
      fr: `📦 Aucune date de départ de conteneur n'est actuellement disponible. Contactez-nous:${contact}`,
      ln: `📦 Ezali na ba conteneur ya sima te sikawa. Bwela biso:${contact}`,
      en: `📦 No upcoming container departures available. Contact us:${contact}`,
    };
    return noData[lang] ?? noData.fr;
  }

  const locale = lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : 'fr-CD';

  const lines = containers.map((c: any) => {
    const dep = c.departure_date
      ? new Date(c.departure_date).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
      : '–';
    const arr = c.arrival_date
      ? new Date(c.arrival_date).toLocaleDateString(locale, { day: 'numeric', month: 'long' })
      : null;

    const arrSuffix: Record<SupportedLanguage, string> = {
      de: arr ? ` → Ankunft: ${arr}` : '',
      fr: arr ? ` → Arrivée: ${arr}` : '',
      ln: arr ? ` → Kokóma: ${arr}` : '',
      en: arr ? ` → Arrival: ${arr}` : '',
    };

    return `• **${c.name ?? 'Container'}** — ${dep}${arrSuffix[lang] ?? ''}`;
  });

  const header: Record<SupportedLanguage, string> = {
    de: '🚢 **Nächste Container-Abfahrten:**\n\n',
    fr: '🚢 **Prochains départs de conteneurs:**\n\n',
    ln: '🚢 **Ba bateau ya sima:**\n\n',
    en: '🚢 **Upcoming container departures:**\n\n',
  };

  const footer: Record<SupportedLanguage, string> = {
    de: '\n\nUm Ihre Bestellung rechtzeitig aufzunehmen, kontaktieren Sie uns!\n📧 info@germanlink.de',
    fr: '\n\nPour inclure votre commande, contactez-nous!\n📧 info@germanlink.de',
    ln: '\n\nPo na kotia commande na yo, bwela biso liboso!\n📧 info@germanlink.de',
    en: '\n\nTo include your order in a container, contact us!\n📧 info@germanlink.de',
  };

  return (header[lang] ?? header.fr) + lines.join('\n') + (footer[lang] ?? footer.fr);
}

// ─────────────────────────────────────────────
// RESPONSE BUILDERS
// ─────────────────────────────────────────────

function buildTrackingResponse(order: Order, lang: SupportedLanguage): { text: string; card: TrackingInfo } {
  // Map real column names
  const rawStatus = order.order_status ?? 'pending';
  const statusLabel = STATUS_LABELS[rawStatus]?.[lang] ?? rawStatus;

  // next_shipment_date is a DATE string e.g. "2025-06-15"
  const deliveryDate = order.next_shipment_date
    ? new Date(order.next_shipment_date).toLocaleDateString(
        lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : 'fr-CD',
        { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
      )
    : null;

  // Extract product list from JSONB items column
  const itemList = (order.items ?? []).map(i => ({
    name: i.name ?? i.product_name ?? 'Produkt',
    quantity: i.quantity ?? i.qty ?? 1,
  }));

  const total = order.total_amount
    ? `\n💶 Gesamtbetrag: **${Number(order.total_amount).toFixed(2)} €**`
    : '';

  const texts: Record<SupportedLanguage, string> = {
    de: `📦 **Bestellung ${order.order_number}**\n\nStatus: ${statusLabel}${total}\n${deliveryDate ? `📅 Nächstes Versanddatum: **${deliveryDate}**\n` : ''}${order.carrier ? `🚚 Versanddienstleister: ${order.carrier}\n` : ''}${order.tracking_number ? `🔎 Trackingnummer: ${order.tracking_number}` : ''}`,
    fr: `📦 **Commande ${order.order_number}**\n\nStatut: ${statusLabel}${total}\n${deliveryDate ? `📅 Prochaine date d'expédition: **${deliveryDate}**\n` : ''}${order.carrier ? `🚚 Transporteur: ${order.carrier}\n` : ''}${order.tracking_number ? `🔎 Numéro de suivi: ${order.tracking_number}` : ''}`,
    ln: `📦 **Commande ${order.order_number}**\n\nEtat: ${statusLabel}${total}\n${deliveryDate ? `📅 Dati ya kotinda: **${deliveryDate}**\n` : ''}${order.carrier ? `🚚 Compagnie: ${order.carrier}\n` : ''}${order.tracking_number ? `🔎 Numéro ya kolandi: ${order.tracking_number}` : ''}`,
    en: `📦 **Order ${order.order_number}**\n\nStatus: ${statusLabel}${total}\n${deliveryDate ? `📅 Next shipment date: **${deliveryDate}**\n` : ''}${order.carrier ? `🚚 Carrier: ${order.carrier}\n` : ''}${order.tracking_number ? `🔎 Tracking number: ${order.tracking_number}` : ''}`,
  };

  const card: TrackingInfo = {
    orderNumber: order.order_number,
    trackingNumber: order.tracking_number,
    status: statusLabel,
    estimatedDelivery: deliveryDate ?? undefined,
    carrier: order.carrier,
    lastUpdate: new Date(order.updated_at).toLocaleDateString(),
    items: itemList,
  };

  return { text: texts[lang] ?? texts.fr, card };
}

function buildNotFoundResponse(number: string, lang: SupportedLanguage): string {
  const texts: Record<SupportedLanguage, string> = {
    de: `❌ Ich konnte keine Bestellung oder Sendung mit der Nummer **${number}** finden.\n\nBitte prüfen Sie:\n• Ist die Nummer korrekt eingegeben?\n• Wurde die Bestellung unter einer anderen E-Mail aufgegeben?\n\nBei Fragen: 📧 info@germanlink.de | 📱 +49 176 22896160`,
    fr: `❌ Je n'ai pas trouvé de commande avec le numéro **${number}**.\n\nVérifiez:\n• Le numéro est-il correct?\n• La commande a-t-elle été passée avec un autre email?\n\nContactez-nous: 📧 info@germanlink.de | 📱 +49 176 22896160`,
    ln: `❌ Namonaki te commande na numéro **${number}**.\n\nSalela:\n• Numéro ezali malamu?\n• Commande esalémaki na email mosusu?\n\nBwela biso: 📧 info@germanlink.de | 📱 +49 176 22896160`,
    en: `❌ No order found with number **${number}**.\n\nPlease check:\n• Is the number correct?\n• Was the order placed with a different email?\n\nContact us: 📧 info@germanlink.de | 📱 +49 176 22896160`,
  };
  return texts[lang] ?? texts.fr;
}

function buildUserOrdersSummary(orders: Order[], lang: SupportedLanguage): string {
  if (orders.length === 0) {
    const texts: Record<SupportedLanguage, string> = {
      de: '🛍️ Sie haben noch keine Bestellungen in Ihrem Konto.',
      fr: '🛍️ Vous n\'avez encore aucune commande dans votre compte.',
      ln: '🛍️ Ozali na ba commandes te na compte na yo.',
      en: '🛍️ You have no orders yet in your account.',
    };
    return texts[lang] ?? texts.fr;
  }

  const headers: Record<SupportedLanguage, string> = {
    de: `🛍️ Ihre letzten ${orders.length} Bestellung(en):\n\n`,
    fr: `🛍️ Vos ${orders.length} dernière(s) commande(s):\n\n`,
    ln: `🛍️ Ba commandes na yo ya nsuka ${orders.length}:\n\n`,
    en: `🛍️ Your last ${orders.length} order(s):\n\n`,
  };

  const lines = orders.map(order => {
    const status = STATUS_LABELS[order.order_status]?.[lang] ?? order.order_status;
    const delivery = order.next_shipment_date
      ? new Date(order.next_shipment_date).toLocaleDateString('de-DE')
      : '–';
    return `• **${order.order_number}** — ${status} | 📅 ${delivery}`;
  });

  const footers: Record<SupportedLanguage, string> = {
    de: '\n\nFür Details einfach die Bestellnummer eingeben.',
    fr: '\n\nPour les détails, entrez simplement le numéro de commande.',
    ln: '\n\nPo na bimeko, kotia numéro ya commande.',
    en: '\n\nFor details, type the order number.',
  };

  return (headers[lang] ?? headers.fr) + lines.join('\n') + (footers[lang] ?? footers.fr);
}

// ─────────────────────────────────────────────
// CLAUDE API INTEGRATION (Anthropic)
// ─────────────────────────────────────────────
async function callClaudeAPI(
  systemPrompt: string,
  conversationHistory: { role: string; content: string }[],
  userMessage: string
): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Claude API ${response.status}: ${err?.error?.message ?? 'Unknown'}`);
  }

  const data = await response.json();
  return data.content.map((b: any) => b.text || '').join('');
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export const ChatBot: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [showProactive, setShowProactive] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [detectedLang, setDetectedLang] = useState<SupportedLanguage>('fr');
  const [aiMode, setAiMode] = useState<'claude' | 'openai' | 'rule'>('rule');
  const [unansweredCount, setUnansweredCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Init ──
  useEffect(() => {
    loadChatHistory();
    fetchProducts();
    detectAIMode();

    const proactiveTimer = setTimeout(() => {
      if (!isOpen && messages.length === 0) {
        setShowProactive(true);
        setTimeout(() => setShowProactive(false), 8000);
      }
    }, 15000);

    return () => clearTimeout(proactiveTimer);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) addWelcomeMessage();
  }, [isOpen]);

  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => { saveChatHistory(); }, [messages]);

  const detectAIMode = () => {
    const claudeKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (claudeKey && claudeKey !== 'undefined' && claudeKey !== '') {
      console.log('[ChatBot] ✅ Claude (Anthropic) API aktiv');
      setAiMode('claude');
    } else if (openaiKey && openaiKey !== 'undefined' && openaiKey !== '') {
      console.log('[ChatBot] ✅ OpenAI API aktiv');
      setAiMode('openai');
    } else {
      console.warn('[ChatBot] ⚠️ Kein API Key – Regelbasierter Modus');
      setAiMode('rule');
    }
  };

  const loadChatHistory = () => {
    const stored = localStorage.getItem('chatbot_history');
    if (stored) {
      try {
        const { messages: saved, timestamp } = JSON.parse(stored);
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          setMessages(saved.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
        } else {
          localStorage.removeItem('chatbot_history');
        }
      } catch { localStorage.removeItem('chatbot_history'); }
    }
  };

  const saveChatHistory = () => {
    if (messages.length > 0) {
      localStorage.setItem('chatbot_history', JSON.stringify({ messages, timestamp: Date.now() }));
    }
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name, name_de, name_fr, description, description_de, description_fr, category, sale_price, image_url, stock_status')
      .eq('stock_status', 'available');
    setProducts(data || []);
    console.log('[ChatBot] Produkte geladen:', data?.length ?? 0);
  };

  const addWelcomeMessage = () => {
    const content = WELCOME_MESSAGES[language as keyof typeof WELCOME_MESSAGES] || WELCOME_MESSAGES.de;
    setMessages([{ id: `welcome_${Date.now()}`, role: 'assistant', content, timestamp: new Date() }]);
  };

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  // ── Core: Handle data intents (always runs before AI) ──
  const handleDataIntent = async (
    message: string,
    intent: Intent,
    lang: SupportedLanguage
  ): Promise<{ handled: boolean; text?: string; trackingCard?: TrackingInfo }> => {

    // 1. TRACKING by number
    if (intent === 'tracking') {
      const number = extractOrderOrTrackingNumber(message);
      if (number) {
        const order = await fetchOrderByNumber(number);
        if (order) {
          const { text, card } = buildTrackingResponse(order, lang);
          return { handled: true, text, trackingCard: card };
        } else {
          return { handled: true, text: buildNotFoundResponse(number, lang) };
        }
      }
      // Ask for the number
      const askTexts: Record<SupportedLanguage, string> = {
        de: '🔍 Bitte geben Sie Ihre **Bestellnummer** oder **Trackingnummer** ein, damit ich Ihr Paket finden kann.',
        fr: '🔍 Veuillez entrer votre **numéro de commande** ou **numéro de suivi** pour que je puisse localiser votre colis.',
        ln: '🔍 Tiya **numéro ya commande** to **numéro ya kolandi** po nakoka koluka pake na yo.',
        en: '🔍 Please enter your **order number** or **tracking number** so I can locate your parcel.',
      };
      return { handled: true, text: askTexts[lang] ?? askTexts.fr };
    }

    // 2. MY ORDERS (logged-in user)
    if (intent === 'my_orders') {
      if (!user?.id) {
        const loginTexts: Record<SupportedLanguage, string> = {
          de: '🔐 Um Ihre Bestellungen einzusehen, müssen Sie eingeloggt sein. Bitte melden Sie sich an und versuchen Sie es erneut.',
          fr: '🔐 Pour voir vos commandes, vous devez être connecté. Veuillez vous connecter et réessayer.',
          ln: '🔐 Po na komona ba commandes na yo, sengeli kokota na compte. Kota liboso.',
          en: '🔐 To view your orders, please log in first.',
        };
        return { handled: true, text: loginTexts[lang] ?? loginTexts.fr };
      }
      const orders = await fetchUserOrders(user.id);
      return { handled: true, text: buildUserOrdersSummary(orders, lang) };
    }

    // 3. CONTAINER INFO
    if (intent === 'container_info') {
      const containers = await fetchNextContainers();
      return { handled: true, text: buildContainerResponse(containers, lang) };
    }

    return { handled: false };
  };

  // ── Rule-based fallback ──
  const getRuleBasedResponse = (message: string, intent: Intent, lang: SupportedLanguage): string => {
    const msg = message.toLowerCase();

    if (intent === 'greeting') return responses.greeting[lang];

    const foundProduct = products.find(p => {
      const fields = [p.name, p.name_de, p.name_fr, p.description, p.description_de, p.description_fr]
        .filter(Boolean).map((f: string) => f.toLowerCase());
      return fields.some(f => f.includes(msg) || f.split(' ').some((w: string) => w.length > 3 && msg.includes(w)));
    });

    if (foundProduct) {
      const name = getProductField(foundProduct, 'name', lang as any);
      const desc = getProductField(foundProduct, 'description', lang as any);
      return responses.productFound[lang](name, foundProduct.sale_price, desc || 'Hochwertige Qualität');
    }

    if (intent === 'product_search') return responses.productNotFound[lang];
    if (intent === 'payment') return responses.payment[lang];
    if (intent === 'delivery_info') return responses.delivery[lang];
    if (intent === 'contact') return responses.contact[lang];

    return responses.default[lang];
  };

  // ── Main send handler ──
  const handleSendMessage = async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || isTyping) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const lang = detectLanguage(messageText) as SupportedLanguage;
    setDetectedLang(lang);
    const intent = detectIntent(messageText);
    console.log('[ChatBot] intent:', intent, '| lang:', lang, '| aiMode:', aiMode);

    try {
      // ── Step 1: Try to answer from Supabase data ──
      const { handled, text: dataText, trackingCard } = await handleDataIntent(messageText, intent, lang);

      if (handled && dataText) {
        setMessages(prev => [...prev, {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: dataText,
          timestamp: new Date(),
          trackingCard,
        }]);
        setIsTyping(false);
        return;
      }

      // ── Step 2: Route to AI or rule-based ──
      let botResponse = '';

      if (aiMode === 'rule') {
        await new Promise(r => setTimeout(r, 700));
        botResponse = getRuleBasedResponse(messageText, intent, lang);

      } else {
        // Produkte gruppiert nach Kategorie
        const categorized = products.reduce((acc: Record<string, any[]>, p) => {
          const cat = p.category || 'Sonstige';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(p);
          return acc;
        }, {});
        const productContext = Object.entries(categorized).map(([cat, items]) =>
          `### ${cat}\n` + (items as any[]).map(p =>
            `  - ${p.name_de || p.name}: ${p.sale_price}€ | ${p.description_de || p.description || ''}`
          ).join('\n')
        ).join('\n\n');

        // Nächste Container für AI-Kontext laden
        const containers = await fetchNextContainers();
        const containerContext = containers.length > 0
          ? '### NÄCHSTE CONTAINER-ABFAHRTEN:\n' + containers.map(c =>
              `  - ${c.name ?? 'Container'}: Abfahrt ${c.departure_date ?? '?'}${c.arrival_date ? ` → Ankunft ${c.arrival_date}` : ''}`
            ).join('\n')
          : '### CONTAINER: Keine geplanten Abfahrten aktuell eingetragen.';

        const fullSystem = `${SYSTEM_PROMPT}\n\n${APP_CONTEXT}\n\n## PRODUKTKATALOG (${products.length} Artikel):\n${productContext}\n\n${containerContext}\n\nWichtig: Beantworte ALLE Fragen zur App, zum Sortiment, zu Lieferzeiten und Containern auf Basis dieser Daten. Antworte in der Sprache des Users.`;
        const history = messages.map(m => ({ role: m.role, content: m.content }));

        if (aiMode === 'claude') {
          botResponse = await callClaudeAPI(fullSystem, history, messageText);
        } else {
          // OpenAI fallback
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [{ role: 'system', content: fullSystem }, ...history, { role: 'user', content: messageText }],
              temperature: 0.7,
              max_tokens: 500,
            }),
          });
          if (!res.ok) throw new Error(`OpenAI ${res.status}`);
          const d = await res.json();
          botResponse = d.choices[0].message.content;
        }
      }

      // Product card matching
      const productMatch = products.find(p => botResponse.toLowerCase().includes(p.name.toLowerCase()));

      setMessages(prev => [...prev, {
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
      }]);

      // Escalation logic
      if (['kundenservice', 'service client', 'info@germanlink'].some(k => botResponse.toLowerCase().includes(k))) {
        setUnansweredCount(prev => prev + 1);
      }
      if (unansweredCount >= 2) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: `contact_${Date.now()}`,
            role: 'assistant',
            content: `Für persönliche Unterstützung:\n\n📧 info@germanlink.de\n📞 +49 176 22896160\n⏰ Mo–Fr 9–18 Uhr (MEZ)`,
            timestamp: new Date(),
          }]);
          setUnansweredCount(0);
        }, 1000);
      }

    } catch (err: any) {
      console.error('[ChatBot] Error:', err);
      let msg = 'Kurze Störung – bitte versuchen Sie es erneut oder kontaktieren Sie uns:\n\n📧 info@germanlink.de\n📱 +49 176 22896160';
      if (err?.message?.includes('401')) msg = 'Konfigurationsfehler. Unser Team wurde benachrichtigt.';
      else if (err?.message?.includes('429')) msg = 'Zu viele Anfragen. Bitte kurz warten.';

      setMessages(prev => [...prev, {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: msg,
        timestamp: new Date(),
      }]);
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
    } catch (e) { console.error('[ChatBot] feedback error:', e); }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) setIsOpen(false); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const quickReplies = QUICK_REPLIES[language as keyof typeof QUICK_REPLIES] || QUICK_REPLIES.de;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // ── Proactive bubble ──
  if (!isOpen && showProactive) {
    return (
      <div className="fixed bottom-24 right-6 z-50 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-xs border-2 border-green-500">
          <button
            onClick={() => setShowProactive(false)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-gray-600"
          >×</button>
          <p className="text-sm text-gray-700">
            👋 {language === 'de' ? 'Paket verfolgen oder Bestellung prüfen?' :
                language === 'fr' ? 'Suivre un colis ou vérifier une commande?' :
                'Kolandi pake to kotala commande?'}
          </p>
          <button
            onClick={() => { setShowProactive(false); setIsOpen(true); }}
            className="mt-2 w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-green-700 transition"
          >
            {language === 'de' ? 'Chat öffnen' : language === 'fr' ? 'Ouvrir le chat' : 'Fungola chat'}
          </button>
        </div>
      </div>
    );
  }

  // ── FAB button ──
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl overflow-hidden border-2 border-white hover:scale-110 transition-transform z-50 animate-pulse-slow"
        aria-label="Chat öffnen"
      >
        <img src={CHATBOT_AVATAR_URL} alt="Chat" className="w-full h-full object-cover" />
      </button>
    );
  }

  // ── Chat window ──
  return (
    <div
      className={`fixed z-50 ${
        isMobile ? 'inset-0 bg-white' :
        isMinimized ? 'bottom-6 right-6 w-80' :
        'bottom-6 right-6 w-96 h-[580px]'
      } rounded-2xl shadow-2xl flex flex-col`}
      style={{ maxHeight: isMobile ? '100vh' : '620px' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <img src={CHATBOT_AVATAR_URL} alt="GermanLink Business" className="w-10 h-10 rounded-full border-2 border-white object-cover bg-white" />
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
          <button onClick={() => setIsMinimized(!isMinimized)} className="hover:bg-white/20 p-2 rounded-lg transition" aria-label="Minimieren">
            <Minimize2 className="w-4 h-4" />
          </button>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-lg transition" aria-label="Schließen">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div key={message.id}>
                <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-green-600 text-white rounded-2xl rounded-br-none'
                      : 'bg-white text-gray-800 rounded-2xl rounded-bl-none shadow-md border border-gray-200'
                  } px-4 py-3`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Tracking Card */}
                {message.trackingCard && (
                  <div className="mt-2 max-w-[85%]">
                    <div className="bg-white rounded-xl shadow-md border border-green-200 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-sm text-green-700">
                          {message.trackingCard.orderNumber}
                        </span>
                      </div>
                      {message.trackingCard.estimatedDelivery && (
                        <div className="bg-green-50 rounded-lg px-3 py-2 mb-2">
                          <p className="text-xs text-gray-500">
                            {detectedLang === 'de' ? 'Voraussichtliche Lieferung' :
                             detectedLang === 'fr' ? 'Livraison prévue' : 'Kokabola'}
                          </p>
                          <p className="font-bold text-green-700 text-sm">
                            {message.trackingCard.estimatedDelivery}
                          </p>
                        </div>
                      )}
                      {message.trackingCard.carrier && (
                        <p className="text-xs text-gray-500">
                          🚚 {message.trackingCard.carrier}
                        </p>
                      )}
                      {message.trackingCard.items && message.trackingCard.items.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          {message.trackingCard.items.map((item, i) => (
                            <p key={i} className="text-xs text-gray-600">• {item.name} ×{item.quantity}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Product Card */}
                {message.productCard && (
                  <div className="mt-2 max-w-[85%]">
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 flex items-center gap-3">
                      {message.productCard.image && (
                        <img src={message.productCard.image} alt={message.productCard.name} className="w-16 h-16 object-cover rounded" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{message.productCard.name}</p>
                        <p className="text-green-600 font-bold text-lg">{message.productCard.price.toFixed(2)} €</p>
                        <button className="mt-1 bg-green-600 text-white text-xs px-3 py-1 rounded hover:bg-green-700 transition">
                          {detectedLang === 'de' ? 'Jetzt anfragen' : detectedLang === 'fr' ? 'Commander' : 'Singa'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Feedback */}
                {message.role === 'assistant' && index > 0 && (
                  <div className="flex gap-2 mt-1 ml-1">
                    <button onClick={() => handleFeedback(message.id, 'positive')} className="text-gray-400 hover:text-green-600 transition" aria-label="Hilfreich">
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleFeedback(message.id, 'negative')} className="text-gray-400 hover:text-red-600 transition" aria-label="Nicht hilfreich">
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-none shadow-md border border-gray-200 px-4 py-3">
                  <div className="flex space-x-2">
                    {[0, 150, 300].map(delay => (
                      <div key={delay} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick replies (only after welcome message) */}
            {messages.length === 1 && messages[0].role === 'assistant' && (
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(reply.value)}
                    className="bg-white border-2 border-green-600 text-green-600 px-3 py-2 rounded-lg text-xs hover:bg-green-50 transition font-medium"
                  >
                    {reply.text}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value.slice(0, 500))}
                onKeyPress={handleKeyPress}
                placeholder={
                  detectedLang === 'de' ? 'Ihre Frage oder Paketnummer...' :
                  detectedLang === 'en' ? 'Your question or tracking number...' :
                  detectedLang === 'ln' ? 'Motuna na yo to numéro ya pake...' :
                  'Votre question ou numéro de suivi...'
                }
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
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
            {input.length > 400 && (
              <p className="text-xs text-gray-500 mt-1 text-right">{input.length}/500</p>
            )}
            <p className="text-xs text-gray-400 mt-2 text-center">
              Powered by GermanLink Business
            </p>
          </div>
        </>
      )}

      {isMinimized && (
        <div className="p-3 bg-white rounded-b-2xl">
          <p className="text-sm text-gray-600">
            {detectedLang === 'de' ? 'Chat minimiert' : detectedLang === 'fr' ? 'Chat minimisé' : 'Chat ekitani'}
          </p>
        </div>
      )}
    </div>
  );
};

