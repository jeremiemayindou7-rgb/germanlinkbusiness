import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from "npm:pdf-lib@1.17.1";

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
  name: "GLB GermanLink Business",
  addressLine1: "Burgwedlerstraße 156D",
  addressLine2: "30916 Isernhagen",
  phone: "+49 157 35169452",
  taxId: "DE332331877",
  email: "info@germanlinkbusiness.de",
  web: "www.germanlinkbusiness.de",
  geschaeftsfuehrer: "Jeremie Mayindou",
  sitz: "Isernhagen",
  amtsgericht: "Isernhagen",
};

// Muss synchron zu UBA_ACCOUNT in src/components/CheckoutModal.tsx und
// send-order-email/index.ts gehalten werden.
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

// Bankverbindung für Kunden aus Europa oder anderen Ländern (normale
// internationale Überweisung, kein Übergangskonto).
const EUROPE_ACCOUNT = {
  bankName: "Sparkasse Hannover",
  accountHolder: "Jeremie Mayindou",
  iban: "DE75 2505 0180 1901 0481 10",
  bic: "SPKHDE2HXXX",
};

function formatEUR(n: number) {
  return `${n.toFixed(2)} €`;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

// ── Kleine Hilfsklasse, um Seitenumbrüche zu handhaben, da die Rechnung mehr
// Inhalt hat (Kunden-/Lieferdaten, zwei Zahlungsoptionen) und nicht garantiert
// auf eine A4-Seite passt. ──────────────────────────────────────────────────
class Layout {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  fontRegular: PDFFont;
  fontBold: PDFFont;

  constructor(doc: PDFDocument, page: PDFPage, fontRegular: PDFFont, fontBold: PDFFont) {
    this.doc = doc;
    this.page = page;
    this.y = PAGE_HEIGHT - MARGIN;
    this.fontRegular = fontRegular;
    this.fontBold = fontBold;
  }

  ensureSpace(height: number) {
    if (this.y - height < MARGIN) {
      this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      this.y = PAGE_HEIGHT - MARGIN;
    }
  }

  text(str: string, x: number, size: number, bold = false, color = rgb(0.04, 0.09, 0.16)) {
    this.page.drawText(str, { x, y: this.y, size, font: bold ? this.fontBold : this.fontRegular, color });
  }

  // Rechtsbündiger Text, z.B. für Zahlenspalten (Menge, Preis, Gesamt) —
  // rightX ist die rechte Kante, an der der Text enden soll.
  textRight(str: string, rightX: number, size: number, bold = false, color = rgb(0.04, 0.09, 0.16)) {
    const font = bold ? this.fontBold : this.fontRegular;
    const width = font.widthOfTextAtSize(str, size);
    this.page.drawText(str, { x: rightX - width, y: this.y, size, font, color });
  }

  // Zeilenumbruch nach tatsächlicher Textbreite (statt fixer Zeichenzahl),
  // damit lange Produktnamen nicht mitten im Wort abgeschnitten werden.
  wrapText(str: string, size: number, maxWidth: number, bold = false): string[] {
    const font = bold ? this.fontBold : this.fontRegular;
    const words = str.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const w of words) {
      const test = current ? `${current} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
        lines.push(current);
        current = w;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines.length > 0 ? lines : [""];
  }

  line(color = rgb(0.95, 0.95, 0.95), thickness = 1) {
    this.page.drawLine({ start: { x: MARGIN, y: this.y }, end: { x: PAGE_WIDTH - MARGIN, y: this.y }, thickness, color });
  }

  rect(height: number, color = rgb(0.95, 0.95, 0.95), yOffset = -4) {
    this.page.drawRectangle({ x: MARGIN, y: this.y + yOffset, width: PAGE_WIDTH - 2 * MARGIN, height, color });
  }
}

async function buildInvoicePdf(order: any, customerEmail: string, customerName: string | null): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const firstPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const dark = rgb(0.04, 0.09, 0.16);   // #0a1628
  const gray = rgb(0.4, 0.4, 0.4);
  const green = rgb(0, 0.58, 0.26);     // #009543
  const lightGray = rgb(0.95, 0.95, 0.95);
  const red = rgb(0.78, 0.14, 0.12);
  const blue = rgb(0.04, 0.37, 0.69);   // #0A5EB0-ish

  const L = new Layout(pdfDoc, firstPage, fontRegular, fontBold);

  // ── En-tête ─────────────────────────────────────────────
  L.text(COMPANY.name, MARGIN, 17, true);
  L.text("FACTURE", PAGE_WIDTH - MARGIN - 90, 18, true);
  L.y -= 18;
  L.text(`${COMPANY.addressLine1}, ${COMPANY.addressLine2}`, MARGIN, 9, false, gray);
  L.y -= 12;
  L.text(`${COMPANY.email} · Tél : ${COMPANY.phone}`, MARGIN, 9, false, gray);
  L.y -= 12;
  L.text(`${COMPANY.web}`, MARGIN, 9, false, gray);
  L.y -= 12;
  L.text(`Numéro fiscal : ${COMPANY.taxId}`, MARGIN, 9, false, gray);

  L.y -= 25;
  L.line(lightGray);
  L.y -= 25;

  // ── Données de facturation et du client ──────────────────
  const paymentOption = order.payment_option === "deposit" ? "deposit" : "full";
  const totalAmount = Number(order.total_amount ?? 0);
  const depositAmount = paymentOption === "deposit" ? totalAmount * 0.5 : totalAmount;
  const remainingAmount = paymentOption === "deposit" ? totalAmount * 0.5 : 0;
  const depositLabel = paymentOption === "deposit"
    ? `${formatEUR(depositAmount)} (50 %)`
    : `${formatEUR(depositAmount)} (100 % – paiement intégral)`;
  const remainingLabel = paymentOption === "deposit"
    ? `${formatEUR(remainingAmount)} (50 %, à la livraison)`
    : `${formatEUR(0)} (0 %)`;

  const meta: [string, string][] = [
    ["Numéro de facture", order.order_number],
    ["Date de facture", formatDate(new Date(order.created_at ?? Date.now()))],
    ["Client", customerName || customerEmail],
    ["Téléphone", order.customer_phone || "—"],
    ["Adresse de livraison", order.delivery_address || "—"],
    ["Email", customerEmail],
    ["Acompte", depositLabel],
    ["Solde restant", remainingLabel],
    ["Délai de paiement", "14 jours"],
  ];

  for (const [label, value] of meta) {
    L.ensureSpace(20);
    // L'adresse de livraison peut être longue — retour à la ligne simple si besoin.
    const maxCharsPerLine = 62;
    const words = String(value).split(" ");
    let lines: string[] = [];
    let current = "";
    for (const w of words) {
      if ((current + " " + w).trim().length > maxCharsPerLine) {
        lines.push(current.trim());
        current = w;
      } else {
        current = (current + " " + w).trim();
      }
    }
    if (current) lines.push(current);
    if (lines.length === 0) lines = [""];

    L.text(`${label} :`, MARGIN, 10, true);
    L.text(lines[0], MARGIN + 150, 10, false);
    L.y -= 16;
    for (let i = 1; i < lines.length; i++) {
      L.ensureSpace(16);
      L.text(lines[i], MARGIN + 150, 10, false);
      L.y -= 16;
    }
  }

  L.y -= 10;

  // ── Tableau des articles ──────────────────────────────────
  // 4 colonnes alignées à droite pour les valeurs numériques : Produit |
  // Quantité | Prix unitaire | Total (= Quantité × Prix unitaire). L'ancienne
  // version n'affichait pas de total par ligne et tronquait les noms de
  // produits longs au milieu d'un mot (ex. "...TOPCon PV M") — les deux
  // points corrigés ici.
  const colProduct = MARGIN;
  const GAP = 12;
  const totalColW = 65;
  const unitColW = 65;
  const qtyColW = 40;
  const colTotalRight = PAGE_WIDTH - MARGIN;
  const colUnitRight = colTotalRight - totalColW - GAP;
  const colQtyRight = colUnitRight - unitColW - GAP;
  const productRight = colQtyRight - qtyColW - GAP;
  const productLeft = colProduct + 5;
  const productMaxWidth = productRight - productLeft;
  const lineHeight = 13;

  L.ensureSpace(30);
  L.rect(20);
  L.text("Produit", productLeft, 10, true);
  L.textRight("Qté", colQtyRight, 10, true);
  L.textRight("Prix unitaire", colUnitRight, 10, true);
  L.textRight("Total", colTotalRight, 10, true);
  L.y -= 24;

  const items: any[] = order.items ?? [];
  const veryLightGray = rgb(0.975, 0.975, 0.975);
  items.forEach((item, index) => {
    const name = String(item.product_name ?? "");
    const qty = Number(item.quantity ?? 1);
    const unitPrice = Number(item.price ?? 0);
    const lineTotal = qty * unitPrice;

    const nameLines = L.wrapText(name, 10, productMaxWidth);
    const rowHeight = Math.max(lineHeight + 6, nameLines.length * lineHeight + 6);

    L.ensureSpace(rowHeight + 4);

    // Zebra-Streifen für bessere Lesbarkeit bei vielen Positionen. yOffset
    // richtet die Box am Zeilenanfang aus (statt am Standard-Offset für
    // einzeilige Boxen), damit sie bei mehrzeiligen Produktnamen nicht in
    // die Zeile darüber hineinragt.
    if (index % 2 === 1) {
      L.rect(rowHeight, veryLightGray, 8 - rowHeight);
    }

    L.text(nameLines[0], productLeft, 10, false);
    L.textRight(String(qty), colQtyRight, 10, false);
    L.textRight(formatEUR(unitPrice), colUnitRight, 10, false);
    L.textRight(formatEUR(lineTotal), colTotalRight, 10, true);
    L.y -= lineHeight;

    for (let i = 1; i < nameLines.length; i++) {
      L.ensureSpace(lineHeight);
      L.text(nameLines[i], productLeft, 10, false);
      L.y -= lineHeight;
    }

    L.y -= 5;
    L.page.drawLine({ start: { x: MARGIN, y: L.y + 6 }, end: { x: PAGE_WIDTH - MARGIN, y: L.y + 6 }, thickness: 0.5, color: lightGray });
  });

  L.y -= 10;

  // ── Totaux ────────────────────────────────────────────────
  // Alignés sur les mêmes colonnes que le tableau des articles ci-dessus
  // (libellé sous "Prix unitaire", montant sous "Total") pour un rendu net.
  L.ensureSpace(70);
  const drawSumLine = (label: string, value: string, bold = false, color = dark) => {
    L.textRight(label, colUnitRight, 10, bold, color);
    L.textRight(value, colTotalRight, 10, bold, color);
    L.y -= 16;
  };

  drawSumLine("Sous-total", formatEUR(Number(order.subtotal ?? 0)));
  const shippingLabel = order.shipping_estimated ? "Frais de port (estimation)" : "Frais de port";
  drawSumLine(shippingLabel, formatEUR(Number(order.shipping_cost ?? 0)));
  L.y -= 4;
  L.page.drawLine({ start: { x: colQtyRight - qtyColW, y: L.y + 10 }, end: { x: PAGE_WIDTH - MARGIN, y: L.y + 10 }, thickness: 1, color: dark });
  drawSumLine("Montant total", formatEUR(totalAmount), true, green);

  L.y -= 20;

  // ── Informations de paiement ──────────────────────────────
  // Cas particulier : anciennes commandes avec CinetPay (désactivé depuis).
  if (order.payment_method === "cinetpay") {
    const lines = [
      "Paiement par Mobile Money / carte via CinetPay (lien envoyé séparément).",
      `Référence (obligatoire) : ${order.order_number}`,
    ];
    L.ensureSpace(15 + 18 + lines.length * 15 + 8);
    L.rect(15 + 18 + lines.length * 15 + 8, lightGray, 8);
    L.y -= 15;
    L.text("Informations de paiement", MARGIN + 10, 11, true);
    L.y -= 18;
    for (const line of lines) {
      const isRef = line.startsWith("Référence");
      L.text(line, MARGIN + 10, 10, isRef, isRef ? red : dark);
      L.y -= 15;
    }
  } else {
    // Cas standard : les DEUX options de paiement sont affichées, pour que le
    // client choisisse celle qui correspond à sa situation — indépendamment
    // de la méthode techniquement enregistrée lors de la commande.
    const amountDue = depositAmount;

    L.ensureSpace(20);
    L.text("Informations de paiement", MARGIN, 12, true);
    L.y -= 20;

    // Bloc 1 : clients au Congo
    const congoLines: { text: string; bold?: boolean; color?: ReturnType<typeof rgb> }[] = [
      { text: "Veuillez virer le montant vous-même sur le compte suivant :" },
      { text: `Banque : ${UBA_ACCOUNT.bankName}` },
      { text: `Titulaire du compte : ${UBA_ACCOUNT.accountHolder}` },
      { text: `Code Banque : ${UBA_ACCOUNT.codeBanque || "(à compléter)"}   Code Guichet : ${UBA_ACCOUNT.codeGuichet || "(à compléter)"}` },
      { text: `N° de compte : ${UBA_ACCOUNT.numeroCompte || "(à compléter)"}   Clé RIB : ${UBA_ACCOUNT.ribKey || "(à compléter)"}` },
      { text: `SWIFT/BIC : ${UBA_ACCOUNT.swift}` },
      { text: `Montant : ${formatEUR(amountDue)}` },
      { text: `Référence (obligatoire) : ${order.order_number}`, bold: true, color: red },
      { text: `Remarque : ${UBA_ACCOUNT.holderNote}.`, color: gray },
    ];
    const congoBoxHeight = 20 + congoLines.length * 15 + 10;
    L.ensureSpace(congoBoxHeight);
    L.rect(congoBoxHeight, lightGray, 4);
    L.y -= 14;
    L.text("Pour les clients au Congo (RDC / Congo-Brazzaville) :", MARGIN + 10, 10.5, true, blue);
    L.y -= 18;
    for (const line of congoLines) {
      L.text(line.text, MARGIN + 10, 9.5, !!line.bold, line.color ?? dark);
      L.y -= 15;
    }

    L.y -= 12;

    // Bloc 2 : clients d'Europe ou d'autres pays
    const europeLines: { text: string; bold?: boolean; color?: ReturnType<typeof rgb> }[] = [
      { text: "Veuillez virer le montant par virement bancaire international :" },
      { text: `Banque : ${EUROPE_ACCOUNT.bankName}` },
      { text: `Titulaire du compte : ${EUROPE_ACCOUNT.accountHolder}` },
      { text: `IBAN : ${EUROPE_ACCOUNT.iban}` },
      { text: `BIC : ${EUROPE_ACCOUNT.bic}` },
      { text: `Montant : ${formatEUR(amountDue)}` },
      { text: `Référence (obligatoire) : ${order.order_number}`, bold: true, color: red },
    ];
    const europeBoxHeight = 20 + europeLines.length * 15 + 10;
    L.ensureSpace(europeBoxHeight);
    L.rect(europeBoxHeight, lightGray, 4);
    L.y -= 14;
    L.text("Pour les clients d'Europe ou d'autres pays :", MARGIN + 10, 10.5, true, blue);
    L.y -= 18;
    for (const line of europeLines) {
      L.text(line.text, MARGIN + 10, 9.5, !!line.bold, line.color ?? dark);
      L.y -= 15;
    }
  }

  L.y -= 20;

  // ── Pied de page ──────────────────────────────────────────
  L.ensureSpace(60);
  L.line(lightGray, 0.5);
  L.y -= 20;
  L.text("Merci pour votre commande chez GermanLink Business.", MARGIN, 9, false, gray);
  L.y -= 14;
  L.text(`${COMPANY.email} · ${COMPANY.web}`, MARGIN, 9, false, gray);
  L.y -= 14;
  L.text(
    `Gérant : ${COMPANY.geschaeftsfuehrer} · Siège social : ${COMPANY.sitz} · Tribunal d'immatriculation (Amtsgericht) : ${COMPANY.amtsgericht}`,
    MARGIN, 8, false, gray
  );

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

    // KEIN "user:user_id ( email )" Embed — orders.user_id hat keine über
    // PostgREST einbettbare Beziehung zu einer Tabelle mit 'email'.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", body.orderId)
      .maybeSingle();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // E-Mail-Adresse über die Auth-Admin-API auflösen.
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(order.user_id);
    if (authError) {
      console.error("Could not resolve customer email:", authError);
    }
    const customerEmail: string = authUser?.user?.email ?? "inconnu";

    // Namen des Kunden aus profiles laden (für "Client :"-Feld auf der Rechnung).
    let customerName: string | null = null;
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", order.user_id)
      .maybeSingle();
    if (profileError) {
      console.error("Could not resolve customer name:", profileError);
    }
    customerName = profile?.name ?? null;

    const pdfBytes = await buildInvoicePdf(order, customerEmail, customerName);

    const format = body.responseFormat ?? "base64";
    const filename = `Facture_${order.order_number}.pdf`;

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

