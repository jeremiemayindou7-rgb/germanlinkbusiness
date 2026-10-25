import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Mail, MapPin, Phone, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// ─────────────────────────────────────────────────────────────────────────────
// GLB-Solar: alle Informationen über den Partner im Kongo stehen NUR in dieser
// Datei. Die Systemseite bindet nur <GlbSolarFooter /> ein; Änderungen an
// Kontakt, Texten oder Foto werden ausschließlich hier gemacht.
// Eigene Pfad-Route /glb-solar (kein Hash), damit Google die Seite indexiert.
// ─────────────────────────────────────────────────────────────────────────────

type Lang = 'de' | 'fr' | 'ln' | 'en';

export const GLB_SOLAR_PATH = '/glb-solar';

// Foto liegt in /public/images/. Der Dateiname enthält die Suchbegriffe
// (GLB-Solar, Brazzaville, Name), damit das Bild in der Google-Bildersuche
// mit dieser Seite verknüpft wird.
export const GLB_SOLAR_PHOTO = '/image/glb-solar-brazzaville-rebeca-bahoumina-gerante.png';
export const GLB_SOLAR_AVATAR = '/image/glb-solar-brazzaville-rebeca-bahoumina-portrait.jpg';
export const GLB_SOLAR_LOGO = '/image/glb-solar-logo-brazzaville.png';             // helle Schrift, für dunkle Flächen
export const GLB_SOLAR_LOGO_DARK = '/image/glb-solar-logo-brazzaville-dunkel.png'; // dunkle Schrift, für helle Flächen/Druck

export const GLB_SOLAR_CONTACT = {
  company: 'GERMANLINK BUSINESS SARLU',
  tradeName: 'GLB-Solar',
  manager: 'Rebeca Bahoumina',
  street: '336, rue Makita',
  district: 'Arrondissement 2 Bacongo',
  city: 'Brazzaville',
  country: 'République du Congo',
  phone: '+242 06 789 55 09',
  phoneHref: 'tel:+242067895509',
  whatsappHref: 'https://wa.me/242067895509',
  email: 'info-glb-solar@gmail.com',
};

