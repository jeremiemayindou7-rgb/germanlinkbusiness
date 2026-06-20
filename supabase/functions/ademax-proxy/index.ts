// ─── Supabase Edge Function: ademax-proxy ────────────────────────────────────
// Speicherort: supabase/functions/ademax-proxy/index.ts
//
// Benötigte Secrets in Supabase Dashboard → Settings → Edge Functions → Secrets:
//   ANTHROPIC_API_KEY  = dein Claude API Key (für Übersetzungen FR + LN)
//
// Deployment:
//   supabase functions deploy ademax-proxy

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── ADEMAX Produktseite scrapen ─────────────────────────────────────────────
async function scrapeAdemax(url: string) {
  const res = await fetch(url, {
    headers: {
      // Browser User-Agent damit die Seite normal antwortet
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "de-DE,de;q=0.9",
    },
  });

  if (!res.ok) {
    throw new Error(`ADEMAX Seite nicht erreichbar: HTTP ${res.status}`);
  }

  const html = await res.text();

  // ── Titel extrahieren ────────────────────────────────────────────────────
  let title = "";
  // Versuche verschiedene HTML-Muster
  const titlePatterns = [
    /<h1[^>]*class="[^"]*product[^"]*"[^>]*>([\s\S]*?)<\/h1>/i,
    /<h1[^>]*>([\s\S]*?)<\/h1>/i,
    /<title>([\s\S]*?)<\/title>/i,
  ];
  for (const pattern of titlePatterns) {
    const m = html.match(pattern);
    if (m) {
      title = m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      // Entferne Site-Namen aus <title>
      title = title.replace(/[\s\-|]+ADEMAX.*$/i, "").trim();
      if (title.length > 3) break;
    }
  }

  // ── Preis extrahieren ────────────────────────────────────────────────────
  let price = "0";
  const pricePatterns = [
    // JSON-LD Schema.org
    /"price"\s*:\s*"?([\d.,]+)"?/,
    // HTML Preis-Elemente
    /class="[^"]*price[^"]*"[^>]*>[\s\S]*?([\d]+[,.][\d]{2})\s*€/i,
    /([\d]+[,.][\d]{2})\s*€/,
    /€\s*([\d]+[,.][\d]{2})/,
  ];
  for (const pattern of pricePatterns) {
    const m = html.match(pattern);
    if (m) {
      price = m[1].replace(",", ".");
      if (parseFloat(price) > 0) break;
    }
  }

  // ── HTML Entities dekodieren ─────────────────────────────────────────────
  function decodeHtml(str: string): string {
    return str
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/&auml;/g, "ä")
      .replace(/&ouml;/g, "ö")
      .replace(/&uuml;/g, "ü")
      .replace(/&Auml;/g, "Ä")
      .replace(/&Ouml;/g, "Ö")
      .replace(/&Uuml;/g, "Ü")
      .replace(/&szlig;/g, "ß")
      .replace(/&#\d+;/g, "");
  }

  function cleanText(raw: string): string {
    return decodeHtml(raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  }

  // ── Beschreibung extrahieren — mehrere Strategien ────────────────────────
  let description = "";

  // Strategie 1: og:description (zuverlässig, kurz aber sauber)
  const ogDesc = html.match(/<meta[^>]*(?:property="og:description"|name="og:description")[^>]*content="([^"]+)"/i)
                ?? html.match(/content="([^"]+)"[^>]*property="og:description"/i);
  if (ogDesc?.[1] && ogDesc[1].length > 10) description = decodeHtml(ogDesc[1]);

  // Strategie 2: meta description
  if (!description) {
    const metaDesc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
    if (metaDesc?.[1] && metaDesc[1].length > 10) description = decodeHtml(metaDesc[1]);
  }

  // Strategie 3: JSON-LD description
  if (!description) {
    const jsonLdDesc = html.match(/"description"\s*:\s*"([^"]{20,})"/);
    if (jsonLdDesc?.[1]) description = decodeHtml(jsonLdDesc[1]);
  }

  // Strategie 4: JSON-LD vollständige Beschreibung (länger als meta)
  if (!description || description.length < 100) {
    // JSON-LD kann die vollständige Beschreibung enthalten
    const jsonLdBlocks2 = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) ?? [];
    for (const block of jsonLdBlocks2) {
      try {
        const json = JSON.parse(block.replace(/<\/?script[^>]*>/gi, "").trim());
        const objs = Array.isArray(json) ? json : [json];
        for (const obj of objs) {
          const d = obj.description ?? obj.longDescription ?? "";
          if (d.length > (description?.length ?? 0)) description = decodeHtml(d);
        }
      } catch { /* ignore */ }
    }
  }

  // Strategie 5: div mit description class/id (vollständiger Block)
  if (!description || description.length < 100) {
    const descPatterns = [
      // Shopware spezifisch
      /<div[^>]*class="[^"]*product--description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*product-description-short[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      // WooCommerce spezifisch
      /<div[^>]*class="[^"]*woocommerce-product-details__short-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*id="tab-description"[^>]*>([\s\S]*?)<\/div>/i,
      // Generisch
      /<div[^>]*(?:class|id)="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<section[^>]*(?:class|id)="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
      // Alle <p> Tags im main/article sammeln
      /<(?:main|article|section)[^>]*>([\s\S]{200,}?)<\/(?:main|article|section)>/i,
    ];
    for (const pattern of descPatterns) {
      const m = html.match(pattern);
      if (m) {
        const cleaned = cleanText(m[1]);
        if (cleaned.length > (description?.length ?? 0)) description = cleaned;
      }
    }
  }

  // Strategie 6: Alle <p> Texte in der Seite sammeln (letzter Fallback)
  if (!description || description.length < 50) {
    const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map(m => cleanText(m[1]))
      .filter(t => t.length > 30 && !t.match(/^(Cookie|Datenschutz|©|Impressum|AGB)/i));
    if (paragraphs.length > 0) {
      description = paragraphs.slice(0, 5).join(" ");
    }
  }

  // ── Kategorie extrahieren ────────────────────────────────────────────────
  let category = "Sonstiges";
  // Breadcrumb oder category meta
  const catPatterns = [
    /<nav[^>]*breadcrumb[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>[\s\S]*?<\/nav>/i,
    /<span[^>]*itemprop="name"[^>]*>([^<]+)<\/span>/gi,
    /"category"\s*:\s*"([^"]+)"/i,
  ];
  for (const pattern of catPatterns) {
    const m = html.match(pattern);
    if (m && m[1].length > 2) {
      category = m[1].trim();
      break;
    }
  }

  // ── Bilder extrahieren — 6 Fallback-Strategien ──────────────────────────────
  const images: string[] = [];
  const isLogo = (u: string) => /logo|icon|banner|sprite|favicon|arrow|button/i.test(u);

  // Strategie 1: JSON-LD Schema.org
  const jsonLdBlocks = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  for (const block of jsonLdBlocks) {
    try {
      const json = JSON.parse(block.replace(/<\/?script[^>]*>/gi, "").trim());
      const objs = Array.isArray(json) ? json : [json];
      for (const obj of objs) {
        const imgs = obj.image ?? obj.images ?? obj.thumbnail ?? [];
        for (const img of (Array.isArray(imgs) ? imgs : [imgs])) {
          const url = typeof img === "string" ? img : img?.url ?? img?.contentUrl ?? "";
          if (url.startsWith("http") && !isLogo(url)) images.push(url);
        }
      }
    } catch { /* ignore */ }
  }

  // Strategie 2: JSON Bild-Arrays (Shopware/WooCommerce Galerien) — IMMER ausführen
  {
    const jsonImgArrays = [...html.matchAll(/"(?:images?|gallery|photos?|media|thumbnails?)"\s*:\s*\[([^\]]{10,})\]/gi)];
    for (const m of jsonImgArrays) {
      const urls = [...m[1].matchAll(/"(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi)];
      for (const u of urls) {
        if (!isLogo(u[1]) && !images.includes(u[1])) images.push(u[1]);
      }
    }
  }

  // Strategie 3: og:image (alle sammeln, nicht nur erstes)
  {
    const ogImgs = [...html.matchAll(/<meta[^>]*property="og:image(?::[^"]*)?[^>]*content="([^"]+)"/gi)];
    for (const m of ogImgs) {
      if (m[1].startsWith("http") && !isLogo(m[1]) && !images.includes(m[1])) images.push(m[1]);
    }
  }

  // Strategie 4: data-* Bild-Attribute (lazy loading, zoom, gallery)
  {
    const dataImgs = [...html.matchAll(/data-(?:src|zoom-image|image|original|lazy|full|retina|thumbsrc|product-image)="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi)];
    for (const m of dataImgs) {
      if (!isLogo(m[1]) && !images.includes(m[1])) { images.push(m[1]); if (images.length >= 8) break; }
    }
  }

  // Strategie 5: <img src> absolute URLs (alle Produktbilder)
  {
    const imgTags = [...html.matchAll(/<img[^>]+src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi)];
    for (const m of imgTags) {
      if (!isLogo(m[1]) && !images.includes(m[1])) { images.push(m[1]); if (images.length >= 8) break; }
    }
  }

  // Strategie 6: relative Bild-URLs
  if (images.length < 3) {
    const baseUrl = new URL(sourceUrl).origin;
    const relImgs = [...html.matchAll(/(?:src|data-src)="(\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi)];
    for (const m of relImgs) {
      const url = baseUrl + m[1];
      if (!isLogo(url) && !images.includes(url)) { images.push(url); if (images.length >= 8) break; }
    }
  }

  // Strategie 7: twitter:image
  {
    const tw = html.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/i);
    if (tw?.[1] && !images.includes(tw[1])) images.push(tw[1]);
  }
  return { title: decodeHtml(title), price, description: decodeHtml(description), category, images: images.slice(0, 8) };
}

// ─── Claude Übersetzung (FR + LN) ────────────────────────────────────────────
async function translateWithClaude(title: string, description: string) {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return null;

  // Beschreibung kürzen um Token zu sparen (max 800 Zeichen)
  const shortDesc = description.slice(0, 800);

  const prompt = `You are a professional translator. Translate the following German product title and description into French and Lingala (a Bantu language spoken in DR Congo and Congo-Brazzaville).

IMPORTANT:
- title_fr must be in FRENCH (not German, not English)
- description_fr must be in FRENCH (not German, not English)  
- title_ln must be in LINGALA language
- description_ln must be in LINGALA language
- Reply ONLY with valid JSON, no other text, no markdown, no code blocks

German title: ${title}
German description: ${shortDesc}

Required JSON format:
{"title_fr":"[French translation of title]","description_fr":"[French translation of description]","title_ln":"[Lingala translation of title]","description_ln":"[Lingala translation of description]"}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key":         apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type":      "application/json",
    },
    body: JSON.stringify({
      model:      "claude-sonnet-4-6",
      max_tokens: 2000,
      messages:   [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    console.error("[ademax-proxy] Claude API error:", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  const text = (data.content?.[0]?.text ?? "").trim();

  console.log("[ademax-proxy] Claude response:", text.slice(0, 200));

  try {
    // Remove markdown code blocks if present
    const clean = text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    const parsed = JSON.parse(clean);

    // Validate that translations are actually different from input
    if (parsed.title_fr === title || parsed.title_fr === "") {
      console.warn("[ademax-proxy] Translation looks like original — retrying not implemented");
    }

    return parsed;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { return null; }
    }
    return null;
  }
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { sourceUrl } = await req.json();

    if (!sourceUrl || !sourceUrl.match(/ademax(-strom)?\.de/i)) {
      return new Response(
        JSON.stringify({ error: "Keine gültige ADEMAX URL" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // 1. ADEMAX Seite scrapen
    const scraped = await scrapeAdemax(sourceUrl);

    // 2. Übersetzungen via Claude
    const translations = await translateWithClaude(scraped.title, scraped.description);

    // 3. Antwort zusammenstellen
    const response = {
      sourceUrl,
      title:          scraped.title,
      description:    scraped.description,
      price:          scraped.price,
      currency:       "EUR",
      category:       scraped.category,
      images:         scraped.images,
      // Übersetzungen
      title_fr:       translations?.title_fr       ?? scraped.title,
      description_fr: translations?.description_fr ?? scraped.description,
      title_ln:       translations?.title_ln       ?? scraped.title,
      description_ln: translations?.description_ln ?? scraped.description,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[ademax-proxy] Fehler:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});

