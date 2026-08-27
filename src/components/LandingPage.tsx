import React, { useState, useEffect } from 'react';
import { Shield, X, ChevronDown } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate?: (view: string) => void;
}

type Language = 'de' | 'fr' | 'ln';

const CAT_COLORS = [
  { bg: '#FFCE00', text: '#0a1628', abbr: 'SOL' },
  { bg: '#009A00', text: '#fff',    abbr: 'AGR' },
  { bg: '#DD0000', text: '#fff',    abbr: 'GEN' },
  { bg: '#000000', text: '#FFCE00', abbr: 'ÉLM' },
  { bg: '#007FFF', text: '#fff',    abbr: 'VÉH' },
  { bg: '#CE1021', text: '#fff',    abbr: 'IND' },
];

const WHY_COLORS = [
  { colors: ['#000000','#DD0000','#FFCE00'], label: 'DQ' },
  { colors: ['#009A00','#FBDE2A','#CE1021'], label: 'CS' },
  { colors: ['#000000','#DD0000','#FFCE00'], label: 'PS' },
  { colors: ['#007FFF','#F7D618','#CE1021'], label: 'RL' },
];

const STEP_COLORS = ['#FFCE00', '#009A00', '#DD0000', '#007FFF'];

const translations = {
  de: {
    languageNames: { de: 'Deutsch', fr: 'Français', ln: 'Lingala' },
    nav: { howItWorks: 'Wie es funktioniert', categories: 'Produkte', seller: 'Verkäufer', trust: 'Über uns' },
    hero: {
      tag: 'Hamburg → Congo & DR Kongo',
      title: 'Deutsche Qualität.',
      titleAccent: 'Direkt nach Kongo.',
      subtitle: 'Kaufen, verkaufen und versenden Sie geprüfte deutsche Produkte – schnell, sicher und ohne Umwege zwischen Deutschland und Zentralafrika.',
      btn1: 'Produkte kaufen',
      btn2: 'Produkte verkaufen',
      btn3: 'Container versenden',
      stat1num: '200+', stat1label: 'Händler im Netzwerk',
      stat2num: '12×',  stat2label: 'Container pro Jahr',
      stat3num: '4',    stat3label: 'Städte in Congo',
      stat4num: '3',    stat4label: 'Sprachen Support',
    },
    energyDay: {
      badge: 'Sonderevent',
      title: 'GLB Energy Day',
      subtitle: 'Erleben Sie live unser neues Solarsystem — jetzt Produktbroschüre ansehen',
      cta: 'Broschüre ansehen',
      close: 'Schließen',
    },
    how: {
      tag: 'Ablauf',
      title: 'Wie funktioniert GLB?',
      subtitle: 'Von der Anfrage bis zur Lieferung in Kinshasa oder Brazzaville — transparent und sicher.',
      route: ['Hamburg', 'Luftfracht / Seeweg', 'Pointe-Noire', 'Matadi', 'BZV & KIN'],
      steps: [
        { num: '01', title: 'Produkt auswählen',      desc: 'Kunden wählen Produkte aus dem Marketplace oder senden eine individuelle Anfrage.' },
        { num: '02', title: 'GLB organisiert Einkauf', desc: 'Qualitätsprüfung & sichere Zahlungsabwicklung. Vollständige Dokumentation.' },
        { num: '03', title: 'Sammelcontainer Versand', desc: 'Monatliche Container Hamburg → Pointe-Noire / Matadi.' },
        { num: '04', title: 'Lieferung in Congo',      desc: 'Lieferung bis Brazzaville & Kinshasa über unser lokales Agentennetzwerk.' },
      ],
    },
    why: {
      tag: 'Warum GLB?',
      title: 'Ihr Vertrauenspartner für den deutsch-afrikanischen Handel.',
      subtitle: 'Wir verbinden deutsche Qualität mit afrikanischer Reichweite — zuverlässig und transparent.',
      cards: [
        { title: 'Deutsche Qualitätskontrolle',   desc: 'Alle Produkte werden vor dem Versand in Deutschland geprüft und dokumentiert.' },
        { title: 'Sicherer Sammelcontainer',       desc: 'Regelmäßige monatliche Transporte mit vollständiger Versicherung und Tracking.' },
        { title: 'Sichere Zahlungsabwicklung',     desc: 'Dokumentierte und transparente Zahlungsprozesse — LemFi, UBA Bank und mehr.' },
        { title: 'Lokales Netzwerk in Afrika',     desc: 'Eigene Agenten und mehrsprachiger Support in Congo & DR Kongo vor Ort.' },
      ],
    },
    cats: {
      tag: 'Sortiment',
      title: 'Produktkategorien',
      subtitle: 'Deutsche Qualitätsprodukte für den afrikanischen Markt — von Solarenergie bis Fahrzeugtechnik.',
      items: [
        { title: 'Solarsysteme',        desc: 'Solaranlagen, Batterien & Wechselrichter' },
        { title: 'Agrarmaschinen',      desc: 'Traktoren, Pumpen & Feldgeräte' },
        { title: 'Generatoren',         desc: 'Diesel- & Benzingeneratoren aller Klassen' },
        { title: 'Haushaltsgeräte',     desc: 'Kühlschränke, Waschmaschinen & mehr' },
        { title: 'Reifen & Fahrzeug',   desc: 'Reifen, Ersatzteile & Zubehör' },
        { title: 'Individuelle Anfrage',desc: 'Produkt nicht gefunden? Wir beschaffen es.' },
      ],
    },
    seller: {
      tag: 'Für Händler & Unternehmen',
      title: 'Verkaufe deine Produkte nach Afrika.',
      subtitle: 'GLB hilft deutschen Händlern und Unternehmen beim sicheren Verkauf nach Zentralafrika — ohne Vorkenntnisse über den afrikanischen Markt.',
      benefits: [
        'Zugang zu 90 Millionen Kunden in Zentralafrika',
        'GLB übernimmt die gesamte Logistik & Verzollung',
        'Sichere, dokumentierte Zahlungen',
        'Keine Afrika-Erfahrung nötig',
        'Marketplace-Listing + Containerlösung',
      ],
      btn1: 'Seller werden',
      btn2: 'Mehr erfahren',
    },
    proof: {
      tag: 'Vertrauen & Zahlen',
      title: 'Deutschland ↔ Congo, seit Jahren.',
      subtitle: 'Unser Netzwerk wächst — dank zufriedener Händler und Kunden auf beiden Seiten.',
      stats: [
        { num: '200+', label: 'Händler im Netzwerk' },
        { num: '12',   label: 'Container pro Jahr' },
        { num: '4',    label: 'Städte in Congo' },
        { num: '3',    label: 'Sprachen Support' },
      ],
      testimonials: [
        { text: 'Über GLB konnte ich endlich eine hochwertige Solaranlage aus Deutschland kaufen. Die Lieferung nach Kinshasa war reibungslos und transparent.', name: 'Jean-Pierre M.', role: 'Kunde · Kinshasa, DR Kongo' },
        { text: 'Als Händler in Hamburg war der Einstieg in den afrikanischen Markt ohne GLB undenkbar. Sie nehmen einem die gesamte Logistik ab.', name: 'Klaus H.', role: 'Seller · Hamburg, Deutschland' },
        { text: "Le service est excellent. J'ai reçu ma commande à Brazzaville dans les délais prévus. Je recommande GLB à tous.", name: 'Marie-Claire N.', role: 'Cliente · Brazzaville, Congo' },
      ],
    },
    cta: {
      title: 'Bereit anzufangen?',
      subtitle: 'Kaufe, verkaufe oder versende — GLB ist deine Brücke zwischen Deutschland und Zentralafrika.',
      btn1: 'Jetzt kaufen',
      btn2: 'Seller werden',
      btn3: 'Kontakt aufnehmen',
    },
    footer: {
      tagline: 'Deutsche Qualität für afrikanisches Business',
      contact: 'Kontakt',
      agb: 'AGB & Lieferbedingungen',
      how: 'So funktioniert GLB',
      about: 'Über GLB',
      copyright: '2026 GermanLink Business. Deutsche Qualität für den Kongo.',
    },
  },
  fr: {
    languageNames: { de: 'Allemand', fr: 'Français', ln: 'Lingala' },
    nav: { howItWorks: 'Comment ça marche', categories: 'Produits', seller: 'Vendeurs', trust: 'À propos' },
    hero: {
      tag: 'Hambourg → Congo & RD Congo',
      title: 'Qualité allemande.',
      titleAccent: 'Directement au Congo.',
      subtitle: "Achetez, vendez et expédiez des produits allemands certifiés — rapidement, en toute sécurité, sans détour entre l'Allemagne et l'Afrique centrale.",
      btn1: 'Acheter des produits',
      btn2: 'Vendre des produits',
      btn3: 'Expédier un colis',
      stat1num: '200+', stat1label: 'Marchands dans le réseau',
      stat2num: '12×',  stat2label: 'Conteneurs par an',
      stat3num: '4',    stat3label: 'Villes au Congo',
      stat4num: '3',    stat4label: 'Langues de support',
    },
    energyDay: {
      badge: 'Événement spécial',
      title: 'GLB Energy Day',
      subtitle: 'Découvrez en direct notre nouveau système solaire — voir la brochure produit',
      cta: 'Voir la brochure',
      close: 'Fermer',
    },
    how: {
      tag: 'Processus',
      title: 'Comment fonctionne GLB?',
      subtitle: 'De la demande à la livraison à Kinshasa ou Brazzaville — transparent et sécurisé.',
      route: ['Hambourg', 'Fret aérien / Maritime', 'Pointe-Noire', 'Matadi', 'BZV & KIN'],
      steps: [
        { num: '01', title: 'Choisir un produit',       desc: "Les clients choisissent des produits sur le marketplace ou envoient une demande individuelle." },
        { num: '02', title: "GLB organise l'achat",     desc: 'Contrôle qualité & paiement sécurisé. Documentation complète.' },
        { num: '03', title: 'Expédition conteneur groupé', desc: 'Conteneurs mensuels Hambourg → Pointe-Noire / Matadi.' },
        { num: '04', title: 'Livraison au Congo',        desc: "Livraison jusqu'à Brazzaville & Kinshasa via notre réseau d'agents locaux." },
      ],
    },
    why: {
      tag: 'Pourquoi GLB?',
      title: 'Votre partenaire de confiance pour le commerce germano-africain.',
      subtitle: 'Nous connectons la qualité allemande à la portée africaine — fiable et transparent.',
      cards: [
        { title: 'Contrôle qualité allemand',      desc: "Tous les produits sont vérifiés et documentés en Allemagne avant expédition." },
        { title: 'Conteneur groupé sécurisé',      desc: 'Transports mensuels réguliers avec assurance complète et suivi.' },
        { title: 'Paiement sécurisé',              desc: 'Processus de paiement documentés et transparents — LemFi, UBA Bank et plus.' },
        { title: 'Réseau local en Afrique',        desc: "Agents propres et support multilingue au Congo & RD Congo sur place." },
      ],
    },
    cats: {
      tag: 'Catalogue',
      title: 'Catégories de produits',
      subtitle: "Produits allemands de qualité pour le marché africain — de l'énergie solaire aux pièces automobiles.",
      items: [
        { title: 'Systèmes solaires',    desc: 'Panneaux solaires, batteries & onduleurs' },
        { title: 'Machines agricoles',   desc: 'Tracteurs, pompes & équipements agricoles' },
        { title: 'Générateurs',          desc: 'Générateurs diesel & essence toutes classes' },
        { title: 'Électroménager',       desc: 'Réfrigérateurs, machines à laver & plus' },
        { title: 'Pneus & Véhicules',    desc: 'Pneus, pièces détachées & accessoires' },
        { title: 'Demande individuelle', desc: 'Produit introuvable? Nous le procurons.' },
      ],
    },
    seller: {
      tag: 'Pour les marchands & entreprises',
      title: 'Vendez vos produits en Afrique.',
      subtitle: "GLB aide les marchands et entreprises allemands à vendre en toute sécurité en Afrique centrale — sans expérience préalable du marché africain.",
      benefits: [
        "Accès à 90 millions de clients en Afrique centrale",
        'GLB gère toute la logistique & le dédouanement',
        'Paiements sécurisés et documentés',
        "Aucune expérience de l'Afrique requise",
        'Listing marketplace + solution conteneur',
      ],
      btn1: 'Devenir vendeur',
      btn2: 'En savoir plus',
    },
    proof: {
      tag: 'Confiance & Chiffres',
      title: 'Allemagne ↔ Congo, depuis des années.',
      subtitle: 'Notre réseau grandit — grâce à des marchands et clients satisfaits des deux côtés.',
      stats: [
        { num: '200+', label: 'Marchands dans le réseau' },
        { num: '12',   label: 'Conteneurs par an' },
        { num: '4',    label: 'Villes au Congo' },
        { num: '3',    label: 'Langues de support' },
      ],
      testimonials: [
        { text: "Grâce à GLB, j'ai pu acheter un système solaire de qualité depuis l'Allemagne. La livraison à Kinshasa était fluide et transparente.", name: 'Jean-Pierre M.', role: 'Client · Kinshasa, RD Congo' },
        { text: "En tant que marchand à Hambourg, entrer sur le marché africain sans GLB était impensable. Ils gèrent toute la logistique.", name: 'Klaus H.', role: 'Vendeur · Hambourg, Allemagne' },
        { text: "Le service est excellent. J'ai reçu ma commande à Brazzaville dans les délais prévus. Je recommande GLB à tous.", name: 'Marie-Claire N.', role: 'Cliente · Brazzaville, Congo' },
      ],
    },
    cta: {
      title: 'Prêt à commencer?',
      subtitle: "Achetez, vendez ou expédiez — GLB est votre pont entre l'Allemagne et l'Afrique centrale.",
      btn1: 'Acheter maintenant',
      btn2: 'Devenir vendeur',
      btn3: 'Nous contacter',
    },
    footer: {
      tagline: 'Qualité allemande pour le business africain',
      contact: 'Contact',
      agb: 'CGV & Conditions de livraison',
      how: 'Comment fonctionne GLB',
      about: 'À propos de GLB',
      copyright: '2026 GermanLink Business. Qualité allemande pour le Congo.',
    },
  },
  ln: {
    languageNames: { de: 'Allemand', fr: 'Français', ln: 'Lingala' },
    nav: { howItWorks: 'Ndenge esalaka', categories: 'Biloko', seller: 'Ba vendeurs', trust: 'Biso' },
    hero: {
      tag: 'Hambourg → Congo & RD Congo',
      title: 'Qualité ya Allemagne.',
      titleAccent: 'Directement na Congo.',
      subtitle: 'Somba, teka mpe tinda biloko ya Allemagne oyo endimami — noki, na sécurité, kozanga détour entre Allemagne mpe Afrique centrale.',
      btn1: 'Somba biloko',
      btn2: 'Teka biloko',
      btn3: 'Tinda colis',
      stat1num: '200+', stat1label: 'Ba marchands na réseau',
      stat2num: '12×',  stat2label: 'Ba containers par an',
      stat3num: '4',    stat3label: 'Bingumba na Congo',
      stat4num: '3',    stat4label: 'Minoko ya support',
    },
    energyDay: {
      badge: 'Événement ya spéciale',
      title: 'GLB Energy Day',
      subtitle: 'Mona na vivo système solaire ya sika na biso — tala brochure ya produit',
      cta: 'Tala brochure',
      close: 'Kanga',
    },
    how: {
      tag: 'Processus',
      title: 'Ndenge GLB esalaka?',
      subtitle: 'Banda demande tii livraison na Kinshasa to Brazzaville — transparent mpe na sécurité.',
      route: ['Hambourg', 'Avion / Bateau', 'Pointe-Noire', 'Matadi', 'BZV & KIN'],
      steps: [
        { num: '01', title: 'Pona eloko',            desc: 'Ba clients baponi biloko na marketplace to batinda demande ya penza.' },
        { num: '02', title: 'GLB eorganise achat',   desc: 'Contrôle ya qualité & paiement na sécurité. Documentation ya mobimba.' },
        { num: '03', title: 'Envoi container groupé', desc: 'Ba containers ya sanza na sanza Hambourg → Pointe-Noire / Matadi.' },
        { num: '04', title: 'Livraison na Congo',    desc: 'Livraison tii Brazzaville & Kinshasa na réseau ya ba agents na biso.' },
      ],
    },
    why: {
      tag: 'Mpo na nini GLB?',
      title: 'Partenaire na yo ya confiance pona commerce Allemagne-Afrique.',
      subtitle: 'Tozali kokangisa qualité ya Allemagne na portée ya Afrique — na confiance mpe transparence.',
      cards: [
        { title: 'Contrôle qualité ya Allemagne', desc: 'Biloko nyonso etalelami mpe edokumentami na Allemagne liboso ya envoi.' },
        { title: 'Container groupé na sécurité',  desc: 'Ba transports ya sanza na sanza na assurance ya mobimba mpe suivi.' },
        { title: 'Paiement na sécurité',          desc: 'Ba processus ya paiement edokumentami mpe transparent — LemFi, UBA Bank mpe mosusu.' },
        { title: 'Réseau locale na Afrique',      desc: 'Ba agents na biso mpe support ya minoko mingi na Congo & RD Congo.' },
      ],
    },
    cats: {
      tag: 'Biloko',
      title: 'Ba catégories ya biloko',
      subtitle: 'Biloko ya qualité ya Allemagne pona marché ya Afrique — banda énergie solaire tii pièces ya véhicules.',
      items: [
        { title: 'Systèmes solaires',    desc: 'Ba panneaux solaires, ba batteries & ba onduleurs' },
        { title: 'Machines ya agriculture', desc: 'Ba tracteurs, ba pompes & ba équipements' },
        { title: 'Ba générateurs',       desc: 'Ba générateurs diesel & essence ya ndenge nyonso' },
        { title: 'Biloko ya ndako',      desc: 'Ba réfrigérateurs, ba machines à laver & mosusu' },
        { title: 'Ba pneus & Véhicules', desc: 'Ba pneus, ba pièces détachées & accessoires' },
        { title: 'Demande ya penza',     desc: 'Eloko ozali koluka ezali te? Tokoyeba kozwa yango.' },
      ],
    },
    seller: {
      tag: 'Pona ba marchands & ba entreprises',
      title: 'Teka biloko na yo na Afrique.',
      subtitle: 'GLB esalisaka ba marchands mpe ba entreprises ya Allemagne koteka na sécurité na Afrique centrale — kozanga expérience ya marché ya Afrique.',
      benefits: [
        'Accès na ba clients 90 millions na Afrique centrale',
        'GLB etalelaka logistique nyonso & dédouanement',
        'Ba paiements na sécurité mpe edokumentami',
        'Expérience ya Afrique esengami te',
        'Listing marketplace + solution container',
      ],
      btn1: 'Koma vendeur',
      btn2: 'Yeba koleka',
    },
    proof: {
      tag: 'Confiance & Minumba',
      title: 'Allemagne ↔ Congo, banda bambula.',
      subtitle: 'Réseau na biso ekoli — na ba marchands mpe ba clients ya esengo na bansé ya mibale.',
      stats: [
        { num: '200+', label: 'Ba marchands na réseau' },
        { num: '12',   label: 'Ba containers par an' },
        { num: '4',    label: 'Bingumba na Congo' },
        { num: '3',    label: 'Minoko ya support' },
      ],
      testimonials: [
        { text: 'Na GLB nakokaki kosomba système solaire ya qualité banda Allemagne. Livraison na Kinshasa ezalaki malamu mpe transparent.', name: 'Jean-Pierre M.', role: 'Client · Kinshasa, RD Congo' },
        { text: 'Lokola marchand na Hambourg, kokota na marché ya Afrique kozanga GLB ekokaki te. Bazali kokata logistique nyonso.', name: 'Klaus H.', role: 'Vendeur · Hambourg, Allemagne' },
        { text: "Le service est excellent. J'ai reçu ma commande à Brazzaville dans les délais prévus. Je recommande GLB à tous.", name: 'Marie-Claire N.', role: 'Cliente · Brazzaville, Congo' },
      ],
    },
    cta: {
      title: 'Ozali pona kobanda?',
      subtitle: 'Somba, teka to tinda — GLB ezali pont na yo entre Allemagne mpe Afrique centrale.',
      btn1: 'Somba sikoyo',
      btn2: 'Koma vendeur',
      btn3: 'Samba biso',
    },
    footer: {
      tagline: 'Qualité ya Allemagne pona business ya Afrique',
      contact: 'Contact',
      agb: 'Mibeko ya vente & livraison',
      how: 'Ndenge GLB esalaka',
      about: 'Biso GLB',
      copyright: '2026 GermanLink Business. Qualité ya Allemagne pona Congo.',
    },
  },
};

