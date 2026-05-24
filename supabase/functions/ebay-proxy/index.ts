// ─── Supabase Edge Function: ebay-proxy ──────────────────────────────────────
// Speicherort: supabase/functions/ebay-proxy/index.ts
//
// Benötigte Secrets in Supabase Dashboard → Settings → Edge Functions → Secrets:
//   EBAY_CLIENT_ID     = dein Production App ID
//   EBAY_CLIENT_SECRET = dein Production Cert ID
//   ANTHROPIC_API_KEY  = dein Claude API Key (für Übersetzungen)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── eBay Access Token holen ──────────────────────────────────────────────────
async function getEbayToken(): Promise<string> {
  const clientId     = Deno.env.get("EBAY_CLIENT_ID")!;
  const clientSecret = Deno.env.get("EBAY_CLIENT_SECRET")!;
  const credentials  = btoa(`${clientId}:${clientSecret}`);

  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type":  "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`eBay Token Fehler: ${text}`);
  }

  const json = await res.json();
  return json.access_token;
}

// ─── eBay Produkt abrufen ─────────────────────────────────────────────────────
async function fetchEbayItem(itemId: string, token: string) {
  const res = await fetch(
    `https://api.ebay.com/buy/browse/v1/item/v1|${itemId}|0`,
    {
      headers: {
        "Authorization":            `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID":  "EBAY_DE",
        "X-EBAY-C-ENDUSERCTX":      "affiliateCampaignId=<ePNCampaignId>",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`eBay API Fehler ${res.status}: ${text}`);
  }

  return res.json();
}

// ─── Claude Übersetzung (FR + LN) ────────────────────────────────────────────
async function translateWithClaude(title: string, description: string) {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return null; // Übersetzung optional

  const prompt = `Du bist ein professioneller Übersetzer für einen afrikanischen Marketplace.

Übersetze diesen deutschen Produkttitel und diese Beschreibung ins Französische und ins Lingala.
Antworte NUR mit validem JSON, kein anderer Text.

Titel (DE): ${title}
Beschreibung (DE): ${description}

Antworte in diesem Format:
{
  "title_fr": "...",
  "description_fr": "...",
  "title_ln": "...",
  "description_ln": "..."
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key":         apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type":      "application/json",
    },
    body: JSON.stringify({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages:   [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const text = data.content?.[0]?.text ?? "";

  try {
    return JSON.parse(text);
  } catch {
    // JSON parsen fehlgeschlagen
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return null;
  }
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { itemId, sourceUrl } = await req.json();

    if (!itemId) {
      return new Response(
        JSON.stringify({ error: "itemId fehlt" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // 1. eBay Token holen
    const token = await getEbayToken();

    // 2. Produkt abrufen
    const item = await fetchEbayItem(itemId, token);

    // 3. Bilder sammeln
    const images: string[] = [];
    if (item.image?.imageUrl) images.push(item.image.imageUrl);
    if (item.additionalImages) {
      item.additionalImages.forEach((img: any) => {
        if (img.imageUrl) images.push(img.imageUrl);
      });
    }

    // 4. Preis
    const price    = item.price?.value ?? "0";
    const currency = item.price?.currency ?? "EUR";

    // 5. Kategorie
    const category = item.categories?.[0]?.categoryName ?? "Sonstiges";

    // 6. Titel & Beschreibung (DE)
    const title       = item.title ?? "";
    const description = item.shortDescription ?? item.description ?? "";

    // 7. Übersetzungen via Claude
    const translations = await translateWithClaude(title, description);

    // 8. Antwort zusammenstellen
    const response = {
      itemId,
      sourceUrl,
      title,
      description,
      price,
      currency,
      category,
      condition:   item.condition ?? "",
      itemUrl:     item.itemWebUrl ?? sourceUrl,
      images:      images.slice(0, 8),
      // Claude Übersetzungen (null wenn kein API Key)
      title_fr:       translations?.title_fr       ?? title,
      description_fr: translations?.description_fr ?? description,
      title_ln:       translations?.title_ln       ?? title,
      description_ln: translations?.description_ln ?? description,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[ebay-proxy] Fehler:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});

