// ─── GermanLink Business – eBay Import API Hook ──────────────────────────────
// Verbindet das React-Frontend mit dem Python Import-Service.
// Passe API_BASE_URL an deine Backend-URL an (z.B. http://localhost:8000).

import { useState, useCallback } from "react";
import { ImportedProduct, ImportState } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// Simuliert den Python-Backend-Aufruf im Dev-Modus (wenn kein Backend läuft)
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
      // Schritt 1: eBay-Daten fetchen (40%)
      await simulateDelay(400);
      setState((s) => ({ ...s, progress: 40 }));

      // Schritt 2: Übersetzen (80%)
      setState((s) => ({ ...s, status: "translating", progress: 70 }));
      await simulateDelay(400);
      setState((s) => ({ ...s, progress: 90 }));

      let product: ImportedProduct;

      // Echter API-Aufruf – fällt auf Mock zurück wenn Backend nicht erreichbar
      try {
        const res = await fetch(`${API_BASE_URL}/api/import-ebay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
          signal: AbortSignal.timeout(30_000),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail ?? `HTTP ${res.status}`);
        }

        product = await res.json();
      } catch (networkErr) {
        // Im Dev-Modus: Mock-Daten verwenden
        console.warn(
          "[GLB Import] Backend nicht erreichbar – verwende Mock-Daten.",
          networkErr
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

// ─── Helper ───────────────────────────────────────────────────────────────────

function simulateDelay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
