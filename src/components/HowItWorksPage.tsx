// ─── GermanLink Business – HowItWorksPage ────────────────────────────────────
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
    subtitle: 'Der einfache Weg, Produkte aus Deutschland in den Kongo zu bestellen.',
    badge: 'Einfach · Sicher · Transparent',
    steps: [
      { icon: ShoppingBag, color: '#0A5EB0', bg: '#EFF6FF', title: 'Produkt auswählen', desc: 'Auf GLB findest du Produkte aus Deutschland – mit Preisen, Bildern und Beschreibungen in Deutsch, Französisch und Lingala. Wähle dein Produkt und sende deine Bestellung ab.' },
      { icon: MessageCircle, color: '#25D366', bg: '#F0FDF4', title: 'Unser Partner meldet sich', desc: 'Nach deiner Bestellung meldet sich unser Partner im Kongo per WhatsApp oder Telefon und schickt dir:', points: ['Deine Bestellnummer', 'Den Endpreis inklusive Transport und Steuern', 'Die voraussichtliche Lieferzeit', 'Die Zahlungsinformationen'] },
      { icon: Building2, color: '#F59E0B', bg: '#FFFBEB', title: 'Sichere Zahlung', desc: 'Du zahlst an unseren Partner im Kongo – per Überweisung, Einzahlung bei der Bank (u. a. UBA) oder Mobile Money.', points: ['Zahlung immer auf ein Firmenkonto, nie an Privatpersonen', 'Deine Bestellnummer als Verwendungszweck', 'Du erhältst eine Zahlungsbestätigung', 'Danach wird deine Ware in Deutschland bestellt'], note: '✅ Zahle nie bar an Dritte.' },
      { icon: Package, color: '#009543', bg: '#F0FDF4', title: 'Einkauf in Deutschland', desc: 'GLB kauft deine Ware bei Lieferanten in Deutschland und bereitet den Export vor.', points: ['Einkauf beim Lieferanten', 'Verpackung für den Export', 'Vorbereitung der Versandpapiere'], note: '📸 Auf Wunsch erhältst du Updates.' },
      { icon: Ship, color: '#0EA5E9', bg: '#F0F9FF', title: 'Versand in den Kongo', desc: 'GLB organisiert den Transport in den Kongo.', points: ['Sammeltransport im Container', 'Seefracht', 'Status-Updates während der Reise'], note: '📦 Du kannst den Status deiner Bestellung jederzeit einsehen.' },
      { icon: FileText, color: '#8B5CF6', bg: '#F5F3FF', title: 'Zoll & Import', desc: 'Unser Partner im Kongo übernimmt:', points: ['Zollformalitäten', 'Dokumente', 'Übernahme der Ware im Hafen'], note: '🛡️ Zölle und Steuern stehen in deiner Endrechnung.' },
      { icon: MapPin, color: '#EF4444', bg: '#FFF1F2', title: 'Lieferung im Kongo', desc: 'Nach der Zollfreigabe meldet sich unser Partner und vereinbart mit dir:', points: ['Abholung oder', 'Lieferung zu deinem Standort (je nach Stadt)'], note: '🤝 Du erhältst dein Produkt persönlich und bestätigst den Empfang.' },
      { icon: HeadphonesIcon, color: '#F59E0B', bg: '#FFFBEB', title: 'Kundensupport & Garantie', desc: 'Unser Partner und GLB begleiten dich auch nach der Lieferung.', points: ['Support bei Fragen', 'Garantie nach den Bedingungen des Herstellers', 'Hilfe bei zukünftigen Bestellungen'] },
    ],
    closing: '⭐ GLB – Einfach. Sicher. Transparent.',
    closingDesc: 'Die direkte Brücke zwischen Deutschland und dem Kongo.',
    closingBadge: 'Produkte aus Deutschland',
    tabProcess: 'Ablauf',
    tabImprint: 'Impressum',
    mediaTitle: '📸 Produktbereiche',
    mediaSubtitle: 'Beispielbilder',
    mediaRoute: '🚢 Deutschland → Kongo',
  },
  fr: {
    title: 'Comment fonctionne GermanLink Business',
    subtitle: 'La façon simple de commander des produits d’Allemagne au Congo.',
    badge: 'Simple · Sûr · Transparent',
    steps: [
      { icon: ShoppingBag, color: '#0A5EB0', bg: '#EFF6FF', title: 'Choisir un produit', desc: 'Sur GLB, vous trouvez des produits d’Allemagne – avec prix, images et descriptions en allemand, français et lingala. Choisissez votre produit et envoyez votre commande.' },
      { icon: MessageCircle, color: '#25D366', bg: '#F0FDF4', title: 'Notre partenaire vous contacte', desc: 'Après votre commande, notre partenaire au Congo vous contacte par WhatsApp ou téléphone et vous envoie :', points: ['Votre numéro de commande', 'Le prix final, transport et taxes compris', 'Le délai de livraison estimé', 'Les informations de paiement'] },
      { icon: Building2, color: '#F59E0B', bg: '#FFFBEB', title: 'Paiement sécurisé', desc: 'Vous payez notre partenaire au Congo – par virement, versement en banque (notamment UBA) ou Mobile Money.', points: ['Paiement toujours sur un compte de société, jamais à un particulier', 'Votre numéro de commande comme référence', 'Vous recevez une confirmation de paiement', 'Ensuite, votre marchandise est commandée en Allemagne'], note: '✅ Ne payez jamais en espèces à un tiers.' },
      { icon: Package, color: '#009543', bg: '#F0FDF4', title: 'Achat en Allemagne', desc: 'GLB achète votre marchandise auprès de fournisseurs en Allemagne et prépare l’export.', points: ['Achat auprès du fournisseur', 'Emballage pour l’export', 'Préparation des documents d’expédition'], note: '📸 Sur demande, vous recevez des mises à jour.' },
      { icon: Ship, color: '#0EA5E9', bg: '#F0F9FF', title: 'Expédition vers le Congo', desc: 'GLB organise le transport vers le Congo.', points: ['Transport groupé en conteneur', 'Fret maritime', 'Mises à jour pendant le voyage'], note: '📦 Vous pouvez consulter le statut de votre commande à tout moment.' },
      { icon: FileText, color: '#8B5CF6', bg: '#F5F3FF', title: 'Douane & importation', desc: 'Notre partenaire au Congo s’occupe de :', points: ['Formalités douanières', 'Documents', 'Prise en charge de la marchandise au port'], note: '🛡️ Les droits et taxes figurent sur votre facture finale.' },
      { icon: MapPin, color: '#EF4444', bg: '#FFF1F2', title: 'Livraison au Congo', desc: 'Après le dédouanement, notre partenaire vous contacte et convient avec vous :', points: ['D’un enlèvement ou', 'D’une livraison à votre adresse (selon la ville)'], note: '🤝 Vous recevez votre produit en personne et confirmez la réception.' },
      { icon: HeadphonesIcon, color: '#F59E0B', bg: '#FFFBEB', title: 'Support client & garantie', desc: 'Notre partenaire et GLB vous accompagnent aussi après la livraison.', points: ['Support pour vos questions', 'Garantie selon les conditions du fabricant', 'Aide pour vos prochaines commandes'] },
    ],
    closing: '⭐ GLB – Simple. Sûr. Transparent.',
    closingDesc: 'Le pont direct entre l’Allemagne et le Congo.',
    closingBadge: 'Produits d’Allemagne',
    tabProcess: 'Processus',
    tabImprint: 'Mentions légales',
    mediaTitle: '📸 Domaines de produits',
    mediaSubtitle: 'Images d’illustration',
    mediaRoute: '🚢 Allemagne → Congo',
  },
  ln: {
    title: 'Ndenge GermanLink Business esalaka',
    subtitle: 'Nzela ya pete ya kosomba biloko ya Allemagne pona Congo.',
    badge: 'Pete · Ya sécurité · Transparent',
    steps: [
      { icon: ShoppingBag, color: '#0A5EB0', bg: '#EFF6FF', title: 'Pona biloko', desc: 'Na GLB, okozwa biloko ya Allemagne – na ba prix, ba photo mpe ba ndimbola na Allemand, Français mpe Lingala. Pona biloko na yo mpe tinda commande na yo.' },
      { icon: MessageCircle, color: '#25D366', bg: '#F0FDF4', title: 'Partenaire na biso akobenga yo', desc: 'Nsima ya commande na yo, partenaire na biso na Congo akobenga yo na WhatsApp to na téléphone mpe akotindela yo:', points: ['Numéro ya commande na yo', 'Prix ya suka elongo na transport mpe taxes', 'Ntango ya livraison oyo etalelami', 'Makambo ya paiement'] },
      { icon: Building2, color: '#F59E0B', bg: '#FFFBEB', title: 'Paiement ya sécurité', desc: 'Ofutaka partenaire na biso na Congo – na virement, na banque (na kati na yango UBA) to na Mobile Money.', points: ['Paiement ntango nyonso na compte ya société, soki moke te na moto', 'Numéro ya commande na yo lokola référence', 'Okozwa confirmation ya paiement', 'Nsima, biloko na yo ekosombama na Allemagne'], note: '✅ Kofuta mbongo na maboko na moto mosusu te.' },
      { icon: Package, color: '#009543', bg: '#F0FDF4', title: 'Kosomba na Allemagne', desc: 'GLB esombaka biloko na yo epai ya ba fournisseurs na Allemagne mpe ebongisaka export.', points: ['Kosomba epai ya fournisseur', 'Kobamba pona export', 'Kobongisa ba documents ya envoi'], note: '📸 Soki olingi, okozwa ba mise à jour.' },
      { icon: Ship, color: '#0EA5E9', bg: '#F0F9FF', title: 'Envoi na Congo', desc: 'GLB ebongisaka transport na Congo.', points: ['Transport ya lisanga na container', 'Fret maritime', 'Ba mise à jour na nzela'], note: '📦 Okoki kotala état ya commande na yo ntango nyonso.' },
      { icon: FileText, color: '#8B5CF6', bg: '#F5F3FF', title: 'Douane & import', desc: 'Partenaire na biso na Congo asalaka:', points: ['Ba formalités ya douane', 'Ba documents', 'Kozwa biloko na port'], note: '🛡️ Ba droits mpe taxes ezali na facture na yo ya suka.' },
      { icon: MapPin, color: '#EF4444', bg: '#FFF1F2', title: 'Livraison na Congo', desc: 'Nsima ya douane, partenaire na biso akobenga yo mpe bokoyokana:', points: ['Kozwa yango yo moko to', 'Livraison epai na yo (selon ville)'], note: '🤝 Okozwa biloko na yo mpe okondimisa reception.' },
      { icon: HeadphonesIcon, color: '#F59E0B', bg: '#FFFBEB', title: 'Support ya clients & garantie', desc: 'Partenaire na biso mpe GLB bakolanda yo mpe nsima ya livraison.', points: ['Support pona mituna na yo', 'Garantie na conditions ya fabricant', 'Lisungi pona ba commande ya sima'] },
    ],
    closing: '⭐ GLB – Pete. Ya sécurité. Transparent.',
    closingDesc: 'Pont direct kati na Allemagne mpe Congo.',
    closingBadge: 'Biloko ya Allemagne',
    tabProcess: 'Ndenge esalaka',
    tabImprint: 'Makambo ya légal',
    mediaTitle: '📸 Ba domaines ya biloko',
    mediaSubtitle: 'Ba photo ya ndakisa',
    mediaRoute: '🚢 Allemagne → Congo',
  },
};

