import React, { useState, useEffect } from 'react';
import { X, CreditCard, AlertCircle, CheckCircle, Phone, Package, Info, MapPin } from 'lucide-react';
import { useLanguage, formatPrice as formatPriceStandalone } from '../contexts/LanguageContext';
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

// ── Checkout ist nur für Kunden im Kongo (Käuferseite) — Deutsch ist hier
// irrelevant (das ist nur für Verkäufer in Deutschland relevant, anderswo in der
// App). Diese Komponente zeigt daher IMMER Französisch oder Lingala, nie Deutsch,
// unabhängig davon, was global als Sprache eingestellt ist.
type CheckoutLang = 'fr' | 'ln' | 'en';

const CT: Record<string, Record<CheckoutLang, string>> = {
  checkout: { fr: 'Commander', ln: 'Kosomba', en: 'Checkout' },
  order_confirmed_header: { fr: 'Commande confirmée', ln: 'Commande esangisami', en: 'Order confirmed' },
  order_confirmed_title: { fr: 'Commande enregistrée !', ln: 'Commande eyambami!', en: 'Order received!' },
  order_confirmed_desc: { fr: 'Votre commande a été créée avec succès', ln: 'Commande na yo esalemi malamu', en: 'Your order has been created successfully' },
  order_reference: { fr: 'Référence de commande', ln: 'Référence ya commande', en: 'Order reference' },
  email_instructions_sent: { fr: 'Un email avec toutes les instructions vous a été envoyé.', ln: 'Email na makambo nyonso etindelamaki na yo.', en: 'An email with all instructions has been sent to you.' },
  next_shipment: { fr: 'Prochain envoi', ln: 'Envoi oyo elandi', en: 'Next shipment' },
  next_shipment_value: { fr: 'le 15 du mois', ln: 'mokolo ya 15 ya sanza', en: 'the 15th of the month' },
  phone_whatsapp_label: { fr: 'Numéro de téléphone (WhatsApp)', ln: 'Numéro ya téléphone (WhatsApp)', en: 'Phone number (WhatsApp)' },
  required_field: { fr: 'Obligatoire', ln: 'Esengeli', en: 'Required' },
  phone_contact_note: { fr: 'GLB vous contactera via ce numéro pour la livraison et le paiement.', ln: 'GLB ekobenga yo na numéro oyo pona livraison mpe kofuta.', en: 'GLB will contact you on this number regarding delivery and payment.' },
  phone_required: { fr: 'Numéro de téléphone requis', ln: 'Numéro ya téléphone esengeli', en: 'Phone number is required' },
  payment_options: { fr: 'Options de paiement', ln: 'Ndenge ya kofuta', en: 'Payment options' },
  full_payment: { fr: 'Paiement complet', ln: 'Kofuta nyonso', en: 'Full payment' },
  deposit_50: { fr: 'Acompte 50%', ln: 'Kofuta ndambo (50%)', en: 'Deposit 50%' },
  pay_now_prefix: { fr: 'Payer', ln: 'Futa', en: 'Pay' },
  pay_now_suffix: { fr: 'maintenant', ln: 'sikoyo', en: 'now' },
  deposit_rest_note: { fr: 'maintenant, le reste à la livraison', ln: 'sikoyo, oyo etikali na livraison', en: 'now, remainder on delivery' },
  payment_method_title: { fr: 'Méthode de paiement', ln: 'Ndenge ya kofuta', en: 'Payment method' },
  payment_method_hint_title: { fr: 'Remarque pour le choix :', ln: 'Liloba pona kopona :', en: 'Note on which to choose:' },
  payment_method_hint_body: {
    fr: 'Clients en RD Congo (RDC) : utilisez « Virement bancaire (LemFi) ». Clients en République du Congo / Congo-Brazzaville : utilisez « Virement bancaire (UBA Brazzaville) ».',
    ln: 'Ba client ya RD Congo (RDC) : bosalela « Kobakisa mbongo (LemFi) ». Ba client ya République du Congo / Congo-Brazzaville : bosalela « Kobakisa mbongo (UBA Brazzaville) ».',
    en: 'Customers in DR Congo (DRC): use "Bank transfer (LemFi)". Customers in the Republic of Congo / Congo-Brazzaville: use "Bank transfer (UBA Brazzaville)".',
  },
  lemfi_option_label: { fr: 'Virement bancaire (LemFi) — pour les clients en RD Congo (RDC)', ln: 'Kobakisa mbongo (LemFi) — pona ba client ya RD Congo (RDC)', en: 'Bank transfer (LemFi) — for customers in DR Congo (DRC)' },
  lemfi_option_sub: { fr: 'Virement effectué par vous-même, avec numéro de référence.', ln: 'Yo moko otindaka mbongo, na numéro ya référence.', en: 'Transfer made by yourself, with a reference number.' },
  uba_option_label: { fr: 'Virement bancaire (UBA Brazzaville) — pour les clients au Congo-Brazzaville (RC)', ln: 'Kobakisa mbongo (UBA Brazzaville) — pona ba client ya Congo-Brazzaville (RC)', en: 'Bank transfer (UBA Brazzaville) — for customers in Congo-Brazzaville (RC)' },
  uba_option_sub: { fr: 'Virement effectué par vous-même sur notre compte transitoire chez UBA, avec numéro de référence.', ln: 'Yo moko otindaka mbongo na compte na biso ya ntango moke na UBA, na numéro ya référence.', en: 'Transfer made by yourself to our transitional account at UBA, with a reference number.' },
  transitional_account_notice_title: { fr: 'Remarque importante :', ln: 'Liloba ya ntina :', en: 'Important note:' },
  transitional_account_notice_body: {
    fr: "Ce compte est un compte transitoire de {holderRole}, tant que GermanLink Business n'a pas encore de compte professionnel propre au Congo-Brazzaville. Votre paiement sera enregistré en interne au nom de GermanLink Business.",
    ln: "Compte oyo ezali compte ya ntango moke ya {holderRole}, tii mokolo GermanLink Business ekozala na compte na yango moko na Congo-Brazzaville. Kofuta na yo ekokomama na nkombo ya GermanLink Business.",
    en: 'This account is a transitional account held by {holderRole}, until GermanLink Business has its own business account in Congo-Brazzaville. Your payment will be recorded internally under the name GermanLink Business.',
  },
  holder_role: {
    fr: "co-titulaire de GermanLink Business (compte transitoire, en attendant l'ouverture du compte de l'entreprise)",
    ln: 'Mosangani ya GermanLink Business (compte ya ntango moke, tii compte ya entreprise efungwama)',
    en: "co-holder of GermanLink Business (transitional account, pending opening of the company's own account)",
  },
  subtotal: { fr: 'Sous-total', ln: 'Ntalo ya moke', en: 'Subtotal' },
  shipping: { fr: 'Frais de port', ln: 'Mbongo ya kotinda', en: 'Shipping cost' },
  shipping_estimate_tag: { fr: 'Valeur estimée', ln: 'Estimation', en: 'Estimated value' },
  shipping_info_title: { fr: 'Infos livraison', ln: 'Makambo ya kotinda', en: 'Shipping info' },
  shipping_to_congo_title: { fr: 'Livraison vers le Congo', ln: 'Kotinda na Congo', en: 'Shipping to Congo' },
  total: { fr: 'Total', ln: 'Nyonso', en: 'Total' },
  total_incl_estimate: { fr: 'frais de port estimés inclus', ln: 'na mbongo ya kotinda ya estimation', en: 'including estimated shipping' },
  to_pay_now: { fr: 'À payer maintenant', ln: 'Kofuta sikoyo', en: 'To pay now' },
  shipping_warning: {
    fr: "⚠️ Remarque : les frais de port affichés sont des estimations. Le coût définitif sera confirmé après vérification de votre commande. En cas de différence, nous vous contacterons avant le paiement.",
    ln: "⚠️ Liloba : mbongo ya kotinda oyo emonisami ezali kaka estimation. Ntalo ya sika ekosangisama soki batali commande na yo. Soki ekeseni, tokobenga yo liboso ya kofuta.",
    en: '⚠️ Note: the shipping costs shown are estimates. The final cost will be confirmed after your order is reviewed. If there is a difference, we will contact you before payment.',
  },
  agb_prefix: { fr: "J'ai lu et j'accepte les ", ln: 'Natanga mpe nasangisi na ', en: 'I have read and accept the ' },
  agb_link_text: { fr: 'CGV', ln: 'Mibeko oyo', en: 'Terms & Conditions' },
  agb_suffix: { fr: '.*', ln: '.*', en: '.*' },
  agb_error: { fr: 'Veuillez accepter les CGV pour continuer.', ln: 'Sangisa na Mibeko liboso ya kotindela commande.', en: 'Please accept the Terms & Conditions to continue.' },
  processing_btn: { fr: 'Traitement...', ln: 'Ezali kosalema...', en: 'Processing...' },
  close: { fr: 'Fermer', ln: 'Kofunga', en: 'Close' },
  order_error: { fr: 'Une erreur est survenue lors de la création de la commande', ln: 'Likitá ezali na kosala commande', en: 'An error occurred while creating the order' },
  product_label: { fr: 'Produit', ln: 'Eloko', en: 'Product' },
  payment_instruction_lemfi_title: { fr: 'Instructions de paiement — Virement bancaire (LemFi)', ln: 'Ndenge ya kofuta — Kobakisa mbongo (LemFi)', en: 'Payment instructions — Bank transfer (LemFi)' },
  payment_instruction_uba_title: { fr: 'Instructions de paiement — Virement bancaire (UBA Brazzaville)', ln: 'Ndenge ya kofuta — Kobakisa mbongo (UBA Brazzaville)', en: 'Payment instructions — Bank transfer (UBA Brazzaville)' },
  amount_to_pay_label: { fr: 'Montant à payer :', ln: 'Mbongo ya kofuta :', en: 'Amount to pay:' },
  recipient_label: { fr: 'Destinataire :', ln: 'Moto ya kozwa :', en: 'Recipient:' },
  reference_mandatory_label: { fr: 'Référence (obligatoire) :', ln: 'Référence (esengeli) :', en: 'Reference (mandatory):' },
  bank_label: { fr: 'Banque :', ln: 'Banki :', en: 'Bank:' },
  account_holder_label: { fr: 'Titulaire du compte :', ln: 'Nkolo ya compte :', en: 'Account holder:' },
  code_banque_label: { fr: 'Code Banque :', ln: 'Code Banque :', en: 'Bank code:' },
  code_guichet_label: { fr: 'Code Guichet :', ln: 'Code Guichet :', en: 'Branch code:' },
  account_number_label: { fr: 'N° de compte :', ln: 'N° ya compte :', en: 'Account number:' },
  rib_key_label: { fr: 'Clé RIB :', ln: 'Clé RIB :', en: 'RIB key:' },
  swift_label: { fr: 'SWIFT/BIC :', ln: 'SWIFT/BIC :', en: 'SWIFT/BIC:' },
  pending_field: { fr: '(à compléter)', ln: '(ekobakisama)', en: '(to be added)' },
  shipping_confirmed_note: { fr: 'Les frais de port seront confirmés', ln: 'Mbongo ya kotinda ekosangisama', en: 'Shipping costs will be confirmed' },
  email_not_sent_warning: {
    fr: "L'e-mail de confirmation n'a pas pu être envoyé automatiquement. Merci de noter votre numéro de référence {orderNumber} et les informations de paiement ci-dessus, ou contactez-nous à info@germanlinkbusiness.de.",
    ln: 'Email ya confirmation ekoki te kotindama na yango moko. Bomba référence {orderNumber} na makambo ya kofuta oyo ezali likolo, to benga biso na info@germanlinkbusiness.de.',
    en: 'The confirmation email could not be sent automatically. Please note your reference number {orderNumber} and the payment details above, or contact us at info@germanlinkbusiness.de.',
  },
  lemfi_button_banner: { fr: 'Virement bancaire (LemFi)', ln: 'Kobakisa mbongo (LemFi)', en: 'Bank transfer (LemFi)' },
  uba_button_banner: { fr: 'Virement bancaire (UBA)', ln: 'Kobakisa mbongo (UBA)', en: 'Bank transfer (UBA)' },
  submit_button_label: { fr: 'Passer la commande & recevoir les infos de virement', ln: 'Tinda commande & zwa makambo ya kofuta', en: 'Place order & receive transfer details' },
  shipping_small_package: { fr: 'Petit colis — forfait de livraison.', ln: 'Colis ya moke — ntalo ya kotinda ya fixe.', en: 'Small package — flat shipping rate.' },
  shipping_being_calculated: { fr: 'En cours de calcul', ln: 'Ezali kotangama', en: 'Being calculated' },
  shipping_calc_by_volume: { fr: 'Les frais de port seront calculés selon le volume.', ln: 'Mbongo ya kotinda ekotangama na volume.', en: 'Shipping costs will be calculated based on volume.' },
  shipping_calc_needed: { fr: 'Calculé selon le volume', ln: 'Etangami na volume', en: 'Calculated by volume' },
  shipping_needs_quote: { fr: "Les frais de port définitifs seront calculés selon le volume, le poids et la destination. Vous recevrez une offre personnalisée avant le paiement.", ln: 'Mbongo ya sika ekotangama na volume, kilo mpe esika ekokende. Okozwa prix ya sika liboso ya kofuta.', en: 'Final shipping costs will be calculated based on volume, weight and destination. You will receive a personalized offer before payment.' },
  shipping_cbm_hint: { fr: 'Calculé selon le volume', ln: 'Etangami na volume', en: 'Calculated by volume' },
  shipping_cbm_note: { fr: 'Conteneur groupé · délai 8–12 semaines', ln: 'Container ya bango nyonso · ngonga 8–12 semaine', en: 'Groupage container · 8–12 weeks delivery time' },
  shipping_quote_note: { fr: 'Vous recevrez une offre personnalisée après réception de votre commande.', ln: 'Okozwa prix ya sika soki commande na yo eyaki.', en: 'You will receive a personalized offer after your order is received.' },
  phone_placeholder: { fr: '+243 XXX XXX XXX ou +242 XXX XXX XXX', ln: '+243 XXX XXX XXX to +242 XXX XXX XXX', en: '+234 XXX XXX XXXX (Nigeria) or +243/+242 (Congo)' },
  delivery_address_label: { fr: 'Adresse de livraison', ln: 'Adresse ya livraison', en: 'Delivery address' },
  delivery_address_placeholder: { fr: 'ex : 44, rue Massina Munkondo, Brazzaville', ln: 'ex: 44, rue Massina Munkondo, Brazzaville', en: 'e.g. 44, rue Massina Munkondo, Brazzaville' },
  delivery_address_note: { fr: 'Adresse complète où la commande doit être livrée.', ln: 'Adresse ya mobimba esika commande esengeli kokoma.', en: 'Full address where the order should be delivered.' },
  delivery_address_required: { fr: "Veuillez indiquer l'adresse de livraison", ln: 'Tiya adresse ya livraison', en: 'Please provide a delivery address' },
};

