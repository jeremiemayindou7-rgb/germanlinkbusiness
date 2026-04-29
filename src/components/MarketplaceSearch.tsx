import { useState, useEffect, useRef } from 'react';
import {
  Search, Filter, ExternalLink, MapPin, Package,
  X, ChevronRight, CheckCircle, ShoppingBag, Truck,
  CreditCard, ClipboardList, AlertCircle, Loader2,
} from 'lucide-react';
import { germanMarketplaceService, MarketplaceProduct, SearchFilters } from '../services/germanMarketplaceService';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase'; // ← dein bestehender Supabase-Client

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

interface SupabaseOrder {
  tracking_number:   string;
  product_title:     string;
  product_url:       string;
  product_price:     number;
  marketplace:       string;
  condition:         string;
  quantity:          number;
  variant:           string | null;
  note:              string | null;
  delivery_city:     string;
  customs_included:  boolean;
  fee_pickup:        number;
  fee_shipping:      number;
  fee_service:       number;
  total_amount:      number;
  status:            string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const FEES = { pickup: 25, shipping: 45, service: 15 };

const STEP_META: { label: string; icon: typeof ClipboardList }[] = [
  { label: 'Details',     icon: ClipboardList },
  { label: 'Angebot',     icon: Truck },
  { label: 'Zahlung',     icon: CreditCard },
  { label: 'Bestätigung', icon: CheckCircle },
];

const WHATSAPP_NUMBER = '491622896160'; // ← deine GLB WhatsApp-Nummer eintragen

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);

const mkTrackingNo = () =>
  'GLB-' + Math.floor(10000 + Math.random() * 90000);

function buildWhatsAppMessage(
  tracking: string,
  product: MarketplaceProduct,
  details: OrderDetails,
  total: number,
): string {
  const lines = [
    `🛍️ *Neue GLB Bestellung*`,
    ``,
    `📦 *Produkt:* ${product.title}`,
    `🔗 *Link:* ${product.url}`,
    `💶 *Produktpreis:* ${fmt(product.price)}`,
    `🏪 *Marktplatz:* ${germanMarketplaceService.getMarketplaceName(product.marketplace)}`,
    ``,
    `📋 *Details:*`,
    `• Menge: ${details.qty}`,
    details.variant ? `• Variante: ${details.variant}` : '',
    details.note    ? `• Hinweis: ${details.note}`    : '',
    ``,
    `🚚 *Lieferung:*`,
    `• Stadt: ${details.city}`,
    `• Verzollung: ${details.customs === 'with' ? 'Ja (bis Haustür)' : 'Nein (Hafen)'}`,
    ``,
    `💰 *Gesamtbetrag: ${fmt(total)}*`,
    `🔖 *Tracking-Nr.: ${tracking}*`,
  ].filter(l => l !== '');
  return encodeURIComponent(lines.join('\n'));
}

const marketplaceBadge: Record<MarketplaceProduct['marketplace'], string> = {
  ebay:          'bg-yellow-100 text-yellow-800',
  kleinanzeigen: 'bg-green-100  text-green-800',
  amazon:        'bg-orange-100 text-orange-800',
  rebuy:         'bg-blue-100   text-blue-800',
  vinted:        'bg-teal-100   text-teal-800',
};

