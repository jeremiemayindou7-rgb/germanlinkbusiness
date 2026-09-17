import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'de' | 'fr' | 'ln' | 'en';

// ── Währung je Sprache ────────────────────────────────────────────────────────
// de → Euro, fr + ln → Franc CFA, en → Nigerianischer Naira (für Kunden aus Nigeria)
// Kurs XAF: 1 € ≈ 655.957 XAF (fester Kurs, an den Euro gekoppelt)
// Kurs NGN: 1 € ≈ 1600 NGN (Näherungswert, NGN ist NICHT gekoppelt und schwankt
// stark — diesen Wert regelmäßig gegen einen aktuellen Kurs prüfen/aktualisieren,
// z.B. über https://wise.com/us/currency-converter/eur-to-ngn-rate/ oder eine
// Wechselkurs-API).
export const CURRENCY_CONFIG: Record<Language, {
  symbol: string;
  code: string;
  rate: number;       // Multiplikator von EUR
  decimals: number;   // Nachkommastellen
}> = {
  de: { symbol: '€',       code: 'EUR',  rate: 1,       decimals: 2 },
  fr: { symbol: 'F CFA',   code: 'XAF',  rate: 655.957, decimals: 0 },
  ln: { symbol: 'F CFA',   code: 'XAF',  rate: 655.957, decimals: 0 },
  en: { symbol: '₦',       code: 'NGN',  rate: 1600,    decimals: 0 },
};

// Hilfsfunktion: Preis in EUR → lokale Währung formatieren
export function formatPrice(priceEur: number, language: Language): string {
  const cfg = CURRENCY_CONFIG[language];
  const converted = priceEur * cfg.rate;
  const localeMap: Record<Language, string> = {
    de: 'de-DE',
    fr: 'fr-FR',
    ln: 'fr-FR',
    en: 'en-NG',
  };
  const formatted = converted.toLocaleString(
    localeMap[language],
    { minimumFractionDigits: cfg.decimals, maximumFractionDigits: cfg.decimals }
  );
  return `${formatted} ${cfg.symbol}`;
}

interface Translations {
  [key: string]: {
    de: string;
    fr: string;
    ln: string;
    en: string;
  };
}

