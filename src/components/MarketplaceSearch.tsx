import { useState, useRef, useEffect } from 'react';
import {
  Search, ExternalLink, X, ChevronRight, CheckCircle,
  ShoppingBag, AlertCircle, Loader2, Link, ArrowRight,
  Tag, Filter, ChevronDown, ShoppingCart,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';
import { supabase } from '../lib/supabase';
import { sendOrderConfirmation } from '../lib/email';

type OrderStep = 1 | 2 | 3 | 4;

interface OrderDetails {
  qty:     number;
  variant: string;
  note:    string;
  city:    'Brazzaville' | 'Kinshasa' | 'Pointe-Noire';
  customs: 'with' | 'without';
}

interface ParsedProduct {
  url:         string;
  marketplace: string;
}

// ── Occasion Europe ───────────────────────────────────────────────────────────
interface OccasionProduct {
  id: string;
  name: string;
  name_de?: string;
  name_fr?: string;
  name_ln?: string;
  sale_price: number;
  image_url: string | null;
  condition: string;
  category_oe?: string;
  product_segment: string;
  source_url?: string;
  description?: string;
  description_de?: string;
  description_fr?: string;
  description_ln?: string;
}

const OE_CATEGORIES = [
  { key: 'all',         fr: 'Toutes catégories',              de: 'Alle Kategorien',           ln: 'Mitindo nyonso' },
  { key: 'agriculture', fr: 'Agriculture & Agrotechnique',    de: 'Landwirtschaft',            ln: 'Agriculture' },
  { key: 'solar',       fr: 'Solaire & Énergie',              de: 'Solar & Energie',           ln: 'Solaire & Énergie' },
  { key: 'electronics', fr: 'Électronique & IT',              de: 'Elektronik & IT',           ln: 'Électronique & IT' },
  { key: 'auto',        fr: 'Auto & Moto',                    de: 'Auto & Motor',              ln: 'Mituka & Moto' },
  { key: 'tools',       fr: 'Outils & Machines',              de: 'Werkzeuge & Maschinen',     ln: 'Bisaleli & Mashini' },
  { key: 'cooling',     fr: 'Réfrigération & Équipement',     de: 'Kühlung & Ausrüstung',      ln: 'Kühlung & Équipement' },
];

const OE_CONDITIONS: Record<string, { fr: string; de: string; ln: string; color: string }> = {
  new:       { fr: 'Neuf',           de: 'Neu',          ln: 'Ya sika',      color: 'bg-green-100 text-green-700' },
  very_good: { fr: 'Très bon état',  de: 'Sehr gut',     ln: 'Malamu mpenza', color: 'bg-blue-100 text-blue-700' },
  good:      { fr: 'Bon état',       de: 'Gut',          ln: 'Malamu',        color: 'bg-yellow-100 text-yellow-700' },
  acceptable:{ fr: 'Reconditionné',  de: 'Generalüb.',   ln: 'Ebongwami',     color: 'bg-orange-100 text-orange-700' },
};

// ── NOUVEAU : Modal de détails produit "Occasion d'Europe" ────────────────────
function OccasionProductModal({
  product, lang, formatPrice, onClose, onAddToCart, addingId, addedId,
}: {
  product: OccasionProduct;
  lang: 'de' | 'fr' | 'ln';
  formatPrice: (n: number) => string;
  onClose: () => void;
  onAddToCart: (id: string) => void;
  addingId: string | null;
  addedId: string | null;
}) {
  const fallback = '/glblogo.png';
  const cond = OE_CONDITIONS[product.condition] || {
    fr: product.condition, de: product.condition, ln: product.condition,
    color: 'bg-gray-100 text-gray-600',
  };

  const getName = (p: OccasionProduct) =>
    (p[`name_${lang}` as keyof OccasionProduct] as string) || p.name || '';

  const getDescription = (p: OccasionProduct) =>
    (p[`description_${lang}` as keyof OccasionProduct] as string) || p.description || '';

  const name = getName(product);
  const description = getDescription(product);

  const labels = {
    de: { title: 'Produktdetails', priceLabel: 'Preis Deutschland', condition: 'Zustand', source: 'Original-Angebot ansehen', add: 'In den Warenkorb', adding: 'Wird hinzugefügt...', added: 'In den Warenkorb!', desc: 'Beschreibung', noDesc: 'Keine Beschreibung verfügbar.' },
    fr: { title: 'Détails du produit', priceLabel: 'Prix Allemagne', condition: 'État', source: "Voir l'annonce d'origine", add: 'Ajouter au panier', adding: '...', added: 'Ajouté au panier!', desc: 'Description', noDesc: 'Aucune description disponible.' },
    ln: { title: 'Ba détails ya eloko', priceLabel: 'Prix Allemagne', condition: 'Ezalela', source: "Talá annonce ya ebandeli", add: 'Tyá na panier', adding: '...', added: 'Ebakisami na panier!', desc: 'Description', noDesc: 'Description ezali te.' },
  }[lang];

  return (
    <div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem', paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'white', width: '100%', maxWidth: '32rem', display: 'flex', flexDirection: 'column', borderRadius: '1rem', maxHeight: 'calc(100dvh - 96px)', overflow: 'hidden' }}>
        {/* Header */}
        <div className="flex-shrink-0 flex items-start justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <p className="text-base font-bold text-gray-900">{labels.title}</p>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="px-5 pt-4 overflow-y-auto flex-1" style={{ WebkitOverflowScrolling: 'touch' as any }}>
          {/* Image */}
          <div className="relative w-full h-56 bg-gray-50 rounded-xl overflow-hidden mb-4">
            <img
              src={product.image_url || fallback}
              alt={name}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = fallback; }}
            />
            <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${cond.color}`}>
              {cond[lang]}
            </span>
            <span className="absolute top-3 right-3 bg-white/90 text-xs font-bold px-2 py-1 rounded-full text-gray-700 shadow-sm">
              🇩🇪
            </span>
          </div>

          {/* Nom */}
          <p className="text-base font-bold text-gray-900 mb-3">{name}</p>

          {/* Prix + badge GLB */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">{labels.priceLabel}</p>
              <p className="text-2xl font-bold text-green-700">
                {product.sale_price > 0 ? formatPrice(product.sale_price) : '—'}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              <Tag size={11} />
              GLB
            </div>
          </div>

          {/* État */}
          <div className="flex justify-between px-3 py-2.5 bg-gray-50 rounded-xl mb-3">
            <span className="text-sm text-gray-500">{labels.condition}</span>
            <span className="text-sm font-semibold text-gray-800">{cond[lang]}</span>
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{labels.desc}</p>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {description || labels.noDesc}
            </p>
          </div>

          {/* Lien vers l'annonce d'origine */}
          {product.source_url && (
            <a
              href={product.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 underline underline-offset-2 mb-4"
            >
              {labels.source} <ExternalLink size={12} />
            </a>
          )}
        </div>

        {/* Footer fixe avec bouton d'action */}
        <div className="flex-shrink-0 px-5 pt-3 pb-5 border-t border-gray-100">
          {addedId === product.id && (
            <div className="mb-2 bg-green-50 text-green-700 text-xs font-semibold text-center py-1.5 rounded-lg">
              ✅ {labels.added}
            </div>
          )}
          <button
            onClick={() => onAddToCart(product.id)}
            disabled={addingId === product.id}
            className="w-full py-2.5 bg-[#FF6F00] hover:bg-[#E66000] disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
          >
            {addingId === product.id
              ? <Loader2 size={14} className="animate-spin" />
              : <ShoppingCart size={14} />
            }
            {addingId === product.id ? labels.adding : labels.add}
          </button>
        </div>
      </div>
    </div>
  );
}

function OccasionEuropeSection({
  formatPrice, language, onAuthRequired,
}: {
  formatPrice: (n: number) => string;
  language: string;
  onAuthRequired: () => void;
}) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [addingId, setAddingId]       = useState<string | null>(null);
  const [addedId, setAddedId]         = useState<string | null>(null);
  const [products, setProducts]       = useState<OccasionProduct[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeCategory, setCategory] = useState('all');
  const [sort, setSort]               = useState<'newest' | 'asc' | 'desc'>('newest');
  const [showSortMenu, setShowSort]   = useState(false);
  const [selectedOE, setSelectedOE]   = useState<OccasionProduct | null>(null); // NOUVEAU : produit sélectionné pour le modal détails
  const fallback = '/glblogo.png';

  const lang = language as 'de' | 'fr' | 'ln';

  useEffect(() => {
    const fetchOE = async () => {
      setLoading(true);
      let q = supabase
        .from('products')
        .select('*')
        .eq('product_segment', 'occasion_europe');

      if (activeCategory !== 'all') q = q.eq('category_oe', activeCategory);
      if (sort === 'asc')    q = q.order('sale_price', { ascending: true });
      else if (sort === 'desc') q = q.order('sale_price', { ascending: false });
      else q = q.order('created_at', { ascending: false });

      const { data } = await q;
      setProducts(data || []);
      setLoading(false);
    };
    fetchOE();
  }, [activeCategory, sort]);

  const handleAddToCart = async (productId: string) => {
    if (!user) { onAuthRequired(); return; }
    setAddingId(productId);
    try {
      await addToCart(productId);
      setAddedId(productId);
      setTimeout(() => setAddedId(null), 2000);
    } catch (e: any) {
      alert(e.message || 'Erreur');
    } finally {
      setAddingId(null);
    }
  };

  const getName = (p: OccasionProduct) =>
    (p[`name_${lang}` as keyof OccasionProduct] as string) || p.name || '';

  const getCondition = (c: string) =>
    OE_CONDITIONS[c] || { fr: c, de: c, ln: c, color: 'bg-gray-100 text-gray-600' };

  const getCatLabel = (cat: (typeof OE_CATEGORIES)[0]) =>
    cat[lang] || cat.fr;

  const sortLabels = {
    newest: { fr: 'Plus récent', de: 'Neueste', ln: 'Ya sika koleka' },
    asc:    { fr: 'Prix croissant', de: 'Preis aufsteigend', ln: 'Ntalo ya moke liboso' },
    desc:   { fr: 'Prix décroissant', de: 'Preis absteigend', ln: 'Ntalo ya mingi liboso' },
  };

  return (
    <div className="mb-10">
      {/* ── Bannière ── */}
      <div className="rounded-2xl overflow-hidden mb-5"
           style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d6a4f 100%)' }}>
        <div className="px-5 py-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🔥</span>
              <span className="text-white font-bold text-xl">
                {lang === 'de' ? 'Occasion aus Europa' : lang === 'ln' ? 'Occasion ya Europe' : "Occasion d'Europe"}
              </span>
            </div>
            <p className="text-green-200 text-xs max-w-xs">
              {lang === 'de'
                ? 'Gebrauchte & aufgearbeitete Produkte aus Deutschland & Europa — Lieferung nach Congo'
                : lang === 'ln'
                ? 'Biloko ya kala & ebongwami ya Allemagne & Europe — Kokabisa na Congo'
                : "Produits d'occasion et reconditionnés d'Allemagne & d'Europe, disponibles pour livraison au Congo."}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
              🇩🇪 {lang === 'de' ? 'Occasion Allemagne' : lang === 'ln' ? 'Occasion Allemagne' : 'Occasion Allemagne'}
            </span>
            <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-full">
              {lang === 'de' ? 'GLB-geprüft & versichert' : lang === 'ln' ? 'GLB esaleli & ebatelami' : 'Vérifié & assuré par GLB'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Filtres ── */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {/* Catégories */}
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1" style={{ scrollbarWidth: 'none' }}>
          {OE_CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setCategory(cat.key)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition flex-shrink-0 ${
                activeCategory === cat.key
                  ? 'bg-green-700 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-green-400'
              }`}>
              {getCatLabel(cat)}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="relative flex-shrink-0">
          <button onClick={() => setShowSort(v => !v)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-600 hover:border-green-400 transition">
            <Filter size={12} />
            {sortLabels[sort][lang]}
            <ChevronDown size={12} />
          </button>
          {showSortMenu && (
            <div className="absolute right-0 top-9 bg-white border border-gray-100 rounded-xl shadow-lg z-10 min-w-[160px] overflow-hidden">
              {(Object.keys(sortLabels) as (keyof typeof sortLabels)[]).map(k => (
                <button key={k} onClick={() => { setSort(k); setShowSort(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 transition ${sort === k ? 'font-bold text-green-700' : 'text-gray-600'}`}>
                  {sortLabels[k][lang]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Produits ── */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-green-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
          <p className="text-3xl mb-2">📦</p>
          <p className="text-sm font-semibold text-gray-500">
            {lang === 'de' ? 'Keine Produkte gefunden' : lang === 'ln' ? 'Eloko moko te' : 'Aucun produit trouvé'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {lang === 'de' ? 'Bald verfügbar' : lang === 'ln' ? 'Ekoya noki' : 'Bientôt disponible'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => {
            const cond = getCondition(p.condition);
            return (
              <div
                key={p.id}
                onClick={() => setSelectedOE(p)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') setSelectedOE(p); }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-44 bg-gray-50">
                  <img
                    src={p.image_url || fallback}
                    alt={getName(p)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { (e.target as HTMLImageElement).src = fallback; }}
                  />
                  {/* Badge état */}
                  <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${cond.color}`}>
                    {cond[lang]}
                  </span>
                  {/* Badge Allemagne */}
                  <span className="absolute top-3 right-3 bg-white/90 text-xs font-bold px-2 py-1 rounded-full text-gray-700 shadow-sm">
                    🇩🇪
                  </span>
                </div>

                {/* Infos */}
                <div className="p-4">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] mb-3">
                    {getName(p)}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">
                        {lang === 'de' ? 'Preis Deutschland' : lang === 'ln' ? 'Prix Allemagne' : 'Prix Allemagne'}
                      </p>
                      <p className="text-lg font-bold text-green-700">
                        {p.sale_price > 0 ? formatPrice(p.sale_price) : '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      <Tag size={11} />
                      GLB
                    </div>
                  </div>

                  {/* Confirmation ajout */}
                  {addedId === p.id && (
                    <div className="mb-2 bg-green-50 text-green-700 text-xs font-semibold text-center py-1.5 rounded-lg">
                      ✅ {lang === 'de' ? 'In den Warenkorb!' : lang === 'ln' ? 'Ebakisami na panier!' : 'Ajouté au panier!'}
                    </div>
                  )}

                  {/* Bouton Ajouter au panier */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(p.id); }}
                    disabled={addingId === p.id}
                    className="w-full py-2.5 bg-[#FF6F00] hover:bg-[#E66000] disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2">
                    {addingId === p.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <ShoppingCart size={14} />
                    }
                    {addingId === p.id
                      ? (lang === 'de' ? 'Wird hinzugefügt...' : '...')
                      : lang === 'de' ? 'In den Warenkorb' : lang === 'ln' ? 'Tyá na panier' : 'Ajouter au panier'
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── NOUVEAU : Modal de détails produit ── */}
      {selectedOE && (
        <OccasionProductModal
          product={selectedOE}
          lang={lang}
          formatPrice={formatPrice}
          onClose={() => setSelectedOE(null)}
          onAddToCart={handleAddToCart}
          addingId={addingId}
          addedId={addedId}
        />
      )}
    </div>
  );
}

// ─── Le reste du fichier est identique ───────────────────────────────────────

const FEES = { pickup: 25, shipping: 45, service: 15 };
const WHATSAPP_NUMBER = '4915xxxxxxxxx';

const MARKETPLACES = [
  { id: 'ebay',         name: 'eBay.de',       color: 'bg-yellow-400', badgeBg: 'bg-yellow-100 text-yellow-800', logo: '🛒', descKey: 'mp_ebay_desc',   searchUrl: (q: string) => `https://www.ebay.de/sch/i.html?_nkw=${encodeURIComponent(q)}`,                    domain: 'ebay.de' },
  { id: 'kleinanzeigen',name: 'Kleinanzeigen', color: 'bg-green-500',  badgeBg: 'bg-green-100 text-green-800',   logo: '📋', descKey: 'mp_klein_desc',  searchUrl: (q: string) => `https://www.kleinanzeigen.de/s/${encodeURIComponent(q)}/k0`,                     domain: 'kleinanzeigen.de' },
  { id: 'amazon',       name: 'Amazon.de',      color: 'bg-orange-400', badgeBg: 'bg-orange-100 text-orange-800', logo: '📦', descKey: 'mp_amazon_desc', searchUrl: (q: string) => `https://www.amazon.de/s?k=${encodeURIComponent(q)}`,                              domain: 'amazon.de' },
  { id: 'rebuy',        name: 'reBuy.de',       color: 'bg-blue-500',   badgeBg: 'bg-blue-100 text-blue-800',     logo: '♻️', descKey: 'mp_rebuy_desc',  searchUrl: (q: string) => `https://www.rebuy.de/kaufen/angebote?search=${encodeURIComponent(q)}`,           domain: 'rebuy.de' },
  { id: 'vinted',       name: 'Vinted.de',      color: 'bg-teal-500',   badgeBg: 'bg-teal-100 text-teal-800',     logo: '👕', descKey: 'mp_vinted_desc', searchUrl: (q: string) => `https://www.vinted.de/catalog?search_text=${encodeURIComponent(q)}`,             domain: 'vinted.de' },
];

const MP_DESCS: Record<string, { de: string; fr: string; ln: string }> = {
  mp_ebay_desc:   { de: 'Neu & Gebraucht — Privat & Händler',  fr: 'Neuf & Occasion — Particuliers & Pro',  ln: 'Ya sika & ya kala — Privé & Vendeur' },
  mp_klein_desc:  { de: 'Lokale Angebote — Privat',             fr: 'Annonces locales — Particuliers',       ln: 'Ba-annonces ya esika — Privé' },
  mp_amazon_desc: { de: 'Neu & Warehouse — Schnelle Lieferung', fr: 'Neuf & Warehouse — Livraison rapide',   ln: 'Ya sika & Warehouse — Kokaba noki' },
  mp_rebuy_desc:  { de: 'Generalüberholt — Mit Garantie',       fr: 'Reconditionné — Avec garantie',         ln: 'Ebongwami — Na garantie' },
  mp_vinted_desc: { de: 'Mode & Accessoires — Second Hand',     fr: 'Mode & Accessoires — Seconde main',     ln: 'Bilamba & Accessoires — Ya mibale' },
};

const fmt = (n: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
const mkTrackingNo = () => 'GLB-' + Math.floor(10000 + Math.random() * 90000);

function detectMarketplace(url: string): string {
  const u = url.toLowerCase();
  if (u.includes('ebay.de'))          return 'eBay.de';
  if (u.includes('kleinanzeigen.de')) return 'Kleinanzeigen.de';
  if (u.includes('amazon.de'))        return 'Amazon.de';
  if (u.includes('rebuy.de'))         return 'reBuy.de';
  if (u.includes('vinted.de'))        return 'Vinted.de';
  return '—';
}

function isValidMarketplaceUrl(url: string): boolean {
  return ['ebay.de', 'kleinanzeigen.de', 'amazon.de', 'rebuy.de', 'vinted.de'].some(d => url.toLowerCase().includes(d));
}

function buildWhatsAppMessage(tracking: string, url: string, marketplace: string, details: OrderDetails, total: number, lang: 'de' | 'fr' | 'ln'): string {
  const labels = {
    de: { title: 'Neue GLB Bestellung', link: 'Produktlink', market: 'Marktplatz', qty: 'Menge', variant: 'Variante', note: 'Hinweis', city: 'Stadt', customs: 'Verzollung', yes: 'Ja (Haustür)', no: 'Nein (Hafen)', total: 'Gesamtbetrag', tracking: 'Tracking-Nr.' },
    fr: { title: 'Nouvelle commande GLB', link: 'Lien produit', market: 'Marché', qty: 'Quantité', variant: 'Variante', note: 'Remarque', city: 'Ville', customs: 'Dédouanement', yes: 'Oui (domicile)', no: 'Non (port)', total: 'Montant total', tracking: 'N° de suivi' },
    ln: { title: 'Commande ya sika GLB', link: 'Lien ya eloko', market: 'Marché', qty: 'Motango', variant: 'Variante', note: 'Liloba', city: 'Ville', customs: 'Douane', yes: 'Iyo (ndako)', no: 'Te (port)', total: 'Prix mobimba', tracking: 'Numéro ya tracking' },
  }[lang];
  const lines = [
    `🛍️ *${labels.title}*`, ``,
    `🔗 *${labels.link}:* ${url}`,
    `🏪 *${labels.market}:* ${marketplace}`, ``,
    `• ${labels.qty}: ${details.qty}`,
    details.variant ? `• ${labels.variant}: ${details.variant}` : '',
    details.note    ? `• ${labels.note}: ${details.note}` : '',
    `• ${labels.city}: ${details.city}`,
    `• ${labels.customs}: ${details.customs === 'with' ? labels.yes : labels.no}`, ``,
    `💰 *${labels.total}: ${fmt(total)}*`,
    `🔖 *${labels.tracking}: ${tracking}*`,
  ].filter(Boolean);
  return encodeURIComponent(lines.join('\n'));
}

function StepIndicator({ current, t }: { current: OrderStep; t: (k: string) => string }) {
  const steps = [t('order_step_product'), t('order_step_offer'), t('order_step_payment'), t('order_step_confirmation')];
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((label, i) => {
        const step = (i + 1) as OrderStep;
        const done = step < current;
        const active = step === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {done ? <CheckCircle size={15} /> : step}
              </div>
              <span className={`text-[10px] font-medium ${active ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-6 h-px mx-1 mb-5 ${step < current ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        );
      })}
    </div>
  );
}

interface OrderModalProps { product: ParsedProduct; onClose: () => void; }

function OrderModal({ product, onClose }: OrderModalProps) {
  const { t, language } = useLanguage();
  const [step, setStep] = useState<OrderStep>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [trackingNo, setTrackingNo] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);
  const [details, setDetails] = useState<OrderDetails>({ qty: 1, variant: '', note: '', city: 'Brazzaville', customs: 'with' });

  const grandTotal = estimatedPrice * details.qty + FEES.pickup + FEES.shipping + FEES.service;
  const set = <K extends keyof OrderDetails>(k: K, v: OrderDetails[K]) => setDetails(d => ({ ...d, [k]: v }));

  const handleConfirmPayment = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const tracking = mkTrackingNo();
      const { error } = await supabase.from('marketplace_orders').insert({
        tracking_number: tracking, product_title: 'Produkt via Link', product_url: product.url,
        product_price: estimatedPrice, marketplace: product.marketplace, condition: 'unknown',
        quantity: details.qty, variant: details.variant || null, note: details.note || null,
        delivery_city: details.city, customs_included: details.customs === 'with',
        fee_pickup: FEES.pickup, fee_shipping: FEES.shipping, fee_service: FEES.service,
        total_amount: grandTotal, status: 'paid',
      });
      if (error) throw new Error(error.message);

      // E-Mail Bestätigung senden
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await sendOrderConfirmation({
          customerEmail:  user?.email ?? 'info@germanlinkbusiness.de',
          customerName:   user?.user_metadata?.full_name ?? 'Kunde',
          trackingNumber: tracking,
          products: [{
            name:  `${product.marketplace} – Produkt`,
            qty:   details.qty,
            price: estimatedPrice,
          }],
          total: grandTotal,
          city:  details.city,
        });
      } catch (emailError) {
        console.error('[Email] Fehler:', emailError);
      }

      setTrackingNo(tracking);
      setStep(4);
    } catch (err: any) {
      setSaveError(err.message ?? 'Fehler. Bitte erneut versuchen.');
    } finally {
      setIsSaving(false);
    }
  };

  const openWhatsApp = () => {
    const msg = buildWhatsAppMessage(trackingNo, product.url, product.marketplace, details, grandTotal, language as 'de' | 'fr' | 'ln');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  };

  return (
    <div
      style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.65)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'0.75rem',paddingBottom:'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))'}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{background:'white',width:'100%',maxWidth:'28rem',display:'flex',flexDirection:'column',borderRadius:'1rem',maxHeight:'calc(100dvh - 144px)',overflow:'hidden'}}>
        <div className="flex-shrink-0 flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex-1 pr-4">
            <p className="text-xs text-gray-400 mb-1">{product.marketplace}</p>
            <p className="text-xs text-gray-500 line-clamp-1 font-mono">{product.url}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <div className="px-5 pt-4 overflow-y-auto flex-1" style={{paddingBottom:'80px', WebkitOverflowScrolling:'touch' as any}}>
          <StepIndicator current={step} t={t} />
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-700">{t('order_product_details')}</p>
              <div>
                <label className="text-sm text-gray-600 block mb-1">{t('order_product_price')} <span className="text-red-500">*</span></label>
                <input type="number" min={0} value={estimatedPrice || ''}
                  onChange={e => setEstimatedPrice(Number(e.target.value))} placeholder="199"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-gray-400 mt-1">{t('order_price_hint')}</p>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">{t('order_quantity')}</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => set('qty', Math.max(1, details.qty - 1))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center font-bold hover:bg-gray-50">−</button>
                  <span className="w-8 text-center text-sm font-bold">{details.qty}</span>
                  <button onClick={() => set('qty', details.qty + 1)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center font-bold hover:bg-gray-50">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">{t('order_variant')}</label>
                <input type="text" value={details.variant} onChange={e => set('variant', e.target.value)}
                  placeholder={t('order_variant_placeholder')}
                  className="w-40 px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">{t('order_delivery_city')}</label>
                <select value={details.city} onChange={e => set('city', e.target.value as OrderDetails['city'])}
                  className="w-40 px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Brazzaville</option><option>Kinshasa</option><option>Pointe-Noire</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">{t('order_note')}</label>
                <textarea value={details.note} onChange={e => set('note', e.target.value)}
                  placeholder={t('order_note_placeholder')} rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              {estimatedPrice > 0 && (
                <div className="flex justify-between items-center bg-blue-50 rounded-xl px-4 py-2.5">
                  <span className="text-sm text-blue-700">{t('order_product_price')} ({details.qty}×)</span>
                  <span className="text-sm font-bold text-blue-700">{fmt(estimatedPrice * details.qty)}</span>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">{t('order_cancel')}</button>
                <button onClick={() => setStep(2)} disabled={estimatedPrice === 0}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-40 flex items-center justify-center gap-1">
                  {t('order_next')} <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-700">{t('order_total_offer')}</p>
              <div className="space-y-2">
                {[
                  { label: `${t('order_product_price')} (${details.qty}×)`, value: fmt(estimatedPrice * details.qty) },
                  { label: t('order_pickup_fee'),   value: `+ ${fmt(FEES.pickup)}`   },
                  { label: t('order_shipping_fee'), value: `+ ${fmt(FEES.shipping)}` },
                  { label: t('order_service_fee'),  value: `+ ${fmt(FEES.service)}`  },
                ].map(row => (
                  <div key={row.label} className="flex justify-between px-3 py-2.5 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-semibold text-gray-800">{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between px-3 py-3 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-sm font-bold text-blue-700">{t('total')}</span>
                  <span className="text-base font-bold text-blue-700">{fmt(grandTotal)}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2">{t('order_customs')}</p>
                <div className="flex gap-2">
                  {(['with', 'without'] as const).map(opt => (
                    <button key={opt} onClick={() => set('customs', opt)}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-left border transition ${details.customs === opt ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                      <p className="text-xs font-semibold">{t(`order_customs_${opt}`)}</p>
                      <p className={`text-[10px] mt-0.5 ${details.customs === opt ? 'text-blue-200' : 'text-gray-400'}`}>{t(`order_customs_${opt}_sub`)}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">{t('order_go_back')}</button>
                <button onClick={() => setStep(3)} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">{t('order_accept')}</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-700">{t('order_payment_title')}</p>
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <p className="text-xs font-bold text-orange-800 mb-2">📋 {t('order_payment_instruction_title')}</p>
                <ul className="text-xs text-orange-700 space-y-1.5">
                  {[1,2,3,4].map(n => <li key={n}>• {t(`order_payment_step${n}`)}</li>)}
                </ul>
              </div>
              <div className="space-y-2">
                {[
                  { label: t('order_to_pay'), value: fmt(grandTotal), bold: true },
                  { label: t('order_delivery_city'), value: details.city },
                  { label: t('order_customs_label'), value: details.customs === 'with' ? t('order_customs_yes') : t('order_customs_no') },
                ].map(row => (
                  <div key={row.label} className="flex justify-between px-3 py-2 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className={`text-sm ${row.bold ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              {saveError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                  <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-600">{saveError}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => setStep(2)} disabled={isSaving} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">{t('order_go_back')}</button>
                <button onClick={handleConfirmPayment} disabled={isSaving}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSaving ? <><Loader2 size={15} className="animate-spin" /> {t('order_saving')}</> : t('order_confirm_payment')}
                </button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">{t('order_confirmed_title')}</p>
                <p className="text-sm text-gray-500 mt-1">{t('order_confirmed_desc')} <strong>{details.city}</strong>.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-left">
                {[
                  { label: t('order_status'), value: `✅ ${t('paid')}`, color: 'text-green-600' },
                  { label: 'Tracking-Nr.', value: trackingNo, color: 'text-blue-600' },
                  { label: t('order_next_step'), value: t('order_next_step'), color: 'text-gray-800' },
                  { label: t('estimated_delivery'), value: t('order_delivery_time'), color: 'text-gray-800' },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 mb-0.5">{item.label}</p>
                    <p className={`text-sm font-semibold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-left">
                <p className="text-xs font-bold text-blue-700 mb-3">{t('order_next_steps_title')}</p>
                {[t('order_process_1'), t('order_process_2'), t('order_process_3'), t('order_process_4'), `${t('order_process_5')} ${details.city}`].map((s, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-xs text-blue-700">{s}</span>
                  </div>
                ))}
              </div>
              <button onClick={openWhatsApp}
                className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                {t('order_whatsapp_btn')}
              </button>
              <button onClick={onClose} className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                {t('order_done')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function MarketplaceSearch() {
  const { t, language, formatPrice } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [productLink, setProductLink] = useState('');
  const [linkError, setLinkError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ParsedProduct | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'link'>('search');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const linkRef = useRef<HTMLInputElement>(null);

  const getMpDesc = (descKey: string) => MP_DESCS[descKey]?.[language as 'de' | 'fr' | 'ln'] ?? '';
  const handleMarketplaceOpen = (mp: typeof MARKETPLACES[0]) => window.open(mp.searchUrl(searchQuery), '_blank');

  const handleLinkSubmit = () => {
    setLinkError('');
    const url = productLink.trim();
    if (!url)                        { setLinkError(t('marketplace_link_error_empty'));  return; }
    if (!url.startsWith('http'))     { setLinkError(t('marketplace_link_error_http'));   return; }
    if (!isValidMarketplaceUrl(url)) { setLinkError(t('marketplace_link_error_domain')); return; }
    setSelectedProduct({ url, marketplace: detectMarketplace(url) });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ── Barre de recherche / tabs (identique) ── */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setActiveTab('search')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${activeTab === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <Search size={16} />{t('marketplace_tab_search')}
            </button>
            <button onClick={() => { setActiveTab('link'); setTimeout(() => linkRef.current?.focus(), 100); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${activeTab === 'link' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <Link size={16} />{t('marketplace_tab_link')}
            </button>
          </div>
          {activeTab === 'search' && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('marketplace_search_placeholder')}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
          {activeTab === 'link' && (
            <div className="space-y-2">
              <div className="relative">
                <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input ref={linkRef} type="url" value={productLink}
                  onChange={e => { setProductLink(e.target.value); setLinkError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLinkSubmit()}
                  placeholder={t('marketplace_link_placeholder')}
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${linkError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
              </div>
              {linkError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {linkError}</p>}
              <button onClick={handleLinkSubmit}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <ShoppingBag size={16} />{t('marketplace_order_btn')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'search' && (
          <>
            {/* ── Comment ça marche (identique) ── */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
              <p className="text-sm font-semibold text-blue-800 mb-3">🛒 {t('marketplace_how_it_works')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[t('marketplace_step1'), t('marketplace_step2'), t('marketplace_step3')].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-xs text-blue-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 🔥 NOUVEAU : Occasion d'Europe ── */}
            <OccasionEuropeSection
              formatPrice={formatPrice}
              language={language}
              onAuthRequired={() => setShowAuthModal(true)}
            />

            {/* ── Séparateur ── */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                🌍 {language === 'de' ? 'Marktplätze durchsuchen' : language === 'ln' ? 'Luka na ba-marché' : 'Parcourir les marchés'}
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* ── Marchés existants (identiques) ── */}
            <p className="text-sm font-semibold text-gray-700 mb-3">{t('marketplace_choose')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MARKETPLACES.map(mp => (
                <button key={mp.id} onClick={() => handleMarketplaceOpen(mp)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-blue-200 p-5 text-left group">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 ${mp.color} rounded-2xl flex items-center justify-center text-2xl`}>{mp.logo}</div>
                    <ExternalLink size={16} className="text-gray-300 group-hover:text-blue-500 transition" />
                  </div>
                  <p className="text-base font-bold text-gray-900 mb-1">{mp.name}</p>
                  <p className="text-xs text-gray-500 mb-3">{getMpDesc(mp.descKey)}</p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                    {searchQuery ? `„${searchQuery}" ${t('marketplace_search_on')}` : t('marketplace_open')}
                    <ArrowRight size={13} />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 bg-green-50 border border-green-100 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <Link size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800">{t('marketplace_found')}</p>
                <p className="text-xs text-green-700 mt-0.5">{t('marketplace_found_desc')}</p>
                <button onClick={() => setActiveTab('link')} className="mt-2 text-xs font-semibold text-green-700 underline underline-offset-2">{t('marketplace_submit_link')}</button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'link' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-800 mb-4">📋 {t('marketplace_supported')}</p>
              <div className="space-y-2">
                {MARKETPLACES.map(mp => (
                  <div key={mp.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className={`w-8 h-8 ${mp.color} rounded-xl flex items-center justify-center text-sm`}>{mp.logo}</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{mp.name}</p>
                      <p className="text-xs text-gray-400">{mp.domain}</p>
                    </div>
                    <CheckCircle size={16} className="text-green-500" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-orange-800 mb-1">💡 Tip</p>
              <p className="text-xs text-orange-700">{t('marketplace_tip')}</p>
            </div>
          </div>
        )}
      </div>

      {selectedProduct && (
        <OrderModal product={selectedProduct} onClose={() => { setSelectedProduct(null); setProductLink(''); }} />
      )}

      {/* Login-Modal wenn nicht eingeloggt */}
      {showAuthModal && (
        <div
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}
          onClick={() => setShowAuthModal(false)}
        >
          <div style={{background:'white',borderRadius:'1rem',padding:'2rem',maxWidth:'20rem',width:'100%',textAlign:'center'}}
               onClick={e => e.stopPropagation()}>
            <p className="text-xl mb-2">🔐</p>
            <p className="font-bold text-gray-900 mb-1">
              {language === 'de' ? 'Anmeldung erforderlich' : language === 'ln' ? 'Kokota esengeli' : 'Connexion requise'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {language === 'de' ? 'Bitte melde dich an um Produkte in den Warenkorb zu legen.' : language === 'ln' ? 'Kota liboso ya kotya na panier.' : 'Connectez-vous pour ajouter des produits au panier.'}
            </p>
            <button onClick={() => setShowAuthModal(false)}
              className="w-full py-2.5 bg-[#0A5EB0] text-white rounded-xl text-sm font-semibold">
              {language === 'de' ? 'Schließen' : 'Fermer'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

