// ─── GermanLink Business – Save Action Component ─────────────────────────────
// Speichert das importierte eBay-Produkt direkt in Supabase

import { useState } from "react";
import { ImportedProduct } from "./types";
import { supabase } from "../../lib/supabase";

interface SaveActionProps {
  product: ImportedProduct;
  onSaved: () => void;
}

type SaveStatus = "idle" | "saving" | "success" | "error";

// ── Bild-URL durch Proxy leiten (CORS-Fix für eBay) ──────────────────────────
// Gespeicherte URLs müssen auch im Marketplace ladbar sein
function proxyImageUrl(url: string): string {
  if (!url) return url;
  if (!url.includes('ebayimg.com') && !url.includes('ebay.com')) return url;
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=800&q=85`;
}

// ── Kategorie-Mapping: eBay → GLB ─────────────────────────────────────────────
function mapCategory(ebayCategory: string): string {
  const cat = ebayCategory.toLowerCase();
  if (cat.includes("traktor") || cat.includes("tractor") ||
      cat.includes("auto") || cat.includes("motor") ||
      cat.includes("fahrzeug") || cat.includes("kfz") ||
      cat.includes("lkw") || cat.includes("pkw") ||
      cat.includes("landmaschine") || cat.includes("sonstiges")) {
    return "auto_motor";
  }
  if (cat.includes("elektronik") || cat.includes("computer") ||
      cat.includes("handy") || cat.includes("tablet") ||
      cat.includes("laptop") || cat.includes("phone") ||
      cat.includes("telefon") || cat.includes("electronic")) {
    return "electronics";
  }
  if (cat.includes("möbel") || cat.includes("furniture") ||
      cat.includes("sofa") || cat.includes("tisch") ||
      cat.includes("schrank") || cat.includes("stuhl")) {
    return "furniture";
  }
  if (cat.includes("kleidung") || cat.includes("mode") ||
      cat.includes("jacke") || cat.includes("schuhe") ||
      cat.includes("clothing")) {
    return "clothing";
  }
  if (cat.includes("haushalt") || cat.includes("küche") ||
      cat.includes("garten") || cat.includes("werkzeug") ||
      cat.includes("household")) {
    return "household";
  }
  return "other";
}

export function SaveAction({ product, onSaved }: SaveActionProps) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setStatus("saving");
    setError(null);

    try {
      const category = mapCategory(product.category);

      // ── Alle Bild-URLs durch Proxy leiten ────────────────────────────────
      const proxiedImages = product.images.map(proxyImageUrl);
      const mainImageUrl  = proxiedImages[0] ?? "";

      // ── Supabase-Payload ─────────────────────────────────────────────────
      const productData = {
        // Basis
        name:              product.translations.de.title,
        description:       product.translations.de.description,
        category,
        purchase_price:    product.base_price,
        sale_price:        product.glb_price,
        condition:         "good",
        image_url:         mainImageUrl,       // ← Proxy-URL
        images:            proxiedImages,      // ← Alle Proxy-URLs
        stock_status:      "available",
        stock_quantity:    1,

        // Übersetzungen
        name_de:           product.translations.de.title,
        name_fr:           product.translations.fr.title,
        name_ln:           product.translations.ln.title,
        description_de:    product.translations.de.description,
        description_fr:    product.translations.fr.description,
        description_ln:    product.translations.ln.description,
        category_de:       category,
        category_fr:       category,
        category_ln:       category,

        // eBay-Felder
        source_type:       "ebay",
        ebay_url:          product.source_url,
        location:          "Kinshasa / Brazzaville",
        is_seller_product: false,
      };

      console.log("[GLB Save] Speichere in Supabase:", productData);

      const { error: supabaseError } = await supabase
        .from("products")
        .insert(productData);

      if (supabaseError) throw new Error(supabaseError.message);

      console.log("[GLB Save] ✅ Erfolgreich gespeichert!");
      setStatus("success");
      setTimeout(() => onSaved(), 1800);

    } catch (err) {
      console.error("[GLB Save] ❌ Fehler:", err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    }
  }

  return (
    <div className="glb-save">
      {/* JSON Preview */}
      <details className="glb-save__json-preview">
        <summary className="glb-save__json-toggle">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
          </svg>
          JSON-Payload anzeigen
        </summary>
        <pre className="glb-save__json">
          {JSON.stringify(product, null, 2)}
        </pre>
      </details>

      {/* Button */}
      <div className="glb-save__actions">
        {status === "success" ? (
          <div className="glb-save__success">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>✅ Produkt gespeichert! Erscheint jetzt in der Produktliste.</span>
          </div>
        ) : (
          <button
            onClick={handleSave}
            disabled={status === "saving"}
            className="glb-btn glb-btn--save"
          >
            {status === "saving" ? (
              <>
                <span className="glb-btn__spinner" />
                Wird gespeichert…
              </>
            ) : (
              <>
                <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
                In Datenbank speichern
              </>
            )}
          </button>
        )}
      </div>

      {status === "error" && error && (
        <div className="glb-save__error">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}

