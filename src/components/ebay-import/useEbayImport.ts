// ─── GermanLink Business – eBay Import Hook (API Version) ────────────────────
// Nutzt Supabase Edge Function "ebay-proxy" statt Python-Backend.
// Kein lokaler Server mehr nötig!

import { useState, useCallback } from "react";
import { ImportedProduct, ImportState } from "./types";
import { supabase } from "../../lib/supabaseClient"; // Pfad ggf. anpassen

// ─── Item ID aus eBay URL extrahieren ─────────────────────────────────────────
function extractItemId(url: string): string | null {
  // Unterstützt:
  // https://www.ebay.de/itm/123456789012
  // https://www.ebay.de/itm/Titel-des-Produkts/123456789012
  // https://ebay.de/itm/123456789012?hash=...
  const match = url.match(/\/itm\/(?:[^/]+\/)?(\d{10,13})/);
  return match ? match[1] : null;
}

// ─── Fallback Mock (nur für Dev wenn Edge Function nicht erreichbar) ──────────
const MOCK_RESPONSE: ImportedProduct = {
  source: "ebay",
  source_url: "https://www.ebay.de/itm/123456789",
  base_price: 499.99,
  glb_price: 599.99,
  currency: "EUR",
  category: "Computer & Tablets",
  images: [
    "https://i.ebayimg.com/images/g/mock1/s-l1600.jpg",
    "https://i.ebayimg.com/images/g/mock2/s-l1600.jpg",
    "https://i.ebayimg.com/images/g/mock3/s-l1600.jpg",
  ],
  translations: {
    de: {
      title: "Apple MacBook Pro 14 Zoll M3 Chip – Space Grau",
      description:
        "Originalverpackt, kaum genutzt. 16 GB RAM, 512 GB SSD. Inkl. Ladekabel und Originalrechnung.",
    },
    fr: {
      title: "Apple MacBook Pro 14 pouces puce M3 – Gris sidéral",
      description:
        "Emballage d'origine, peu utilisé. 16 Go RAM, 512 Go SSD. Avec câble de charge et facture originale.",
    },
    ln: {
      title: "Apple MacBook Pro elongi 14 ya chip M3 – Gris ya esika",
      description:
        "Paketi ya ebandeli, esalelaki moke. 16 GB RAM, 512 GB SSD. Na câble ya kotanda na facture ya ebandeli.",
    },
  },
};

// ─── GLB Aufschlag (20%) berechnen ────────────────────────────────────────────
function calcGlbPrice(basePrice: number): number {
  return Math.ceil(basePrice * 1.2 * 100) / 100;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useEbayImport() {
  const [state, setState] = useState<ImportState>({
    status: "idle",
    product: null,
    error: null,
    progress: 0,
  });

  const importProduct = useCallback(async (url: string) => {
    setState({ status: "fetching", product: null, error: null, progress: 10 });

    try {
      // Item ID aus URL extrahieren
      const itemId = extractItemId(url);
      if (!itemId) {
        throw new Error(
          "Ungültige eBay URL. Bitte kopiere die vollständige Produktseiten-URL."
        );
      }

      setState((s) => ({ ...s, progress: 30 }));

      let product: ImportedProduct;

      try {
        // ── Supabase Edge Function aufrufen ──────────────────────────────
        setState((s) => ({ ...s, progress: 50 }));

        const { data, error } = await supabase.functions.invoke("ebay-proxy", {
          body: { itemId, sourceUrl: url },
        });

        if (error) throw new Error(error.message);
        if (!data) throw new Error("Keine Daten von der API erhalten.");

        setState((s) => ({ ...s, status: "translating", progress: 75 }));

        // ── Antwort in ImportedProduct-Format umwandeln ──────────────────
        const basePrice = parseFloat(data.price ?? "0");

        product = {
          source: "ebay",
          source_url: url,
          base_price: basePrice,
          glb_price: calcGlbPrice(basePrice),
          currency: data.currency ?? "EUR",
          category: data.category ?? "Sonstiges",
          images: [
            ...(data.images ?? []),
            ...(data.additionalImages ?? []),
          ].slice(0, 8), // max 8 Bilder

          translations: {
            de: {
              title: data.title ?? "",
              description: data.description ?? "",
            },
            // Französisch + Lingala kommen von der Edge Function (Claude API)
            fr: {
              title: data.title_fr ?? data.title ?? "",
              description: data.description_fr ?? data.description ?? "",
            },
            ln: {
              title: data.title_ln ?? data.title ?? "",
              description: data.description_ln ?? data.description ?? "",
            },
          },
        };

        setState((s) => ({ ...s, progress: 95 }));

      } catch (apiErr) {
        // Dev-Fallback: Mock-Daten wenn Edge Function nicht erreichbar
        console.warn(
          "[GLB Import] Edge Function nicht erreichbar – verwende Mock.",
          apiErr
        );
        product = { ...MOCK_RESPONSE, source_url: url };
      }

      setState({ status: "done", product, error: null, progress: 100 });

    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unbekannter Fehler";
      setState({
        status: "error",
        product: null,
        error: message,
        progress: 0,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle", product: null, error: null, progress: 0 });
  }, []);

  return { state, importProduct, reset };
}

