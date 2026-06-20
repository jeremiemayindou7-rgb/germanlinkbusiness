// ─── GermanLink Business – ADEMAX Import Hook ────────────────────────────────
// Nutzt Supabase Edge Function "ademax-proxy" — gleiche Architektur wie eBay.

import { useState, useCallback } from "react";
import { ImportedProduct, ImportState } from "./types";
import { supabase } from "../../lib/supabaseClient";

// ─── Prüfen ob URL von ADEMAX ist ────────────────────────────────────────────
// Unterstützt: ademax.de, ademax-strom.de, www.ademax.de, www.ademax-strom.de
export function isAdemaxUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?ademax(-strom)?\.de\//i.test(url.trim());
}

// ─── GLB Aufschlag (20%) berechnen ───────────────────────────────────────────
function calcGlbPrice(basePrice: number): number {
  return Math.ceil(basePrice * 1.2 * 100) / 100;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAdemaxImport() {
  const [state, setState] = useState<ImportState>({
    status: "idle",
    product: null,
    error: null,
    progress: 0,
  });

  const importProduct = useCallback(async (url: string) => {
    setState({ status: "fetching", product: null, error: null, progress: 10 });

    try {
      if (!isAdemaxUrl(url)) {
        throw new Error(
          "Ungültige ADEMAX URL. Bitte kopiere die vollständige URL von www.ademax.de oder www.ademax-strom.de"
        );
      }

      setState((s) => ({ ...s, progress: 30 }));

      // ── Supabase Edge Function aufrufen ──────────────────────────────────
      setState((s) => ({ ...s, progress: 50 }));

      const { data, error } = await supabase.functions.invoke("ademax-proxy", {
        body: { sourceUrl: url },
      });

      if (error) throw new Error(error.message);
      if (!data)  throw new Error("Keine Daten von der API erhalten.");

      setState((s) => ({ ...s, status: "translating", progress: 75 }));

      const basePrice = parseFloat(String(data.price ?? "0").replace(",", "."));

      const product: ImportedProduct = {
        source:     "ademax",
        source_url: url,
        base_price: basePrice,
        glb_price:  calcGlbPrice(basePrice),
        currency:   "EUR",
        category:   data.category ?? "Sonstiges",
        images:     (data.images ?? []).slice(0, 8),
        translations: {
          de: {
            title:       data.title       ?? "",
            description: data.description ?? "",
          },
          fr: {
            title:       data.title_fr       ?? data.title       ?? "",
            description: data.description_fr ?? data.description ?? "",
          },
          ln: {
            title:       data.title_ln       ?? data.title       ?? "",
            description: data.description_ln ?? data.description ?? "",
          },
        },
      };

      setState((s) => ({ ...s, progress: 95 }));
      setState({ status: "done", product, error: null, progress: 100 });

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler";
      setState({ status: "error", product: null, error: message, progress: 0 });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle", product: null, error: null, progress: 0 });
  }, []);

  return { state, importProduct, reset };
}

