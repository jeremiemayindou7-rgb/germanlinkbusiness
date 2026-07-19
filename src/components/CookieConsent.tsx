// ─── GermanLink Business – Cookie Consent (DSGVO/GDPR) ──────────────────────
// Zeigt beim ersten Besuch einen Cookie-Banner
// Speichert Einwilligung in localStorage NUR nach Zustimmung
// ── NEU: Microsoft Clarity wird nur bei Analytics-Einwilligung geladen ──────

import React, { useState, useEffect } from 'react';
import { X, Shield, ChevronDown } from 'lucide-react';
import { loadClarity, revokeClarity } from '../lib/clarity';

interface ConsentState {
  necessary: true;       // immer true, nicht änderbar
  functional: boolean;   // Spracheinstellung, Chat-Verlauf
  analytics: boolean;    // zukünftige Analytics
  timestamp: number;
  version: string;
}

const CONSENT_KEY   = 'glb_cookie_consent';
const CONSENT_VER   = '1.0';

const TEXTS = {
  de: {
    title:       'Datenschutz & Cookies',
    intro:       'Wir verwenden Cookies und ähnliche Technologien, um unsere Website zu betreiben und Ihr Erlebnis zu verbessern. Einige sind notwendig, andere helfen uns, die Website zu verbessern.',
    necessary:   'Notwendig',
    necessaryDesc:'Technisch erforderlich für den Betrieb der Website (Anmeldung, Sicherheit). Können nicht deaktiviert werden.',
    functional:  'Funktional',
    functionalDesc:'Speichern Ihre Einstellungen wie Sprache und Chat-Verlauf.',
    analytics:   'Analyse',
    analyticsDesc:'Helfen uns zu verstehen, wie die Website genutzt wird (keine persönlichen Daten).',
    acceptAll:   'Alle akzeptieren',
    acceptNec:   'Nur notwendige',
    customize:   'Anpassen',
    save:        'Auswahl speichern',
    privacy:     'Datenschutzerklärung',
    more:        'Mehr erfahren',
    badge:       'Diese Website verwendet Cookies gemäß DSGVO.',
  },
  fr: {
    title:       'Confidentialité & Cookies',
    intro:       'Nous utilisons des cookies pour faire fonctionner notre site et améliorer votre expérience. Certains sont nécessaires, d\'autres nous aident à améliorer le site.',
    necessary:   'Nécessaires',
    necessaryDesc:'Techniquement requis pour le fonctionnement du site (connexion, sécurité). Ne peuvent pas être désactivés.',
    functional:  'Fonctionnels',
    functionalDesc:'Sauvegardent vos préférences comme la langue et l\'historique de chat.',
    analytics:   'Analyse',
    analyticsDesc:'Nous aident à comprendre comment le site est utilisé (aucune donnée personnelle).',
    acceptAll:   'Tout accepter',
    acceptNec:   'Nécessaires seulement',
    customize:   'Personnaliser',
    save:        'Enregistrer la sélection',
    privacy:     'Politique de confidentialité',
    more:        'En savoir plus',
    badge:       'Ce site utilise des cookies conformément au RGPD.',
  },
  ln: {
    title:       'Bopeto & Cookies',
    intro:       'Tozali kosalela ba cookies po na kosalisa site na biso mpe kolamusaka experience na yo.',
    necessary:   'Ya kosengama',
    necessaryDesc:'Esengami techniquement po na site (kokota, sécurité). Ekoki kobimisama te.',
    functional:  'Ya mosala',
    functionalDesc:'Ebatelaka ba préférences na yo lokola monoko mpe historique ya chat.',
    analytics:   'Analyse',
    analyticsDesc:'Esalisaka biso koyeba ndenge site esalelami (data ya personel te).',
    acceptAll:   'Pona nyonso',
    acceptNec:   'Ya kosengama kaka',
    customize:   'Kobongola',
    save:        'Lobiko ya pona',
    privacy:     'Politique ya bopeto',
    more:        'Yeba koleka',
    badge:       'Site oyo esalela ba cookies selon RGPD.',
  },
};

// ── Helper: Consent holen ─────────────────────────────────────────────────────
export function getConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== CONSENT_VER) return null;
    return parsed;
  } catch { return null; }
}

export function hasConsent(type: 'functional' | 'analytics'): boolean {
  const c = getConsent();
  if (!c) return false;
  return c[type] === true;
}

