import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderEmailRequest {
  orderId: string;
  type: 'order_confirmation' | 'payment_confirmed' | 'order_shipped' | 'order_delivered' | 'agent_dispatched';
}

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total_amount: number;
  payment_status: string;
  order_status: string;
  next_shipment_date: string | null;
  items: any[];
  created_at: string;
  payment_method: string;
  customer_phone: string | null;
}

interface Profile {
  name: string;
  email: string;
  phone: string | null;
  whatsapp_number: string | null;
  delivery_address: string | null;
}

const getUbaCongoOrderConfirmation = (
  order: Order,
  profile: Profile,
  language: 'de' | 'fr' | 'ln' = 'de'
): { subject: string; html: string; text: string } => {
  const templates = {
    de: {
      subject: `Ihre Bestellung ${order.order_number} – Agent kontaktiert Sie bald`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Vielen Dank für Ihre Bestellung!</h2>
          <p>Hallo ${profile.name},</p>
          <p>Wir haben Ihre Bestellung erhalten und bearbeiten sie nun.</p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Bestelldetails</h3>
            <p><strong>Bestellnummer:</strong> ${order.order_number}</p>
            <p><strong>Gesamtbetrag:</strong> ${order.total_amount.toFixed(2)}€</p>
          </div>

          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #1e40af;">Nächster Schritt</h3>
            <p>Ein GermanLink-Agent wird Sie unter <strong>${order.customer_phone}</strong> innerhalb von <strong>24 Stunden</strong> kontaktieren.</p>
            <p style="margin-top: 15px;">Bitte halten Sie folgende Referenz bereit: <strong>${order.order_number}</strong></p>
            <p>Diese benötigen Sie für die Einzahlung bei UBA Bank.</p>
            <p><strong>Empfänger:</strong> GermanLink Business GmbH</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <h3>📦 Bestellte Artikel:</h3>
            ${order.items.map((item: any) => `
              <div style="margin: 10px 0; padding: 10px; background: #f9fafb; border-radius: 4px;">
                <p style="margin: 5px 0;"><strong>${item.product_name}</strong></p>
                <p style="margin: 5px 0; color: #6b7280;">Menge: ${item.quantity} × ${item.price.toFixed(2)}€</p>
              </div>
            `).join('')}
          </div>

          <p style="margin-top: 30px;">Bei Fragen kontaktieren Sie uns gerne:</p>
          <p>📧 support@germanlink.business</p>
          <p style="color: #6b7280; margin-top: 30px;">Mit freundlichen Grüßen,<br>Ihr GermanLink Business Team</p>
        </div>
      `,
      text: `Vielen Dank für Ihre Bestellung!\n\nBestellnummer: ${order.order_number}\nGesamtbetrag: ${order.total_amount.toFixed(2)}€\n\nNächster Schritt:\nEin Agent wird Sie unter ${order.customer_phone} innerhalb von 24 Stunden kontaktieren.\n\nReferenz für UBA Bank: ${order.order_number}\nEmpfänger: GermanLink Business GmbH\n\nBei Fragen: support@germanlink.business`
    },
    fr: {
      subject: `Votre commande ${order.order_number} – Un agent vous contactera bientôt`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Merci pour votre commande!</h2>
          <p>Bonjour ${profile.name},</p>
          <p>Nous avons reçu votre commande et la traitons maintenant.</p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Détails de la commande</h3>
            <p><strong>Numéro de commande:</strong> ${order.order_number}</p>
            <p><strong>Montant total:</strong> ${order.total_amount.toFixed(2)}€</p>
          </div>

          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #1e40af;">Prochaine étape</h3>
            <p>Un agent GermanLink vous contactera au <strong>${order.customer_phone}</strong> dans les <strong>24 heures</strong>.</p>
            <p style="margin-top: 15px;">Référence pour le paiement UBA Bank: <strong>${order.order_number}</strong></p>
            <p><strong>Bénéficiaire:</strong> GermanLink Business GmbH</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <h3>📦 Articles commandés:</h3>
            ${order.items.map((item: any) => `
              <div style="margin: 10px 0; padding: 10px; background: #f9fafb; border-radius: 4px;">
                <p style="margin: 5px 0;"><strong>${item.product_name}</strong></p>
                <p style="margin: 5px 0; color: #6b7280;">Quantité: ${item.quantity} × ${item.price.toFixed(2)}€</p>
              </div>
            `).join('')}
          </div>

          <p style="margin-top: 30px;">Pour toute question, contactez-nous:</p>
          <p>📧 support@germanlink.business</p>
          <p style="color: #6b7280; margin-top: 30px;">Cordialement,<br>L'équipe GermanLink Business</p>
        </div>
      `,
      text: `Merci pour votre commande!\n\nNuméro de commande: ${order.order_number}\nMontant total: ${order.total_amount.toFixed(2)}€\n\nProchaine étape:\nUn agent vous contactera au ${order.customer_phone} dans les 24 heures.\n\nRéférence UBA Bank: ${order.order_number}\nBénéficiaire: GermanLink Business GmbH\n\nQuestions: support@germanlink.business`
    },
    ln: {
      subject: `Commande na yo ${order.order_number} – Agent akozela yo`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Tosepeli na commande na yo!</h2>
          <p>Mbote ${profile.name},</p>
          <p>Tozwi commande na yo mpe tozali kosala yango sikoyo.</p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Ba détails ya commande</h3>
            <p><strong>Numéro ya commande:</strong> ${order.order_number}</p>
            <p><strong>Mbongo mobimba:</strong> ${order.total_amount.toFixed(2)}€</p>
          </div>

          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #1e40af;">Etape elandi</h3>
            <p>Agent ya GermanLink akozela yo na <strong>${order.customer_phone}</strong> na saa <strong>24</strong>.</p>
            <p style="margin-top: 15px;">Référence ya UBA Bank: <strong>${order.order_number}</strong></p>
            <p><strong>Bénéficiaire:</strong> GermanLink Business GmbH</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <h3>📦 Biloko oyo osombi:</h3>
            ${order.items.map((item: any) => `
              <div style="margin: 10px 0; padding: 10px; background: #f9fafb; border-radius: 4px;">
                <p style="margin: 5px 0;"><strong>${item.product_name}</strong></p>
                <p style="margin: 5px 0; color: #6b7280;">Quantité: ${item.quantity} × ${item.price.toFixed(2)}€</p>
              </div>
            `).join('')}
          </div>

          <p style="margin-top: 30px;">Pona mituna, benga biso:</p>
          <p>📧 support@germanlink.business</p>
          <p style="color: #6b7280; margin-top: 30px;">Na bolingo,<br>Équipe ya GermanLink Business</p>
        </div>
      `,
      text: `Tosepeli na commande na yo!\n\nNuméro ya commande: ${order.order_number}\nMbongo mobimba: ${order.total_amount.toFixed(2)}€\n\nEtape elandi:\nAgent akozela yo na ${order.customer_phone} na saa 24.\n\nRéférence ya UBA Bank: ${order.order_number}\nBénéficiaire: GermanLink Business GmbH\n\nMituna: support@germanlink.business`
    }
  };

  return templates[language];
};

const getAgentDispatchedTemplate = (
  order: Order,
  profile: Profile,
  language: 'de' | 'fr' | 'ln' = 'de'
): { subject: string; html: string; text: string } => {
  const templates = {
    de: {
      subject: `Update zu Ihrer Bestellung ${order.order_number} – Agent ist unterwegs`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Ihr Agent ist informiert!</h2>
          <p>Hallo ${profile.name},</p>
          <p>Ihr Agent wurde informiert und wird Sie bald kontaktieren.</p>

          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #1e40af;">Wichtige Informationen</h3>
            <p><strong>Bestellnummer:</strong> ${order.order_number}</p>
            <p><strong>Telefon:</strong> ${order.customer_phone}</p>
            <p><strong>Referenz für UBA Bank:</strong> ${order.order_number}</p>
          </div>

          <p>Der Agent wird Sie unter der angegebenen Nummer kontaktieren und Sie zur UBA Bank begleiten.</p>

          <p style="margin-top: 30px;">Bei Fragen kontaktieren Sie uns gerne:</p>
          <p>📧 support@germanlink.business</p>
          <p style="color: #6b7280; margin-top: 30px;">Mit freundlichen Grüßen,<br>Ihr GermanLink Business Team</p>
        </div>
      `,
      text: `Ihr Agent ist informiert!\n\nBestellnummer: ${order.order_number}\nTelefon: ${order.customer_phone}\nReferenz für UBA Bank: ${order.order_number}\n\nDer Agent wird Sie bald kontaktieren.\n\nGermanLink Business`
    },
    fr: {
      subject: `Mise à jour de votre commande ${order.order_number} – Agent en route`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Votre agent est informé!</h2>
          <p>Bonjour ${profile.name},</p>
          <p>Votre agent a été informé et vous contactera bientôt.</p>

          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #1e40af;">Informations importantes</h3>
            <p><strong>Numéro de commande:</strong> ${order.order_number}</p>
            <p><strong>Téléphone:</strong> ${order.customer_phone}</p>
            <p><strong>Référence UBA Bank:</strong> ${order.order_number}</p>
          </div>

          <p>L'agent vous contactera au numéro indiqué et vous accompagnera à UBA Bank.</p>

          <p style="margin-top: 30px;">Pour toute question, contactez-nous:</p>
          <p>📧 support@germanlink.business</p>
          <p style="color: #6b7280; margin-top: 30px;">Cordialement,<br>L'équipe GermanLink Business</p>
        </div>
      `,
      text: `Votre agent est informé!\n\nNuméro de commande: ${order.order_number}\nTéléphone: ${order.customer_phone}\nRéférence UBA Bank: ${order.order_number}\n\nL'agent vous contactera bientôt.\n\nGermanLink Business`
    },
    ln: {
      subject: `Mise à jour ya commande ${order.order_number} – Agent azali na nzela`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Agent na yo ayebi!</h2>
          <p>Mbote ${profile.name},</p>
          <p>Agent na yo ayebi mpe akozela yo noki.</p>

          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #1e40af;">Ba informations ya ntina</h3>
            <p><strong>Numéro ya commande:</strong> ${order.order_number}</p>
            <p><strong>Téléphone:</strong> ${order.customer_phone}</p>
            <p><strong>Référence UBA Bank:</strong> ${order.order_number}</p>
          </div>

          <p>Agent akozela yo na numéro oyo mpe akokende na yo na UBA Bank.</p>

          <p style="margin-top: 30px;">Pona mituna, benga biso:</p>
          <p>📧 support@germanlink.business</p>
          <p style="color: #6b7280; margin-top: 30px;">Na bolingo,<br>Équipe ya GermanLink Business</p>
        </div>
      `,
      text: `Agent na yo ayebi!\n\nNuméro ya commande: ${order.order_number}\nTéléphone: ${order.customer_phone}\nRéférence UBA Bank: ${order.order_number}\n\nAgent akozela yo noki.\n\nGermanLink Business`
    }
  };

  return templates[language];
};

const getEmailTemplate = (
  type: string,
  order: Order,
  profile: Profile,
  language: 'de' | 'fr' | 'ln' = 'de'
): { subject: string; html: string; text: string } => {
  // For order_confirmation, check payment_method
  if (type === 'order_confirmation' && order.payment_method === 'uba_congo') {
    return getUbaCongoOrderConfirmation(order, profile, language);
  }

  const templates = {
    order_confirmation: {
      de: {
        subject: `Bestellbestätigung - ${order.order_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Vielen Dank für Ihre Bestellung!</h2>
            <p>Hallo ${profile.name},</p>
            <p>Wir haben Ihre Bestellung erhalten und bearbeiten sie nun.</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Bestelldetails</h3>
              <p><strong>Bestellnummer:</strong> ${order.order_number}</p>
              <p><strong>Gesamtbetrag:</strong> ${order.total_amount.toFixed(2)}€</p>
              <p><strong>Status:</strong> ${order.payment_status === 'pending' ? 'Zahlung ausstehend' : 'Bezahlt'}</p>
              ${order.next_shipment_date ? `<p><strong>Voraussichtlicher Versand:</strong> ${new Date(order.next_shipment_date).toLocaleDateString('de-DE')}</p>` : ''}
            </div>

            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <h3 style="margin-top: 0; color: #92400e;">💳 Zahlungsinformationen</h3>
              <p>Bitte überweisen Sie den Betrag über <strong>LemFi</strong>:</p>
              <p><strong>Empfänger:</strong> GermanLink Business GmbH</p>
              <p><strong>IBAN:</strong> DE89 3704 0044 0532 0130 00</p>
              <p><strong>Verwendungszweck:</strong> ${order.order_number}</p>
              <p><strong>Betrag:</strong> ${order.total_amount.toFixed(2)}€</p>
              <p style="color: #92400e; margin-top: 15px;">⚠️ <strong>WICHTIG:</strong> Bitte geben Sie die Bestellnummer <strong>${order.order_number}</strong> im Verwendungszweck an!</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <h3>📦 Bestellte Artikel:</h3>
              ${order.items.map((item: any) => `
                <div style="margin: 10px 0; padding: 10px; background: #f9fafb; border-radius: 4px;">
                  <p style="margin: 5px 0;"><strong>${item.name}</strong></p>
                  <p style="margin: 5px 0; color: #6b7280;">Menge: ${item.quantity} × ${item.price.toFixed(2)}€</p>
                </div>
              `).join('')}
            </div>

            <p style="margin-top: 30px;">Bei Fragen kontaktieren Sie uns gerne:</p>
            <p>📧 support@germanlink.business<br>
            📱 WhatsApp: +49-XXX-XXXXXXX</p>

            <p style="color: #6b7280; margin-top: 30px;">Mit freundlichen Grüßen,<br>Ihr GermanLink Business Team</p>
          </div>
        `,
        text: `Vielen Dank für Ihre Bestellung!\n\nBestellnummer: ${order.order_number}\nGesamtbetrag: ${order.total_amount.toFixed(2)}€\n\n💳 ZAHLUNGSINFORMATIONEN:\nBitte überweisen Sie über LemFi:\nEmpfänger: GermanLink Business GmbH\nIBAN: DE89 3704 0044 0532 0130 00\nVerwendungszweck: ${order.order_number}\nBetrag: ${order.total_amount.toFixed(2)}€\n\n⚠️ WICHTIG: Geben Sie die Bestellnummer ${order.order_number} im Verwendungszweck an!\n\nBei Fragen: support@germanlink.business`
      },
      fr: {
        subject: `Confirmation de commande - ${order.order_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Merci pour votre commande!</h2>
            <p>Bonjour ${profile.name},</p>
            <p>Nous avons reçu votre commande et la traitons maintenant.</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Détails de la commande</h3>
              <p><strong>Numéro de commande:</strong> ${order.order_number}</p>
              <p><strong>Montant total:</strong> ${order.total_amount.toFixed(2)}€</p>
              <p><strong>Statut:</strong> ${order.payment_status === 'pending' ? 'Paiement en attente' : 'Payé'}</p>
              ${order.next_shipment_date ? `<p><strong>Expédition prévue:</strong> ${new Date(order.next_shipment_date).toLocaleDateString('fr-FR')}</p>` : ''}
            </div>

            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <h3 style="margin-top: 0; color: #92400e;">💳 Informations de paiement</h3>
              <p>Veuillez effectuer le virement via <strong>LemFi</strong>:</p>
              <p><strong>Bénéficiaire:</strong> GermanLink Business GmbH</p>
              <p><strong>IBAN:</strong> DE89 3704 0044 0532 0130 00</p>
              <p><strong>Référence:</strong> ${order.order_number}</p>
              <p><strong>Montant:</strong> ${order.total_amount.toFixed(2)}€</p>
              <p style="color: #92400e; margin-top: 15px;">⚠️ <strong>IMPORTANT:</strong> Indiquez le numéro de commande <strong>${order.order_number}</strong> dans la référence!</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <h3>📦 Articles commandés:</h3>
              ${order.items.map((item: any) => `
                <div style="margin: 10px 0; padding: 10px; background: #f9fafb; border-radius: 4px;">
                  <p style="margin: 5px 0;"><strong>${item.name}</strong></p>
                  <p style="margin: 5px 0; color: #6b7280;">Quantité: ${item.quantity} × ${item.price.toFixed(2)}€</p>
                </div>
              `).join('')}
            </div>

            <p style="margin-top: 30px;">Pour toute question, contactez-nous:</p>
            <p>📧 support@germanlink.business<br>
            📱 WhatsApp: +49-XXX-XXXXXXX</p>

            <p style="color: #6b7280; margin-top: 30px;">Cordialement,<br>L'équipe GermanLink Business</p>
          </div>
        `,
        text: `Merci pour votre commande!\n\nNuméro de commande: ${order.order_number}\nMontant total: ${order.total_amount.toFixed(2)}€\n\n💳 INFORMATIONS DE PAIEMENT:\nEffectuez le virement via LemFi:\nBénéficiaire: GermanLink Business GmbH\nIBAN: DE89 3704 0044 0532 0130 00\nRéférence: ${order.order_number}\nMontant: ${order.total_amount.toFixed(2)}€\n\n⚠️ IMPORTANT: Indiquez le numéro ${order.order_number} dans la référence!\n\nQuestions: support@germanlink.business`
      },
      ln: {
        subject: `Confirmation ya commande - ${order.order_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Matondo pona commande na yo!</h2>
            <p>Mbote ${profile.name},</p>
            <p>Tozwi commande na yo mpe tozali kosala yango sikoyo.</p>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Ba détails ya commande</h3>
              <p><strong>Numéro ya commande:</strong> ${order.order_number}</p>
              <p><strong>Mbongo mobimba:</strong> ${order.total_amount.toFixed(2)}€</p>
              <p><strong>Statut:</strong> ${order.payment_status === 'pending' ? 'Paiement ezali kozela' : 'Efutami'}</p>
              ${order.next_shipment_date ? `<p><strong>Expédition:</strong> ${new Date(order.next_shipment_date).toLocaleDateString('fr-FR')}</p>` : ''}
            </div>

            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <h3 style="margin-top: 0; color: #92400e;">💳 Ba informations ya kofuta</h3>
              <p>Futa na <strong>LemFi</strong>:</p>
              <p><strong>Bénéficiaire:</strong> GermanLink Business GmbH</p>
              <p><strong>IBAN:</strong> DE89 3704 0044 0532 0130 00</p>
              <p><strong>Référence:</strong> ${order.order_number}</p>
              <p><strong>Mbongo:</strong> ${order.total_amount.toFixed(2)}€</p>
              <p style="color: #92400e; margin-top: 15px;">⚠️ <strong>IMPORTANT:</strong> Tya numéro ya commande <strong>${order.order_number}</strong> na référence!</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <h3>📦 Biloko oyo osombi:</h3>
              ${order.items.map((item: any) => `
                <div style="margin: 10px 0; padding: 10px; background: #f9fafb; border-radius: 4px;">
                  <p style="margin: 5px 0;"><strong>${item.name}</strong></p>
                  <p style="margin: 5px 0; color: #6b7280;">Quantité: ${item.quantity} × ${item.price.toFixed(2)}€</p>
                </div>
              `).join('')}
            </div>

            <p style="margin-top: 30px;">Pona mituna, benga biso:</p>
            <p>📧 support@germanlink.business<br>
            📱 WhatsApp: +49-XXX-XXXXXXX</p>

            <p style="color: #6b7280; margin-top: 30px;">Na bolingo,<br>Équipe ya GermanLink Business</p>
          </div>
        `,
        text: `Matondo pona commande na yo!\n\nNuméro ya commande: ${order.order_number}\nMbongo mobimba: ${order.total_amount.toFixed(2)}€\n\n💳 BA INFORMATIONS YA KOFUTA:\nFuta na LemFi:\nBénéficiaire: GermanLink Business GmbH\nIBAN: DE89 3704 0044 0532 0130 00\nRéférence: ${order.order_number}\nMbongo: ${order.total_amount.toFixed(2)}€\n\n⚠️ IMPORTANT: Tya numéro ${order.order_number} na référence!\n\nMituna: support@germanlink.business`
      }
    },
    payment_confirmed: {
      de: {
        subject: `Zahlung bestätigt - ${order.order_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">✅ Zahlung erfolgreich empfangen!</h2>
            <p>Hallo ${profile.name},</p>
            <p>Wir haben Ihre Zahlung für die Bestellung <strong>${order.order_number}</strong> erfolgreich erhalten.</p>

            <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <h3 style="margin-top: 0; color: #065f46;">💰 Zahlungsbestätigung</h3>
              <p><strong>Betrag:</strong> ${order.total_amount.toFixed(2)}€</p>
              <p><strong>Status:</strong> Bezahlt</p>
              <p><strong>Datum:</strong> ${new Date().toLocaleDateString('de-DE')}</p>
            </div>

            <p>Ihre Bestellung wird nun für den nächsten Container vorbereitet.</p>
            ${order.next_shipment_date ? `<p><strong>Voraussichtlicher Versand:</strong> ${new Date(order.next_shipment_date).toLocaleDateString('de-DE')}</p>` : ''}

            <p>Sie erhalten eine weitere E-Mail, sobald Ihre Bestellung versandt wurde.</p>

            <p style="margin-top: 30px;">Vielen Dank für Ihr Vertrauen!</p>
            <p style="color: #6b7280;">Ihr GermanLink Business Team</p>
          </div>
        `,
        text: `✅ Zahlung erfolgreich empfangen!\n\nBestellung: ${order.order_number}\nBetrag: ${order.total_amount.toFixed(2)}€\n\nIhre Bestellung wird nun für den Versand vorbereitet.\n\nVielen Dank!\nGermanLink Business`
      },
      fr: {
        subject: `Paiement confirmé - ${order.order_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">✅ Paiement reçu avec succès!</h2>
            <p>Bonjour ${profile.name},</p>
            <p>Nous avons bien reçu votre paiement pour la commande <strong>${order.order_number}</strong>.</p>

            <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <h3 style="margin-top: 0; color: #065f46;">💰 Confirmation de paiement</h3>
              <p><strong>Montant:</strong> ${order.total_amount.toFixed(2)}€</p>
              <p><strong>Statut:</strong> Payé</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>

            <p>Votre commande est maintenant préparée pour le prochain conteneur.</p>
            ${order.next_shipment_date ? `<p><strong>Expédition prévue:</strong> ${new Date(order.next_shipment_date).toLocaleDateString('fr-FR')}</p>` : ''}

            <p>Vous recevrez un autre email dès l'expédition de votre commande.</p>

            <p style="margin-top: 30px;">Merci pour votre confiance!</p>
            <p style="color: #6b7280;">L'équipe GermanLink Business</p>
          </div>
        `,
        text: `✅ Paiement reçu avec succès!\n\nCommande: ${order.order_number}\nMontant: ${order.total_amount.toFixed(2)}€\n\nVotre commande est préparée pour l'expédition.\n\nMerci!\nGermanLink Business`
      },
      ln: {
        subject: `Paiement esili - ${order.order_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">✅ Tozwi mbongo malamu!</h2>
            <p>Mbote ${profile.name},</p>
            <p>Tozwi mbongo na yo pona commande <strong>${order.order_number}</strong>.</p>

            <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <h3 style="margin-top: 0; color: #065f46;">💰 Confirmation ya paiement</h3>
              <p><strong>Mbongo:</strong> ${order.total_amount.toFixed(2)}€</p>
              <p><strong>Statut:</strong> Efutami</p>
              <p><strong>Mokolo:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>

            <p>Commande na yo ezali kobongisama mpo na container.</p>
            ${order.next_shipment_date ? `<p><strong>Expédition:</strong> ${new Date(order.next_shipment_date).toLocaleDateString('fr-FR')}</p>` : ''}

            <p>Okozwa email mosusu ntango commande na yo ekotindama.</p>

            <p style="margin-top: 30px;">Matondo pona kondima biso!</p>
            <p style="color: #6b7280;">Équipe ya GermanLink Business</p>
          </div>
        `,
        text: `✅ Tozwi mbongo malamu!\n\nCommande: ${order.order_number}\nMbongo: ${order.total_amount.toFixed(2)}€\n\nCommande na yo ezali kobongisama.\n\nMatondo!\nGermanLink Business`
      }
    },
    order_shipped: {
      de: {
        subject: `Bestellung versandt - ${order.order_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🚢 Ihre Bestellung ist unterwegs!</h2>
            <p>Hallo ${profile.name},</p>
            <p>Gute Nachrichten! Ihre Bestellung <strong>${order.order_number}</strong> wurde versandt.</p>

            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h3 style="margin-top: 0; color: #1e40af;">📦 Versandinformationen</h3>
              <p><strong>Bestellnummer:</strong> ${order.order_number}</p>
              <p><strong>Versanddatum:</strong> ${new Date().toLocaleDateString('de-DE')}</p>
              <p><strong>Voraussichtliche Ankunft:</strong> 4-8 Wochen</p>
            </div>

            <p>Sie können den Status Ihrer Bestellung in Ihrem Account verfolgen.</p>
            <p>Wir informieren Sie, sobald die Lieferung ankommt.</p>

            <p style="margin-top: 30px;">Bei Fragen stehen wir gerne zur Verfügung!</p>
            <p style="color: #6b7280;">Ihr GermanLink Business Team</p>
          </div>
        `,
        text: `🚢 Bestellung versandt!\n\nBestellnummer: ${order.order_number}\nVoraussichtliche Ankunft: 4-8 Wochen\n\nSie können den Status in Ihrem Account verfolgen.\n\nGermanLink Business`
      },
      fr: {
        subject: `Commande expédiée - ${order.order_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🚢 Votre commande est en route!</h2>
            <p>Bonjour ${profile.name},</p>
            <p>Bonne nouvelle! Votre commande <strong>${order.order_number}</strong> a été expédiée.</p>

            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h3 style="margin-top: 0; color: #1e40af;">📦 Informations d'expédition</h3>
              <p><strong>Numéro de commande:</strong> ${order.order_number}</p>
              <p><strong>Date d'expédition:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
              <p><strong>Arrivée estimée:</strong> 4-8 semaines</p>
            </div>

            <p>Vous pouvez suivre le statut de votre commande dans votre compte.</p>
            <p>Nous vous informerons dès l'arrivée de votre livraison.</p>

            <p style="margin-top: 30px;">Pour toute question, n'hésitez pas à nous contacter!</p>
            <p style="color: #6b7280;">L'équipe GermanLink Business</p>
          </div>
        `,
        text: `🚢 Commande expédiée!\n\nNuméro: ${order.order_number}\nArrivée estimée: 4-8 semaines\n\nSuivez le statut dans votre compte.\n\nGermanLink Business`
      },
      ln: {
        subject: `Commande etindami - ${order.order_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🚢 Commande na yo ezali na nzela!</h2>
            <p>Mbote ${profile.name},</p>
            <p>Sango malamu! Commande na yo <strong>${order.order_number}</strong> etindami.</p>

            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h3 style="margin-top: 0; color: #1e40af;">📦 Ba informations ya expédition</h3>
              <p><strong>Numéro ya commande:</strong> ${order.order_number}</p>
              <p><strong>Mokolo ya expédition:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
              <p><strong>Ekokoma:</strong> 4-8 ba semaines</p>
            </div>

            <p>Okoki kolanda statut ya commande na yo na compte na yo.</p>
            <p>Tokoyebisa yo ntango ekokoma.</p>

            <p style="margin-top: 30px;">Pona mituna, benga biso!</p>
            <p style="color: #6b7280;">Équipe ya GermanLink Business</p>
          </div>
        `,
        text: `🚢 Commande etindami!\n\nNuméro: ${order.order_number}\nEkokoma: 4-8 ba semaines\n\nLanda statut na compte na yo.\n\nGermanLink Business`
      }
    },
    order_delivered: {
      de: {
        subject: `Bestellung zugestellt - ${order.order_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">🎉 Ihre Bestellung wurde zugestellt!</h2>
            <p>Hallo ${profile.name},</p>
            <p>Ihre Bestellung <strong>${order.order_number}</strong> wurde erfolgreich zugestellt.</p>

            <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <h3 style="margin-top: 0; color: #065f46;">✅ Zustellung bestätigt</h3>
              <p><strong>Bestellnummer:</strong> ${order.order_number}</p>
              <p><strong>Zustelldatum:</strong> ${new Date().toLocaleDateString('de-DE')}</p>
            </div>

            <p>Wir hoffen, Sie sind mit Ihrer Bestellung zufrieden!</p>
            <p>Für Fragen oder Bewertungen kontaktieren Sie uns gerne.</p>

            <p style="margin-top: 30px;">Vielen Dank für Ihr Vertrauen!</p>
            <p style="color: #6b7280;">Ihr GermanLink Business Team</p>
          </div>
        `,
        text: `🎉 Bestellung zugestellt!\n\nBestellnummer: ${order.order_number}\n\nVielen Dank für Ihr Vertrauen!\nGermanLink Business`
      },
      fr: {
        subject: `Commande livrée - ${order.order_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">🎉 Votre commande a été livrée!</h2>
            <p>Bonjour ${profile.name},</p>
            <p>Votre commande <strong>${order.order_number}</strong> a été livrée avec succès.</p>

            <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <h3 style="margin-top: 0; color: #065f46;">✅ Livraison confirmée</h3>
              <p><strong>Numéro de commande:</strong> ${order.order_number}</p>
              <p><strong>Date de livraison:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>

            <p>Nous espérons que vous êtes satisfait de votre commande!</p>
            <p>Pour toute question ou avis, n'hésitez pas à nous contacter.</p>

            <p style="margin-top: 30px;">Merci pour votre confiance!</p>
            <p style="color: #6b7280;">L'équipe GermanLink Business</p>
          </div>
        `,
        text: `🎉 Commande livrée!\n\nNuméro: ${order.order_number}\n\nMerci pour votre confiance!\nGermanLink Business`
      },
      ln: {
        subject: `Commande ekomi - ${order.order_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">🎉 Commande na yo ekomi!</h2>
            <p>Mbote ${profile.name},</p>
            <p>Commande na yo <strong>${order.order_number}</strong> ekomi malamu.</p>

            <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <h3 style="margin-top: 0; color: #065f46;">✅ Livraison esili</h3>
              <p><strong>Numéro ya commande:</strong> ${order.order_number}</p>
              <p><strong>Mokolo ya livraison:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>

            <p>Tolingi oyoka esengo na commande na yo!</p>
            <p>Pona mituna to ba avis, benga biso.</p>

            <p style="margin-top: 30px;">Matondo pona kondima biso!</p>
            <p style="color: #6b7280;">Équipe ya GermanLink Business</p>
          </div>
        `,
        text: `🎉 Commande ekomi!\n\nNuméro: ${order.order_number}\n\nMatondo pona kondima biso!\nGermanLink Business`
      }
    },
    agent_dispatched: {}
  };

  // Handle agent_dispatched separately
  if (type === 'agent_dispatched') {
    return getAgentDispatchedTemplate(order, profile, language);
  }

  const template = templates[type as keyof typeof templates]?.[language];

  if (!template) {
    return templates.order_confirmation.de;
  }

  return template;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { orderId, type }: OrderEmailRequest = await req.json();

    if (!orderId || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError || !order) {
      console.error('Order fetch error:', orderError);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(order.user_id);

    if (authError || !authUser) {
      console.error('User fetch error:', authError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', order.user_id)
      .maybeSingle();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const userEmail = authUser.user.email;
    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: 'User email not found' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const profileWithEmail = { ...profile, email: userEmail };

    const emailTemplate = getEmailTemplate(type, order, profileWithEmail, 'de');

    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.log('RESEND_API_KEY not configured. Email functionality disabled.');

      await supabase
        .from('orders')
        .update({ email_sent: true })
        .eq('id', orderId);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email sending skipped (RESEND_API_KEY not configured)',
          orderId,
          type,
          recipient: userEmail
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'GermanLink Business <onboarding@resend.dev>',
        to: [userEmail],
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('Email send error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: errorData }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    await supabase
      .from('orders')
      .update({ email_sent: true })
      .eq('id', orderId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        orderId,
        type,
        recipient: userEmail
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