const FlagBar: React.FC<{ colors: string[]; size?: number }> = ({ colors, size = 5 }) => (
  <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
    {colors.map((c, i) => (
      <div key={i} style={{ width: size, height: size * 4, background: c, borderRadius: 1 }} />
    ))}
  </div>
);

const ColorBadge: React.FC<{ bg: string; text: string; label: string; size?: number }> = ({ bg, text, label, size = 48 }) => (
  <div style={{
    width: size, height: size, borderRadius: 4,
    background: bg, color: text,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Georgia, serif', fontWeight: 900,
    fontSize: size * 0.28, letterSpacing: '0.04em',
    flexShrink: 0,
  }}>
    {label}
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onNavigate }) => {
  const go = (view: string) => {
    if (onNavigate) {
      onGetStarted();
      setTimeout(() => onNavigate(view), 0);
    } else {
      onGetStarted();
    }
  };

  const [language, setLanguage] = useState<Language>('fr');
  const [showBrochure, setShowBrochure] = useState(false);
  const BROCHURE_PAGE_COUNT = 10;

  useEffect(() => {
    const saved = localStorage.getItem('germanlink_language') as Language;
    if (saved && ['de', 'fr', 'ln'].includes(saved)) setLanguage(saved);
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('germanlink_language', lang);
  };

  const t = translations[language];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: '#0a1628', color: '#f5f2eb', overflowX: 'hidden' }}>

      {/* ── NAV ──────────────────────────────────────────────────────────────── */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 4vw', background: 'rgba(7,16,32,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <img src="/glb-icon-white.png" alt="GLB" style={{ width: 36, height: 36, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f5f2eb', lineHeight: 1, letterSpacing: '-0.01em' }}>GLB</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#F4B400', lineHeight: 1 }}>GermanLink Business</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: 4 }}>
            {(['de','fr','ln'] as Language[]).map(lang => (
              <button key={lang} onClick={() => changeLanguage(lang)} style={{
                padding: '6px 12px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: language === lang ? '#DD0000' : 'transparent',
                color: language === lang ? '#fff' : '#8fa3b8',
              }}>
                {lang === 'de' ? 'DE' : lang === 'fr' ? 'FR' : 'LN'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{ minHeight: 'clamp(600px,100vh,100vh)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 4vw clamp(3rem,8vh,8vh)', position: 'relative', overflow: 'hidden', paddingTop: 80 }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'linear-gradient(to top, rgba(7,16,32,0.98) 0%, rgba(7,16,32,0.65) 45%, rgba(7,16,32,0.25) 100%), url("https://images.unsplash.com/photo-1553413077-190dd305871c?w=1600&q=80") center/cover no-repeat' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, zIndex: 2, display: 'flex' }}>
          {['#000000','#DD0000','#FFCE00','#009A00','#FBDE2A','#007FFF'].map((c,i) => <div key={i} style={{ flex: 1, background: c }} />)}
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 900 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#00e676', marginBottom: '1.8rem', padding: '0.35rem 0.85rem', border: '1px solid rgba(0,230,118,0.5)', borderRadius: 2, background: 'rgba(0,230,118,0.08)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e676', display: 'inline-block', boxShadow: '0 0 6px #00e676' }} />
            {t.hero.tag}
          </div>

          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.4rem,5.5vw,4.8rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: '1.2rem' }}>
            {t.hero.title}<br />
            <span style={{ color: '#F4B400', fontStyle: 'italic' }}>{t.hero.titleAccent}</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem,1.4vw,1.2rem)', color: '#e8edf2', fontWeight: 400, lineHeight: 1.7, maxWidth: 560, marginBottom: 'clamp(1.5rem,3vw,2.5rem)', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            {t.hero.subtitle}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: 'clamp(1.5rem,3vw,3.5rem)' }}>
            {/* Btn 1: Produkte kaufen */}
            <button onClick={() => go('dashboard')} style={{ background: '#F4B400', color: '#0a1628', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.9rem 1.8rem', border: 'none', borderRadius: 2, cursor: 'pointer' }}>
              {t.hero.btn1}
            </button>
            {/* Btn 2: Produkte verkaufen */}
            <button onClick={() => go('seller')} style={{ background: 'transparent', color: '#f5f2eb', fontWeight: 600, fontSize: '0.88rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.9rem 1.8rem', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 2, cursor: 'pointer' }}>
              {t.hero.btn2}
            </button>
            {/* Btn 3: Container versenden → ParcelPage */}
            <button onClick={() => go('parcel')} style={{ background: 'transparent', color: '#f5f2eb', fontWeight: 600, fontSize: '0.88rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.9rem 1.8rem', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 2, cursor: 'pointer' }}>
              {t.hero.btn3}
            </button>
          </div>

          {/* ── ENERGY DAY BANNER ── */}
          <style>{`
            .energyday-banner {
              display: flex;
              align-items: center;
              gap: 1rem;
            }
            .energyday-top-row {
              display: flex;
              align-items: center;
              gap: 0.75rem;
              width: 100%;
            }
            .energyday-icon {
              flex-shrink: 0;
              width: 46px;
              height: 46px;
              font-size: 1.3rem;
            }
            .energyday-text {
              flex: 1;
              min-width: 0;
            }
            .energyday-cta {
              flex-shrink: 0;
              white-space: nowrap;
            }
            @media (max-width: 640px) {
              .energyday-banner {
                flex-direction: column;
                align-items: stretch;
                gap: 0.75rem;
                padding: 0.9rem 1rem !important;
              }
              .energyday-icon {
                width: 34px;
                height: 34px;
                font-size: 1rem;
              }
              .energyday-subtitle {
                font-size: 0.82rem !important;
              }
              .energyday-cta {
                width: 100%;
                text-align: center;
                white-space: normal;
              }
            }
          `}</style>
          <button
            onClick={() => setShowBrochure(true)}
            className="energyday-banner"
            style={{
              width: '100%', maxWidth: 640,
              textAlign: 'left', cursor: 'pointer',
              background: 'linear-gradient(90deg, rgba(244,180,0,0.14) 0%, rgba(0,230,118,0.10) 100%)',
              border: '1.5px solid rgba(244,180,0,0.45)', borderRadius: 6,
              padding: '1rem 1.3rem',
            }}
          >
            <span className="energyday-top-row">
              <span className="energyday-icon" style={{
                borderRadius: '50%',
                background: '#F4B400', color: '#0a1628',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Georgia, serif', fontWeight: 900,
              }}>☀</span>
              <span className="energyday-text">
                <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F4B400', marginBottom: 2 }}>
                  {t.energyDay.badge}
                </span>
                <span style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#f5f2eb', lineHeight: 1.3 }}>
                  {t.energyDay.title}
                </span>
              </span>
            </span>
            <span className="energyday-subtitle" style={{ display: 'block', fontSize: '0.85rem', color: '#e8edf2', lineHeight: 1.5 }}>
              {t.energyDay.subtitle}
            </span>
            <span className="energyday-cta" style={{
              fontSize: '0.78rem', fontWeight: 700, color: '#0a1628',
              background: '#F4B400', padding: '0.55rem 1rem', borderRadius: 2,
              textTransform: 'uppercase', letterSpacing: '0.04em',
              display: 'inline-block',
            }}>
              {t.energyDay.cta}
            </span>
          </button>
        </div>
      </section>

      {/* ── ENERGY DAY / BROCHURE MODAL ─────────────────────────────────────── */}
      {showBrochure && (
        <div
          onClick={() => setShowBrochure(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(5,10,20,0.88)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: '2vh 1rem', overflowY: 'auto',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0a1628', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, width: '100%', maxWidth: 760,
              margin: '0 auto',
            }}
          >
            <div style={{
              position: 'sticky', top: 0, zIndex: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.3rem', background: 'rgba(10,22,40,0.97)',
              backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px 8px 0 0',
            }}>
              <span style={{ fontFamily: 'Georgia, serif', fontWeight: 900, color: '#F4B400', fontSize: '1.05rem' }}>
                {t.energyDay.title}
              </span>
              <button
                onClick={() => setShowBrochure(false)}
                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                aria-label={t.energyDay.close}
              >
                <X size={18} color="#f5f2eb" />
              </button>
            </div>

            {/* Scrollbarer Broschüren-Inhalt */}
            <div style={{ maxHeight: '82vh', overflowY: 'auto', padding: '0.75rem' }}>
              {Array.from({ length: BROCHURE_PAGE_COUNT }, (_, i) => i + 1).map((pageNum) => (
                <img
                  key={pageNum}
                  src={`/brochures/runhood-r5200/runhood-r5200-page-${pageNum}.png`}
                  alt={`Runhood SOMMAR R5200 — Seite ${pageNum}`}
                  style={{ width: '100%', display: 'block', marginBottom: '0.6rem', borderRadius: 4 }}
                  loading="lazy"
                />
              ))}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '0.5rem 0 0.25rem', color: '#8fa3b8' }}>
                <ChevronDown size={16} style={{ opacity: 0.5 }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="how" style={{ padding: 'clamp(2.5rem,6vw,6rem) 4vw', background: '#071020' }}>
        <div style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#F4B400', fontWeight: 600, marginBottom: '0.75rem' }}>{t.how.tag}</div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem,3vw,2.8rem)', fontWeight: 900, marginBottom: '0.75rem' }}>{t.how.title}</h2>
        <p style={{ color: '#8fa3b8', maxWidth: 480, lineHeight: 1.7, marginBottom: 'clamp(1.5rem,4vw,3rem)' }}>{t.how.subtitle}</p>

        <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '1rem 1.5rem', marginBottom: 'clamp(1.5rem,4vw,3rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.83rem' }}>
          {t.how.route.map((stop, i) => {
            const stopColors = ['#000000','#DD0000','#009A00','#007FFF','#FBDE2A'];
            return (
              <React.Fragment key={i}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: stopColors[i] || '#F4B400', display: 'inline-block', flexShrink: 0 }} />
                  {stop}
                </span>
                {i < t.how.route.length - 1 && <span style={{ color: '#F4B400', opacity: 0.5 }}>→</span>}
              </React.Fragment>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
          {t.how.steps.map((step, i) => (
            <div key={i} style={{ background: '#071020', padding: 'clamp(1rem,3vw,2rem) 1.5rem', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: STEP_COLORS[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 900, color: i === 0 ? '#0a1628' : '#fff', margin: '0 auto 1.2rem', boxShadow: `0 0 0 4px rgba(${STEP_COLORS[i] === '#FFCE00' ? '255,206,0' : STEP_COLORS[i] === '#009A00' ? '0,154,0' : STEP_COLORS[i] === '#DD0000' ? '221,0,0' : '247,59,0'},0.2)` }}>
                {step.num}
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>{step.title}</h3>
              <p style={{ fontSize: '0.82rem', color: '#8fa3b8', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY GLB ──────────────────────────────────────────────────────────── */}
      <section id="why" style={{ padding: 'clamp(2.5rem,6vw,6rem) 4vw', background: '#0a1628' }}>
        <div style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#F4B400', fontWeight: 600, marginBottom: '0.75rem' }}>{t.why.tag}</div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem,3vw,2.8rem)', fontWeight: 900, marginBottom: '0.75rem' }}>{t.why.title}</h2>
        <p style={{ color: '#8fa3b8', maxWidth: 480, lineHeight: 1.7, marginBottom: 'clamp(1.5rem,4vw,3rem)' }}>{t.why.subtitle}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5px', background: 'rgba(255,255,255,0.06)' }}>
          {t.why.cards.map((card, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '2.2rem 1.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                <FlagBar colors={WHY_COLORS[i].colors} size={5} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', color: WHY_COLORS[i].colors[0] === '#007FFF' ? '#007FFF' : WHY_COLORS[i].colors[0] === '#009A00' ? '#009A00' : WHY_COLORS[i].colors[1], textTransform: 'uppercase' }}>
                  {WHY_COLORS[i].label}
                </span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{card.title}</h3>
              <p style={{ fontSize: '0.83rem', color: '#8fa3b8', lineHeight: 1.7 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────────────────── */}
      <section id="categories" style={{ padding: 'clamp(2.5rem,6vw,6rem) 4vw', background: '#071020' }}>
        <div style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#F4B400', fontWeight: 600, marginBottom: '0.75rem' }}>{t.cats.tag}</div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem,3vw,2.8rem)', fontWeight: 900, marginBottom: '0.75rem' }}>{t.cats.title}</h2>
        <p style={{ color: '#8fa3b8', maxWidth: 480, lineHeight: 1.7, marginBottom: 'clamp(1.5rem,4vw,3rem)' }}>{t.cats.subtitle}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '1rem' }}>
          {t.cats.items.map((cat, i) => {
            const c = CAT_COLORS[i];
            const isLast = i === 5;
            return (
              <div
                key={i}
                onClick={onGetStarted}
                style={{ border: `1px solid ${isLast ? 'rgba(244,180,0,0.35)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 4, padding: '2rem 1.5rem', background: isLast ? 'rgba(244,180,0,0.05)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <div style={{ marginBottom: '0.9rem' }}>
                  <ColorBadge bg={c.bg} text={c.text} label={c.abbr} size={48} />
                </div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.35rem' }}>{cat.title}</h3>
                <p style={{ fontSize: '0.78rem', color: '#8fa3b8', lineHeight: 1.5 }}>{cat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SELLER ───────────────────────────────────────────────────────────── */}
      <section id="seller" style={{ padding: 'clamp(2.5rem,6vw,6rem) 4vw', background: 'linear-gradient(135deg, #071a10 0%, #0a1628 50%, #071020 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,143,115,0.15) 0%, transparent 70%)', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680 }}>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#5dcaa5', fontWeight: 600, marginBottom: '0.75rem' }}>{t.seller.tag}</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem,3vw,2.8rem)', fontWeight: 900, marginBottom: '0.75rem' }}>{t.seller.title}</h2>
          <p style={{ color: '#8fa3b8', lineHeight: 1.7, marginBottom: '1.5rem' }}>{t.seller.subtitle}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '2rem' }}>
            {t.seller.benefits.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                <span style={{ width: 22, height: 22, borderRadius: 4, background: i % 2 === 0 ? 'rgba(0,154,0,0.25)' : 'rgba(0,127,255,0.15)', border: `1px solid ${i % 2 === 0 ? '#009A00' : '#007FFF'}`, color: i % 2 === 0 ? '#5dcaa5' : '#007FFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, flexShrink: 0 }}>✓</span>
                {b}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => go('seller')} style={{ background: '#F4B400', color: '#0a1628', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.9rem 1.8rem', border: 'none', borderRadius: 2, cursor: 'pointer' }}>{t.seller.btn1}</button>
            <button onClick={() => go('how-it-works')} style={{ background: 'transparent', color: '#f5f2eb', fontWeight: 600, fontSize: '0.88rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.9rem 1.8rem', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 2, cursor: 'pointer' }}>{t.seller.btn2}</button>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ─────────────────────────────────────────────────────── */}
      <section id="proof" style={{ padding: 'clamp(2.5rem,6vw,6rem) 4vw', background: '#0a1628' }}>
        <div style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#F4B400', fontWeight: 600, marginBottom: '0.75rem' }}>{t.proof.tag}</div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem,3vw,2.8rem)', fontWeight: 900, marginBottom: '0.75rem' }}>{t.proof.title}</h2>
        <p style={{ color: '#8fa3b8', maxWidth: 480, lineHeight: 1.7, marginBottom: 'clamp(1.5rem,4vw,3rem)' }}>{t.proof.subtitle}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5px', background: 'rgba(255,255,255,0.06)', marginBottom: 'clamp(1.5rem,4vw,3rem)' }}>
          {t.proof.stats.map((s, i) => {
            const barColors = ['#DD0000','#009A00','#FFCE00','#007FFF'];
            return (
              <div key={i} style={{ background: '#0a1628', padding: '2.2rem 1.5rem', textAlign: 'center', borderTop: `4px solid ${barColors[i]}` }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '2.8rem', fontWeight: 900, color: '#F4B400', lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: '0.75rem', color: '#8fa3b8', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '0.4rem' }}>{s.label}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1rem' }}>
          {t.proof.testimonials.map((tm, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, padding: '2rem', position: 'relative' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '3.5rem', color: '#F4B400', opacity: 0.25, position: 'absolute', top: '0.5rem', left: '1.1rem', lineHeight: 1 }}>"</div>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: '#8fa3b8', marginBottom: '1rem' }}>{tm.text}</p>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f5f2eb' }}>{tm.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#5dcaa5' }}>{tm.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section style={{ background: '#F4B400', textAlign: 'center', padding: 'clamp(2.5rem,6vw,6rem) 4vw' }}>
        <div style={{ display: 'flex', height: 4, marginBottom: '2rem', borderRadius: 2, overflow: 'hidden', maxWidth: 300, margin: '0 auto 2rem' }}>
          {['#000000','#DD0000','#FFCE00','#009A00','#FBDE2A','#007FFF'].map((c,i) => <div key={i} style={{ flex: 1, background: c }} />)}
        </div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem,3.5vw,3rem)', fontWeight: 900, color: '#0a1628', marginBottom: '1rem' }}>{t.cta.title}</h2>
        <p style={{ color: 'rgba(10,22,40,0.7)', maxWidth: 500, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>{t.cta.subtitle}</p>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <button onClick={() => go('dashboard')} style={{ background: '#0a1628', color: '#F4B400', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '1rem 2rem', border: 'none', borderRadius: 2, cursor: 'pointer' }}>{t.cta.btn1}</button>
          <button onClick={() => go('seller')} style={{ background: '#0a1628', color: '#F4B400', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '1rem 2rem', border: 'none', borderRadius: 2, cursor: 'pointer' }}>{t.cta.btn2}</button>
          <button onClick={() => go('impressum')} style={{ background: 'transparent', color: '#0a1628', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '1rem 2rem', border: '2px solid #0a1628', borderRadius: 2, cursor: 'pointer' }}>{t.cta.btn3}</button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#050e1a', padding: '3rem 4vw', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <img src="/glb-icon-white.png" alt="GLB" style={{ width: 32, height: 32, flexShrink: 0 }} />
              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#F4B400' }}>GermanLink Business</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#8fa3b8' }}>{t.footer.tagline}</p>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>{t.footer.contact}</h4>
            <p style={{ fontSize: '0.82rem', color: '#8fa3b8', marginBottom: '0.75rem' }}>kizomba-global-post@web.de</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={14} color="#F4B400" />
              <span style={{ fontSize: '0.78rem', color: '#8fa3b8' }}>Made in Germany</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => window.location.href = '/agb'} style={{ background: 'none', border: 'none', color: '#8fa3b8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>
              {t.footer.agb}
            </button>
            <button onClick={() => go('how-it-works')} style={{ background: 'none', border: 'none', color: '#8fa3b8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>
              {t.footer.how}
            </button>
            <button onClick={() => go('about')} style={{ background: 'none', border: 'none', color: '#8fa3b8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>
              {t.footer.about}
            </button>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#8fa3b8' }}>© {t.footer.copyright}</p>
        </div>
      </footer>

    </div>
  );
};