const TEXT: Record<Lang, {
  back: string;
  eyebrow: string;
  title: string;
  lead: string;
  managerRole: string;
  managerCity: string;
  photoAlt: string;
  btnWhatsapp: string;
  btnCall: string;
  btnMail: string;
  tasksTitle: string;
  tasks: { title: string; desc: string }[];
  flowTitle: string;
  flow: { who: string; what: string }[];
  factsTitle: string;
  facts: { label: string; value: string }[];
  contactTitle: string;
  contactNote: string;
  footerEyebrow: string;
  footerTitle: string;
  footerText: string;
  footerMore: string;
  metaTitle: string;
  metaDesc: string;
}> = {
  de: {
    back: 'Zurück',
    eyebrow: 'Unser Partner im Kongo',
    title: 'Wer ist GLB-Solar?',
    lead: 'GLB-Solar (GERMANLINK BUSINESS SARLU) ist ein eigenständiges kongolesisches Unternehmen mit Sitz in Brazzaville und Partner der GLB-Plattform. GLB-Solar übernimmt Ihre Bestellung ab Ankunft im Hafen und kümmert sich um alles bis zur Übergabe an Sie.',
    managerRole: 'Geschäftsführerin von GLB-Solar',
    managerCity: 'Brazzaville, Republik Kongo',
    photoAlt: 'Rebeca Bahoumina, Geschäftsführerin von GLB-Solar (GERMANLINK BUSINESS SARLU) in Brazzaville',
    btnWhatsapp: 'WhatsApp schreiben',
    btnCall: 'Anrufen',
    btnMail: 'E-Mail senden',
    tasksTitle: 'Was GLB-Solar für Sie übernimmt',
    tasks: [
      { title: 'Verzollung & Abholung', desc: 'Zollabfertigung und Abholung der Ware im Hafen.' },
      { title: 'Zwischenlager', desc: 'Sichere Lagerung bis zur Auslieferung.' },
      { title: 'Lieferung an Sie', desc: 'Zustellung an jeden einzelnen Kunden.' },
      { title: 'Endrechnung', desc: 'Eine klare Rechnung inklusive Transport und Steuern.' },
      { title: 'Beratung & Service', desc: 'Ansprechpartner vor Ort, auch nach dem Kauf.' },
    ],
    flowTitle: 'So läuft Ihre Bestellung',
    flow: [
      { who: 'Sie', what: 'bestellen auf der GLB-Plattform' },
      { who: 'GermanLink Business (Deutschland)', what: 'kauft ein, prüft und verlädt in den Container' },
      { who: 'GLB-Solar (Kongo)', what: 'übernimmt ab Hafen, sendet Ihnen die Endrechnung und liefert' },
    ],
    factsTitle: 'Das Unternehmen',
    facts: [
      { label: 'Firma', value: 'GERMANLINK BUSINESS SARLU' },
      { label: 'Handelsname', value: 'GLB-Solar' },
      { label: 'Rechtsform', value: 'SARLU nach kongolesischem Recht' },
      { label: 'Sitz', value: '336, rue Makita, Bacongo, Brazzaville' },
      { label: 'Geschäftsführung', value: 'Rebeca Bahoumina' },
      { label: 'RCCM', value: 'wird nach Eintragung ergänzt' },
    ],
    contactTitle: 'Kontakt für alle Bestellungen im Kongo',
    contactNote: 'Fragen zu Bestellung, Rechnung oder Lieferung? Wenden Sie sich direkt an GLB-Solar.',
    footerEyebrow: 'Ihr Partner im Kongo',
    footerTitle: 'Wer ist GLB-Solar?',
    footerText: 'GLB-Solar übernimmt Ihre Ware ab dem Hafen, sendet Ihnen die Endrechnung und liefert bis zu Ihnen.',
    footerMore: 'Mehr über GLB-Solar',
    metaTitle: 'GLB-Solar Brazzaville – Partner von GermanLink Business im Kongo',
    metaDesc: 'GLB-Solar (GERMANLINK BUSINESS SARLU), Brazzaville: Verzollung, Lager, Lieferung und Endrechnung für alle GLB-Bestellungen im Kongo. Geschäftsführerin Rebeca Bahoumina.',
  },
  fr: {
    back: 'Retour',
    eyebrow: 'Notre partenaire au Congo',
    title: 'Qui est GLB-Solar ?',
    lead: "GLB-Solar (GERMANLINK BUSINESS SARLU) est une société congolaise indépendante basée à Brazzaville et partenaire de la plateforme GLB. GLB-Solar prend en charge votre commande dès son arrivée au port et s'occupe de tout jusqu'à la remise chez vous.",
    managerRole: 'Gérante de GLB-Solar',
    managerCity: 'Brazzaville, République du Congo',
    photoAlt: 'Rebeca Bahoumina, gérante de GLB-Solar (GERMANLINK BUSINESS SARLU) à Brazzaville',
    btnWhatsapp: 'Écrire sur WhatsApp',
    btnCall: 'Appeler',
    btnMail: 'Envoyer un e-mail',
    tasksTitle: 'Ce que GLB-Solar fait pour vous',
    tasks: [
      { title: 'Dédouanement & enlèvement', desc: 'Formalités douanières et enlèvement des marchandises au port.' },
      { title: 'Stockage', desc: "Stockage sécurisé jusqu'à la livraison." },
      { title: 'Livraison chez vous', desc: 'Livraison à chaque client.' },
      { title: 'Facture finale', desc: 'Une facture claire, transport et taxes inclus.' },
      { title: 'Conseil & service', desc: "Un interlocuteur sur place, aussi après l'achat." },
    ],
    flowTitle: 'Comment se passe votre commande',
    flow: [
      { who: 'Vous', what: 'commandez sur la plateforme GLB' },
      { who: 'GermanLink Business (Allemagne)', what: 'achète, vérifie et charge le conteneur' },
      { who: 'GLB-Solar (Congo)', what: 'prend le relais au port, vous envoie la facture finale et livre' },
    ],
    factsTitle: "L'entreprise",
    facts: [
      { label: 'Raison sociale', value: 'GERMANLINK BUSINESS SARLU' },
      { label: 'Nom commercial', value: 'GLB-Solar' },
      { label: 'Forme juridique', value: 'SARLU de droit congolais' },
      { label: 'Siège', value: '336, rue Makita, Bacongo, Brazzaville' },
      { label: 'Gérance', value: 'Rebeca Bahoumina' },
      { label: 'RCCM', value: 'sera ajouté après immatriculation' },
    ],
    contactTitle: 'Contact pour toutes vos commandes au Congo',
    contactNote: 'Une question sur votre commande, votre facture ou votre livraison ? Contactez directement GLB-Solar.',
    footerEyebrow: 'Votre partenaire au Congo',
    footerTitle: 'Qui est GLB-Solar ?',
    footerText: "GLB-Solar prend en charge vos marchandises dès le port, vous envoie la facture finale et livre jusqu'à chez vous.",
    footerMore: 'En savoir plus sur GLB-Solar',
    metaTitle: 'GLB-Solar Brazzaville – Partenaire de GermanLink Business au Congo',
    metaDesc: 'GLB-Solar (GERMANLINK BUSINESS SARLU), Brazzaville : dédouanement, stockage, livraison et facture finale pour toutes les commandes GLB au Congo. Gérante Rebeca Bahoumina.',
  },
  ln: {
    back: 'Zonga',
    eyebrow: 'Partenaire na biso na Congo',
    title: 'GLB-Solar ezali nani?',
    lead: 'GLB-Solar (GERMANLINK BUSINESS SARLU) ezali société ya Congo, ya yango moko, na Brazzaville, mpe partenaire ya plateforme GLB. GLB-Solar ezwaka commande na yo soki ekomi na port mpe esalaka nyonso kino ekomi na maboko na yo.',
    managerRole: 'Gérante ya GLB-Solar',
    managerCity: 'Brazzaville, République du Congo',
    photoAlt: 'Rebeca Bahoumina, gérante ya GLB-Solar (GERMANLINK BUSINESS SARLU) na Brazzaville',
    btnWhatsapp: 'Koma na WhatsApp',
    btnCall: 'Benga',
    btnMail: 'Tinda e-mail',
    tasksTitle: 'Oyo GLB-Solar esalaka pona yo',
    tasks: [
      { title: 'Douane & kozwa biloko', desc: 'Makambo ya douane mpe kozwa biloko na port.' },
      { title: 'Dépôt', desc: 'Kobomba biloko malamu kino livraison.' },
      { title: 'Livraison epai na yo', desc: 'Kopesa biloko na client moko moko.' },
      { title: 'Facture ya suka', desc: 'Facture ya polele na transport mpe taxes.' },
      { title: 'Toli & service', desc: 'Moto ya kosolola na ye awa, ata nsima ya kosomba.' },
    ],
    flowTitle: 'Ndenge commande na yo esalemaka',
    flow: [
      { who: 'Yo', what: 'osombaka na plateforme GLB' },
      { who: 'GermanLink Business (Allemagne)', what: 'esombaka, etalaka mpe etiaka na conteneur' },
      { who: 'GLB-Solar (Congo)', what: 'ezwaka na port, etindelaka yo facture ya suka mpe ememaka' },
    ],
    factsTitle: 'Société',
    facts: [
      { label: 'Nkombo ya société', value: 'GERMANLINK BUSINESS SARLU' },
      { label: 'Nkombo ya mombongo', value: 'GLB-Solar' },
      { label: 'Forme', value: 'SARLU ya mibeko ya Congo' },
      { label: 'Siège', value: '336, rue Makita, Bacongo, Brazzaville' },
      { label: 'Gérance', value: 'Rebeca Bahoumina' },
      { label: 'RCCM', value: 'ekobakisama nsima ya immatriculation' },
    ],
    contactTitle: 'Contact pona ba commande nyonso na Congo',
    contactNote: 'Motuna na commande, facture to livraison? Benga GLB-Solar direct.',
    footerEyebrow: 'Partenaire na yo na Congo',
    footerTitle: 'GLB-Solar ezali nani?',
    footerText: 'GLB-Solar ezwaka biloko na yo na port, etindelaka yo facture ya suka mpe ememaka kino epai na yo.',
    footerMore: 'Yeba makambo mingi na GLB-Solar',
    metaTitle: 'GLB-Solar Brazzaville – Partenaire ya GermanLink Business na Congo',
    metaDesc: 'GLB-Solar (GERMANLINK BUSINESS SARLU), Brazzaville: douane, dépôt, livraison mpe facture ya suka pona ba commande nyonso ya GLB na Congo.',
  },
  en: {
    back: 'Back',
    eyebrow: 'Our partner in Congo',
    title: 'Who is GLB-Solar?',
    lead: 'GLB-Solar (GERMANLINK BUSINESS SARLU) is an independent Congolese company based in Brazzaville and a partner of the GLB platform. GLB-Solar takes over your order on arrival at the port and handles everything until it reaches you.',
    managerRole: 'Managing Director of GLB-Solar',
    managerCity: 'Brazzaville, Republic of Congo',
    photoAlt: 'Rebeca Bahoumina, Managing Director of GLB-Solar (GERMANLINK BUSINESS SARLU) in Brazzaville',
    btnWhatsapp: 'Message on WhatsApp',
    btnCall: 'Call',
    btnMail: 'Send an e-mail',
    tasksTitle: 'What GLB-Solar does for you',
    tasks: [
      { title: 'Customs & pickup', desc: 'Customs clearance and pickup of the goods at the port.' },
      { title: 'Storage', desc: 'Secure storage until delivery.' },
      { title: 'Delivery to you', desc: 'Delivery to each individual customer.' },
      { title: 'Final invoice', desc: 'One clear invoice including transport and taxes.' },
      { title: 'Advice & service', desc: 'A local contact, also after your purchase.' },
    ],
    flowTitle: 'How your order works',
    flow: [
      { who: 'You', what: 'order on the GLB platform' },
      { who: 'GermanLink Business (Germany)', what: 'buys, checks and loads the container' },
      { who: 'GLB-Solar (Congo)', what: 'takes over at the port, sends you the final invoice and delivers' },
    ],
    factsTitle: 'The company',
    facts: [
      { label: 'Company', value: 'GERMANLINK BUSINESS SARLU' },
      { label: 'Trade name', value: 'GLB-Solar' },
      { label: 'Legal form', value: 'SARLU under Congolese law' },
      { label: 'Registered office', value: '336, rue Makita, Bacongo, Brazzaville' },
      { label: 'Management', value: 'Rebeca Bahoumina' },
      { label: 'RCCM', value: 'to be added after registration' },
    ],
    contactTitle: 'Contact for all orders in Congo',
    contactNote: 'Questions about your order, invoice or delivery? Contact GLB-Solar directly.',
    footerEyebrow: 'Your partner in Congo',
    footerTitle: 'Who is GLB-Solar?',
    footerText: 'GLB-Solar takes over your goods at the port, sends you the final invoice and delivers to your door.',
    footerMore: 'More about GLB-Solar',
    metaTitle: 'GLB-Solar Brazzaville – GermanLink Business partner in Congo',
    metaDesc: 'GLB-Solar (GERMANLINK BUSINESS SARLU), Brazzaville: customs, storage, delivery and final invoice for all GLB orders in Congo. Managing Director Rebeca Bahoumina.',
  },
};

