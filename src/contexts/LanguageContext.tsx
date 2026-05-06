import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'de' | 'fr' | 'ln';

interface Translations {
  [key: string]: {
    de: string;
    fr: string;
    ln: string;
  };
}

const translations: Translations = {
  app_title: {
    de: 'GermanLink Business',
    fr: 'GermanLink Business',
    ln: 'GermanLink Business'
  },
  search_placeholder: {
    de: 'Produkte suchen...',
    fr: 'Rechercher des produits...',
    ln: 'Luka biloko...'
  },
  categories: {
    de: 'Kategorien',
    fr: 'Catégories',
    ln: 'Mitindo'
  },
  all_categories: {
    de: 'Alle Kategorien',
    fr: 'Toutes catégories',
    ln: 'Mitindo nyonso'
  },
  electronics: {
    de: 'Elektronik',
    fr: 'Électronique',
    ln: 'Ba-électronique'
  },
  clothing: {
    de: 'Kleidung',
    fr: 'Vêtements',
    ln: 'Bilamba'
  },
  furniture: {
    de: 'Möbel',
    fr: 'Meubles',
    ln: 'Bamesa'
  },
  household: {
    de: 'Haushalt',
    fr: 'Maison',
    ln: 'Ndako'
  },
  auto_motor: {
    de: 'Auto & Motor',
    fr: 'Auto & Moto',
    ln: 'Mituka & Moto'
  },
  other: {
    de: 'Sonstiges',
    fr: 'Autres',
    ln: 'Mosusu'
  },
  login: {
    de: 'Anmelden',
    fr: 'Connexion',
    ln: 'Kokota'
  },
  register: {
    de: 'Registrieren',
    fr: "S'inscrire",
    ln: 'Kokoma nkombo'
  },
  logout: {
    de: 'Abmelden',
    fr: 'Déconnexion',
    ln: 'Kobima'
  },
  cart: {
    de: 'Warenkorb',
    fr: 'Panier',
    ln: 'Panier'
  },
  profile: {
    de: 'Profil',
    fr: 'Profil',
    ln: 'Profil'
  },
  admin: {
    de: 'Verwaltung',
    fr: 'Administration',
    ln: 'Administration'
  },
  european_quality: {
    de: 'Garantierte europäische Qualität',
    fr: 'Qualité européenne garantie',
    ln: 'Qualité ya Europe esimbami'
  },
  monthly_shipping: {
    de: 'Sichere monatliche Lieferung',
    fr: 'Envoi mensuel sécurisé',
    ln: 'Envoi ya sanza oyo ebatelami'
  },
  next_shipment: {
    de: 'Nächste Lieferung',
    fr: 'Prochain envoi',
    ln: 'Envoi oyo elandi'
  },
  next_shipment_desc: {
    de: 'Ihre Bestellung wird beim nächsten monatlichen Versand verschickt',
    fr: 'Votre commande sera expédiée lors du prochain envoi mensuel',
    ln: 'Commande na yo ekotindama na envoi oyo elandi ya sanza'
  },
  condition: {
    de: 'Zustand',
    fr: 'État',
    ln: 'Ndenge ezali'
  },
  new: {
    de: 'Neu',
    fr: 'Neuf',
    ln: 'Ya sika'
  },
  very_good: {
    de: 'Sehr gut',
    fr: 'Très bon',
    ln: 'Malamu mpenza'
  },
  good: {
    de: 'Gut',
    fr: 'Bon',
    ln: 'Malamu'
  },
  acceptable: {
    de: 'Akzeptabel',
    fr: 'Acceptable',
    ln: 'Ekoki'
  },
  price: {
    de: 'Preis',
    fr: 'Prix',
    ln: 'Ntalo'
  },
  add_to_cart: {
    de: 'In den Warenkorb',
    fr: 'Ajouter au panier',
    ln: 'Tyá na panier'
  },
  contact_seller: {
    de: 'Verkäufer kontaktieren',
    fr: 'Contacter le vendeur',
    ln: 'Benga moteki'
  },
  loading: {
    de: 'Lädt...',
    fr: 'Chargement...',
    ln: 'Ezali kotanga...'
  },
  added_to_cart: {
    de: 'In den Warenkorb gelegt!',
    fr: 'Ajouté au panier!',
    ln: 'Ebakisami na panier!'
  },
  view_details: {
    de: 'Details ansehen',
    fr: 'Voir détails',
    ln: 'Tála makambo'
  },
  email: {
    de: 'E-Mail',
    fr: 'Email',
    ln: 'Email'
  },
  password: {
    de: 'Passwort',
    fr: 'Mot de passe',
    ln: 'Mot de passe'
  },
  name: {
    de: 'Vollständiger Name',
    fr: 'Nom complet',
    ln: 'Nkombo mobimba'
  },
  phone: {
    de: 'Telefon',
    fr: 'Téléphone',
    ln: 'Telefone'
  },
  whatsapp: {
    de: 'WhatsApp',
    fr: 'WhatsApp',
    ln: 'WhatsApp'
  },
  delivery_address: {
    de: 'Lieferadresse in Brazzaville',
    fr: 'Adresse de livraison à Brazzaville',
    ln: 'Adresse ya livraison na Brazzaville'
  },
  notification_preferences: {
    de: 'Benachrichtigungseinstellungen',
    fr: 'Préférences de notification',
    ln: 'Makambo ya koyeba'
  },
  save: {
    de: 'Speichern',
    fr: 'Enregistrer',
    ln: 'Kobomba'
  },
  cancel: {
    de: 'Abbrechen',
    fr: 'Annuler',
    ln: 'Kotika'
  },
  close: {
    de: 'Schließen',
    fr: 'Fermer',
    ln: 'Kofunga'
  },
  checkout: {
    de: 'Bestellen',
    fr: 'Commander',
    ln: 'Kosomba'
  },
  subtotal: {
    de: 'Zwischensumme',
    fr: 'Sous-total',
    ln: 'Ntalo ya moke'
  },
  shipping: {
    de: 'Versandkosten',
    fr: 'Frais de port',
    ln: 'Mbongo ya kotinda'
  },
  total: {
    de: 'Gesamt',
    fr: 'Total',
    ln: 'Nyonso'
  },
  to_pay_now: {
    de: 'Jetzt zu zahlen',
    fr: 'À payer maintenant',
    ln: 'Kofuta sikoyo'
  },
  payment_options: {
    de: 'Zahlungsoptionen',
    fr: 'Options de paiement',
    ln: 'Ndenge ya kofuta'
  },
  full_payment: {
    de: 'Vollständige Zahlung',
    fr: 'Paiement complet',
    ln: 'Kofuta nyonso'
  },
  deposit_50: {
    de: 'Anzahlung 50%',
    fr: 'Acompte 50%',
    ln: 'Kofuta ndambo (50%)'
  },
  pay_now_prefix: {
    de: 'Jetzt',
    fr: 'Payer',
    ln: 'Futa'
  },
  pay_now_suffix: {
    de: 'bezahlen',
    fr: 'maintenant',
    ln: 'sikoyo'
  },
  deposit_rest_note: {
    de: 'jetzt, Rest bei Lieferung',
    fr: 'maintenant, le reste à la livraison',
    ln: 'sikoyo, oyo etikali na livraison'
  },
  payment_method_title: {
    de: 'Zahlungsmethode',
    fr: 'Méthode de paiement',
    ln: 'Ndenge ya kofuta'
  },
  lemfi_method_name: {
    de: 'Banküberweisung via LemFi',
    fr: 'Virement bancaire via LemFi',
    ln: 'Kobakisa mbongo na LemFi'
  },
  lemfi_method_desc: {
    de: 'Internationaler Banktransfer',
    fr: 'Virement bancaire international',
    ln: 'Kobakisa mbongo ya biso na biso'
  },
  uba_method_name: {
    de: 'Agent + UBA Bank (Congo)',
    fr: 'Agent + UBA Bank (Congo)',
    ln: 'Agent + UBA Bank (Congo)'
  },
  uba_method_desc: {
    de: 'Ein Agent begleitet Sie zur Bank',
    fr: 'Un agent vous accompagne à la banque',
    ln: 'Agent akotambola na yo na banque'
  },
  uba_how_it_works: {
    de: 'So funktioniert der UBA-Prozess:',
    fr: 'Comment fonctionne le processus UBA :',
    ln: 'Ndenge ya procès ya UBA :'
  },
  uba_info_step1: {
    de: 'GLB ruft dich an (Telefonnummer oben)',
    fr: 'GLB vous appelle (numéro ci-dessus)',
    ln: 'GLB ekobenga yo (numéro oyo ezali likolo)'
  },
  uba_info_step2: {
    de: 'Gemeinsam zur UBA Bank in Brazzaville / Kinshasa',
    fr: 'Ensemble à la UBA Bank à Brazzaville / Kinshasa',
    ln: 'Bokende na UBA Bank na Brazzaville / Kinshasa'
  },
  uba_info_step3: {
    de: 'Zahlung mit Bestellnummer als Referenz',
    fr: 'Paiement avec le numéro de commande comme référence',
    ln: 'Kofuta na numéro ya commande lokola référence'
  },
  uba_info_step4: {
    de: 'GLB bestätigt Zahlung → Logistik startet',
    fr: 'GLB confirme le paiement → la logistique démarre',
    ln: 'GLB esangisi kofuta → logistique ebandi'
  },
  uba_next_steps_title: {
    de: 'Agent UBA Bank (Congo) – Nächste Schritte',
    fr: 'Agent UBA Bank (Congo) – Prochaines étapes',
    ln: 'Agent UBA Bank (Congo) – Malako oyo elandi'
  },
  uba_step1: {
    de: 'GLB kontaktiert dich innerhalb 24h',
    fr: 'GLB vous contacte dans les 24h',
    ln: 'GLB ekobenga yo na kati ya ngonga 24'
  },
  uba_step1_sub: {
    de: 'Unter der Nummer:',
    fr: 'Au numéro :',
    ln: 'Na numéro :'
  },
  uba_step2: {
    de: 'Gemeinsam zur UBA Bank gehen',
    fr: 'Aller ensemble à la UBA Bank',
    ln: 'Bokende na UBA Bank'
  },
  uba_step2_sub: {
    de: 'Dein Agent begleitet dich zur UBA und hilft bei der Zahlung',
    fr: 'Votre agent vous accompagne à la UBA et aide pour le paiement',
    ln: 'Agent na yo akotambola na yo na UBA mpe akosalisa na kofuta'
  },
  uba_step3: {
    de: 'Zahlung mit dieser Referenz',
    fr: 'Paiement avec cette référence',
    ln: 'Kofuta na référence oyo'
  },
  uba_submit_btn: {
    de: 'Bestellung absenden → GLB kontaktiert dich',
    fr: 'Envoyer la commande → GLB vous contacte',
    ln: 'Tinda commande → GLB ekobenga yo'
  },
  pay_with_lemfi: {
    de: 'Mit LemFi bezahlen',
    fr: 'Payer avec LemFi',
    ln: 'Futa na LemFi'
  },
  register_lemfi: {
    de: 'Bei LemFi registrieren',
    fr: "S'inscrire sur LemFi",
    ln: 'Kokoma na LemFi'
  },
  processing_btn: {
    de: 'Wird verarbeitet...',
    fr: 'Traitement...',
    ln: 'Ezali kosalema...'
  },
  order_error: {
    de: 'Fehler beim Erstellen der Bestellung',
    fr: 'Une erreur est survenue lors de la création de la commande',
    ln: 'Likitá ezali na kosala commande'
  },
  phone_required: {
    de: 'Telefonnummer ist erforderlich',
    fr: 'Numéro de téléphone requis',
    ln: 'Numéro ya téléphone esengeli'
  },
  phone_whatsapp_label: {
    de: 'Telefonnummer (WhatsApp)',
    fr: 'Numéro de téléphone (WhatsApp)',
    ln: 'Numéro ya téléphone (WhatsApp)'
  },
  required_field: {
    de: 'Pflichtfeld',
    fr: 'Obligatoire',
    ln: 'Esengeli'
  },
  phone_contact_note: {
    de: 'GLB kontaktiert dich über diese Nummer bezüglich Lieferung und Zahlung.',
    fr: 'GLB vous contactera via ce numéro pour la livraison et le paiement.',
    ln: 'GLB ekobenga yo na numéro oyo pona livraison mpe kofuta.'
  },
  agb_prefix: {
    de: 'Ich habe die ',
    fr: "J'ai lu et j'accepte les ",
    ln: 'Natanga mpe nasangisi na '
  },
  agb_link_text: {
    de: 'AGB',
    fr: 'CGV',
    ln: 'Mibeko oyo'
  },
  agb_suffix: {
    de: 'gelesen und stimme diesen zu.*',
    fr: '.*',
    ln: '.*'
  },
  agb_error: {
    de: 'Bitte stimmen Sie den AGB zu, um fortzufahren.',
    fr: 'Veuillez accepter les CGV pour continuer.',
    ln: 'Sangisa na Mibeko liboso ya kotindela commande.'
  },
  order_confirmed_header: {
    de: 'Bestellung bestätigt',
    fr: 'Commande confirmée',
    ln: 'Commande esangisami'
  },
  order_confirmed_title: {
    de: 'Bestellung aufgenommen!',
    fr: 'Commande enregistrée !',
    ln: 'Commande eyambami!'
  },
  order_confirmed_desc: {
    de: 'Ihre Bestellung wurde erfolgreich erstellt',
    fr: 'Votre commande a été créée avec succès',
    ln: 'Commande na yo esalemi malamu'
  },
  order_reference: {
    de: 'Bestellreferenz',
    fr: 'Référence de commande',
    ln: 'Référence ya commande'
  },
  lemfi_payment_instructions: {
    de: 'LemFi Zahlungsanweisungen',
    fr: 'Instructions de paiement LemFi',
    ln: 'Ndenge ya kofuta na LemFi'
  },
  amount_to_pay: {
    de: 'Zu zahlender Betrag',
    fr: 'Montant à payer',
    ln: 'Mbongo ya kofuta'
  },
  recipient: {
    de: 'Empfänger',
    fr: 'Destinataire',
    ln: 'Moto ya kozwa'
  },
  mandatory_reference: {
    de: 'Pflichtangabe Referenz',
    fr: 'Référence OBLIGATOIRE',
    ln: 'Référence ESENGELI'
  },
  email_instructions_sent: {
    de: 'Eine E-Mail mit allen Anweisungen wurde Ihnen gesendet.',
    fr: 'Un email avec toutes les instructions vous a été envoyé.',
    ln: 'Email na makambo nyonso etindelamaki na yo.'
  },
  demo_mode: {
    de: 'DEMO-MODUS - Keine echte Zahlung',
    fr: 'MODE DÉMO - Aucun paiement réel',
    ln: 'MODE DÉMO - Kofuta ya solo te'
  },
  empty_cart: {
    de: 'Ihr Warenkorb ist leer',
    fr: 'Votre panier est vide',
    ln: 'Panier na yo ezali pamba'
  },
  continue_shopping: {
    de: 'Weiter einkaufen',
    fr: 'Continuer les achats',
    ln: 'Kokoba kosomba'
  },
  my_orders: {
    de: 'Meine Bestellungen',
    fr: 'Mes commandes',
    ln: 'Ba-commandes na ngai'
  },
  order_status: {
    de: 'Status',
    fr: 'Statut',
    ln: 'Ndenge ezali'
  },
  pending: {
    de: 'Ausstehend',
    fr: 'En attente',
    ln: 'Ezali kozela'
  },
  processing: {
    de: 'In Bearbeitung',
    fr: 'En traitement',
    ln: 'Ezali kosalema'
  },
  shipped: {
    de: 'Versandt',
    fr: 'Expédié',
    ln: 'Etindami'
  },
  delivered: {
    de: 'Geliefert',
    fr: 'Livré',
    ln: 'Ekómaki'
  },
  sort_by: {
    de: 'Sortieren nach',
    fr: 'Trier par',
    ln: 'Kobongola'
  },
  price_low_high: {
    de: 'Preis aufsteigend',
    fr: 'Prix croissant',
    ln: 'Ntalo ya moke liboso'
  },
  price_high_low: {
    de: 'Preis absteigend',
    fr: 'Prix décroissant',
    ln: 'Ntalo ya mingi liboso'
  },
  newest: {
    de: 'Neueste',
    fr: 'Plus récent',
    ln: 'Ya sika koleka'
  },
  add_product: {
    de: 'Produkt hinzufügen',
    fr: 'Ajouter un produit',
    ln: 'Kobakisa eloko'
  },
  product_name: {
    de: 'Produktname',
    fr: 'Nom du produit',
    ln: 'Nkombo ya eloko'
  },
  description: {
    de: 'Beschreibung',
    fr: 'Description',
    ln: 'Ndimbola'
  },
  purchase_price: {
    de: 'Einkaufspreis',
    fr: "Prix d'achat",
    ln: 'Ntalo ya kosomba'
  },
  image_url: {
    de: 'Bild-URL',
    fr: "URL de l'image",
    ln: 'Lien ya image'
  },
  sale_price_auto: {
    de: 'Verkaufspreis (auto +50%)',
    fr: 'Prix de vente (auto +50%)',
    ln: 'Ntalo ya koteka (auto +50%)'
  },
  products: {
    de: 'Produkte',
    fr: 'Produits',
    ln: 'Biloko'
  },
  no_products: {
    de: 'Keine Produkte gefunden',
    fr: 'Aucun produit trouvé',
    ln: 'Eloko moko te'
  },
  edit: {
    de: 'Bearbeiten',
    fr: 'Modifier',
    ln: 'Kobongola'
  },
  delete: {
    de: 'Löschen',
    fr: 'Supprimer',
    ln: 'Kolongola'
  },
  confirm_delete: {
    de: 'Sind Sie sicher, dass Sie dieses Produkt löschen möchten?',
    fr: 'Êtes-vous sûr de vouloir supprimer ce produit ?',
    ln: 'Olingi solo kolongola eloko oyo?'
  },
  ask_question: {
    de: 'Frage stellen',
    fr: 'Poser une question',
    ln: 'Tuna motuna'
  },
  questions_remaining: {
    de: 'Noch {count} Fragen verfügbar',
    fr: 'Encore {count} questions disponibles',
    ln: 'Mituna {count} eteni'
  },
  contact_support: {
    de: 'Support kontaktieren',
    fr: 'Contacter le service client',
    ln: 'Benga service client'
  },
  chat_with_ai: {
    de: 'AI-Chat zu diesem Produkt',
    fr: 'Chat AI sur ce produit',
    ln: 'Chat AI ya eloko oyo'
  },
  send_message: {
    de: 'Senden',
    fr: 'Envoyer',
    ln: 'Tinda'
  },
  type_your_question: {
    de: 'Stellen Sie Ihre Frage...',
    fr: 'Posez votre question...',
    ln: 'Tuna motuna na yo...'
  },
  reviews: {
    de: 'Bewertungen',
    fr: 'Avis',
    ln: 'Ba-avis'
  },
  no_reviews: {
    de: 'Noch keine Bewertungen',
    fr: 'Aucun avis pour le moment',
    ln: 'Avis moko te'
  },
  add_review: {
    de: 'Bewertung schreiben',
    fr: 'Laisser un avis',
    ln: 'Tyá avis'
  },
  your_rating: {
    de: 'Ihre Bewertung',
    fr: 'Votre note',
    ln: 'Note na yo'
  },
  your_review: {
    de: 'Ihr Kommentar',
    fr: 'Votre commentaire',
    ln: 'Commentaire na yo'
  },
  your_name_optional: {
    de: 'Ihr Name (optional)',
    fr: 'Votre nom (optionnel)',
    ln: 'Nkombo na yo (soki olingi)'
  },
  submit_review: {
    de: 'Veröffentlichen',
    fr: 'Publier',
    ln: 'Kobimisa'
  },
  order_received: {
    de: 'Bestellung erhalten',
    fr: 'Commande reçue',
    ln: 'Commande eyambi'
  },
  in_preparation: {
    de: 'In Vorbereitung',
    fr: 'En préparation',
    ln: 'Ezali kobongisama'
  },
  in_container: {
    de: 'Im Container',
    fr: 'Dans le container',
    ln: 'Na kati ya container'
  },
  en_route: {
    de: 'Unterwegs nach Brazzaville',
    fr: 'En route vers Brazzaville',
    ln: 'Nzela ya Brazzaville'
  },
  arrived_brazzaville: {
    de: 'In Brazzaville angekommen',
    fr: 'Arrivé à Brazzaville',
    ln: 'Ekomi na Brazzaville'
  },
  ready_delivery: {
    de: 'Bereit zur Lieferung',
    fr: 'Prêt pour livraison',
    ln: 'Ezali pona kokaba'
  },
  estimated_delivery: {
    de: 'Voraussichtliche Lieferung',
    fr: 'Livraison estimée',
    ln: 'Mokolo ya kokaba'
  },
  notifications: {
    de: 'Benachrichtigungen',
    fr: 'Notifications',
    ln: 'Ba-notifications'
  },
  no_notifications: {
    de: 'Keine Benachrichtigungen',
    fr: 'Aucune notification',
    ln: 'Notification moko te'
  },
  mark_as_read: {
    de: 'Als gelesen markieren',
    fr: 'Marquer comme lu',
    ln: 'Tyá lokola etangami'
  },
  order_management: {
    de: 'Bestellverwaltung',
    fr: 'Gestion des commandes',
    ln: 'Gestion ya ba-commandes'
  },
  all_orders: {
    de: 'Alle Bestellungen',
    fr: 'Toutes les commandes',
    ln: 'Ba-commandes nyonso'
  },
  paid: {
    de: 'Bezahlt',
    fr: 'Payé',
    ln: 'Efutami'
  },
  partial_payment: {
    de: 'Teilzahlung',
    fr: 'Acompte',
    ln: 'Ndambo'
  },
  payment_pending: {
    de: 'Zahlung ausstehend',
    fr: 'En attente',
    ln: 'Ezali kozela'
  },
  remaining_balance: {
    de: 'Restbetrag',
    fr: 'Reste à payer',
    ln: 'Oyo etikali ya kofuta'
  },
  update_status: {
    de: 'Status aktualisieren',
    fr: 'Modifier le statut',
    ln: 'Kobongola statut'
  },
  customer_info: {
    de: 'Kundeninformationen',
    fr: 'Informations client',
    ln: 'Makambo ya client'
  },
  order_items: {
    de: 'Bestellte Artikel',
    fr: 'Articles commandés',
    ln: 'Biloko ya commande'
  },
  api_key_settings: {
    de: 'API-Einstellungen',
    fr: 'Paramètres API',
    ln: 'Paramètres API'
  },
  openai_api_key: {
    de: 'OpenAI API-Schlüssel',
    fr: 'Clé API OpenAI',
    ln: 'Clé API OpenAI'
  },
  save_api_key: {
    de: 'Schlüssel speichern',
    fr: 'Enregistrer la clé',
    ln: 'Kobomba clé'
  },
  back_to_catalog: {
    de: 'Zurück zum Katalog',
    fr: 'Retour au catalogue',
    ln: 'Zonga na catalogue'
  },
  product_details: {
    de: 'Produktdetails',
    fr: 'Détails du produit',
    ln: 'Makambo ya eloko'
  },
  average_rating: {
    de: 'Durchschnittsbewertung',
    fr: 'Note moyenne',
    ln: 'Note ya moyenne'
  },
  forgot_password: {
    de: 'Passwort vergessen?',
    fr: 'Mot de passe oublié ?',
    ln: 'Obosani mot de passe?'
  },
  reset_password: {
    de: 'Passwort zurücksetzen',
    fr: 'Réinitialiser le mot de passe',
    ln: 'Kozongisa mot de passe'
  },
  back_to_login: {
    de: 'Zurück zur Anmeldung',
    fr: 'Retour à la connexion',
    ln: 'Zonga na kokota'
  },
  reset_link_sent: {
    de: 'Link zum Zurücksetzen wurde gesendet',
    fr: 'Lien de réinitialisation envoyé',
    ln: 'Lien ya kozongisa etindami'
  },
  check_email: {
    de: 'Bitte überprüfen Sie Ihre E-Mail',
    fr: 'Veuillez vérifier votre email',
    ln: 'Tála email na yo'
  },
  new_password: {
    de: 'Neues Passwort',
    fr: 'Nouveau mot de passe',
    ln: 'Mot de passe ya sika'
  },
  confirm_password: {
    de: 'Passwort bestätigen',
    fr: 'Confirmer le mot de passe',
    ln: 'Ndimela mot de passe'
  },
  update_password: {
    de: 'Passwort aktualisieren',
    fr: 'Mettre à jour le mot de passe',
    ln: 'Kobongola mot de passe'
  },
  password_updated: {
    de: 'Passwort wurde aktualisiert',
    fr: 'Mot de passe mis à jour',
    ln: 'Mot de passe ebongwani'
  },
  toggle_email: {
    de: 'E-Mail',
    fr: 'E-Mail',
    ln: 'E-Mail'
  },
  toggle_phone: {
    de: 'Telefonnummer',
    fr: 'Téléphone',
    ln: 'Numéro ya téléphone'
  },
  phone_label: {
    de: 'Telefonnummer',
    fr: 'Numéro de téléphone',
    ln: 'Numéro ya téléphone na yo'
  },
  phone_placeholder: {
    de: '+242 XXX XXX XXX',
    fr: '+242 XXX XXX XXX',
    ln: '+242 XXX XXX XXX'
  },
  send_code: {
    de: 'Code senden',
    fr: 'Envoyer le code',
    ln: 'Tinda code'
  },
  code_sent_to: {
    de: 'Code gesendet an',
    fr: 'Code envoyé au',
    ln: 'Code etindelamaki na'
  },
  verify: {
    de: 'Bestätigen',
    fr: 'Confirmer',
    ln: 'Sangisa'
  },
  resend: {
    de: 'Code erneut senden',
    fr: 'Renvoyer le code',
    ln: 'Tinda lisusu code'
  },
  resend_in: {
    de: 'Erneut senden in',
    fr: 'Renvoyer dans',
    ln: 'Tinda lisusu na'
  },
  back: {
    de: 'Andere Nummer',
    fr: 'Autre numéro',
    ln: 'Numéro mosusu'
  },
  error_invalid_phone: {
    de: 'Ungültige Telefonnummer. Format: +242 + 9 Ziffern',
    fr: 'Numéro invalide. Format : +242 suivi de 9 chiffres',
    ln: 'Numéro ya malamu te. Format: +242 + chiffres 9'
  },
  error_invalid_code: {
    de: 'Ungültiger Code. Bitte erneut versuchen.',
    fr: 'Code invalide. Veuillez réessayer.',
    ln: 'Code ya malamu te. Meka lisusu.'
  },
  error_too_many: {
    de: 'Zu viele Versuche. Bitte warten Sie 5 Minuten.',
    fr: 'Trop de tentatives. Attendez 5 minutes.',
    ln: 'Osalelaki mingi. Linga tii 5 miniti.'
  },
  seller_apply_title: {
    de: 'Als Verkäufer bewerben',
    fr: 'Devenir vendeur',
    ln: 'Bimela kobika'
  },
  seller_apply_desc: {
    de: 'Verkaufe deine Produkte nach Afrika – GLB übernimmt die Lieferung',
    fr: 'Vendez vos produits en Afrique – GLB gère la livraison',
    ln: 'Teka biloko na Afrika – GLB ezali ko-livrer'
  },
  seller_apply_btn: {
    de: 'Bewerbung senden',
    fr: 'Envoyer la candidature',
    ln: 'Tinda candidature'
  },
  seller_germany_required: {
    de: 'Nur für Verkäufer in Deutschland. GLB übernimmt Versand & Lieferung nach Afrika.',
    fr: "Réservé aux vendeurs en Allemagne. GLB gère l'expédition vers l'Afrique.",
    ln: 'Pona bateki na Allemagne. GLB ezali ko-tinda na Afrika.'
  },
  seller_city: {
    de: 'Stadt (in Deutschland)',
    fr: 'Ville (en Allemagne)',
    ln: 'Ville (na Allemagne)'
  },
  seller_business_type: {
    de: 'Art des Verkäufers',
    fr: 'Type de vendeur',
    ln: 'Type ya moteki'
  },
  seller_private: {
    de: 'Privatperson',
    fr: 'Particulier',
    ln: 'Personne privée'
  },
  seller_business: {
    de: 'Unternehmen',
    fr: 'Entreprise',
    ln: 'Entreprise'
  },
  seller_message_placeholder: {
    de: 'Was möchtest du verkaufen? (optional)',
    fr: 'Que souhaitez-vous vendre? (optionnel)',
    ln: 'Olingi koteka nini? (soki olingi)'
  },
  seller_applied_title: {
    de: 'Bewerbung eingereicht!',
    fr: 'Candidature envoyée!',
    ln: 'Candidature etindelami!'
  },
  seller_applied_desc: {
    de: 'Wir prüfen deine Bewerbung und melden uns per E-Mail.',
    fr: 'Nous examinerons votre candidature et vous contacterons par email.',
    ln: 'Tozo-tala candidature na yo, tokobenga yo na email.'
  },
  seller_already_applied: {
    de: 'Du hast bereits eine Bewerbung eingereicht.',
    fr: 'Vous avez déjà soumis une candidature.',
    ln: 'Osimbi candidature kala.'
  },
  seller_pending_title: {
    de: 'Bewerbung wird geprüft',
    fr: "Candidature en cours d'examen",
    ln: 'Candidature ezali kotaliama'
  },
  seller_pending_desc: {
    de: 'Unser Team prüft deine Anfrage. Du erhältst eine E-Mail.',
    fr: 'Notre équipe examine votre demande. Vous recevrez un email.',
    ln: 'Bato na biso bazali ko-tala. Okozwa email.'
  },
  seller_rejected_title: {
    de: 'Bewerbung abgelehnt',
    fr: 'Candidature refusée',
    ln: 'Candidature eboyami'
  },
  seller_rejected_desc: {
    de: 'Leider können wir deine Bewerbung nicht genehmigen.',
    fr: 'Nous ne pouvons malheureusement pas approuver votre candidature.',
    ln: 'Tolingi te, tokoki te kozua candidature na yo.'
  },
  seller_approved_badge: {
    de: 'Genehmigter Verkäufer',
    fr: 'Vendeur approuvé',
    ln: 'Moteki azuami'
  },
  seller_dashboard_title: {
    de: 'Mein Verkäufer-Bereich',
    fr: 'Mon espace vendeur',
    ln: 'Esika na ngai ya moteki'
  },
  seller_dashboard_desc: {
    de: 'Verwalte deine Inserate für den afrikanischen Markt',
    fr: 'Gérez vos annonces pour le marché africain',
    ln: 'Leka ba-annonces na yo pona marché ya Afrique'
  },
  seller_no_products: {
    de: 'Noch keine Produkte inseriert',
    fr: 'Aucun produit encore annoncé',
    ln: 'Eloko moko te elongami'
  },
  seller_no_application: {
    de: 'Keine Bewerbung gefunden',
    fr: 'Aucune candidature trouvée',
    ln: 'Candidature moko te'
  },
  seller_new_product: {
    de: 'Neues Produkt inserieren',
    fr: 'Ajouter une nouvelle annonce',
    ln: 'Bakisa eloko ya sika'
  },
  seller_shipping_notice: {
    de: 'GLB übernimmt die Lieferung nach Kinshasa/Brazzaville. Keine Direktzahlung an dich.',
    fr: 'GLB gère la livraison vers Kinshasa/Brazzaville. Pas de paiement direct.',
    ln: 'GLB ezali ko-livrer na Kinshasa/Brazzaville. Mbongo na biso.'
  },
  seller_image_hint: {
    de: 'Link zu einem Bild deines Produkts (z.B. aus Google Drive, Dropbox)',
    fr: 'Lien vers une image de votre produit',
    ln: 'Lien ya image ya eloko na yo'
  },
  seller_publish: {
    de: 'Inserat veröffentlichen',
    fr: "Publier l'annonce",
    ln: 'Longola annonce'
  },
  become_seller: {
    de: 'Verkäufer werden',
    fr: 'Devenir vendeur',
    ln: 'Koma moteki'
  },
  my_seller_area: {
    de: 'Mein Verkäufer-Bereich',
    fr: 'Mon espace vendeur',
    ln: 'Esika ya moteki'
  },

  // ── Marketplace ──────────────────────────────────────────────────────────────
  marketplace_title: {
    de: 'Marktplätze durchsuchen',
    fr: 'Rechercher sur les marchés',
    ln: 'Luka na ba-marché'
  },
  marketplace_subtitle: {
    de: 'Produkt suchen — GLB liefert nach Congo',
    fr: 'Chercher un produit — GLB livre au Congo',
    ln: 'Luka eloko — GLB ekobakisa na Congo'
  },
  marketplace_tab_search: {
    de: 'Marktplätze durchsuchen',
    fr: 'Parcourir les marchés',
    ln: 'Luka na ba-marché'
  },
  marketplace_tab_link: {
    de: 'Link einreichen',
    fr: 'Soumettre un lien',
    ln: 'Tinda lien'
  },
  marketplace_search_placeholder: {
    de: 'Suchbegriff eingeben… z.B. iPhone, Sofa, Nike',
    fr: 'Entrez un mot-clé… ex: iPhone, Canapé, Nike',
    ln: 'Tiya liloba… ex: iPhone, Sofa, Nike'
  },
  marketplace_link_placeholder: {
    de: 'https://www.ebay.de/itm/... oder amazon.de/dp/...',
    fr: 'https://www.ebay.de/itm/... ou amazon.de/dp/...',
    ln: 'https://www.ebay.de/itm/... to amazon.de/dp/...'
  },
  marketplace_how_it_works: {
    de: 'So funktioniert es',
    fr: 'Comment ça marche',
    ln: 'Ndenge esalema'
  },
  marketplace_step1: {
    de: 'Suchbegriff eingeben & Marktplatz wählen',
    fr: 'Entrer un mot-clé & choisir un marché',
    ln: 'Tiya liloba & pona marché'
  },
  marketplace_step2: {
    de: 'Produkt finden & Link kopieren',
    fr: 'Trouver le produit & copier le lien',
    ln: 'Yeba eloko & kopia lien'
  },
  marketplace_step3: {
    de: 'Link einreichen → GLB liefert nach Congo',
    fr: 'Soumettre le lien → GLB livre au Congo',
    ln: 'Tinda lien → GLB ekobakisa na Congo'
  },
  marketplace_choose: {
    de: 'Marktplatz wählen',
    fr: 'Choisir un marché',
    ln: 'Pona marché'
  },
  marketplace_open: {
    de: 'Öffnen',
    fr: 'Ouvrir',
    ln: 'Fungola'
  },
  marketplace_search_on: {
    de: 'suchen',
    fr: 'rechercher',
    ln: 'luka'
  },
  marketplace_found: {
    de: 'Produkt gefunden?',
    fr: 'Produit trouvé?',
    ln: 'Ozwi eloko?'
  },
  marketplace_found_desc: {
    de: 'Link kopieren → oben auf „Link einreichen" klicken → GLB kauft und liefert nach Congo.',
    fr: 'Copiez le lien → cliquez sur „Soumettre un lien" → GLB achète et livre au Congo.',
    ln: 'Kopia lien → penza „Tinda lien" → GLB esomba mpe ekobakisa na Congo.'
  },
  marketplace_submit_link: {
    de: 'Jetzt Link einreichen →',
    fr: 'Soumettre le lien maintenant →',
    ln: 'Tinda lien sikoyo →'
  },
  marketplace_supported: {
    de: 'Unterstützte Marktplätze',
    fr: 'Marchés supportés',
    ln: 'Ba-marché oyo tozali kosalela'
  },
  marketplace_tip: {
    de: 'Öffnen Sie den Marktplatz, suchen Sie Ihr Produkt, kopieren Sie den Link und reichen Sie ihn ein.',
    fr: 'Ouvrez le marché, trouvez votre produit, copiez le lien et soumettez-le.',
    ln: 'Fungola marché, luka eloko, kopia lien mpe tinda yango.'
  },
  marketplace_order_btn: {
    de: 'Bei GLB bestellen',
    fr: 'Commander via GLB',
    ln: 'Somba na GLB'
  },
  marketplace_link_error_empty: {
    de: 'Bitte einen Link eingeben',
    fr: 'Veuillez entrer un lien',
    ln: 'Tiya lien liboso'
  },
  marketplace_link_error_http: {
    de: 'Link muss mit https:// beginnen',
    fr: 'Le lien doit commencer par https://',
    ln: 'Lien esengeli kobanda na https://'
  },
  marketplace_link_error_domain: {
    de: 'Nur Links von eBay.de, Kleinanzeigen, Amazon.de, reBuy.de oder Vinted.de erlaubt',
    fr: 'Seuls les liens de eBay.de, Kleinanzeigen, Amazon.de, reBuy.de ou Vinted.de sont acceptés',
    ln: 'Lien ya eBay.de, Kleinanzeigen, Amazon.de, reBuy.de to Vinted.de kaka'
  },

  // ── Order Modal ───────────────────────────────────────────────────────────────
  order_product_details: {
    de: 'Produktdetails eingeben',
    fr: 'Saisir les détails du produit',
    ln: 'Tiya makambo ya eloko'
  },
  order_product_price: {
    de: 'Produktpreis (€)',
    fr: 'Prix du produit (€)',
    ln: 'Ntalo ya eloko (€)'
  },
  order_price_hint: {
    de: 'Den Preis vom Marktplatz ablesen und hier eingeben',
    fr: 'Lire le prix sur le marché et le saisir ici',
    ln: 'Tanga ntalo na marché mpe tiya awa'
  },
  order_quantity: {
    de: 'Menge',
    fr: 'Quantité',
    ln: 'Motango'
  },
  order_variant: {
    de: 'Größe / Farbe',
    fr: 'Taille / Couleur',
    ln: 'Bonene / Rangi'
  },
  order_variant_placeholder: {
    de: 'z.B. Rot, XL',
    fr: 'ex: Rouge, XL',
    ln: 'ex: Motane, XL'
  },
  order_delivery_city: {
    de: 'Lieferort',
    fr: 'Ville de livraison',
    ln: 'Ville ya kokaba'
  },
  order_note: {
    de: 'Hinweis (optional)',
    fr: 'Remarque (optionnel)',
    ln: 'Liloba (soki olingi)'
  },
  order_note_placeholder: {
    de: 'z.B. bitte gut verpacken…',
    fr: 'ex: bien emballer svp…',
    ln: 'ex: bokanga malamu…'
  },
  order_total_offer: {
    de: 'GLB Gesamtangebot',
    fr: 'Offre totale GLB',
    ln: 'Prix mobimba ya GLB'
  },
  order_pickup_fee: {
    de: 'Abholung in Deutschland',
    fr: 'Récupération en Allemagne',
    ln: 'Kokamata na Allemagne'
  },
  order_shipping_fee: {
    de: 'Verschiffung nach Congo',
    fr: 'Expédition vers Congo',
    ln: 'Kotinda na Congo'
  },
  order_service_fee: {
    de: 'GLB Servicegebühr',
    fr: 'Frais de service GLB',
    ln: 'Mbongo ya service GLB'
  },
  order_customs: {
    de: 'Verzollung',
    fr: 'Dédouanement',
    ln: 'Douane'
  },
  order_customs_with: {
    de: '✓ Mit Verzollung',
    fr: '✓ Avec dédouanement',
    ln: '✓ Na douane'
  },
  order_customs_with_sub: {
    de: 'Lieferung bis Haustür',
    fr: 'Livraison à domicile',
    ln: 'Kokaba na ndako'
  },
  order_customs_without: {
    de: 'Ohne Verzollung',
    fr: 'Sans dédouanement',
    ln: 'Kozanga douane'
  },
  order_customs_without_sub: {
    de: 'Abholung am Hafen',
    fr: 'Retrait au port',
    ln: 'Kokamata na port'
  },
  order_accept: {
    de: 'Akzeptieren →',
    fr: 'Accepter →',
    ln: 'Ndima →'
  },
  order_payment_title: {
    de: 'Zahlung — UBA Congo',
    fr: 'Paiement — UBA Congo',
    ln: 'Kofuta — UBA Congo'
  },
  order_payment_instruction_title: {
    de: 'Zahlungsanweisung',
    fr: 'Instructions de paiement',
    ln: 'Ndenge ya kofuta'
  },
  order_payment_step1: {
    de: 'Ein GLB-Agent begleitet Sie zur UBA-Filiale',
    fr: 'Un agent GLB vous accompagne à la filiale UBA',
    ln: 'Agent ya GLB akotambola na yo na UBA'
  },
  order_payment_step2: {
    de: 'Zahlung in CDF oder USD möglich',
    fr: 'Paiement en CDF ou USD possible',
    ln: 'Kofuta na CDF to USD ekoki'
  },
  order_payment_step3: {
    de: 'Sofortige offizielle Quittung',
    fr: 'Reçu officiel immédiat',
    ln: 'Reçu ya sika mbangu'
  },
  order_payment_step4: {
    de: 'Tracking-Nummer per WhatsApp',
    fr: 'Numéro de suivi par WhatsApp',
    ln: 'Numéro ya tracking na WhatsApp'
  },
  order_to_pay: {
    de: 'Zu zahlen',
    fr: 'À payer',
    ln: 'Kofuta'
  },
  order_customs_label: {
    de: 'Verzollung',
    fr: 'Dédouanement',
    ln: 'Douane'
  },
  order_customs_yes: {
    de: 'Ja (Haustür)',
    fr: 'Oui (domicile)',
    ln: 'Iyo (ndako)'
  },
  order_customs_no: {
    de: 'Nein (Hafen)',
    fr: 'Non (port)',
    ln: 'Te (port)'
  },
  order_saving: {
    de: 'Wird gespeichert…',
    fr: 'Enregistrement…',
    ln: 'Ezali kobomba…'
  },
  order_confirm_payment: {
    de: 'Zahlung bestätigt ✓',
    fr: 'Paiement confirmé ✓',
    ln: 'Kofuta esangisami ✓'
  },
  order_next_step: {
    de: 'GLB kauft Produkt',
    fr: 'GLB achète le produit',
    ln: 'GLB esomba eloko'
  },
  order_delivery_time: {
    de: '3–6 Wochen',
    fr: '3–6 semaines',
    ln: 'Mposo 3–6'
  },
  order_next_steps_title: {
    de: 'Nächste Schritte',
    fr: 'Prochaines étapes',
    ln: 'Malako oyo elandi'
  },
  order_process_1: {
    de: 'GLB kauft Produkt beim Verkäufer',
    fr: 'GLB achète le produit au vendeur',
    ln: 'GLB esomba eloko epai ya moteki'
  },
  order_process_2: {
    de: 'Qualitätskontrolle & Verpackung',
    fr: 'Contrôle qualité & emballage',
    ln: 'Kotala qualité & kobomba'
  },
  order_process_3: {
    de: 'Containerverladung & Verschiffung',
    fr: 'Chargement container & expédition',
    ln: 'Kotya na container & kotinda'
  },
  order_process_4: {
    de: 'Verzollung & Inland-Lieferung',
    fr: 'Dédouanement & livraison intérieure',
    ln: 'Douane & kokaba na kati'
  },
  order_process_5: {
    de: 'Übergabe in',
    fr: 'Remise à',
    ln: 'Kopesa na'
  },
  order_whatsapp_btn: {
    de: 'Bestellung per WhatsApp senden',
    fr: 'Envoyer la commande par WhatsApp',
    ln: 'Tinda commande na WhatsApp'
  },
  order_done: {
    de: 'Fertig — Zur Übersicht',
    fr: 'Terminé — Voir le tableau de bord',
    ln: 'Malamu — Tala résumé'
  },
  order_go_back: {
    de: '← Zurück',
    fr: '← Retour',
    ln: '← Zonga'
  },
  order_next: {
    de: 'Weiter',
    fr: 'Suivant',
    ln: 'Eleka'
  },
  order_cancel: {
    de: 'Abbrechen',
    fr: 'Annuler',
    ln: 'Tika'
  },
  order_step_product: {
    de: 'Produkt',
    fr: 'Produit',
    ln: 'Eloko'
  },
  order_step_offer: {
    de: 'Angebot',
    fr: 'Offre',
    ln: 'Prix'
  },
  order_step_payment: {
    de: 'Zahlung',
    fr: 'Paiement',
    ln: 'Kofuta'
  },
  order_step_confirmation: {
    de: 'Bestätigung',
    fr: 'Confirmation',
    ln: 'Sangisa'
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
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

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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

