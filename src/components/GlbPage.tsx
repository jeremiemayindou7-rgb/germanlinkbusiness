import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface GlbPageProps {
  onBack: () => void;
}

type Language = 'de' | 'fr' | 'ln' | 'en';

const translations = {
  de: {
    back: 'Zurück zur Startseite',
    eyebrow: 'Über die Marke',
    h1: 'GLB – GermanLink Business',
    intro: 'GLB steht für GermanLink Business.',
    body: 'GermanLink Business ist ein deutsches Unternehmen mit dem Ziel, deutsche Technologien, Produkte und Geschäftsmöglichkeiten mit Märkten und Geschäftspartnern in Zentralafrika zu verbinden.',
    body2: 'Wir schaffen eine Verbindung zwischen deutschen Lieferanten und afrikanischen Märkten und unterstützen den gesamten Prozess — von der Produktpräsentation und Beschaffung über Logistik und Lieferung bis zur Rechnungs- und Zahlungsabwicklung.',
    tagline: 'Deutschland ↔ Zentralafrika · Energie · Technologie · Handel · Logistik',
  },
  fr: {
    back: "Retour à l'accueil",
    eyebrow: 'À propos de la marque',
    h1: 'GLB – GermanLink Business',
    intro: 'GLB signifie GermanLink Business.',
    body: "GermanLink Business est une entreprise allemande dont l'objectif est de connecter les technologies, produits et opportunités d'affaires allemands avec les marchés et partenaires d'Afrique centrale.",
    body2: "Nous créons un lien entre les fournisseurs allemands et les marchés africains, et accompagnons tout le processus — de la présentation des produits et de l'approvisionnement à la logistique et la livraison, jusqu'à la facturation et au paiement.",
    tagline: 'Allemagne ↔ Afrique centrale · Énergie · Technologie · Commerce · Logistique',
  },
  ln: {
    back: 'Zonga na ndako',
    eyebrow: 'Mpo na marque',
    h1: 'GLB – GermanLink Business',
    intro: 'GLB elakisi GermanLink Business.',
    body: 'GermanLink Business ezali entreprise ya Allemagne oyo elingi kokangisa ba technologies, biloko mpe ba opportunités ya business ya Allemagne na ba marchés mpe ba partenaires ya Afrique centrale.',
    body2: 'Tozali kosala boyokani kati na ba fournisseurs ya Allemagne mpe ba marchés ya Afrique, mpe kosunga processus mobimba — banda présentation ya biloko tii logistique, livraison, facture mpe paiement.',
    tagline: 'Allemagne ↔ Afrique centrale · Énergie · Technologie · Commerce · Logistique',
  },
  en: {
    back: 'Back to home',
    eyebrow: 'About the brand',
    h1: 'GLB – GermanLink Business',
    intro: 'GLB stands for GermanLink Business.',
    body: 'GermanLink Business is a German company with the goal of connecting German technologies, products, and business opportunities with markets and business partners in Central Africa.',
    body2: 'We create a link between German suppliers and African markets and support the entire process — from product presentation and sourcing to logistics and delivery, through to invoicing and payment.',
    tagline: 'Germany ↔ Central Africa · Energy · Technology · Trade · Logistics',
  },
};

export const GlbPage: React.FC<GlbPageProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const lang = ((language as Language) && translations[language as Language]) ? (language as Language) : 'de';
  const t = translations[lang];

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: '#0a1628', color: '#f5f2eb',
      minHeight: '100vh', padding: '0 4vw',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', paddingTop: '3rem', paddingBottom: '4rem' }}>
        <button
          onClick={onBack}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#8fa3b8', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '2rem' }}
        >
          <ArrowLeft size={16} /> {t.back}
        </button>

        <div style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#F4B400', fontWeight: 700, marginBottom: '0.8rem' }}>
          {t.eyebrow}
        </div>

        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, marginBottom: '1.2rem', lineHeight: 1.1 }}>
          {t.h1}
        </h1>

        <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F4B400', marginBottom: '1.2rem' }}>
          {t.intro}
        </p>

        <p style={{ color: '#c9d3dc', lineHeight: 1.8, fontSize: '1rem', marginBottom: '1.2rem' }}>
          {t.body}
        </p>

        <p style={{ color: '#c9d3dc', lineHeight: 1.8, fontSize: '1rem', marginBottom: '2rem' }}>
          {t.body2}
        </p>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.2rem',
          fontSize: '0.85rem', color: '#8fa3b8', letterSpacing: '0.02em',
        }}>
          {t.tagline}
        </div>
      </div>
    </div>
  );
};

