import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  orderId: string;
  // 'base64' gibt das PDF direkt im JSON zurück (für send-order-email),
  // 'pdf' liefert die Rohdaten mit passendem Content-Type (z.B. für Download-Link)
  responseFormat?: "base64" | "pdf";
}

const PAGE_WIDTH = 595.28; // A4 in pt
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;

const COMPANY = {
  name: "GermanLink Business",
  addressLine1: "Musterstraße 1",   // TODO: echte Adresse eintragen
  addressLine2: "30823 Garbsen",     // TODO: echte Adresse eintragen
  taxId: "TODO: Steuernummer eintragen",
  email: "info@germanlinkbusiness.de",
  web: "www.germanlinkbusiness.de",
};

// Muss synchron zu UBA_ACCOUNT in src/components/CheckoutModal.tsx und
// send-order-email/index.ts gehalten werden.
// TODO: codeGuichet / numeroCompte / ribKey aus dem echten RIB ergänzen.
const UBA_ACCOUNT = {
  bankName: "UBA Congo (United Bank for Africa)",
  accountHolder: "BAHOUMINA MANOU Roberta Belvine",
  holderNote: "Übergangskonto der Mitinhaberin, bis GLB-Geschäftskonto eröffnet ist",
  codeBanque: "BJIQ4KB0RA", // TODO: exakten Code Banque aus RIB übernehmen, falls abweichend
  codeGuichet: "", // TODO: aus RIB ergänzen
  numeroCompte: "", // TODO: aus RIB ergänzen
  ribKey: "", // TODO: RIB-Schlüssel ergänzen
  swift: "UNAFCGCG",
};

function formatEUR(n: number) {
  return `${n.toFixed(2)} €`;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("de-DE", { year: "numeric", month: "2-digit", day: "2-digit" });
}

