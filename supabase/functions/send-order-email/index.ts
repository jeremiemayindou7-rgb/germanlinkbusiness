import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type EmailType = "order_confirmation" | "payment_confirmed" | "order_shipped" | "order_delivered";

interface RequestBody {
  orderId: string;
  type: EmailType;
}

const FROM = "GermanLink Business <info@germanlinkbusiness.de>";
const RESEND_API_URL = "https://api.resend.com/emails";

// Muss synchron zu UBA_ACCOUNT in src/components/CheckoutModal.tsx und
// generate-invoice-pdf/index.ts gehalten werden.
// TODO: codeGuichet / numeroCompte / ribKey aus dem echten RIB ergänzen.
const UBA_ACCOUNT = {
  bankName: "UBA Congo (United Bank for Africa)",
  accountHolder: "BAHOUMINA MANOU Roberta Belvine",
  holderNote: "Compte transitoire de la co-titulaire, en attendant l'ouverture du compte officiel de GLB",
  codeBanque: "BJIQ4KB0RA", // TODO: exakten Code Banque aus RIB übernehmen, falls abweichend
  codeGuichet: "", // TODO: aus RIB ergänzen
  numeroCompte: "", // TODO: aus RIB ergänzen
  ribKey: "", // TODO: RIB-Schlüssel ergänzen
  swift: "UNAFCGCG",
};

// Bankverbindung für Kunden aus Europa oder anderen Ländern.
const EUROPE_ACCOUNT = {
  bankName: "Sparkasse Hannover",
  accountHolder: "Jeremie Mayindou",
  iban: "DE75 2505 0180 1901 0481 10",
  bic: "SPKHDE2HXXX",
};

interface EmailAttachment {
  filename: string;
  content: string; // base64
}

