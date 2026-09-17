import React, { useState } from 'react';
import { Check, ArrowLeft, ShieldCheck, Truck, Wrench, PlayCircle, X, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCartContext } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import imgSolarmodul from '../assets/system-solarmodul.png';
import imgMc4Kabel from '../assets/system-mc4-kabel.png';
import imgR5200 from '../assets/system-r5200.png';
import imgHero from '../assets/system-hero.png';

type Language = 'de' | 'fr' | 'ln' | 'en';

interface SystemPageProps {
  onBack: () => void;
  onGoToCart: () => void; // called after items were successfully added to the cart
  assemblyVideoUrl?: string; // link to the YouTube self-assembly video
}

interface SystemComponent {
  productId: string;   // real Supabase products.id
  name: string;
  qty: number;
  unitPrice: number;
}

interface SystemVariant {
  id: string;
  discountPercent: number;
  components: SystemComponent[];
  highlight?: boolean;
}

// ── Real product IDs from Supabase `products` table ──────────────────────
// Product names come from the catalog itself and are not translated.
const VARIANTS: SystemVariant[] = [
  {
    id: 'basic',
    discountPercent: 8,
    components: [
      { productId: '88ea3936-c939-4f94-a06d-0ec2c53a619f', name: 'RUNHOOD SOMMAR R5200 — Energiespeichersystem, All-in-One', qty: 1, unitPrice: 1558.80 },
      { productId: 'b02daf1b-4181-4885-9cd1-c06d0681e5d1', name: '500W Bifazial Solarmodul (JW500-Äquivalent)', qty: 4, unitPrice: 94.80 },
      { productId: '43490333-bb1c-4de9-907e-09317b863c1e', name: '10M MC4 Kabel', qty: 4, unitPrice: 58.80 },
      { productId: 'be39d9ae-4ea7-410d-98f5-b4ddbb77b9bb', name: 'Set Aufständerungen für ein Solarpanel 10–15° (BR5)', qty: 4, unitPrice: 82.80 },
    ],
  },
  {
    id: 'pro',
    discountPercent: 12,
    highlight: true,
    components: [
      { productId: 'dd2708e9-4afb-4a57-b6e8-e80dd9f7c66b', name: 'RUNHOOD SOMMAR R5200-AC — Energiespeichersystem', qty: 1, unitPrice: 1318.80 },
      { productId: 'b02daf1b-4181-4885-9cd1-c06d0681e5d1', name: '500W Bifazial Solarmodul (JW500-Äquivalent)', qty: 4, unitPrice: 94.80 },
      { productId: '43490333-bb1c-4de9-907e-09317b863c1e', name: '10M MC4 Kabel', qty: 4, unitPrice: 58.80 },
      { productId: 'be39d9ae-4ea7-410d-98f5-b4ddbb77b9bb', name: 'Set Aufständerungen für ein Solarpanel 10–15° (BR5)', qty: 4, unitPrice: 82.80 },
    ],
  },
];

