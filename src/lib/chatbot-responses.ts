import type { SupportedLanguage } from './detectLanguage';

type ResponseMap<T = string> = Record<SupportedLanguage, T>;

export const responses = {
  greeting: {
    de: `Hallo! 👋 Willkommen bei GermanLink Business.\nIch helfe Ihnen bei Produktanfragen, Bestellungen und Lieferinformationen.\nWas kann ich für Sie tun?`,
    fr: `Bonjour! 👋 Bienvenue chez GermanLink Business.\nJe vous aide pour les produits, commandes et livraisons.\nComment puis-je vous aider?`,
    en: `Hello! 👋 Welcome to GermanLink Business.\nI can help you with products, orders and delivery info.\nHow can I help you?`,
    ln: `Mbote! 👋 Boyei malamu na GermanLink Business.\nNakosalisa yo na mituna ya biloko, mitindo mpe kotinda.\nNakoloba nini mpo na yo?`
  } as ResponseMap,

  productFound: {
    de: (name: string, price: string, desc: string) =>
      `✅ Ja, wir haben **${name}** in unserem Sortiment!\n\n💰 Preis: ${price}€\n📦 ${desc}\n\n💳 Zahlung: 50% Anzahlung, 50% bei Lieferung\n🚢 Lieferung per Schiff oder ✈️ Express per Flugzeug\n\nMöchten Sie anfragen?`,
    fr: (name: string, price: string, desc: string) =>
      `✅ Oui, nous avons **${name}** dans notre catalogue!\n\n💰 Prix: ${price}€\n📦 ${desc}\n\n💳 Paiement: 50% à la commande, 50% à la livraison\n🚢 Livraison par bateau ou ✈️ express par avion\n\nVoulez-vous commander?`,
    en: (name: string, price: string, desc: string) =>
      `✅ Yes, we have **${name}** available!\n\n💰 Price: ${price}€\n📦 ${desc}\n\n💳 Payment: 50% deposit, 50% on delivery\n🚢 Shipping by sea or ✈️ express by air\n\nWould you like to order?`,
    ln: (name: string, price: string, desc: string) =>
      `✅ Iyo, tozali na **${name}** na liste na biso!\n\n💰 Ntalo: ${price}€\n📦 ${desc}\n\n💳 Mbongo: 50% liboso, 50% tango bazotinda\n🚢 Kotinda na masuwa to ✈️ na ndeke\n\nOlingi kotinda?`
  } as ResponseMap<(name: string, price: string, desc: string) => string>,

  productNotFound: {
    de: `Dieses Produkt ist nicht in unserem Katalog.\nUnser Team hilft gerne weiter:\n\n📧 info@germanlink.de\n📱 +49 175 5169452`,
    fr: `Ce produit n'est pas dans notre catalogue.\nNotre équipe peut vous aider:\n\n📧 info@germanlink.de\n📱 +49 175 5169452`,
    en: `This product is not in our catalog.\nOur team can help you:\n\n📧 info@germanlink.de\n📱 +49 175 5169452`,
    ln: `Eloko oyo ezali te na liste na biso.\nBato na biso bakosalisa yo:\n\n📧 info@germanlink.de\n📱 +49 175 5169452`
  } as ResponseMap,

  payment: {
    de: `💳 Zahlungsbedingungen:\n• 50% Anzahlung bei Bestellung\n• 50% bei Lieferung\n\nWir akzeptieren Banküberweisung.`,
    fr: `💳 Conditions de paiement:\n• 50% à la commande\n• 50% à la livraison\n\nNous acceptons les virements bancaires.`,
    en: `💳 Payment terms:\n• 50% deposit on order\n• 50% on delivery\n\nWe accept bank transfers.`,
    ln: `💳 Ndenge ya kofuta:\n• 50% liboso tango otindi\n• 50% tango bazotinda\n\nTosikilaka mbongo na banki.`
  } as ResponseMap,

  delivery: {
    de: `🚢 Lieferoptionen:\n• Standard: Per Schiff\n• Express: Per Flugzeug ✈️\n\nGenaue Zeiten & Kosten bei Bestellung.`,
    fr: `🚢 Options de livraison:\n• Standard: Par bateau\n• Express: Par avion ✈️\n\nDétails communiqués à la commande.`,
    en: `🚢 Delivery options:\n• Standard: By sea\n• Express: By air ✈️\n\nExact times & costs given at order.`,
    ln: `🚢 Ndenge ya kotinda:\n• Standard: Na masuwa\n• Express: Na ndeke ✈️\n\nMingi emonisama tango otindi.`
  } as ResponseMap,

  contact: {
    de: `📞 Kundenservice:\n📧 info@germanlink.de\n📱 +49 175 5169452\n⏰ Mo–Fr, 9:00–18:00 Uhr`,
    fr: `📞 Service client:\n📧 info@germanlink.de\n📱 +49 175 5169452\n⏰ Lun–Ven, 9h–18h`,
    en: `📞 Customer service:\n📧 info@germanlink.de\n📱 +49 175 5169452\n⏰ Mon–Fri, 9AM–6PM`,
    ln: `📞 Lisalisi ya bakliyango:\n📧 info@germanlink.de\n📱 +49 175 5169452\n⏰ Mokolo–Lomingo, 9h–18h`
  } as ResponseMap,

  outOfScope: {
    de: `Ich bin für GermanLink Business konfiguriert.\nKann ich Ihnen mit einem Produkt oder einer Bestellung helfen?`,
    fr: `Je suis configuré pour GermanLink Business.\nPuis-je vous aider avec un produit ou une commande?`,
    en: `I'm configured for GermanLink Business only.\nCan I help you with a product or order?`,
    ln: `Nasalemi mpo na GermanLink Business kaka.\nNakosalisa yo na eloko to litindo?`
  } as ResponseMap,

  default: {
    de: `Danke für Ihre Nachricht!\nFür Details kontaktieren Sie:\n📧 info@germanlink.de\n📱 +49 175 5169452`,
    fr: `Merci pour votre message!\nPour plus de détails:\n📧 info@germanlink.de\n📱 +49 175 5169452`,
    en: `Thanks for your message!\nFor more details:\n📧 info@germanlink.de\n📱 +49 175 5169452`,
    ln: `Melesi na sango na yo!\nMpo na mingi:\n📧 info@germanlink.de\n📱 +49 175 5169452`
  } as ResponseMap
};
