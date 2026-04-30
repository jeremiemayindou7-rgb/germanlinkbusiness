import { useState, useRef } from 'react';
import {
  Search, ExternalLink, X, ChevronRight, CheckCircle,
  ShoppingBag,
  AlertCircle, Loader2, Link, ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const FEES = { pickup: 25, shipping: 45, service: 15 };
const WHATSAPP_NUMBER = '4915xxxxxxxxx'; // ← deine GLB WhatsApp-Nummer

const MARKETPLACES = [
  {
    id:          'ebay',
    name:        'eBay.de',
    color:       'bg-yellow-400',
    badgeBg:     'bg-yellow-100 text-yellow-800',
    logo:        '🛒',
    descKey:     'mp_ebay_desc',
    searchUrl:   (q: string) => `https://www.ebay.de/sch/i.html?_nkw=${encodeURIComponent(q)}`,
    domain:      'ebay.de',
  },
  {
    id:          'kleinanzeigen',
    name:        'Kleinanzeigen',
    color:       'bg-green-500',
    badgeBg:     'bg-green-100 text-green-800',
    logo:        '📋',
    descKey:     'mp_klein_desc',
    searchUrl:   (q: string) => `https://www.kleinanzeigen.de/s/${encodeURIComponent(q)}/k0`,
    domain:      'kleinanzeigen.de',
  },
  {
    id:          'amazon',
    name:        'Amazon.de',
    color:       'bg-orange-400',
    badgeBg:     'bg-orange-100 text-orange-800',
    logo:        '📦',
    descKey:     'mp_amazon_desc',
    searchUrl:   (q: string) => `https://www.amazon.de/s?k=${encodeURIComponent(q)}`,
    domain:      'amazon.de',
  },
  {
    id:          'rebuy',
    name:        'reBuy.de',
    color:       'bg-blue-500',
    badgeBg:     'bg-blue-100 text-blue-800',
    logo:        '♻️',
    descKey:     'mp_rebuy_desc',
    searchUrl:   (q: string) => `https://www.rebuy.de/kaufen/angebote?search=${encodeURIComponent(q)}`,
    domain:      'rebuy.de',
  },
  {
    id:          'vinted',
    name:        'Vinted.de',
    color:       'bg-teal-500',
    badgeBg:     'bg-teal-100 text-teal-800',
    logo:        '👕',
    descKey:     'mp_vinted_desc',
    searchUrl:   (q: string) => `https://www.vinted.de/catalog?search_text=${encodeURIComponent(q)}`,
    domain:      'vinted.de',
  },
];

// Marketplace descriptions (not in context to keep it simple)
const MP_DESCS: Record<string, { de: string; fr: string; ln: string }> = {
  mp_ebay_desc:   { de: 'Neu & Gebraucht — Privat & Händler',      fr: 'Neuf & Occasion — Particuliers & Pro',      ln: 'Ya sika & ya kala — Privé & Vendeur' },
  mp_klein_desc:  { de: 'Lokale Angebote — Privat',                 fr: 'Annonces locales — Particuliers',           ln: 'Ba-annonces ya esika — Privé' },
  mp_amazon_desc: { de: 'Neu & Warehouse — Schnelle Lieferung',     fr: 'Neuf & Warehouse — Livraison rapide',       ln: 'Ya sika & Warehouse — Kokaba noki' },
  mp_rebuy_desc:  { de: 'Generalüberholt — Mit Garantie',           fr: 'Reconditionné — Avec garantie',             ln: 'Ebongwami — Na garantie' },
  mp_vinted_desc: { de: 'Mode & Accessoires — Second Hand',         fr: 'Mode & Accessoires — Seconde main',         ln: 'Bilamba & Accessoires — Ya mibale' },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);

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
  return ['ebay.de', 'kleinanzeigen.de', 'amazon.de', 'rebuy.de', 'vinted.de']
    .some(d => url.toLowerCase().includes(d));
}