// ── Translations ───────────────────────────────────────────────────────────
const translations = {
  de: {
    back: 'Zurück',
    eyebrow: 'Komplettsystem',
    title: 'Solar-Komplettsystem',
    subtitle: 'Powerstation, Solarmodule, Kabel und Halterung als fertig zusammengestelltes Set — Sie bestellen ein System, nicht einzelne Teile.',
    popular: 'Beliebt',
    variants: {
      basic: { name: 'Basic', tagline: 'Mit RUNHOOD R5200 (4× 1000 W MPPT)' },
      pro: { name: 'Pro', tagline: 'Mit RUNHOOD R5200-AC (mehr Kapazität)' },
    },
    youSave: (amount: string, pct: number) => `Sie sparen ${amount} (${pct}%)`,
    included: 'Das ist enthalten',
    perPiece: '/Stk.',
    features: [
      'Deutsche Qualitätskontrolle vor Versand',
      'Lieferung nach Kinshasa & Brazzaville',
      'Ohne Techniker selbst montierbar',
    ],
    assemblyTitle: 'Selbstmontage in Minuten',
    assemblyLink: 'Montagevideo auf YouTube ansehen',
    systemLabel: (name: string) => `System "${name}"`,
    insteadOf: (amount: string) => `statt ${amount} einzeln`,
    orderButton: 'System bestellen',
    adding: 'Wird hinzugefügt…',
    registerHint: 'Registrierung nur zum Abschluss der Bestellung nötig',
    authTitleLogin: 'Anmelden',
    authTitleRegister: 'Registrieren',
    authIntro: (name: string, price: string) => `Um das System "${name}" (${price}) zu bestellen, melde dich an oder registriere dich kurz.`,
    tabLogin: 'Anmelden',
    tabRegister: 'Registrieren',
    namePlaceholder: 'Name',
    emailPlaceholder: 'E-Mail',
    passwordPlaceholder: 'Passwort',
    submitLogin: 'Anmelden & bestellen',
    submitRegister: 'Registrieren & bestellen',
    submitBusy: 'Einen Moment…',
    genericError: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
    cartError: 'Beim Hinzufügen zum Warenkorb ist ein Fehler aufgetreten. Bitte versuche es erneut.',
    flow: [
      { step: '01 — Erzeugung', title: 'Solarmodul', desc: 'Aufstellung auf Flachdach, bis zu 4 Strings (PV1–PV4)' },
      { step: '02 — Verbindung', title: 'MC4-Solarkabel', desc: 'DC, rot / schwarz gesteckt' },
      { step: '03 — Speicher', title: 'R5200', desc: 'Laden, Puffern, Einspeisen — per App gesteuert' },
      { step: '04 — Verbrauch', title: 'Hausnetz', desc: 'AC-Ausgang in die Hausinstallation' },
      { step: '05 — Netz', title: 'Stromnetz', desc: 'Einspeisung des Überschusses, bidirektional' },
    ],
  },
  fr: {
    back: 'Retour',
    eyebrow: 'Système complet',
    title: 'Kit solaire complet',
    subtitle: 'Powerstation, panneaux solaires, câbles et support en un set déjà assemblé — vous commandez un système, pas des pièces séparées.',
    popular: 'Populaire',
    variants: {
      basic: { name: 'Basic', tagline: 'Avec RUNHOOD R5200 (4× 1000 W MPPT)' },
      pro: { name: 'Pro', tagline: 'Avec RUNHOOD R5200-AC (plus de capacité)' },
    },
    youSave: (amount: string, pct: number) => `Vous économisez ${amount} (${pct}%)`,
    included: 'Ce qui est inclus',
    perPiece: '/pièce',
    features: [
      'Contrôle qualité allemand avant expédition',
      'Livraison à Kinshasa & Brazzaville',
      'Montage possible sans technicien',
    ],
    assemblyTitle: 'Montage en quelques minutes',
    assemblyLink: 'Voir la vidéo de montage sur YouTube',
    systemLabel: (name: string) => `Système "${name}"`,
    insteadOf: (amount: string) => `au lieu de ${amount} à l'unité`,
    orderButton: 'Commander le système',
    adding: 'Ajout en cours…',
    registerHint: 'Inscription nécessaire uniquement pour finaliser la commande',
    authTitleLogin: 'Connexion',
    authTitleRegister: 'Inscription',
    authIntro: (name: string, price: string) => `Pour commander le système "${name}" (${price}), connectez-vous ou inscrivez-vous rapidement.`,
    tabLogin: 'Connexion',
    tabRegister: 'Inscription',
    namePlaceholder: 'Nom',
    emailPlaceholder: 'E-mail',
    passwordPlaceholder: 'Mot de passe',
    submitLogin: 'Se connecter & commander',
    submitRegister: "S'inscrire & commander",
    submitBusy: 'Un instant…',
    genericError: "Une erreur s'est produite. Veuillez réessayer.",
    cartError: "Une erreur s'est produite lors de l'ajout au panier. Veuillez réessayer.",
    flow: [
      { step: '01 — Production', title: 'Panneau solaire', desc: "Installation sur toit plat, jusqu'à 4 chaînes (PV1–PV4)" },
      { step: '02 — Connexion', title: 'Câble solaire MC4', desc: 'DC, connecté rouge / noir' },
      { step: '03 — Stockage', title: 'R5200', desc: 'Charge, tampon, injection — piloté via l\'app' },
      { step: '04 — Consommation', title: 'Réseau domestique', desc: "Sortie AC vers l'installation de la maison" },
      { step: '05 — Réseau', title: 'Réseau électrique', desc: 'Injection du surplus, bidirectionnelle' },
    ],
  },
  ln: {
    back: 'Zonga',
    eyebrow: 'Système ya mobimba',
    title: 'Kit solaire ya mobimba',
    subtitle: 'Powerstation, ba panneaux solaires, ba câbles na support na set moko esili kosangana — ozali kosomba système, kasu biloko na moko moko te.',
    popular: 'Eyebani mingi',
    variants: {
      basic: { name: 'Basic', tagline: 'Na RUNHOOD R5200 (4× 1000 W MPPT)' },
      pro: { name: 'Pro', tagline: 'Na RUNHOOD R5200-AC (capacité ya monene)' },
    },
    youSave: (amount: string, pct: number) => `Obikisi ${amount} (${pct}%)`,
    included: 'Oyo ezali kati',
    perPiece: '/moko',
    features: [
      'Contrôle ya qualité ya Allemagne liboso ya envoi',
      'Livraison na Kinshasa & Brazzaville',
      'Okoki komeka yo moko, technicien esengami te',
    ],
    assemblyTitle: 'Montage na ba minute moke',
    assemblyLink: 'Tala vidéo ya montage na YouTube',
    systemLabel: (name: string) => `Système "${name}"`,
    insteadOf: (amount: string) => `na esika ya ${amount} moko moko`,
    orderButton: 'Sombá système',
    adding: 'Ezali kobakisama…',
    registerHint: 'Inscription esengami kaka pona kosukisa commande',
    authTitleLogin: 'Kokota',
    authTitleRegister: 'Inscription',
    authIntro: (name: string, price: string) => `Pona kosomba système "${name}" (${price}), kotá to sala inscription na yo noki.`,
    tabLogin: 'Kokota',
    tabRegister: 'Inscription',
    namePlaceholder: 'Kombo',
    emailPlaceholder: 'E-mail',
    passwordPlaceholder: 'Mot de passe',
    submitLogin: 'Kota & sombá',
    submitRegister: 'Sala inscription & sombá',
    submitBusy: 'Zela moke…',
    genericError: 'Likambo moko ekweyi. Meká lisusu.',
    cartError: 'Likambo moko ekweyi na koya kobakisa na panier. Meká lisusu.',
    flow: [
      { step: '01 — Kobimisa énergie', title: 'Panneau solaire', desc: 'Installation na toit plat, tii ba strings 4 (PV1–PV4)' },
      { step: '02 — Boyokani', title: 'Câble solaire MC4', desc: 'DC, ekangami motane / moindo' },
      { step: '03 — Bobombi', title: 'R5200', desc: 'Kotondisa, kobomba, kotinda — na app' },
      { step: '04 — Kosalela', title: 'Réseau ya ndako', desc: 'Sortie AC na installation ya ndako' },
      { step: '05 — Réseau', title: 'Réseau ya courant', desc: 'Kotinda oyo etikali, na ba sens mibale' },
    ],
  },
  en: {
    back: 'Back',
    eyebrow: 'Complete system',
    title: 'Solar complete system',
    subtitle: 'Powerstation, solar panels, cables and mounting as a ready-assembled set — you order one system, not separate parts.',
    popular: 'Popular',
    variants: {
      basic: { name: 'Basic', tagline: 'With RUNHOOD R5200 (4× 1000 W MPPT)' },
      pro: { name: 'Pro', tagline: 'With RUNHOOD R5200-AC (more capacity)' },
    },
    youSave: (amount: string, pct: number) => `You save ${amount} (${pct}%)`,
    included: "What's included",
    perPiece: '/unit',
    features: [
      'German quality control before shipping',
      'Delivery to Kinshasa & Brazzaville',
      'Can be self-installed without a technician',
    ],
    assemblyTitle: 'Self-install in minutes',
    assemblyLink: 'Watch the installation video on YouTube',
    systemLabel: (name: string) => `System "${name}"`,
    insteadOf: (amount: string) => `instead of ${amount} bought separately`,
    orderButton: 'Order the system',
    adding: 'Adding…',
    registerHint: 'Registration only needed to complete the order',
    authTitleLogin: 'Log in',
    authTitleRegister: 'Register',
    authIntro: (name: string, price: string) => `To order the "${name}" system (${price}), please log in or register quickly.`,
    tabLogin: 'Log in',
    tabRegister: 'Register',
    namePlaceholder: 'Name',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    submitLogin: 'Log in & order',
    submitRegister: 'Register & order',
    submitBusy: 'One moment…',
    genericError: 'Something went wrong. Please try again.',
    cartError: 'An error occurred while adding to the cart. Please try again.',
    flow: [
      { step: '01 — Generation', title: 'Solar panel', desc: 'Installed on flat roof, up to 4 strings (PV1–PV4)' },
      { step: '02 — Connection', title: 'MC4 solar cable', desc: 'DC, red / black connectors' },
      { step: '03 — Storage', title: 'R5200', desc: 'Charging, buffering, feeding in — controlled via app' },
      { step: '04 — Consumption', title: 'Home network', desc: 'AC output into the home installation' },
      { step: '05 — Grid', title: 'Power grid', desc: 'Feeding in surplus power, bidirectional' },
    ],
  },
};

