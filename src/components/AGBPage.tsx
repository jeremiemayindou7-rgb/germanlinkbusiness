import { ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

type Language = 'de' | 'fr' | 'ln';

export default function AGBPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [language, setLanguage] = useState<Language>('de');

  useEffect(() => {
    const savedLang = localStorage.getItem('agb_lang') as Language;
    if (savedLang && ['de', 'fr', 'ln'].includes(savedLang)) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('agb_lang', lang);
  };

  const content = {
    de: {
      title: 'ALLGEMEINE GESCHÄFTSBEDINGUNGEN',
      company: 'GermanLink Business (GLB)',
      subtitle: 'Zahlungs- und Lieferbedingungen · Stand: Juli 2026',
      infoBox: {
        title: 'Wichtige Informationen',
        scope: 'Deutschland und Demokratische Republik Kongo (DRK)',
        payment: 'Banküberweisung via Finom · Agent-Zahlung via UBA Bank (Kongo)',
        delivery: '4–8 Wochen (internationaler Versand)',
        parties: 'GermanLink Business (GLB) (Anbieter) und Käufer (Kunde)'
      },
      footer: 'Stand: Juli 2026'
    },
    fr: {
      title: 'CONDITIONS GÉNÉRALES DE VENTE (CGV)',
      company: 'GermanLink Business (GLB)',
      subtitle: 'Conditions de paiement et de livraison · Version : Juillet 2026',
      infoBox: {
        title: 'Informations importantes',
        scope: 'Allemagne et République Démocratique du Congo (RDC)',
        payment: 'Virement bancaire via Finom · Paiement par agent via UBA Bank (Congo)',
        delivery: '4 à 8 semaines (livraison internationale)',
        parties: 'GermanLink Business (GLB) (Prestataire) et l\'Acheteur (Client)'
      },
      footer: 'Version : Juillet 2026'
    },
    ln: {
      title: 'MIBEKO YA BOZWI MPE KOTINDELA',
      company: 'GermanLink Business (GLB)',
      subtitle: 'Mibeko ya kobiya mpé kotinda biloko · Tango: Yuli 2026',
      infoBox: {
        title: 'Informations ya ntina',
        scope: 'Allemagne mpe Republique Democratique ya Congo (RDC)',
        payment: 'Virement via Finom · Kobiya na agent na Banque UBA (Congo)',
        delivery: 'Mpoka 4 tii 8 (livraison internationale)',
        parties: 'GermanLink Business (GLB) (Mosalisi) mpe Mobii (Client)'
      },
      footer: 'Tango: Yuli 2026'
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 md:py-12">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-12">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {t.title}
          </h1>
          <p className="text-lg text-gray-600 mb-1">{t.company}</p>
          <p className="text-sm text-gray-500 mb-6">
            {t.subtitle}
          </p>

          <div className="flex items-center justify-center space-x-2 mb-8">
            <button
              onClick={() => changeLanguage('de')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                language === 'de'
                  ? 'bg-[#009543] text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              DE
            </button>
            <button
              onClick={() => changeLanguage('fr')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                language === 'fr'
                  ? 'bg-[#009543] text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => changeLanguage('ln')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                language === 'ln'
                  ? 'bg-[#009543] text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              LN
            </button>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r">
            <h3 className="font-semibold text-gray-900 mb-3">{t.infoBox.title}</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><strong>{language === 'de' ? 'Geltungsbereich' : language === 'fr' ? 'Champ d\'application' : 'Esalemi wapi'}:</strong> {t.infoBox.scope}</li>
              <li><strong>{language === 'de' ? 'Zahlungsmethoden' : language === 'fr' ? 'Modes de paiement' : 'Ndenge ya kobiya'}:</strong> {t.infoBox.payment}</li>
              <li><strong>{language === 'de' ? 'Lieferzeit' : language === 'fr' ? 'Délai de livraison' : 'Tango ya kolawa biloko'}:</strong> {t.infoBox.delivery}</li>
              <li><strong>{language === 'de' ? 'Vertragspartner' : language === 'fr' ? 'Parties contractantes' : 'Bato ya kontara'}:</strong> {t.infoBox.parties}</li>
            </ul>
          </div>

          {language === 'de' && <GermanContent />}
          {language === 'fr' && <FrenchContent />}
          {language === 'ln' && <LingalaContent />}

          <div className="border-t pt-6 mt-12">
            <p className="text-center text-gray-600 font-medium">
              {t.footer}
            </p>
          </div>
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
          aria-label="Nach oben scrollen"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

function GermanContent() {
  return (
    <>
      <section className="mb-8">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">§ 1 Geltungsbereich und Vertragspartner</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB") gelten
            für alle Verträge, die über die digitale Plattform von GermanLink
            Business GmbH (nachfolgend "Anbieter") zwischen dem Anbieter und dem
            Kunden (nachfolgend "Käufer") abgeschlossen werden.
          </p>
          <p>
            <strong>(2)</strong> Der Anbieter ist: GermanLink Business (GLB) mit Sitz in
            Brazzaville, Republik Kongo (Congo-Brazzaville), vertreten durch die
            Inhaberin und den Inhaber Rebeca Bahoumina und Jérémie Mayindou
            (Jérémie MC). Die Koordination sowie die Zahlungsabwicklung für den
            deutschen Markt erfolgen über das in Deutschland geführte
            Einzelunternehmen (Kleingewerbe, nicht im Handelsregister
            eingetragen) „KizGP“, Inhaber: Jérémie Mayindou. Alle Anfragen
            richten Sie bitte über die in der App angegebenen Kontaktdaten an uns.
          </p>
          <p>
            <strong>(3)</strong> Die AGB gelten in der zum Zeitpunkt der Bestellung gültigen
            Fassung. Entgegenstehende oder abweichende Bedingungen des Käufers
            werden nicht anerkannt, es sei denn, der Anbieter stimmt ihrer Geltung
            ausdrücklich schriftlich zu.
          </p>
          <p>
            <strong>(4)</strong> Verbraucher im Sinne dieser AGB ist jede natürliche Person,
            die ein Rechtsgeschäft zu Zwecken abschließt, die überwiegend weder
            ihrer gewerblichen noch ihrer selbständigen beruflichen Tätigkeit
            zugerechnet werden können (§ 13 BGB).
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 2 Vertragsschluss</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Die Darstellung von Produkten im Online-Shop stellt kein rechtlich
            bindendes Angebot dar, sondern einen unverbindlichen Katalog. Die
            Bestellung des Käufers ist ein verbindliches Angebot zum Abschluss
            eines Kaufvertrags.
          </p>
          <p>
            <strong>(2)</strong> Nach Eingang der Bestellung erhält der Käufer eine automatische
            Bestellbestätigung per E-Mail mit der eindeutigen Bestellnummer
            (Format: CEE-XXXXXXXXXX-XXXXXX). Diese Bestätigung stellt noch keine
            Annahme des Angebots dar.
          </p>
          <p>
            <strong>(3)</strong> Der Kaufvertrag kommt zustande, sobald der Anbieter die Bestellung
            durch eine separate Auftragsbestätigungs-E-Mail oder durch Bestätigung
            des Zahlungseingangs ausdrücklich annimmt. Der Anbieter behält sich
            vor, einzelne Bestellungen ohne Angabe von Gründen abzulehnen.
          </p>
          <p>
            <strong>(4)</strong> Die Vertragssprachen sind Deutsch, Französisch und Lingala.
            Der Vertragstext wird vom Anbieter nicht gesondert gespeichert.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 3 Zahlungsbedingungen</h2>

        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.1 Verfügbare Zahlungsoptionen</h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Der Käufer hat bei Bestellabschluss die Wahl zwischen zwei Zahlungsoptionen:
          </p>
          <ul className="list-disc ml-8 space-y-1">
            <li><strong>Vollzahlung:</strong> 100 % des Gesamtbetrags werden vor Versand entrichtet.</li>
            <li><strong>Anzahlung (Teilzahlung):</strong> 50 % vor Versand; 50 % bei Lieferung.</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.2 Zahlungsmethode A – Banküberweisung via Finom</h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Empfänger und vollständige Kontodaten (IBAN/BIC) werden dem
            Käufer nach Bestellabschluss persönlich per E-Mail in der
            Auftragsbestätigung mitgeteilt. Zahlungsdienstleister: Finom.
            Verwendungszweck (OBLIGATORISCH): Ihre Bestellnummer.
          </p>
          <p>
            <strong>(2)</strong> Der korrekte Verwendungszweck (Bestellnummer) ist zwingend
            erforderlich. Fehlt er, kann die Zahlung nicht zugeordnet werden.
          </p>
          <p>
            <strong>(3)</strong> Die Zahlung gilt als eingegangen, sobald der Betrag vollständig
            gutgeschrieben wurde.
          </p>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.3 Zahlungsmethode B – Agent-Zahlung via UBA Bank (DRK)</h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Für Kunden in der Demokratischen Republik Kongo steht die
            Agent-Zahlung über UBA Bank zur Verfügung.
          </p>
          <p>
            <strong>(2)</strong> Ablauf:
          </p>
          <ul className="list-disc ml-8 space-y-1">
            <li>Käufer gibt Mobiltelefonnummer bei Bestellung an.</li>
            <li>Agent meldet sich innerhalb 24 Stunden.</li>
            <li>Gemeinsamer Gang zur UBA-Bank-Filiale.</li>
            <li>Einzahlung mit Bestellnummer als Referenz.</li>
            <li>Agent bestätigt Transaktion gegenüber Anbieter.</li>
          </ul>
          <p>
            <strong>(3)</strong> Die Zahlung gilt als eingegangen nach interner Bestätigung
            durch den Anbieter.
          </p>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.4 Verwahrung des Zahlungsbetrags</h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Der Betrag verbleibt bis zur erfolgten Lieferung beim
            Zahlungsdienstleister (Finom / UBA Bank).
          </p>
          <p>
            <strong>(2)</strong> Der Käufer hat keinen Anspruch auf Verzinsung des Betrags.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 4 Lieferbedingungen und Lieferfristen</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Lieferung ausschließlich an die vom Käufer angegebene Adresse.
          </p>
          <p>
            <strong>(2)</strong> Lieferzeit: 4 bis 8 Wochen nach Zahlungsbestätigung.
            Diese Frist ist eine Schätzung; kein verbindlicher Liefertermin.
          </p>
          <p>
            <strong>(3)</strong> Die Lieferfrist beginnt mit dem Tag der Zahlungsbestätigung.
          </p>
          <p>
            <strong>(4)</strong> Übergabe an Transportdienstleister = Lieferpflicht erfüllt;
            Risiko geht auf Käufer über.
          </p>
          <p>
            <strong>(5)</strong> Nach Versand erhält der Käufer eine Versandbestätigungs-E-Mail
            mit Tracking-Informationen.
          </p>
          <p>
            <strong>(6)</strong> Teillieferungen sind zulässig, sofern zumutbar.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 5 Lieferverzögerungen</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Verzögerungen können entstehen durch: Zollbehörden, Streiks,
            höhere Gewalt, behördliche Maßnahmen, Logistikpartner.
          </p>
          <p>
            <strong>(2)</strong> Befindet sich die Ware auf dem Transportweg oder kann der
            Anbieter in zumutbarer Zeit liefern, besteht kein Anspruch auf
            Rückerstattung wegen der Verzögerung allein.
          </p>
          <p>
            <strong>(3)</strong> Bei Verzögerungen über 2 Wochen über das obere Ende der
            Lieferfrist informiert der Anbieter per E-Mail.
          </p>
          <p>
            <strong>(4)</strong> Die gesetzlichen Rechte des Käufers nach §§ 280, 286, 323 BGB
            bleiben unberührt. Nach Setzen einer angemessenen Nachfrist und
            deren fruchtlosem Ablauf kann der Verbraucher vom Vertrag zurücktreten,
            sofern die Lieferung nicht erfolgt ist.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4 rounded-r">
            <p className="text-sm font-medium text-yellow-900">
              <strong>Hinweis:</strong> Eine Verzögerung begründet für sich allein keinen
              Rückerstattungsanspruch, solange die Lieferung möglich und aktiv
              betrieben wird.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 6 Rückerstattungsregelung</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Rückerstattung wird ausschließlich gewährt bei:
          </p>
          <ul className="list-disc ml-8 space-y-1">
            <li>Dauerhafter Unmöglichkeit der Lieferung ohne Verschulden des Käufers.</li>
            <li>Verlust oder Zerstörung der Ware ohne Nachweismöglichkeit.</li>
            <li>Stornierung durch den Anbieter aus eigenem Verschulden.</li>
            <li>Anordnung durch Gericht oder Behörde.</li>
          </ul>
          <p className="mt-4">
            <strong>(2)</strong> Kein Anspruch auf Rückerstattung bei:
          </p>
          <ul className="list-disc ml-8 space-y-1">
            <li>Ware ist auf dem Transportweg.</li>
            <li>Verzögerung liegt innerhalb der 8-Wochen-Frist.</li>
            <li>Verzögerung durch höhere Gewalt, Zoll, Streik.</li>
            <li>Fehlerhafte Lieferadresse durch den Käufer.</li>
            <li>Fehlende Referenznummer bei der Überweisung.</li>
          </ul>
          <p className="mt-4">
            <strong>(3)</strong> Rückerstattungen erfolgen innerhalb von 14 Werktagen
            auf den Ursprungszahlungsweg.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 7 Widerrufsrecht (Verbraucher)</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Verbrauchern steht das gesetzliche Widerrufsrecht zu
            (§ 312g i.V.m. Art. 246a EGBGB). Die Widerrufsbelehrung wird
            bei Vertragsschluss gesondert bereitgestellt.
          </p>
          <p>
            <strong>(2)</strong> Das Widerrufsrecht erlischt bei individuell gefertigten
            oder hygienisch sensiblen Waren.
          </p>
          <p>
            <strong>(3)</strong> Im Fall eines wirksamen Widerrufs werden alle geleisteten
            Zahlungen einschließlich Lieferkosten erstattet.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 8 Eigentumsvorbehalt</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Die Ware bleibt bis zur vollständigen Bezahlung Eigentum
            des Anbieters.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 9 Gewährleistung</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Es gelten die gesetzlichen Gewährleistungsrechte (§§ 434 ff. BGB).
          </p>
          <p>
            <strong>(2)</strong> Sichtbare Mängel sind innerhalb von 5 Werktagen nach Lieferung
            schriftlich zu melden.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 10 Haftungsbeschränkung</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Unbeschränkte Haftung für Schäden an Leben, Körper,
            Gesundheit sowie bei Vorsatz und grober Fahrlässigkeit.
          </p>
          <p>
            <strong>(2)</strong> Bei einfacher Fahrlässigkeit: Haftung nur bei Verletzung
            von Kardinalpflichten, begrenzt auf vorhersehbaren Schaden.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 11 Datenschutz</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Verarbeitung personenbezogener Daten gemäß DSGVO.
            Details in der Datenschutzerklärung der App.
          </p>
          <p>
            <strong>(2)</strong> Telefonnummern für Agent-Zahlung werden ausschließlich
            zur Zahlungs- und Lieferkoordination genutzt.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 12 Streitbeilegung und anwendbares Recht</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts.
          </p>
          <p>
            <strong>(2)</strong> Zwingende Verbraucherschutzvorschriften des Aufenthaltsstaats
            bleiben unberührt.
          </p>
          <p>
            <strong>(3)</strong> OS-Plattform der EU:{' '}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            <br />
            Wir nehmen nicht an Verbraucherschlichtungsverfahren teil.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 13 Schlussbestimmungen</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Unwirksame Klauseln werden durch gesetzliche Regelungen ersetzt.
          </p>
          <p>
            <strong>(2)</strong> AGB-Änderungen mit 4 Wochen Frist per E-Mail.
            Kein Widerspruch = Zustimmung.
          </p>
          <p>
            <strong>(3)</strong> Gültig ab Datum der Veröffentlichung in der App.
          </p>
        </div>
      </section>
    </>
  );
}

function FrenchContent() {
  return (
    <>
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 1 Champ d'application et parties contractantes</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Les présentes Conditions Générales de Vente (ci-après "CGV")
            s'appliquent à tous les contrats conclus via la plateforme numérique
            de GermanLink Business (GLB) (ci-après "Prestataire") entre le
            Prestataire et le client (ci-après "Acheteur").
          </p>
          <p>
            <strong>(2)</strong> Le Prestataire est : GermanLink Business (GLB), dont le
            siège social se trouve à Brazzaville, République du Congo
            (Congo-Brazzaville), représenté par les propriétaires Rebeca
            Bahoumina et Jérémie Mayindou (Jérémie MC). La coordination ainsi
            que le traitement des paiements pour le marché allemand sont
            assurés par l'entreprise individuelle (micro-entreprise, non
            inscrite au registre du commerce) « KizGP », dirigée en Allemagne
            par Jérémie Mayindou. Pour toute question, veuillez nous contacter
            via les coordonnées indiquées dans l'application.
          </p>
          <p>
            <strong>(3)</strong> Les CGV s'appliquent dans la version en vigueur au moment de
            la commande. Les conditions contraires ou divergentes de l'Acheteur
            ne sont pas reconnues, sauf accord écrit exprès du Prestataire.
          </p>
          <p>
            <strong>(4)</strong> Est considéré comme consommateur toute personne physique
            concluant un acte juridique à des fins non commerciales
            (§ 13 du Code civil allemand BGB).
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 2 Conclusion du contrat</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> La présentation des produits dans la boutique en ligne
            ne constitue pas une offre juridiquement contraignante,
            mais un catalogue non contraignant. La commande de l'Acheteur
            constitue une offre ferme de conclure un contrat d'achat.
          </p>
          <p>
            <strong>(2)</strong> Après réception de la commande, l'Acheteur reçoit une
            confirmation automatique par e-mail avec le numéro de commande
            unique (format : CEE-XXXXXXXXXX-XXXXXX). Cette confirmation
            ne constitue pas encore une acceptation de l'offre.
          </p>
          <p>
            <strong>(3)</strong> Le contrat est conclu lorsque le Prestataire accepte
            expressément la commande par un e-mail de confirmation
            ou par la confirmation du paiement reçu. Le Prestataire
            se réserve le droit de refuser des commandes sans justification.
          </p>
          <p>
            <strong>(4)</strong> Les langues contractuelles sont l'allemand, le français
            et le lingala. Le texte du contrat n'est pas conservé
            séparément par le Prestataire.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 3 Conditions de paiement</h2>

        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.1 Options de paiement disponibles</h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> L'Acheteur a le choix entre deux options de paiement :
          </p>
          <ul className="list-disc ml-8 space-y-1">
            <li><strong>Paiement intégral :</strong> 100 % du montant total avant expédition.</li>
            <li><strong>Acompte :</strong> 50 % avant expédition ; 50 % à la livraison.</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.2 Mode de paiement A – Virement bancaire via Finom</h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Le bénéficiaire et les coordonnées bancaires complètes
            (IBAN/BIC) sont communiqués personnellement à l'Acheteur par e-mail
            dans la confirmation de commande. Prestataire de paiement : Finom.
            Référence (OBLIGATOIRE) : Votre numéro de commande.
          </p>
          <p>
            <strong>(2)</strong> La référence (numéro de commande) est obligatoire.
            Sans elle, le paiement ne peut pas être associé à la commande.
          </p>
          <p>
            <strong>(3)</strong> Le paiement est considéré reçu dès crédit complet du montant.
          </p>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.3 Mode de paiement B – Paiement par agent via UBA Bank (RDC)</h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Pour les clients en République Démocratique du Congo,
            le paiement via agent UBA Bank est disponible.
          </p>
          <p>
            <strong>(2)</strong> Procédure :
          </p>
          <ul className="list-disc ml-8 space-y-1">
            <li>L'Acheteur indique son numéro de téléphone lors de la commande.</li>
            <li>Un agent GermanLink le contacte dans les 24 heures.</li>
            <li>Rendez-vous commun à une agence UBA Bank.</li>
            <li>Dépôt avec le numéro de commande comme référence.</li>
            <li>L'agent confirme la transaction au Prestataire.</li>
          </ul>
          <p>
            <strong>(3)</strong> Le paiement est considéré reçu après confirmation interne
            par le Prestataire.
          </p>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.4 Conservation du montant payé</h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Le montant versé reste chez le prestataire de paiement
            (Finom / UBA Bank) jusqu'à la livraison effectuée.
          </p>
          <p>
            <strong>(2)</strong> L'Acheteur n'a pas droit à des intérêts sur le montant versé.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 4 Conditions et délais de livraison</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Livraison uniquement à l'adresse indiquée par l'Acheteur.
          </p>
          <p>
            <strong>(2)</strong> Délai de livraison : 4 à 8 semaines après confirmation
            du paiement. Ce délai est une estimation ; pas de date garantie.
          </p>
          <p>
            <strong>(3)</strong> Le délai commence à partir du jour de confirmation du paiement.
          </p>
          <p>
            <strong>(4)</strong> La remise au transporteur constitue l'exécution
            de l'obligation de livraison ; le risque passe à l'Acheteur.
          </p>
          <p>
            <strong>(5)</strong> Après expédition, l'Acheteur reçoit un e-mail de confirmation
            avec les informations de suivi disponibles.
          </p>
          <p>
            <strong>(6)</strong> Les livraisons partielles sont autorisées si raisonnables.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 5 Retards de livraison</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Des retards peuvent survenir en raison de : douanes,
            grèves, force majeure, mesures administratives, partenaires
            logistiques.
          </p>
          <p>
            <strong>(2)</strong> Si la marchandise est en transit ou si le Prestataire
            peut livrer dans un délai raisonnable, l'Acheteur n'a pas
            droit au remboursement du seul fait du retard.
          </p>
          <p>
            <strong>(3)</strong> En cas de retard de plus de 2 semaines au-delà du délai
            maximum, le Prestataire informe l'Acheteur par e-mail.
          </p>
          <p>
            <strong>(4)</strong> Les droits légaux de l'Acheteur selon les §§ 280, 286,
            323 BGB restent inchangés. Après mise en demeure sans effet,
            le consommateur peut se rétracter si la livraison n'a pas eu lieu.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4 rounded-r">
            <p className="text-sm font-medium text-yellow-900">
              <strong>Note importante :</strong> Un retard seul ne justifie pas un remboursement
              tant que la livraison est possible et en cours.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 6 Politique de remboursement</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Remboursement accordé uniquement si :
          </p>
          <ul className="list-disc ml-8 space-y-1">
            <li>Impossibilité définitive de livraison sans faute de l'Acheteur.</li>
            <li>Perte ou destruction prouvée de la marchandise.</li>
            <li>Annulation par le Prestataire pour une raison lui incombant.</li>
            <li>Décision d'un tribunal ou d'une autorité compétente.</li>
          </ul>
          <p className="mt-4">
            <strong>(2)</strong> Pas de remboursement si :
          </p>
          <ul className="list-disc ml-8 space-y-1">
            <li>La marchandise est en transit.</li>
            <li>Le retard est dans le délai de 8 semaines.</li>
            <li>Retard dû à la force majeure, la douane ou une grève.</li>
            <li>Adresse de livraison incorrecte fournie par l'Acheteur.</li>
            <li>Référence manquante lors du virement.</li>
          </ul>
          <p className="mt-4">
            <strong>(3)</strong> Les remboursements sont effectués sous 14 jours ouvrés
            vers le moyen de paiement d'origine.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 7 Droit de rétractation (consommateurs)</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Les consommateurs bénéficient du droit légal de rétractation
            (§ 312g BGB). Les instructions détaillées sont fournies
            séparément lors de la conclusion du contrat.
          </p>
          <p>
            <strong>(2)</strong> Le droit de rétractation s'éteint pour les articles
            personnalisés ou sensibles à l'hygiène.
          </p>
          <p>
            <strong>(3)</strong> En cas de rétractation valide, tous les paiements
            effectués, y compris les frais de livraison, sont remboursés.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 8 Réserve de propriété</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> La marchandise reste propriété du Prestataire jusqu'au
            paiement intégral du prix d'achat.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 9 Garantie légale</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Les droits légaux de garantie s'appliquent (§§ 434 ss. BGB).
          </p>
          <p>
            <strong>(2)</strong> Les défauts visibles doivent être signalés par écrit
            dans les 5 jours ouvrés suivant la livraison.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 10 Limitation de responsabilité</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Responsabilité illimitée pour atteinte à la vie,
            au corps, à la santé, et en cas de dol ou faute grave.
          </p>
          <p>
            <strong>(2)</strong> En cas de faute légère : responsabilité limitée
            aux dommages prévisibles en cas de violation d'obligations essentielles.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 11 Protection des données</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Traitement des données personnelles conforme au RGPD.
            Détails dans la politique de confidentialité de l'application.
          </p>
          <p>
            <strong>(2)</strong> Les numéros de téléphone collectés pour le paiement
            par agent sont utilisés uniquement pour la coordination
            du paiement et de la livraison.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 12 Règlement des litiges et droit applicable</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Le droit allemand s'applique, à l'exclusion de la
            Convention de Vienne sur la vente internationale.
          </p>
          <p>
            <strong>(2)</strong> Les dispositions impératives de protection du consommateur
            du pays de résidence restent applicables.
          </p>
          <p>
            <strong>(3)</strong> Plateforme de règlement en ligne de l'UE :{' '}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            <br />
            Nous ne participons pas aux procédures de médiation.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 13 Dispositions finales</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Les clauses invalides sont remplacées par les dispositions légales.
          </p>
          <p>
            <strong>(2)</strong> Modifications des CGV avec préavis de 4 semaines par e-mail.
            Absence d'opposition = acceptation.
          </p>
          <p>
            <strong>(3)</strong> Applicable à compter de la date de publication dans l'application.
          </p>
        </div>
      </section>
    </>
  );
}

function LingalaContent() {
  return (
    <>
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 1 Wapi mibeko oyo esalema</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Mibeko oyo (tokobenga "Mibeko") esalema mpo na makontara
            nyonso oyo esalemaka na platforme ya GermanLink Business (GLB)
            (tokobenga "Mosalisi") na kati ya Mosalisi mpe client
            (tokobenga "Mobii").
          </p>
          <p>
            <strong>(2)</strong> Mosalisi azali: GermanLink Business (GLB), siège na yango
            ezali na Brazzaville, République du Congo. Ba propriétaires:
            Rebeca Bahoumina na Jérémie Mayindou (Jérémie MC). Na Allemagne,
            travail ya coordination na kobiya esalemaka na entreprise
            individuelle « KizGP » (ezali te na registre ya commerce),
            oyo Jérémie Mayindou azali kotambwisa. Tuna biso na adresse
            oyo ezali na application.
          </p>
          <p>
            <strong>(3)</strong> Mibeko oyo esalema na version oyo ezali na tango
            ya commande. Mosalisi akosangisa mibeko oyo te
            soki akomeli ye na ndenge ya écriture.
          </p>
          <p>
            <strong>(4)</strong> Client (consommateur) azali moto nyonso oyo abii
            biloko mpo na mposa na ye moko, kaka te mpo na mosala
            ya bizinesi (§ 13 BGB).
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 2 Ndenge kontara esalemaka</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Kolakisa biloko na boutique ezali te offre ya loi,
            kaka catalogue ya informations. Commande ya Mobii
            ezali offre ya kosala kontara ya kozwa biloko.
          </p>
          <p>
            <strong>(2)</strong> Soki commande eyei, Mobii akozwa email ya confirmation
            na numéro ya commande (format: CEE-XXXXXXXXXX-XXXXXX).
            Email oyo ezali te encore acceptation.
          </p>
          <p>
            <strong>(3)</strong> Kontara esalemaka soki Mosalisi asangisi commande
            na email ya confirmation to na soki azali kopesa
            confirmation ya kobiya. Mosalisi akoki kotika commande
            to koboya yango sans explication.
          </p>
          <p>
            <strong>(4)</strong> Maloba ya kontara: Allemand, Français mpe Lingala.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 3 Mibeko ya kobiya</h2>

        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.1 Ndenge ya kobiya</h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Mobii akoki kopona kati na:
          </p>
          <ul className="list-disc ml-8 space-y-1">
            <li><strong>Kobiya nyonso:</strong> 100% ya prix liboso ya kotindela.</li>
            <li><strong>Kobiya ndambu:</strong> 50% liboso ya kotindela; 50% na tango
              ya kozwa biloko.</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.2 Ndenge A – Virement bancaire via Finom</h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Nkombo ya kozwa mbongo na ba coordonnées bancaires ya
            mpenza (IBAN/BIC) ekotindama na Mobii na email, na confirmation ya
            commande. Prestataire: Finom. Référence (YA MPENZA OBLIGATOIRE):
            Numéro ya commande na yo.
          </p>
          <p>
            <strong>(2)</strong> Référence ya commande ezali ya mpenza obligatoire.
            Soki ezali te, tobosana kosangisa mbongo na commande na yo.
          </p>
          <p>
            <strong>(3)</strong> Kobiya emonisami soki mbongo ekotaki na compte na biso.
          </p>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.3 Ndenge B – Kobiya na agent via Banque UBA (RDC)</h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Mpo na ba clients ya RDC, kobiya na agent
            ya Banque UBA ezali na service.
          </p>
          <p>
            <strong>(2)</strong> Ndenge ya kosala:
          </p>
          <ul className="list-disc ml-8 space-y-1">
            <li>Mobii apesa numéro ya téléphone na ye na tango ya commande.</li>
            <li>Agent ya GermanLink akozela ye na saa 24.</li>
            <li>Bakoya na banque UBA wumela.</li>
            <li>Kobiya na numéro ya commande lokola référence.</li>
            <li>Agent akopesa confirmation na Mosalisi.</li>
          </ul>
          <p>
            <strong>(3)</strong> Kobiya emonisami soki Mosalisi asangisi confirmation.
          </p>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.4 Conservation ya mbongo</h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Mbongo ezali na banque (Finom / UBA) tii biloko
            ekomi na Mobii.
          </p>
          <p>
            <strong>(2)</strong> Mobii akozwa intérêts te mpo na mbongo oyo.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 4 Mibeko ya kotindela</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Kotindela kaka na adresse oyo Mobii apesaki.
          </p>
          <p>
            <strong>(2)</strong> Tango ya kolawa: Mpoka 4 tii 8 soki
            kobiya esangisami. Tango oyo ezali estimation;
            ezali te date ya sûr.
          </p>
          <p>
            <strong>(3)</strong> Tango ebandi na mokolo ya confirmation ya kobiya.
          </p>
          <p>
            <strong>(4)</strong> Ntango biloko esepelisami na transporteur,
            obligation ya kotindela esalemi. Risque ekotela Mobii.
          </p>
          <p>
            <strong>(5)</strong> Soki biloko etindelamaki, Mobii akozwa email
            ya confirmation na informations ya tracking.
          </p>
          <p>
            <strong>(6)</strong> Kotindela na baparte ekoki kosalema soki ezali normal.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 5 Soki kotindela esukaki tango</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Kotindela ekoki koleka tango mingi na sababu oyo
            eza libanda ya biso: douane, grève, force majeure,
            ba transporteurs.
          </p>
          <p>
            <strong>(2)</strong> Soki biloko ezali na nzela to Mosalisi akoki
            kotindela na tango ya malamu, Mobii azali na droit te
            ya kozwa mbongo na ye kaka mpo na koleka tango.
          </p>
          <p>
            <strong>(3)</strong> Soki kotindela ekoleka mpoka 2 sanza suka,
            Mosalisi akotindela email ya information.
          </p>
          <p>
            <strong>(4)</strong> Mibeko ya loi (§§ 280, 286, 323 BGB) ezali
            naino na nguya. Soki kotindela esukaki te,
            Mobii akoki koboya kontara soki apesaki tango
            ya kolongo liboso.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4 rounded-r">
            <p className="text-sm font-medium text-yellow-900">
              <strong>Liyebisi:</strong> Koleka tango kaka yango te epesaka droit
              ya kozwa mbongo soki kotindela ekoki kosalema naino.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 6 Kozongisama ya mbongo</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Mbongo ezongisama kaka soki:
          </p>
          <ul className="list-disc ml-8 space-y-1">
            <li>Mosalisi akoki kotindela te (impossible definitif).</li>
            <li>Biloko ebungaki to epaswami na preuves.</li>
            <li>Mosalisi ye moko asukisi commande mpo na libota na ye.</li>
            <li>Loi to juridiction elobeli kozongisa.</li>
          </ul>
          <p className="mt-4">
            <strong>(2)</strong> Mbongo ezongisama te soki:
          </p>
          <ul className="list-disc ml-8 space-y-1">
            <li>Biloko ezali naino na nzela.</li>
            <li>Koleka tango ezali kaka na kati ya 8 sanza.</li>
            <li>Koleka tango esalemaki na force majeure, douane to grève.</li>
            <li>Adresse oyo Mobii apesaki ezali ya ndenge te.</li>
            <li>Référence ya virement ezalaki te.</li>
          </ul>
          <p className="mt-4">
            <strong>(3)</strong> Kozongisama ya mbongo esalemaka na mpoka
            ya 14 jours ya mosala, na ndenge ya kobiya ya liboso.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 7 Droit ya koboya commande (consommateurs)</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Ba consommateurs bazali na droit ya loi
            ya koboya commande (§ 312g BGB). Informations
            ya complet ezali na tango ya kosala kontara.
          </p>
          <p>
            <strong>(2)</strong> Droit oyo esukaka mpo na biloko ya individuel
            to ya hygiène.
          </p>
          <p>
            <strong>(3)</strong> Soki koboya esalemaki na ndenge ya malamu,
            mbongo nyonso ezongisama.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 8 Propriété ya biloko</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Biloko ezali ya Mosalisi tii Mobii abiyi
            mbongo nyonso.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 9 Garantie</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Mibeko ya loi ya garantie esalema (§§ 434 ss. BGB).
          </p>
          <p>
            <strong>(2)</strong> Ba défauts ya kolakisama esengeli kozeba na
            Mosalisi na mpoka ya 5 jours ya mosala
            soki biloko ekomi.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 10 Limite ya responsabilité</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Responsabilité ya penza mpo na blessures,
            moyo, nzoto mpe na tango ya nzela mabe ya mpenza.
          </p>
          <p>
            <strong>(2)</strong> Na tango ya faute ya moke: responsabilité
            kaka mpo na dommages ya kolakisama.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 11 Protection ya données ya personnelles</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Traitement ya données esalemaka na RGPD.
            Détails ezali na politique ya confidentialité ya app.
          </p>
          <p>
            <strong>(2)</strong> Numéro ya téléphone oyo ezwamaka mpo na kobiya
            na agent esalemaka kaka mpo na coordination
            ya kobiya mpe kotindela.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 12 Résolution ya litiges mpe loi esalemaka</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Loi ya Allemagne esalemaka, sans Convention
            ya Vienne ya vente internationale.
          </p>
          <p>
            <strong>(2)</strong> Mibeko ya protection ya consommateur
            ya pays oyo Mobii afandaka ezali naino na nguya.
          </p>
          <p>
            <strong>(3)</strong> Plateforme ya UE:{' '}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            <br />
            Tosalemi te na ba procédures ya médiation.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 13 Dispositions finales</h2>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>(1)</strong> Ba clauses oyo ezo te ezali esanganisami
            na mibeko ya loi.
          </p>
          <p>
            <strong>(2)</strong> Modification ya Mibeko na préavis ya 4 sanza
            na email. Soki koboya te = acceptation.
          </p>
          <p>
            <strong>(3)</strong> Esalema banda na mokolo ya publication na app.
          </p>
        </div>
      </section>
    </>
  );
}