function buildWhatsAppMessage(
  tracking: string,
  url: string,
  marketplace: string,
  details: OrderDetails,
  total: number,
  lang: 'de' | 'fr' | 'ln',
): string {
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
    details.note    ? `• ${labels.note}: ${details.note}`       : '',
    `• ${labels.city}: ${details.city}`,
    `• ${labels.customs}: ${details.customs === 'with' ? labels.yes : labels.no}`, ``,
    `💰 *${labels.total}: ${fmt(total)}*`,
    `🔖 *${labels.tracking}: ${tracking}*`,
  ].filter(Boolean);
  return encodeURIComponent(lines.join('\n'));
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP INDICATOR
// ─────────────────────────────────────────────────────────────────────────────

function StepIndicator({ current, t }: { current: OrderStep; t: (k: string) => string }) {
  const steps = [
    t('order_step_product'),
    t('order_step_offer'),
    t('order_step_payment'),
    t('order_step_confirmation'),
  ];
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((label, i) => {
        const step   = (i + 1) as OrderStep;
        const done   = step < current;
        const active = step === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {done ? <CheckCircle size={15} /> : step}
              </div>
              <span className={`text-[10px] font-medium ${active ? 'text-blue-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-6 h-px mx-1 mb-5 ${step < current ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDER MODAL
// ─────────────────────────────────────────────────────────────────────────────

interface OrderModalProps {
  product:  ParsedProduct;
  onClose:  () => void;
}

function OrderModal({ product, onClose }: OrderModalProps) {
  const { t, language } = useLanguage();
  const [step,       setStep]       = useState<OrderStep>(1);
  const [isSaving,   setIsSaving]   = useState(false);
  const [saveError,  setSaveError]  = useState<string | null>(null);
  const [trackingNo, setTrackingNo] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);
  const [details, setDetails] = useState<OrderDetails>({
    qty: 1, variant: '', note: '', city: 'Brazzaville', customs: 'with',
  });

  const grandTotal = estimatedPrice * details.qty + FEES.pickup + FEES.shipping + FEES.service;
  const set = <K extends keyof OrderDetails>(k: K, v: OrderDetails[K]) =>
    setDetails(d => ({ ...d, [k]: v }));

  const handleConfirmPayment = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const tracking = mkTrackingNo();
      const { error } = await supabase.from('marketplace_orders').insert({
        tracking_number:  tracking,
        product_title:    'Produkt via Link',
        product_url:      product.url,
        product_price:    estimatedPrice,
        marketplace:      product.marketplace,
        condition:        'unknown',
        quantity:         details.qty,
        variant:          details.variant || null,
        note:             details.note    || null,
        delivery_city:    details.city,
        customs_included: details.customs === 'with',
        fee_pickup:       FEES.pickup,
        fee_shipping:     FEES.shipping,
        fee_service:      FEES.service,
        total_amount:     grandTotal,
        status:           'paid',
      });
      if (error) throw new Error(error.message);
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex-1 pr-4">
            <p className="text-xs text-gray-400 mb-1">{product.marketplace}</p>
            <p className="text-xs text-gray-500 line-clamp-1 font-mono">{product.url}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl transition">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="px-5 pt-4 pb-5 overflow-y-auto">
          <StepIndicator current={step} t={t} />

          {/* ── SCHRITT 1: Produktdetails ── */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-700">{t('order_product_details')}</p>

              {/* Preis */}
              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  {t('order_product_price')} <span className="text-red-500">*</span>
                </label>
                <input type="number" min={0}
                  value={estimatedPrice || ''}
                  onChange={e => setEstimatedPrice(Number(e.target.value))}
                  placeholder="199"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">{t('order_price_hint')}</p>
              </div>

              {/* Menge */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">{t('order_quantity')}</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => set('qty', Math.max(1, details.qty - 1))}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center font-bold hover:bg-gray-50">−</button>
                  <span className="w-8 text-center text-sm font-bold">{details.qty}</span>
                  <button onClick={() => set('qty', details.qty + 1)}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center font-bold hover:bg-gray-50">+</button>
                </div>
              </div>

              {/* Größe / Farbe */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">{t('order_variant')}</label>
                <input type="text" value={details.variant}
                  onChange={e => set('variant', e.target.value)}
                  placeholder={t('order_variant_placeholder')}
                  className="w-40 px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Lieferort */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">{t('order_delivery_city')}</label>
                <select value={details.city}
                  onChange={e => set('city', e.target.value as OrderDetails['city'])}
                  className="w-40 px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Brazzaville</option>
                  <option>Kinshasa</option>
                  <option>Pointe-Noire</option>
                </select>
              </div>

              {/* Hinweis */}
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
                <button onClick={onClose}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                  {t('order_cancel')}
                </button>
                <button onClick={() => setStep(2)} disabled={estimatedPrice === 0}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-40 flex items-center justify-center gap-1">
                  {t('order_next')} <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── SCHRITT 2: Angebot ── */}
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

              {/* Verzollung */}
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2">{t('order_customs')}</p>
                <div className="flex gap-2">
                  <button onClick={() => set('customs', 'with')}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-left border transition ${
                      details.customs === 'with' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}>
                    <p className="text-xs font-semibold">{t('order_customs_with')}</p>
                    <p className={`text-[10px] mt-0.5 ${details.customs === 'with' ? 'text-blue-200' : 'text-gray-400'}`}>
                      {t('order_customs_with_sub')}
                    </p>
                  </button>
                  <button onClick={() => set('customs', 'without')}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-left border transition ${
                      details.customs === 'without' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}>
                    <p className="text-xs font-semibold">{t('order_customs_without')}</p>
                    <p className={`text-[10px] mt-0.5 ${details.customs === 'without' ? 'text-blue-200' : 'text-gray-400'}`}>
                      {t('order_customs_without_sub')}
                    </p>
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                  {t('order_go_back')}
                </button>
                <button onClick={() => setStep(3)}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                  {t('order_accept')}
                </button>
              </div>
            </div>
          )}

          {/* ── SCHRITT 3: Zahlung ── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-700">{t('order_payment_title')}</p>
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <p className="text-xs font-bold text-orange-800 mb-2">📋 {t('order_payment_instruction_title')}</p>
                <ul className="text-xs text-orange-700 space-y-1.5">
                  <li>• {t('order_payment_step1')}</li>
                  <li>• {t('order_payment_step2')}</li>
                  <li>• {t('order_payment_step3')}</li>
                  <li>• {t('order_payment_step4')}</li>
                </ul>
              </div>
              <div className="space-y-2">
                {[
                  { label: t('order_to_pay'),       value: fmt(grandTotal), bold: true },
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
                <button onClick={() => setStep(2)} disabled={isSaving}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">
                  {t('order_go_back')}
                </button>
                <button onClick={handleConfirmPayment} disabled={isSaving}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSaving
                    ? <><Loader2 size={15} className="animate-spin" /> {t('order_saving')}</>
                    : t('order_confirm_payment')
                  }
                </button>
              </div>
            </div>
          )}

          {/* ── SCHRITT 4: Bestätigung ── */}
          {step === 4 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">{t('order_confirmed_title')}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {t('order_confirmed_desc')} <strong>{details.city}</strong>.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-left">
                {[
                  { label: t('order_status'),      value: `✅ ${t('paid')}`,          color: 'text-green-600' },
                  { label: 'Tracking-Nr.',          value: trackingNo,                  color: 'text-blue-600'  },
                  { label: t('order_next_step'),    value: t('order_next_step'),        color: 'text-gray-800'  },
                  { label: t('estimated_delivery'), value: t('order_delivery_time'),    color: 'text-gray-800'  },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 mb-0.5">{item.label}</p>
                    <p className={`text-sm font-semibold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-left">
                <p className="text-xs font-bold text-blue-700 mb-3">{t('order_next_steps_title')}</p>
                {[
                  t('order_process_1'),
                  t('order_process_2'),
                  t('order_process_3'),
                  t('order_process_4'),
                  `${t('order_process_5')} ${details.city}`,
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-xs text-blue-700">{s}</span>
                  </div>
                ))}
              </div>
              <button onClick={openWhatsApp}
                className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {t('order_whatsapp_btn')}
              </button>
              <button onClick={onClose}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                {t('order_done')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function MarketplaceSearch() {
  const { t, language } = useLanguage();

  const [searchQuery,     setSearchQuery]     = useState('');
  const [productLink,     setProductLink]     = useState('');
  const [linkError,       setLinkError]       = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ParsedProduct | null>(null);
  const [activeTab,       setActiveTab]       = useState<'search' | 'link'>('search');
  const linkRef = useRef<HTMLInputElement>(null);

  const getMpDesc = (descKey: string) =>
    MP_DESCS[descKey]?.[language as 'de' | 'fr' | 'ln'] ?? '';

  const handleMarketplaceOpen = (mp: typeof MARKETPLACES[0]) => {
    window.open(mp.searchUrl(searchQuery), '_blank');
  };

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

      {/* ── Sticky Header ── */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button onClick={() => setActiveTab('search')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${
                activeTab === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              <Search size={16} />
              {t('marketplace_tab_search')}
            </button>
            <button onClick={() => { setActiveTab('link'); setTimeout(() => linkRef.current?.focus(), 100); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${
                activeTab === 'link' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              <Link size={16} />
              {t('marketplace_tab_link')}
            </button>
          </div>

          {/* Tab: Suche */}
          {activeTab === 'search' && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('marketplace_search_placeholder')}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Tab: Link */}
          {activeTab === 'link' && (
            <div className="space-y-2">
              <div className="relative">
                <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input ref={linkRef} type="url" value={productLink}
                  onChange={e => { setProductLink(e.target.value); setLinkError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleLinkSubmit()}
                  placeholder={t('marketplace_link_placeholder')}
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    linkError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
              </div>
              {linkError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} /> {linkError}
                </p>
              )}
              <button onClick={handleLinkSubmit}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <ShoppingBag size={16} />
                {t('marketplace_order_btn')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* ── TAB SUCHE ── */}
        {activeTab === 'search' && (
          <>
            {/* Anleitung */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
              <p className="text-sm font-semibold text-blue-800 mb-3">🛒 {t('marketplace_how_it_works')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  t('marketplace_step1'),
                  t('marketplace_step2'),
                  t('marketplace_step3'),
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-xs text-blue-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Marktplatz-Kacheln */}
            <p className="text-sm font-semibold text-gray-700 mb-3">{t('marketplace_choose')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MARKETPLACES.map(mp => (
                <button key={mp.id} onClick={() => handleMarketplaceOpen(mp)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-blue-200 p-5 text-left group">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 ${mp.color} rounded-2xl flex items-center justify-center text-2xl`}>
                      {mp.logo}
                    </div>
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

            {/* Hinweis */}
            <div className="mt-6 bg-green-50 border border-green-100 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <Link size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800">{t('marketplace_found')}</p>
                <p className="text-xs text-green-700 mt-0.5">{t('marketplace_found_desc')}</p>
                <button onClick={() => setActiveTab('link')}
                  className="mt-2 text-xs font-semibold text-green-700 underline underline-offset-2">
                  {t('marketplace_submit_link')}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── TAB LINK ── */}
        {activeTab === 'link' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-gray-800 mb-4">📋 {t('marketplace_supported')}</p>
              <div className="space-y-2">
                {MARKETPLACES.map(mp => (
                  <div key={mp.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className={`w-8 h-8 ${mp.color} rounded-xl flex items-center justify-center text-sm`}>
                      {mp.logo}
                    </div>
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

      {/* ── Order Modal ── */}
      {selectedProduct && (
        <OrderModal
          product={selectedProduct}
          onClose={() => { setSelectedProduct(null); setProductLink(''); }}
        />
      )}
    </div>
  );
}

