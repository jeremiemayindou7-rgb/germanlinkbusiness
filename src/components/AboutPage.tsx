import React, { useState, useEffect } from 'react';

interface AboutPageProps {
  onNavigate?: (view: string) => void;
  onGetStarted?: () => void;
}

type Language = 'de' | 'fr' | 'ln';

// ─── Farben exakt wie im Preview ──────────────────────────────────────────────
const SOL_COLORS = ['#009A00', '#009A00', '#DD0000', '#007FFF', '#FFCE00', '#CE1021'];
const FW_COLORS  = ['#DD0000', '#009A00', '#007FFF', '#FFCE00'];
const VAL_COLORS = ['#DD0000', '#009A00', '#007FFF', '#FFCE00'];
const MISS_FLAG_COLS = [
  ['#009A00', '#FBDE2A', '#CE1021'],
  ['#007FFF', '#F7D618', '#CE1021'],
  ['#000000', '#DD0000', '#FFCE00'],
];

// ─── Translations exakt wie im Preview ───────────────────────────────────────
const T: Record<Language, any> = {
  de: {
    tag: 'Über GLB',
    hero: {
      title: 'GermanLink Business',
      accent: 'Deutsche Qualität. Echtes Vertrauen. Starkes Business.',
      sub: 'Kaufe Originalprodukte Made in Germany – direkt aus Deutschland, sicher geliefert in den Kongo. Für dein Business. Für deine Zukunft. Für die Entwicklung deines Landes.',
      b1: 'Made in Germany', b2: 'Sichere Lieferung', b3: 'Geprüfte Qualität',
    },
    problem: {
      tag: 'Das Problem', title: 'Was bremst euer Business?',
      sub: 'Zu viele Unternehmer und Händler verlieren Geld durch:',
      cards: [
        { t: 'Billige Produkte ohne Qualität',       d: 'Minderwertige Waren, die schnell kaputt gehen und dein Business schädigen' },
        { t: 'Gefährliche oder gefälschte Waren',    d: 'Unsichere Produkte ohne Zertifikate, die deine Kunden gefährden' },
        { t: 'Fehlende Garantie und kein Vertrauen', d: 'Keine Sicherheit, kein Support, keine langfristige Perspektive' },
      ],
      conclusion: 'Das bremst Business, Wachstum und die Entwicklung des Landes.',
    },
    solution: {
      tag: 'Die Lösung', title: 'GermanLink Business verbindet dich direkt mit Deutschland.',
      sub: 'Alles, was du für ein starkes Business brauchst:',
      features: [
        { t: 'Geprüfte deutsche Produkte',        d: 'Jedes Produkt wird kontrolliert und stammt direkt aus Deutschland' },
        { t: 'Echte Qualität – keine Fälschungen', d: 'Originalware mit Garantie und Zertifikaten' },
        { t: 'Sichere Bezahlung',                  d: 'Geschützte Zahlungsmethoden für deine Sicherheit' },
        { t: 'Lieferung direkt in den Kongo',      d: 'Container-Versand direkt zu dir – transparent und nachverfolgbar' },
        { t: 'Ideal für Händler & Unternehmer',    d: 'Großmengen, Geschäftskunden-Support und faire Preise' },
        { t: 'Entwicklungsprojekte unterstützen',  d: 'Qualität für nachhaltige Entwicklung und Infrastruktur' },
      ],
    },
    mission: {
      tag: 'Unsere Mission', title: 'Afrikanische Businesses stärken – mit deutscher Qualität.', sub: '',
      when: 'Wenn du besser einkaufst:',
      cards: [
        { t: 'Wächst dein Unternehmen',          d: 'Mit besserer Qualität gewinnst du mehr Kunden und steigerst deinen Umsatz' },
        { t: 'Entstehen Arbeitsplätze',           d: 'Starke Unternehmen schaffen sichere Jobs und fördern die lokale Wirtschaft' },
        { t: 'Entwickelst du dein Land nachhaltig', d: 'Qualität baut Vertrauen und langfristige Perspektiven für die Zukunft' },
      ],
      conclusion: 'Wenn du besser einkaufst, baust du eine bessere Zukunft.',
    },
    whyGermany: {
      tag: 'Warum Deutschland?', title: 'Deutschland steht weltweit für Qualität.',
      sub: 'Deutschland steht weltweit für:',
      vals: ['Qualität', 'Zuverlässigkeit', 'Technik', 'Sicherheit'],
      conclusion: 'Mit GermanLink Business kommt dieses Vertrauen direkt zu dir – ohne Umwege.',
    },
    forWhom: {
      tag: 'Für wen?', title: 'Für wen ist GermanLink Business?',
      targets: [
        { t: 'Unternehmer & Händler',              d: 'Erweitere dein Sortiment mit hochwertigen deutschen Produkten und gewinne das Vertrauen deiner Kunden' },
        { t: 'Start-ups im Kongo',                 d: 'Starte dein Business mit der besten Grundlage – deutsche Qualität für nachhaltigen Erfolg' },
        { t: 'Bau-, Technik- & Handelsprojekte',   d: 'Zuverlässige Materialien und Werkzeuge für professionelle Projekte' },
        { t: 'Unternehmen mit Fokus auf Qualität', d: 'Für alle, die nachhaltig wachsen und echten Mehrwert schaffen wollen' },
      ],
    },
    cta: {
      title: 'Starte dein Business mit echter Qualität',
      sub: 'Bestelle direkt aus Deutschland',
      tag: 'Baue Vertrauen. Baue Zukunft.',
      btn: 'Jetzt starten mit GermanLink Business',
      quote: 'GermanLink Business ezali lien direct entre Allemagne na Congo. Qualité ya solo. Confiance. Développement ya business mpe mboka.',
    },
    footer: { tag: 'Deutsche Qualität für afrikanisches Business', copy: '2026 GermanLink Business. Deutsche Qualität für den Kongo.' },
  },
  fr: {
    tag: 'À propos de GLB',
    hero: {
      title: 'GermanLink Business',
      accent: 'Qualité allemande. Vraie confiance. Business fort.',
      sub: "Achetez des produits originaux Made in Germany – directement d'Allemagne, livrés en toute sécurité au Congo. Pour votre business. Pour votre avenir. Pour le développement de votre pays.",
      b1: 'Made in Germany', b2: 'Livraison sécurisée', b3: 'Qualité vérifiée',
    },
    problem: {
      tag: 'Le Problème', title: 'Ce qui freine votre business',
      sub: "Trop d'entrepreneurs et de commerçants perdent de l'argent à cause de:",
      cards: [
        { t: 'Produits bon marché sans qualité',      d: 'Marchandises de qualité inférieure qui se cassent rapidement et nuisent à votre business' },
        { t: 'Marchandises dangereuses ou contrefaites', d: 'Produits non sécurisés sans certificats qui mettent vos clients en danger' },
        { t: 'Absence de garantie et de confiance',   d: 'Pas de sécurité, pas de support, pas de perspective à long terme' },
      ],
      conclusion: 'Cela freine le business, la croissance et le développement du pays.',
    },
    solution: {
      tag: 'La Solution', title: "GermanLink Business vous connecte directement avec l'Allemagne.",
      sub: 'Tout ce dont vous avez besoin pour un business solide :',
      features: [
        { t: 'Produits allemands vérifiés',          d: "Chaque produit est contrôlé et provient directement d'Allemagne" },
        { t: 'Vraie qualité – pas de contrefaçons',  d: 'Marchandises originales avec garantie et certificats' },
        { t: 'Paiement sécurisé',                    d: 'Méthodes de paiement protégées pour votre sécurité' },
        { t: 'Livraison directe au Congo',            d: 'Expédition par conteneur directement chez vous – transparente et traçable' },
        { t: 'Idéal pour commerçants & entrepreneurs', d: 'Grandes quantités, support clients professionnels et prix équitables' },
        { t: 'Soutien aux projets de développement', d: "Qualité pour le développement durable et l'infrastructure" },
      ],
    },
    mission: {
      tag: 'Notre Mission', title: 'Renforcer les businesses africains – avec la qualité allemande.', sub: '',
      when: 'Quand vous achetez mieux :',
      cards: [
        { t: 'Votre entreprise grandit',              d: "Avec une meilleure qualité, vous gagnez plus de clients et augmentez votre chiffre d'affaires" },
        { t: 'Des emplois se créent',                 d: "Les entreprises fortes créent des emplois sûrs et stimulent l'économie locale" },
        { t: 'Vous développez durablement votre pays', d: "La qualité construit la confiance et des perspectives à long terme pour l'avenir" },
      ],
      conclusion: 'Quand vous achetez mieux, vous construisez un meilleur avenir.',
    },
    whyGermany: {
      tag: "Pourquoi l'Allemagne ?", title: "L'Allemagne reconnue mondialement.",
      sub: "L'Allemagne est reconnue mondialement pour :",
      vals: ['Qualité', 'Fiabilité', 'Technologie', 'Sécurité'],
      conclusion: 'Avec GermanLink Business, cette confiance arrive directement chez vous – sans détour.',
    },
    forWhom: {
      tag: 'Pour qui ?', title: 'Pour qui est GermanLink Business ?',
      targets: [
        { t: 'Entrepreneurs & commerçants',             d: 'Élargissez votre gamme avec des produits allemands de haute qualité et gagnez la confiance de vos clients' },
        { t: 'Start-ups au Congo',                      d: 'Démarrez votre business avec la meilleure base – qualité allemande pour un succès durable' },
        { t: 'Projets de construction, technique & commerce', d: 'Matériaux et outils fiables pour des projets professionnels' },
        { t: 'Entreprises axées sur la qualité',        d: 'Pour tous ceux qui veulent croître durablement et créer une vraie valeur ajoutée' },
      ],
    },
    cta: {
      title: 'Démarrez votre business avec une vraie qualité',
      sub: "Commandez directement depuis l'Allemagne",
      tag: "Construisez la confiance. Construisez l'avenir.",
      btn: 'Commencer avec GermanLink Business',
      quote: 'GermanLink Business ezali lien direct entre Allemagne na Congo. Qualité ya solo. Confiance. Développement ya business mpe mboka.',
    },
    footer: { tag: 'Qualité allemande pour le business africain', copy: '2026 GermanLink Business. Qualité allemande pour le Congo.' },
  },
  ln: {
    tag: 'Biso GLB',
    hero: {
      title: 'GermanLink Business',
      accent: 'Qualité ya Allemagne. Confiance ya solo. Business makasi.',
      sub: 'Somba biloko ya solo Made in Germany – banda Allemagne, ekokoma na sécurité na Congo. Pona business na yo. Pona avenir na yo. Pona développement ya mboka na yo.',
      b1: 'Made in Germany', b2: 'Livraison na sécurité', b3: 'Qualité oyo batalami',
    },
    problem: {
      tag: 'Problème', title: 'Nini ekozipa business na yo?',
      sub: 'Ba entrepreneurs mpe ba commerçants mingi bazali kobungisa mbongo mpo na:',
      cards: [
        { t: 'Biloko ya ntalo te ezanga qualité',  d: 'Biloko ya pamba oyo ekobukana nokinoki mpe ekobebisa business na yo' },
        { t: 'Biloko ya danger to biloko ya lokuta', d: 'Biloko ya danger ezanga ba certificats oyo ekotya ba clients na yo na danger' },
        { t: 'Garantie ezali te mpe confiance ezali te', d: 'Sécurité ezali te, support ezali te, perspective ya mokolo molayi ezali te' },
      ],
      conclusion: 'Yango ezali kokanga business, croissance mpe développement ya mboka.',
    },
    solution: {
      tag: 'Solution', title: 'GLB ezali kokangisa yo directement na Allemagne.',
      sub: 'Nyonso oyo ozali na yango pona business ya makasi:',
      features: [
        { t: 'Biloko ya Allemagne oyo batalami malamu', d: 'Biloko nyonso batalami mpe euti directement na Allemagne' },
        { t: 'Qualité ya solo – lokuta te',            d: 'Biloko ya original na garantie mpe ba certificats' },
        { t: 'Kofuta na sécurité',                     d: 'Ba méthodes ya kofuta oyo ebatelami pona sécurité na yo' },
        { t: 'Livraison directe na Congo',             d: 'Expédition ya container directement epai na yo – transparent mpe okoki kolanda' },
        { t: 'Malamu pona ba commerçants & ba entrepreneurs', d: 'Ba quantités minene, support ya ba clients professionnels mpe ba prix ya justice' },
        { t: 'Kosunga ba projets ya développement',    d: 'Qualité pona développement durable mpe infrastructure' },
      ],
    },
    mission: {
      tag: 'Mission na biso', title: 'Kolendisa ba business ya Afrique – na qualité ya Allemagne.', sub: '',
      when: 'Ntango ozali kosomba malamu:',
      cards: [
        { t: 'Entreprise na yo ekokóla',              d: "Na qualité ya malamu, okozwa ba clients ebele mpe okomatisa chiffre d'affaires na yo" },
        { t: 'Misala ekobima',                        d: 'Ba entreprises ya makasi ekosala ba emplois ya sûr mpe ekotombola économie locale' },
        { t: 'Okotongisa mboka na yo na ndenge ya durée', d: 'Qualité etongaka confiance mpe ba perspectives ya mokolo molayi pona avenir' },
      ],
      conclusion: 'Ntango ozali kosomba malamu, ozali kotonga avenir ya malamu.',
    },
    whyGermany: {
      tag: 'Mpo na nini Allemagne?', title: 'Allemagne eyebani na mokili mobimba.',
      sub: 'Allemagne eyebani na mokili mobimba pona:',
      vals: ['Qualité', 'Fiabilité', 'Technologie', 'Sécurité'],
      conclusion: 'Na GermanLink Business, confiance oyo ekokoma directement epai na yo – na nzela moko.',
    },
    forWhom: {
      tag: 'Pona nani?', title: 'GLB ezali pona nani?',
      targets: [
        { t: 'Ba entrepreneurs & ba commerçants',     d: 'Kolongola gamme na yo na biloko ya Allemagne ya qualité ya likolo mpe zwa confiance ya ba clients na yo' },
        { t: 'Ba start-ups na Congo',                 d: 'Bandá business na yo na base ya malamu – qualité ya Allemagne pona succès ya durée' },
        { t: 'Ba projets ya botongami, technique & commerce', d: 'Ba matériaux mpe ba outils ya confiance pona ba projets professionnels' },
        { t: 'Ba entreprises oyo balingi qualité',    d: 'Pona bato nyonso oyo balingi kokóla na ndenge ya durée mpe kosala valeur ya solo' },
      ],
    },
    cta: {
      title: 'Bandá business na yo na qualité ya solo',
      sub: 'Tomba directement banda Allemagne',
      tag: 'Tonga confiance. Tonga avenir.',
      btn: 'Bandá na GermanLink Business',
      quote: 'GermanLink Business ezali lien direct entre Allemagne na Congo. Qualité ya solo. Confiance. Développement ya business mpe mboka.',
    },
    footer: { tag: 'Qualité ya Allemagne pona business ya Afrique', copy: '2026 GermanLink Business. Qualité ya Allemagne pona Congo.' },
  },
};

