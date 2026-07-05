// src/lib/email.ts
// ─────────────────────────────────────────────────────────────────────────────
// GLB Email Service via Resend
// Von: info@germanlinkbusiness.de
// ─────────────────────────────────────────────────────────────────────────────

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const FROM = 'GermanLink Business <info@germanlinkbusiness.de>';

// ── Basis-Funktion ────────────────────────────────────────────────────────────
const sendEmail = async (to: string, subject: string, html: string) => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) throw new Error(`Email failed: ${res.statusText}`);
  return res.json();
};

// ── 1. Neue Bestellung ────────────────────────────────────────────────────────
export const sendOrderConfirmation = async (params: {
  customerEmail: string;
  customerName: string;
  trackingNumber: string;
  products: { name: string; qty: number; price: number }[];
  total: number;
  city: string;
}) => {
  const productRows = params.products.map(p =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${p.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${p.qty}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${p.price.toFixed(2)} €</td>
    </tr>`
  ).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff">
      <!-- Header -->
      <div style="background:#0a1628;padding:24px;text-align:center">
        <div style="display:inline-flex;gap:4px;margin-bottom:8px">
          <div style="width:10px;height:30px;background:#000"></div>
          <div style="width:10px;height:30px;background:#DD0000"></div>
          <div style="width:10px;height:30px;background:#FFCE00"></div>
        </div>
        <h1 style="color:#F4B400;margin:0;font-size:20px">GermanLink Business</h1>
        <p style="color:#8fa3b8;margin:4px 0 0;font-size:12px">Deutsche Qualität für den Kongo</p>
      </div>

      <!-- Body -->
      <div style="padding:32px 24px">
        <h2 style="color:#0a1628;margin:0 0 8px">✅ Bestellung bestätigt!</h2>
        <p style="color:#555">Hallo <strong>${params.customerName}</strong>,<br>
        deine Bestellung wurde erfolgreich aufgenommen.</p>

        <!-- Tracking -->
        <div style="background:#f0f7ff;border-left:4px solid #0A5EB0;padding:16px;margin:20px 0;border-radius:4px">
          <p style="margin:0;font-size:13px;color:#555">Tracking-Nummer</p>
          <p style="margin:4px 0 0;font-size:22px;font-weight:bold;color:#0A5EB0">${params.trackingNumber}</p>
        </div>

        <!-- Produkte -->
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:8px;text-align:left;font-size:13px">Produkt</th>
              <th style="padding:8px;text-align:center;font-size:13px">Menge</th>
              <th style="padding:8px;text-align:right;font-size:13px">Preis</th>
            </tr>
          </thead>
          <tbody>${productRows}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:12px 8px;font-weight:bold;font-size:15px">Total</td>
              <td style="padding:12px 8px;font-weight:bold;font-size:15px;text-align:right;color:#009543">${params.total.toFixed(2)} €</td>
            </tr>
          </tfoot>
        </table>

        <p style="color:#555;font-size:14px">📦 Lieferung nach: <strong>${params.city}</strong><br>
        Lieferdauer: <strong>3–6 Wochen</strong></p>

        <p style="color:#555;font-size:14px">Fragen? Antworte auf diese E-Mail oder schreibe uns auf WhatsApp.</p>
      </div>

      <!-- Footer -->
      <div style="background:#f5f5f5;padding:16px 24px;text-align:center;border-top:1px solid #eee">
        <p style="margin:0;font-size:12px;color:#888">
          GermanLink Business · info@germanlinkbusiness.de<br>
          <a href="https://www.germanlinkbusiness.de" style="color:#0A5EB0">www.germanlinkbusiness.de</a>
        </p>
      </div>
    </div>
  `;

  // An Kunde
  await sendEmail(params.customerEmail, `✅ Bestellung bestätigt – ${params.trackingNumber}`, html);
  // Kopie an GLB
  await sendEmail('info@germanlinkbusiness.de', `📦 Neue Bestellung: ${params.trackingNumber} – ${params.customerName}`, html);
};

// ── 2. Kontaktformular ────────────────────────────────────────────────────────
export const sendContactForm = async (params: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#0a1628;padding:20px;text-align:center">
        <h2 style="color:#F4B400;margin:0">📩 Neue Nachricht – GLB</h2>
      </div>
      <div style="padding:24px;background:#fff">
        <table style="width:100%">
          <tr><td style="padding:8px;color:#888;width:120px">Name</td><td style="padding:8px;font-weight:bold">${params.name}</td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;color:#888">E-Mail</td><td style="padding:8px"><a href="mailto:${params.email}">${params.email}</a></td></tr>
          ${params.phone ? `<tr><td style="padding:8px;color:#888">Telefon</td><td style="padding:8px">${params.phone}</td></tr>` : ''}
          <tr style="background:#f9f9f9"><td style="padding:8px;color:#888;vertical-align:top">Nachricht</td><td style="padding:8px">${params.message.replace(/\n/g, '<br>')}</td></tr>
        </table>
      </div>
    </div>
  `;

  // An GLB
  await sendEmail('info@germanlinkbusiness.de', `📩 Kontaktanfrage von ${params.name}`, html);
  // Bestätigung an Absender
  await sendEmail(params.email, 'Wir haben deine Nachricht erhalten – GLB', `
    <div style="font-family:Arial,sans-serif;padding:24px;max-width:500px">
      <h2 style="color:#0a1628">Hallo ${params.name},</h2>
      <p>Vielen Dank für deine Nachricht! Wir melden uns innerhalb von 24 Stunden bei dir.</p>
      <p style="color:#888;font-size:13px">— Das GermanLink Business Team</p>
      <a href="https://www.germanlinkbusiness.de" style="color:#0A5EB0">www.germanlinkbusiness.de</a>
    </div>
  `);
};

// ── 3. Angebotsanfrage (Quote) ────────────────────────────────────────────────
export const sendQuoteRequest = async (params: {
  customerName: string;
  customerPhone: string;
  productName: string;
  priceProposal?: number;
  message?: string;
}) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#FF6F00;padding:20px;text-align:center">
        <h2 style="color:#fff;margin:0">💬 Neue Angebotsanfrage</h2>
      </div>
      <div style="padding:24px;background:#fff">
        <table style="width:100%">
          <tr><td style="padding:8px;color:#888;width:140px">Produkt</td><td style="padding:8px;font-weight:bold">${params.productName}</td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;color:#888">Kunde</td><td style="padding:8px">${params.customerName}</td></tr>
          <tr><td style="padding:8px;color:#888">Telefon</td><td style="padding:8px">${params.customerPhone}</td></tr>
          ${params.priceProposal ? `<tr style="background:#f9f9f9"><td style="padding:8px;color:#888">Preisvorschlag</td><td style="padding:8px;font-weight:bold">${params.priceProposal} €</td></tr>` : ''}
          ${params.message ? `<tr><td style="padding:8px;color:#888;vertical-align:top">Nachricht</td><td style="padding:8px">${params.message}</td></tr>` : ''}
        </table>
      </div>
    </div>
  `;

  await sendEmail('info@germanlinkbusiness.de', `💬 Angebotsanfrage: ${params.productName} – ${params.customerName}`, html);
};