const calcTotals = (variant: SystemVariant) => {
  const sum = variant.components.reduce((acc, c) => acc + c.qty * c.unitPrice, 0);
  const discounted = sum * (1 - variant.discountPercent / 100);
  const savings = sum - discounted;
  return { sum, discounted, savings };
};

const HouseIcon = () => (
  <svg viewBox="0 0 64 64" width={40} height={40} fill="none" stroke="#9184d9" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
    <path d="M8 28 L32 9 L56 28" />
    <path d="M14 26 V54 H50 V26" />
    <path d="M27 54 V38 H37 V54" />
  </svg>
);

const GridIcon = () => (
  <svg viewBox="0 0 64 64" width={40} height={40} fill="none" stroke="#9184d9" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
    <path d="M18 56 L26 8 H38 L46 56" />
    <path d="M22 34 H42" />
    <path d="M20 46 H44" />
    <path d="M24 20 H40" />
    <path d="M22 34 L42 46" />
    <path d="M42 34 L22 46" />
  </svg>
);

const FLOW_IMAGES = [imgSolarmodul, imgMc4Kabel, imgR5200, undefined, undefined] as const;
const FLOW_ICONS: Array<'house' | 'grid' | undefined> = [undefined, undefined, undefined, 'house', 'grid'];

const SystemFlow: React.FC<{ steps: { step: string; title: string; desc: string }[] }> = ({ steps }) => (
  <div className="system-flow">
    <style>{`
      .system-flow {
        display: flex; align-items: stretch; gap: 0;
        background: radial-gradient(120% 90% at 18% 0%, #1d2036 0%, #0d1224 60%);
        border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
        padding: 1.6rem 1.4rem; overflow: hidden;
      }
      .system-flow-step { display: flex; flex-direction: column; gap: 10px; flex: 1; min-width: 0; }
      .system-flow-arrow { display: flex; align-items: center; justify-content: center; flex: 0 0 32px; color: #9184d9; opacity: 0.7; }
      .system-flow-photo {
        width: 100%; aspect-ratio: 4/3; border-radius: 8px; overflow: hidden;
        border: 1px solid rgba(255,255,255,0.1); background: #f4f2ec;
        display: flex; align-items: center; justify-content: center;
      }
      .system-flow-photo img { width: 100%; height: 100%; object-fit: cover; }
      .system-flow-photo.contain img { object-fit: contain; padding: 10px; }
      .system-flow-icon-card {
        aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center;
        border-radius: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
      }
      .system-flow-step-label { font-size: 0.65rem; letter-spacing: 0.14em; text-transform: uppercase; color: #8fa3b8; }
      .system-flow-step-title { font-family: Georgia, serif; font-size: 1rem; font-weight: 700; color: #f5f2eb; }
      .system-flow-step-desc { font-size: 0.75rem; color: #8fa3b8; line-height: 1.4; }
      @media (max-width: 900px) {
        .system-flow { flex-direction: column; gap: 1.2rem; padding: 1.3rem; }
        .system-flow-arrow { flex-direction: row; transform: rotate(90deg); flex: 0 0 auto; height: 20px; }
        .system-flow-photo { aspect-ratio: 16/10; }
      }
    `}</style>
    {steps.map((s, i) => (
      <React.Fragment key={i}>
        <div className="system-flow-step">
          {FLOW_IMAGES[i] ? (
            <div className={`system-flow-photo${i === 1 ? ' contain' : ''}`}>
              <img src={FLOW_IMAGES[i]} alt={s.title} />
            </div>
          ) : (
            <div className="system-flow-icon-card">
              {FLOW_ICONS[i] === 'house' ? <HouseIcon /> : <GridIcon />}
            </div>
          )}
          <div className="system-flow-step-label">{s.step}</div>
          <div className="system-flow-step-title">{s.title}</div>
          <div className="system-flow-step-desc">{s.desc}</div>
        </div>
        {i < steps.length - 1 && (
          <div className="system-flow-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
        )}
      </React.Fragment>
    ))}
  </div>
);

