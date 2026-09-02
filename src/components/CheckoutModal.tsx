import React, { useState, useEffect } from 'react';
import { X, CreditCard, AlertCircle, CheckCircle, Phone, Package, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface SingleProduct {
  id: string;
  name: string;
  sale_price: number;
  source_type?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  singleProduct?: SingleProduct;
}

// ── Versandkosten-Logik ───────────────────────────────────────────────────────
const CBM_RATE = 250; // € pro m³ Seefrachtcontainer
const MIN_SHIPPING = 15; // Mindestversand

interface ShippingInfo {
  mode: 'fixed' | 'cbm' | 'quote';
  estimated: number;
  isEstimate: boolean;
  label: string;
  hint: string;
}

const calcShipping = (totalCbm: number, hasNoMeasurements: boolean): ShippingInfo => {
  if (hasNoMeasurements) {
    return {
      mode: 'quote',
      estimated: 50,
      isEstimate: true,
      label: 'Wird nach Volumen berechnet',
      hint: 'Die endgültigen Versandkosten werden nach Volumen, Gewicht und Zielort berechnet. Sie erhalten vor der Zahlung ein individuelles Angebot.',
    };
  }
  if (totalCbm < 0.05) {
    return {
      mode: 'fixed',
      estimated: Math.max(MIN_SHIPPING, Math.round(totalCbm * CBM_RATE)),
      isEstimate: false,
      label: '',
      hint: 'Kleines Paket — Pauschalversand.',
    };
  }
  const calculated = Math.round(totalCbm * CBM_RATE);
  return {
    mode: 'cbm',
    estimated: Math.max(MIN_SHIPPING, calculated),
    isEstimate: true,
    label: `ca. ${Math.max(MIN_SHIPPING, calculated)} €`,
    hint: `Berechnet nach Volumen (${totalCbm.toFixed(3)} m³ × ${CBM_RATE} €/m³). Die genauen Kosten werden nach Auftragseingang bestätigt.`,
  };
};

// ── Zahlungsmethoden ──────────────────────────────────────────────────────────
// 'lemfi'           = Banküberweisung (Kunde überweist selbstständig, für Kunden in der DR Kongo/RDC)
// 'uba_brazzaville' = Banküberweisung auf UBA-Konto (Kunde überweist selbstständig, für Kunden in
//                     der Republik Kongo/Congo-Brazzaville, wo LemFi nicht verfügbar ist)
// 'cinetpay'        = Mobile Money / Karte über CinetPay — AKTUELL DEAKTIVIERT.
//                     CinetPay-Support hat per E-Mail bestätigt: weder Deutschland (Sitzland GLB)
//                     noch Congo-Brazzaville (Zielland) sind als Länder unterstützt. Der Typ bleibt
//                     im Code, damit alte Bestellungen mit payment_method='cinetpay' nicht crashen,
//                     aber die Option ist im UI nicht mehr wählbar. Falls Flutterwave (in Prüfung)
//                     positiv antwortet, hier durch 'flutterwave' ersetzen bzw. ergänzen.
//
// Die frühere Option 'uba_congo' (Agent begleitet Kunden zur Bank) wurde entfernt.
// Grund: Eine physische Begleitung durch einen "Agenten" zur Bank ist kein reguläres,
// nachvollziehbares Zahlungsverfahren und entspricht bekannten Betrugsmustern
// (Advance-Fee-Fraud). Kunden sollen immer selbstständig zahlen, egal ob per
// Überweisung oder Mobile Money.
//
// WICHTIG zu 'uba_brazzaville': Dies ist AKTUELL eine Übergangslösung. Das Konto
// lautet auf eine Mitinhaberin (Privatperson vor Ort), nicht auf ein eigenes
// GLB-Geschäftskonto, weil letzteres noch nicht existiert. Deshalb wird das im
// Checkout und in E-Mails/Rechnung TRANSPARENT als Übergangslösung ausgewiesen,
// statt es wie ein normales Firmenkonto darzustellen. Sobald ein echtes
// GLB-Geschäftskonto existiert, sollte UBA_ACCOUNT unten aktualisiert und dieser
// Hinweistext entfernt werden.
type PaymentMethod = 'lemfi' | 'uba_brazzaville' | 'cinetpay';

const UBA_ACCOUNT = {
  bankName: 'UBA Congo (United Bank for Africa)',
  accountHolder: 'BAHOUMINA MANOU Roberta Belvine',
  holderRole: 'Mitinhaberin GermanLink Business (Übergangskonto, bis Firmenkonto eröffnet ist)',
  codeBanque: 'BJIQ4KB0RA', // TODO: exakten Code Banque aus RIB übernehmen, falls abweichend
  codeGuichet: '', // TODO: aus RIB ergänzen
  numeroCompte: '', // TODO: aus RIB ergänzen
  ribKey: '', // TODO: RIB-Schlüssel ergänzen
  swift: 'UNAFCGCG',
  branchAddress: '37 Av. William Guynet, Rond point City-Center, B.P. 13534, Brazzaville',
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, singleProduct }) => {
  const { t } = useLanguage();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentOption, setPaymentOption] = useState<'full' | 'deposit'>('full');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('lemfi');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [agbError, setAgbError] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    mode: 'quote', estimated: 50, isEstimate: true,
    label: 'Wird berechnet',
    hint: 'Die Versandkosten werden nach Volumen berechnet.',
  });
  const [showShippingInfo, setShowShippingInfo] = useState(false);

  const subtotal = singleProduct ? singleProduct.sale_price : cartTotal;

  useEffect(() => {
    if (!isOpen) return;
    calcShippingForCart();
  }, [isOpen, cartItems, singleProduct]);

  const calcShippingForCart = async () => {
    try {
      let totalCbm = 0;
      let hasNoMeasurements = false;

      if (singleProduct) {
        const { data } = await supabase
          .from('products')
          .select('volume_cbm, length_cm, width_cm, height_cm')
          .eq('id', singleProduct.id)
          .single();

        if (!data?.volume_cbm && (!data?.length_cm || !data?.width_cm || !data?.height_cm)) {
          hasNoMeasurements = true;
        } else {
          totalCbm = data.volume_cbm || 0;
        }
      } else {
        const productIds = cartItems.map(i => i.product_id);
        if (productIds.length === 0) { hasNoMeasurements = true; }
        else {
          const { data: products } = await supabase
            .from('products')
            .select('id, volume_cbm, length_cm, width_cm, height_cm')
            .in('id', productIds);

          for (const cartItem of cartItems) {
            const prod = products?.find(p => p.id === cartItem.product_id);
            if (!prod?.volume_cbm && (!prod?.length_cm || !prod?.width_cm || !prod?.height_cm)) {
              hasNoMeasurements = true;
              break;
            }
            totalCbm += (prod?.volume_cbm || 0) * cartItem.quantity;
          }
        }
      }

      setShippingInfo(calcShipping(totalCbm, hasNoMeasurements));
    } catch (e) {
      console.error('Shipping calc error:', e);
      setShippingInfo({
        mode: 'quote', estimated: 50, isEstimate: true,
        label: 'Wird berechnet',
        hint: 'Die Versandkosten werden nach Volumen berechnet.',
      });
    }
  };

  const shippingCost = shippingInfo.estimated;
  const total = subtotal + shippingCost;
  const amountToPay = paymentOption === 'deposit' ? total * 0.5 : total;

  const handlePayment = async () => {
    if (!user) return;
    if (!agbAccepted) { setAgbError(true); return; }
    if (!customerPhone.trim()) { alert(t('phone_required')); return; }

    setLoading(true);
    setAgbError(false);

    try {
      const orderNum = `CEE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const orderItems = singleProduct
        ? [{ product_id: singleProduct.id, product_name: singleProduct.name, quantity: 1, price: singleProduct.sale_price, source_type: singleProduct.source_type || 'own' }]
        : cartItems.map(item => ({
            product_id: item.product_id,
            product_name: item.product?.name || '',
            quantity: item.quantity,
            price: item.product?.sale_price || 0,
            source_type: (item.product as any)?.source_type || 'own',
          }));

      const { data: newOrder, error } = await supabase.from('orders').insert({
        order_number:       orderNum,
        user_id:            user.id,
        items:              orderItems,
        subtotal,
        shipping_cost:      shippingCost,
        shipping_mode:      shippingInfo.mode,
        shipping_estimated: shippingInfo.isEstimate,
        total_amount:       total,
        payment_option:     paymentOption,
        payment_method:     paymentMethod,
        customer_phone:     customerPhone,
        payment_status:     'pending',
        order_status:       'awaiting_payment',
        source_type:        'own',
        next_shipment_date: '2026-02-15',
        agb_accepted:       true,
        agb_accepted_at:    new Date().toISOString(),
      }).select().single();

      if (error) throw error;

      let emailOk = true;
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
          body: JSON.stringify({ orderId: newOrder.id, type: 'order_confirmation' })
        });
        if (!emailRes.ok) {
          emailOk = false;
          console.error('Email function returned error status:', emailRes.status, await emailRes.text());
        }
      } catch (e) {
        emailOk = false;
        console.error('Email error:', e);
      }

      setOrderNumber(orderNum);
      setOrderCompleted(true);
      // Wird im Bestätigungs-Screen genutzt, um ehrlich anzuzeigen ob die Mail
      // tatsächlich versendet wurde statt es pauschal zu behaupten.
      (window as any).__lastOrderEmailOk = emailOk;
      if (!singleProduct) await clearCart();

    } catch (error) {
      console.error('Error creating order:', error);
      alert(t('order_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOrderCompleted(false);
    setOrderNumber('');
    setAgbAccepted(false);
    setAgbError(false);
    setShowShippingInfo(false);
    onClose();
  };

  if (!isOpen) return null;

  const emailWasSent = (window as any).__lastOrderEmailOk !== false;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-end sm:items-center justify-center sm:p-4"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div
        className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-lg flex flex-col"
        style={{ maxHeight: 'min(92dvh, calc(100dvh - 64px))', WebkitOverflowScrolling: 'touch' }}
      >
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between rounded-t-lg flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {orderCompleted ? `✓ ${t('order_confirmed_header')}` : t('checkout')}
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1" style={{ paddingBottom: '80px', WebkitOverflowScrolling: 'touch' as any }}>
          {orderCompleted ? (
            <div className="space-y-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-900 mb-2">{t('order_confirmed_title')}</h3>
                <p className="text-green-700 mb-4">{t('order_confirmed_desc')}</p>
                <div className="bg-white rounded-lg p-4 inline-block">
                  <p className="text-sm text-gray-600 mb-1">{t('order_reference')}</p>
                  <p className="text-2xl font-bold text-gray-900">{orderNumber}</p>
                </div>
              </div>

              {shippingInfo.isEstimate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-blue-900 text-sm">Versandkosten werden bestätigt</p>
                      <p className="text-blue-700 text-xs mt-1">{shippingInfo.hint}</p>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'lemfi' && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Zahlungsanweisung — Banküberweisung (LemFi)
                  </h4>
                  <div className="space-y-2 text-sm text-yellow-900 bg-white rounded p-3">
                    <p><strong>Zu zahlender Betrag:</strong> {amountToPay.toFixed(2)} €</p>
                    <p><strong>Empfänger:</strong> GermanLink Business GmbH</p>
                    <p><strong>IBAN:</strong> DE89 3704 0044 0532 0130 00</p>
                    <p className="text-red-700 font-bold"><strong>Verwendungszweck (Pflicht):</strong> {orderNumber}</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'uba_brazzaville' && (
                <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Zahlungsanweisung — Banküberweisung (UBA Brazzaville)
                  </h4>
                  <div className="space-y-2 text-sm text-blue-900 bg-white rounded p-3">
                    <p><strong>Zu zahlender Betrag:</strong> {amountToPay.toFixed(2)} €</p>
                    <p><strong>Bank:</strong> {UBA_ACCOUNT.bankName}</p>
                    <p><strong>Kontoinhaberin:</strong> {UBA_ACCOUNT.accountHolder}</p>
                    <p><strong>Code Banque:</strong> {UBA_ACCOUNT.codeBanque || '(wird noch ergänzt)'}</p>
                    <p><strong>Code Guichet:</strong> {UBA_ACCOUNT.codeGuichet || '(wird noch ergänzt)'}</p>
                    <p><strong>N° de compte:</strong> {UBA_ACCOUNT.numeroCompte || '(wird noch ergänzt)'}</p>
                    <p><strong>Clé RIB:</strong> {UBA_ACCOUNT.ribKey || '(wird noch ergänzt)'}</p>
                    <p><strong>SWIFT/BIC:</strong> {UBA_ACCOUNT.swift}</p>
                    <p className="text-red-700 font-bold"><strong>Verwendungszweck (Pflicht):</strong> {orderNumber}</p>
                    <div className="mt-2 pt-2 border-t border-blue-200 bg-amber-50 -mx-3 -mb-3 px-3 pb-3 rounded-b">
                      <p className="text-xs text-amber-900">
                        <strong>Wichtiger Hinweis:</strong> Dies ist ein Übergangskonto von{' '}
                        {UBA_ACCOUNT.holderRole}, bis GermanLink Business ein eigenes Geschäftskonto in
                        Congo-Brazzaville eröffnet hat. Ihre Zahlung wird intern GermanLink Business zugeordnet
                        und in unserer Buchhaltung entsprechend erfasst.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ehrlicher E-Mail-Status statt pauschaler Behauptung */}
              {emailWasSent ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-600">{t('email_instructions_sent')}</p>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-800">
                    Die Bestätigungs-E-Mail konnte nicht automatisch versendet werden. Bitte notiere dir die
                    Referenznummer <strong>{orderNumber}</strong> und die obigen Zahlungsdaten, oder kontaktiere
                    uns unter info@germanlinkbusiness.de.
                  </p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm"><strong>{t('next_shipment')}:</strong> 15. des Monats</p>
              </div>

              <button onClick={handleClose} className="w-full py-3 bg-[#009543] text-white rounded-lg font-medium">
                {t('close')}
              </button>
            </div>
          ) : (
            <div className="space-y-6">

              {singleProduct && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Produkt</p>
                    <p className="font-bold text-sm text-gray-900 truncate max-w-[280px]">{singleProduct.name}</p>
                  </div>
                  <p className="font-bold text-[#0A5EB0] text-lg">{singleProduct.sale_price.toFixed(2)} €</p>
                </div>
              )}

              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    {t('phone_whatsapp_label')}
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">{t('required_field')}</span>
                  </span>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="+243 XXX XXX XXX oder +242 XXX XXX XXX"
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-blue-600 mt-1">{t('phone_contact_note')}</p>
                </label>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-gray-900">{t('payment_options')}</h3>
                {[
                  { val: 'full',    label: t('full_payment'),  sub: `${t('pay_now_prefix')} ${total.toFixed(2)} € ${t('pay_now_suffix')}` },
                  { val: 'deposit', label: t('deposit_50'),    sub: `${t('pay_now_prefix')} ${(total*0.5).toFixed(2)} € ${t('deposit_rest_note')}` },
                ].map(opt => (
                  <label key={opt.val} className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" value={opt.val}
                      checked={paymentOption === opt.val}
                      onChange={() => setPaymentOption(opt.val as 'full' | 'deposit')}
                      className="mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">{opt.label}</div>
                      <div className="text-sm text-gray-600">{opt.sub}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Zahlungsmethode — nur noch selbstständige Zahlwege, kein Agent */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900">{t('payment_method_title')}</h3>

                {/* Länder-Hinweis: welche Methode passt zu welchem Land */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-xs text-indigo-800">
                  <strong>Hinweis zur Auswahl:</strong> Kunden in der <strong>DR Kongo (RDC)</strong> nutzen bitte
                  „Banküberweisung (LemFi)“. Kunden in der <strong>Republik Kongo / Congo-Brazzaville</strong> nutzen
                  bitte „Banküberweisung (UBA Brazzaville)“.
                </div>

                {[
                  {
                    val: 'lemfi',
                    label: 'Banküberweisung (LemFi) — für Kunden in der DR Kongo (RDC)',
                    sub: 'Selbstständige Überweisung, mit Referenznummer.',
                  },
                  {
                    val: 'uba_brazzaville',
                    label: 'Banküberweisung (UBA Brazzaville) — für Kunden in Congo-Brazzaville (RC)',
                    sub: 'Selbstständige Überweisung auf unser Übergangskonto bei UBA, mit Referenznummer.',
                  },
                ].map(m => (
                  <label key={m.val} className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="paymentMethod" value={m.val}
                      checked={paymentMethod === m.val}
                      onChange={() => setPaymentMethod(m.val as PaymentMethod)}
                      className="mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">{m.label}</div>
                      <div className="text-sm text-gray-600">{m.sub}</div>
                    </div>
                  </label>
                ))}

                {/* Transparenz-Hinweis direkt bei Auswahl von UBA Brazzaville */}
                {paymentMethod === 'uba_brazzaville' && (
                  <div className="ml-4 bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-900">
                    <strong>Wichtiger Hinweis:</strong> Dieses Konto ist ein <strong>Übergangskonto</strong> von{' '}
                    {UBA_ACCOUNT.holderRole}, solange GermanLink Business noch kein eigenes Geschäftskonto in
                    Congo-Brazzaville hat. Ihre Zahlung wird intern GermanLink Business zugeordnet.
                  </div>
                )}
              </div>


              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>{t('subtotal')}</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>

                <div className="flex justify-between text-gray-600 items-start">
                  <div className="flex items-center gap-1">
                    <span>{t('shipping')}</span>
                    <button
                      onClick={() => setShowShippingInfo(!showShippingInfo)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Versandinfo">
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-right">
                    {shippingInfo.isEstimate ? (
                      <div>
                        <span className="text-orange-600 font-medium">
                          ca. {shippingCost.toFixed(2)} €
                        </span>
                        <span className="text-xs text-orange-500 block">Schätzwert</span>
                      </div>
                    ) : (
                      <span>{shippingCost.toFixed(2)} €</span>
                    )}
                  </div>
                </div>

                {showShippingInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" /> Versand nach Kongo
                    </p>
                    <p>{shippingInfo.hint}</p>
                    {shippingInfo.mode === 'cbm' && (
                      <p className="text-blue-600 font-medium">
                        Sammelcontainer · {CBM_RATE} €/m³ · Lieferzeit 8–12 Wochen
                      </p>
                    )}
                    {shippingInfo.mode === 'quote' && (
                      <p className="text-orange-600 font-medium">
                        Nach Auftragseingang erhalten Sie ein individuelles Angebot.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                  <span>{t('total')}</span>
                  <div className="text-right">
                    <span className="text-[#009543]">{total.toFixed(2)} €</span>
                    {shippingInfo.isEstimate && (
                      <span className="text-xs text-orange-500 block font-normal">inkl. Versandschätzung</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between text-xl font-bold text-[#DC241F] pt-2 border-t-2 border-[#DC241F]">
                  <span>{t('to_pay_now')}</span>
                  <span>{amountToPay.toFixed(2)} €</span>
                </div>

                {shippingInfo.isEstimate && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
                    <p className="text-xs text-orange-800">
                      <strong>⚠️ Hinweis:</strong> Die angezeigten Versandkosten sind Schätzwerte.
                      Die endgültigen Transportkosten werden nach Prüfung Ihrer Bestellung bestätigt.
                      Bei Abweichung kontaktieren wir Sie vor der Zahlung.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 border-2 rounded-lg">
                  <input type="checkbox" id="agb-checkbox" checked={agbAccepted}
                    onChange={e => { setAgbAccepted(e.target.checked); setAgbError(false); }}
                    className="mt-1 w-4 h-4 text-[#009543] rounded" />
                  <label htmlFor="agb-checkbox" className="flex-1 text-sm text-gray-700">
                    {t('agb_prefix')}
                    <a href="/agb" target="_blank" rel="noopener noreferrer"
                      className="text-[#009543] underline font-medium mx-1">{t('agb_link_text')}</a>
                    {t('agb_suffix')}
                  </label>
                </div>
                {agbError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-800">{t('agb_error')}</p>
                  </div>
                )}

                {paymentMethod === 'lemfi' && (
                  <>
                    <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                      <CreditCard className="w-8 h-8 text-white" />
                      <span className="text-2xl font-bold text-white">Banküberweisung (LemFi)</span>
                    </div>
                    <button onClick={handlePayment}
                      disabled={loading || !agbAccepted || !customerPhone.trim()}
                      className="w-full py-4 bg-[#009543] text-white rounded-lg font-bold text-lg disabled:opacity-50">
                      {loading ? t('processing_btn') : 'Bestellung aufgeben & Überweisungsdaten erhalten'}
                    </button>
                  </>
                )}

                {paymentMethod === 'uba_brazzaville' && (
                  <>
                    <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-700 to-blue-500 rounded-lg">
                      <CreditCard className="w-8 h-8 text-white" />
                      <span className="text-2xl font-bold text-white">Banküberweisung (UBA)</span>
                    </div>
                    <button onClick={handlePayment}
                      disabled={loading || !agbAccepted || !customerPhone.trim()}
                      className="w-full py-4 bg-[#009543] text-white rounded-lg font-bold text-lg disabled:opacity-50">
                      {loading ? t('processing_btn') : 'Bestellung aufgeben & Überweisungsdaten erhalten'}
                    </button>
                  </>
                )}
              </div>

              <div className="bg-[#FBDE4A] bg-opacity-20 p-4 rounded-lg text-center">
                <p className="text-sm"><span className="font-bold">{t('next_shipment')}:</span> 15. des Monats</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