async function buildInvoicePdf(order: any, customerEmail: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const dark = rgb(0.04, 0.09, 0.16);   // #0a1628
  const gray = rgb(0.4, 0.4, 0.4);
  const green = rgb(0, 0.58, 0.26);     // #009543
  const lightGray = rgb(0.95, 0.95, 0.95);
  const red = rgb(0.78, 0.14, 0.12);

  let y = PAGE_HEIGHT - MARGIN;

  // ── Header ──────────────────────────────────────────────
  page.drawText(COMPANY.name, { x: MARGIN, y, size: 18, font: fontBold, color: dark });
  page.drawText("RECHNUNG", { x: PAGE_WIDTH - MARGIN - 110, y, size: 18, font: fontBold, color: dark });
  y -= 18;
  page.drawText(`${COMPANY.addressLine1}, ${COMPANY.addressLine2}`, { x: MARGIN, y, size: 9, font: fontRegular, color: gray });
  y -= 12;
  page.drawText(`${COMPANY.email} · ${COMPANY.web}`, { x: MARGIN, y, size: 9, font: fontRegular, color: gray });
  y -= 12;
  page.drawText(`Steuernummer: ${COMPANY.taxId}`, { x: MARGIN, y, size: 9, font: fontRegular, color: gray });

  y -= 30;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: lightGray });
  y -= 25;

  // ── Rechnungs-Metadaten ─────────────────────────────────
  const meta: [string, string][] = [
    ["Rechnungsnummer", order.order_number],
    ["Rechnungsdatum", formatDate(new Date(order.created_at ?? Date.now()))],
    ["Kunde", customerEmail],
    ["Zahlungsziel", "7 Tage nach Erhalt"],
  ];
  for (const [label, value] of meta) {
    page.drawText(`${label}:`, { x: MARGIN, y, size: 10, font: fontBold, color: dark });
    page.drawText(value, { x: MARGIN + 140, y, size: 10, font: fontRegular, color: dark });
    y -= 16;
  }

  y -= 15;

  // ── Positionstabelle ────────────────────────────────────
  const colProduct = MARGIN;
  const colQty = PAGE_WIDTH - MARGIN - 180;
  const colPrice = PAGE_WIDTH - MARGIN - 90;

  page.drawRectangle({ x: MARGIN, y: y - 4, width: PAGE_WIDTH - 2 * MARGIN, height: 20, color: lightGray });
  page.drawText("Produkt", { x: colProduct + 5, y, size: 10, font: fontBold, color: dark });
  page.drawText("Menge", { x: colQty, y, size: 10, font: fontBold, color: dark });
  page.drawText("Preis", { x: colPrice, y, size: 10, font: fontBold, color: dark });
  y -= 24;

  const items: any[] = order.items ?? [];
  for (const item of items) {
    if (y < 120) break; // einfache Absicherung gegen Überlauf bei sehr vielen Positionen
    const name = String(item.product_name ?? "").slice(0, 55);
    page.drawText(name, { x: colProduct + 5, y, size: 10, font: fontRegular, color: dark });
    page.drawText(String(item.quantity ?? 1), { x: colQty, y, size: 10, font: fontRegular, color: dark });
    page.drawText(formatEUR(Number(item.price ?? 0)), { x: colPrice, y, size: 10, font: fontRegular, color: dark });
    y -= 18;
    page.drawLine({ start: { x: MARGIN, y: y + 6 }, end: { x: PAGE_WIDTH - MARGIN, y: y + 6 }, thickness: 0.5, color: lightGray });
  }

  y -= 10;

  // ── Summen ──────────────────────────────────────────────
  const drawSumLine = (label: string, value: string, bold = false, color = dark) => {
    page.drawText(label, { x: colQty, y, size: 10, font: bold ? fontBold : fontRegular, color });
    page.drawText(value, { x: colPrice, y, size: 10, font: bold ? fontBold : fontRegular, color });
    y -= 16;
  };

  drawSumLine("Zwischensumme", formatEUR(Number(order.subtotal ?? 0)));
  const shippingLabel = order.shipping_estimated ? "Versand (Schätzwert)" : "Versand";
  drawSumLine(shippingLabel, formatEUR(Number(order.shipping_cost ?? 0)));
  y -= 4;
  page.drawLine({ start: { x: colQty, y: y + 10 }, end: { x: PAGE_WIDTH - MARGIN, y: y + 10 }, thickness: 1, color: dark });
  drawSumLine("Gesamtbetrag", formatEUR(Number(order.total_amount ?? 0)), true, green);

  y -= 20;

  // ── Zahlungsinformationen ───────────────────────────────
  // Zeilen je Zahlungsmethode vorbereiten, damit die Box-Höhe dynamisch zur
  // tatsächlichen Zeilenzahl passt (UBA braucht mehr Platz als LemFi/CinetPay).
  let paymentLines: { text: string; bold?: boolean; color?: ReturnType<typeof rgb> }[];

  if (order.payment_method === "cinetpay") {
    paymentLines = [
      { text: "Zahlung per Mobile Money / Karte über CinetPay (Link folgt separat)." },
      { text: `Referenz (Pflicht): ${order.order_number}`, bold: true, color: red },
    ];
  } else if (order.payment_method === "uba_brazzaville") {
    paymentLines = [
      { text: "Bitte überweisen Sie den Betrag selbstständig auf folgendes Konto:" },
      { text: `Bank: ${UBA_ACCOUNT.bankName}` },
      { text: `Kontoinhaberin: ${UBA_ACCOUNT.accountHolder}` },
      { text: `Code Banque: ${UBA_ACCOUNT.codeBanque || "(wird noch ergänzt)"}   Code Guichet: ${UBA_ACCOUNT.codeGuichet || "(wird noch ergänzt)"}` },
      { text: `N° de compte: ${UBA_ACCOUNT.numeroCompte || "(wird noch ergänzt)"}   Clé RIB: ${UBA_ACCOUNT.ribKey || "(wird noch ergänzt)"}` },
      { text: `SWIFT/BIC: ${UBA_ACCOUNT.swift}` },
      { text: `Verwendungszweck (Pflicht): ${order.order_number}`, bold: true, color: red },
      { text: `Hinweis: ${UBA_ACCOUNT.holderNote}.`, color: gray },
    ];
  } else {
    // Standardfall: lemfi
    paymentLines = [
      { text: "Bitte überweisen Sie den Betrag selbstständig auf folgendes Konto:" },
      { text: "Empfänger: GermanLink Business GmbH   ·   IBAN: DE89 3704 0044 0532 0130 00" },
      { text: `Verwendungszweck (Pflicht): ${order.order_number}`, bold: true, color: red },
    ];
  }

  const lineHeight = 15;
  const boxHeight = 15 + 18 + paymentLines.length * lineHeight + 8;

  page.drawRectangle({ x: MARGIN, y: y - boxHeight + 8, width: PAGE_WIDTH - 2 * MARGIN, height: boxHeight, color: lightGray });
  y -= 15;
  page.drawText("Zahlungsinformationen", { x: MARGIN + 10, y, size: 11, font: fontBold, color: dark });
  y -= 18;

  for (const line of paymentLines) {
    page.drawText(line.text, {
      x: MARGIN + 10,
      y,
      size: 10,
      font: line.bold ? fontBold : fontRegular,
      color: line.color ?? dark,
    });
    y -= lineHeight;
  }

  y -= 25;

  // ── Footer ──────────────────────────────────────────────
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 0.5, color: lightGray });
  y -= 20;
  page.drawText("Vielen Dank für Ihre Bestellung bei GermanLink Business.", {
    x: MARGIN, y, size: 9, font: fontRegular, color: gray,
  });
  y -= 14;
  page.drawText(`${COMPANY.email} · ${COMPANY.web}`, { x: MARGIN, y, size: 9, font: fontRegular, color: gray });

  return await pdfDoc.save();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: RequestBody = await req.json();

    if (!body.orderId) {
      return new Response(JSON.stringify({ error: "orderId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, user:user_id ( email )")
      .eq("id", body.orderId)
      .maybeSingle();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let customerEmail: string | null = order.user?.email ?? null;
    if (!customerEmail) {
      const { data: authUser } = await supabase.auth.admin.getUserById(order.user_id);
      customerEmail = authUser?.user?.email ?? "unbekannt";
    }

    const pdfBytes = await buildInvoicePdf(order, customerEmail ?? "unbekannt");

    const format = body.responseFormat ?? "base64";
    const filename = `Rechnung_${order.order_number}.pdf`;

    if (format === "pdf") {
      // Hinweis: Der explizite Cast hier ist rein für den lokalen TS-Typcheck
      // in VS Code nötig. VS Code nutzt teils strengere lib.dom.d.ts-Definitionen
      // (SharedArrayBuffer-Unterscheidung) als der Deno-Compiler, der die Funktion
      // tatsächlich ausführt. Zur Laufzeit ist pdfBytes ein normales Uint8Array
      // aus pdf-lib und funktioniert einwandfrei als Blob-/Response-Body.
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      return new Response(blob, {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${filename}"`,
        },
      });
    }

    // Base64 für die Weitergabe an send-order-email (Resend-Attachment)
    let binary = "";
    for (let i = 0; i < pdfBytes.length; i++) binary += String.fromCharCode(pdfBytes[i]);
    const base64 = btoa(binary);

    return new Response(
      JSON.stringify({ success: true, filename, contentBase64: base64 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-invoice-pdf error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

