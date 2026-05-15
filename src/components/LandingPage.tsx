import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Shield,
  Truck,
  Award,
  CheckCircle,
  TrendingUp,
  Users,
  Building2,
  Wrench,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Target,
  Globe,
  ChevronDown,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

type Language = 'de' | 'fr' | 'ln';

const translations = {
  de: {
    languageNames: {
      de: 'Deutsch',
      fr: 'Français',
      ln: 'Lingala'
    },
    hero: {
      title: 'GermanLink Business',
      tagline: 'Deutsche Qualität. Echtes Vertrauen. Starkes Business.',
      subtitle: 'Kaufe Originalprodukte Made in Germany – direkt aus Deutschland, sicher geliefert in den Kongo. Für dein Business. Für deine Zukunft. Für die Entwicklung deines Landes.',
      cta: 'Jetzt starten',
      badges: {
        madeInGermany: 'Made in Germany',
        secureDelivery: 'Sichere Lieferung',
        verifiedQuality: 'Geprüfte Qualität'
      }
    },
    problem: {
      title: 'Das Problem',
      subtitle: 'Zu viele Unternehmer und Händler verlieren Geld durch:',
      points: [
        {
          title: 'Billige Produkte ohne Qualität',
          description: 'Minderwertige Waren, die schnell kaputt gehen und dein Business schädigen'
        },
        {
          title: 'Gefährliche oder gefälschte Waren',
          description: 'Unsichere Produkte ohne Zertifikate, die deine Kunden gefährden'
        },
        {
          title: 'Fehlende Garantie und kein Vertrauen',
          description: 'Keine Sicherheit, kein Support, keine langfristige Perspektive'
        }
      ],
      conclusion: 'Das bremst Business, Wachstum und die Entwicklung des Landes.'
    },
    solution: {
      title: 'Die Lösung',
      subtitle: 'GermanLink Business verbindet dich direkt mit Deutschland.',
      features: [
        {
          title: 'Geprüfte deutsche Produkte',
          description: 'Jedes Produkt wird kontrolliert und stammt direkt aus Deutschland'
        },
        {
          title: 'Echte Qualität – keine Fälschungen',
          description: 'Originalware mit Garantie und Zertifikaten'
        },
        {
          title: 'Sichere Bezahlung',
          description: 'Geschützte Zahlungsmethoden für deine Sicherheit'
        },
        {
          title: 'Lieferung direkt in den Kongo',
          description: 'Container-Versand direkt zu dir – transparent und nachverfolgbar'
        },
        {
          title: 'Ideal für Händler & Unternehmer',
          description: 'Großmengen, Geschäftskunden-Support und faire Preise'
        },
        {
          title: 'Entwicklungsprojekte unterstützen',
          description: 'Qualität für nachhaltige Entwicklung und Infrastruktur'
        }
      ]
    },
    mission: {
      title: 'Unsere Mission',
      subtitle: 'Afrikanische Businesses stärken – mit deutscher Qualität.',
      whenYouBuyBetter: 'Wenn du besser einkaufst:',
      points: [
        {
          title: 'Wächst dein Unternehmen',
          description: 'Mit besserer Qualität gewinnst du mehr Kunden und steigerst deinen Umsatz'
        },
        {
          title: 'Entstehen Arbeitsplätze',
          description: 'Starke Unternehmen schaffen sichere Jobs und fördern die lokale Wirtschaft'
        },
        {
          title: 'Entwickelst du dein Land nachhaltig',
          description: 'Qualität baut Vertrauen und langfristige Perspektiven für die Zukunft'
        }
      ],
      conclusion: 'Wenn du besser einkaufst, baust du eine bessere Zukunft.',
      cta: 'Starte jetzt'
    },
    whyGermany: {
      title: 'Warum Deutschland?',
      subtitle: 'Deutschland steht weltweit für:',
      values: ['Qualität', 'Zuverlässigkeit', 'Technik', 'Sicherheit'],
      conclusion: 'Mit GermanLink Business kommt dieses Vertrauen direkt zu dir – ohne Umwege.'
    },
    forWhom: {
      title: 'Für wen ist GermanLink Business?',
      targets: [
        {
          title: 'Unternehmer & Händler',
          description: 'Erweitere dein Sortiment mit hochwertigen deutschen Produkten und gewinne das Vertrauen deiner Kunden'
        },
        {
          title: 'Start-ups im Kongo',
          description: 'Starte dein Business mit der besten Grundlage – deutsche Qualität für nachhaltigen Erfolg'
        },
        {
          title: 'Bau-, Technik- & Handelsprojekte',
          description: 'Zuverlässige Materialien und Werkzeuge für professionelle Projekte'
        },
        {
          title: 'Unternehmen mit Fokus auf Qualität',
          description: 'Für alle, die nachhaltig wachsen und echten Mehrwert schaffen wollen'
        }
      ]
    },
    cta: {
      title: 'Starte dein Business mit echter Qualität',
      subtitle: 'Bestelle direkt aus Deutschland',
      tagline: 'Baue Vertrauen. Baue Zukunft.',
      button: 'Jetzt starten mit GermanLink Business',
      lingalaQuote: 'GermanLink Business ist die direkte Verbindung zwischen Deutschland und dem Kongo. Echte Qualität. Vertrauen. Entwicklung für Unternehmen und das Land.'
    },
    footer: {
      tagline: 'Deutsche Qualität für afrikanisches Business',
      navigation: 'Navigation',
      contact: 'Kontakt',
      sections: {
        problem: 'Das Problem',
        solution: 'Die Lösung',
        mission: 'Unsere Mission',
        forWhom: 'Für wen?'
      },
      copyright: '2026 GermanLink Business. Deutsche Qualität für den Kongo.'
    }
  },
  fr: {
    languageNames: {
      de: 'Allemand',
      fr: 'Français',
      ln: 'Lingala'
    },
    hero: {
      title: 'GermanLink Business',
      tagline: 'Qualité allemande. Vraie confiance. Business fort.',
      subtitle: 'Achetez des produits originaux Made in Germany – directement d\'Allemagne, livrés en toute sécurité au Congo. Pour votre business. Pour votre avenir. Pour le développement de votre pays.',
      cta: 'Commencer maintenant',
      badges: {
        madeInGermany: 'Made in Germany',
        secureDelivery: 'Livraison sécurisée',
        verifiedQuality: 'Qualité vérifiée'
      }
    },
    problem: {
      title: 'Le Problème',
      subtitle: 'Trop d\'entrepreneurs et de commerçants perdent de l\'argent à cause de:',
      points: [
        {
          title: 'Produits bon marché sans qualité',
          description: 'Marchandises de qualité inférieure qui se cassent rapidement et nuisent à votre business'
        },
        {
          title: 'Marchandises dangereuses ou contrefaites',
          description: 'Produits non sécurisés sans certificats qui mettent vos clients en danger'
        },
        {
          title: 'Absence de garantie et de confiance',
          description: 'Pas de sécurité, pas de support, pas de perspective à long terme'
        }
      ],
      conclusion: 'Cela freine le business, la croissance et le développement du pays.'
    },
    solution: {
      title: 'La Solution',
      subtitle: 'GermanLink Business vous connecte directement avec l\'Allemagne.',
      features: [
        {
          title: 'Produits allemands vérifiés',
          description: 'Chaque produit est contrôlé et provient directement d\'Allemagne'
        },
        {
          title: 'Vraie qualité – pas de contrefaçons',
          description: 'Marchandises originales avec garantie et certificats'
        },
        {
          title: 'Paiement sécurisé',
          description: 'Méthodes de paiement protégées pour votre sécurité'
        },
        {
          title: 'Livraison directe au Congo',
          description: 'Expédition par conteneur directement chez vous – transparente et traçable'
        },
        {
          title: 'Idéal pour commerçants & entrepreneurs',
          description: 'Grandes quantités, support clients professionnels et prix équitables'
        },
        {
          title: 'Soutien aux projets de développement',
          description: 'Qualité pour le développement durable et l\'infrastructure'
        }
      ]
    },
    mission: {
      title: 'Notre Mission',
      subtitle: 'Renforcer les businesses africains – avec la qualité allemande.',
      whenYouBuyBetter: 'Quand vous achetez mieux:',
      points: [
        {
          title: 'Votre entreprise grandit',
          description: 'Avec une meilleure qualité, vous gagnez plus de clients et augmentez votre chiffre d\'affaires'
        },
        {
          title: 'Des emplois se créent',
          description: 'Les entreprises fortes créent des emplois sûrs et stimulent l\'économie locale'
        },
        {
          title: 'Vous développez durablement votre pays',
          description: 'La qualité construit la confiance et des perspectives à long terme pour l\'avenir'
        }
      ],
      conclusion: 'Quand vous achetez mieux, vous construisez un meilleur avenir.',
      cta: 'Commencer maintenant'
    },
    whyGermany: {
      title: 'Pourquoi l\'Allemagne?',
      subtitle: 'L\'Allemagne est reconnue mondialement pour:',
      values: ['Qualité', 'Fiabilité', 'Technologie', 'Sécurité'],
      conclusion: 'Avec GermanLink Business, cette confiance arrive directement chez vous – sans détour.'
    },
    forWhom: {
      title: 'Pour qui est GermanLink Business?',
      targets: [
        {
          title: 'Entrepreneurs & commerçants',
          description: 'Élargissez votre gamme avec des produits allemands de haute qualité et gagnez la confiance de vos clients'
        },
        {
          title: 'Start-ups au Congo',
          description: 'Démarrez votre business avec la meilleure base – qualité allemande pour un succès durable'
        },
        {
          title: 'Projets de construction, technique & commerce',
          description: 'Matériaux et outils fiables pour des projets professionnels'
        },
        {
          title: 'Entreprises axées sur la qualité',
          description: 'Pour tous ceux qui veulent croître durablement et créer une vraie valeur ajoutée'
        }
      ]
    },
    cta: {
      title: 'Démarrez votre business avec une vraie qualité',
      subtitle: 'Commandez directement depuis l\'Allemagne',
      tagline: 'Construisez la confiance. Construisez l\'avenir.',
      button: 'Commencer avec GermanLink Business',
      lingalaQuote: 'GermanLink Business est le lien direct entre l’Allemagne et le Congo. Qualité réelle. Confiance. Développement pour les entreprises et le pay'
    },
    footer: {
      tagline: 'Qualité allemande pour le business africain',
      navigation: 'Navigation',
      contact: 'Contact',
      sections: {
        problem: 'Le Problème',
        solution: 'La Solution',
        mission: 'Notre Mission',
        forWhom: 'Pour qui?'
      },
      copyright: '2026 GermanLink Business. Qualité allemande pour le Congo.'
    }
  },
  ln: {
    languageNames: {
      de: 'Allemand',
      fr: 'Français',
      ln: 'Lingala'
    },
    hero: {
      title: 'GermanLink Business',
      tagline: 'Qualité ya Allemagne. Confiance ya solo. Business makasi.',
      subtitle: 'Somba biloko ya solo Made in Germany – banda Allemagne, ekokoma na sécurité na Congo. Pona business na yo. Pona avenir na yo. Pona développement ya mboka na yo.',
      cta: 'Bandá sikoyo',
      badges: {
        madeInGermany: 'Made in Germany',
        secureDelivery: 'Livraison na sécurité',
        verifiedQuality: 'Qualité oyo batalami'
      }
    },
    problem: {
      title: 'Problème',
      subtitle: 'Ba entrepreneurs mpe ba commerçants mingi bazali kobungisa mbongo mpo na:',
      points: [
        {
          title: 'Biloko ya ntalo te ezanga qualité',
          description: 'Biloko ya pamba oyo ekobukana nokinoki mpe ekobebisa business na yo'
        },
        {
          title: 'Biloko ya danger to biloko ya lokuta',
          description: 'Biloko ya danger ezanga ba certificats oyo ekotya ba clients na yo na danger'
        },
        {
          title: 'Garantie ezali te mpe confiance ezali te',
          description: 'Sécurité ezali te, support ezali te, perspective ya mokolo molayi ezali te'
        }
      ],
      conclusion: 'Yango ezali kokanga business, croissance mpe développement ya mboka.'
    },
    solution: {
      title: 'Solution',
      subtitle: 'GermanLink Business ezali kokangisa yo directement na Allemagne.',
      features: [
        {
          title: 'Biloko ya Allemagne oyo batalami malamu',
          description: 'Biloko nyonso batalami mpe euti directement na Allemagne'
        },
        {
          title: 'Qualité ya solo – lokuta te',
          description: 'Biloko ya original na garantie mpe ba certificats'
        },
        {
          title: 'Kofuta na sécurité',
          description: 'Ba méthodes ya kofuta oyo ebatelami pona sécurité na yo'
        },
        {
          title: 'Livraison directe na Congo',
          description: 'Expédition ya container directement epai na yo – transparent mpe okoki kolanda'
        },
        {
          title: 'Malamu pona ba commerçants & ba entrepreneurs',
          description: 'Ba quantités minene, support ya ba clients professionnels mpe ba prix ya justice'
        },
        {
          title: 'Kosunga ba projets ya développement',
          description: 'Qualité pona développement durable mpe infrastructure'
        }
      ]
    },
    mission: {
      title: 'Mission na biso',
      subtitle: 'Kolendisa ba business ya Afrique – na qualité ya Allemagne.',
      whenYouBuyBetter: 'Ntango ozali kosomba malamu:',
      points: [
        {
          title: 'Entreprise na yo ekokóla',
          description: 'Na qualité ya malamu, okozwa ba clients ebele mpe okomatisa chiffre d\'affaires na yo'
        },
        {
          title: 'Misala ekobima',
          description: 'Ba entreprises ya makasi ekosala ba emplois ya sûr mpe ekotombola économie locale'
        },
        {
          title: 'Okotongisa mboka na yo na ndenge ya durée',
          description: 'Qualité etongaka confiance mpe ba perspectives ya mokolo molayi pona avenir'
        }
      ],
      conclusion: 'Ntango ozali kosomba malamu, ozali kotonga avenir ya malamu.',
      cta: 'Bandá sikoyo'
    },
    whyGermany: {
      title: 'Mpo na nini Allemagne?',
      subtitle: 'Allemagne eyebani na mokili mobimba pona:',
      values: ['Qualité', 'Fiabilité', 'Technologie', 'Sécurité'],
      conclusion: 'Na GermanLink Business, confiance oyo ekokoma directement epai na yo – na nzela moko.'
    },
    forWhom: {
      title: 'GermanLink Business ezali pona nani?',
      targets: [
        {
          title: 'Ba entrepreneurs & ba commerçants',
          description: 'Kolongola gamme na yo na biloko ya Allemagne ya qualité ya likolo mpe zwa confiance ya ba clients na yo'
        },
        {
          title: 'Ba start-ups na Congo',
          description: 'Bandá business na yo na base ya malamu – qualité ya Allemagne pona succès ya durée'
        },
        {
          title: 'Ba projets ya botongami, technique & commerce',
          description: 'Ba matériaux mpe ba outils ya confiance pona ba projets professionnels'
        },
        {
          title: 'Ba entreprises oyo balingi qualité',
          description: 'Pona bato nyonso oyo balingi kokóla na ndenge ya durée mpe kosala valeur ya solo'
        }
      ]
    },
    cta: {
      title: 'Bandá business na yo na qualité ya solo',
      subtitle: 'Tomba directement banda Allemagne',
      tagline: 'Tonga confiance. Tonga avenir.',
      button: 'Bandá na GermanLink Business',
      lingalaQuote: 'GermanLink Business ezali lien direct entre Allemagne na Congo. Qualité ya solo. Confiance. Développement ya business mpe mboka.'
    },
    footer: {
      tagline: 'Qualité ya Allemagne pona business ya Afrique',
      navigation: 'Navigation',
      contact: 'Contact',
      sections: {
        problem: 'Problème',
        solution: 'Solution',
        mission: 'Mission na biso',
        forWhom: 'Pona nani?'
      },
      copyright: '2026 GermanLink Business. Qualité ya Allemagne pona Congo.'
    }
  }
};

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('germanlink_language') as Language;
    if (savedLanguage && ['de', 'fr', 'ln'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('germanlink_language', lang);
  };

  const t = translations[language];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-0.5">
                <div className="w-2.5 h-8 bg-[#000000] rounded-sm"></div>
                <div className="w-2.5 h-8 bg-[#DD0000] rounded-sm"></div>
                <div className="w-2.5 h-8 bg-[#FFCE00] rounded-sm"></div>
              </div>
              <div>
                <div className="text-lg font-black text-[#1C1C1C] leading-none tracking-tight">GLB</div>
                <div className="text-xs font-semibold text-[#0A5EB0] leading-none">GermanLink Business</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => changeLanguage('de')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    language === 'de'
                      ? 'bg-[#DD0000] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🇩🇪 DE
                </button>
                <button
                  onClick={() => changeLanguage('fr')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    language === 'fr'
                      ? 'bg-[#DD0000] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🇫🇷 FR
                </button>
                <button
                  onClick={() => changeLanguage('ln')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    language === 'ln'
                      ? 'bg-[#DD0000] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🇨🇩 LN
                </button>
              </div>

              <button
                onClick={onGetStarted}
                className="bg-[#DD0000] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#BB0000] transition shadow-lg hidden sm:block"
              >
                {t.hero.cta}
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#DD0000] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFCE00] rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#009543] rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="flex space-x-1">
                <div className="w-3 h-12 bg-[#000000] rounded"></div>
                <div className="w-3 h-12 bg-[#DD0000] rounded"></div>
                <div className="w-3 h-12 bg-[#FFCE00] rounded"></div>
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              {t.hero.title}
            </h1>

            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FFCE00] mb-4">
              {t.hero.tagline}
            </p>

            <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              {t.hero.subtitle}
            </p>

            <button
              onClick={onGetStarted}
              className="bg-[#DD0000] text-white px-10 py-5 rounded-lg text-xl font-bold hover:bg-[#BB0000] transition shadow-2xl inline-flex items-center space-x-3"
            >
              <span>{t.hero.cta}</span>
              <ArrowRight className="w-6 h-6" />
            </button>

            <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center space-x-2 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <Shield className="w-5 h-5 text-[#FFCE00]" />
                <span>{t.hero.badges.madeInGermany}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <CheckCircle className="w-5 h-5 text-[#009543]" />
                <span>{t.hero.badges.secureDelivery}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
                <Award className="w-5 h-5 text-[#DD0000]" />
                <span>{t.hero.badges.verifiedQuality}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/50" />
        </div>
      </section>

      <section id="problem" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <AlertCircle className="w-16 h-16 text-[#DD0000] mx-auto mb-4" />
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {t.problem.title}
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              {t.problem.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {t.problem.points.map((point, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-[#DD0000]">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {index === 0 && <AlertCircle className="w-8 h-8 text-[#DD0000]" />}
                  {index === 1 && <Shield className="w-8 h-8 text-[#DD0000]" />}
                  {index === 2 && <CheckCircle className="w-8 h-8 text-[#DD0000]" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {point.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {point.description}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-[#DD0000] text-white p-8 rounded-xl text-center">
            <p className="text-2xl font-bold">
              {t.problem.conclusion}
            </p>
          </div>
        </div>
      </section>

      <section id="solution" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Sparkles className="w-16 h-16 text-[#FFCE00] mx-auto mb-4" />
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {t.solution.title}
            </h2>
            <p className="text-2xl text-gray-700 max-w-3xl mx-auto font-semibold">
              {t.solution.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.solution.features.map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition border border-gray-200">
                <div className="w-16 h-16 bg-[#009543] bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                  {index === 0 && <CheckCircle className="w-8 h-8 text-[#009543]" />}
                  {index === 1 && <Award className="w-8 h-8 text-[#009543]" />}
                  {index === 2 && <Shield className="w-8 h-8 text-[#009543]" />}
                  {index === 3 && <Truck className="w-8 h-8 text-[#009543]" />}
                  {index === 4 && <TrendingUp className="w-8 h-8 text-[#009543]" />}
                  {index === 5 && <Building2 className="w-8 h-8 text-[#009543]" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="mission" className="py-20 bg-gradient-to-br from-[#009543] to-[#007535] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Target className="w-16 h-16 text-white mx-auto mb-4" />
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              {t.mission.title}
            </h2>
            <p className="text-2xl font-semibold mb-8">
              {t.mission.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {t.mission.points.map((point, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
                {index === 0 && <TrendingUp className="w-12 h-12 text-[#FFCE00] mb-4" />}
                {index === 1 && <Users className="w-12 h-12 text-[#FFCE00] mb-4" />}
                {index === 2 && <Globe className="w-12 h-12 text-[#FFCE00] mb-4" />}
                <h3 className="text-2xl font-bold mb-3">{point.title}</h3>
                <p className="text-lg text-white/90">
                  {point.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-2xl font-bold mb-6">
              {t.mission.conclusion}
            </p>
            <button
              onClick={onGetStarted}
              className="bg-white text-[#009543] px-10 py-5 rounded-lg text-xl font-bold hover:bg-gray-100 transition shadow-2xl inline-flex items-center space-x-3"
            >
              <span>{t.mission.cta}</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      <section id="why-germany" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-1 mb-6">
              <div className="w-4 h-16 bg-[#000000] rounded"></div>
              <div className="w-4 h-16 bg-[#DD0000] rounded"></div>
              <div className="w-4 h-16 bg-[#FFCE00] rounded"></div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {t.whyGermany.title}
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              {t.whyGermany.subtitle}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {t.whyGermany.values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg text-center">
                {index === 0 && <Award className="w-16 h-16 text-[#DD0000] mx-auto mb-4" />}
                {index === 1 && <CheckCircle className="w-16 h-16 text-[#DD0000] mx-auto mb-4" />}
                {index === 2 && <Wrench className="w-16 h-16 text-[#DD0000] mx-auto mb-4" />}
                {index === 3 && <Shield className="w-16 h-16 text-[#DD0000] mx-auto mb-4" />}
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-[#000000] via-[#DD0000] to-[#FFCE00] text-white p-8 rounded-xl text-center">
            <p className="text-2xl font-bold">
              {t.whyGermany.conclusion}
            </p>
          </div>
        </div>
      </section>

      <section id="for-whom" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Users className="w-16 h-16 text-[#009543] mx-auto mb-4" />
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {t.forWhom.title}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {t.forWhom.targets.map((target, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-10 rounded-xl shadow-lg border-l-4 border-[#009543]">
                {index === 0 && <ShoppingCart className="w-12 h-12 text-[#009543] mb-4" />}
                {index === 1 && <TrendingUp className="w-12 h-12 text-[#009543] mb-4" />}
                {index === 2 && <Building2 className="w-12 h-12 text-[#009543] mb-4" />}
                {index === 3 && <Globe className="w-12 h-12 text-[#009543] mb-4" />}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {target.title}
                </h3>
                <p className="text-lg text-gray-600">
                  {target.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cta" className="py-24 bg-gradient-to-br from-[#DD0000] to-[#BB0000] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            {t.cta.title}
          </h2>
          <p className="text-2xl mb-4">
            {t.cta.subtitle}
          </p>
          <p className="text-3xl font-bold text-[#FFCE00] mb-10">
            {t.cta.tagline}
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-[#DD0000] px-12 py-6 rounded-lg text-2xl font-bold hover:bg-gray-100 transition shadow-2xl inline-flex items-center space-x-4"
          >
            <span>{t.cta.button}</span>
            <ArrowRight className="w-8 h-8" />
          </button>

          <div className="mt-12 pt-12 border-t border-white/30">
            <p className="text-lg text-white/90 italic">
              "{t.cta.lingalaQuote}"
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-8 bg-[#000000]"></div>
                  <div className="w-2 h-8 bg-[#DD0000]"></div>
                  <div className="w-2 h-8 bg-[#FFCE00]"></div>
                </div>
                <h3 className="text-xl font-bold">GermanLink Business</h3>
              </div>
              <p className="text-gray-400">
                {t.footer.tagline}
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">{t.footer.navigation}</h4>
              <div className="space-y-2">
                <button onClick={() => scrollToSection('problem')} className="block text-gray-400 hover:text-white transition">
                  {t.footer.sections.problem}
                </button>
                <button onClick={() => scrollToSection('solution')} className="block text-gray-400 hover:text-white transition">
                  {t.footer.sections.solution}
                </button>
                <button onClick={() => scrollToSection('mission')} className="block text-gray-400 hover:text-white transition">
                  {t.footer.sections.mission}
                </button>
                <button onClick={() => scrollToSection('for-whom')} className="block text-gray-400 hover:text-white transition">
                  {t.footer.sections.forWhom}
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">{t.footer.contact}</h4>
              <p className="text-gray-400 mb-2">
                kizomba-global-post@web.de
              </p>
              <div className="flex items-center space-x-2 mt-4">
                <Shield className="w-5 h-5 text-[#FFCE00]" />
                <span className="text-sm text-gray-400">Made in Germany</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="text-center mb-4">
              <button
                onClick={() => window.location.href = '/agb'}
                className="text-gray-400 hover:text-white underline bg-transparent border-none cursor-pointer"
              >
                AGB & Lieferbedingungen
              </button>
            </div>
            <div className="text-center text-gray-400">
              <p>&copy; {t.footer.copyright}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
