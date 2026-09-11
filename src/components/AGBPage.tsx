import { ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

type Market = 'de' | 'afrika';
type Language = 'de' | 'fr' | 'ln';

export default function AGBPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [market, setMarket] = useState<Market>('de');
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    const savedMarket = localStorage.getItem('agb_market') as Market;
    if (savedMarket && ['de', 'afrika'].includes(savedMarket)) {
      setMarket(savedMarket);
    }
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

  const changeMarket = (m: Market) => {
    setMarket(m);
    localStorage.setItem('agb_market', m);
    if (m === 'afrika' && !['fr', 'ln', 'de'].includes(language)) {
      setLanguage('fr');
    }
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('agb_lang', lang);
  };

  const headerContent = {
    de: {
      title: 'ALLGEMEINE GESCHÄFTSBEDINGUNGEN',
      company: 'KizGP – GermanLink Business (GLB), Markt Deutschland',
      subtitle: 'Zahlungs- und Lieferbedingungen für Kunden mit Wohnsitz in Deutschland · Stand: September 2026',
      infoBox: {
        title: 'Wichtige Informationen',
        scope: 'Kunden mit Wohnsitz in Deutschland',
        payment: 'Banküberweisung via Finom',
        delivery: '4–8 Wochen (Inland/EU-Versand)',
        parties: 'KizGP (Anbieter) und Käufer (Kunde)',
      },
      notice: 'Hinweis zur künftigen Anpassung: Zum 01.01.2027 wird KizGP in eine GmbH überführt (siehe § 1 Abs. 3). Diese AGB werden zu diesem Zeitpunkt entsprechend der dann geltenden GmbH-Struktur überarbeitet und den Käufern in aktualisierter Fassung zur Verfügung gestellt.',
      footer: 'Stand: September 2026',
    },
    afrika: {
      de: {
        title: 'ALLGEMEINE GESCHÄFTSBEDINGUNGEN',
        company: 'GLB-Solar (SARLU) – GermanLink Business (GLB), Markt Afrika',
        subtitle: 'Gültig einheitlich für Kunden in der Republik Kongo, der Demokratischen Republik Kongo und Cabinda (Angola) · Stand: September 2026',
        infoBox: {
          title: 'Wichtige Informationen',
          scope: 'Republik Kongo (Congo-Brazzaville), Demokratische Republik Kongo (DR Kongo) und Cabinda (Angola)',
          payment: 'Direktzahlung auf lokales GLB-Konto (u. a. bei UBA)',
          delivery: '8–14 Wochen bei Neubestellung aus Deutschland; deutlich kürzer bei Verfügbarkeit ab Lager Pointe-Noire',
          parties: 'GLB-Solar (SARLU) (Anbieter) und Käufer (Kunde)',
        },
        notice: 'Hinweis zur künftigen Anpassung: Zum 01.01.2027 entsteht auf deutscher Seite die GLB GmbH als Nachfolgerin von KizGP (siehe § 1 Abs. 3). Diese AGB werden zu diesem Zeitpunkt hinsichtlich der Bezeichnung des deutschen Kooperationspartners entsprechend angepasst und den Käufern in aktualisierter Fassung zur Verfügung gestellt.',
        footer: 'Stand: September 2026',
      },
      fr: {
        title: 'CONDITIONS GÉNÉRALES DE VENTE (CGV)',
        company: 'GLB-Solar (SARLU) – GermanLink Business (GLB), Marché Afrique',
        subtitle: "Applicable uniformément aux clients en République du Congo, en République Démocratique du Congo et à Cabinda (Angola) · Version : Septembre 2026",
        infoBox: {
          title: 'Informations importantes',
          scope: 'République du Congo (Congo-Brazzaville), République Démocratique du Congo (RDC) et Cabinda (Angola)',
          payment: "Paiement direct sur le compte local de GLB (notamment auprès d'UBA)",
          delivery: "8 à 14 semaines pour une nouvelle commande depuis l'Allemagne ; nettement plus court en cas de disponibilité au dépôt de Pointe-Noire",
          parties: "GLB-Solar (SARLU) (Prestataire) et l'Acheteur (Client)",
        },
        notice: "Remarque sur une évolution à venir : au 01.01.2027, la société GLB GmbH sera créée en Allemagne en tant que successeure de KizGP (voir § 1 al. 3). Les présentes CGV seront alors adaptées en ce qui concerne la désignation du partenaire allemand et mises à disposition des clients dans une version actualisée.",
        footer: 'Version : Septembre 2026',
      },
      ln: {
        title: 'MIBEKO YA BOZWI MPE KOTINDELA',
        company: 'GLB-Solar (SARLU) – GermanLink Business (GLB), Marché ya Afrika',
        subtitle: 'Esalemaka ndenge moko mpo na ba clients ya République du Congo, République Démocratique du Congo mpe Cabinda (Angola) · Tango: Septembre 2026',
        infoBox: {
          title: 'Informations ya ntina',
          scope: 'République du Congo (Congo-Brazzaville), République Démocratique du Congo (RDC) mpe Cabinda (Angola)',
          payment: 'Kobiya mbala moko na compte ya GLB na mboka na yo (na kati na yango UBA)',
          delivery: 'Mpoka 8 tii 14 soki commande ya sika ewuti na Allemagne ; ekoki kozala mokuse soki biloko ezali na dépôt ya Pointe-Noire',
          parties: 'GLB-Solar (SARLU) (Mosalisi) mpe Mobii (Client)',
        },
        notice: 'Liyebisi mpo na mbongwana ekoya: Na 01.01.2027, société GLB GmbH ekosalema na Allemagne lokola mosungi ya KizGP (tala § 1 al. 3). Mibeko oyo ekobongisama na ntina ya nkombo ya partenaire ya Allemagne mpe ekopesama na ba clients na version ya sika.',
        footer: 'Tango: Septembre 2026',
      },
    },
  };

  const isAfrika = market === 'afrika';
  const t = isAfrika ? headerContent.afrika[language] : headerContent.de;

  const labelGeltung = language === 'fr' ? "Champ d'application" : language === 'ln' ? 'Esalemi wapi' : 'Geltungsbereich';
  const labelZahlung = language === 'fr' ? 'Modes de paiement' : language === 'ln' ? 'Ndenge ya kobiya' : 'Zahlungsmethoden';
  const labelLieferzeit = language === 'fr' ? 'Délai de livraison' : language === 'ln' ? 'Tango ya kolawa biloko' : 'Lieferzeit';
  const labelPartner = language === 'fr' ? 'Parties contractantes' : language === 'ln' ? 'Bato ya kontara' : 'Vertragspartner';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 md:py-12">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-12">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {t.title}
          </h1>
          <p className="text-lg text-gray-600 mb-1">{t.company}</p>
          <p className="text-sm text-gray-500 mb-6">{t.subtitle}</p>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <button
              onClick={() => changeMarket('de')}
              className={`px-5 py-2 rounded-md text-sm font-semibold transition ${
                market === 'de' ? 'bg-[#1F4E37] text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Deutschland
            </button>
            <button
              onClick={() => changeMarket('afrika')}
              className={`px-5 py-2 rounded-md text-sm font-semibold transition ${
                market === 'afrika' ? 'bg-[#1F4E37] text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Afrika (RC · RDC · Cabinda)
            </button>
          </div>

          {isAfrika && (
            <div className="flex items-center justify-center space-x-2 mb-8">
              <button
                onClick={() => changeLanguage('fr')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  language === 'fr' ? 'bg-[#009543] text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => changeLanguage('ln')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  language === 'ln' ? 'bg-[#009543] text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                LN
              </button>
              <button
                onClick={() => changeLanguage('de')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  language === 'de' ? 'bg-[#009543] text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                DE
              </button>
            </div>
          )}
          {!isAfrika && <div className="mb-8" />}

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-4 rounded-r">
            <h3 className="font-semibold text-gray-900 mb-3">{t.infoBox.title}</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><strong>{labelGeltung}:</strong> {t.infoBox.scope}</li>
              <li><strong>{labelZahlung}:</strong> {t.infoBox.payment}</li>
              <li><strong>{labelLieferzeit}:</strong> {t.infoBox.delivery}</li>
              <li><strong>{labelPartner}:</strong> {t.infoBox.parties}</li>
            </ul>
          </div>

          <div className="bg-amber-50 border-2 border-amber-400 p-4 mb-8 rounded">
            <p className="text-sm italic text-amber-900">{t.notice}</p>
          </div>

          {!isAfrika && <GermanyContent />}
          {isAfrika && language === 'de' && <AfrikaContentDE />}
          {isAfrika && language === 'fr' && <AfrikaContentFR />}
          {isAfrika && language === 'ln' && <AfrikaContentLN />}

          <div className="border-t pt-6 mt-12">
            <p className="text-center text-gray-600 font-medium">{t.footer}</p>
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

/* ============================================================
   MARKT: DEUTSCHLAND (nur Deutsch — KizGP / ab 2027 GmbH)
   ============================================================ */
function GermanyContent() {
  return (
    <>
      <section className="mb-8">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">§ 1 Geltungsbereich und Vertragspartner</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB") gelten für alle Verträge, die über die digitale Plattform von GermanLink Business (GLB) zwischen dem Anbieter und Kunden mit Wohnsitz in Deutschland (nachfolgend "Käufer") abgeschlossen werden.</p>
          <p><strong>(2)</strong> Der Anbieter ist: KizGP, Einzelunternehmen (Kleingewerbe, nicht im Handelsregister eingetragen), Inhaber: Jérémie Mayindou, mit Sitz in Isernhagen, Deutschland. KizGP ist verantwortlich für die Beschaffung deutscher Solar- und Energieprodukte (u. a. bei ADEMAX Deutschland GmbH & Co. KG) sowie für die Zahlungsabwicklung und Vertragsabwicklung gegenüber Kunden mit Wohnsitz in Deutschland, im Rahmen der Handelsmarke "GermanLink Business (GLB)".</p>
          <p><strong>(3)</strong> Zum 01.01.2027 ist die Überführung von KizGP in eine Gesellschaft mit beschränkter Haftung (GmbH) vorgesehen (Gesellschafter: Jérémie Mayindou und Josias Nganga). Ab diesem Zeitpunkt tritt die GmbH als Anbieter in alle bestehenden und neuen Vertragsverhältnisse ein; die Käufer werden hierüber rechtzeitig informiert.</p>
          <p><strong>(4)</strong> Für die Belieferung von Kunden in der Republik Kongo, der Demokratischen Republik Kongo und Cabinda (Angola) gilt die gesonderte "AGB Afrika (RC / DR Kongo / Cabinda)", herausgegeben von GLB-Solar (SARLU), Brazzaville, als dortigem Vertriebs- und Vertragspartner.</p>
          <p><strong>(5)</strong> Die AGB gelten in der zum Zeitpunkt der Bestellung gültigen Fassung. Entgegenstehende oder abweichende Bedingungen des Käufers werden nicht anerkannt, es sei denn, der Anbieter stimmt ihrer Geltung ausdrücklich schriftlich zu.</p>
          <p><strong>(6)</strong> Verbraucher im Sinne dieser AGB ist jede natürliche Person, die ein Rechtsgeschäft zu Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch ihrer selbständigen beruflichen Tätigkeit zugerechnet werden können (§ 13 BGB).</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 2 Vertragsschluss</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Die Darstellung von Produkten im Online-Shop stellt kein rechtlich bindendes Angebot dar, sondern einen unverbindlichen Katalog. Die Bestellung des Käufers ist ein verbindliches Angebot zum Abschluss eines Kaufvertrags.</p>
          <p><strong>(2)</strong> Nach Eingang der Bestellung erhält der Käufer eine automatische Bestellbestätigung per E-Mail mit eindeutiger Bestellnummer (Format: CEE-XXXXXXXXXX-XXXXXX). Diese Bestätigung stellt noch keine Annahme des Angebots dar.</p>
          <p><strong>(3)</strong> Der Kaufvertrag kommt zustande, sobald der Anbieter die Bestellung durch eine separate Auftragsbestätigungs-E-Mail oder durch Bestätigung des Zahlungseingangs ausdrücklich annimmt. Der Anbieter behält sich vor, einzelne Bestellungen ohne Angabe von Gründen abzulehnen.</p>
          <p><strong>(4)</strong> Vertragssprache ist Deutsch. Der Vertragstext wird vom Anbieter nicht gesondert gespeichert.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 3 Zahlungsbedingungen</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Der Käufer hat bei Bestellabschluss die Wahl zwischen zwei Zahlungsoptionen:</p>
          <ul className="list-disc ml-8 space-y-1">
            <li><strong>Vollzahlung:</strong> 100 % des Gesamtbetrags werden vor Versand entrichtet.</li>
            <li><strong>Anzahlung (Teilzahlung):</strong> 50 % vor Versand; 50 % bei Lieferung.</li>
          </ul>
          <p><strong>(2)</strong> Zahlungsweg: Banküberweisung via Finom. Empfänger und vollständige Kontodaten (IBAN/BIC) werden dem Käufer nach Bestellabschluss persönlich per E-Mail in der Auftragsbestätigung mitgeteilt. Verwendungszweck (OBLIGATORISCH): Ihre Bestellnummer.</p>
          <p><strong>(3)</strong> Der korrekte Verwendungszweck (Bestellnummer) ist zwingend erforderlich. Fehlt er, kann die Zahlung nicht zugeordnet werden.</p>
          <p><strong>(4)</strong> Die Zahlung gilt als eingegangen, sobald der Betrag vollständig auf dem Finom-Konto gutgeschrieben wurde.</p>
          <p><strong>(5)</strong> Der Betrag verbleibt bis zur erfolgten Lieferung beim Zahlungsdienstleister Finom. Der Käufer hat keinen Anspruch auf Verzinsung des Betrags.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 4 Lieferbedingungen und Lieferfristen</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Lieferung ausschließlich an die vom Käufer angegebene Adresse in Deutschland oder einem anderen EU-Mitgliedstaat.</p>
          <p><strong>(2)</strong> Lieferzeit: 4 bis 8 Wochen nach Zahlungsbestätigung. Diese Frist ist eine Schätzung; kein verbindlicher Liefertermin.</p>
          <p><strong>(3)</strong> Die Lieferfrist beginnt mit dem Tag der Zahlungsbestätigung.</p>
          <p><strong>(4)</strong> Übergabe an den Transportdienstleister = Lieferpflicht erfüllt; das Risiko geht auf den Käufer über.</p>
          <p><strong>(5)</strong> Nach Versand erhält der Käufer eine Versandbestätigungs-E-Mail mit Tracking-Informationen.</p>
          <p><strong>(6)</strong> Teillieferungen sind zulässig, sofern zumutbar.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 5 Lieferverzögerungen</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Verzögerungen können entstehen durch: Zollbehörden, Streiks, höhere Gewalt, behördliche Maßnahmen, Logistikpartner (u. a. ADEMAX, Frinco Reifen, Global Forwarding Germany GmbH).</p>
          <p><strong>(2)</strong> Befindet sich die Ware auf dem Transportweg oder kann der Anbieter in zumutbarer Zeit liefern, besteht kein Anspruch auf Rückerstattung wegen der Verzögerung allein.</p>
          <p><strong>(3)</strong> Bei Verzögerungen über 2 Wochen über das obere Ende der Lieferfrist informiert der Anbieter per E-Mail.</p>
          <p><strong>(4)</strong> Die gesetzlichen Rechte des Käufers nach §§ 280, 286, 323 BGB bleiben unberührt. Nach Setzen einer angemessenen Nachfrist und deren fruchtlosem Ablauf kann der Verbraucher vom Vertrag zurücktreten, sofern die Lieferung nicht erfolgt ist.</p>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4 rounded-r">
            <p className="text-sm font-medium text-yellow-900"><strong>Hinweis:</strong> Eine Verzögerung begründet für sich allein keinen Rückerstattungsanspruch, solange die Lieferung möglich und aktiv betrieben wird.</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 6 Rückerstattungsregelung</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Rückerstattung wird ausschließlich gewährt bei:</p>
          <ul className="list-disc ml-8 space-y-1">
            <li>Dauerhafter Unmöglichkeit der Lieferung ohne Verschulden des Käufers.</li>
            <li>Verlust oder Zerstörung der Ware ohne Nachweismöglichkeit.</li>
            <li>Stornierung durch den Anbieter aus eigenem Verschulden.</li>
            <li>Anordnung durch Gericht oder Behörde.</li>
          </ul>
          <p className="mt-4"><strong>(2)</strong> Kein Anspruch auf Rückerstattung bei:</p>
          <ul className="list-disc ml-8 space-y-1">
            <li>Ware ist auf dem Transportweg.</li>
            <li>Verzögerung liegt innerhalb der 8-Wochen-Frist.</li>
            <li>Verzögerung durch höhere Gewalt, Zoll, Streik.</li>
            <li>Fehlerhafte Lieferadresse durch den Käufer.</li>
            <li>Fehlende Referenznummer bei der Überweisung.</li>
          </ul>
          <p className="mt-4"><strong>(3)</strong> Rückerstattungen erfolgen innerhalb von 14 Werktagen auf das Ursprungs-Finom-Konto des Käufers.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 7 Widerrufsrecht (Verbraucher)</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Verbrauchern mit gewöhnlichem Aufenthalt in Deutschland oder einem anderen EU-Mitgliedstaat steht das gesetzliche Widerrufsrecht zu (§ 312g i.V.m. Art. 246a EGBGB). Die Widerrufsbelehrung wird bei Vertragsschluss gesondert bereitgestellt.</p>
          <p><strong>(2)</strong> Das Widerrufsrecht erlischt bei individuell gefertigten oder hygienisch sensiblen Waren.</p>
          <p><strong>(3)</strong> Im Fall eines wirksamen Widerrufs werden alle geleisteten Zahlungen einschließlich Lieferkosten erstattet.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 8 Eigentumsvorbehalt</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Die Ware bleibt bis zur vollständigen Bezahlung Eigentum des Anbieters.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 9 Gewährleistung</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Es gelten die gesetzlichen Gewährleistungsrechte nach deutschem Recht (§§ 434 ff. BGB).</p>
          <p><strong>(2)</strong> Sichtbare Mängel sind innerhalb von 5 Werktagen nach Lieferung schriftlich zu melden.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 10 Haftungsbeschränkung</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Unbeschränkte Haftung für Schäden an Leben, Körper, Gesundheit sowie bei Vorsatz und grober Fahrlässigkeit.</p>
          <p><strong>(2)</strong> Bei einfacher Fahrlässigkeit: Haftung nur bei Verletzung von Kardinalpflichten, begrenzt auf vorhersehbaren Schaden.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 11 Datenschutz</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Verarbeitung personenbezogener Daten gemäß DSGVO. Details in der Datenschutzerklärung der App.</p>
          <p><strong>(2)</strong> Kontaktdaten werden ausschließlich zur Zahlungs- und Lieferkoordination genutzt.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 12 Streitbeilegung und anwendbares Recht</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts.</p>
          <p><strong>(2)</strong> Zwingende Verbraucherschutzvorschriften des Aufenthaltsstaats des Käufers bleiben unberührt.</p>
          <p>
            <strong>(3)</strong> OS-Plattform der EU:{' '}
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
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
          <p><strong>(1)</strong> Unwirksame Klauseln werden durch gesetzliche Regelungen ersetzt.</p>
          <p><strong>(2)</strong> AGB-Änderungen mit 4 Wochen Frist per E-Mail. Kein Widerspruch = Zustimmung.</p>
          <p><strong>(3)</strong> Gültig ab Datum der Veröffentlichung in der App.</p>
        </div>
      </section>
    </>
  );
}

/* ============================================================
   MARKT: AFRIKA (RC / RDC / Cabinda) — Deutsch
   ============================================================ */
function AfrikaContentDE() {
  return (
    <>
      <section className="mb-8">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">§ 1 Geltungsbereich und Vertragspartner</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB") gelten einheitlich für alle Verträge, die über die digitale Plattform von GermanLink Business (GLB) zwischen dem Anbieter und Kunden mit Wohnsitz in der Republik Kongo (Congo-Brazzaville), der Demokratischen Republik Kongo oder Cabinda (Angola) (nachfolgend gemeinsam "Käufer") abgeschlossen werden.</p>
          <p><strong>(2)</strong> Der Anbieter ist: GLB-Solar (Société à Responsabilité Limitée Unipersonnelle, SARLU nach kongolesischem Recht, in Gründung), mit Sitz in Brazzaville, Republik Kongo, vertreten durch die Alleingesellschafterin und Geschäftsführerin Rebeca Bahoumina. GLB-Solar vertreibt und betreut unter der Handelsmarke "GermanLink Business (GLB)" deutsche Solar- und Energieprodukte einheitlich in allen drei genannten Märkten.</p>
          <p><strong>(3)</strong> Die Beschaffung der Produkte in Deutschland (u. a. bei ADEMAX Deutschland GmbH & Co. KG) sowie der Export nach Afrika erfolgen in Zusammenarbeit mit dem deutschen Kooperationspartner KizGP, Inhaber Jérémie Mayindou (ab 01.01.2027: GLB GmbH).</p>
          <p><strong>(4)</strong> Installation, Wartung und technischer Vor-Ort-Service werden, soweit örtlich verfügbar, durch das Partnerunternehmen GBP Tech (Brazzaville) sowie weitere lokale Partner erbracht. In Cabinda (Angola) befindet sich die lokale Servicestruktur im Aufbau; bis zur Benennung eines festen Vor-Ort-Partners erfolgt die Betreuung über die deutsche Diaspora-Kontaktstruktur von GLB.</p>
          <p><strong>(5)</strong> Die AGB gelten in der zum Zeitpunkt der Bestellung gültigen Fassung. Entgegenstehende oder abweichende Bedingungen des Käufers werden nicht anerkannt, es sei denn, der Anbieter stimmt ihrer Geltung ausdrücklich schriftlich zu.</p>
          <p><strong>(6)</strong> Vertragssprachen sind Französisch, Lingala und Deutsch. Der Vertragstext wird vom Anbieter nicht gesondert gespeichert.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 2 Vertragsschluss</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Die Darstellung von Produkten im Online-Shop stellt kein rechtlich bindendes Angebot dar, sondern einen unverbindlichen Katalog. Die Bestellung des Käufers ist ein verbindliches Angebot zum Abschluss eines Kaufvertrags.</p>
          <p><strong>(2)</strong> Nach Eingang der Bestellung erhält der Käufer eine automatische Bestellbestätigung mit eindeutiger Bestellnummer (Format: CEE-XXXXXXXXXX-XXXXXX). Diese Bestätigung stellt noch keine Annahme des Angebots dar.</p>
          <p><strong>(3)</strong> Der Kaufvertrag kommt zustande, sobald der Anbieter die Bestellung durch eine separate Auftragsbestätigung oder durch Bestätigung des Zahlungseingangs ausdrücklich annimmt. Der Anbieter behält sich vor, einzelne Bestellungen ohne Angabe von Gründen abzulehnen.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 3 Zahlungsbedingungen</h2>
        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.1 Verfügbare Zahlungsoptionen</h3>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Der Käufer hat bei Bestellabschluss die Wahl zwischen zwei Zahlungsoptionen:</p>
          <ul className="list-disc ml-8 space-y-1">
            <li><strong>Vollzahlung:</strong> 100 % des Gesamtbetrags werden vor Versand entrichtet.</li>
            <li><strong>Anzahlung (Teilzahlung):</strong> 50 % vor Versand; 50 % bei Lieferung.</li>
          </ul>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.2 Direktzahlung auf das lokale GLB-Konto</h3>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Die Zahlung erfolgt direkt auf das von GLB-Solar geführte Geschäftskonto bei einer kooperierenden Bank (u. a. United Bank for Africa, UBA) in Ihrem Land. Die jeweils gültigen Kontodaten werden dem Käufer nach Bestellabschluss in der Auftragsbestätigung mitgeteilt.</p>
          <p><strong>(2)</strong> Ablauf:</p>
          <ul className="list-disc ml-8 space-y-1">
            <li>Kontodaten werden dem Käufer nach Bestellabschluss in der Auftragsbestätigung mitgeteilt.</li>
            <li>Käufer zahlt den fälligen Betrag direkt bei einer Bankfiliale ein oder überweist auf das GLB-Solar-Konto, unter Angabe der Bestellnummer als Verwendungszweck.</li>
            <li>GLB-Solar bestätigt den Zahlungseingang nach interner Prüfung des Kontoauszugs.</li>
          </ul>
          <p><strong>(3)</strong> Die Zahlung gilt als eingegangen, sobald der Betrag auf dem GLB-Solar-Konto vollständig gutgeschrieben und intern bestätigt wurde.</p>
          <p><strong>(4)</strong> Eine physische Begleitung des Käufers durch einen Vertreter des Anbieters zur Bankfiliale ist nicht vorgesehen; die Einzahlung erfolgt eigenständig durch den Käufer.</p>
          <p><strong>(5)</strong> In Märkten oder Regionen, in denen zum Zeitpunkt der Bestellung noch kein lokales Bankkonto von GLB-Solar geführt wird, informiert der Anbieter den Käufer proaktiv über die dann verfügbare alternative Zahlungsmöglichkeit, bevor der Kaufvertrag zustande kommt.</p>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.3 Verwahrung des Zahlungsbetrags</h3>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Der Betrag verbleibt bis zur erfolgten Lieferung auf dem jeweiligen Konto.</p>
          <p><strong>(2)</strong> Der Käufer hat keinen Anspruch auf Verzinsung des Betrags.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 4 Lieferbedingungen und Lieferfristen</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Lieferung ausschließlich an die vom Käufer angegebene Adresse in der Republik Kongo, der Demokratischen Republik Kongo oder Cabinda (Angola).</p>
          <p><strong>(2)</strong> Lieferzeit: in der Regel 8 bis 14 Wochen nach Zahlungsbestätigung bei Neubestellung aus Deutschland (Seefracht über Pointe-Noire, anschließende Verzollung und Weiterverteilung). Ist die bestellte Ware bereits im GLB-Lager in Pointe-Noire vorrätig, verkürzt sich die Lieferzeit entsprechend. Diese Fristen sind Schätzungen; kein verbindlicher Liefertermin.</p>
          <p><strong>(3)</strong> Die Lieferfrist beginnt mit dem Tag der Zahlungsbestätigung.</p>
          <p><strong>(4)</strong> Übergabe an den Transportdienstleister bzw. an den lokalen Zustellpartner = Lieferpflicht erfüllt; das Risiko geht auf den Käufer über.</p>
          <p><strong>(5)</strong> Nach Versand erhält der Käufer eine Bestätigung mit verfügbaren Tracking-Informationen.</p>
          <p><strong>(6)</strong> Teillieferungen sind zulässig, sofern zumutbar.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 5 Lieferverzögerungen</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Verzögerungen können insbesondere entstehen durch: Zollabwicklung in Pointe-Noire, Streiks, höhere Gewalt, behördliche Maßnahmen, Verfügbarkeit von Transport- und Logistikpartnern (u. a. Frinco Reifen, Global Forwarding Germany GmbH, Transitaire Banga Ghislain).</p>
          <p><strong>(2)</strong> Befindet sich die Ware auf dem Transportweg oder kann der Anbieter in zumutbarer Zeit liefern, besteht kein Anspruch auf Rückerstattung wegen der Verzögerung allein.</p>
          <p><strong>(3)</strong> Bei Verzögerungen über 3 Wochen über das obere Ende der Lieferfrist informiert der Anbieter den Käufer.</p>
          <p><strong>(4)</strong> Nach Setzen einer angemessenen Nachfrist und deren fruchtlosem Ablauf kann der Käufer vom Vertrag zurücktreten, sofern die Lieferung nicht erfolgt ist und keine der in § 5(1) genannten Ursachen fortbesteht.</p>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4 rounded-r">
            <p className="text-sm font-medium text-yellow-900"><strong>Hinweis:</strong> Eine Verzögerung begründet für sich allein keinen Rückerstattungsanspruch, solange die Lieferung möglich und aktiv betrieben wird.</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 6 Rückerstattungsregelung</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Rückerstattung wird ausschließlich gewährt bei:</p>
          <ul className="list-disc ml-8 space-y-1">
            <li>Dauerhafter Unmöglichkeit der Lieferung ohne Verschulden des Käufers.</li>
            <li>Verlust oder Zerstörung der Ware ohne Nachweismöglichkeit.</li>
            <li>Stornierung durch den Anbieter aus eigenem Verschulden.</li>
            <li>Anordnung durch Gericht oder zuständige Behörde.</li>
          </ul>
          <p className="mt-4"><strong>(2)</strong> Kein Anspruch auf Rückerstattung bei:</p>
          <ul className="list-disc ml-8 space-y-1">
            <li>Ware ist auf dem Transportweg.</li>
            <li>Verzögerung liegt innerhalb der in § 4(2) genannten Frist.</li>
            <li>Verzögerung durch höhere Gewalt, Zoll oder Streik.</li>
            <li>Fehlerhafte Lieferadresse durch den Käufer.</li>
            <li>Fehlende Referenznummer (Bestellnummer) bei der Einzahlung.</li>
          </ul>
          <p className="mt-4"><strong>(3)</strong> Rückerstattungen erfolgen innerhalb von 14 Werktagen auf das Ursprungskonto des Käufers, über das die Zahlung erfolgte.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 7 Kein Widerrufsrecht nach EU-Verbraucherrecht</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Das gesetzliche Widerrufsrecht nach § 312g BGB gilt ausschließlich für Verbraucher mit gewöhnlichem Aufenthalt in Deutschland oder einem anderen EU-Mitgliedstaat (siehe gesonderte "AGB Deutschland") und findet auf Verträge nach diesen AGB keine Anwendung.</p>
          <p><strong>(2)</strong> Unabhängig davon gewährt der Anbieter Käufern in der Republik Kongo, der DR Kongo und Cabinda (Angola) im Rahmen von § 6 dieser AGB eine Rückerstattung in den dort genannten Fällen.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 8 Eigentumsvorbehalt</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Die Ware bleibt bis zur vollständigen Bezahlung Eigentum des Anbieters.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 9 Gewährleistung</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Für Käufer mit Wohnsitz in der Republik Kongo oder der Demokratischen Republik Kongo gelten die Gewährleistungsvorschriften des OHADA-Rechts, dem beide Staaten als Mitgliedstaaten angehören.</p>
          <p><strong>(2)</strong> Für Käufer mit Wohnsitz in Cabinda (Angola) gelten die Gewährleistungsvorschriften des angolanischen Rechts, da Angola kein OHADA-Mitgliedstaat ist.</p>
          <p><strong>(3)</strong> Sichtbare Mängel sind innerhalb von 5 Werktagen nach Lieferung dem Anbieter zu melden.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 10 Haftungsbeschränkung</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Unbeschränkte Haftung für Schäden an Leben, Körper und Gesundheit sowie bei Vorsatz und grober Fahrlässigkeit.</p>
          <p><strong>(2)</strong> Bei einfacher Fahrlässigkeit: Haftung nur bei Verletzung wesentlicher Vertragspflichten, begrenzt auf den vorhersehbaren, vertragstypischen Schaden.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 11 Datenschutz</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Verarbeitung personenbezogener Daten gemäß den anwendbaren nationalen Datenschutzbestimmungen sowie, soweit einschlägig, der DSGVO. Details in der Datenschutzerklärung der App.</p>
          <p><strong>(2)</strong> Bankverbindungsdaten und Kontaktdaten werden ausschließlich zur Zahlungs- und Lieferkoordination genutzt.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 12 Streitbeilegung und anwendbares Recht</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Für Vertragsverhältnisse mit Käufern in der Republik Kongo und der Demokratischen Republik Kongo gilt das Recht dieser Staaten einschließlich des OHADA-Rechts.</p>
          <p><strong>(2)</strong> Für Vertragsverhältnisse mit Käufern in Cabinda (Angola) gilt angolanisches Recht, da Angola nicht Mitglied der OHADA ist.</p>
          <p><strong>(3)</strong> Zwingende Verbraucherschutzvorschriften des jeweiligen Wohnsitzstaats des Käufers bleiben unberührt.</p>
          <p><strong>(4)</strong> Gerichtsstand ist, soweit gesetzlich zulässig vereinbar, der Sitz des Anbieters in Brazzaville, Republik Kongo.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 13 Schlussbestimmungen</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Unwirksame Klauseln werden durch die jeweils anwendbaren gesetzlichen Regelungen ersetzt.</p>
          <p><strong>(2)</strong> Änderungen dieser AGB werden den Käufern mit 4 Wochen Frist per E-Mail oder über die App mitgeteilt. Kein Widerspruch = Zustimmung.</p>
          <p><strong>(3)</strong> Gültig ab Datum der Veröffentlichung in der App.</p>
        </div>
      </section>
    </>
  );
}

/* ============================================================
   MARKT: AFRIKA (RC / RDC / Cabinda) — Français
   ============================================================ */
function AfrikaContentFR() {
  return (
    <>
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 1 Champ d'application et parties contractantes</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Les présentes Conditions Générales de Vente (ci-après "CGV") s'appliquent uniformément à tous les contrats conclus via la plateforme numérique de GermanLink Business (GLB) entre le Prestataire et les clients résidant en République du Congo (Congo-Brazzaville), en République Démocratique du Congo ou à Cabinda (Angola) (ci-après collectivement "Acheteur").</p>
          <p><strong>(2)</strong> Le Prestataire est : GLB-Solar (Société à Responsabilité Limitée Unipersonnelle, SARLU de droit congolais, en cours de constitution), dont le siège social se trouve à Brazzaville, République du Congo, représentée par l'associée unique et gérante Rebeca Bahoumina. GLB-Solar distribue et assure le service après-vente, sous la marque commerciale "GermanLink Business (GLB)", des produits solaires et énergétiques allemands de manière uniforme dans les trois marchés mentionnés.</p>
          <p><strong>(3)</strong> L'approvisionnement des produits en Allemagne (notamment auprès d'ADEMAX Deutschland GmbH & Co. KG) ainsi que l'exportation vers l'Afrique sont assurés en coopération avec le partenaire allemand KizGP, dirigé par Jérémie Mayindou (à partir du 01.01.2027 : GLB GmbH).</p>
          <p><strong>(4)</strong> L'installation, la maintenance et le service technique sur site sont assurés, dans la mesure de leur disponibilité locale, par le partenaire GBP Tech (Brazzaville) ainsi que d'autres partenaires locaux. À Cabinda (Angola), la structure de service locale est en cours de mise en place ; jusqu'à la désignation d'un partenaire local fixe, le suivi est assuré via le réseau de contacts de la diaspora de GLB en Allemagne.</p>
          <p><strong>(5)</strong> Les CGV s'appliquent dans la version en vigueur au moment de la commande. Les conditions contraires ou divergentes de l'Acheteur ne sont pas reconnues, sauf accord écrit exprès du Prestataire.</p>
          <p><strong>(6)</strong> Les langues contractuelles sont le français, le lingala et l'allemand. Le texte du contrat n'est pas conservé séparément par le Prestataire.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 2 Conclusion du contrat</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> La présentation des produits dans la boutique en ligne ne constitue pas une offre juridiquement contraignante, mais un catalogue non contraignant. La commande de l'Acheteur constitue une offre ferme de conclure un contrat d'achat.</p>
          <p><strong>(2)</strong> Après réception de la commande, l'Acheteur reçoit une confirmation automatique avec un numéro de commande unique (format : CEE-XXXXXXXXXX-XXXXXX). Cette confirmation ne constitue pas encore une acceptation de l'offre.</p>
          <p><strong>(3)</strong> Le contrat est conclu lorsque le Prestataire accepte expressément la commande par une confirmation séparée ou par la confirmation du paiement reçu. Le Prestataire se réserve le droit de refuser des commandes sans justification.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 3 Conditions de paiement</h2>
        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.1 Options de paiement disponibles</h3>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> L'Acheteur a le choix entre deux options de paiement :</p>
          <ul className="list-disc ml-8 space-y-1">
            <li><strong>Paiement intégral :</strong> 100 % du montant total avant expédition.</li>
            <li><strong>Acompte :</strong> 50 % avant expédition ; 50 % à la livraison.</li>
          </ul>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.2 Paiement direct sur le compte local de GLB</h3>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Le paiement s'effectue directement sur le compte professionnel de GLB-Solar auprès d'une banque partenaire (notamment United Bank for Africa, UBA) dans votre pays. Les coordonnées bancaires en vigueur sont communiquées à l'Acheteur dans la confirmation de commande.</p>
          <p><strong>(2)</strong> Procédure :</p>
          <ul className="list-disc ml-8 space-y-1">
            <li>Les coordonnées du compte sont communiquées à l'Acheteur dans la confirmation de commande.</li>
            <li>L'Acheteur verse le montant dû directement dans une agence bancaire ou par virement sur le compte GLB-Solar, en indiquant le numéro de commande comme référence.</li>
            <li>GLB-Solar confirme la réception du paiement après vérification interne du relevé de compte.</li>
          </ul>
          <p><strong>(3)</strong> Le paiement est considéré reçu dès que le montant est intégralement crédité sur le compte GLB-Solar et confirmé en interne.</p>
          <p><strong>(4)</strong> Aucun accompagnement physique de l'Acheteur par un représentant du Prestataire jusqu'à l'agence bancaire n'est prévu ; le versement est effectué de manière autonome par l'Acheteur.</p>
          <p><strong>(5)</strong> Dans les marchés ou régions où aucun compte bancaire local de GLB-Solar n'est encore ouvert au moment de la commande, le Prestataire informe proactivement l'Acheteur du mode de paiement alternatif alors disponible, avant la conclusion du contrat.</p>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.3 Conservation du montant payé</h3>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Le montant versé reste sur le compte concerné jusqu'à la livraison effectuée.</p>
          <p><strong>(2)</strong> L'Acheteur n'a pas droit à des intérêts sur le montant versé.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 4 Conditions et délais de livraison</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Livraison uniquement à l'adresse indiquée par l'Acheteur en République du Congo, en République Démocratique du Congo ou à Cabinda (Angola).</p>
          <p><strong>(2)</strong> Délai de livraison : généralement 8 à 14 semaines après confirmation du paiement pour une nouvelle commande depuis l'Allemagne (fret maritime via Pointe-Noire, dédouanement puis distribution). Si la marchandise commandée est déjà disponible au dépôt GLB de Pointe-Noire, le délai est réduit en conséquence. Ces délais sont des estimations ; aucune date de livraison garantie.</p>
          <p><strong>(3)</strong> Le délai commence à partir du jour de confirmation du paiement.</p>
          <p><strong>(4)</strong> La remise au transporteur ou au partenaire de distribution local constitue l'exécution de l'obligation de livraison ; le risque passe à l'Acheteur.</p>
          <p><strong>(5)</strong> Après expédition, l'Acheteur reçoit une confirmation avec les informations de suivi disponibles.</p>
          <p><strong>(6)</strong> Les livraisons partielles sont autorisées si raisonnables.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 5 Retards de livraison</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Des retards peuvent notamment survenir en raison de : dédouanement à Pointe-Noire, grèves, force majeure, mesures administratives, disponibilité des partenaires de transport et logistique (notamment Frinco Reifen, Global Forwarding Germany GmbH, Transitaire Banga Ghislain).</p>
          <p><strong>(2)</strong> Si la marchandise est en transit ou si le Prestataire peut livrer dans un délai raisonnable, l'Acheteur n'a pas droit au remboursement du seul fait du retard.</p>
          <p><strong>(3)</strong> En cas de retard de plus de 3 semaines au-delà du délai maximum, le Prestataire informe l'Acheteur.</p>
          <p><strong>(4)</strong> Après mise en demeure raisonnable restée sans effet, l'Acheteur peut se rétracter du contrat si la livraison n'a pas eu lieu et si aucune des causes mentionnées au § 5(1) ne persiste.</p>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4 rounded-r">
            <p className="text-sm font-medium text-yellow-900"><strong>Note importante :</strong> Un retard seul ne justifie pas un remboursement tant que la livraison est possible et en cours.</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 6 Politique de remboursement</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Remboursement accordé uniquement si :</p>
          <ul className="list-disc ml-8 space-y-1">
            <li>Impossibilité définitive de livraison sans faute de l'Acheteur.</li>
            <li>Perte ou destruction prouvée de la marchandise.</li>
            <li>Annulation par le Prestataire pour une raison lui incombant.</li>
            <li>Décision d'un tribunal ou d'une autorité compétente.</li>
          </ul>
          <p className="mt-4"><strong>(2)</strong> Pas de remboursement si :</p>
          <ul className="list-disc ml-8 space-y-1">
            <li>La marchandise est en transit.</li>
            <li>Le retard est dans le délai mentionné au § 4(2).</li>
            <li>Retard dû à la force majeure, la douane ou une grève.</li>
            <li>Adresse de livraison incorrecte fournie par l'Acheteur.</li>
            <li>Référence (numéro de commande) manquante lors du versement.</li>
          </ul>
          <p className="mt-4"><strong>(3)</strong> Les remboursements sont effectués sous 14 jours ouvrés vers le compte d'origine de l'Acheteur ayant servi au paiement.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 7 Absence de droit de rétractation au sens du droit européen</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Le droit légal de rétractation selon le § 312g du BGB (Code civil allemand) s'applique exclusivement aux consommateurs résidant habituellement en Allemagne ou dans un autre État membre de l'UE (voir "CGV Allemagne" séparées) et ne s'applique pas aux contrats régis par les présentes CGV.</p>
          <p><strong>(2)</strong> Indépendamment de cela, le Prestataire accorde aux Acheteurs en République du Congo, en RDC et à Cabinda (Angola) un remboursement dans les cas prévus au § 6 des présentes CGV.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 8 Réserve de propriété</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> La marchandise reste propriété du Prestataire jusqu'au paiement intégral du prix d'achat.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 9 Garantie légale</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Pour les acheteurs résidant en République du Congo ou en République Démocratique du Congo, les dispositions de garantie du droit OHADA s'appliquent, ces deux États étant membres de cette organisation.</p>
          <p><strong>(2)</strong> Pour les acheteurs résidant à Cabinda (Angola), les dispositions de garantie du droit angolais s'appliquent, l'Angola n'étant pas membre de l'OHADA.</p>
          <p><strong>(3)</strong> Les défauts visibles doivent être signalés au Prestataire dans les 5 jours ouvrés suivant la livraison.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 10 Limitation de responsabilité</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Responsabilité illimitée pour atteinte à la vie, au corps et à la santé, ainsi qu'en cas de dol ou de faute grave.</p>
          <p><strong>(2)</strong> En cas de faute légère : responsabilité limitée aux dommages prévisibles typiques du contrat, en cas de violation d'obligations contractuelles essentielles.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 11 Protection des données</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Traitement des données personnelles conformément aux dispositions nationales applicables en matière de protection des données ainsi que, le cas échéant, au RGPD. Détails dans la politique de confidentialité de l'application.</p>
          <p><strong>(2)</strong> Les coordonnées bancaires et de contact sont utilisées exclusivement pour la coordination du paiement et de la livraison.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 12 Règlement des litiges et droit applicable</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Pour les relations contractuelles avec des acheteurs en République du Congo et en République Démocratique du Congo, le droit de ces États, y compris le droit OHADA, s'applique.</p>
          <p><strong>(2)</strong> Pour les relations contractuelles avec des acheteurs à Cabinda (Angola), le droit angolais s'applique, l'Angola n'étant pas membre de l'OHADA.</p>
          <p><strong>(3)</strong> Les dispositions impératives de protection du consommateur du pays de résidence de l'Acheteur restent applicables.</p>
          <p><strong>(4)</strong> Le tribunal compétent est, dans la mesure où cela est légalement admissible, celui du siège du Prestataire à Brazzaville, République du Congo.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 13 Dispositions finales</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Les clauses invalides sont remplacées par les dispositions légales applicables.</p>
          <p><strong>(2)</strong> Les modifications des présentes CGV sont communiquées aux Acheteurs avec un préavis de 4 semaines par e-mail ou via l'application. Absence d'opposition = acceptation.</p>
          <p><strong>(3)</strong> Applicable à compter de la date de publication dans l'application.</p>
        </div>
      </section>
    </>
  );
}

/* ============================================================
   MARKT: AFRIKA (RC / RDC / Cabinda) — Lingala
   ============================================================ */
function AfrikaContentLN() {
  return (
    <>
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 1 Wapi mibeko oyo esalema</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Mibeko oyo (tokobenga "Mibeko") esalema ndenge moko mpo na makontara nyonso oyo esalemaka na platforme ya GermanLink Business (GLB) na kati ya Mosalisi mpe ba clients oyo bafandaka na République du Congo (Congo-Brazzaville), na République Démocratique du Congo to na Cabinda (Angola) (tokobenga esika moko "Mobii").</p>
          <p><strong>(2)</strong> Mosalisi azali: GLB-Solar (Société à Responsabilité Limitée Unipersonnelle, SARLU na mibeko ya Congo, ezali naino kosalema), siège na yango ezali na Brazzaville, République du Congo, emonisami na associée unique mpe gérante Rebeca Bahoumina. GLB-Solar etindaka mpe elandaka, na se ya nkombo ya bizinesi "GermanLink Business (GLB)", biloko ya solaire na energie ya Allemagne ndenge moko na ba marchés nyonso misato oyo elobelami.</p>
          <p><strong>(3)</strong> Kozwa biloko na Allemagne (na kati na yango ADEMAX Deutschland GmbH & Co. KG) mpe kotinda yango na Afrika esalemaka elongo na partenaire ya Allemagne KizGP, oyo Jérémie Mayindou azali kotambwisa (banda 01.01.2027: GLB GmbH).</p>
          <p><strong>(4)</strong> Installation, entretien mpe service technique na esika esalemaka, soki ezali possible na mboka, na partenaire GBP Tech (Brazzaville) mpe ba partenaires misusu ya mboka. Na Cabinda (Angola), structure ya service ya mboka ezali naino kosalema; tii kozwa partenaire ya sûr na mboka, suivi esalemaka na nzela ya diaspora ya GLB na Allemagne.</p>
          <p><strong>(5)</strong> Mibeko oyo esalema na version oyo ezali na tango ya commande. Mosalisi akosangisa mibeko oyo te soki akomeli ye na ndenge ya écriture.</p>
          <p><strong>(6)</strong> Maloba ya kontara: Français, Lingala mpe Allemand.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 2 Ndenge kontara esalemaka</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Kolakisa biloko na boutique ezali te offre ya loi, kaka catalogue ya informations. Commande ya Mobii ezali offre ya kosala kontara ya kozwa biloko.</p>
          <p><strong>(2)</strong> Soki commande eyei, Mobii akozwa confirmation na numéro ya commande (format: CEE-XXXXXXXXXX-XXXXXX). Confirmation oyo ezali te encore acceptation.</p>
          <p><strong>(3)</strong> Kontara esalemaka soki Mosalisi asangisi commande na confirmation to na confirmation ya kobiya. Mosalisi akoki koboya commande sans explication.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 3 Mibeko ya kobiya</h2>
        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.1 Ndenge ya kobiya</h3>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Mobii akoki kopona kati na:</p>
          <ul className="list-disc ml-8 space-y-1">
            <li><strong>Kobiya nyonso:</strong> 100% ya prix liboso ya kotindela.</li>
            <li><strong>Kobiya ndambu:</strong> 50% liboso ya kotindela; 50% na tango ya kozwa biloko.</li>
          </ul>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.2 Kobiya mbala moko na compte ya GLB na mboka na yo</h3>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Kobiya esalemaka mbala moko na compte ya GLB-Solar na banque partenaire (na kati na yango United Bank for Africa, UBA) na mboka na yo. Ba coordonnées ya compte ekotindama na Mobii na confirmation ya commande.</p>
          <p><strong>(2)</strong> Ndenge ya kosala:</p>
          <ul className="list-disc ml-8 space-y-1">
            <li>Ba coordonnées ya compte ekotindama na Mobii na confirmation ya commande.</li>
            <li>Mobii akofuta mbongo mbala moko na agence ya banque to na virement na compte ya GLB-Solar, na kotia numéro ya commande lokola référence.</li>
            <li>GLB-Solar akopesa confirmation ya kobiya sima ya kotala relevé ya compte.</li>
          </ul>
          <p><strong>(3)</strong> Kobiya emonisami soki mbongo ekoti mobimba na compte ya GLB-Solar mpe Mosalisi apesi confirmation.</p>
          <p><strong>(4)</strong> Ezali te na moto ya Mosalisi oyo akotambola na Mobii tii na agence ya banque; Mobii ye moko akosala kobiya na ye.</p>
          <p><strong>(5)</strong> Na ba marchés to régions oyo compte ya GLB-Solar ezali naino te na tango ya commande, Mosalisi akoyebisa Mobii liboso ndenge mosusu ya kobiya oyo ezali disponible, liboso kontara esila.</p>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.3 Conservation ya mbongo</h3>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Mbongo ezali na compte oyo esalemaki tii biloko ekomi na Mobii.</p>
          <p><strong>(2)</strong> Mobii akozwa intérêts te mpo na mbongo oyo.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 4 Mibeko ya kotindela</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Kotindela kaka na adresse oyo Mobii apesaki, na République du Congo, République Démocratique du Congo to Cabinda (Angola).</p>
          <p><strong>(2)</strong> Tango ya kolawa: mbala mingi mpoka 8 tii 14 soki kobiya esangisami, mpo na commande ya sika ewuti na Allemagne (fret maritime na Pointe-Noire, douane mpe distribution). Soki biloko ezali déjà na dépôt ya GLB na Pointe-Noire, tango ekokoma mokuse. Tango oyo ezali estimation; ezali te date ya sûr.</p>
          <p><strong>(3)</strong> Tango ebandi na mokolo ya confirmation ya kobiya.</p>
          <p><strong>(4)</strong> Ntango biloko esepelisami na transporteur to na partenaire ya mboka, obligation ya kotindela esalemi. Risque ekotela Mobii.</p>
          <p><strong>(5)</strong> Soki biloko etindelamaki, Mobii akozwa confirmation na informations ya tracking.</p>
          <p><strong>(6)</strong> Kotindela na baparte ekoki kosalema soki ezali normal.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 5 Soki kotindela esukaki tango</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Kotindela ekoki koleka tango na sababu lokola: douane na Pointe-Noire, grève, force majeure, ba mesures ya administration, disponibilité ya ba partenaires ya transport (Frinco Reifen, Global Forwarding Germany GmbH, Transitaire Banga Ghislain).</p>
          <p><strong>(2)</strong> Soki biloko ezali na nzela to Mosalisi akoki kotindela na tango ya malamu, Mobii azali na droit te ya kozwa mbongo na ye kaka mpo na koleka tango.</p>
          <p><strong>(3)</strong> Soki kotindela ekoleka mpoka 3 sanza suka, Mosalisi akoyebisa Mobii.</p>
          <p><strong>(4)</strong> Soki kotindela esukaki te mpe moko ya ba raisons ya § 5(1) ezali te, Mobii akoki koboya kontara sima ya kopesa tango ya kolongo liboso.</p>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4 rounded-r">
            <p className="text-sm font-medium text-yellow-900"><strong>Liyebisi:</strong> Koleka tango kaka yango te epesaka droit ya kozwa mbongo soki kotindela ekoki kosalema naino.</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 6 Kozongisama ya mbongo</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Mbongo ezongisama kaka soki:</p>
          <ul className="list-disc ml-8 space-y-1">
            <li>Mosalisi akoki kotindela te (impossible definitif).</li>
            <li>Biloko ebungaki to epaswami na preuves.</li>
            <li>Mosalisi ye moko asukisi commande mpo na libota na ye.</li>
            <li>Loi to juridiction elobeli kozongisa.</li>
          </ul>
          <p className="mt-4"><strong>(2)</strong> Mbongo ezongisama te soki:</p>
          <ul className="list-disc ml-8 space-y-1">
            <li>Biloko ezali naino na nzela.</li>
            <li>Koleka tango ezali kaka na kati ya tango ya § 4(2).</li>
            <li>Koleka tango esalemaki na force majeure, douane to grève.</li>
            <li>Adresse oyo Mobii apesaki ezali ya ndenge te.</li>
            <li>Référence (numéro ya commande) ezalaki te na tango ya kobiya.</li>
          </ul>
          <p className="mt-4"><strong>(3)</strong> Kozongisama ya mbongo esalemaka na mpoka ya 14 jours ya mosala, na compte oyo Mobii asalelaki mpo na kobiya.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 7 Droit ya koboya commande ezali te (mibeko ya EU)</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Droit ya loi ya koboya commande na se ya § 312g BGB esalemaka kaka mpo na ba consommateurs oyo bafandaka na Allemagne to na Etat mosusu ya EU (tala "CGV Allemagne" oyo ezali na ye moko) mpe esalemaka te mpo na makontara ya mibeko oyo.</p>
          <p><strong>(2)</strong> Kasi Mosalisi apesaka na ba clients ya République du Congo, RDC mpe Cabinda (Angola) kozongisama ya mbongo na ba cas oyo elobelami na § 6 ya mibeko oyo.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 8 Propriété ya biloko</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Biloko ezali ya Mosalisi tii Mobii abiyi mbongo nyonso.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 9 Garantie</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Mpo na ba clients oyo bafandaka na République du Congo to République Démocratique du Congo, mibeko ya garantie ya OHADA esalema, mpo Etats oyo mibale ezali ba membres ya OHADA.</p>
          <p><strong>(2)</strong> Mpo na ba clients oyo bafandaka na Cabinda (Angola), mibeko ya garantie ya Angola esalema, mpo Angola ezali membre ya OHADA te.</p>
          <p><strong>(3)</strong> Ba défauts ya kolakisama esengeli kozeba na Mosalisi na mpoka ya 5 jours ya mosala soki biloko ekomi.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 10 Limite ya responsabilité</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Responsabilité ya penza mpo na blessures, moyo, nzoto mpe na tango ya nzela mabe ya mpenza.</p>
          <p><strong>(2)</strong> Na tango ya faute ya moke: responsabilité kaka mpo na dommages ya kolakisama, soki violation ya ba obligations ya ntina esalemi.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 11 Protection ya données ya personnelles</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Traitement ya données esalemaka na mibeko ya mboka mpe, soki esengeli, na RGPD. Détails ezali na politique ya confidentialité ya app.</p>
          <p><strong>(2)</strong> Ba coordonnées bancaires mpe ya contact esalemaka kaka mpo na coordination ya kobiya mpe kotindela.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 12 Résolution ya litiges mpe loi esalemaka</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Mpo na ba clients ya République du Congo mpe République Démocratique du Congo, mibeko ya ba Etats oyo, na kati na yango mibeko ya OHADA, esalemaka.</p>
          <p><strong>(2)</strong> Mpo na ba clients ya Cabinda (Angola), mibeko ya Angola esalemaka, mpo Angola ezali membre ya OHADA te.</p>
          <p><strong>(3)</strong> Mibeko ya protection ya consommateur ya pays oyo Mobii afandaka ezali naino na nguya.</p>
          <p><strong>(4)</strong> Tribunal ya ntina ezali, soki loi epesi nzela, oyo ya siège ya Mosalisi na Brazzaville, République du Congo.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">§ 13 Dispositions finales</h2>
        <div className="space-y-3 text-gray-700">
          <p><strong>(1)</strong> Ba clauses oyo ezali te na nguya ezali esanganisami na mibeko ya loi.</p>
          <p><strong>(2)</strong> Modification ya mibeko oyo ekopesama na ba Mobii na préavis ya 4 sanza na email to na app. Soki koboya te = acceptation.</p>
          <p><strong>(3)</strong> Esalema banda na mokolo ya publication na app.</p>
        </div>
      </section>
    </>
  );
}