// ─── Helper: flag strip (3 couleurs) ─────────────────────────────────────────
const FlagStrip: React.FC<{ colors: string[]; w?: number; h?: number }> = ({ colors, w = 5, h = 20 }) => (
  <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
    {colors.map((c, i) => (
      <div key={i} style={{ width: w, height: h, background: c, borderRadius: 1 }} />
    ))}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onGetStarted }) => {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    const saved = localStorage.getItem('germanlink_language') as Language;
    if (saved && ['de', 'fr', 'ln'].includes(saved)) setLanguage(saved);
  }, []);

  const setLang = (l: Language) => {
    setLanguage(l);
    localStorage.setItem('germanlink_language', l);
  };

  const go = (view: string) => {
    if (onNavigate) onNavigate(view);
    else if (onGetStarted) onGetStarted();
  };

  const t = T[language];
  const s = { fontFamily: "'Segoe UI', sans-serif", background: '#0a1628', color: '#f5f2eb', overflowX: 'hidden' as const };

  return (
    <div style={s}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(7,16,32,0.97)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ height: 4, display: 'flex' }}>
          {['#000000','#DD0000','#FFCE00','#009A00','#FBDE2A','#007FFF'].map((c, i) => (
            <div key={i} style={{ flex: 1, background: c }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 4vw' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {['#000000','#DD0000','#FFCE00'].map((c, i) => (
                <div key={i} style={{ width: 9, height: 28, background: c, borderRadius: 2 }} />
              ))}
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 900, lineHeight: 1 }}>GLB</div>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#00e676', lineHeight: 1 }}>GermanLink Business</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 8, padding: 4 }}>
            {(['de','fr','ln'] as Language[]).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
                border: 'none', cursor: 'pointer',
                background: language === l ? '#DD0000' : 'transparent',
                color: language === l ? '#fff' : '#8fa3b8',
              }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section style={{ padding: '4rem 4vw 3rem', background: '#071020', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -60, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle,rgba(221,0,0,0.08) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,127,255,0.07) 0%,transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760 }}>
          <div style={{ fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#F4B400', fontWeight: 600, marginBottom: '0.6rem' }}>{t.tag}</div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(2rem,5vw,3.8rem)', fontWeight: 900, lineHeight: 1.08, margin: '0 0 0.3rem' }}>
            {t.hero.title}
          </h1>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(2rem,5vw,3.8rem)', fontWeight: 900, lineHeight: 1.08, margin: '0 0 1.2rem' }}>
            <span style={{ color: '#F4B400', fontStyle: 'italic' }}>{t.hero.accent}</span>
          </h1>
          <p style={{ fontSize: 'clamp(0.9rem,1.3vw,1.05rem)', color: '#8fa3b8', lineHeight: 1.75, maxWidth: 600, margin: '0 0 2rem' }}>{t.hero.sub}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.6rem' }}>
            {/* Badge 1 — DE flag dots */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.4rem 0.9rem', borderRadius: 20, fontSize: '0.78rem' }}>
              {['#000000','#DD0000','#FFCE00'].map((c,i) => <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }} />)}
              <span style={{ marginLeft: 4 }}>{t.hero.b1}</span>
            </div>
            {/* Badge 2 — CG green dot */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.4rem 0.9rem', borderRadius: 20, fontSize: '0.78rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#009A00', display: 'inline-block' }} />
              {t.hero.b2}
            </div>
            {/* Badge 3 — RDC blue dot */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.4rem 0.9rem', borderRadius: 20, fontSize: '0.78rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#007FFF', display: 'inline-block' }} />
              {t.hero.b3}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLÈME ───────────────────────────────────────────────────────── */}
      <section style={{ padding: '3rem 4vw', background: '#0a1628' }}>
        <div style={{ fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#DD0000', fontWeight: 600, marginBottom: '0.6rem' }}>{t.problem.tag}</div>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.5rem,2.5vw,2.3rem)', fontWeight: 900, margin: '0 0 0.6rem', color: '#f5f2eb' }}>{t.problem.title}</h2>
        <p style={{ color: '#8fa3b8', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.88rem', maxWidth: 580 }}>{t.problem.sub}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1.5rem' }}>
          {t.problem.cards.map((c: any, i: number) => (
            <div key={i} style={{ background: '#0a1628', padding: '1.8rem 1.5rem', borderTop: '3px solid #DD0000' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(221,0,0,0.15)', border: '1px solid #DD0000', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#DD0000' }}>{i + 1}</span>
              </div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.4rem', color: '#f5f2eb' }}>{c.t}</h3>
              <p style={{ fontSize: '0.78rem', color: '#8fa3b8', lineHeight: 1.6, margin: 0 }}>{c.d}</p>
            </div>
          ))}
        </div>
        <div style={{ background: '#DD0000', padding: '1.2rem 1.8rem', borderRadius: 4, fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' as const }}>
          {t.problem.conclusion}
        </div>
      </section>

      {/* ── SOLUTION ───────────────────────────────────────────────────────── */}
      <section style={{ padding: '3rem 4vw', background: '#071020' }}>
        <div style={{ fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#F4B400', fontWeight: 600, marginBottom: '0.6rem' }}>{t.solution.tag}</div>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.5rem,2.5vw,2.3rem)', fontWeight: 900, margin: '0 0 0.6rem', color: '#f5f2eb' }}>{t.solution.title}</h2>
        <p style={{ color: '#8fa3b8', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.88rem', maxWidth: 580 }}>{t.solution.sub}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
          {t.solution.features.map((f: any, i: number) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.8rem 1.5rem' }}>
              <div style={{ display: 'inline-flex', width: 32, height: 32, borderRadius: 4, background: `${SOL_COLORS[i]}22`, border: `1px solid ${SOL_COLORS[i]}`, alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: SOL_COLORS[i] }}>{String.fromCharCode(65 + i)}</span>
              </div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.4rem', color: '#f5f2eb' }}>{f.t}</h3>
              <p style={{ fontSize: '0.78rem', color: '#8fa3b8', lineHeight: 1.6, margin: 0 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION ────────────────────────────────────────────────────────── */}
      <section style={{ padding: '3rem 4vw', background: 'linear-gradient(135deg,#071a10 0%,#0a1628 50%,#071020 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,149,67,0.12) 0%,transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#5dcaa5', fontWeight: 600, marginBottom: '0.6rem' }}>{t.mission.tag}</div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.5rem,2.5vw,2.3rem)', fontWeight: 900, margin: '0 0 0.3rem', color: '#f5f2eb' }}>{t.mission.title}</h2>
          {t.mission.sub && <p style={{ color: '#8fa3b8', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.88rem' }}>{t.mission.sub}</p>}
          <p style={{ fontWeight: 700, color: '#FFCE00', fontSize: '0.9rem', marginBottom: '1rem', marginTop: '1rem' }}>{t.mission.when}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1.5rem' }}>
            {t.mission.cards.map((c: any, i: number) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', padding: '1.8rem 1.5rem' }}>
                <FlagStrip colors={MISS_FLAG_COLS[i]} w={4} h={18} />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.4rem', color: '#f5f2eb' }}>{c.t}</h3>
                <p style={{ fontSize: '0.78rem', color: '#8fa3b8', lineHeight: 1.6, margin: 0 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f5f2eb', textAlign: 'center' as const, padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, background: 'rgba(255,255,255,0.04)' }}>
            {t.mission.conclusion}
          </div>
        </div>
      </section>

      {/* ── POURQUOI ALLEMAGNE ─────────────────────────────────────────────── */}
      <section style={{ padding: '3rem 4vw', background: '#071020' }}>
        <div style={{ fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#F4B400', fontWeight: 600, marginBottom: '0.6rem' }}>{t.whyGermany.tag}</div>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.5rem,2.5vw,2.3rem)', fontWeight: 900, margin: '0 0 0.6rem', color: '#f5f2eb' }}>{t.whyGermany.title}</h2>
        <p style={{ color: '#8fa3b8', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '0.88rem' }}>{t.whyGermany.sub}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1.5rem' }}>
          {t.whyGermany.vals.map((v: string, i: number) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem 1rem', textAlign: 'center' as const, borderTop: `3px solid ${VAL_COLORS[i]}` }}>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.5rem', fontWeight: 900, color: VAL_COLORS[i], marginBottom: '0.3rem' }}>{v.charAt(0)}</div>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f5f2eb', margin: 0 }}>{v}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: '1rem' }}>
          {['#000000','#DD0000','#FFCE00'].map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
        </div>
        <p style={{ color: '#8fa3b8', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>{t.whyGermany.conclusion}</p>
      </section>

      {/* ── POUR QUI ───────────────────────────────────────────────────────── */}
      <section style={{ padding: '3rem 4vw', background: '#0a1628' }}>
        <div style={{ fontSize: '0.68rem', letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#007FFF', fontWeight: 600, marginBottom: '0.6rem' }}>{t.forWhom.tag}</div>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.5rem,2.5vw,2.3rem)', fontWeight: 900, margin: '0 0 1.5rem', color: '#f5f2eb' }}>{t.forWhom.title}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
          {t.forWhom.targets.map((tg: any, i: number) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem 1.5rem', borderLeft: `3px solid ${FW_COLORS[i]}` }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#f5f2eb' }}>{tg.t}</h3>
              <p style={{ fontSize: '0.8rem', color: '#8fa3b8', lineHeight: 1.65, margin: 0 }}>{tg.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section style={{ background: '#F4B400', textAlign: 'center' as const, padding: '3rem 4vw' }}>
        <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', maxWidth: 260, margin: '0 auto 1.5rem' }}>
          {['#000000','#DD0000','#FFCE00','#009A00','#FBDE2A','#007FFF'].map((c, i) => (
            <div key={i} style={{ flex: 1, background: c }} />
          ))}
        </div>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900, color: '#0a1628', margin: '0 0 0.5rem' }}>{t.cta.title}</h2>
        <p style={{ color: 'rgba(10,22,40,0.7)', fontSize: '0.95rem', margin: '0 auto 0.5rem', maxWidth: 460 }}>{t.cta.sub}</p>
        <p style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0a1628', margin: '0 auto 1.5rem' }}>{t.cta.tag}</p>
        <button
          onClick={() => go('dashboard')}
          style={{ background: '#0a1628', color: '#F4B400', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.06em', textTransform: 'uppercase' as const, padding: '0.9rem 2rem', border: 'none', borderRadius: 2, cursor: 'pointer', marginBottom: '1.5rem' }}
        >
          {t.cta.btn}
        </button>
        <div style={{ borderTop: '1px solid rgba(10,22,40,0.15)', paddingTop: '1rem', marginTop: '0.5rem' }}>
          <p style={{ fontSize: '0.82rem', color: 'rgba(10,22,40,0.6)', fontStyle: 'italic', margin: 0 }}>"{t.cta.quote}"</p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#050e1a', padding: '2rem 4vw', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {['#000000','#DD0000','#FFCE00'].map((c, i) => (
              <div key={i} style={{ width: 7, height: 22, background: c }} />
            ))}
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#f5f2eb' }}>GermanLink Business</span>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#8fa3b8', margin: '0 0 1rem' }}>{t.footer.tag}</p>
        <p style={{ fontSize: '0.75rem', color: '#8fa3b8', margin: 0, textAlign: 'center' as const }}>
          info@germanlinkbusiness.de &nbsp;|&nbsp; Made in Germany
        </p>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '1rem', paddingTop: '0.75rem', textAlign: 'center' as const }}>
          <p style={{ fontSize: '0.72rem', color: '#8fa3b8', margin: 0 }}>© {t.footer.copy}</p>
        </div>
      </footer>

    </div>
  );
};