// ── Component ─────────────────────────────────────────────────────────────────
interface CookieConsentProps {
  language?: 'de' | 'fr' | 'ln';
  onPrivacyClick?: () => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({
  language = 'fr',
  onPrivacyClick,
}) => {
  const [visible, setVisible]         = useState(false);
  const [expanded, setExpanded]       = useState(false);
  const [functional, setFunctional]   = useState(true);
  const [analytics, setAnalytics]     = useState(false);

  const t = TEXTS[language] || TEXTS.fr;

  useEffect(() => {
    const consent = getConsent();

    // ── NEU: Wiederkehrender Besucher, der bereits Analytics zugestimmt hat ──
    // → Clarity direkt beim Laden der Seite starten, Banner bleibt zu.
    if (consent?.analytics) {
      loadClarity();
    }

    // Erst nach kurzer Verzögerung anzeigen (bessere UX)
    const timer = setTimeout(() => {
      if (!consent) setVisible(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const saveConsent = (state: Omit<ConsentState, 'necessary' | 'timestamp' | 'version'>) => {
    const consent: ConsentState = {
      necessary:  true,
      functional: state.functional,
      analytics:  state.analytics,
      timestamp:  Date.now(),
      version:    CONSENT_VER,
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));

    // Falls functional abgelehnt: Chat-Verlauf löschen
    if (!state.functional) {
      localStorage.removeItem('chatbot_history');
      // Sprache darf bleiben (notwendig für UX)
    }

    // ── NEU: Microsoft Clarity je nach Analytics-Einwilligung starten/stoppen ──
    if (state.analytics) {
      loadClarity();
    } else {
      revokeClarity();
    }

    setVisible(false);
  };

  const acceptAll = () => saveConsent({ functional: true, analytics: true });
  const acceptNecessary = () => saveConsent({ functional: false, analytics: false });
  const saveSelection = () => saveConsent({ functional, analytics });

  if (!visible) return null;

  return (
    <>
      {/* Backdrop (leicht) */}
      <div className="fixed inset-0 bg-black/20 z-[90] pointer-events-none" />

      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[91] md:bottom-6 md:left-6 md:right-auto md:max-w-md">
        <div className="bg-white shadow-2xl md:rounded-2xl border border-gray-200 overflow-hidden">

          {/* Header */}
          <div className="bg-[#0A5EB0] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span className="font-bold text-sm">{t.title}</span>
            </div>
            <button
              onClick={acceptNecessary}
              className="p-1 hover:bg-white/20 rounded-lg transition"
              aria-label="Nur notwendige"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4">
            <p className="text-xs text-gray-600 leading-relaxed mb-4">{t.intro}</p>

            {/* Expanded: Kategorien */}
            {expanded && (
              <div className="space-y-3 mb-4 border border-gray-100 rounded-xl p-3 bg-gray-50">

                {/* Notwendig — immer an */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-900">{t.necessary}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{t.necessaryDesc}</p>
                  </div>
                  <div className="w-10 h-5 bg-[#009543] rounded-full flex-shrink-0 mt-0.5 cursor-not-allowed opacity-60" />
                </div>

                {/* Funktional */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-900">{t.functional}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{t.functionalDesc}</p>
                  </div>
                  <button
                    onClick={() => setFunctional(!functional)}
                    className={`w-10 h-5 rounded-full flex-shrink-0 mt-0.5 transition-colors relative ${functional ? 'bg-[#0A5EB0]' : 'bg-gray-300'}`}
                    aria-checked={functional}
                    role="switch"
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${functional ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>

                {/* Analytics */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-900">{t.analytics}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{t.analyticsDesc}</p>
                  </div>
                  <button
                    onClick={() => setAnalytics(!analytics)}
                    className={`w-10 h-5 rounded-full flex-shrink-0 mt-0.5 transition-colors relative ${analytics ? 'bg-[#0A5EB0]' : 'bg-gray-300'}`}
                    aria-checked={analytics}
                    role="switch"
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${analytics ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={acceptAll}
                className="w-full py-2.5 bg-[#0A5EB0] hover:bg-[#094da0] text-white rounded-xl font-bold text-sm transition"
              >
                {t.acceptAll}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={acceptNecessary}
                  className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition"
                >
                  {t.acceptNec}
                </button>

                {expanded ? (
                  <button
                    onClick={saveSelection}
                    className="flex-1 py-2 border border-[#0A5EB0] text-[#0A5EB0] hover:bg-blue-50 rounded-xl text-xs font-semibold transition"
                  >
                    {t.save}
                  </button>
                ) : (
                  <button
                    onClick={() => setExpanded(true)}
                    className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1"
                  >
                    {t.customize}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Privacy link */}
            <div className="mt-3 text-center">
              <button
                onClick={onPrivacyClick}
                className="text-[10px] text-gray-400 hover:text-[#0A5EB0] underline transition"
              >
                {t.privacy}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Cookie Settings Button (für Footer) ──────────────────────────────────────
export const CookieSettingsButton: React.FC<{
  language?: 'de' | 'fr' | 'ln';
  className?: string;
}> = ({ language = 'fr', className }) => {
  const labels = { de: 'Cookie-Einstellungen', fr: 'Paramètres cookies', ln: 'Ba paramètres ya cookies' };

  const reopen = () => {
    localStorage.removeItem(CONSENT_KEY);
    window.location.reload();
  };

  return (
    <button onClick={reopen} className={className || 'text-xs text-gray-400 hover:text-gray-600 underline'}>
      🍪 {labels[language] || labels.fr}
    </button>
  );
};

