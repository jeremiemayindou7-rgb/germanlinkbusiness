import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate?: (view: string) => void;
}

type Language = 'de' | 'fr' | 'ln' | 'en';

// WhatsApp-Community von GLB Solar
const WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/Cd56t4utPYK8ND8Bc1k6d1';

// Foto der Installation aus dem GLB-Solar-Pilotprojekt.
// Sobald das echte Bild vorliegt, hier den Pfad eintragen (z. B. '/glb-solar/pilot.jpg').
const SOLAR_PILOT_PHOTO = '/glb-solar/startseite.jpg';

const translations = {
  de: {
    languageNames: { de: 'Deutsch', fr: 'Français', ln: 'Lingala' },
    nav: { howItWorks: 'Wie es funktioniert', categories: 'Produkte', seller: 'Verkäufer', trust: 'Über uns' },
    hero: {
      tag: 'Deutschland → Kongo',
      title: 'Produkte aus Deutschland.',
      titleAccent: 'Direkt nach Kongo.',
      subtitle: 'Kaufen, verkaufen und versenden Sie Produkte aus Deutschland – direkt und dokumentiert zwischen Deutschland und dem Kongo.',
      btn1: 'Produkte kaufen',
      btn2: 'Produkte verkaufen',
      btn3: 'Container versenden',
    },
    energyDay: {
      badge: 'Sonderevent',
      title: 'GLB Energy Day',
      subtitle: 'Erleben Sie live unser neues Solarsystem — jetzt Produktbroschüre ansehen',
      cta: 'Broschüre ansehen',
      close: 'Schließen',
    },
    solar: {
      badge: 'Erster Partner · GLB Solar',
      title: 'Sie kaufen keine Solaranlage.',
      titleAccent: 'Sie kaufen eine Maschine, die jeden Tag Energie produziert.',
      text: 'Mehr Strom für Ihr Zuhause. Mehr Sicherheit für Ihre Familie. Mehr Möglichkeiten für Ihr Geschäft.',
      text2: 'Denn wer seine eigene Energie produziert, kontrolliert seine Zukunft.',
      btnWhatsapp: 'Auf WhatsApp informieren',
      btnKit: 'Inhalt des Kits ansehen',
      point1Title: 'Ein Konto, das die Sonne jeden Tag auffüllt.',
      point1Text: 'Die Sonne füllt es jeden Morgen auf. Sie heben Ihre Energie ab, ohne Gebühren und ohne Treibstoff.',
      point2Title: 'Seien Sie der, der das Haus schützt.',
      point2Text: 'Wenn das Viertel dunkel wird, bleibt bei Ihnen das Licht an und das Geschäft läuft weiter.',
      photoAlt: 'Installation aus dem GLB-Solar-Pilotprojekt',
      photoSoon: 'Fotos vom GLB-Solar-Pilotprojekt folgen',
    },
    platform: {
      tag: 'Die Mission von GLB',
      title: 'Eine Brücke produziert nichts. Sie macht alles möglich.',
      text: 'GLB ist diese Brücke zwischen hochwertiger Technologie und denen, die Afrika aufbauen. Jedes gelieferte System ist ein weiterer Stein: eine Werkstatt, die nicht mehr stillsteht, eine Schule, die beleuchtet bleibt, ein Geschäft, das seine Kunden behält.',
      steps: [
        { num: '01', title: 'Sie bestellen auf GLB', desc: 'Eine Plattform für alle Produkte und alle Partner.' },
        { num: '02', title: 'Der Partner vor Ort meldet sich', desc: 'Er bestätigt Ihre Bestellung, ergänzt Transport und Steuern, stellt die Rechnung und erhält Ihre Zahlung.' },
        { num: '03', title: 'GLB liefert aus Deutschland', desc: 'Einkauf bei Lieferanten in Deutschland und Versand in den Kongo. Unser Partner übergibt Ihnen das Produkt.' },
      ],
      active: 'Aktiv',
      soon: 'Demnächst',
      partners: [
        { title: 'GLB Solar', desc: 'Energielösungen. Partner: GLB-Solar.' },
        { title: 'Reifen', desc: 'Öffnet, sobald ein Partner feststeht.' },
        { title: 'Landmaschinen', desc: 'Öffnet, sobald ein Partner feststeht.' },
      ],
      partnerLine: 'Partner im Kongo: GLB-Solar',
    },
    cta: {
      btn3: 'Kontakt aufnehmen',
    },
    footer: {
      tagline: 'Produkte aus Deutschland für den Kongo',
      contact: 'Kontakt',
      agb: 'AGB & Lieferbedingungen',
      how: 'So funktioniert GLB',
      about: 'Über GLB',
      copyright: '2026 GermanLink Business GmbH i. G.',
    },
  },
  fr: {
    languageNames: { de: 'Allemand', fr: 'Français', ln: 'Lingala' },
    nav: { howItWorks: 'Comment ça marche', categories: 'Produits', seller: 'Vendeurs', trust: 'À propos' },
    hero: {
      tag: 'Allemagne → Congo',
      title: 'Produits d’Allemagne.',
      titleAccent: 'Directement au Congo.',
      subtitle: "Achetez, vendez et expédiez des produits d'Allemagne — directement et avec suivi entre l'Allemagne et le Congo.",
      btn1: 'Acheter des produits',
      btn2: 'Vendre des produits',
      btn3: 'Expédier un colis',
    },
    energyDay: {
      badge: 'Événement spécial',
      title: 'GLB Energy Day',
      subtitle: 'Découvrez en direct notre nouveau système solaire — voir la brochure produit',
      cta: 'Voir la brochure',
      close: 'Fermer',
    },
    solar: {
      badge: 'Premier partenaire · GLB Solar',
      title: 'Vous n’achetez pas une installation solaire.',
      titleAccent: 'Vous achetez une machine qui produit de l’énergie chaque jour.',
      text: 'Plus d’électricité pour votre maison. Plus de sécurité pour votre famille. Plus de possibilités pour votre commerce.',
      text2: 'Car celui qui produit sa propre énergie contrôle son avenir.',
      btnWhatsapp: 'S’informer sur WhatsApp',
      btnKit: 'Voir le contenu du kit',
      point1Title: 'Un compte que le soleil remplit chaque jour.',
      point1Text: 'Le soleil le recharge chaque matin. Vous retirez votre énergie sans frais et sans carburant.',
      point2Title: 'Soyez celui qui protège la maison.',
      point2Text: "Quand le quartier s'éteint, chez vous la lumière reste et le commerce continue.",
      photoAlt: 'Installation du projet pilote GLB Solar',
      photoSoon: 'Photos du projet pilote GLB Solar à venir',
    },
    platform: {
      tag: 'La mission de GLB',
      title: 'Un pont ne produit rien. Il rend tout possible.',
      text: "GLB est ce pont entre la technologie de qualité et ceux qui construisent l'Afrique. Chaque système livré est une pierre de plus : un atelier qui ne s'arrête plus, une école qui reste éclairée, un commerce qui garde ses clients.",
      steps: [
        { num: '01', title: 'Vous commandez sur GLB', desc: 'Une seule plateforme pour tous les produits et tous les partenaires.' },
        { num: '02', title: 'Le partenaire local vous contacte', desc: 'Il confirme votre commande, ajoute le transport et les taxes, établit la facture et reçoit votre paiement.' },
        { num: '03', title: "GLB livre depuis l'Allemagne", desc: "Achat chez des fournisseurs en Allemagne et expédition au Congo. Notre partenaire vous remet le produit." },
      ],
      active: 'Actif',
      soon: 'À venir',
      partners: [
        { title: 'GLB Solar', desc: "Solutions d'énergie. Partenaire : GLB-Solar." },
        { title: 'Pneus', desc: "Ouvert dès qu'un partenaire est confirmé." },
        { title: 'Machines agricoles', desc: "Ouvert dès qu'un partenaire est confirmé." },
      ],
      partnerLine: 'Partenaire au Congo : GLB-Solar',
    },
    cta: {
      btn3: 'Nous contacter',
    },
    footer: {
      tagline: 'Des produits d’Allemagne pour le Congo',
      contact: 'Contact',
      agb: 'CGV & Conditions de livraison',
      how: 'Comment fonctionne GLB',
      about: 'À propos de GLB',
      copyright: '2026 GermanLink Business GmbH i. G.',
    },
  },
  ln: {
    languageNames: { de: 'Allemand', fr: 'Français', ln: 'Lingala' },
    nav: { howItWorks: 'Ndenge esalaka', categories: 'Biloko', seller: 'Ba vendeurs', trust: 'Biso' },
    hero: {
      tag: 'Allemagne → Congo',
      title: 'Biloko ya Allemagne.',
      titleAccent: 'Directement na Congo.',
      subtitle: 'Somba, teka mpe tinda biloko ya Allemagne — directement mpe na suivi entre Allemagne mpe Congo.',
      btn1: 'Somba biloko',
      btn2: 'Teka biloko',
      btn3: 'Tinda colis',
    },
    energyDay: {
      badge: 'Événement ya spéciale',
      title: 'GLB Energy Day',
      subtitle: 'Mona na vivo système solaire ya sika na biso — tala brochure ya produit',
      cta: 'Tala brochure',
      close: 'Kanga',
    },
    solar: {
      badge: 'Partenaire ya liboso · GLB Solar',
      title: 'Ozali kosomba installation solaire te.',
      titleAccent: 'Ozali kosomba machine oyo ebimisaka énergie mokolo na mokolo.',
      text: 'Courant mingi pona ndako na yo. Sécurité mingi pona libota na yo. Ba possibilités mingi pona mombongo na yo.',
      text2: 'Pamba te moto oyo abimisaka énergie na ye moko akambaka avenir na ye.',
      btnWhatsapp: 'Yeba mingi na WhatsApp',
      btnKit: 'Tala biloko ya kit',
      point1Title: 'Compte oyo moi etondisaka mokolo na mokolo.',
      point1Text: 'Moi etondisaka yango ntongo nyonso. Ozwaka énergie na yo kozanga frais mpe kozanga carburant.',
      point2Title: 'Zala moto oyo abatelaka ndako.',
      point2Text: 'Tango quartier ekufi moto, epai na yo lumière etikali mpe commerce ekobi.',
      photoAlt: 'Installation ya projet pilote GLB Solar',
      photoSoon: 'Ba photos ya projet pilote GLB Solar ekoya',
    },
    platform: {
      tag: 'Mission ya GLB',
      title: 'Pont esalaka eloko te. Esalaka ete nyonso ekoka kosalema.',
      text: 'GLB ezali pont wana kati na technologie ya qualité mpe baoyo bazali kotonga Afrique. Système moko na moko oyo tokabi ezali libanga moko lisusu: atelier oyo etelemaka lisusu te, eteyelo oyo etikali na lumière, commerce oyo ebatelaka ba clients na yango.',
      steps: [
        { num: '01', title: 'Okomandi na GLB', desc: 'Plateforme moko pona biloko nyonso mpe ba partenaires nyonso.' },
        { num: '02', title: 'Partenaire ya mboka akobenga yo', desc: 'Andimi commande na yo, abakisi transport mpe taxes, asali facture mpe azwi paiement na yo.' },
        { num: '03', title: 'GLB etindi banda Allemagne', desc: 'Achat epai ya ba fournisseurs na Allemagne mpe envoi na Congo. Partenaire na biso apesi yo eloko.' },
      ],
      active: 'Ezali kosala',
      soon: 'Ekoya',
      partners: [
        { title: 'GLB Solar', desc: 'Ba solutions ya énergie. Partenaire: GLB-Solar.' },
        { title: 'Ba pneus', desc: 'Ekofungwama soki partenaire andimami.' },
        { title: 'Machines ya agriculture', desc: 'Ekofungwama soki partenaire andimami.' },
      ],
      partnerLine: 'Partenaire na Congo: GLB-Solar',
    },
    cta: {
      btn3: 'Samba biso',
    },
    footer: {
      tagline: 'Biloko ya Allemagne pona Congo',
      contact: 'Contact',
      agb: 'Mibeko ya vente & livraison',
      how: 'Ndenge GLB esalaka',
      about: 'Biso GLB',
      copyright: '2026 GermanLink Business GmbH i. G.',
    },
  },
  en: {
    languageNames: { de: 'German', fr: 'French', ln: 'Lingala', en: 'English' },
    nav: { howItWorks: 'How it works', categories: 'Products', seller: 'Sellers', trust: 'About us' },
    hero: {
      tag: 'Germany → Congo',
      title: 'Products from Germany.',
      titleAccent: 'Direct to the Congo.',
      subtitle: 'Buy, sell and ship products from Germany — direct and documented between Germany and the Congo.',
      btn1: 'Buy products',
      btn2: 'Sell products',
      btn3: 'Ship a container',
    },
    energyDay: {
      badge: 'Special event',
      title: 'GLB Energy Day',
      subtitle: 'See our new solar system live — view the product brochure now',
      cta: 'View brochure',
      close: 'Close',
    },
    solar: {
      badge: 'First partner · GLB Solar',
      title: 'You are not buying a solar installation.',
      titleAccent: 'You are buying a machine that produces energy every day.',
      text: 'More power for your home. More security for your family. More opportunities for your business.',
      text2: 'Because whoever produces their own energy controls their future.',
      btnWhatsapp: 'Find out more on WhatsApp',
      btnKit: 'See what is in the kit',
      point1Title: 'An account the sun refills every day.',
      point1Text: 'The sun tops it up every morning. You withdraw your energy with no fees and no fuel.',
      point2Title: 'Be the one who protects the home.',
      point2Text: 'When the neighbourhood goes dark, your lights stay on and your business keeps going.',
      photoAlt: 'Installation from the GLB Solar pilot project',
      photoSoon: 'Photos from the GLB Solar pilot project coming soon',
    },
    platform: {
      tag: 'The GLB mission',
      title: 'A bridge produces nothing. It makes everything possible.',
      text: 'GLB is that bridge between quality technology and the people building Africa. Every system delivered is one more stone: a workshop that no longer stops, a school that stays lit, a shop that keeps its customers.',
      steps: [
        { num: '01', title: 'You order on GLB', desc: 'One platform for all products and all partners.' },
        { num: '02', title: 'The local partner contacts you', desc: 'They confirm your order, add transport and taxes, issue the invoice and receive your payment.' },
        { num: '03', title: 'GLB delivers from Germany', desc: 'Purchasing from suppliers in Germany and shipping to the Congo. Our partner hands over the product.' },
      ],
      active: 'Active',
      soon: 'Coming soon',
      partners: [
        { title: 'GLB Solar', desc: 'Energy solutions. Partner: GLB-Solar.' },
        { title: 'Tires', desc: 'Opens as soon as a partner is confirmed.' },
        { title: 'Agricultural machinery', desc: 'Opens as soon as a partner is confirmed.' },
      ],
      partnerLine: 'Partner in the Congo: GLB-Solar',
    },
    cta: {
      btn3: 'Get in touch',
    },
    footer: {
      tagline: 'Products from Germany for the Congo',
      contact: 'Contact',
      agb: 'Terms & delivery conditions',
      how: 'How GLB works',
      about: 'About GLB',
      copyright: '2026 GermanLink Business GmbH i. G.',
    },
  },
};

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
    if (saved && ['de', 'fr', 'ln', 'en'].includes(saved)) setLanguage(saved);
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
            {(['de','fr','ln','en'] as Language[]).map(lang => (
              <button key={lang} onClick={() => changeLanguage(lang)} style={{
                padding: '6px 12px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: language === lang ? '#DD0000' : 'transparent',
                color: language === lang ? '#fff' : '#8fa3b8',
              }}>
                {lang === 'de' ? 'DE' : lang === 'fr' ? 'FR' : lang === 'ln' ? 'LN' : 'EN'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{ minHeight: 'clamp(420px,68vh,68vh)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 4vw clamp(2rem,5vh,5vh)', position: 'relative', overflow: 'hidden', paddingTop: 80 }}>
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
            <span style={{
              display: 'block',
              fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
              fontSize: 'clamp(1rem,1.6vw,1.3rem)',
              fontWeight: 700,
              letterSpacing: '0.01em',
              color: '#F4B400',
              marginBottom: '0.5rem',
            }}>
              GLB – GermanLink Business
            </span>
            {t.hero.title}<br />
            <span style={{ color: '#F4B400', fontStyle: 'italic' }}>{t.hero.titleAccent}</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem,1.4vw,1.2rem)', color: '#e8edf2', fontWeight: 400, lineHeight: 1.7, maxWidth: 560, marginBottom: 'clamp(1.5rem,3vw,2.5rem)', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            {t.hero.subtitle}
          </p>

        </div>
      </section>

      {/* ── GLB SOLAR · erster Partner ───────────────────────────────────────── */}
      <section id="glb-solar" style={{ padding: 'clamp(1.5rem,4vw,3rem) 4vw', background: '#0a1628' }}>
        <div style={{ border: '1.5px solid rgba(244,180,0,0.55)', borderRadius: 10, background: 'rgba(255,255,255,0.03)', padding: 'clamp(1.2rem,3vw,2.2rem)', display: 'flex', flexWrap: 'wrap', gap: 'clamp(1.2rem,3vw,2.2rem)', alignItems: 'stretch' }}>
          <div style={{ flex: '1.3 1 340px', minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5dcaa5', marginBottom: '1.2rem', padding: '0.35rem 0.85rem', border: '1px solid rgba(93,202,165,0.5)', borderRadius: 999 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#5dcaa5', display: 'inline-block', flexShrink: 0 }} />
              {t.solar.badge}
            </div>

            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem,3vw,2.6rem)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.01em', marginBottom: '1rem' }}>
              {t.solar.title}{' '}
              <span style={{ color: '#F4B400', fontStyle: 'italic' }}>{t.solar.titleAccent}</span>
            </h2>

            <p style={{ fontSize: 'clamp(1rem,1.3vw,1.15rem)', color: '#e8edf2', lineHeight: 1.7, maxWidth: 560, margin: '0 0 0.6rem' }}>
              {t.solar.text}
            </p>
            <p style={{ fontSize: 'clamp(1rem,1.3vw,1.15rem)', color: '#F4B400', fontWeight: 700, lineHeight: 1.6, maxWidth: 560, marginBottom: '1.5rem' }}>
              {t.solar.text2}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => go('system')}
                style={{ minHeight: 48, background: '#F4B400', color: '#0a1628', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.9rem 1.6rem', border: 'none', borderRadius: 2, cursor: 'pointer' }}
              >
                {t.solar.btnKit}
              </button>
              <a
                href={WHATSAPP_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 48, background: 'transparent', color: '#f5f2eb', fontWeight: 600, fontSize: '0.88rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.9rem 1.6rem', borderRadius: 2, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                {t.solar.btnWhatsapp}
              </a>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', paddingTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{t.solar.point1Title}</div>
                <div style={{ fontSize: '0.88rem', color: '#b6c4d4', lineHeight: 1.6 }}>{t.solar.point1Text}</div>
              </div>
              <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{t.solar.point2Title}</div>
                <div style={{ fontSize: '0.88rem', color: '#b6c4d4', lineHeight: 1.6 }}>{t.solar.point2Text}</div>
              </div>
            </div>
          </div>

          {/* Bildfläche: SOLAR_PILOT_PHOTO oben in der Datei setzen, sobald das echte Foto vorliegt */}
          <div style={{ flex: '1 1 340px', minWidth: 0, display: 'flex', alignSelf: 'center' }}>
            {SOLAR_PILOT_PHOTO ? (
              <img
                src={SOLAR_PILOT_PHOTO}
                alt={t.solar.photoAlt}
                style={{ width: '100%', height: 'auto', objectFit: 'contain', borderRadius: 8, display: 'block', border: '1px solid rgba(255,255,255,0.08)' }}
                loading="lazy"
              />
            ) : (
              <div style={{ flex: 1, minHeight: 260, borderRadius: 8, border: '1px dashed rgba(255,255,255,0.25)', background: 'linear-gradient(160deg, rgba(244,180,0,0.14) 0%, rgba(7,16,32,0.6) 70%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1.5rem', textAlign: 'center' }}>
                <span aria-hidden="true" style={{ width: 54, height: 54, borderRadius: '50%', background: '#F4B400', color: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: '1.5rem' }}>☀</span>
                <span style={{ fontSize: '0.85rem', color: '#b6c4d4', lineHeight: 1.5 }}>{t.solar.photoSoon}</span>
              </div>
            )}
          </div>
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

      {/* ── GLB PLATTFORM · Mission, Bestellweg, Partner ─────────────────────── */}
      <section id="how" style={{ padding: 'clamp(2.5rem,6vw,6rem) 4vw', background: '#071020' }}>
        <div style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#F4B400', fontWeight: 600, marginBottom: '0.75rem' }}>{t.platform.tag}</div>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem,3vw,2.8rem)', fontWeight: 900, marginBottom: '0.75rem' }}>{t.platform.title}</h2>
        <p style={{ color: '#b6c4d4', maxWidth: 680, lineHeight: 1.7, marginBottom: 'clamp(1.5rem,4vw,3rem)' }}>{t.platform.text}</p>

        {/* Bestellweg in drei Schritten */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.2rem', marginBottom: 'clamp(1.5rem,4vw,3rem)' }}>
          {t.platform.steps.map((step, i) => (
            <div key={i} style={{ borderTop: '3px solid #F4B400', paddingTop: '0.9rem' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 900, color: '#F4B400', marginBottom: '0.35rem' }}>{step.num}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>{step.title}</h3>
              <p style={{ fontSize: '0.88rem', color: '#b6c4d4', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Partnerbereiche: nur der erste ist aktiv. Weitere Partner hier nach demselben Muster ergänzen. */}
        <div id="categories" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', marginBottom: 'clamp(1.5rem,4vw,2.5rem)' }}>
          {t.platform.partners.map((partner, i) => {
            const isActive = i === 0;
            const content = (
              <>
                <span style={{ alignSelf: 'flex-start', fontSize: '0.72rem', fontWeight: 700, padding: '0.25rem 0.7rem', borderRadius: 999, background: isActive ? '#1f6b4c' : 'transparent', color: isActive ? '#fff' : '#b6c4d4', border: isActive ? 'none' : '1px solid rgba(255,255,255,0.25)' }}>
                  {isActive ? t.platform.active : t.platform.soon}
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: isActive ? '#f5f2eb' : '#b6c4d4' }}>{partner.title}</span>
                <span style={{ fontSize: '0.85rem', color: '#b6c4d4', lineHeight: 1.5 }}>{partner.desc}</span>
              </>
            );
            const cardStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left', borderRadius: 8, padding: '1.5rem', font: 'inherit', color: 'inherit' };
            return isActive ? (
              <button key={i} onClick={() => go('system')} style={{ ...cardStyle, background: 'rgba(244,180,0,0.06)', border: '1.5px solid rgba(244,180,0,0.55)', cursor: 'pointer' }}>
                {content}
              </button>
            ) : (
              <div key={i} style={{ ...cardStyle, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.2)' }}>
                {content}
              </div>
            );
          })}
        </div>

        {/* Die drei Hauptaktionen der Plattform */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Btn 1: Produkte kaufen */}
          <button onClick={() => go('dashboard')} style={{ flex: '1 1 200px', minHeight: 52, background: '#F4B400', color: '#0a1628', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.9rem 1.8rem', border: 'none', borderRadius: 2, cursor: 'pointer' }}>
            {t.hero.btn1}
          </button>
          {/* Btn 2: Produkte verkaufen */}
          <button onClick={() => go('seller')} style={{ flex: '1 1 200px', minHeight: 52, background: 'transparent', color: '#f5f2eb', fontWeight: 600, fontSize: '0.88rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.9rem 1.8rem', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 2, cursor: 'pointer' }}>
            {t.hero.btn2}
          </button>
          {/* Btn 3: Container versenden → ParcelPage */}
          <button onClick={() => go('parcel')} style={{ flex: '1 1 200px', minHeight: 52, background: 'transparent', color: '#f5f2eb', fontWeight: 600, fontSize: '0.88rem', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '0.9rem 1.8rem', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 2, cursor: 'pointer' }}>
            {t.hero.btn3}
          </button>
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
            <p style={{ fontSize: '0.82rem', color: '#b6c4d4', marginBottom: '0.5rem' }}>info@germanlinkbusiness.de</p>
            <p style={{ fontSize: '0.82rem', color: '#b6c4d4', marginBottom: '0.75rem' }}>{t.platform.partnerLine}</p>
            <button onClick={() => go('impressum')} style={{ background: 'none', border: 'none', padding: 0, color: '#F4B400', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}>
              {t.cta.btn3}
            </button>
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



