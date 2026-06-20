import React, { useState, useEffect, useRef } from 'react';
import {
  Package, MapPin, Shield, CheckCircle,
  Truck, Ship, Anchor, Home, Clock, CreditCard, Box,
  AlertCircle, ArrowLeft, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// ── Stripe ────────────────────────────────────────────────────────────────────
// Stripe.js wird dynamisch geladen
declare global {
  interface Window { Stripe?: any; }
}

const loadStripe = (publishableKey: string): Promise<any> => {
  return new Promise((resolve) => {
    if (window.Stripe) { resolve(window.Stripe(publishableKey)); return; }
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => resolve(window.Stripe!(publishableKey));
    document.head.appendChild(script);
  });
};

// ⚠️  HIER deinen Stripe Publishable Key einfügen:
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// ── Language ──────────────────────────────────────────────────────────────────
type Lang = 'de' | 'fr' | 'ln';
const getLanguage = (): Lang => {
  const saved = localStorage.getItem('germanlink_language') as Lang;
  return ['de', 'fr', 'ln'].includes(saved) ? saved : 'de';
};

const T = {
  de: {
    title: 'GLB Paketversand',
    subtitle: 'Sende deine Pakete sicher nach Congo Brazzaville.',
    containerInfo: 'Container fährt am',
    containerDate: '15. jeden Monats',
    containerAb: 'ab — Lieferzeit max. 4 Wochen.',
    btnBook: '+ Paket anmelden', btnTrack: 'Paket verfolgen',
    statDepart: 'Abfahrt jeden Monat', statDelivery: 'Max. Lieferzeit',
    step1Title: 'Anmelden',    step1Desc: 'Maße & Empfänger eingeben',
    step2Title: 'Bezahlen',    step2Desc: 'Kreditkarte, PayPal oder Sofortüberweisung',
    step3Title: 'GLB holt ab', step3Desc: '1× im Monat in deiner Stadt',
    step4Title: 'Zugestellt',  step4Desc: 'In BZV oder Pointe-Noire',
    stepLabel: 'Schritt',
    myParcels: 'Meine Pakete', refresh: 'Aktualisieren',
    noParcels: 'Noch keine Pakete angemeldet',
    loginPrompt: 'Einloggen um Pakete zu verwalten',
    loginSub: 'Du kannst auch ohne Login ein Paket verfolgen',
    trackBtn: 'Paket verfolgen',
    bookTitle: 'Paket anmelden', back: 'Zurück',
    sectionDimensions: 'Maße & Gewicht *',
    lengthLabel: 'Länge (cm)', widthLabel: 'Breite (cm)', heightLabel: 'Höhe (cm)', weightLabel: 'Gewicht (kg)',
    priceHint: 'Preis = max(Volumen×150€, Gewicht×4€), min. 15€',
    sectionLocation: 'Abholort & Zielstadt *',
    originLabel: 'Abholstadt (Deutschland)', originPh: 'z.B. Hamburg, Berlin...',
    destLabel: 'Empfängerstadt (Congo)',
    destBZV: 'Brazzaville', destPNR: 'Pointe-Noire (+20 €)',
    sectionInsurance: 'Versicherung',
    insuranceCheck: 'Versicherung hinzufügen (+3% des Warenwerts)',
    valueLabel: 'Warenwert (€)',
    sectionContacts: 'Absender & Empfänger *',
    senderName: 'Absender Name', senderNamePh: 'Dein Name',
    senderPhone: 'Telefon / WhatsApp', senderPhonePh: '+49...',
    recipientName: 'Empfänger Name *', recipientNamePh: 'Name in Congo',
    recipientPhone: 'Empfänger Telefon *', recipientPhonePh: '+242...',
    priceTitle: 'Preisübersicht',
    basePrice: 'Basispreis', pnrSurcharge: 'Pointe-Noire Aufschlag',
    insuranceLine: 'Versicherung (3%)', total: 'Gesamt',
    containerNote: 'Container wird am 15. des Monats verschifft. Lieferzeit max. 4 Wochen.',
    submitBtn: 'Weiter zur Zahlung',
    successTitle: 'Zahlung erfolgreich & Paket angemeldet!',
    successSub: 'Deine Tracking-Nummer:',
    successNote: 'GLB kontaktiert dich zur Abholung.',
    successContainer: 'Container fährt am 15. des Monats.',
    successDelivery: 'Lieferzeit ca. 4 Wochen.',
    btnMyParcels: 'Meine Pakete', btnAnother: 'Weiteres Paket',
    trackTitle: 'Paket verfolgen',
    trackPh: 'Tracking-Nummer (z.B. GLB-ABC123)',
    trackSearch: 'Suchen', trackNotFound: 'Tracking-Nummer nicht gefunden.',
    estimatedDelivery: 'Voraussichtliche Lieferung',
    currentLabel: 'Aktuell', steps: 'Schritte',
    alertLogin: 'Bitte zuerst einloggen!',
    alertFields: 'Bitte alle Pflichtfelder ausfüllen!',
    alertSaveError: 'Fehler beim Speichern', saving: 'Wird gespeichert...',
    // Checkout
    checkoutTitle: 'Zahlung — Paketversand',
    payMethodTitle: 'Zahlungsmethode wählen',
    payCard: 'Kreditkarte', payCardDesc: 'Visa, Mastercard, AmEx',
    payPaypal: 'PayPal', payPaypalDesc: 'Mit deinem PayPal-Konto zahlen',
    paySofort: 'Sofortüberweisung', paySofortDesc: 'Direkte Banküberweisung (Klarna)',
    cardNumber: 'Kartennummer', cardExpiry: 'MM/JJ', cardCvc: 'CVC',
    payBtn: 'Jetzt bezahlen', processing: 'Wird verarbeitet...',
    paySuccess: 'Zahlung erfolgreich!', payError: 'Zahlung fehlgeschlagen:',
    closeBtn: 'Schließen',
    amountLabel: 'Betrag',
    trackingLabel: 'Tracking',
    stripeNotLoaded: 'Stripe konnte nicht geladen werden. Bitte Seite neu laden.',
  },
  fr: {
    title: 'GLB Envoi de colis',
    subtitle: 'Envoyez vos colis en toute sécurité au Congo Brazzaville.',
    containerInfo: 'Le conteneur part le',
    containerDate: '15 de chaque mois',
    containerAb: '— délai max. 4 semaines.',
    btnBook: '+ Enregistrer un colis', btnTrack: 'Suivre un colis',
    statDepart: 'Départ chaque mois', statDelivery: 'Délai max.',
    step1Title: "S'inscrire",   step1Desc: 'Entrer dimensions & destinataire',
    step2Title: 'Payer',        step2Desc: 'Carte, PayPal ou virement instantané',
    step3Title: 'GLB collecte', step3Desc: '1× par mois dans votre ville',
    step4Title: 'Livré',        step4Desc: 'À BZV ou Pointe-Noire',
    stepLabel: 'Étape',
    myParcels: 'Mes colis', refresh: 'Actualiser',
    noParcels: 'Aucun colis enregistré',
    loginPrompt: 'Connectez-vous pour gérer vos colis',
    loginSub: 'Vous pouvez suivre un colis sans connexion',
    trackBtn: 'Suivre un colis',
    bookTitle: 'Enregistrer un colis', back: 'Retour',
    sectionDimensions: 'Dimensions & Poids *',
    lengthLabel: 'Longueur (cm)', widthLabel: 'Largeur (cm)', heightLabel: 'Hauteur (cm)', weightLabel: 'Poids (kg)',
    priceHint: 'Prix = max(Volume×150€, Poids×4€), min. 15€',
    sectionLocation: 'Lieu de collecte & destination *',
    originLabel: 'Ville de collecte (Allemagne)', originPh: 'ex. Hamburg, Berlin...',
    destLabel: 'Ville de destination (Congo)',
    destBZV: 'Brazzaville', destPNR: 'Pointe-Noire (+20 €)',
    sectionInsurance: 'Assurance',
    insuranceCheck: 'Ajouter une assurance (+3% de la valeur)',
    valueLabel: 'Valeur des marchandises (€)',
    sectionContacts: 'Expéditeur & Destinataire *',
    senderName: 'Nom expéditeur', senderNamePh: 'Votre nom',
    senderPhone: 'Téléphone / WhatsApp', senderPhonePh: '+49...',
    recipientName: 'Nom destinataire *', recipientNamePh: 'Nom au Congo',
    recipientPhone: 'Tél. destinataire *', recipientPhonePh: '+242...',
    priceTitle: 'Récapitulatif',
    basePrice: 'Prix de base', pnrSurcharge: 'Supplément Pointe-Noire',
    insuranceLine: 'Assurance (3%)', total: 'Total',
    containerNote: 'Le conteneur part le 15 du mois. Délai max. 4 semaines.',
    submitBtn: 'Procéder au paiement',
    successTitle: 'Paiement réussi & colis enregistré !',
    successSub: 'Votre numéro de suivi :',
    successNote: 'GLB vous contactera pour la collecte.',
    successContainer: 'Le conteneur part le 15 du mois.',
    successDelivery: 'Livraison en env. 4 semaines.',
    btnMyParcels: 'Mes colis', btnAnother: 'Autre colis',
    trackTitle: 'Suivre un colis',
    trackPh: 'Numéro de suivi (ex. GLB-ABC123)',
    trackSearch: 'Rechercher', trackNotFound: 'Numéro de suivi introuvable.',
    estimatedDelivery: 'Livraison estimée',
    currentLabel: 'En cours', steps: 'étapes',
    alertLogin: 'Veuillez vous connecter !',
    alertFields: 'Veuillez remplir tous les champs obligatoires !',
    alertSaveError: 'Erreur lors de la sauvegarde', saving: 'Enregistrement...',
    checkoutTitle: 'Paiement — Envoi colis',
    payMethodTitle: 'Choisir le mode de paiement',
    payCard: 'Carte bancaire', payCardDesc: 'Visa, Mastercard, AmEx',
    payPaypal: 'PayPal', payPaypalDesc: 'Payer avec votre compte PayPal',
    paySofort: 'Virement instantané', paySofortDesc: 'Virement bancaire direct (Klarna)',
    cardNumber: 'Numéro de carte', cardExpiry: 'MM/AA', cardCvc: 'CVC',
    payBtn: 'Payer maintenant', processing: 'Traitement en cours...',
    paySuccess: 'Paiement réussi !', payError: 'Échec du paiement :',
    closeBtn: 'Fermer',
    amountLabel: 'Montant',
    trackingLabel: 'Suivi',
    stripeNotLoaded: 'Stripe n\'a pas pu être chargé. Veuillez recharger la page.',
  },
  ln: {
    title: 'GLB Kotinda Colis',
    subtitle: 'Tinda ba colis na yo na sécurité na Congo Brazzaville.',
    containerInfo: 'Container ekei na',
    containerDate: '15 ya sanza nyonso',
    containerAb: '— livraison max. malembe 4.',
    btnBook: '+ Kokeba colis', btnTrack: 'Luka colis na yo',
    statDepart: 'Departure sanza na sanza', statDelivery: 'Max. ya koleka',
    step1Title: 'Kokeba',      step1Desc: 'Tia dimensions & moto ya kozwa',
    step2Title: 'Kofuta',      step2Desc: 'Carte, PayPal to virement',
    step3Title: 'GLB ekanga',  step3Desc: '1× na sanza na ville na yo',
    step4Title: 'Ekabola',     step4Desc: 'Na BZV to Pointe-Noire',
    stepLabel: 'Etape',
    myParcels: 'Ba colis na ngai', refresh: 'Refresher',
    noParcels: 'Ezali na colis te',
    loginPrompt: 'Kota compte pona kotala ba colis na yo',
    loginSub: 'Okoki koluka colis kozanga connexion',
    trackBtn: 'Luka colis',
    bookTitle: 'Kokeba colis', back: 'Kozonga',
    sectionDimensions: 'Dimensions & Poids *',
    lengthLabel: 'Bolayi (cm)', widthLabel: 'Bozindo (cm)', heightLabel: 'Molayi (cm)', weightLabel: 'Bokito (kg)',
    priceHint: 'Prix = max(Volume×150€, Poids×4€), min. 15€',
    sectionLocation: 'Esika ya kozwa & ville ya kozwa *',
    originLabel: 'Ville ya kozwa (Allemagne)', originPh: 'ex. Hamburg, Berlin...',
    destLabel: 'Ville ya kozwa (Congo)',
    destBZV: 'Brazzaville', destPNR: 'Pointe-Noire (+20 €)',
    sectionInsurance: 'Assurance',
    insuranceCheck: 'Bakisa assurance (+3% ya valeur)',
    valueLabel: 'Valeur ya biloko (€)',
    sectionContacts: 'Motindami & Moto ya kozwa *',
    senderName: 'Nkombo ya motindami', senderNamePh: 'Nkombo na yo',
    senderPhone: 'Téléphone / WhatsApp', senderPhonePh: '+49...',
    recipientName: 'Nkombo ya kozwa *', recipientNamePh: 'Nkombo na Congo',
    recipientPhone: 'Téléphone ya kozwa *', recipientPhonePh: '+242...',
    priceTitle: 'Résumé ya prix',
    basePrice: 'Prix ya base', pnrSurcharge: 'Supplément Pointe-Noire',
    insuranceLine: 'Assurance (3%)', total: 'Mobimba',
    containerNote: 'Container ekei na 15 ya sanza. Livraison max. malembe 4.',
    submitBtn: 'Kokende na paiement',
    successTitle: 'Paiement eleki malamu & colis ekebisami!',
    successSub: 'Numéro ya suivi na yo:',
    successNote: 'GLB akobeta yo pona kozwa colis.',
    successContainer: 'Container ekei na 15 ya sanza.',
    successDelivery: 'Livraison na malembe 4.',
    btnMyParcels: 'Ba colis na ngai', btnAnother: 'Colis mosusu',
    trackTitle: 'Luka colis na yo',
    trackPh: 'Numéro ya suivi (ex. GLB-ABC123)',
    trackSearch: 'Luka', trackNotFound: 'Numéro ya suivi ezwami te.',
    estimatedDelivery: 'Livraison elongobani',
    currentLabel: "Sik'oyo", steps: 'Etapes',
    alertLogin: 'Kota compte liboso!',
    alertFields: 'Tia makambo nyonso ya obligatoire!',
    alertSaveError: 'Erreur na kosalva', saving: 'Ezali kosalva...',
    checkoutTitle: 'Kofuta — Colis',
    payMethodTitle: 'Pona ndenge ya kofuta',
    payCard: 'Carte bancaire', payCardDesc: 'Visa, Mastercard, AmEx',
    payPaypal: 'PayPal', payPaypalDesc: 'Kofuta na compte ya PayPal',
    paySofort: 'Virement instantané', paySofortDesc: 'Virement bancaire direct (Klarna)',
    cardNumber: 'Numéro ya carte', cardExpiry: 'MM/AA', cardCvc: 'CVC',
    payBtn: 'Kofuta sikoyo', processing: 'Ezali kosalaka...',
    paySuccess: 'Paiement eleki!', payError: 'Paiement elongaki te:',
    closeBtn: 'Komela',
    amountLabel: 'Montant',
    trackingLabel: 'Tracking',
    stripeNotLoaded: 'Stripe elongaki te. Refresher page.',
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface ParcelForm {
  length: string; width: string; height: string; weight: string;
  origin_city: string; destination: 'brazzaville' | 'pointe-noire';
  insurance: boolean; declared_value: string;
  recipient_name: string; recipient_phone: string;
  sender_name: string; sender_phone: string;
}

interface Parcel {
  id: string; tracking_number: string; recipient_name: string;
  destination: string; status: string; total_price: number;
  created_at: string; estimated_delivery: string;
}

const PARCEL_STATUSES = [
  { key: 'registered',   label: 'Angemeldet',      labelFr: 'Enregistré',        labelLn: 'Ekebisami',       icon: CheckCircle, color: 'bg-gray-500' },
  { key: 'paid',         label: 'Bezahlt',          labelFr: 'Payé',              labelLn: 'Efutami',         icon: CreditCard,  color: 'bg-green-500' },
  { key: 'picked_up',    label: 'Abgeholt',         labelFr: 'Récupéré',          labelLn: 'Ekangami',        icon: Truck,       color: 'bg-blue-400' },
  { key: 'in_warehouse', label: 'Im Lager',         labelFr: 'En entrepôt',       labelLn: 'Na entrepôt',     icon: Box,         color: 'bg-blue-500' },
  { key: 'in_container', label: 'Im Container',     labelFr: 'Dans le conteneur', labelLn: 'Na conteneur',    icon: Package,     color: 'bg-blue-600' },
  { key: 'shipped',      label: 'Verschifft (15.)', labelFr: 'Expédié (le 15)',   labelLn: 'Etindami (15)',   icon: Ship,        color: 'bg-indigo-500' },
  { key: 'arrived_port', label: 'Im Hafen',         labelFr: 'Au port',           labelLn: 'Na port',         icon: Anchor,      color: 'bg-purple-500' },
  { key: 'customs',      label: 'Verzollung',       labelFr: 'Dédouanement',      labelLn: 'Douane esalaka',  icon: AlertCircle, color: 'bg-orange-500' },
  { key: 'out_delivery', label: 'Fahrer unterwegs', labelFr: 'En livraison',      labelLn: 'Chauffeur azali', icon: Truck,       color: 'bg-green-400' },
  { key: 'delivered',    label: 'Zugestellt ✓',     labelFr: 'Livré ✓',           labelLn: 'Ekabola ✓',       icon: Home,        color: 'bg-green-600' },
];

const statusIndex: Record<string, number> = Object.fromEntries(
  PARCEL_STATUSES.map((s, i) => [s.key, i])
);

const calcPrice = (form: ParcelForm) => {
  const l = parseFloat(form.length) || 0;
  const b = parseFloat(form.width) || 0;
  const h = parseFloat(form.height) || 0;
  const w = parseFloat(form.weight) || 0;
  const val = parseFloat(form.declared_value) || 0;
  const volM3 = (l * b * h) / 1_000_000;
  const base = Math.max(Math.round(volM3 * 150), Math.round(w * 4), 15);
  const dest = form.destination === 'pointe-noire' ? 20 : 0;
  const ins = form.insurance ? Math.round(val * 0.03) : 0;
  return { base, dest, ins, total: base + dest + ins };
};

// ── Stripe Checkout Modal ─────────────────────────────────────────────────────
interface StripeCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  totalPrice: number;
  trackingNumber: string;
  destination: string;
  lang: Lang;
  t: typeof T['de'];
  onPaymentSuccess: () => void;
  userId: string;
}

const StripeCheckoutModal: React.FC<StripeCheckoutProps> = ({
  isOpen, onClose, totalPrice, trackingNumber, destination, t, onPaymentSuccess, userId
}) => {
  const [payMethod, setPayMethod] = useState<'card' | 'paypal' | 'sofort'>('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [stripeReady, setStripeReady] = useState(false);
  const stripeRef = useRef<any>(null);
  const elementsRef = useRef<any>(null);
  const cardElementRef = useRef<any>(null);
  const cardMountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setSuccess(false);
    initStripe();
  }, [isOpen, payMethod]);

  const initStripe = async () => {
    try {
      if (STRIPE_PUBLISHABLE_KEY === 'pk_live_DEIN_KEY_HIER') {
        setError('⚠️ Stripe Key noch nicht konfiguriert. Bitte STRIPE_PUBLISHABLE_KEY eintragen.');
        return;
      }
      const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
      stripeRef.current = stripe;

      if (payMethod === 'card') {
        const elements = stripe.elements({ locale: 'de' });
        elementsRef.current = elements;
        const cardElement = elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#1C1C1C',
              fontFamily: 'system-ui, sans-serif',
              '::placeholder': { color: '#9ca3af' },
            },
          },
          hidePostalCode: true,
        });
        cardElementRef.current = cardElement;

        // Warte bis Modal im DOM ist
        setTimeout(() => {
          if (cardMountRef.current) {
            cardElement.mount(cardMountRef.current);
            setStripeReady(true);
          }
        }, 100);
      } else {
        setStripeReady(true);
      }
    } catch (e) {
      setError(t.stripeNotLoaded);
    }
  };

  const handlePay = async () => {
    if (!stripeRef.current) { setError(t.stripeNotLoaded); return; }
    setLoading(true);
    setError('');

    try {
      // Payment Intent vom Backend holen
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/create-stripe-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          amount: totalPrice,
          tracking_number: trackingNumber,
          destination,
          currency: 'eur',
        }),
      });

      const { client_secret, payment_intent_id, error: backendError } = await res.json();
      if (backendError) throw new Error(backendError);

      let result: any;

      if (payMethod === 'card') {
        result = await stripeRef.current.confirmCardPayment(client_secret, {
          payment_method: { card: cardElementRef.current },
        });
      } else if (payMethod === 'paypal') {
        result = await stripeRef.current.confirmPayPalPayment(client_secret, {
          return_url: window.location.href,
        });
      } else if (payMethod === 'sofort') {
        result = await stripeRef.current.confirmSofortPayment(client_secret, {
          payment_method: {
            sofort: { country: 'DE' },
          },
          return_url: window.location.href,
        });
      }

      if (result?.error) {
        setError(`${t.payError} ${result.error.message}`);
      } else {
        // Paket in Supabase als bezahlt markieren
        await supabase.from('parcels')
          .update({
            status: 'paid',
            payment_status: 'paid',
            payment_method: payMethod,
            stripe_payment_intent_id: payment_intent_id,
          })
          .eq('tracking_number', trackingNumber)
          .eq('user_id', userId);

        setSuccess(true);
        setTimeout(() => onPaymentSuccess(), 2000);
      }
    } catch (e: any) {
      setError(`${t.payError} ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-end sm:items-center justify-center sm:p-4"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col"
        style={{ maxHeight: 'min(92dvh, calc(100dvh - 64px))' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">
            {success ? `✓ ${t.paySuccess}` : t.checkoutTitle}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-9 h-9 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">{t.paySuccess}</h3>
              <p className="text-gray-500 text-sm">{t.successNote}</p>
              <div className="mt-4 bg-[#0A5EB0] text-white px-4 py-2 rounded-xl font-bold tracking-wider inline-block">
                {trackingNumber}
              </div>
            </div>
          ) : (
            <>
              {/* Zusammenfassung */}
              <div className="bg-[#0A5EB0] text-white rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs opacity-70">{t.trackingLabel}</p>
                  <p className="font-bold tracking-wider text-sm">{trackingNumber}</p>
                  <p className="text-xs opacity-70 mt-0.5">{destination === 'brazzaville' ? 'Brazzaville' : 'Pointe-Noire'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-70">{t.amountLabel}</p>
                  <p className="text-2xl font-bold">{totalPrice.toFixed(2)} €</p>
                </div>
              </div>

              {/* Zahlungsmethode */}
              <div>
                <p className="font-bold text-gray-900 mb-3">{t.payMethodTitle}</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'card',   label: t.payCard,   icon: '💳', desc: t.payCardDesc },
                    { val: 'paypal', label: t.payPaypal, icon: '🅿️', desc: t.payPaypalDesc },
                    { val: 'sofort', label: t.paySofort, icon: '⚡', desc: t.paySofortDesc },
                  ].map(opt => (
                    <button key={opt.val}
                      onClick={() => setPayMethod(opt.val as any)}
                      className={`border-2 rounded-xl p-3 text-center transition ${payMethod === opt.val ? 'border-[#0A5EB0] bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <div className="text-2xl mb-1">{opt.icon}</div>
                      <p className="text-xs font-bold text-gray-900">{opt.label}</p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  {payMethod === 'card' ? t.payCardDesc : payMethod === 'paypal' ? t.payPaypalDesc : t.paySofortDesc}
                </p>
              </div>

              {/* Stripe Card Element */}
              {payMethod === 'card' && (
                <div className="border-2 border-gray-200 rounded-xl p-4">
                  <div ref={cardMountRef} className="min-h-[40px]" />
                  {!stripeReady && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-[#0A5EB0] rounded-full animate-spin" />
                      Stripe wird geladen...
                    </div>
                  )}
                </div>
              )}

              {/* PayPal Info */}
              {payMethod === 'paypal' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">🅿️</div>
                  <p className="text-sm text-blue-800 font-medium">PayPal</p>
                  <p className="text-xs text-blue-600 mt-1">{t.payPaypalDesc}</p>
                  <p className="text-xs text-gray-500 mt-2">Du wirst zu PayPal weitergeleitet.</p>
                </div>
              )}

              {/* Sofort Info */}
              {payMethod === 'sofort' && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">⚡</div>
                  <p className="text-sm text-purple-800 font-medium">Sofortüberweisung</p>
                  <p className="text-xs text-purple-600 mt-1">{t.paySofortDesc}</p>
                  <p className="text-xs text-gray-500 mt-2">Du wirst zu deiner Bank weitergeleitet.</p>
                </div>
              )}

              {/* Sicherheits-Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <Shield className="w-3.5 h-3.5" />
                <span>SSL-verschlüsselt · Powered by Stripe</span>
              </div>

              {/* Fehler */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Pay Button */}
              <button onClick={handlePay}
                disabled={loading || (payMethod === 'card' && !stripeReady)}
                className="w-full py-4 bg-[#FF6F00] text-white rounded-xl font-bold text-base hover:bg-[#E66000] transition disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.processing}
                  </>
                ) : (
                  `${t.payBtn} — ${totalPrice.toFixed(2)} €`
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export const ParcelPage: React.FC = () => {
  const { user } = useAuth();
  const [lang, setLang] = useState<Lang>(getLanguage());
  const t = T[lang];

  const [view, setView] = useState<'home' | 'book' | 'tracking' | 'success'>('home');
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loadingParcels, setLoadingParcels] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [trackedParcel, setTrackedParcel] = useState<Parcel | null>(null);
  const [trackError, setTrackError] = useState('');
  const [newTrackingNumber, setNewTrackingNumber] = useState('');
  const [newTotalPrice, setNewTotalPrice] = useState(0);
  const [newDestination, setNewDestination] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const emptyForm: ParcelForm = {
    length: '', width: '', height: '', weight: '',
    origin_city: '', destination: 'brazzaville',
    insurance: false, declared_value: '',
    recipient_name: '', recipient_phone: '',
    sender_name: '', sender_phone: '',
  };
  const [form, setForm] = useState<ParcelForm>(emptyForm);
  const price = calcPrice(form);

  useEffect(() => {
    const interval = setInterval(() => setLang(getLanguage()), 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user && view === 'home') fetchMyParcels();
  }, [user, view]);

  const fetchMyParcels = async () => {
    if (!user) return;
    setLoadingParcels(true);
    try {
      const { data } = await supabase.from('parcels').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: false });
      setParcels(data || []);
    } catch (e) { console.error(e); }
    finally { setLoadingParcels(false); }
  };

  const handleSubmit = async () => {
    if (!user) { alert(t.alertLogin); return; }
    if (!form.length || !form.width || !form.height || !form.weight ||
        !form.origin_city || !form.recipient_name || !form.recipient_phone) {
      alert(t.alertFields); return;
    }
    setSubmitting(true);
    try {
      const tracking = 'GLB-' + Date.now().toString(36).toUpperCase();
      const { error } = await supabase.from('parcels').insert({
        user_id: user.id, tracking_number: tracking,
        length: parseFloat(form.length), width: parseFloat(form.width),
        height: parseFloat(form.height), weight: parseFloat(form.weight),
        origin_city: form.origin_city, destination: form.destination,
        insurance: form.insurance,
        declared_value: form.insurance ? parseFloat(form.declared_value) : null,
        recipient_name: form.recipient_name, recipient_phone: form.recipient_phone,
        sender_name: form.sender_name, sender_phone: form.sender_phone,
        total_price: price.total, status: 'registered', payment_status: 'pending',
        estimated_delivery: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      if (error) throw error;
      setNewTrackingNumber(tracking);
      setNewTotalPrice(price.total);
      setNewDestination(form.destination);
      setCheckoutOpen(true);
    } catch (e: any) { alert(e.message || t.alertSaveError); }
    finally { setSubmitting(false); }
  };

  const handleTrack = async () => {
    if (!trackingInput.trim()) return;
    setTrackError(''); setTrackedParcel(null);
    const { data } = await supabase.from('parcels').select('*')
      .eq('tracking_number', trackingInput.trim().toUpperCase()).single();
    if (data) setTrackedParcel(data);
    else setTrackError(t.trackNotFound);
  };

  const getStatusLabel = (key: string) => {
    const s = PARCEL_STATUSES.find(x => x.key === key);
    if (!s) return key;
    if (lang === 'fr') return s.labelFr;
    if (lang === 'ln') return s.labelLn;
    return s.label;
  };

  const inp = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A5EB0]';
  const sel = inp + ' bg-white';

  const LangSwitcher = () => (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1 ml-auto">
      {(['de','fr','ln'] as Lang[]).map(l => (
        <button key={l} onClick={() => { setLang(l); localStorage.setItem('germanlink_language', l); }}
          className={`px-3 py-1 rounded-md text-xs font-bold transition ${lang === l ? 'bg-[#0A5EB0] text-white' : 'text-gray-500 hover:text-gray-800'}`}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );

  // ── SUCCESS ──────────────────────────────────────────────────────────────
  if (view === 'success') return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.successTitle}</h2>
      <p className="text-gray-500 mb-6">{t.successSub}</p>
      <div className="bg-[#0A5EB0] text-white text-xl font-bold px-6 py-4 rounded-xl mb-6 tracking-widest">
        {newTrackingNumber}
      </div>
      <p className="text-sm text-gray-500 mb-8">
        {t.successNote}<br />
        <strong>{t.successContainer}</strong><br />
        {t.successDelivery}
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => { setView('home'); fetchMyParcels(); }}
          className="px-6 py-3 bg-[#0A5EB0] text-white rounded-xl font-bold">
          {t.btnMyParcels}
        </button>
        <button onClick={() => { setForm(emptyForm); setView('book'); }}
          className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-700">
          {t.btnAnother}
        </button>
      </div>
    </div>
  );

  // ── TRACKING ─────────────────────────────────────────────────────────────
  if (view === 'tracking') return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setView('home')} className="flex items-center gap-2 text-[#0A5EB0] text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> {t.back}
        </button>
        <LangSwitcher />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.trackTitle}</h2>
      <div className="flex gap-3 mb-8">
        <input type="text" placeholder={t.trackPh} value={trackingInput}
          onChange={e => setTrackingInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleTrack()}
          className={inp + ' flex-1'} />
        <button onClick={handleTrack}
          className="px-6 py-3 bg-[#0A5EB0] text-white rounded-xl font-bold text-sm">
          {t.trackSearch}
        </button>
      </div>
      {trackError && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">{trackError}</div>}
      {trackedParcel && <ParcelStatusCard parcel={trackedParcel} lang={lang} t={t} />}
    </div>
  );

  // ── BOOKING ──────────────────────────────────────────────────────────────
  if (view === 'book') return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setView('home')} className="flex items-center gap-2 text-[#0A5EB0] text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> {t.back}
          </button>
          <LangSwitcher />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.bookTitle}</h2>

        <div className="space-y-6">
          {/* Maße */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#0A5EB0]" /> {t.sectionDimensions}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {[
                { key: 'length', label: t.lengthLabel },
                { key: 'width',  label: t.widthLabel },
                { key: 'height', label: t.heightLabel },
                { key: 'weight', label: t.weightLabel },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                  <input type="number" min="0" step="0.1" placeholder="0"
                    value={form[f.key as keyof ParcelForm] as string}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className={inp} />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">{t.priceHint}</p>
          </div>

          {/* Orte */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0A5EB0]" /> {t.sectionLocation}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{t.originLabel}</label>
                <input type="text" placeholder={t.originPh} value={form.origin_city}
                  onChange={e => setForm({ ...form, origin_city: e.target.value })}
                  className={inp} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{t.destLabel}</label>
                <select value={form.destination}
                  onChange={e => setForm({ ...form, destination: e.target.value as any })}
                  className={sel}>
                  <option value="brazzaville">{t.destBZV}</option>
                  <option value="pointe-noire">{t.destPNR}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Versicherung */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0A5EB0]" /> {t.sectionInsurance}
            </h3>
            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <input type="checkbox" checked={form.insurance}
                onChange={e => setForm({ ...form, insurance: e.target.checked })}
                className="w-5 h-5 rounded accent-[#0A5EB0]" />
              <span className="text-sm font-medium">{t.insuranceCheck}</span>
            </label>
            {form.insurance && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{t.valueLabel}</label>
                <input type="number" min="0" placeholder="0.00" value={form.declared_value}
                  onChange={e => setForm({ ...form, declared_value: e.target.value })}
                  className={inp + ' max-w-xs'} />
              </div>
            )}
          </div>

          {/* Kontakte */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-4">{t.sectionContacts}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'sender_name',     label: t.senderName,     ph: t.senderNamePh,     type: 'text' },
                { key: 'sender_phone',    label: t.senderPhone,    ph: t.senderPhonePh,    type: 'tel' },
                { key: 'recipient_name',  label: t.recipientName,  ph: t.recipientNamePh,  type: 'text' },
                { key: 'recipient_phone', label: t.recipientPhone, ph: t.recipientPhonePh, type: 'tel' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                  <input type={f.type} placeholder={f.ph}
                    value={form[f.key as keyof ParcelForm] as string}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className={inp} />
                </div>
              ))}
            </div>
          </div>

          {/* Preisübersicht */}
          <div className="bg-[#0A5EB0] text-white rounded-2xl p-5">
            <h3 className="font-bold mb-3">{t.priceTitle}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between opacity-80"><span>{t.basePrice}</span><span>{price.base} €</span></div>
              {price.dest > 0 && <div className="flex justify-between opacity-80"><span>{t.pnrSurcharge}</span><span>+{price.dest} €</span></div>}
              {price.ins > 0 && <div className="flex justify-between opacity-80"><span>{t.insuranceLine}</span><span>+{price.ins} €</span></div>}
              <div className="flex justify-between font-bold text-lg border-t border-white/30 pt-2 mt-2">
                <span>{t.total}</span><span>{price.total} €</span>
              </div>
            </div>
            <p className="text-xs opacity-60 mt-3">{t.containerNote}</p>
          </div>

          {/* Zahlungshinweis */}
          <div className="flex items-center justify-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
            <span className="text-xl">💳</span>
            <span className="text-xl">🅿️</span>
            <span className="text-xl">⚡</span>
            <span className="text-sm text-gray-600 font-medium">
              Kreditkarte · PayPal · Sofortüberweisung
            </span>
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-4 bg-[#FF6F00] text-white rounded-xl font-bold text-base hover:bg-[#E66000] transition disabled:opacity-50">
            {submitting ? t.saving : `${t.submitBtn} — ${price.total} €`}
          </button>
        </div>
      </div>

      {user && (
        <StripeCheckoutModal
          isOpen={checkoutOpen}
          onClose={() => { setCheckoutOpen(false); setView('success'); }}
          totalPrice={newTotalPrice}
          trackingNumber={newTrackingNumber}
          destination={newDestination}
          lang={lang}
          t={t}
          onPaymentSuccess={() => { setCheckoutOpen(false); setView('success'); }}
          userId={user.id}
        />
      )}
    </>
  );

  // ── HOME ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-[#0A5EB0] to-[#1a7fd4] rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">📦 {t.title}</h1>
              <div className="flex gap-1 bg-white/15 rounded-lg p-1">
                {(['de','fr','ln'] as Lang[]).map(l => (
                  <button key={l} onClick={() => { setLang(l); localStorage.setItem('germanlink_language', l); }}
                    className={`px-2 py-0.5 rounded text-xs font-bold transition ${lang === l ? 'bg-white text-[#0A5EB0]' : 'text-white/70 hover:text-white'}`}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-blue-100 text-sm mb-4">
              {t.subtitle}<br />
              {t.containerInfo} <strong>{t.containerDate}</strong> {t.containerAb}
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => user ? setView('book') : alert(t.alertLogin)}
                className="px-5 py-2.5 bg-[#FF6F00] text-white rounded-xl font-bold text-sm hover:bg-[#E66000] transition">
                {t.btnBook}
              </button>
              <button onClick={() => setView('tracking')}
                className="px-5 py-2.5 bg-white/15 text-white border border-white/30 rounded-xl font-bold text-sm hover:bg-white/25 transition">
                {t.btnTrack}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            {[
              { num: '15.', label: t.statDepart },
              { num: '4W',  label: t.statDelivery },
              { num: 'BZV', label: 'Brazzaville' },
              { num: 'PNR', label: 'Pointe-Noire' },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 rounded-xl px-3 py-2">
                <p className="text-lg font-bold">{s.num}</p>
                <p className="text-xs text-blue-100">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-8">
        {[
          { icon: Package,    step: '1', title: t.step1Title, desc: t.step1Desc },
          { icon: CreditCard, step: '2', title: t.step2Title, desc: t.step2Desc },
          { icon: Truck,      step: '3', title: t.step3Title, desc: t.step3Desc },
          { icon: Home,       step: '4', title: t.step4Title, desc: t.step4Desc },
        ].map(({ icon: Icon, step, title, desc }) => (
          <div key={step} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-[#0A5EB0] rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs text-gray-400 mb-1">{t.stepLabel} {step}</p>
            <p className="font-bold text-sm text-gray-900">{title}</p>
            <p className="text-xs text-gray-500 mt-1">{desc}</p>
          </div>
        ))}
      </div>

      {user ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">{t.myParcels}</h2>
            <button onClick={fetchMyParcels} className="text-sm text-[#0A5EB0] font-medium">{t.refresh}</button>
          </div>
          {loadingParcels ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#0A5EB0] border-t-transparent" />
            </div>
          ) : parcels.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">{t.noParcels}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {parcels.map(parcel => (
                <ParcelCard key={parcel.id} parcel={parcel} getStatusLabel={getStatusLabel} t={t} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700 font-medium mb-2">{t.loginPrompt}</p>
          <p className="text-gray-500 text-sm">{t.loginSub}</p>
          <button onClick={() => setView('tracking')} className="mt-4 px-5 py-2 bg-[#0A5EB0] text-white rounded-xl font-bold text-sm">
            {t.trackBtn}
          </button>
        </div>
      )}
    </div>
  );
};

// ── Parcel Card ───────────────────────────────────────────────────────────────
const ParcelCard: React.FC<{
  parcel: Parcel; getStatusLabel: (k: string) => string; t: typeof T['de'];
}> = ({ parcel, getStatusLabel, t }) => {
  const idx = statusIndex[parcel.status] ?? 0;
  const pct = Math.round((idx / (PARCEL_STATUSES.length - 1)) * 100);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3 gap-2">
        <div>
          <p className="font-bold text-gray-900 text-sm">{parcel.tracking_number}</p>
          <p className="text-xs text-gray-500">
            {parcel.recipient_name} · {parcel.destination === 'brazzaville' ? 'Brazzaville' : 'Pointe-Noire'}
          </p>
          <p className="text-xs text-gray-400">{new Date(parcel.created_at).toLocaleDateString('de-DE')}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-[#0A5EB0] text-sm">{parcel.total_price?.toFixed(2)} €</p>
          <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full">
            {getStatusLabel(parcel.status)}
          </span>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div className="bg-[#0A5EB0] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-400 mt-1">{idx + 1}/{PARCEL_STATUSES.length} {t.steps}</p>
    </div>
  );
};

// ── Parcel Status Card ────────────────────────────────────────────────────────
const ParcelStatusCard: React.FC<{
  parcel: Parcel; lang: Lang; t: typeof T['de'];
}> = ({ parcel, lang, t }) => {
  const currentIdx = statusIndex[parcel.status] ?? 0;
  const pct = Math.round((currentIdx / (PARCEL_STATUSES.length - 1)) * 100);
  const getLabel = (s: typeof PARCEL_STATUSES[0]) => {
    if (lang === 'fr') return s.labelFr;
    if (lang === 'ln') return s.labelLn;
    return s.label;
  };
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4 gap-2">
        <div>
          <p className="text-lg font-bold text-gray-900">{parcel.tracking_number}</p>
          <p className="text-sm text-gray-500">{parcel.recipient_name}</p>
          <p className="text-sm text-gray-500">{parcel.destination === 'brazzaville' ? 'Brazzaville' : 'Pointe-Noire'}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-[#0A5EB0]">{parcel.total_price?.toFixed(2)} €</p>
          <p className="text-xs text-gray-400">{new Date(parcel.created_at).toLocaleDateString('de-DE')}</p>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
        <div className="bg-[#0A5EB0] h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-400 mb-5">{currentIdx + 1}/{PARCEL_STATUSES.length}</p>
      <div className="space-y-0">
        {PARCEL_STATUSES.map((s, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const Icon = s.icon;
          return (
            <div key={s.key} className="relative flex items-start gap-3 pb-3 last:pb-0">
              {idx < PARCEL_STATUSES.length - 1 && (
                <div className={`absolute left-4 top-8 w-0.5 h-full ${isCompleted ? 'bg-[#0A5EB0]' : 'bg-gray-200'}`} />
              )}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                isCompleted ? 'bg-[#0A5EB0] text-white' :
                isCurrent   ? `${s.color} text-white ring-2 ring-offset-1 ring-blue-300` :
                              'bg-gray-100 text-gray-300'
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 pt-1">
                <p className={`text-sm font-semibold ${
                  isCompleted ? 'text-[#0A5EB0]' : isCurrent ? 'text-gray-900' : 'text-gray-300'
                }`}>{getLabel(s)}</p>
                {isCurrent && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-1.5 py-0.5 mt-0.5">
                    <Clock className="w-2.5 h-2.5" /> {t.currentLabel}
                  </span>
                )}
              </div>
              {isCompleted && <CheckCircle className="w-4 h-4 text-[#0A5EB0] flex-shrink-0 mt-1" />}
            </div>
          );
        })}
      </div>
      {parcel.estimated_delivery && (
        <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center text-sm">
          <strong>{t.estimatedDelivery}:</strong>{' '}
          {new Date(parcel.estimated_delivery).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
        </div>
      )}
    </div>
  );
};

