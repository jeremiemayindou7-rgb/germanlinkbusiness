// ─── GermanLink Business – HowItWorksPage ────────────────────────────────────
// Nutzt useLanguage() aus dem globalen Context – KEIN eigener Sprachumschalter
import React, { useState } from 'react';
import {
  ShoppingBag, MessageCircle, Building2, Package,
  Ship, FileText, MapPin, HeadphonesIcon, Star, Shield, Globe,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type Lang = 'de' | 'fr' | 'ln';

const content = {
  de: {
    title: 'So funktioniert GermanLink Business',
    subtitle: 'Der einfachste Weg, Qualitätsprodukte aus Deutschland sicher in den Congo zu bestellen.',
    badge: 'Einfach · Sicher · Transparent',
    steps: [
      { icon: ShoppingBag, color: '#0A5EB0', bg: '#EFF6FF', title: 'Produkt auswählen', desc: 'Auf GLB findest du geprüfte Produkte aus Deutschland – mit klaren Preisen, Bildern und Beschreibungen in Deutsch, Französisch und Lingala. Wähle dein Produkt und bestätige deine Bestellung mit deiner Telefonnummer.' },
      { icon: MessageCircle, color: '#25D366', bg: '#F0FDF4', title: 'Bestellbestätigung per WhatsApp', desc: 'Nach deiner Bestellung meldet sich ein GLB-Agent aus Brazzaville oder Kinshasa direkt bei dir.', points: ['Deine Bestellnummer', 'Den Gesamtpreis', 'Die voraussichtliche Lieferzeit', 'Alle Informationen zur Zahlung'] },
      { icon: Building2, color: '#F59E0B', bg: '#FFFBEB', title: 'Sichere Zahlung bei der UBA-Bank', desc: 'GLB arbeitet mit der UBA-Bank zusammen, um maximale Sicherheit zu garantieren.', points: ['Du triffst den GLB-Agenten bei der UBA-Bank', 'Du zahlst direkt am Schalter oder per Mobile Money → UBA', 'Deine Zahlung wird sofort bestätigt', 'Erst danach wird dein Produkt in Deutschland gekauft'], note: '✅ Keine Betrugsgefahr – volle Transparenz.' },
      { icon: Package, color: '#009543', bg: '#F0FDF4', title: 'Einkauf & Qualitätsprüfung in Deutschland', desc: 'Nach der Zahlung übernimmt GLB alles für dich.', points: ['Einkauf beim deutschen Händler', 'Qualitätskontrolle', 'Verpackung für den Export', 'Vorbereitung der Versandpapiere'], note: '📸 Du erhältst auf Wunsch Fotos und Updates.' },
      { icon: Ship, color: '#0EA5E9', bg: '#F0F9FF', title: 'Versand nach Congo', desc: 'GLB organisiert den kompletten Transport.', points: ['Sammeltransport', 'Containerverladung', 'Verschiffung nach Pointe-Noire oder Matadi', 'Tracking-Updates während der Reise'], note: '📦 Du kannst jederzeit den Status deiner Bestellung einsehen.' },
      { icon: FileText, color: '#8B5CF6', bg: '#F5F3FF', title: 'Zollabwicklung & Import', desc: 'GLB kümmert sich um:', points: ['Zollformalitäten', 'Gebühren', 'Dokumente', 'Entladung im Hafen'], note: '🛡️ Du musst dich um nichts kümmern – wir erledigen alles.' },
      { icon: MapPin, color: '#EF4444', bg: '#FFF1F2', title: 'Lieferung im Congo', desc: 'Nach der Zollfreigabe kontaktiert dich dein GLB-Agent und vereinbart:', points: ['Abholung oder', 'Lieferung bis zu deinem Standort (je nach Stadt)'], note: '🤝 Du erhältst dein Produkt persönlich und bestätigst den Empfang.' },
      { icon: HeadphonesIcon, color: '#F59E0B', bg: '#FFFBEB', title: 'Kundensupport & Garantie', desc: 'GLB begleitet dich auch nach der Lieferung.', points: ['Support bei Fragen', 'Garantieinformationen (falls vorhanden)', 'Hilfe bei zukünftigen Bestellungen'] },
    ],
    closing: '⭐ GLB – Einfach. Sicher. Transparent.',
    closingDesc: 'Die direkte Brücke zwischen Deutschland und dem Congo.',
    tabProcess: 'Ablauf',
    tabImprint: 'Impressum',
  },
  fr: {
    title: 'Comment fonctionne GermanLink Business',
    subtitle: 'La façon la plus simple de commander des produits de qualité depuis l\'Allemagne vers le Congo en toute sécurité.',
    badge: 'Simple · Sûr · Transparent',
    steps: [
      { icon: ShoppingBag, color: '#0A5EB0', bg: '#EFF6FF', title: 'Choisir un produit', desc: 'Sur GLB, vous trouverez des produits vérifiés d\'Allemagne – avec des prix clairs, des images et des descriptions en allemand, français et lingala. Choisissez votre produit et confirmez votre commande avec votre numéro de téléphone.' },
      { icon: MessageCircle, color: '#25D366', bg: '#F0FDF4', title: 'Confirmation de commande par WhatsApp', desc: 'Après votre commande, un agent GLB de Brazzaville ou Kinshasa vous contacte directement.', points: ['Votre numéro de commande', 'Le prix total', 'Le délai de livraison estimé', 'Toutes les informations de paiement'] },
      { icon: Building2, color: '#F59E0B', bg: '#FFFBEB', title: 'Paiement sécurisé à la banque UBA', desc: 'GLB travaille avec la banque UBA pour garantir une sécurité maximale.', points: ['Vous retrouvez l\'agent GLB à la banque UBA', 'Vous payez directement au guichet ou par Mobile Money → UBA', 'Votre paiement est confirmé immédiatement', 'Ensuite seulement, votre produit est acheté en Allemagne'], note: '✅ Aucun risque de fraude – transparence totale.' },
      { icon: Package, color: '#009543', bg: '#F0FDF4', title: 'Achat & contrôle qualité en Allemagne', desc: 'Après le paiement, GLB s\'occupe de tout pour vous.', points: ['Achat chez le commerçant allemand', 'Contrôle qualité', 'Emballage pour l\'export', 'Préparation des documents d\'expédition'], note: '📸 Vous recevez des photos et mises à jour sur demande.' },
      { icon: Ship, color: '#0EA5E9', bg: '#F0F9FF', title: 'Expédition vers le Congo', desc: 'GLB organise le transport complet.', points: ['Transport groupé', 'Chargement en conteneur', 'Expédition vers Pointe-Noire ou Matadi', 'Mises à jour de suivi pendant le voyage'], note: '📦 Vous pouvez consulter le statut de votre commande à tout moment.' },
      { icon: FileText, color: '#8B5CF6', bg: '#F5F3FF', title: 'Dédouanement & importation', desc: 'GLB s\'occupe de :', points: ['Formalités douanières', 'Frais', 'Documents', 'Déchargement au port'], note: '🛡️ Vous n\'avez rien à faire – nous nous occupons de tout.' },
      { icon: MapPin, color: '#EF4444', bg: '#FFF1F2', title: 'Livraison au Congo', desc: 'Après le dédouanement, votre agent GLB vous contacte et convient :', points: ['D\'un enlèvement ou', 'D\'une livraison à votre adresse (selon la ville)'], note: '🤝 Vous recevez votre produit en personne et confirmez la réception.' },
      { icon: HeadphonesIcon, color: '#F59E0B', bg: '#FFFBEB', title: 'Support client & garantie', desc: 'GLB vous accompagne même après la livraison.', points: ['Support pour vos questions', 'Informations de garantie (si disponible)', 'Aide pour les futures commandes'] },
    ],
    closing: '⭐ GLB – Simple. Sûr. Transparent.',
    closingDesc: 'Le pont direct entre l\'Allemagne et le Congo.',
    tabProcess: 'Processus',
    tabImprint: 'Mentions légales',
  },
  ln: {
    title: 'Ndenge GermanLink Business esalaka',
    subtitle: 'Nzela ya pete koleka ya kosomba biloko ya malamu banda Allemagne na sécurité epai ya Congo.',
    badge: 'Pete · Ya sécurité · Transparent',
    steps: [
      { icon: ShoppingBag, color: '#0A5EB0', bg: '#EFF6FF', title: 'Pona biloko', desc: 'Na GLB, okozwa biloko oyo batalami banda Allemagne – na ba prix ya polele, ba photo mpe ba ndimbola na Allemand, Français mpe Lingala. Pona biloko na yo mpe kofirme commande na yo na numéro ya telefone na yo.' },
      { icon: MessageCircle, color: '#25D366', bg: '#F0FDF4', title: 'Confirmation ya commande na WhatsApp', desc: 'Nsima ya commande na yo, agent ya GLB banda Brazzaville to Kinshasa akokutana na yo directement.', points: ['Numéro ya commande na yo', 'Prix mobimba', 'Ntango ya livraison oyo etalelami', 'Makambo nyonso ya paiement'] },
      { icon: Building2, color: '#F59E0B', bg: '#FFFBEB', title: 'Paiement ya sécurité na banque UBA', desc: 'GLB esalaka na banque UBA pona kolandela sécurité ya likolo.', points: ['Okutanaka na agent ya GLB na banque UBA', 'Ofutaka directement na guichet to na Mobile Money → UBA', 'Paiement na yo ekomisama sikoyo', 'Kaka nsima, biloko na yo ezali kosomba na Allemagne'], note: '✅ Likama ya lokuta ezali te – transparence mobimba.' },
      { icon: Package, color: '#009543', bg: '#F0FDF4', title: 'Kosomba & contrôle ya qualité na Allemagne', desc: 'Nsima ya paiement, GLB ekobeba nyonso pona yo.', points: ['Kosomba epai ya commerçant ya Allemagne', 'Contrôle ya qualité', 'Kobamba pona export', 'Kobongisa ba documents ya envoi'], note: '📸 Okozwa ba photo mpe ba mise à jour soki olingi.' },
      { icon: Ship, color: '#0EA5E9', bg: '#F0F9FF', title: 'Envoi epai ya Congo', desc: 'GLB ebongisaka transport mobimba.', points: ['Transport ya lisanga', 'Kotia na container', 'Expédition epai ya Pointe-Noire to Matadi', 'Ba mise à jour ya tracking pendant voyage'], note: '📦 Okoki kotala état ya commande na yo ntango nyonso.' },
      { icon: FileText, color: '#8B5CF6', bg: '#F5F3FF', title: 'Douane & import', desc: 'GLB ekobeba:', points: ['Ba formalités ya douane', 'Ba frais', 'Ba documents', 'Kobima na port'], note: '🛡️ Osengeli kosala eloko te – biso tokoloba nyonso.' },
      { icon: MapPin, color: '#EF4444', bg: '#FFF1F2', title: 'Livraison na Congo', desc: 'Nsima ya douane, agent ya GLB na yo akokutana na yo mpe bakofuta:', points: ['Kolata to', 'Livraison epai na yo (selon ville)'], note: '🤝 Okozwa biloko na yo mpe okofirme reception.' },
      { icon: HeadphonesIcon, color: '#F59E0B', bg: '#FFFBEB', title: 'Support ya clients & garantie', desc: 'GLB ekolanda yo mpe nsima ya livraison.', points: ['Support pona ba pertanyaan na yo', 'Makambo ya garantie (soki ezali)', 'Lisungi pona ba commande ya sima'] },
    ],
    closing: '⭐ GLB – Pete. Ya sécurité. Transparent.',
    closingDesc: 'Pont direct entre Allemagne na Congo.',
    tabProcess: 'Ndenge esalaka',
    tabImprint: 'Makambo ya légal',
  },
};

const impressum = {
  de: {
    title: 'Impressum',
    sections: [
      { heading: '1. Allgemeine Unternehmensangaben', lines: ['GermanLink Business (GLB)', 'Logistik, Import, Einkauf und Koordination Deutschland–Afrika', 'Inhaber: Rebeca Bahoumina & Jérémie Mayindou'] },
      { heading: '2. Firmensitz – Republik Kongo (Kongo-Brazzaville)', lines: ['Adresse: 68, rue Raymond-Paillet, Bacongo, Brazzaville, Republik Kongo', 'Telefon: +242 53312060', 'E-Mail: info@germanlinkbusiness.de', '──────────────────────────────', 'Koordinatorin – Demokratische Republik Kongo: Angele K', 'Telefon: +243 533320604', 'E-Mail: info_ak@germanlinkbusiness.de'] },
      { heading: '3. Rechtliche Angaben – Deutschland (gemäß § 5 TMG)', lines: ['IT & Koordination Deutschland: Jérémie Mayindou', 'Telefon: +49 176 22896160', 'E-Mail: info_jmc@germanlinkbusiness.de', 'Weitere E-Mail: kizomba-global-post@web.de'] },
      { heading: '4. Inhaltlich Verantwortliche (gemäß § 55 Abs. 2 RStV)', lines: ['Verantwortlich für den Inhalt: Rebeca Bahoumina & Jérémie Mayindou'] },
      { heading: '5. Allgemeiner Kontakt', lines: ['E-Mail: info@germanlinkbusiness.de', 'Telefon: +242 53312060'] },
      { heading: 'Haftungsausschluss', lines: ['Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität können wir keine Gewähr übernehmen.', 'Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte verantwortlich.'] },
      { heading: 'Urheberrecht', lines: ['Die erstellten Inhalte unterliegen dem deutschen Urheberrecht. Vervielfältigung bedarf der schriftlichen Zustimmung des Autors.'] },
      { heading: 'Datenschutz', lines: ['Verarbeitung personenbezogener Daten erfolgt auf freiwilliger Basis. Die Datenübertragung im Internet kann Sicherheitslücken aufweisen.'] },
    ],
  },
  fr: {
    title: 'Mentions légales',
    sections: [
      { heading: '1. Informations générales sur l\'entreprise', lines: ['GermanLink Business (GLB)', 'Services logistiques, importation, achat et coordination Allemagne–Afrique', 'Propriétaires : Rebeca Bahoumina & Jérémie Mayindou'] },
      { heading: '2. Siège social – République du Congo (Congo-Brazzaville)', lines: ['Adresse : 68, rue Raymond-Paillet, Bacongo, Brazzaville, République du Congo', 'Téléphone : +242 53312060', 'E-mail : info@germanlinkbusiness.de', '──────────────────────────────', 'Responsable Coordinateur – République Démocratique du Congo : Angele K', 'Téléphone : +243 533320604', 'E-mail : info_ak@germanlinkbusiness.de'] },
      { heading: '3. Informations légales – Allemagne (conformément au § 5 TMG)', lines: ['IT & Coordination Allemagne : Jérémie Mayindou', 'Téléphone : +49 176 22896160', 'E-mail : info_jmc@germanlinkbusiness.de', 'E-mail supplémentaire : kizomba-global-post@web.de'] },
      { heading: '4. Responsables du contenu (conformément au § 55 Abs. 2 RStV)', lines: ['Responsables du contenu : Rebeca Bahoumina & Jérémie Mayindou'] },
      { heading: '5. Contact général', lines: ['E-mail : info@germanlinkbusiness.de', 'Téléphone : +242 53312060'] },
      { heading: 'Clause de non-responsabilité', lines: ['Le contenu de nos pages a été créé avec le plus grand soin. Nous ne pouvons garantir l\'exactitude et l\'actualité du contenu.'] },
      { heading: 'Droit d\'auteur', lines: ['Le contenu est soumis au droit d\'auteur allemand. La reproduction nécessite le consentement écrit de l\'auteur.'] },
      { heading: 'Protection des données', lines: ['Le traitement des données personnelles se fait sur une base volontaire.'] },
    ],
  },
  ln: {
    title: 'Makambo ya légal',
    sections: [
      { heading: '1. Makambo ya générale ya société', lines: ['GermanLink Business (GLB)', 'Ba services ya logistique, importation, kosomba mpe coordination Allemagne–Afrique', 'Ba propriétaires : Rebeca Bahoumina & Jérémie Mayindou'] },
      { heading: '2. Siège ya société – République du Congo (Congo-Brazzaville)', lines: ['Adresse : 68, rue Raymond-Paillet, Bacongo, Brazzaville, République du Congo', 'Téléphone : +242 53312060', 'E-mail : info@germanlinkbusiness.de', '──────────────────────────────', 'Coordinateur – République Démocratique du Congo : Angele K', 'Téléphone : +243 533320604', 'E-mail : info_ak@germanlinkbusiness.de'] },
      { heading: '3. Makambo ya légal – Allemagne (§ 5 TMG)', lines: ['IT & Coordination Allemagne : Jérémie Mayindou', 'Téléphone : +49 176 22896160', 'E-mail : info_jmc@germanlinkbusiness.de', 'E-mail ya lisusu : kizomba-global-post@web.de'] },
      { heading: '4. Ba responsables ya contenu (§ 55 Abs. 2 RStV)', lines: ['Ba responsables ya contenu : Rebeca Bahoumina & Jérémie Mayindou'] },
      { heading: '5. Contact ya générale', lines: ['E-mail : info@germanlinkbusiness.de', 'Téléphone : +242 53312060'] },
      { heading: 'Limitation ya responsabilité', lines: ['Ba contenu ya ba pages na biso esalelaki na nzela ya mokwa. Kasi tokoki kotia garantie te pona exactitude ya ba contenu.'] },
      { heading: 'Droit d\'auteur', lines: ['Ba contenu oyo basalaki ekomani na ba lois ya Allemagne. Kobongola esengeli libula ya écrit ya auteur.'] },
      { heading: 'Protection ya ba données', lines: ['Kosalela site na biso ekotelemi mingi te na kopesa ba données ya personnel. Esalelaka na bolutu.'] },
    ],
  },
};

interface HowItWorksPageProps {
  initialTab?: 'process' | 'impressum';
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ initialTab = 'process' }) => {
  // ── Globale Sprache nutzen statt eigener State ────────────────────────────
  const { language } = useLanguage();
  const lang = (language as Lang) || 'fr';
  const [tab, setTab] = useState<'process' | 'impressum'>(initialTab);

  const c = content[lang];
  const imp = impressum[lang];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Tabs (kein eigener Sprachumschalter!) ───────────────────────── */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-2 sm:gap-6">
            <button
              onClick={() => setTab('process')}
              className={`py-3 px-2 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                tab === 'process' ? 'border-[#009543] text-[#009543]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🌍 {c.tabProcess}
            </button>
            <button
              onClick={() => setTab('impressum')}
              className={`py-3 px-2 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                tab === 'impressum' ? 'border-[#009543] text-[#009543]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📄 {c.tabImprint}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-10">

        {/* ── PROZESS TAB ───────────────────────────────────────────────── */}
        {tab === 'process' && (
          <>
            <div className="text-center mb-8 sm:mb-12">
              <span className="inline-block bg-[#009543] text-white text-xs font-bold px-4 py-1.5 rounded-full mb-3">
                {c.badge}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-3 leading-tight px-2">
                🌍 {c.title}
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-2">
                {c.subtitle}
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {c.steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6">
                      <div className="flex-shrink-0 flex flex-col items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-black text-white"
                          style={{ background: step.color }}>
                          {i + 1}
                        </div>
                        {i < c.steps.length - 1 && <div className="w-0.5 h-4 sm:h-6 bg-gray-200 rounded" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: step.bg }}>
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: step.color }} />
                          </div>
                          <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 leading-tight">{step.title}</h3>
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">{step.desc}</p>
                        {(step as any).points && (
                          <ul className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-3">
                            {(step as any).points.map((p: string, pi: number) => (
                              <li key={pi} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                                <span className="mt-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                                  style={{ background: step.color }}>✓</span>
                                {p}
                              </li>
                            ))}
                          </ul>
                        )}
                        {(step as any).note && (
                          <div className="text-xs sm:text-sm font-semibold rounded-lg px-2 sm:px-3 py-1.5 sm:py-2"
                            style={{ background: step.bg, color: step.color }}>
                            {(step as any).note}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 sm:mt-12 bg-gradient-to-br from-[#009543] to-[#007535] text-white rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
              <Star className="w-8 h-8 sm:w-10 sm:h-10 text-[#FFCE00] mx-auto mb-3 sm:mb-4" />
              <h2 className="text-xl sm:text-2xl font-black mb-2">{c.closing}</h2>
              <p className="text-sm sm:text-lg text-white/90">{c.closingDesc}</p>
              <div className="flex justify-center gap-4 sm:gap-6 mt-4 sm:mt-6 flex-wrap">
                <div className="flex items-center gap-2 text-sm"><Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFCE00]" /><span className="font-semibold">Made in Germany</span></div>
                <div className="flex items-center gap-2 text-sm"><Globe className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFCE00]" /><span className="font-semibold">Congo · Allemagne</span></div>
              </div>
            </div>
          </>
        )}

        {/* ── IMPRESSUM TAB ─────────────────────────────────────────────── */}
        {tab === 'impressum' && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-6 sm:mb-8 pb-4 border-b">
              📄 {imp.title}
            </h1>
            <div className="space-y-6 sm:space-y-8">
              {imp.sections.map((section, i) => (
                <div key={i} className={i < 5 ? 'bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100' : ''}>
                  <h2 className={`text-sm sm:text-base font-bold mb-2 sm:mb-3 ${i < 5 ? 'text-[#009543]' : 'text-[#0A5EB0]'}`}>
                    {section.heading}
                  </h2>
                  <div className="space-y-1.5 sm:space-y-2">
                    {section.lines.map((line, li) => (
                      <p key={li} className={`text-xs sm:text-sm leading-relaxed ${
                        line.startsWith('──') ? 'text-gray-300 my-1' : 'text-gray-700'
                      }`}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t text-center text-xs text-gray-400">
              © {new Date().getFullYear()} GermanLink Business · info@germanlinkbusiness.de
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