const useGlbSolarText = () => {
  const { language } = useLanguage();
  const lang: Lang = (['de', 'fr', 'ln', 'en'] as const).includes(language as Lang) ? (language as Lang) : 'fr';
  return { lang, tx: TEXT[lang] };
};

const C = {
  bg: '#0a1628',
  bgDeep: '#050c18',
  panel: 'rgba(255,255,255,0.03)',
  line: 'rgba(255,255,255,0.08)',
  text: '#f5f2eb',
  soft: '#c9d3dc',
  muted: '#8fa3b8',
  gold: '#F4B400',
  green: '#5dcaa5',
  whatsapp: '#25D366',
};

const btnBase: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  minHeight: 46, padding: '0.7rem 1.2rem', borderRadius: 4, fontWeight: 700,
  fontSize: '0.88rem', textDecoration: 'none',
};

// Foto mit Ersatzanzeige (Initialen), falls die Bilddatei noch fehlt
const ManagerPhoto: React.FC<{ alt: string; size?: number }> = ({ alt, size }) => {
  const [failed, setFailed] = useState(false);
  const style: React.CSSProperties = size
    ? { width: size, height: size, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', flexShrink: 0 }
    // height: 'auto' ist nötig, sonst gilt das HTML-Attribut height={1000} und das Bild wird zu hoch und seitlich abgeschnitten
    : { width: '100%', height: 'auto', aspectRatio: '4 / 5', objectFit: 'cover', objectPosition: 'center top', borderRadius: 6, display: 'block' };
  if (failed) {
    return (
      <div aria-label={alt} style={{ ...style, background: '#13233d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold, fontFamily: 'Georgia, serif', fontWeight: 900, fontSize: size ? size * 0.35 : '3rem' }}>
        RB
      </div>
    );
  }
  return (
    <img
      src={size ? GLB_SOLAR_AVATAR : GLB_SOLAR_PHOTO}
      alt={alt}
      title={alt}
      width={size ?? 800}
      height={size ?? 1000}
      loading={size ? 'lazy' : 'eager'}
      onError={() => setFailed(true)}
      style={style}
    />
  );
};

const ContactButtons: React.FC<{ tx: typeof TEXT['de'] }> = ({ tx }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
    <a href={GLB_SOLAR_CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" style={{ ...btnBase, background: C.whatsapp, color: '#06210f' }}>
      <MessageCircle size={18} /> {tx.btnWhatsapp}
    </a>
    <a href={GLB_SOLAR_CONTACT.phoneHref} style={{ ...btnBase, background: 'transparent', color: C.text, border: `1px solid rgba(255,255,255,0.3)` }}>
      <Phone size={18} /> {tx.btnCall}
    </a>
    <a href={`mailto:${GLB_SOLAR_CONTACT.email}`} style={{ ...btnBase, background: 'transparent', color: C.text, border: `1px solid rgba(255,255,255,0.3)` }}>
      <Mail size={18} /> {tx.btnMail}
    </a>
  </div>
);

const ContactLines: React.FC = () => (
  <div style={{ display: 'grid', gap: '0.6rem', fontSize: '0.92rem' }}>
    <div style={{ display: 'flex', gap: '0.55rem', color: C.soft }}>
      <MapPin size={17} color={C.gold} style={{ flexShrink: 0, marginTop: 2 }} />
      <span>{GLB_SOLAR_CONTACT.street}, {GLB_SOLAR_CONTACT.district}<br />{GLB_SOLAR_CONTACT.city}, {GLB_SOLAR_CONTACT.country}</span>
    </div>
    <a href={GLB_SOLAR_CONTACT.phoneHref} style={{ display: 'flex', gap: '0.55rem', color: C.gold, textDecoration: 'none', fontWeight: 600 }}>
      <Phone size={17} style={{ flexShrink: 0, marginTop: 2 }} /> {GLB_SOLAR_CONTACT.phone} (Tél. & WhatsApp)
    </a>
    <a href={`mailto:${GLB_SOLAR_CONTACT.email}`} style={{ display: 'flex', gap: '0.55rem', color: C.gold, textDecoration: 'none' }}>
      <Mail size={17} style={{ flexShrink: 0, marginTop: 2 }} /> {GLB_SOLAR_CONTACT.email}
    </a>
  </div>
);

// ── Kompakte Fußzeile für andere Seiten (z. B. Systemseite) ────────────────
export const GlbSolarFooter: React.FC = () => {
  const { tx } = useGlbSolarText();
  return (
    <footer style={{ padding: 'clamp(2rem,5vw,3.5rem) 4vw calc(90px + env(safe-area-inset-bottom, 0px))', background: C.bgDeep, borderTop: `2px solid ${C.gold}`, color: C.text }}>
      <div style={{ maxWidth: 1200, margin: '0 auto 1.6rem' }}>
        <img src={GLB_SOLAR_LOGO} alt="GLB-Solar Logo" width={900} height={198} loading="lazy" style={{ width: 160, height: 'auto', display: 'block' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: 1200, margin: '0 auto', alignItems: 'start' }}>
        <div style={{ display: 'flex', gap: '1.1rem', alignItems: 'flex-start' }}>
          <ManagerPhoto alt={tx.photoAlt} size={84} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.gold, marginBottom: '0.4rem' }}>{tx.footerEyebrow}</div>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.3rem,2.2vw,1.7rem)', fontWeight: 900, margin: '0 0 0.5rem' }}>{tx.footerTitle}</h2>
            <p style={{ color: C.soft, lineHeight: 1.6, fontSize: '0.93rem', margin: '0 0 0.8rem' }}>{tx.footerText}</p>
            <a href={GLB_SOLAR_PATH} style={{ color: C.gold, fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>{tx.footerMore} →</a>
          </div>
        </div>
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: '1.3rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.9rem' }}>{tx.contactTitle}</h3>
          <ContactLines />
          <a href={GLB_SOLAR_CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" style={{ ...btnBase, width: '100%', marginTop: '1rem', background: C.whatsapp, color: '#06210f' }}>
            <MessageCircle size={18} /> {tx.btnWhatsapp}
          </a>
        </div>
      </div>
    </footer>
  );
};

// ── SEO: Titel, Beschreibung, Vorschaubild und strukturierte Daten ─────────
const setMeta = (attr: 'name' | 'property', key: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', value);
};

const useGlbSolarSeo = (lang: Lang, tx: typeof TEXT['de']) => {
  useEffect(() => {
    const origin = window.location.origin;
    const pageUrl = origin + GLB_SOLAR_PATH;
    const photoUrl = origin + GLB_SOLAR_PHOTO;
    const prevTitle = document.title;
    document.title = tx.metaTitle;
    document.documentElement.lang = lang === 'ln' ? 'ln' : lang;
    setMeta('name', 'description', tx.metaDesc);
    setMeta('property', 'og:title', tx.metaTitle);
    setMeta('property', 'og:description', tx.metaDesc);
    setMeta('property', 'og:image', photoUrl);
    setMeta('property', 'og:url', pageUrl);
    setMeta('property', 'og:type', 'website');

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = pageUrl;

    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.id = 'glb-solar-ld';
    ld.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': pageUrl + '#glb-solar',
      name: 'GLB-Solar',
      legalName: GLB_SOLAR_CONTACT.company,
      url: pageUrl,
      image: [photoUrl, origin + GLB_SOLAR_LOGO],
      logo: origin + GLB_SOLAR_LOGO_DARK,
      description: tx.metaDesc,
      telephone: '+242067895509',
      email: GLB_SOLAR_CONTACT.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: GLB_SOLAR_CONTACT.street,
        addressLocality: GLB_SOLAR_CONTACT.city,
        addressRegion: 'Bacongo',
        addressCountry: 'CG',
      },
      areaServed: { '@type': 'Country', name: 'Republic of the Congo' },
      parentOrganization: { '@type': 'Organization', name: 'GermanLink Business GmbH i. G.' },
      employee: {
        '@type': 'Person',
        name: GLB_SOLAR_CONTACT.manager,
        jobTitle: tx.managerRole,
        image: photoUrl,
        workLocation: { '@type': 'Place', name: 'Brazzaville' },
      },
    });
    document.getElementById('glb-solar-ld')?.remove();
    document.head.appendChild(ld);

    return () => { document.title = prevTitle; ld.remove(); };
  }, [lang, tx]);
};

