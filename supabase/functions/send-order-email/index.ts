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

// Muss synchron zu UBA_ACCOUNT in src/components/CheckoutModal.tsx gehalten werden.
// TODO: codeGuichet / numeroCompte / ribKey aus dem echten RIB ergänzen.
const UBA_ACCOUNT = {
  bankName: "UBA Congo (United Bank for Africa)",
  accountHolder: "BAHOUMINA MANOU Roberta Belvine",
  holderRole: "Mitinhaberin GermanLink Business (Übergangskonto, bis Firmenkonto eröffnet ist)",
  codeBanque: "BJIQ4KB0RA", // TODO: exakten Code Banque aus RIB übernehmen, falls abweichend
  codeGuichet: "", // TODO: aus RIB ergänzen
  numeroCompte: "", // TODO: aus RIB ergänzen
  ribKey: "", // TODO: RIB-Schlüssel ergänzen
  swift: "UNAFCGCG",
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

async function fetchInvoicePdf(supabaseUrl: string, supabaseServiceKey: string, orderId: string): Promise<EmailAttachment | null> {
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
      console.error("generate-invoice-pdf failed:", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    return { filename: data.filename, content: data.contentBase64 };
  } catch (e) {
    console.error("Could not fetch invoice PDF:", e);
    return null;
  }
}

function wrapLayout(title: string, bodyHtml: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff">
      <div style="background:#0a1628;padding:24px;text-align:center">
        <h1 style="color:#F4B400;margin:0;font-size:20px">GermanLink Business</h1>
        <p style="color:#8fa3b8;margin:4px 0 0;font-size:12px">Deutsche Qualität für den Kongo</p>
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
          <th style="padding:8px;text-align:left;font-size:13px">Produkt</th>
          <th style="padding:8px;text-align:center;font-size:13px">Menge</th>
          <th style="padding:8px;text-align:right;font-size:13px">Preis</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function buildOrderConfirmationEmail(order: any) {
  let paymentBlock: string;

  if (order.payment_method === "cinetpay") {
    paymentBlock = `
      <div style="background:#f5f0ff;border-left:4px solid #7c3aed;padding:16px;margin:16px 0;border-radius:4px">
        <p style="margin:0 0 8px;font-weight:bold;color:#5b21b6">Zahlung per Mobile Money / Karte (CinetPay)</p>
        <p style="margin:0;font-size:14px">Betrag: <strong>${Number(order.total_amount).toFixed(2)} €</strong></p>
        <p style="margin:4px 0 0;font-size:14px">Referenz: <strong>${order.order_number}</strong></p>
      </div>
    `;
  } else if (order.payment_method === "uba_brazzaville") {
    paymentBlock = `
      <div style="background:#e3f2fd;border-left:4px solid #0A5EB0;padding:16px;margin:16px 0;border-radius:4px">
        <p style="margin:0 0 8px;font-weight:bold;color:#0A5EB0">Zahlung per Banküberweisung (UBA Brazzaville)</p>
        <p style="margin:0;font-size:14px">Betrag: <strong>${Number(order.total_amount).toFixed(2)} €</strong></p>
        <p style="margin:4px 0 0;font-size:14px">Bank: <strong>${UBA_ACCOUNT.bankName}</strong></p>
        <p style="margin:4px 0 0;font-size:14px">Kontoinhaberin: <strong>${UBA_ACCOUNT.accountHolder}</strong></p>
        <p style="margin:4px 0 0;font-size:14px">Code Banque: <strong>${UBA_ACCOUNT.codeBanque || "(wird noch ergänzt)"}</strong></p>
        <p style="margin:4px 0 0;font-size:14px">Code Guichet: <strong>${UBA_ACCOUNT.codeGuichet || "(wird noch ergänzt)"}</strong></p>
        <p style="margin:4px 0 0;font-size:14px">N° de compte: <strong>${UBA_ACCOUNT.numeroCompte || "(wird noch ergänzt)"}</strong></p>
        <p style="margin:4px 0 0;font-size:14px">Clé RIB: <strong>${UBA_ACCOUNT.ribKey || "(wird noch ergänzt)"}</strong></p>
        <p style="margin:4px 0 0;font-size:14px">SWIFT/BIC: <strong>${UBA_ACCOUNT.swift}</strong></p>
        <p style="margin:4px 0 0;font-size:14px;color:#c62828">Verwendungszweck (Pflicht): <strong>${order.order_number}</strong></p>
        <p style="margin:12px 0 0;font-size:12px;color:#8a6d00;background:#fff8e1;padding:8px;border-radius:4px">
          <strong>Hinweis:</strong> Dies ist ein Übergangskonto von ${UBA_ACCOUNT.holderRole}, bis GermanLink
          Business ein eigenes Geschäftskonto in Congo-Brazzaville eröffnet hat. Ihre Zahlung wird intern
          GermanLink Business zugeordnet.
        </p>
      </div>
    `;
  } else {
    // Standardfall: lemfi (Banküberweisung für Kunden in der DR Kongo)
    paymentBlock = `
      <div style="background:#fff8e1;border-left:4px solid #f4b400;padding:16px;margin:16px 0;border-radius:4px">
        <p style="margin:0 0 8px;font-weight:bold;color:#8a6d00">Zahlung per Banküberweisung (LemFi)</p>
        <p style="margin:0;font-size:14px">Betrag: <strong>${Number(order.total_amount).toFixed(2)} €</strong></p>
        <p style="margin:4px 0 0;font-size:14px">Empfänger: <strong>GermanLink Business GmbH</strong></p>
        <p style="margin:4px 0 0;font-size:14px">IBAN: <strong>DE89 3704 0044 0532 0130 00</strong></p>
        <p style="margin:4px 0 0;font-size:14px;color:#c62828">Verwendungszweck (Pflicht): <strong>${order.order_number}</strong></p>
      </div>
    `;
  }

  const body = `
    <p style="color:#555">Vielen Dank für deine Bestellung! Hier deine Bestätigung.</p>
    <div style="background:#f0f7ff;border-left:4px solid #0A5EB0;padding:16px;margin:20px 0;border-radius:4px">
      <p style="margin:0;font-size:13px;color:#555">Bestellreferenz</p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#0A5EB0">${order.order_number}</p>
    </div>
    ${orderItemsTable(order.items)}
    ${paymentBlock}
    <p style="color:#555;font-size:14px">Nächster Versandtermin: <strong>15. des Monats</strong></p>
    <p style="color:#555;font-size:14px">Fragen? Antworte einfach auf diese E-Mail.</p>
  `;

  return {
    subject: `✅ Bestellung bestätigt – ${order.order_number}`,
    html: wrapLayout("Bestellung bestätigt!", body),
  };
}

function buildPaymentConfirmedEmail(order: any) {
  const methodLabel =
    order.payment_method === "cinetpay" ? "Mobile Money / Karte (CinetPay)" :
    order.payment_method === "uba_brazzaville" ? "Banküberweisung (UBA Brazzaville)" :
    "Banküberweisung (LemFi)";

  const body = `
    <p style="color:#555">Wir haben deine Zahlung für die folgende Bestellung erhalten:</p>
    <div style="background:#e8f5e9;border-left:4px solid #009543;padding:16px;margin:20px 0;border-radius:4px">
      <p style="margin:0;font-size:13px;color:#555">Bestellreferenz</p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#009543">${order.order_number}</p>
      <p style="margin:8px 0 0;font-size:14px">Betrag: <strong>${Number(order.total_amount).toFixed(2)} €</strong></p>
      <p style="margin:4px 0 0;font-size:14px">Zahlungsart: <strong>${methodLabel}</strong></p>
    </div>
    <p style="color:#555;font-size:14px">Deine Bestellung wird nun für den Versand vorbereitet.</p>
    <p style="color:#555;font-size:14px">Nächster Versandtermin: <strong>15. des Monats</strong></p>
  `;

  return {
    subject: `💰 Zahlung bestätigt – ${order.order_number}`,
    html: wrapLayout("Zahlung erhalten", body),
  };
}

function buildShippedEmail(order: any) {
  const body = `
    <p style="color:#555">Deine Bestellung ist unterwegs!</p>
    <div style="background:#e3f2fd;border-left:4px solid #0A5EB0;padding:16px;margin:20px 0;border-radius:4px">
      <p style="margin:0;font-size:13px;color:#555">Bestellreferenz</p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#0A5EB0">${order.order_number}</p>
    </div>
    <p style="color:#555;font-size:14px">Voraussichtliche Ankunft: <strong>4–8 Wochen</strong></p>
  `;
  return {
    subject: `🚢 Bestellung versendet – ${order.order_number}`,
    html: wrapLayout("Deine Bestellung ist unterwegs", body),
  };
}

function buildDeliveredEmail(order: any) {
  const body = `
    <p style="color:#555">Deine Bestellung wurde als geliefert markiert. Wir hoffen, du bist zufrieden!</p>
    <div style="background:#f0f7ff;border-left:4px solid #0A5EB0;padding:16px;margin:20px 0;border-radius:4px">
      <p style="margin:0;font-size:13px;color:#555">Bestellreferenz</p>
      <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#0A5EB0">${order.order_number}</p>
    </div>
    <p style="color:#555;font-size:14px">Danke für dein Vertrauen in GermanLink Business!</p>
  `;
  return {
    subject: `📦 Bestellung geliefert – ${order.order_number}`,
    html: wrapLayout("Lieferung abgeschlossen", body),
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

    // Bestellung + Kunden-E-Mail laden (E-Mail liegt im auth.users-Eintrag)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, user:user_id ( email )")
      .eq("id", body.orderId)
      .maybeSingle();

    if (orderError || !order) {
      console.error("Order not found:", body.orderId, orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: falls kein Join möglich ist, Auth-User separat holen
    let customerEmail: string | null = order.user?.email ?? null;
    if (!customerEmail) {
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(order.user_id);
      if (authError) {
        console.error("Could not resolve customer email:", authError);
      } else {
        customerEmail = authUser?.user?.email ?? null;
      }
    }

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
    if (body.type === "order_confirmation" || body.type === "payment_confirmed") {
      attachment = await fetchInvoicePdf(supabaseUrl, supabaseServiceKey, order.id);
    }
    const attachments = attachment ? [attachment] : undefined;

    // An Kunde
    await sendEmail(resendApiKey, customerEmail, built.subject, built.html, attachments);
    // Interne Kopie ans Team
    await sendEmail(resendApiKey, "info@germanlinkbusiness.de", `[Kopie] ${built.subject}`, built.html, attachments);

    // email_sent-Flag setzen (Feld existiert laut Doku bereits in der orders-Tabelle)
    const { error: updateError } = await supabase
      .from("orders")
      .update({ email_sent: true })
      .eq("id", order.id);

    if (updateError) {
      console.error("Could not update email_sent flag:", updateError);
      // Kein harter Fehler: die Mail wurde ja verschickt, nur das Flag-Update scheiterte
    }

    return new Response(
      JSON.stringify({ success: true, orderId: order.id, type: body.type, sentTo: customerEmail }),
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