const ct = (lang: CheckoutLang, key: keyof typeof CT, vars?: Record<string, string>): string => {
  let text = CT[key]?.[lang] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
};

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

const calcShipping = (totalCbm: number, hasNoMeasurements: boolean, lang: CheckoutLang): ShippingInfo => {
  if (hasNoMeasurements) {
    return {
      mode: 'quote',
      estimated: 50,
      isEstimate: true,
      label: ct(lang, 'shipping_calc_needed'),
      hint: ct(lang, 'shipping_needs_quote'),
    };
  }
  if (totalCbm < 0.05) {
    return {
      mode: 'fixed',
      estimated: Math.max(MIN_SHIPPING, Math.round(totalCbm * CBM_RATE)),
      isEstimate: false,
      label: '',
      hint: ct(lang, 'shipping_small_package'),
    };
  }
  const calculated = Math.round(totalCbm * CBM_RATE);
  const finalEstimate = Math.max(MIN_SHIPPING, calculated);
  return {
    mode: 'cbm',
    estimated: finalEstimate,
    isEstimate: true,
    label: `${formatPriceStandalone(finalEstimate, lang)}`,
    hint: `${ct(lang, 'shipping_cbm_hint')} (${totalCbm.toFixed(3)} m³ × ${formatPriceStandalone(CBM_RATE, lang)}/m³).`,
  };
};