// ─── IMPRESSUM — Stand Oktober 2026 ──────────────────────────────────────────
// Plattformbetreiber: GermanLink Business GmbH i. G. (Deutschland).
// Partner Republik Kongo: GERMANLINK BUSINESS SARLU (Geschäftsbezeichnung GLB-Solar),
// rechtlich eigenständig.
const impressum = {
  de: {
    title: 'Impressum',
    sections: [
      {
        heading: '1. Allgemeine Angaben',
        lines: [
          'Marke: GermanLink Business (GLB)',
          'Die Plattform GLB wird von der GermanLink Business GmbH i. G. (Deutschland) betrieben.',
          'Verkauf, Rechnung und Übergabe im Kongo übernimmt der jeweilige Partner vor Ort, ein rechtlich eigenständiges Unternehmen.',
        ],
      },
      {
        heading: '2. Anbieter der Plattform (gemäß § 5 DDG)',
        lines: [
          'GermanLink Business GmbH i. G. (in Gründung)',
          'Burgwedeler Str. 156D, 30916 Isernhagen, Deutschland',
          'Vertreten durch den Geschäftsführer: Jérémie Mayindou',
          'Handelsregister: Die Eintragung erfolgt nach Abschluss der Gründung.',
          'USt-IdNr.: wird nach Erteilung ergänzt',
          'Mobil: +49 176 2289 6160',
          'Telefon: +49 511 4953 1791',
          'E-Mail: info_jmc@germanlinkbusiness.de',
        ],
      },
      {
        heading: '3. Partner in der Republik Kongo',
        lines: [
          'GERMANLINK BUSINESS SARLU (Geschäftsbezeichnung: GLB-Solar)',
          'Société à Responsabilité Limitée Unipersonnelle nach kongolesischem Recht',
          'Vertreten durch: Rebeca Bahoumina, Alleingesellschafterin und Geschäftsführerin',
          'Sitz: 336, rue Makita, Arrondissement 2 Bacongo, Brazzaville, Republik Kongo',
          'RCCM: wird nach Eintragung ergänzt',
          'Telefon / WhatsApp: +242 06 789 55 09',
          'E-Mail: info-glb-solar@gmail.com',
        ],
      },
      {
        heading: '4. Inhaltlich verantwortlich (gemäß § 18 Abs. 2 MStV)',
        lines: [
          'Jérémie Mayindou, Burgwedeler Str. 156D, 30916 Isernhagen, Deutschland',
        ],
      },
      {
        heading: '5. Allgemeiner Kontakt',
        lines: ['E-Mail: info@germanlinkbusiness.de', 'Telefon / WhatsApp: +242 06 789 55 09'],
      },
      {
        heading: 'Haftungsausschluss',
        lines: [
          'Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität können wir keine Gewähr übernehmen.',
          'Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.',
        ],
      },
      {
        heading: 'Urheberrecht',
        lines: ['Die erstellten Inhalte unterliegen dem deutschen Urheberrecht. Vervielfältigung bedarf der schriftlichen Zustimmung des Autors.'],
      },
      {
        heading: 'Datenschutz',
        lines: ['Verarbeitung personenbezogener Daten erfolgt auf freiwilliger Basis. Die Datenübertragung im Internet kann Sicherheitslücken aufweisen.'],
      },
    ],
  },
  fr: {
    title: 'Mentions légales',
    sections: [
      {
        heading: '1. Informations générales',
        lines: [
          'Marque : GermanLink Business (GLB)',
          'La plateforme GLB est exploitée par GermanLink Business GmbH i. G. (Allemagne).',
          'La vente, la facturation et la remise au Congo sont assurées par le partenaire local, une entreprise juridiquement indépendante.',
        ],
      },
      {
        heading: '2. Exploitant de la plateforme (§ 5 DDG, droit allemand)',
        lines: [
          'GermanLink Business GmbH i. G. (en cours d’immatriculation)',
          'Burgwedeler Str. 156D, 30916 Isernhagen, Allemagne',
          'Représentée par le gérant : Jérémie Mayindou',
          'Registre du commerce : l’immatriculation suivra la constitution.',
          'N° de TVA intracommunautaire : sera ajouté après attribution',
          'Mobile : +49 176 2289 6160',
          'Téléphone : +49 511 4953 1791',
          'E-mail : info_jmc@germanlinkbusiness.de',
        ],
      },
      {
        heading: '3. Partenaire en République du Congo',
        lines: [
          'GERMANLINK BUSINESS SARLU (enseigne : GLB-Solar)',
          'Société à Responsabilité Limitée Unipersonnelle de droit congolais',
          'Représentée par : Rebeca Bahoumina, associée unique et gérante',
          'Siège : 336, rue Makita, arrondissement 2 Bacongo, Brazzaville, République du Congo',
          'RCCM : sera ajouté après immatriculation',
          'Téléphone / WhatsApp : +242 06 789 55 09',
          'E-mail : info-glb-solar@gmail.com',
        ],
      },
      {
        heading: '4. Responsable du contenu (§ 18 al. 2 MStV)',
        lines: [
          'Jérémie Mayindou, Burgwedeler Str. 156D, 30916 Isernhagen, Allemagne',
        ],
      },
      {
        heading: '5. Contact général',
        lines: ['E-mail : info@germanlinkbusiness.de', 'Téléphone / WhatsApp : +242 06 789 55 09'],
      },
      {
        heading: 'Clause de non-responsabilité',
        lines: ["Le contenu de nos pages a été créé avec le plus grand soin. Nous ne pouvons garantir l'exactitude et l'actualité du contenu."],
      },
      {
        heading: "Droit d'auteur",
        lines: ["Le contenu est soumis au droit d'auteur allemand. La reproduction nécessite le consentement écrit de l'auteur."],
      },
      {
        heading: 'Protection des données',
        lines: ['Le traitement des données personnelles se fait sur une base volontaire.'],
      },
    ],
  },
  ln: {
    title: 'Makambo ya légal',
    sections: [
      {
        heading: '1. Makambo ya générale',
        lines: [
          'Marque : GermanLink Business (GLB)',
          'Plateforme GLB etambwisami na GermanLink Business GmbH i. G. (Allemagne).',
          'Koteka, facture mpe kopesa biloko na Congo esalemaka na partenaire ya mboka, entreprise oyo ezali na bonsomi na yango na loi.',
        ],
      },
      {
        heading: '2. Motambwisi ya plateforme (§ 5 DDG, mibeko ya Allemagne)',
        lines: [
          'GermanLink Business GmbH i. G. (ezali naino kokoma na registre)',
          'Burgwedeler Str. 156D, 30916 Isernhagen, Allemagne',
          'Emonisami na gérant : Jérémie Mayindou',
          'Registre ya commerce : ekosalema nsima ya constitution.',
          'Numéro ya TVA : ekobakisama nsima',
          'Mobile : +49 176 2289 6160',
          'Téléphone : +49 511 4953 1791',
          'E-mail : info_jmc@germanlinkbusiness.de',
        ],
      },
      {
        heading: '3. Partenaire na République du Congo',
        lines: [
          'GERMANLINK BUSINESS SARLU (enseigne : GLB-Solar)',
          'Société à Responsabilité Limitée Unipersonnelle na mibeko ya Congo',
          'Emonisami na : Rebeca Bahoumina, associée unique mpe gérante',
          'Siège : 336, rue Makita, arrondissement 2 Bacongo, Brazzaville, République du Congo',
          'RCCM : ekobakisama nsima ya immatriculation',
          'Téléphone / WhatsApp : +242 06 789 55 09',
          'E-mail : info-glb-solar@gmail.com',
        ],
      },
      {
        heading: '4. Responsable ya contenu (§ 18 al. 2 MStV)',
        lines: [
          'Jérémie Mayindou, Burgwedeler Str. 156D, 30916 Isernhagen, Allemagne',
        ],
      },
      {
        heading: '5. Contact',
        lines: ['E-mail : info@germanlinkbusiness.de', 'Téléphone / WhatsApp : +242 06 789 55 09'],
      },
      {
        heading: 'Responsabilité',
        lines: ['Makambo ya ba pages na biso esalemaki na bokebi mingi. Tokoki kondimisa te ete nyonso ezali ntango nyonso ya solo mpe ya sika.'],
      },
      {
        heading: "Droit d'auteur",
        lines: ['Makambo oyo ezali na se ya mibeko ya droit d’auteur ya Allemagne. Kozongela yango esengeli ndingisa ya écrit ya mokomi.'],
      },
      {
        heading: 'Protection ya données',
        lines: ['Traitement ya données ya bato esalemaka kaka soki bango moko balingi.'],
      },
    ],
  },
};