const conditionBadge: Record<MarketplaceProduct['condition'], string> = {
  new:         'bg-green-100  text-green-800',
  used:        'bg-yellow-100 text-yellow-800',
  refurbished: 'bg-blue-100   text-blue-800',
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP INDICATOR
// ─────────────────────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: OrderStep }) {
  return (
    <div className="flex items-center justify-between mb-6">
      {STEP_META.map(({ label }, i) => {
        const step   = (i + 1) as OrderStep;
        const done   = step < current;
        const active = step === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  done   ? 'bg-green-500 text-white' :
                  active ? 'bg-blue-600  text-white' :
                           'bg-gray-100  text-gray-400'
                }`}
              >
                {done ? <CheckCircle size={15} /> : step}
              </div>
              <span className={`text-[10px] font-medium ${active ? 'text-blue-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEP_META.length - 1 && (
              <div className={`w-6 h-px mx-1 mb-5 transition-colors duration-300 ${step < current ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDER MODAL — vollständiger 4-Schritt GLB Flow
// ─────────────────────────────────────────────────────────────────────────────

interface OrderModalProps {
  product: MarketplaceProduct;
  onClose: () => void;
}

function OrderModal({ product, onClose }: OrderModalProps) {
  const [step,       setStep]       = useState<OrderStep>(1);
  const [isSaving,   setIsSaving]   = useState(false);
  const [saveError,  setSaveError]  = useState<string | null>(null);
  const [trackingNo, setTrackingNo] = useState('');
  const [details, setDetails] = useState<OrderDetails>({
    qty: 1, variant: '', note: '', city: 'Brazzaville', customs: 'with',
  });

  const productTotal = product.price * details.qty;
  const grandTotal   = productTotal + FEES.pickup + FEES.shipping + FEES.service;

  const set = <K extends keyof OrderDetails>(k: K, v: OrderDetails[K]) =>
    setDetails(d => ({ ...d, [k]: v }));

  // ── Bestellung in Supabase speichern ──
  const saveOrder = async (): Promise<string | null> => {
    const tracking = mkTrackingNo();
    const order: SupabaseOrder = {
      tracking_number:  tracking,
      product_title:    product.title,
      product_url:      product.url,
      product_price:    product.price,
      marketplace:      product.marketplace,
      condition:        product.condition,
      quantity:         details.qty,
      variant:          details.variant || null,
      note:             details.note    || null,
      delivery_city:    details.city,
      customs_included: details.customs === 'with',
      fee_pickup:       FEES.pickup,
      fee_shipping:     FEES.shipping,
      fee_service:      FEES.service,
      total_amount:     grandTotal,
      status:           'pending_payment',
    };

    const { error } = await supabase.from('marketplace_orders').insert(order);
    if (error) throw new Error(error.message);
    return tracking;
  };

  // ── Zahlung bestätigen → speichern → Schritt 4 ──
  const handleConfirmPayment = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const tracking = await saveOrder();
      if (!tracking) throw new Error('Tracking-Nummer konnte nicht erstellt werden');
      setTrackingNo(tracking);

      // Status auf bezahlt setzen
      await supabase
        .from('marketplace_orders')
        .update({ status: 'paid' })
        .eq('tracking_number', tracking);

      setStep(4);
    } catch (err: any) {
      setSaveError(err.message ?? 'Unbekannter Fehler. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── WhatsApp-Nachricht öffnen ──
  const openWhatsApp = () => {
    const msg = buildWhatsAppMessage(trackingNo, product, details, grandTotal);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden max-h-[92vh] flex flex-col">

        {/* ── Modal Header ── */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex-1 pr-4">
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mb-1 ${marketplaceBadge[product.marketplace]}`}>
              {germanMarketplaceService.getMarketplaceName(product.marketplace)}
            </span>
            <p className="text-sm font-semibold text-gray-900 line-clamp-2">{product.title}</p>
            <p className="text-xl font-bold text-blue-600 mt-1">{fmt(product.price)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-xl transition"
            aria-label="Schließen"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* ── Modal Body (scrollbar) ── */}
        <div className="px-5 pt-4 pb-5 overflow-y-auto">
          <StepIndicator current={step} />

          {/* ───────────── SCHRITT 1: Details ───────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-700">Bestelldetails eingeben</p>

              <div className="space-y-3">
                {/* Menge */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Menge</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => set('qty', Math.max(1, details.qty - 1))}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition font-bold"
                    >−</button>
                    <span className="w-8 text-center text-sm font-bold text-gray-900">{details.qty}</span>
                    <button
                      onClick={() => set('qty', details.qty + 1)}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition font-bold"
                    >+</button>
                  </div>
                </div>

                {/* Größe / Farbe */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Größe / Farbe</label>
                  <input
                    type="text"
                    value={details.variant}
                    onChange={e => set('variant', e.target.value)}
                    placeholder="z.B. Rot, XL"
                    className="w-40 px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Lieferort */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Lieferort</label>
                  <select
                    value={details.city}
                    onChange={e => set('city', e.target.value as OrderDetails['city'])}
                    className="w-40 px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Brazzaville</option>
                    <option>Kinshasa</option>
                    <option>Pointe-Noire</option>
                  </select>
                </div>

                {/* Hinweis */}
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Hinweis (optional)</label>
                  <textarea
                    value={details.note}
                    onChange={e => set('note', e.target.value)}
                    placeholder="z.B. bitte gut verpacken, Rechnungskopie beilegen…"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Mini-Preisvorschau */}
              <div className="flex justify-between items-center bg-blue-50 rounded-xl px-4 py-2.5">
                <span className="text-sm text-blue-700">Produktpreis ({details.qty}×)</span>
                <span className="text-sm font-bold text-blue-700">{fmt(productTotal)}</span>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-1"
                >
                  Weiter <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ───────────── SCHRITT 2: Gesamtangebot ───────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-700">Ihr GLB-Gesamtangebot</p>

              <div className="space-y-2">
                {[
                  { label: `Produktpreis (${details.qty}×)`, value: fmt(productTotal) },
                  { label: 'Abholung in Deutschland',        value: `+ ${fmt(FEES.pickup)}` },
                  { label: 'Verschiffung nach Congo',        value: `+ ${fmt(FEES.shipping)}` },
                  { label: 'GLB Servicegebühr',              value: `+ ${fmt(FEES.service)}` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between px-3 py-2.5 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-semibold text-gray-800">{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between px-3 py-3 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-sm font-bold text-blue-700">Gesamt</span>
                  <span className="text-base font-bold text-blue-700">{fmt(grandTotal)}</span>
                </div>
              </div>

              {/* Verzollung */}
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2">Verzollung wählen</p>
                <div className="flex gap-2">
                  {([
                    { key: 'with',    label: '✓ Mit Verzollung', sub: 'Lieferung bis Haustür' },
                    { key: 'without', label: 'Ohne Verzollung',  sub: 'Abholung am Hafen' },
                  ] as const).map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => set('customs', opt.key)}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-left border transition ${
                        details.customs === opt.key
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <p className="text-xs font-semibold">{opt.label}</p>
                      <p className={`text-[10px] mt-0.5 ${details.customs === opt.key ? 'text-blue-200' : 'text-gray-400'}`}>
                        {opt.sub}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lieferzeitinfo */}
              <div className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                <Truck size={14} className="text-gray-400 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-500">
                  Geschätzte Lieferzeit: <strong>3–6 Wochen</strong> nach Zahlungseingang.
                  GLB übernimmt Kauf, Abholung, Verpackung und Verschiffung.
                </p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                  ← Zurück
                </button>
                <button onClick={() => setStep(3)} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                  Akzeptieren →
                </button>
              </div>
            </div>
          )}

          {/* ───────────── SCHRITT 3: Zahlung ───────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-700">Zahlung — UBA Congo</p>

              {/* Anweisung */}
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <p className="text-xs font-bold text-orange-800 mb-2">📋 Zahlungsanweisung</p>
                <ul className="text-xs text-orange-700 space-y-1.5 leading-relaxed">
                  <li>• Ein GLB-Agent begleitet Sie zur UBA-Filiale</li>
                  <li>• Zahlung in CDF oder USD möglich</li>
                  <li>• Sie erhalten sofort eine offizielle Quittung</li>
                  <li>• Tracking-Nummer wird direkt per WhatsApp gesendet</li>
                </ul>
              </div>

              {/* Bestellübersicht */}
              <div className="space-y-2">
                {[
                  { label: 'Zu zahlen',  value: fmt(grandTotal), bold: true },
                  { label: 'Lieferort',  value: details.city },
                  { label: 'Verzollung', value: details.customs === 'with' ? 'Ja (bis Haustür)' : 'Nein (Hafen)' },
                  ...(details.variant ? [{ label: 'Variante', value: details.variant }] : []),
                  ...(details.note    ? [{ label: 'Hinweis',  value: details.note    }] : []),
                ].map(row => (
                  <div key={row.label} className="flex justify-between px-3 py-2 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className={`text-sm ${row.bold ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Fehleranzeige */}
              {saveError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                  <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-600">{saveError}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  disabled={isSaving}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  ← Zurück
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSaving
                    ? <><Loader2 size={15} className="animate-spin" /> Wird gespeichert…</>
                    : 'Zahlung bestätigt ✓'
                  }
                </button>
              </div>
            </div>
          )}

          {/* ───────────── SCHRITT 4: Bestätigung ───────────── */}
          {step === 4 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-600" />
              </div>

              <div>
                <p className="text-base font-bold text-gray-900">Bestellung aufgenommen!</p>
                <p className="text-sm text-gray-500 mt-1">
                  GLB kauft Ihr Produkt und liefert nach{' '}
                  <strong className="text-gray-700">{details.city}</strong>.
                </p>
              </div>

              {/* Status-Kacheln */}
              <div className="grid grid-cols-2 gap-2 text-left">
                {[
                  { label: 'Status',          value: '✅ Bezahlt',         color: 'text-green-600' },
                  { label: 'Tracking-Nr.',    value: trackingNo,           color: 'text-blue-600'  },
                  { label: 'Nächster Schritt',value: 'GLB kauft Produkt', color: 'text-gray-800'  },
                  { label: 'Lieferzeit',      value: '3–6 Wochen',         color: 'text-gray-800'  },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 mb-0.5">{item.label}</p>
                    <p className={`text-sm font-semibold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Prozess-Timeline */}
              <div className="bg-blue-50 rounded-xl p-4 text-left">
                <p className="text-xs font-bold text-blue-700 mb-3">Nächste Schritte</p>
                {[
                  'GLB kauft Produkt beim Verkäufer',
                  'Qualitätskontrolle & Verpackung',
                  'Containerverladung & Verschiffung',
                  'Verzollung & Inland-Lieferung',
                  `Übergabe in ${details.city}`,
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-xs text-blue-700 leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>

              {/* WhatsApp Button */}
              <button
                onClick={openWhatsApp}
                className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Bestellung per WhatsApp senden
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
              >
                Fertig — Zur Übersicht
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT — MarketplaceSearch
// ─────────────────────────────────────────────────────────────────────────────

export default function MarketplaceSearch() {
  const { t } = useLanguage();

  const [searchQuery,     setSearchQuery]     = useState('');
  const [isSearching,     setIsSearching]     = useState(false);
  const [products,        setProducts]        = useState<MarketplaceProduct[]>([]);
  const [showFilters,     setShowFilters]     = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    condition: 'all', marketplace: 'all', sortBy: 'relevance',
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Suche mit Debounce ──
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await germanMarketplaceService.searchAllMarketplaces(searchQuery, filters);
      setProducts(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (searchQuery.trim()) handleSearch();
      else setProducts([]);
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, filters]);

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(price);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* ── Sticky Search + Filter Bar ── */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Suche nach Produkten auf deutschen Marktplätzen..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl flex items-center gap-2 text-sm transition ${
                showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter size={18} />
              Filter
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Zustand</label>
                <select
                  value={filters.condition ?? 'all'}
                  onChange={e => setFilters({ ...filters, condition: e.target.value as SearchFilters['condition'] })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alle</option>
                  <option value="new">Neu</option>
                  <option value="used">Gebraucht</option>
                  <option value="refurbished">Generalüberholt</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Marktplatz</label>
                <select
                  value={filters.marketplace ?? 'all'}
                  onChange={e => setFilters({ ...filters, marketplace: e.target.value as SearchFilters['marketplace'] })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Sortierung</label>
                <select
                  value={filters.sortBy ?? 'relevance'}
                  onChange={e => setFilters({ ...filters, sortBy: e.target.value as SearchFilters['sortBy'] })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">Relevanz</option>
                  <option value="price_asc">Preis ↑</option>
                  <option value="price_desc">Preis ↓</option>
                  <option value="newest">Neueste zuerst</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Preisbereich (€)</label>
                <div className="flex gap-2">
                  <input
                    type="number" placeholder="Min"
                    value={filters.minPrice ?? ''}
                    onChange={e => setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number" placeholder="Max"
                    value={filters.maxPrice ?? ''}
                    onChange={e => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Loading */}
        {isSearching && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        )}

        {/* Keine Ergebnisse */}
        {!isSearching && products.length === 0 && searchQuery && (
          <div className="text-center py-16">
            <Package size={44} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Keine Produkte gefunden</p>
            <p className="text-sm text-gray-400 mt-1">Versuchen Sie andere Suchbegriffe oder weniger Filter</p>
          </div>
        )}

        {/* Leer-Zustand */}
        {!isSearching && products.length === 0 && !searchQuery && (
          <div className="text-center py-16">
            <ShoppingBag size={44} className="mx-auto text-blue-300 mb-3" />
            <p className="text-gray-700 font-semibold text-base">Produkt suchen — GLB liefert nach Congo</p>
            <p className="text-sm text-gray-400 mt-1 mb-6">
              Geben Sie oben einen Suchbegriff ein. Wir kaufen, holen ab und liefern.
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {(['ebay', 'kleinanzeigen', 'amazon', 'rebuy', 'vinted'] as const).map(mp => (
                <span key={mp} className={`px-3 py-1 rounded-full text-xs font-semibold ${marketplaceBadge[mp]}`}>
                  {germanMarketplaceService.getMarketplaceName(mp)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Produkte Grid ── */}
        {!isSearching && products.length > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-bold text-gray-800">{products.length}</span> Produkte gefunden
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                >
                  {product.imageUrl && (
                    <div className="relative h-44 bg-gray-100">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${marketplaceBadge[product.marketplace]}`}>
                        {germanMarketplaceService.getMarketplaceName(product.marketplace)}
                      </span>
                      <span className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${conditionBadge[product.condition]}`}>
                        {germanMarketplaceService.getConditionLabel(product.condition)}
                      </span>
                    </div>
                  )}

                  <div className="p-4 flex flex-col flex-1 gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
                      {product.title}
                    </h3>

                    {product.description && (
                      <p className="text-xs text-gray-400 line-clamp-2">{product.description}</p>
                    )}

                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin size={12} />
                      <span>{product.location}</span>
                    </div>

                    {product.seller && (
                      <p className="text-xs text-gray-400">
                        Verkäufer: <span className="text-gray-600 font-medium">{product.seller}</span>
                      </p>
                    )}

                    <div className="mt-auto pt-3 border-t border-gray-100">
                      <div className="flex items-end justify-between mb-3">
                        <div>
                          <p className="text-xl font-bold text-gray-900">
                            {formatPrice(product.price, product.currency)}
                          </p>
                          {product.shippingCost !== undefined && (
                            <p className="text-xs text-gray-400">
                              {product.shippingCost === 0
                                ? 'Versandkostenfrei'
                                : `+ ${formatPrice(product.shippingCost, product.currency)} Versand`}
                            </p>
                          )}
                        </div>
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-blue-500 transition"
                          title="Original-Angebot öffnen"
                        >
                          <ExternalLink size={15} />
                        </a>
                      </div>

                      {/* ★ GLB BESTELL-BUTTON */}
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <ShoppingBag size={15} />
                        Bei GLB bestellen
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Order Modal ── */}
      {selectedProduct && (
        <OrderModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* ── Mobile Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 md:hidden">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{products.length} Ergebnisse</span>
          <button onClick={() => setShowFilters(!showFilters)} className="text-blue-600 font-semibold text-sm">
            Filter anzeigen
          </button>
        </div>
      </div>
    </div>
  );
}

