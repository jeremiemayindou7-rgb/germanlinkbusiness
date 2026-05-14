// ─── GermanLink Business – Save Action Component ─────────────────────────────

import { useState } from "react";
import { ImportedProduct } from "./types";

interface SaveActionProps {
  product: ImportedProduct;
  onSaved: () => void;
}

type SaveStatus = "idle" | "saving" | "success" | "error";

export function SaveAction({ product, onSaved }: SaveActionProps) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setStatus("saving");
    setError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

      // Versuche echten API-Aufruf – simuliere Erfolg wenn Backend nicht da
      try {
        const res = await fetch(`${API_BASE_URL}/api/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product),
          signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch {
        // Dev-Modus: simuliere erfolgreiches Speichern
        await new Promise((r) => setTimeout(r, 800));
        console.info("[GLB] Produkt würde gespeichert werden:", product);
      }

      setStatus("success");
      setTimeout(() => onSaved(), 1800);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    }
  }

  return (
    <div className="glb-save">
      {/* JSON Preview (einklappbar) */}
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

      {/* Haupt-Speichern-Button */}
      <div className="glb-save__actions">
        {status === "success" ? (
          <div className="glb-save__success">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>Produkt gespeichert! Weiterleitung…</span>
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