// ── Thema: Solaranlage · Traktor · Industriebackofen · Agrarpumpe ──────────
// Eigene Fotos: gleichen Dateinamen in /public/media/ ersetzen → auto-update
const MEDIA_IMAGES = [
  {
    src: '/media/delivery-1.jpg',
    fallback: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80',
    label: 'Solaranlage',
  },
  {
    src: '/media/delivery-2.jpg',
    fallback: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80',
    label: 'Traktor',
  },
  {
    src: '/media/delivery-3.jpg',
    fallback: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    label: 'Industriebackofen',
  },
  {
    src: '/media/delivery-4.jpg',
    fallback: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80',
    label: 'Agrarpumpe',
  },
  {
    src: '/media/delivery-5.jpg',
    fallback: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80',
    label: 'Feldarbeit',
  },
  {
    src: '/media/delivery-6.jpg',
    fallback: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=80',
    label: 'Solar Afrika',
  },
];

interface HowItWorksPageProps {
  initialTab?: 'process' | 'impressum';
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ initialTab = 'process' }) => {
  const { language } = useLanguage();
  const lang = (language as Lang) || 'fr';
  const [tab, setTab] = useState<'process' | 'impressum'>(initialTab);

  const c = content[lang];
  const imp = impressum[lang];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tabs */}
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

        {/* ── PROZESS TAB ── */}
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
                <div className="flex items-center gap-2 text-sm"><Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFCE00]" /><span className="font-semibold">{c.closingBadge}</span></div>
                <div className="flex items-center gap-2 text-sm"><Globe className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFCE00]" /><span className="font-semibold">Congo · Allemagne</span></div>
              </div>
            </div>
          </>
        )}

        {/* ── IMPRESSUM TAB ── */}
        {tab === 'impressum' && (
          <>
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
                © {new Date().getFullYear()} GermanLink Business GmbH i. G. · info@germanlinkbusiness.de
              </div>
            </div>

            {/* ── MEDIA GALLERY — aktuelle Lieferungen ── */}
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-[#009543] rounded-full flex-shrink-0" />
                <h2 className="text-base sm:text-lg font-black text-gray-900">{c.mediaTitle}</h2>
                <span className="ml-auto text-xs text-gray-400 italic whitespace-nowrap">{c.mediaSubtitle}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 grid-rows-2 gap-2 sm:gap-3" style={{ height: 320 }}>

                <div className="row-span-2 rounded-2xl overflow-hidden bg-gray-100 relative group">
                  <img
                    src={`${MEDIA_IMAGES[0].src}?v=${Date.now()}`}
                    alt={MEDIA_IMAGES[0].label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = MEDIA_IMAGES[0].fallback; }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs font-bold text-center">{MEDIA_IMAGES[0].label}</p>
                  </div>
                </div>

                <div className="row-span-2 rounded-2xl overflow-hidden bg-gray-100 relative group">
                  <img
                    src={`${MEDIA_IMAGES[1].src}?v=${Date.now()}`}
                    alt={MEDIA_IMAGES[1].label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = MEDIA_IMAGES[1].fallback; }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs font-bold text-center">{MEDIA_IMAGES[1].label}</p>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden bg-gray-100 relative group">
                  <img
                    src={`${MEDIA_IMAGES[2].src}?v=${Date.now()}`}
                    alt={MEDIA_IMAGES[2].label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = MEDIA_IMAGES[2].fallback; }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs font-bold text-center">{MEDIA_IMAGES[2].label}</p>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden bg-gray-100 relative group">
                  <img
                    src={`${MEDIA_IMAGES[3].src}?v=${Date.now()}`}
                    alt={MEDIA_IMAGES[3].label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = MEDIA_IMAGES[3].fallback; }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs font-bold text-center">{MEDIA_IMAGES[3].label}</p>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden bg-gray-100 relative group">
                  <img
                    src={`${MEDIA_IMAGES[4].src}?v=${Date.now()}`}
                    alt={MEDIA_IMAGES[4].label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = MEDIA_IMAGES[4].fallback; }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs font-bold text-center">{MEDIA_IMAGES[4].label}</p>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden bg-gray-100 relative group">
                  <img
                    src={`${MEDIA_IMAGES[5].src}?v=${Date.now()}`}
                    alt={MEDIA_IMAGES[5].label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = MEDIA_IMAGES[5].fallback; }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs font-bold text-center">{MEDIA_IMAGES[5].label}</p>
                  </div>
                </div>

              </div>

              <p className="text-center text-xs text-gray-400 mt-3">{c.mediaRoute}</p>
            </div>
          </>
        )}

      </div>
    </div>
  );
};