// ── Zahlungsmethoden ──────────────────────────────────────────────────────────
type PaymentMethod = 'lemfi' | 'uba_brazzaville' | 'cinetpay';

const UBA_ACCOUNT = {
  bankName: 'UBA Congo (United Bank for Africa)',
  accountHolder: 'BAHOUMINA MANOU Roberta Belvine',
  codeBanque: 'BJIQ4KB0RA',
  codeGuichet: '',
  numeroCompte: '',
  ribKey: '',
  swift: 'UNAFCGCG',
  branchAddress: '37 Av. William Guynet, Rond point City-Center, B.P. 13534, Brazzaville',
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, singleProduct }) => {
  const { language, formatPrice } = useLanguage();
  const lang: CheckoutLang = language === 'ln' ? 'ln' : language === 'en' ? 'en' : 'fr'; // Deutsch ist hier nie relevant
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentOption, setPaymentOption] = useState<'full' | 'deposit'>('full');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('lemfi');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [agbError, setAgbError] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    mode: 'quote', estimated: 50, isEstimate: true,
    label: ct(lang, 'shipping_being_calculated'),
    hint: ct(lang, 'shipping_calc_by_volume'),
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

      setShippingInfo(calcShipping(totalCbm, hasNoMeasurements, lang));
    } catch (e) {
      console.error('Shipping calc error:', e);
      setShippingInfo({
        mode: 'quote', estimated: 50, isEstimate: true,
        label: ct(lang, 'shipping_being_calculated'),
        hint: ct(lang, 'shipping_calc_by_volume'),
      });
    }
  };

  const shippingCost = shippingInfo.estimated;
  const total = subtotal + shippingCost;
  const amountToPay = paymentOption === 'deposit' ? total * 0.5 : total;

  const handlePayment = async () => {
    if (!user) return;
    if (!agbAccepted) { setAgbError(true); return; }
    if (!customerPhone.trim()) { alert(ct(lang, 'phone_required')); return; }
    if (!deliveryAddress.trim()) { alert(ct(lang, 'delivery_address_required')); return; }

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
        delivery_address:   deliveryAddress,
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
      (window as any).__lastOrderEmailOk = emailOk;
      if (!singleProduct) await clearCart();

    } catch (error) {
      console.error('Error creating order:', error);
      alert(ct(lang, 'order_error'));
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
            {orderCompleted ? `✓ ${ct(lang, 'order_confirmed_header')}` : ct(lang, 'checkout')}
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
                <h3 className="text-2xl font-bold text-green-900 mb-2">{ct(lang, 'order_confirmed_title')}</h3>
                <p className="text-green-700 mb-4">{ct(lang, 'order_confirmed_desc')}</p>
                <div className="bg-white rounded-lg p-4 inline-block">
                  <p className="text-sm text-gray-600 mb-1">{ct(lang, 'order_reference')}</p>
                  <p className="text-2xl font-bold text-gray-900">{orderNumber}</p>
                </div>
              </div>

              {shippingInfo.isEstimate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-blue-900 text-sm">{ct(lang, 'shipping_confirmed_note')}</p>
                      <p className="text-blue-700 text-xs mt-1">{shippingInfo.hint}</p>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'lemfi' && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {ct(lang, 'payment_instruction_lemfi_title')}
                  </h4>
                  <div className="space-y-2 text-sm text-yellow-900 bg-white rounded p-3">
                    <p><strong>{ct(lang, 'amount_to_pay_label')}</strong> {formatPrice(amountToPay)}</p>
                    <p><strong>{ct(lang, 'recipient_label')}</strong> GermanLink Business GmbH</p>
                    <p><strong>IBAN:</strong> DE89 3704 0044 0532 0130 00</p>
                    <p className="text-red-700 font-bold"><strong>{ct(lang, 'reference_mandatory_label')}</strong> {orderNumber}</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'uba_brazzaville' && (
                <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {ct(lang, 'payment_instruction_uba_title')}
                  </h4>
                  <div className="space-y-2 text-sm text-blue-900 bg-white rounded p-3">
                    <p><strong>{ct(lang, 'amount_to_pay_label')}</strong> {formatPrice(amountToPay)}</p>
                    <p><strong>{ct(lang, 'bank_label')}</strong> {UBA_ACCOUNT.bankName}</p>
                    <p><strong>{ct(lang, 'account_holder_label')}</strong> {UBA_ACCOUNT.accountHolder}</p>
                    <p><strong>{ct(lang, 'code_banque_label')}</strong> {UBA_ACCOUNT.codeBanque || ct(lang, 'pending_field')}</p>
                    <p><strong>{ct(lang, 'code_guichet_label')}</strong> {UBA_ACCOUNT.codeGuichet || ct(lang, 'pending_field')}</p>
                    <p><strong>{ct(lang, 'account_number_label')}</strong> {UBA_ACCOUNT.numeroCompte || ct(lang, 'pending_field')}</p>
                    <p><strong>{ct(lang, 'rib_key_label')}</strong> {UBA_ACCOUNT.ribKey || ct(lang, 'pending_field')}</p>
                    <p><strong>{ct(lang, 'swift_label')}</strong> {UBA_ACCOUNT.swift}</p>
                    <p className="text-red-700 font-bold"><strong>{ct(lang, 'reference_mandatory_label')}</strong> {orderNumber}</p>
                    <div className="mt-2 pt-2 border-t border-blue-200 bg-amber-50 -mx-3 -mb-3 px-3 pb-3 rounded-b">
                      <p className="text-xs text-amber-900">
                        <strong>{ct(lang, 'transitional_account_notice_title')}</strong>{' '}
                        {ct(lang, 'transitional_account_notice_body', { holderRole: ct(lang, 'holder_role') })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {emailWasSent ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-600">{ct(lang, 'email_instructions_sent')}</p>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-800">
                    {ct(lang, 'email_not_sent_warning', { orderNumber })}
                  </p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm"><strong>{ct(lang, 'next_shipment')} :</strong> {ct(lang, 'next_shipment_value')}</p>
              </div>

              <button onClick={handleClose} className="w-full py-3 bg-[#009543] text-white rounded-lg font-medium">
                {ct(lang, 'close')}
              </button>
            </div>
          ) : (
            <div className="space-y-6">

              {singleProduct && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">{ct(lang, 'product_label')}</p>
                    <p className="font-bold text-sm text-gray-900 truncate max-w-[280px]">{singleProduct.name}</p>
                  </div>
                  <p className="font-bold text-[#0A5EB0] text-lg">{formatPrice(singleProduct.sale_price)}</p>
                </div>
              )}

              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    {ct(lang, 'phone_whatsapp_label')}
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">{ct(lang, 'required_field')}</span>
                  </span>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder={ct(lang, 'phone_placeholder')}
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-blue-600 mt-1">{ct(lang, 'phone_contact_note')}</p>
                </label>
              </div>

              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    {ct(lang, 'delivery_address_label')}
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">{ct(lang, 'required_field')}</span>
                  </span>
                  <textarea
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    placeholder={ct(lang, 'delivery_address_placeholder')}
                    rows={2}
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-blue-600 mt-1">{ct(lang, 'delivery_address_note')}</p>
                </label>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-gray-900">{ct(lang, 'payment_options')}</h3>
                {[
                  { val: 'full',    label: ct(lang, 'full_payment'),  sub: `${ct(lang, 'pay_now_prefix')} ${formatPrice(total)} ${ct(lang, 'pay_now_suffix')}` },
                  { val: 'deposit', label: ct(lang, 'deposit_50'),    sub: `${ct(lang, 'pay_now_prefix')} ${formatPrice(total*0.5)} ${ct(lang, 'deposit_rest_note')}` },
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

              <div className="space-y-3">
                <h3 className="font-bold text-gray-900">{ct(lang, 'payment_method_title')}</h3>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-xs text-indigo-800">
                  <strong>{ct(lang, 'payment_method_hint_title')}</strong> {ct(lang, 'payment_method_hint_body')}
                </div>

                {[
                  { val: 'lemfi', label: ct(lang, 'lemfi_option_label'), sub: ct(lang, 'lemfi_option_sub') },
                  { val: 'uba_brazzaville', label: ct(lang, 'uba_option_label'), sub: ct(lang, 'uba_option_sub') },
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

                {paymentMethod === 'uba_brazzaville' && (
                  <div className="ml-4 bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-900">
                    <strong>{ct(lang, 'transitional_account_notice_title')}</strong>{' '}
                    {ct(lang, 'transitional_account_notice_body', { holderRole: ct(lang, 'holder_role') })}
                  </div>
                )}
              </div>


              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>{ct(lang, 'subtotal')}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-gray-600 items-start">
                  <div className="flex items-center gap-1">
                    <span>{ct(lang, 'shipping')}</span>
                    <button
                      onClick={() => setShowShippingInfo(!showShippingInfo)}
                      className="text-blue-500 hover:text-blue-700"
                      title={ct(lang, 'shipping_info_title')}>
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-right">
                    {shippingInfo.isEstimate ? (
                      <div>
                        <span className="text-orange-600 font-medium">
                          {formatPrice(shippingCost)}
                        </span>
                        <span className="text-xs text-orange-500 block">{ct(lang, 'shipping_estimate_tag')}</span>
                      </div>
                    ) : (
                      <span>{formatPrice(shippingCost)}</span>
                    )}
                  </div>
                </div>

                {showShippingInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" /> {ct(lang, 'shipping_to_congo_title')}
                    </p>
                    <p>{shippingInfo.hint}</p>
                    {shippingInfo.mode === 'cbm' && (
                      <p className="text-blue-600 font-medium">{ct(lang, 'shipping_cbm_note')}</p>
                    )}
                    {shippingInfo.mode === 'quote' && (
                      <p className="text-orange-600 font-medium">{ct(lang, 'shipping_quote_note')}</p>
                    )}
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                  <span>{ct(lang, 'total')}</span>
                  <div className="text-right">
                    <span className="text-[#009543]">{formatPrice(total)}</span>
                    {shippingInfo.isEstimate && (
                      <span className="text-xs text-orange-500 block font-normal">{ct(lang, 'total_incl_estimate')}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between text-xl font-bold text-[#DC241F] pt-2 border-t-2 border-[#DC241F]">
                  <span>{ct(lang, 'to_pay_now')}</span>
                  <span>{formatPrice(amountToPay)}</span>
                </div>

                {shippingInfo.isEstimate && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
                    <p className="text-xs text-orange-800">{ct(lang, 'shipping_warning')}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 border-2 rounded-lg">
                  <input type="checkbox" id="agb-checkbox" checked={agbAccepted}
                    onChange={e => { setAgbAccepted(e.target.checked); setAgbError(false); }}
                    className="mt-1 w-4 h-4 text-[#009543] rounded" />
                  <label htmlFor="agb-checkbox" className="flex-1 text-sm text-gray-700">
                    {ct(lang, 'agb_prefix')}
                    <a href="/agb" target="_blank" rel="noopener noreferrer"
                      className="text-[#009543] underline font-medium mx-1">{ct(lang, 'agb_link_text')}</a>
                    {ct(lang, 'agb_suffix')}
                  </label>
                </div>
                {agbError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-800">{ct(lang, 'agb_error')}</p>
                  </div>
                )}

                {paymentMethod === 'lemfi' && (
                  <>
                    <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                      <CreditCard className="w-8 h-8 text-white" />
                      <span className="text-2xl font-bold text-white">{ct(lang, 'lemfi_button_banner')}</span>
                    </div>
                    <button onClick={handlePayment}
                      disabled={loading || !agbAccepted || !customerPhone.trim() || !deliveryAddress.trim()}
                      className="w-full py-4 bg-[#009543] text-white rounded-lg font-bold text-lg disabled:opacity-50">
                      {loading ? ct(lang, 'processing_btn') : ct(lang, 'submit_button_label')}
                    </button>
                  </>
                )}

                {paymentMethod === 'uba_brazzaville' && (
                  <>
                    <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-700 to-blue-500 rounded-lg">
                      <CreditCard className="w-8 h-8 text-white" />
                      <span className="text-2xl font-bold text-white">{ct(lang, 'uba_button_banner')}</span>
                    </div>
                    <button onClick={handlePayment}
                      disabled={loading || !agbAccepted || !customerPhone.trim() || !deliveryAddress.trim()}
                      className="w-full py-4 bg-[#009543] text-white rounded-lg font-bold text-lg disabled:opacity-50">
                      {loading ? ct(lang, 'processing_btn') : ct(lang, 'submit_button_label')}
                    </button>
                  </>
                )}
              </div>

              <div className="bg-[#FBDE4A] bg-opacity-20 p-4 rounded-lg text-center">
                <p className="text-sm"><span className="font-bold">{ct(lang, 'next_shipment')} :</span> {ct(lang, 'next_shipment_value')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