async function sendEmail(
  resendApiKey: string,
  to: string,
  subject: string,
  html: string,
  attachments?: EmailAttachment[]
) {
  const payload: Record<string, unknown> = { from: FROM, to, subject, html };
  if (attachments && attachments.length > 0) {
    payload.attachments = attachments.map((a) => ({ filename: a.filename, content: a.content }));
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error (${res.status}): ${text}`);
  }
  return res.json();
}

async function fetchInvoicePdf(supabaseUrl: string, supabaseServiceKey: string, orderId: string): Promise<{ attachment: EmailAttachment | null; error: string | null }> {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/generate-invoice-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ orderId, responseFormat: "base64" }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("generate-invoice-pdf failed:", res.status, text);
      return { attachment: null, error: `generate-invoice-pdf returned ${res.status}: ${text}` };
    }
    const data = await res.json();
    return { attachment: { filename: data.filename, content: data.contentBase64 }, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Could not fetch invoice PDF:", e);
    return { attachment: null, error: message };
  }
}

function wrapLayout(title: string, bodyHtml: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff">
      <div style="background:#0a1628;padding:24px;text-align:center">
        <h1 style="color:#F4B400;margin:0;font-size:20px">GermanLink Business</h1>
        <p style="color:#8fa3b8;margin:4px 0 0;font-size:12px">Qualité allemande pour le Congo</p>
      </div>
      <div style="padding:32px 24px">
        <h2 style="color:#0a1628;margin:0 0 16px">${title}</h2>
        ${bodyHtml}
      </div>
      <div style="background:#f5f5f5;padding:16px 24px;text-align:center;border-top:1px solid #eee">
        <p style="margin:0;font-size:12px;color:#888">
          GermanLink Business · info@germanlinkbusiness.de<br>
          <a href="https://www.germanlinkbusiness.de" style="color:#0A5EB0">www.germanlinkbusiness.de</a>
        </p>
      </div>
    </div>
  `;
}

function orderItemsTable(items: any[]) {
  const rows = (items || []).map((it) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${it.product_name ?? ""}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${it.quantity ?? 1}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${Number(it.price ?? 0).toFixed(2)} €</td>
    </tr>
  `).join("");

  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <thead>
        <tr style="background:#f5f5f5">
          <th style="padding:8px;text-align:left;font-size:13px">Produit</th>
          <th style="padding:8px;text-align:center;font-size:13px">Quantité</th>
          <th style="padding:8px;text-align:right;font-size:13px">Prix</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// Baut den gemeinsamen Zahlungsinformations-Block (beide Bankverbindungen),
// der sowohl in der Bestellbestätigung als auch (kompakter) genutzt wird.
function paymentInfoBlock(order: any, amountDue: number) {
  if (order.payment_method === "cinetpay") {
    return `
      <div style="background:#f5f0ff;border-left:4px solid #7c3aed;padding:16px;margin:16px 0;border-radius:4px">
        <p style="margin:0 0 8px;font-weight:bold;color:#5b21b6">Paiement par Mobile Money / carte (CinetPay)</p>
        <p style="margin:0;font-size:14px">Montant : <strong>${amountDue.toFixed(2)} €</strong></p>
        <p style="margin:4px 0 0;font-size:14px">Référence : <strong>${order.order_number}</strong></p>
      </div>
    `;
  }

  return `
    <div style="background:#e3f2fd;border-left:4px solid #0A5EB0;padding:16px;margin:16px 0;border-radius:4px">
      <p style="margin:0 0 8px;font-weight:bold;color:#0A5EB0">Pour les clients au Congo (RDC / Congo-Brazzaville)</p>
      <p style="margin:0;font-size:14px">Montant : <strong>${amountDue.toFixed(2)} €</strong></p>
      <p style="margin:4px 0 0;font-size:14px">Banque : <strong>${UBA_ACCOUNT.bankName}</strong></p>
      <p style="margin:4px 0 0;font-size:14px">Titulaire du compte : <strong>${UBA_ACCOUNT.accountHolder}</strong></p>
      <p style="margin:4px 0 0;font-size:14px">Code Banque : <strong>${UBA_ACCOUNT.codeBanque || "(à compléter)"}</strong></p>
      <p style="margin:4px 0 0;font-size:14px">Code Guichet : <strong>${UBA_ACCOUNT.codeGuichet || "(à compléter)"}</strong></p>
      <p style="margin:4px 0 0;font-size:14px">N° de compte : <strong>${UBA_ACCOUNT.numeroCompte || "(à compléter)"}</strong></p>
      <p style="margin:4px 0 0;font-size:14px">Clé RIB : <strong>${UBA_ACCOUNT.ribKey || "(à compléter)"}</strong></p>
      <p style="margin:4px 0 0;font-size:14px">SWIFT/BIC : <strong>${UBA_ACCOUNT.swift}</strong></p>
      <p style="margin:4px 0 0;font-size:14px;color:#c62828">Référence (obligatoire) : <strong>${order.order_number}</strong></p>
      <p style="margin:12px 0 0;font-size:12px;color:#8a6d00;background:#fff8e1;padding:8px;border-radius:4px">
        <strong>Remarque :</strong> ${UBA_ACCOUNT.holderNote}.
      </p>
    </div>

    <div style="background:#fff8e1;border-left:4px solid #f4b400;padding:16px;margin:16px 0;border-radius:4px">
      <p style="margin:0 0 8px;font-weight:bold;color:#8a6d00">Pour les clients d'Europe ou d'autres pays</p>
      <p style="margin:0;font-size:14px">Montant : <strong>${amountDue.toFixed(2)} €</strong></p>
      <p style="margin:4px 0 0;font-size:14px">Banque : <strong>${EUROPE_ACCOUNT.bankName}</strong></p>
      <p style="margin:4px 0 0;font-size:14px">Titulaire du compte : <strong>${EUROPE_ACCOUNT.accountHolder}</strong></p>
      <p style="margin:4px 0 0;font-size:14px">IBAN : <strong>${EUROPE_ACCOUNT.iban}</strong></p>
      <p style="margin:4px 0 0;font-size:14px">BIC : <strong>${EUROPE_ACCOUNT.bic}</strong></p>
      <p style="margin:4px 0 0;font-size:14px;color:#c62828">Référence (obligatoire) : <strong>${order.order_number}</strong></p>
    </div>
  `;
}

function buildOrderConfirmationEmail(order: any) {
  const totalAmount = Number(order.total_amount ?? 0);
  const amountDue = order.payment_option === "deposit" ? totalAmount * 0.5 : totalAmount;
  const paymentBlock = paymentInfoBlock(order, amountDue);

  const body = `
    <p style="color:#555">Merci pour votre commande ! Voici votre confirmation.</p>
    <div style="background:#f0f7ff;border-left:4px solid #0A5EB0;padding:16px;margin:20px 0;border-radius:4px">
      <p style="margin:0;font-size:13px;color:#555">Référence de commande</p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#0A5EB0">${order.order_number}</p>
    </div>
    ${orderItemsTable(order.items)}
    ${paymentBlock}
    <p style="color:#555;font-size:14px">Prochain envoi : <strong>le 15 du mois</strong></p>
    <p style="color:#555;font-size:14px">Des questions ? Répondez simplement à cet email.</p>
  `;

  return {
    subject: `✅ Commande confirmée – ${order.order_number}`,
    html: wrapLayout("Commande confirmée !", body),
  };
}

function buildPaymentConfirmedEmail(order: any) {
  const methodLabel =
    order.payment_method === "cinetpay" ? "Mobile Money / carte (CinetPay)" :
    order.payment_method === "uba_brazzaville" ? "Virement bancaire (UBA Brazzaville)" :
    "Virement bancaire (LemFi)";

  const body = `
    <p style="color:#555">Nous avons bien reçu votre paiement pour la commande suivante :</p>
    <div style="background:#e8f5e9;border-left:4px solid #009543;padding:16px;margin:20px 0;border-radius:4px">
      <p style="margin:0;font-size:13px;color:#555">Référence de commande</p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#009543">${order.order_number}</p>
      <p style="margin:8px 0 0;font-size:14px">Montant : <strong>${Number(order.total_amount).toFixed(2)} €</strong></p>
      <p style="margin:4px 0 0;font-size:14px">Mode de paiement : <strong>${methodLabel}</strong></p>
    </div>
    <p style="color:#555;font-size:14px">Votre commande est maintenant préparée pour l'expédition.</p>
    <p style="color:#555;font-size:14px">Prochain envoi : <strong>le 15 du mois</strong></p>
  `;

  return {
    subject: `💰 Paiement confirmé – ${order.order_number}`,
    html: wrapLayout("Paiement reçu", body),
  };
}

function buildShippedEmail(order: any) {
  const body = `
    <p style="color:#555">Votre commande est en route !</p>
    <div style="background:#e3f2fd;border-left:4px solid #0A5EB0;padding:16px;margin:20px 0;border-radius:4px">
      <p style="margin:0;font-size:13px;color:#555">Référence de commande</p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#0A5EB0">${order.order_number}</p>
    </div>
    <p style="color:#555;font-size:14px">Arrivée estimée : <strong>4 à 8 semaines</strong></p>
  `;
  return {
    subject: `🚢 Commande expédiée – ${order.order_number}`,
    html: wrapLayout("Votre commande est en route", body),
  };
}

function buildDeliveredEmail(order: any) {
  const body = `
    <p style="color:#555">Votre commande a été marquée comme livrée. Nous espérons que vous êtes satisfait(e) !</p>
    <div style="background:#f0f7ff;border-left:4px solid #0A5EB0;padding:16px;margin:20px 0;border-radius:4px">
      <p style="margin:0;font-size:13px;color:#555">Référence de commande</p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#0A5EB0">${order.order_number}</p>
    </div>
    <p style="color:#555;font-size:14px">Merci pour votre confiance en GermanLink Business !</p>
  `;
  return {
    subject: `📦 Commande livrée – ${order.order_number}`,
    html: wrapLayout("Livraison terminée", body),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
    }
    if (!resendApiKey) {
      throw new Error("Missing RESEND_API_KEY secret");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: RequestBody = await req.json();
    if (!body.orderId || !body.type) {
      return new Response(
        JSON.stringify({ error: "orderId and type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // WICHTIG: KEIN "user:user_id ( email )" Embed hier — orders.user_id hat keine
    // über PostgREST einbettbare Fremdschlüssel-Beziehung zu einer Tabelle mit
    // 'email' (auth.users ist dafür nicht nutzbar). Bestellung daher ohne Join laden.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", body.orderId)
      .maybeSingle();

    if (orderError || !order) {
      console.error("Order not found:", body.orderId, orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // E-Mail-Adresse des Kunden immer über die Auth-Admin-API auflösen.
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(order.user_id);
    if (authError) {
      console.error("Could not resolve customer email:", authError);
    }
    const customerEmail: string | null = authUser?.user?.email ?? null;

    if (!customerEmail) {
      return new Response(
        JSON.stringify({ error: "No email address found for this order's customer" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let built: { subject: string; html: string };
    switch (body.type) {
      case "order_confirmation":
        built = buildOrderConfirmationEmail(order);
        break;
      case "payment_confirmed":
        built = buildPaymentConfirmedEmail(order);
        break;
      case "order_shipped":
        built = buildShippedEmail(order);
        break;
      case "order_delivered":
        built = buildDeliveredEmail(order);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown email type: ${body.type}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Bei Bestellbestätigung und Zahlungsbestätigung die PDF-Rechnung anhängen
    let attachment: EmailAttachment | null = null;
    let invoiceError: string | null = null;
    if (body.type === "order_confirmation" || body.type === "payment_confirmed") {
      const result = await fetchInvoicePdf(supabaseUrl, supabaseServiceKey, order.id);
      attachment = result.attachment;
      invoiceError = result.error;
    }
    const attachments = attachment ? [attachment] : undefined;

    // An Kunde
    await sendEmail(resendApiKey, customerEmail, built.subject, built.html, attachments);
    // Interne Kopie ans Team
    await sendEmail(resendApiKey, "info@germanlinkbusiness.de", `[Copie] ${built.subject}`, built.html, attachments);

    // Falls die PDF-Rechnung nicht angehängt werden konnte, das intern sichtbar
    // machen (statt es nur in den Function-Logs verschwinden zu lassen).
    if (invoiceError) {
      await supabase.from("orders").update({
        invoice_pdf_attached: false,
        invoice_pdf_error: invoiceError,
      }).eq("id", order.id).then(({ error }) => {
        if (error) console.error("Could not record invoice_pdf_error (columns may not exist yet):", error);
      });
    }

    // email_sent-Flag setzen (Feld existiert laut Doku bereits in der orders-Tabelle)
    const { error: updateError } = await supabase
      .from("orders")
      .update({ email_sent: true })
      .eq("id", order.id);

    if (updateError) {
      console.error("Could not update email_sent flag:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        type: body.type,
        sentTo: customerEmail,
        invoicePdfAttached: !!attachment,
        invoicePdfError: invoiceError,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-order-email error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