// ── Seite /glb-solar ──────────────────────────────────────────────────────
export const GlbSolarPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { lang, tx } = useGlbSolarText();
  useGlbSolarSeo(lang, tx);

  const h2: React.CSSProperties = { fontFamily: 'Georgia, serif', fontSize: 'clamp(1.4rem,2.6vw,2rem)', fontWeight: 900, margin: '0 0 1.4rem' };
  const section: React.CSSProperties = { padding: 'clamp(2rem,5vw,3.5rem) 4vw', borderTop: `1px solid ${C.line}` };
  const inner: React.CSSProperties = { maxWidth: 1200, margin: '0 auto' };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}>
      <style>{`
        .glbs-hero { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: clamp(1.5rem, 4vw, 3.5rem); align-items: center; }
        @media (max-width: 820px) { .glbs-hero { grid-template-columns: 1fr; } }
      `}</style>

      {onBack && (
        <div style={{ padding: '1.2rem 4vw 0' }}>
          <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '0.9rem', padding: '0.4rem 0' }}>
            <ArrowLeft size={18} /> {tx.back}
          </button>
        </div>
      )}

      {/* Hero mit Foto der Geschäftsführerin */}
      <header style={{ padding: 'clamp(1.5rem,4vw,3rem) 4vw clamp(2rem,5vw,3.5rem)' }}>
        <div className="glbs-hero" style={inner}>
          <div>
            <img src={GLB_SOLAR_LOGO} alt="GLB-Solar Logo – GERMANLINK BUSINESS SARLU, Brazzaville" width={900} height={198}
              style={{ width: 'clamp(170px, 26vw, 260px)', height: 'auto', display: 'block', marginBottom: '1.4rem' }} />
            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.gold, marginBottom: '0.8rem' }}>{tx.eyebrow}</div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem,5vw,3.4rem)', fontWeight: 900, lineHeight: 1.08, margin: '0 0 1.1rem' }}>{tx.title}</h1>
            <p style={{ color: C.soft, fontSize: 'clamp(1rem,1.4vw,1.12rem)', lineHeight: 1.7, margin: '0 0 1.6rem', maxWidth: 620 }}>{tx.lead}</p>
            <ContactButtons tx={tx} />
          </div>
          <figure style={{ margin: 0, maxWidth: 420, width: '100%', justifySelf: 'center' }}>
            <ManagerPhoto alt={tx.photoAlt} />
            <figcaption style={{ marginTop: '0.9rem' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{GLB_SOLAR_CONTACT.manager}</div>
              <div style={{ color: C.gold, fontSize: '0.9rem', fontWeight: 600 }}>{tx.managerRole}</div>
              <div style={{ color: C.muted, fontSize: '0.85rem' }}>{tx.managerCity}</div>
            </figcaption>
          </figure>
        </div>
      </header>

      {/* Aufgaben */}
      <section style={{ ...section, background: '#071020' }}>
        <div style={inner}>
          <h2 style={h2}>{tx.tasksTitle}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.2rem' }}>
            {tx.tasks.map((task, i) => (
              <div key={task.title} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: '1.2rem' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontWeight: 900, color: C.gold, marginBottom: '0.4rem' }}>{`0${i + 1}`}</div>
                <h3 style={{ fontSize: '1.02rem', fontWeight: 700, margin: '0 0 0.35rem' }}>{task.title}</h3>
                <p style={{ color: C.soft, fontSize: '0.9rem', lineHeight: 1.55, margin: 0 }}>{task.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ablauf */}
      <section style={section}>
        <div style={inner}>
          <h2 style={h2}>{tx.flowTitle}</h2>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.9rem', maxWidth: 760 }}>
            {tx.flow.map((step, i) => (
              <li key={step.who} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i === 2 ? C.gold : 'rgba(255,255,255,0.08)', color: i === 2 ? C.bg : C.text, fontWeight: 800 }}>{i + 1}</span>
                <span style={{ paddingTop: 5, lineHeight: 1.55 }}>
                  <strong>{step.who}</strong> <span style={{ color: C.soft }}>{step.what}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Unternehmen + Kontakt */}
      <section style={{ ...section, paddingBottom: 'calc(90px + env(safe-area-inset-bottom, 0px))' }}>
        <div style={{ ...inner, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          <div>
            <h2 style={h2}>{tx.factsTitle}</h2>
            <dl style={{ margin: 0, display: 'grid', gap: '0.7rem' }}>
              {tx.facts.map(f => (
                <div key={f.label} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 0.8fr) 1.2fr', gap: '0.8rem', paddingBottom: '0.7rem', borderBottom: `1px solid ${C.line}` }}>
                  <dt style={{ color: C.muted, fontSize: '0.88rem' }}>{f.label}</dt>
                  <dd style={{ margin: 0, fontSize: '0.92rem' }}>{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: '1.5rem' }}>
            <h2 style={{ ...h2, fontSize: '1.3rem', marginBottom: '0.5rem' }}>{tx.contactTitle}</h2>
            <p style={{ color: C.muted, fontSize: '0.88rem', lineHeight: 1.55, margin: '0 0 1.1rem' }}>{tx.contactNote}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1.1rem' }}>
              <ManagerPhoto alt={tx.photoAlt} size={56} />
              <div>
                <div style={{ fontWeight: 700 }}>{GLB_SOLAR_CONTACT.manager}</div>
                <div style={{ color: C.gold, fontSize: '0.85rem' }}>{tx.managerRole}</div>
              </div>
            </div>
            <ContactLines />
            <div style={{ marginTop: '1.2rem' }}>
              <ContactButtons tx={tx} />
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '1.2rem 0 0', display: 'grid', gap: '0.4rem' }}>
              {tx.tasks.slice(0, 3).map(task => (
                <li key={task.title} style={{ display: 'flex', gap: '0.45rem', fontSize: '0.85rem', color: C.soft }}>
                  <Check size={15} color={C.green} style={{ flexShrink: 0, marginTop: 2 }} /> {task.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GlbSolarPage;