export const SystemPage: React.FC<SystemPageProps> = ({ onBack, onGoToCart, assemblyVideoUrl }) => {
  const { user, signIn, signUp } = useAuth();
  const { addToCart } = useCartContext();
  const { language, formatPrice } = useLanguage();
  const lang = ((language as Language) && translations[language as Language]) ? (language as Language) : 'de';
  const t = translations[lang];

  const [selectedId, setSelectedId] = useState<string>(
    VARIANTS.find(v => v.highlight)?.id ?? VARIANTS[0].id
  );
  const selected = VARIANTS.find(v => v.id === selectedId)!;
  const selectedLabel = t.variants[selected.id as 'basic' | 'pro'];
  const totals = calcTotals(selected);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Adds every component of the selected system to the cart with its correct
  // quantity in one DB call each — no per-unit loop, so no race with cart state.
  const addSystemToCart = async () => {
    setAddingToCart(true);
    try {
      for (const component of selected.components) {
        await addToCart(component.productId, component.qty);
      }
      onGoToCart();
    } catch (err) {
      console.error('Fehler beim Hinzufügen des Systems zum Warenkorb:', err);
      setAuthError(t.cartError);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleOrderClick = () => {
    if (!user) {
      setAuthError(null);
      setShowAuthModal(true);
      return;
    }
    addSystemToCart();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);
    try {
      if (authMode === 'login') {
        await signIn(authEmail, authPassword);
      } else {
        await signUp(authEmail, authPassword, authName);
      }
      setShowAuthModal(false);
      // user is now set via AuthContext's onAuthStateChange; proceed to add items.
      await addSystemToCart();
    } catch (err: any) {
      setAuthError(err?.message || t.genericError);
    } finally {
      setAuthBusy(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: '#0a1628', color: '#f5f2eb', minHeight: '100vh', paddingTop: 88 }}>
      <style>{`
        .system-variants { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .system-layout { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 2.5rem; align-items: start; }
        .spin { animation: system-spin 0.8s linear infinite; }
        @keyframes system-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .system-price-panel { position: sticky; top: 100px; }
        @media (max-width: 720px) {
          .system-variants { grid-template-columns: 1fr; }
          .system-layout { grid-template-columns: 1fr; gap: 2rem; }
          /* Sticky makes no sense in a single-column mobile layout and can end up
             fighting the app's fixed bottom navigation. Let it flow normally instead,
             and add extra bottom clearance so the order button is never hidden behind
             the bottom nav bar. */
          .system-price-panel { position: static; margin-bottom: calc(90px + env(safe-area-inset-bottom, 0px)); }
        }
      `}</style>

      {/* Back nav */}
      <div style={{ padding: '0 4vw', marginBottom: '1.5rem' }}>
        <button
          onClick={onBack}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#8fa3b8', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} /> {t.back}
        </button>
      </div>

      {/* Header */}
      <div style={{ padding: '0 4vw', marginBottom: '2rem', maxWidth: 900 }}>
        <div style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#F4B400', fontWeight: 700, marginBottom: '0.6rem' }}>
          {t.eyebrow}
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 900, marginBottom: '0.6rem' }}>
          {t.title}
        </h1>
        <p style={{ color: '#8fa3b8', lineHeight: 1.7, maxWidth: 600 }}>
          {t.subtitle}
        </p>
      </div>

      {/* Hero image — shows what the system looks like & does, before any price */}
      <div style={{ padding: '0 4vw', marginBottom: '2.5rem' }}>
        <div style={{
          width: '100%', borderRadius: 10, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <img
            src={imgHero}
            alt="Runhood R5200 mit App-Steuerung im Einsatz zuhause, inklusive Smart-Meter-Optionen"
            style={{ display: 'block', width: '100%', height: 'auto' }}
          />
        </div>
      </div>

      {/* Variant selector */}
      <div style={{ padding: '0 4vw', marginBottom: '2.5rem' }}>
        <div className="system-variants">
          {VARIANTS.map(v => {
            const vt = calcTotals(v);
            const label = t.variants[v.id as 'basic' | 'pro'];
            const isActive = v.id === selectedId;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedId(v.id)}
                style={{
                  textAlign: 'left', cursor: 'pointer', position: 'relative',
                  border: isActive ? '2px solid #F4B400' : '1px solid rgba(255,255,255,0.12)',
                  background: isActive ? 'rgba(244,180,0,0.08)' : 'rgba(255,255,255,0.02)',
                  borderRadius: 8, padding: '1.4rem 1.5rem',
                }}
              >
                {v.highlight && (
                  <span style={{ position: 'absolute', top: -10, right: 16, background: '#F4B400', color: '#0a1628', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 3 }}>
                    {t.popular}
                  </span>
                )}
                <div style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 4 }}>{label.name}</div>
                <div style={{ fontSize: '0.82rem', color: '#8fa3b8', marginBottom: '0.9rem' }}>{label.tagline}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 900, color: '#F4B400' }}>
                    {formatPrice(vt.discounted)}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#8fa3b8', textDecoration: 'line-through' }}>
                    {formatPrice(vt.sum)}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#5dcaa5', marginTop: 4 }}>
                  {t.youSave(formatPrice(vt.savings), v.discountPercent)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail layout */}
      <div style={{ padding: '0 4vw 4rem' }}>
        <div className="system-layout">
          {/* Left: flow diagram + components */}
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <SystemFlow steps={t.flow} />
            </div>

            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>{t.included}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {selected.components.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.9rem',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 6, padding: '0.85rem 1rem',
                }}>
                  <span style={{
                    flexShrink: 0, width: 30, height: 30, borderRadius: 6, background: 'rgba(244,180,0,0.15)',
                    color: '#F4B400', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem',
                  }}>
                    {c.qty}×
                  </span>
                  <span style={{ flex: 1, fontSize: '0.88rem' }}>{c.name}</span>
                  <span style={{ fontSize: '0.85rem', color: '#8fa3b8' }}>{formatPrice(c.unitPrice)} {t.perPiece}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {[
                <ShieldCheck size={16} color="#5dcaa5" />,
                <Truck size={16} color="#5dcaa5" />,
                <Wrench size={16} color="#5dcaa5" />,
              ].map((icon, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#c9d3dc' }}>
                  {icon} {t.features[i]}
                </div>
              ))}
            </div>

            {assemblyVideoUrl && (
              <a
                href={assemblyVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'rgba(221,0,0,0.08)', border: '1px solid rgba(221,0,0,0.3)',
                  borderRadius: 6, padding: '0.85rem 1rem', textDecoration: 'none', color: '#f5f2eb',
                }}
              >
                <PlayCircle size={22} color="#DD0000" />
                <span style={{ fontSize: '0.85rem' }}>
                  <strong>{t.assemblyTitle}</strong> — {t.assemblyLink}
                </span>
              </a>
            )}
          </div>

          {/* Right: price + order */}
          <div className="system-price-panel" style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '1.8rem',
          }}>
            <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8fa3b8', marginBottom: '0.4rem' }}>
              {t.systemLabel(selectedLabel.name)}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: '0.3rem' }}>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '2.2rem', fontWeight: 900, color: '#F4B400' }}>
                {formatPrice(totals.discounted)}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#8fa3b8', marginBottom: '1.3rem' }}>
              {t.insteadOf(formatPrice(totals.sum))}
              {' · '}
              <span style={{ color: '#5dcaa5', fontWeight: 700 }}>−{selected.discountPercent}%</span>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', marginBottom: '1.3rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {selected.components.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#8fa3b8' }}>
                  <span>{c.qty}× {c.name.split('—')[0].trim()}</span>
                  <span>{formatPrice(c.qty * c.unitPrice)}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleOrderClick}
              disabled={addingToCart}
              style={{
                width: '100%', background: '#F4B400', color: '#0a1628', fontWeight: 800,
                fontSize: '0.92rem', letterSpacing: '0.03em', textTransform: 'uppercase',
                padding: '1rem', border: 'none', borderRadius: 6, cursor: addingToCart ? 'default' : 'pointer',
                marginBottom: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: addingToCart ? 0.7 : 1,
              }}
            >
              {addingToCart ? (<><Loader2 size={16} className="spin" /> {t.adding}</>) : t.orderButton}
            </button>
            <div style={{ fontSize: '0.75rem', color: '#8fa3b8', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Check size={13} color="#5dcaa5" /> {t.registerHint}
            </div>
          </div>
        </div>
      </div>

      {/* ── LOGIN / REGISTER MODAL ─────────────────────────────────────────── */}
      {showAuthModal && (
        <div
          onClick={() => !authBusy && setShowAuthModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(5,10,20,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0a1628', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10, width: '100%', maxWidth: 400, padding: '1.8rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
              <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 900, color: '#F4B400', fontSize: '1.15rem', margin: 0 }}>
                {authMode === 'login' ? t.authTitleLogin : t.authTitleRegister}
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} color="#f5f2eb" />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#8fa3b8', marginBottom: '1.2rem' }}>
              {t.authIntro(selectedLabel.name, formatPrice(totals.discounted))}
            </p>

            <div style={{ display: 'flex', gap: 6, marginBottom: '1.2rem', background: 'rgba(255,255,255,0.05)', padding: 4, borderRadius: 8 }}>
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, background: authMode === 'login' ? '#F4B400' : 'transparent', color: authMode === 'login' ? '#0a1628' : '#8fa3b8' }}
              >
                {t.tabLogin}
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, background: authMode === 'register' ? '#F4B400' : 'transparent', color: authMode === 'register' ? '#0a1628' : '#8fa3b8' }}
              >
                {t.tabRegister}
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {authMode === 'register' && (
                <input
                  type="text" placeholder={t.namePlaceholder} required value={authName}
                  onChange={e => setAuthName(e.target.value)}
                  style={{ padding: '0.7rem 0.9rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: '#f5f2eb', fontSize: '0.88rem' }}
                />
              )}
              <input
                type="email" placeholder={t.emailPlaceholder} required value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                style={{ padding: '0.7rem 0.9rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: '#f5f2eb', fontSize: '0.88rem' }}
              />
              <input
                type="password" placeholder={t.passwordPlaceholder} required value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                style={{ padding: '0.7rem 0.9rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: '#f5f2eb', fontSize: '0.88rem' }}
              />

              {authError && (
                <div style={{ fontSize: '0.78rem', color: '#ff6b6b' }}>{authError}</div>
              )}

              <button
                type="submit"
                disabled={authBusy}
                style={{
                  marginTop: '0.4rem', background: '#F4B400', color: '#0a1628', fontWeight: 800,
                  fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.03em',
                  padding: '0.85rem', border: 'none', borderRadius: 6, cursor: authBusy ? 'default' : 'pointer',
                  opacity: authBusy ? 0.7 : 1,
                }}
              >
                {authBusy ? t.submitBusy : (authMode === 'login' ? t.submitLogin : t.submitRegister)}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