const translations: Translations = {
  app_title: { de: 'GermanLink Business', fr: 'GermanLink Business', ln: 'GermanLink Business', en: 'GermanLink Business' },
  search_placeholder: { de: 'Produkte suchen...', fr: 'Rechercher des produits...', ln: 'Luka biloko...', en: 'Search products...' },
  categories: { de: 'Kategorien', fr: 'Catégories', ln: 'Mitindo', en: 'Categories' },
  all_categories: { de: 'Alle Kategorien', fr: 'Toutes catégories', ln: 'Mitindo nyonso', en: 'All categories' },
  electronics: { de: 'Elektronik', fr: 'Électronique', ln: 'Ba-électronique', en: 'Electronics' },
  clothing: { de: 'Kleidung', fr: 'Vêtements', ln: 'Bilamba', en: 'Clothing' },
  furniture: { de: 'Möbel', fr: 'Meubles', ln: 'Bamesa', en: 'Furniture' },
  household: { de: 'Haushalt', fr: 'Maison', ln: 'Ndako', en: 'Household' },
  auto_motor: { de: 'Auto & Motor', fr: 'Auto & Moto', ln: 'Mituka & Moto', en: 'Auto & Motor' },
  other: { de: 'Sonstiges', fr: 'Autres', ln: 'Mosusu', en: 'Other' },
  login: { de: 'Anmelden', fr: 'Connexion', ln: 'Kokota', en: 'Login' },
  register: { de: 'Registrieren', fr: "S'inscrire", ln: 'Kokoma nkombo', en: 'Register' },
  logout: { de: 'Abmelden', fr: 'Déconnexion', ln: 'Kobima', en: 'Logout' },
  cart: { de: 'Warenkorb', fr: 'Panier', ln: 'Panier', en: 'Cart' },
  profile: { de: 'Profil', fr: 'Profil', ln: 'Profil', en: 'Profile' },
  admin: { de: 'Verwaltung', fr: 'Administration', ln: 'Administration', en: 'Administration' },
  european_quality: { de: 'Garantierte europäische Qualität', fr: 'Qualité européenne garantie', ln: 'Qualité ya Europe esimbami', en: 'Guaranteed European quality' },
  monthly_shipping: { de: 'Sichere monatliche Lieferung', fr: 'Envoi mensuel sécurisé', ln: 'Envoi ya sanza oyo ebatelami', en: 'Secure monthly shipping' },
  next_shipment: { de: 'Nächste Lieferung', fr: 'Prochain envoi', ln: 'Envoi oyo elandi', en: 'Next shipment' },
  next_shipment_desc: { de: 'Ihre Bestellung wird beim nächsten monatlichen Versand verschickt', fr: 'Votre commande sera expédiée lors du prochain envoi mensuel', ln: 'Commande na yo ekotindama na envoi oyo elandi ya sanza', en: 'Your order will be shipped with the next monthly shipment' },
  condition: { de: 'Zustand', fr: 'État', ln: 'Ndenge ezali', en: 'Condition' },
  new: { de: 'Neu', fr: 'Neuf', ln: 'Ya sika', en: 'New' },
  very_good: { de: 'Sehr gut', fr: 'Très bon', ln: 'Malamu mpenza', en: 'Very good' },
  good: { de: 'Gut', fr: 'Bon', ln: 'Malamu', en: 'Good' },
  acceptable: { de: 'Akzeptabel', fr: 'Acceptable', ln: 'Ekoki', en: 'Acceptable' },
  price: { de: 'Preis', fr: 'Prix', ln: 'Ntalo', en: 'Price' },
  add_to_cart: { de: 'In den Warenkorb', fr: 'Ajouter au panier', ln: 'Tyá na panier', en: 'Add to cart' },
  contact_seller: { de: 'Verkäufer kontaktieren', fr: 'Contacter le vendeur', ln: 'Benga moteki', en: 'Contact seller' },
  loading: { de: 'Lädt...', fr: 'Chargement...', ln: 'Ezali kotanga...', en: 'Loading...' },
  added_to_cart: { de: 'In den Warenkorb gelegt!', fr: 'Ajouté au panier!', ln: 'Ebakisami na panier!', en: 'Added to cart!' },
  view_details: { de: 'Details ansehen', fr: 'Voir détails', ln: 'Tála makambo', en: 'View details' },
  email: { de: 'E-Mail', fr: 'Email', ln: 'Email', en: 'Email' },
  password: { de: 'Passwort', fr: 'Mot de passe', ln: 'Mot de passe', en: 'Password' },
  name: { de: 'Vollständiger Name', fr: 'Nom complet', ln: 'Nkombo mobimba', en: 'Full name' },
  phone: { de: 'Telefon', fr: 'Téléphone', ln: 'Telefone', en: 'Phone' },
  whatsapp: { de: 'WhatsApp', fr: 'WhatsApp', ln: 'WhatsApp', en: 'WhatsApp' },
  delivery_address: { de: 'Lieferadresse in Brazzaville', fr: 'Adresse de livraison à Brazzaville', ln: 'Adresse ya livraison na Brazzaville', en: 'Delivery address in Brazzaville' },
  notification_preferences: { de: 'Benachrichtigungseinstellungen', fr: 'Préférences de notification', ln: 'Makambo ya koyeba', en: 'Notification preferences' },
  save: { de: 'Speichern', fr: 'Enregistrer', ln: 'Kobomba', en: 'Save' },
  cancel: { de: 'Abbrechen', fr: 'Annuler', ln: 'Kotika', en: 'Cancel' },
  close: { de: 'Schließen', fr: 'Fermer', ln: 'Kofunga', en: 'Close' },
  checkout: { de: 'Bestellen', fr: 'Commander', ln: 'Kosomba', en: 'Checkout' },
  subtotal: { de: 'Zwischensumme', fr: 'Sous-total', ln: 'Ntalo ya moke', en: 'Subtotal' },
  shipping: { de: 'Versandkosten', fr: 'Frais de port', ln: 'Mbongo ya kotinda', en: 'Shipping cost' },
  total: { de: 'Gesamt', fr: 'Total', ln: 'Nyonso', en: 'Total' },
  to_pay_now: { de: 'Jetzt zu zahlen', fr: 'À payer maintenant', ln: 'Kofuta sikoyo', en: 'To pay now' },
  payment_options: { de: 'Zahlungsoptionen', fr: 'Options de paiement', ln: 'Ndenge ya kofuta', en: 'Payment options' },
  full_payment: { de: 'Vollständige Zahlung', fr: 'Paiement complet', ln: 'Kofuta nyonso', en: 'Full payment' },
  deposit_50: { de: 'Anzahlung 50%', fr: 'Acompte 50%', ln: 'Kofuta ndambo (50%)', en: 'Deposit 50%' },
  pay_now_prefix: { de: 'Jetzt', fr: 'Payer', ln: 'Futa', en: 'Pay' },
  pay_now_suffix: { de: 'bezahlen', fr: 'maintenant', ln: 'sikoyo', en: 'now' },
  deposit_rest_note: { de: 'jetzt, Rest bei Lieferung', fr: 'maintenant, le reste à la livraison', ln: 'sikoyo, oyo etikali na livraison', en: 'now, remainder on delivery' },
  payment_method_title: { de: 'Zahlungsmethode', fr: 'Méthode de paiement', ln: 'Ndenge ya kofuta', en: 'Payment method' },
  lemfi_method_name: { de: 'Banküberweisung via LemFi', fr: 'Virement bancaire via LemFi', ln: 'Kobakisa mbongo na LemFi', en: 'Bank transfer via LemFi' },
  lemfi_method_desc: { de: 'Internationaler Banktransfer', fr: 'Virement bancaire international', ln: 'Kobakisa mbongo ya biso na biso', en: 'International bank transfer' },
  uba_method_name: { de: 'Agent + UBA Bank (Congo)', fr: 'Agent + UBA Bank (Congo)', ln: 'Agent + UBA Bank (Congo)', en: 'Agent + UBA Bank (Congo)' },
  uba_method_desc: { de: 'Ein Agent begleitet Sie zur Bank', fr: 'Un agent vous accompagne à la banque', ln: 'Agent akotambola na yo na banque', en: 'An agent accompanies you to the bank' },
  uba_how_it_works: { de: 'So funktioniert der UBA-Prozess:', fr: 'Comment fonctionne le processus UBA :', ln: 'Ndenge ya procès ya UBA :', en: 'How the UBA process works:' },
  uba_info_step1: { de: 'GLB ruft dich an (Telefonnummer oben)', fr: 'GLB vous appelle (numéro ci-dessus)', ln: 'GLB ekobenga yo (numéro oyo ezali likolo)', en: 'GLB calls you (phone number above)' },
  uba_info_step2: { de: 'Gemeinsam zur UBA Bank in Brazzaville / Kinshasa', fr: 'Ensemble à la UBA Bank à Brazzaville / Kinshasa', ln: 'Bokende na UBA Bank na Brazzaville / Kinshasa', en: 'Together to UBA Bank in Brazzaville / Kinshasa' },
  uba_info_step3: { de: 'Zahlung mit Bestellnummer als Referenz', fr: 'Paiement avec le numéro de commande comme référence', ln: 'Kofuta na numéro ya commande lokola référence', en: 'Payment with order number as reference' },
  uba_info_step4: { de: 'GLB bestätigt Zahlung → Logistik startet', fr: 'GLB confirme le paiement → la logistique démarre', ln: 'GLB esangisi kofuta → logistique ebandi', en: 'GLB confirms payment → logistics starts' },
  uba_next_steps_title: { de: 'Agent UBA Bank (Congo) – Nächste Schritte', fr: 'Agent UBA Bank (Congo) – Prochaines étapes', ln: 'Agent UBA Bank (Congo) – Malako oyo elandi', en: 'Agent UBA Bank (Congo) – Next steps' },
  uba_step1: { de: 'GLB kontaktiert dich innerhalb 24h', fr: 'GLB vous contacte dans les 24h', ln: 'GLB ekobenga yo na kati ya ngonga 24', en: 'GLB contacts you within 24h' },
  uba_step1_sub: { de: 'Unter der Nummer:', fr: 'Au numéro :', ln: 'Na numéro :', en: 'At the number:' },
  uba_step2: { de: 'Gemeinsam zur UBA Bank gehen', fr: 'Aller ensemble à la UBA Bank', ln: 'Bokende na UBA Bank', en: 'Go together to UBA Bank' },
  uba_step2_sub: { de: 'Dein Agent begleitet dich zur UBA und hilft bei der Zahlung', fr: 'Votre agent vous accompagne à la UBA et aide pour le paiement', ln: 'Agent na yo akotambola na yo na UBA mpe akosalisa na kofuta', en: 'Your agent accompanies you to UBA and helps with payment' },
  uba_step3: { de: 'Zahlung mit dieser Referenz', fr: 'Paiement avec cette référence', ln: 'Kofuta na référence oyo', en: 'Payment with this reference' },
  uba_submit_btn: { de: 'Bestellung absenden → GLB kontaktiert dich', fr: 'Envoyer la commande → GLB vous contacte', ln: 'Tinda commande → GLB ekobenga yo', en: 'Submit order → GLB contacts you' },
  pay_with_lemfi: { de: 'Mit LemFi bezahlen', fr: 'Payer avec LemFi', ln: 'Futa na LemFi', en: 'Pay with LemFi' },
  register_lemfi: { de: 'Bei LemFi registrieren', fr: "S'inscrire sur LemFi", ln: 'Kokoma na LemFi', en: 'Register with LemFi' },
  processing_btn: { de: 'Wird verarbeitet...', fr: 'Traitement...', ln: 'Ezali kosalema...', en: 'Processing...' },
  order_error: { de: 'Fehler beim Erstellen der Bestellung', fr: 'Une erreur est survenue lors de la création de la commande', ln: 'Likitá ezali na kosala commande', en: 'An error occurred while creating the order' },
  phone_required: { de: 'Telefonnummer ist erforderlich', fr: 'Numéro de téléphone requis', ln: 'Numéro ya téléphone esengeli', en: 'Phone number is required' },
  phone_whatsapp_label: { de: 'Telefonnummer (WhatsApp)', fr: 'Numéro de téléphone (WhatsApp)', ln: 'Numéro ya téléphone (WhatsApp)', en: 'Phone number (WhatsApp)' },
  required_field: { de: 'Pflichtfeld', fr: 'Obligatoire', ln: 'Esengeli', en: 'Required' },
  phone_contact_note: { de: 'GLB kontaktiert dich über diese Nummer bezüglich Lieferung und Zahlung.', fr: 'GLB vous contactera via ce numéro pour la livraison et le paiement.', ln: 'GLB ekobenga yo na numéro oyo pona livraison mpe kofuta.', en: 'GLB will contact you at this number regarding delivery and payment.' },
  agb_prefix: { de: 'Ich habe die ', fr: "J'ai lu et j'accepte les ", ln: 'Natanga mpe nasangisi na ', en: 'I have read and accept the ' },
  agb_link_text: { de: 'AGB', fr: 'CGV', ln: 'Mibeko oyo', en: 'Terms & Conditions' },
  agb_suffix: { de: 'gelesen und stimme diesen zu.*', fr: '.*', ln: '.*', en: '.*' },
  agb_error: { de: 'Bitte stimmen Sie den AGB zu, um fortzufahren.', fr: 'Veuillez accepter les CGV pour continuer.', ln: 'Sangisa na Mibeko liboso ya kotindela commande.', en: 'Please accept the Terms & Conditions to continue.' },
  order_confirmed_header: { de: 'Bestellung bestätigt', fr: 'Commande confirmée', ln: 'Commande esangisami', en: 'Order confirmed' },
  order_confirmed_title: { de: 'Bestellung aufgenommen!', fr: 'Commande enregistrée !', ln: 'Commande eyambami!', en: 'Order received!' },
  order_confirmed_desc: { de: 'Ihre Bestellung wurde erfolgreich erstellt', fr: 'Votre commande a été créée avec succès', ln: 'Commande na yo esalemi malamu', en: 'Your order has been successfully created' },
  order_reference: { de: 'Bestellreferenz', fr: 'Référence de commande', ln: 'Référence ya commande', en: 'Order reference' },
  lemfi_payment_instructions: { de: 'LemFi Zahlungsanweisungen', fr: 'Instructions de paiement LemFi', ln: 'Ndenge ya kofuta na LemFi', en: 'LemFi payment instructions' },
  amount_to_pay: { de: 'Zu zahlender Betrag', fr: 'Montant à payer', ln: 'Mbongo ya kofuta', en: 'Amount to pay' },
  recipient: { de: 'Empfänger', fr: 'Destinataire', ln: 'Moto ya kozwa', en: 'Recipient' },
  mandatory_reference: { de: 'Pflichtangabe Referenz', fr: 'Référence OBLIGATOIRE', ln: 'Référence ESENGELI', en: 'Mandatory reference' },
  email_instructions_sent: { de: 'Eine E-Mail mit allen Anweisungen wurde Ihnen gesendet.', fr: 'Un email avec toutes les instructions vous a été envoyé.', ln: 'Email na makambo nyonso etindelamaki na yo.', en: 'An email with all instructions has been sent to you.' },
  demo_mode: { de: 'DEMO-MODUS - Keine echte Zahlung', fr: 'MODE DÉMO - Aucun paiement réel', ln: 'MODE DÉMO - Kofuta ya solo te', en: 'DEMO MODE - No real payment' },
  empty_cart: { de: 'Ihr Warenkorb ist leer', fr: 'Votre panier est vide', ln: 'Panier na yo ezali pamba', en: 'Your cart is empty' },
  continue_shopping: { de: 'Weiter einkaufen', fr: 'Continuer les achats', ln: 'Kokoba kosomba', en: 'Continue shopping' },
  my_orders: { de: 'Meine Bestellungen', fr: 'Mes commandes', ln: 'Ba-commandes na ngai', en: 'My orders' },
  order_status: { de: 'Status', fr: 'Statut', ln: 'Ndenge ezali', en: 'Status' },
  pending: { de: 'Ausstehend', fr: 'En attente', ln: 'Ezali kozela', en: 'Pending' },
  processing: { de: 'In Bearbeitung', fr: 'En traitement', ln: 'Ezali kosalema', en: 'Processing' },
  shipped: { de: 'Versandt', fr: 'Expédié', ln: 'Etindami', en: 'Shipped' },
  delivered: { de: 'Geliefert', fr: 'Livré', ln: 'Ekómaki', en: 'Delivered' },
  sort_by: { de: 'Sortieren nach', fr: 'Trier par', ln: 'Kobongola', en: 'Sort by' },
  price_low_high: { de: 'Preis aufsteigend', fr: 'Prix croissant', ln: 'Ntalo ya moke liboso', en: 'Price ascending' },
  price_high_low: { de: 'Preis absteigend', fr: 'Prix décroissant', ln: 'Ntalo ya mingi liboso', en: 'Price descending' },
  newest: { de: 'Neueste', fr: 'Plus récent', ln: 'Ya sika koleka', en: 'Newest' },
  add_product: { de: 'Produkt hinzufügen', fr: 'Ajouter un produit', ln: 'Kobakisa eloko', en: 'Add product' },
  product_name: { de: 'Produktname', fr: 'Nom du produit', ln: 'Nkombo ya eloko', en: 'Product name' },
  description: { de: 'Beschreibung', fr: 'Description', ln: 'Ndimbola', en: 'Description' },
  purchase_price: { de: 'Einkaufspreis', fr: "Prix d'achat", ln: 'Ntalo ya kosomba', en: 'Purchase price' },
  image_url: { de: 'Bild-URL', fr: "URL de l'image", ln: 'Lien ya image', en: 'Image URL' },
  sale_price_auto: { de: 'Verkaufspreis (auto +50%)', fr: 'Prix de vente (auto +50%)', ln: 'Ntalo ya koteka (auto +50%)', en: 'Sale price (auto +50%)' },
  products: { de: 'Produkte', fr: 'Produits', ln: 'Biloko', en: 'Products' },
  no_products: { de: 'Keine Produkte gefunden', fr: 'Aucun produit trouvé', ln: 'Eloko moko te', en: 'No products found' },
  edit: { de: 'Bearbeiten', fr: 'Modifier', ln: 'Kobongola', en: 'Edit' },
  delete: { de: 'Löschen', fr: 'Supprimer', ln: 'Kolongola', en: 'Delete' },
  confirm_delete: { de: 'Sind Sie sicher, dass Sie dieses Produkt löschen möchten?', fr: 'Êtes-vous sûr de vouloir supprimer ce produit ?', ln: 'Olingi solo kolongola eloko oyo?', en: 'Are you sure you want to delete this product?' },
  ask_question: { de: 'Frage stellen', fr: 'Poser une question', ln: 'Tuna motuna', en: 'Ask a question' },
  questions_remaining: { de: 'Noch {count} Fragen verfügbar', fr: 'Encore {count} questions disponibles', ln: 'Mituna {count} eteni', en: '{count} questions remaining' },
  contact_support: { de: 'Support kontaktieren', fr: 'Contacter le service client', ln: 'Benga service client', en: 'Contact support' },
  chat_with_ai: { de: 'AI-Chat zu diesem Produkt', fr: 'Chat AI sur ce produit', ln: 'Chat AI ya eloko oyo', en: 'AI chat about this product' },
  send_message: { de: 'Senden', fr: 'Envoyer', ln: 'Tinda', en: 'Send' },
  type_your_question: { de: 'Stellen Sie Ihre Frage...', fr: 'Posez votre question...', ln: 'Tuna motuna na yo...', en: 'Type your question...' },
  reviews: { de: 'Bewertungen', fr: 'Avis', ln: 'Ba-avis', en: 'Reviews' },
  no_reviews: { de: 'Noch keine Bewertungen', fr: 'Aucun avis pour le moment', ln: 'Avis moko te', en: 'No reviews yet' },
  add_review: { de: 'Bewertung schreiben', fr: 'Laisser un avis', ln: 'Tyá avis', en: 'Write a review' },
  your_rating: { de: 'Ihre Bewertung', fr: 'Votre note', ln: 'Note na yo', en: 'Your rating' },
  your_review: { de: 'Ihr Kommentar', fr: 'Votre commentaire', ln: 'Commentaire na yo', en: 'Your comment' },
  your_name_optional: { de: 'Ihr Name (optional)', fr: 'Votre nom (optionnel)', ln: 'Nkombo na yo (soki olingi)', en: 'Your name (optional)' },
  submit_review: { de: 'Veröffentlichen', fr: 'Publier', ln: 'Kobimisa', en: 'Publish' },
  order_received: { de: 'Bestellung erhalten', fr: 'Commande reçue', ln: 'Commande eyambi', en: 'Order received' },
  in_preparation: { de: 'In Vorbereitung', fr: 'En préparation', ln: 'Ezali kobongisama', en: 'In preparation' },
  in_container: { de: 'Im Container', fr: 'Dans le container', ln: 'Na kati ya container', en: 'In container' },
  en_route: { de: 'Unterwegs nach Brazzaville', fr: 'En route vers Brazzaville', ln: 'Nzela ya Brazzaville', en: 'En route to Brazzaville' },
  arrived_brazzaville: { de: 'In Brazzaville angekommen', fr: 'Arrivé à Brazzaville', ln: 'Ekomi na Brazzaville', en: 'Arrived in Brazzaville' },
  ready_delivery: { de: 'Bereit zur Lieferung', fr: 'Prêt pour livraison', ln: 'Ezali pona kokaba', en: 'Ready for delivery' },
  estimated_delivery: { de: 'Voraussichtliche Lieferung', fr: 'Livraison estimée', ln: 'Mokolo ya kokaba', en: 'Estimated delivery' },
  notifications: { de: 'Benachrichtigungen', fr: 'Notifications', ln: 'Ba-notifications', en: 'Notifications' },
  no_notifications: { de: 'Keine Benachrichtigungen', fr: 'Aucune notification', ln: 'Notification moko te', en: 'No notifications' },
  mark_as_read: { de: 'Als gelesen markieren', fr: 'Marquer comme lu', ln: 'Tyá lokola etangami', en: 'Mark as read' },
  order_management: { de: 'Bestellverwaltung', fr: 'Gestion des commandes', ln: 'Gestion ya ba-commandes', en: 'Order management' },
  all_orders: { de: 'Alle Bestellungen', fr: 'Toutes les commandes', ln: 'Ba-commandes nyonso', en: 'All orders' },
  paid: { de: 'Bezahlt', fr: 'Payé', ln: 'Efutami', en: 'Paid' },
  partial_payment: { de: 'Teilzahlung', fr: 'Acompte', ln: 'Ndambo', en: 'Deposit' },
  payment_pending: { de: 'Zahlung ausstehend', fr: 'En attente', ln: 'Ezali kozela', en: 'Pending' },
  remaining_balance: { de: 'Restbetrag', fr: 'Reste à payer', ln: 'Oyo etikali ya kofuta', en: 'Remaining balance' },
  update_status: { de: 'Status aktualisieren', fr: 'Modifier le statut', ln: 'Kobongola statut', en: 'Update status' },
  customer_info: { de: 'Kundeninformationen', fr: 'Informations client', ln: 'Makambo ya client', en: 'Customer information' },
  order_items: { de: 'Bestellte Artikel', fr: 'Articles commandés', ln: 'Biloko ya commande', en: 'Ordered items' },
  api_key_settings: { de: 'API-Einstellungen', fr: 'Paramètres API', ln: 'Paramètres API', en: 'API settings' },
  openai_api_key: { de: 'OpenAI API-Schlüssel', fr: 'Clé API OpenAI', ln: 'Clé API OpenAI', en: 'OpenAI API key' },
  save_api_key: { de: 'Schlüssel speichern', fr: 'Enregistrer la clé', ln: 'Kobomba clé', en: 'Save key' },
  back_to_catalog: { de: 'Zurück zum Katalog', fr: 'Retour au catalogue', ln: 'Zonga na catalogue', en: 'Back to catalog' },
  product_details: { de: 'Produktdetails', fr: 'Détails du produit', ln: 'Makambo ya eloko', en: 'Product details' },
  average_rating: { de: 'Durchschnittsbewertung', fr: 'Note moyenne', ln: 'Note ya moyenne', en: 'Average rating' },
  forgot_password: { de: 'Passwort vergessen?', fr: 'Mot de passe oublié ?', ln: 'Obosani mot de passe?', en: 'Forgot password?' },
  reset_password: { de: 'Passwort zurücksetzen', fr: 'Réinitialiser le mot de passe', ln: 'Kozongisa mot de passe', en: 'Reset password' },
  back_to_login: { de: 'Zurück zur Anmeldung', fr: 'Retour à la connexion', ln: 'Zonga na kokota', en: 'Back to login' },
  reset_link_sent: { de: 'Link zum Zurücksetzen wurde gesendet', fr: 'Lien de réinitialisation envoyé', ln: 'Lien ya kozongisa etindami', en: 'Reset link sent' },
  check_email: { de: 'Bitte überprüfen Sie Ihre E-Mail', fr: 'Veuillez vérifier votre email', ln: 'Tála email na yo', en: 'Please check your email' },
  new_password: { de: 'Neues Passwort', fr: 'Nouveau mot de passe', ln: 'Mot de passe ya sika', en: 'New password' },
  confirm_password: { de: 'Passwort bestätigen', fr: 'Confirmer le mot de passe', ln: 'Ndimela mot de passe', en: 'Confirm password' },
  update_password: { de: 'Passwort aktualisieren', fr: 'Mettre à jour le mot de passe', ln: 'Kobongola mot de passe', en: 'Update password' },
  password_updated: { de: 'Passwort wurde aktualisiert', fr: 'Mot de passe mis à jour', ln: 'Mot de passe ebongwani', en: 'Password updated' },
  toggle_email: { de: 'E-Mail', fr: 'E-Mail', ln: 'E-Mail', en: 'Email' },
  toggle_phone: { de: 'Telefonnummer', fr: 'Téléphone', ln: 'Numéro ya téléphone', en: 'Phone number' },
  phone_label: { de: 'Telefonnummer', fr: 'Numéro de téléphone', ln: 'Numéro ya téléphone na yo', en: 'Phone number' },
  phone_placeholder: { de: '+242 XXX XXX XXX', fr: '+242 XXX XXX XXX', ln: '+242 XXX XXX XXX', en: '+242 XXX XXX XXX' },
  send_code: { de: 'Code senden', fr: 'Envoyer le code', ln: 'Tinda code', en: 'Send code' },
  code_sent_to: { de: 'Code gesendet an', fr: 'Code envoyé au', ln: 'Code etindelamaki na', en: 'Code sent to' },
  verify: { de: 'Bestätigen', fr: 'Confirmer', ln: 'Sangisa', en: 'Verify' },
  resend: { de: 'Code erneut senden', fr: 'Renvoyer le code', ln: 'Tinda lisusu code', en: 'Resend code' },
  resend_in: { de: 'Erneut senden in', fr: 'Renvoyer dans', ln: 'Tinda lisusu na', en: 'Resend in' },
  back: { de: 'Andere Nummer', fr: 'Autre numéro', ln: 'Numéro mosusu', en: 'Different number' },
  error_invalid_phone: { de: 'Ungültige Telefonnummer. Format: +242 + 9 Ziffern', fr: 'Numéro invalide. Format : +242 suivi de 9 chiffres', ln: 'Numéro ya malamu te. Format: +242 + chiffres 9', en: 'Invalid phone number. Format: +242 + 9 digits' },
  error_invalid_code: { de: 'Ungültiger Code. Bitte erneut versuchen.', fr: 'Code invalide. Veuillez réessayer.', ln: 'Code ya malamu te. Meka lisusu.', en: 'Invalid code. Please try again.' },
  error_too_many: { de: 'Zu viele Versuche. Bitte warten Sie 5 Minuten.', fr: 'Trop de tentatives. Attendez 5 minutes.', ln: 'Osalelaki mingi. Linga tii 5 miniti.', en: 'Too many attempts. Please wait 5 minutes.' },
  seller_apply_title: { de: 'Als Verkäufer bewerben', fr: 'Devenir vendeur', ln: 'Bimela kobika', en: 'Apply as a seller' },
  seller_apply_desc: { de: 'Verkaufe deine Produkte nach Afrika – GLB übernimmt die Lieferung', fr: 'Vendez vos produits en Afrique – GLB gère la livraison', ln: 'Teka biloko na Afrika – GLB ezali ko-livrer', en: 'Sell your products to Africa – GLB handles delivery' },
  seller_apply_btn: { de: 'Bewerbung senden', fr: 'Envoyer la candidature', ln: 'Tinda candidature', en: 'Submit application' },
  seller_germany_required: { de: 'Nur für Verkäufer in Deutschland. GLB übernimmt Versand & Lieferung nach Afrika.', fr: "Réservé aux vendeurs en Allemagne. GLB gère l'expédition vers l'Afrique.", ln: 'Pona bateki na Allemagne. GLB ezali ko-tinda na Afrika.', en: 'For sellers in Germany only. GLB handles shipping & delivery to Africa.' },
  seller_city: { de: 'Stadt (in Deutschland)', fr: 'Ville (en Allemagne)', ln: 'Ville (na Allemagne)', en: 'City (in Germany)' },
  seller_business_type: { de: 'Art des Verkäufers', fr: 'Type de vendeur', ln: 'Type ya moteki', en: 'Type of seller' },
  seller_private: { de: 'Privatperson', fr: 'Particulier', ln: 'Personne privée', en: 'Private individual' },
  seller_business: { de: 'Unternehmen', fr: 'Entreprise', ln: 'Entreprise', en: 'Company' },
  seller_message_placeholder: { de: 'Was möchtest du verkaufen? (optional)', fr: 'Que souhaitez-vous vendre? (optionnel)', ln: 'Olingi koteka nini? (soki olingi)', en: 'What would you like to sell? (optional)' },
  seller_applied_title: { de: 'Bewerbung eingereicht!', fr: 'Candidature envoyée!', ln: 'Candidature etindelami!', en: 'Application submitted!' },
  seller_applied_desc: { de: 'Wir prüfen deine Bewerbung und melden uns per E-Mail.', fr: 'Nous examinerons votre candidature et vous contacterons par email.', ln: 'Tozo-tala candidature na yo, tokobenga yo na email.', en: 'We will review your application and get back to you by email.' },
  seller_already_applied: { de: 'Du hast bereits eine Bewerbung eingereicht.', fr: 'Vous avez déjà soumis une candidature.', ln: 'Osimbi candidature kala.', en: 'You have already submitted an application.' },
  seller_pending_title: { de: 'Bewerbung wird geprüft', fr: "Candidature en cours d'examen", ln: 'Candidature ezali kotaliama', en: 'Application under review' },
  seller_pending_desc: { de: 'Unser Team prüft deine Anfrage. Du erhältst eine E-Mail.', fr: 'Notre équipe examine votre demande. Vous recevrez un email.', ln: 'Bato na biso bazali ko-tala. Okozwa email.', en: 'Our team is reviewing your request. You will receive an email.' },
  seller_rejected_title: { de: 'Bewerbung abgelehnt', fr: 'Candidature refusée', ln: 'Candidature eboyami', en: 'Application rejected' },
  seller_rejected_desc: { de: 'Leider können wir deine Bewerbung nicht genehmigen.', fr: 'Nous ne pouvons malheureusement pas approuver votre candidature.', ln: 'Tolingi te, tokoki te kozua candidature na yo.', en: 'Unfortunately, we cannot approve your application.' },
  seller_approved_badge: { de: 'Genehmigter Verkäufer', fr: 'Vendeur approuvé', ln: 'Moteki azuami', en: 'Approved seller' },
  seller_dashboard_title: { de: 'Mein Verkäufer-Bereich', fr: 'Mon espace vendeur', ln: 'Esika na ngai ya moteki', en: 'My seller area' },
  seller_dashboard_desc: { de: 'Verwalte deine Inserate für den afrikanischen Markt', fr: 'Gérez vos annonces pour le marché africain', ln: 'Leka ba-annonces na yo pona marché ya Afrique', en: 'Manage your listings for the African market' },
  seller_no_products: { de: 'Noch keine Produkte inseriert', fr: 'Aucun produit encore annoncé', ln: 'Eloko moko te elongami', en: 'No products listed yet' },
  seller_no_application: { de: 'Keine Bewerbung gefunden', fr: 'Aucune candidature trouvée', ln: 'Candidature moko te', en: 'No application found' },
  seller_new_product: { de: 'Neues Produkt inserieren', fr: 'Ajouter une nouvelle annonce', ln: 'Bakisa eloko ya sika', en: 'List a new product' },
  seller_shipping_notice: { de: 'GLB übernimmt die Lieferung nach Kinshasa/Brazzaville. Keine Direktzahlung an dich.', fr: 'GLB gère la livraison vers Kinshasa/Brazzaville. Pas de paiement direct.', ln: 'GLB ezali ko-livrer na Kinshasa/Brazzaville. Mbongo na biso.', en: 'GLB handles delivery to Kinshasa/Brazzaville. No direct payment to you.' },
  seller_image_hint: { de: 'Link zu einem Bild deines Produkts (z.B. aus Google Drive, Dropbox)', fr: 'Lien vers une image de votre produit', ln: 'Lien ya image ya eloko na yo', en: 'Link to an image of your product (e.g. from Google Drive, Dropbox)' },
  seller_publish: { de: 'Inserat veröffentlichen', fr: "Publier l'annonce", ln: 'Longola annonce', en: 'Publish listing' },
  become_seller: { de: 'Anbieter werden', fr: 'Devenir vendeur', ln: 'Koma moteki', en: 'Become a seller' },
  my_seller_area: { de: 'Mein Anbieter-Bereich', fr: 'Mon espace vendeur', ln: 'Esika ya moteki', en: 'My seller area' },
  marketplace_title: { de: 'Marktplätze durchsuchen', fr: 'Rechercher sur les marchés', ln: 'Luka na ba-marché', en: 'Browse marketplaces' },
  marketplace_subtitle: { de: 'Produkt suchen — GLB liefert nach Congo', fr: 'Chercher un produit — GLB livre au Congo', ln: 'Luka eloko — GLB ekobakisa na Congo', en: 'Search for a product — GLB delivers to Congo' },
  marketplace_tab_search: { de: 'Marktplätze durchsuchen', fr: 'Parcourir les marchés', ln: 'Luka na ba-marché', en: 'Browse marketplaces' },
  marketplace_tab_link: { de: 'Link einreichen', fr: 'Soumettre un lien', ln: 'Tinda lien', en: 'Submit a link' },
  marketplace_search_placeholder: { de: 'Suchbegriff eingeben… z.B. iPhone, Sofa, Nike', fr: 'Entrez un mot-clé… ex: iPhone, Canapé, Nike', ln: 'Tiya liloba… ex: iPhone, Sofa, Nike', en: 'Enter a keyword… e.g. iPhone, Sofa, Nike' },
  marketplace_link_placeholder: { de: 'https://www.ebay.de/itm/... oder amazon.de/dp/...', fr: 'https://www.ebay.de/itm/... ou amazon.de/dp/...', ln: 'https://www.ebay.de/itm/... to amazon.de/dp/...', en: 'https://www.ebay.de/itm/... or amazon.de/dp/...' },
  marketplace_how_it_works: { de: 'So funktioniert es', fr: 'Comment ça marche', ln: 'Ndenge esalema', en: 'How it works' },
  marketplace_step1: { de: 'Suchbegriff eingeben & Marktplatz wählen', fr: 'Entrer un mot-clé & choisir un marché', ln: 'Tiya liloba & pona marché', en: 'Enter a keyword & choose a marketplace' },
  marketplace_step2: { de: 'Produkt finden & Link kopieren', fr: 'Trouver le produit & copier le lien', ln: 'Yeba eloko & kopia lien', en: 'Find the product & copy the link' },
  marketplace_step3: { de: 'Link einreichen → GLB liefert nach Congo', fr: 'Soumettre le lien → GLB livre au Congo', ln: 'Tinda lien → GLB ekobakisa na Congo', en: 'Submit the link → GLB delivers to Congo' },
  marketplace_choose: { de: 'Marktplatz wählen', fr: 'Choisir un marché', ln: 'Pona marché', en: 'Choose a marketplace' },
  marketplace_open: { de: 'Öffnen', fr: 'Ouvrir', ln: 'Fungola', en: 'Open' },
  marketplace_search_on: { de: 'suchen', fr: 'rechercher', ln: 'luka', en: 'search' },
  marketplace_found: { de: 'Produkt gefunden?', fr: 'Produit trouvé?', ln: 'Ozwi eloko?', en: 'Found a product?' },
  marketplace_found_desc: { de: 'Link kopieren → oben auf „Link einreichen" klicken → GLB kauft und liefert nach Congo.', fr: 'Copiez le lien → cliquez sur „Soumettre un lien" → GLB achète et livre au Congo.', ln: 'Kopia lien → penza „Tinda lien" → GLB esomba mpe ekobakisa na Congo.', en: 'Copy the link → click "Submit a link" above → GLB buys and delivers to Congo.' },
  marketplace_submit_link: { de: 'Jetzt Link einreichen →', fr: 'Soumettre le lien maintenant →', ln: 'Tinda lien sikoyo →', en: 'Submit link now →' },
  marketplace_supported: { de: 'Unterstützte Marktplätze', fr: 'Marchés supportés', ln: 'Ba-marché oyo tozali kosalela', en: 'Supported marketplaces' },
  marketplace_tip: { de: 'Öffnen Sie den Marktplatz, suchen Sie Ihr Produkt, kopieren Sie den Link und reichen Sie ihn ein.', fr: 'Ouvrez le marché, trouvez votre produit, copiez le lien et soumettez-le.', ln: 'Fungola marché, luka eloko, kopia lien mpe tinda yango.', en: 'Open the marketplace, find your product, copy the link and submit it.' },
  marketplace_order_btn: { de: 'Bei GLB bestellen', fr: 'Commander via GLB', ln: 'Somba na GLB', en: 'Order via GLB' },
  marketplace_link_error_empty: { de: 'Bitte einen Link eingeben', fr: 'Veuillez entrer un lien', ln: 'Tiya lien liboso', en: 'Please enter a link' },
  marketplace_link_error_http: { de: 'Link muss mit https:// beginnen', fr: 'Le lien doit commencer par https://', ln: 'Lien esengeli kobanda na https://', en: 'Link must start with https://' },
  marketplace_link_error_domain: { de: 'Nur Links von eBay.de, Kleinanzeigen, Amazon.de, reBuy.de oder Vinted.de erlaubt', fr: 'Seuls les liens de eBay.de, Kleinanzeigen, Amazon.de, reBuy.de ou Vinted.de sont acceptés', ln: 'Lien ya eBay.de, Kleinanzeigen, Amazon.de, reBuy.de to Vinted.de kaka', en: 'Only links from eBay.de, Kleinanzeigen, Amazon.de, reBuy.de or Vinted.de are allowed' },
  order_product_details: { de: 'Produktdetails eingeben', fr: 'Saisir les détails du produit', ln: 'Tiya makambo ya eloko', en: 'Enter product details' },
  order_product_price: { de: 'Produktpreis (€)', fr: 'Prix du produit (€)', ln: 'Ntalo ya eloko (€)', en: 'Product price (€)' },
  order_price_hint: { de: 'Den Preis vom Marktplatz ablesen und hier eingeben', fr: 'Lire le prix sur le marché et le saisir ici', ln: 'Tanga ntalo na marché mpe tiya awa', en: 'Read the price on the marketplace and enter it here' },
  order_quantity: { de: 'Menge', fr: 'Quantité', ln: 'Motango', en: 'Quantity' },
  order_variant: { de: 'Größe / Farbe', fr: 'Taille / Couleur', ln: 'Bonene / Rangi', en: 'Size / Color' },
  order_variant_placeholder: { de: 'z.B. Rot, XL', fr: 'ex: Rouge, XL', ln: 'ex: Motane, XL', en: 'e.g. Red, XL' },
  order_delivery_city: { de: 'Lieferort', fr: 'Ville de livraison', ln: 'Ville ya kokaba', en: 'Delivery city' },
  order_note: { de: 'Hinweis (optional)', fr: 'Remarque (optionnel)', ln: 'Liloba (soki olingi)', en: 'Note (optional)' },
  order_note_placeholder: { de: 'z.B. bitte gut verpacken…', fr: 'ex: bien emballer svp…', ln: 'ex: bokanga malamu…', en: 'e.g. please pack carefully…' },
  order_total_offer: { de: 'GLB Gesamtangebot', fr: 'Offre totale GLB', ln: 'Prix mobimba ya GLB', en: 'GLB total offer' },
  order_pickup_fee: { de: 'Abholung in Deutschland', fr: 'Récupération en Allemagne', ln: 'Kokamata na Allemagne', en: 'Pickup in Germany' },
  order_shipping_fee: { de: 'Verschiffung nach Congo', fr: 'Expédition vers Congo', ln: 'Kotinda na Congo', en: 'Shipping to Congo' },
  order_service_fee: { de: 'GLB Servicegebühr', fr: 'Frais de service GLB', ln: 'Mbongo ya service GLB', en: 'GLB service fee' },
  order_customs: { de: 'Verzollung', fr: 'Dédouanement', ln: 'Douane', en: 'Customs clearance' },
  order_customs_with: { de: '✓ Mit Verzollung', fr: '✓ Avec dédouanement', ln: '✓ Na douane', en: '✓ With customs clearance' },
  order_customs_with_sub: { de: 'Lieferung bis Haustür', fr: 'Livraison à domicile', ln: 'Kokaba na ndako', en: 'Door-to-door delivery' },
  order_customs_without: { de: 'Ohne Verzollung', fr: 'Sans dédouanement', ln: 'Kozanga douane', en: 'Without customs clearance' },
  order_customs_without_sub: { de: 'Abholung am Hafen', fr: 'Retrait au port', ln: 'Kokamata na port', en: 'Pickup at port' },
  order_accept: { de: 'Akzeptieren →', fr: 'Accepter →', ln: 'Ndima →', en: 'Accept →' },
  order_payment_title: { de: 'Zahlung — UBA Congo', fr: 'Paiement — UBA Congo', ln: 'Kofuta — UBA Congo', en: 'Payment — UBA Congo' },
  order_payment_instruction_title: { de: 'Zahlungsanweisung', fr: 'Instructions de paiement', ln: 'Ndenge ya kofuta', en: 'Payment instructions' },
  order_payment_step1: { de: 'Ein GLB-Agent begleitet Sie zur UBA-Filiale', fr: 'Un agent GLB vous accompagne à la filiale UBA', ln: 'Agent ya GLB akotambola na yo na UBA', en: 'A GLB agent will accompany you to the UBA branch' },
  order_payment_step2: { de: 'Zahlung in CDF oder USD möglich', fr: 'Paiement en CDF ou USD possible', ln: 'Kofuta na CDF to USD ekoki', en: 'Payment in CDF or USD possible' },
  order_payment_step3: { de: 'Sofortige offizielle Quittung', fr: 'Reçu officiel immédiat', ln: 'Reçu ya sika mbangu', en: 'Immediate official receipt' },
  order_payment_step4: { de: 'Tracking-Nummer per WhatsApp', fr: 'Numéro de suivi par WhatsApp', ln: 'Numéro ya tracking na WhatsApp', en: 'Tracking number via WhatsApp' },
  order_to_pay: { de: 'Zu zahlen', fr: 'À payer', ln: 'Kofuta', en: 'To pay' },
  order_customs_label: { de: 'Verzollung', fr: 'Dédouanement', ln: 'Douane', en: 'Customs clearance' },
  order_customs_yes: { de: 'Ja (Haustür)', fr: 'Oui (domicile)', ln: 'Iyo (ndako)', en: 'Yes (door-to-door)' },
  order_customs_no: { de: 'Nein (Hafen)', fr: 'Non (port)', ln: 'Te (port)', en: 'No (port)' },
  order_saving: { de: 'Wird gespeichert…', fr: 'Enregistrement…', ln: 'Ezali kobomba…', en: 'Saving…' },
  order_confirm_payment: { de: 'Zahlung bestätigt ✓', fr: 'Paiement confirmé ✓', ln: 'Kofuta esangisami ✓', en: 'Payment confirmed ✓' },
  order_next_step: { de: 'GLB kauft Produkt', fr: 'GLB achète le produit', ln: 'GLB esomba eloko', en: 'GLB purchases product' },
  order_delivery_time: { de: '3–6 Wochen', fr: '3–6 semaines', ln: 'Mposo 3–6', en: '3–6 weeks' },
  order_next_steps_title: { de: 'Nächste Schritte', fr: 'Prochaines étapes', ln: 'Malako oyo elandi', en: 'Next steps' },
  order_process_1: { de: 'GLB kauft Produkt beim Verkäufer', fr: 'GLB achète le produit au vendeur', ln: 'GLB esomba eloko epai ya moteki', en: 'GLB buys the product from the seller' },
  order_process_2: { de: 'Qualitätskontrolle & Verpackung', fr: 'Contrôle qualité & emballage', ln: 'Kotala qualité & kobomba', en: 'Quality control & packaging' },
  order_process_3: { de: 'Containerverladung & Verschiffung', fr: 'Chargement container & expédition', ln: 'Kotya na container & kotinda', en: 'Container loading & shipping' },
  order_process_4: { de: 'Verzollung & Inland-Lieferung', fr: 'Dédouanement & livraison intérieure', ln: 'Douane & kokaba na kati', en: 'Customs clearance & domestic delivery' },
  order_process_5: { de: 'Übergabe in', fr: 'Remise à', ln: 'Kopesa na', en: 'Handover in' },
  order_whatsapp_btn: { de: 'Bestellung per WhatsApp senden', fr: 'Envoyer la commande par WhatsApp', ln: 'Tinda commande na WhatsApp', en: 'Send order via WhatsApp' },
  order_done: { de: 'Fertig — Zur Übersicht', fr: 'Terminé — Voir le tableau de bord', ln: 'Malamu — Tala résumé', en: 'Done — Back to overview' },
  order_go_back: { de: '← Zurück', fr: '← Retour', ln: '← Zonga', en: '← Back' },
  order_next: { de: 'Weiter', fr: 'Suivant', ln: 'Eleka', en: 'Next' },
  order_cancel: { de: 'Abbrechen', fr: 'Annuler', ln: 'Tika', en: 'Cancel' },
  order_step_product: { de: 'Produkt', fr: 'Produit', ln: 'Eloko', en: 'Product' },
  order_step_offer: { de: 'Angebot', fr: 'Offre', ln: 'Prix', en: 'Offer' },
  order_step_payment: { de: 'Zahlung', fr: 'Paiement', ln: 'Kofuta', en: 'Payment' },
  order_step_confirmation: { de: 'Bestätigung', fr: 'Confirmation', ln: 'Sangisa', en: 'Confirmation' },
  write_message: { de: 'Nachricht schreiben', fr: 'Écrire un message', ln: 'Koma message', en: 'Write a message' },
  login_anti_spam: { de: 'Login zum Schutz vor Spammern', fr: 'Connexion requise pour éviter les spams', ln: 'Kokota mpo na kobatela na ba-spam', en: 'Login required to protect against spam' },
  message_sent_success: { de: 'Nachricht erfolgreich gesendet!', fr: 'Message envoyé avec succès !', ln: 'Message etindelami malamu!', en: 'Message sent successfully!' },
  message_placeholder: { de: 'Ihre Nachricht...', fr: 'Votre message...', ln: 'Message na yo...', en: 'Your message...' },
  price_on_request: { de: 'Preis auf Anfrage', fr: 'Prix sur demande', ln: 'Ntalo na demande', en: 'Price on request' },
  adding_to_cart: { de: 'Wird hinzugefügt...', fr: 'Ajout en cours...', ln: 'Ezali kobakisama...', en: 'Adding...' },
  quote_sent_success: { de: 'Anfrage gesendet! GLB meldet sich bei dir.', fr: 'Demande envoyée ! GLB vous contactera.', ln: 'Demande etindelami! GLB ekobenga yo.', en: 'Request sent! GLB will contact you.' },
  request_quote: { de: 'Angebot anfragen', fr: 'Demander un devis', ln: 'Loba prix', en: 'Request a quote' },
  quote_form_title: { de: 'Deine Anfrage an GLB', fr: 'Votre demande à GLB', ln: 'Demande na yo epai ya GLB', en: 'Your request to GLB' },
  quote_name_placeholder: { de: 'Dein Name *', fr: 'Votre nom *', ln: 'Nkombo na yo *', en: 'Your name *' },
  quote_phone_placeholder: { de: 'Telefonnummer (WhatsApp) *', fr: 'Numéro de téléphone (WhatsApp) *', ln: 'Numéro ya téléphone (WhatsApp) *', en: 'Phone number (WhatsApp) *' },
  quote_location_placeholder: { de: 'Dein Standort (z.B. Brazzaville)', fr: 'Votre ville (ex: Brazzaville)', ln: 'Ville na yo (ex: Brazzaville)', en: 'Your city (e.g. Brazzaville)' },
  quote_price_placeholder: { de: 'Preisvorschlag (€) – optional', fr: 'Proposition de prix (€) – optionnel', ln: 'Prix oyo olingi (€) – soki olingi', en: 'Suggested price (€) – optional' },
  quote_message_placeholder: { de: 'Nachricht / Fragen...', fr: 'Message / Questions...', ln: 'Message / Mituna...', en: 'Message / Questions...' },
  quote_sending: { de: 'Wird gesendet...', fr: 'Envoi en cours...', ln: 'Ezali kotindama...', en: 'Sending...' },
  quote_submit: { de: 'Anfrage absenden', fr: 'Envoyer la demande', ln: 'Tinda demande', en: 'Send request' },
  view_on_ebay: { de: 'Auf eBay ansehen', fr: 'Voir sur eBay', ln: 'Tála na eBay', en: 'View on eBay' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatPrice: (priceEur: number) => string; // NEU
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('germanlink_language');
    return (saved as Language) || 'fr';
  });

  useEffect(() => {
    localStorage.setItem('germanlink_language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  // NEU: Preis in EUR → lokale Währung umrechnen & formatieren
  const formatPriceFn = (priceEur: number): string => formatPrice(priceEur, language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatPrice: formatPriceFn }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

