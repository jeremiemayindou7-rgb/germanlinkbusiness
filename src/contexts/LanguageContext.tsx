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
  demo_mode: {
    de: 'DEMO-MODUS - Keine echte Zahlung',
    fr: 'MODE DÉMO - Aucun paiement réel',
    ln: 'MODE DÉMO - Kofuta ya solo te'
  },
  order_reference: {
    de: 'Bestellreferenz',
    fr: 'Référence de commande',
    ln: 'Référence ya commande'
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
  }
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
    fr: 'Réservé aux vendeurs en Allemagne. GLB gère l\'expédition vers l\'Afrique.',
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
  seller_private: { de: 'Privatperson', fr: 'Particulier', ln: 'Personne privée' },
  seller_business: { de: 'Unternehmen', fr: 'Entreprise', ln: 'Entreprise' },
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
    fr: 'Candidature en cours d\'examen',
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
    fr: 'Publier l\'annonce',
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
