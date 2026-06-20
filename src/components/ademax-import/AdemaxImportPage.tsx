// ─── GermanLink Business – ADEMAX Import Page ────────────────────────────────
// src/components/ademax-import/AdemaxImportPage.tsx

import { useState } from "react";
import { useAdemaxImport } from "./useAdemaxImport";
import { AdemaxUrlInput } from "./AdemaxUrlInput";
import { supabase } from "../../lib/supabase";

interface Props {
  onBack: () => void;
  onSaved: () => void;
}

export function AdemaxImportPage({ onBack, onSaved }: Props) {
  const { state, importProduct, reset } = useAdemaxImport();
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  const p = state.product;

  async function handleSave() {
    if (!p) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("products").insert({
        name:           p.translations.de.title || p.translations.fr.title,
        name_de:        p.translations.de.title,
        name_fr:        p.translations.fr.title,
        name_ln:        p.translations.ln.title,
        description:    p.translations.de.description,
        description_fr: p.translations.fr.description,
        description_ln: p.translations.ln.description,
        category:       p.category,
        purchase_price: p.base_price,
        sale_price:     p.glb_price,
        image_url:      p.images[0] ?? null,
        images:         p.images.length > 0 ? p.images : null,
        source_type:    "vendor",
        stock_status:   "available",
        condition:      "new",
        location:       "Deutschland",
      });
      if (error) throw error;
      setSavedOk(true);
      setTimeout(onSaved, 1200);
    } catch (err: any) {
      alert("Fehler beim Speichern: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#1C1C1C]">ADEMAX Import</h1>
          <p className="text-sm text-gray-500">Produkt-Link von www.ademax.de einfügen</p>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-[#0A5EB0] text-white text-xs font-bold px-3 py-1.5 rounded-full">
          <span>ADEMAX</span>
          <span className="opacity-60">Partner</span>
        </div>
      </div>

      {/* ── URL Input ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 shadow-sm">
        <AdemaxUrlInput
          onSubmit={importProduct}
          loading={state.status === "fetching" || state.status === "translating"}
          onReset={reset}
          hasResult={state.status === "done"}
        />
      </div>

      {/* ── Progress ── */}
      {(state.status === "fetching" || state.status === "translating") && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {state.status === "fetching" ? "Produkt wird geladen…" : "Übersetzung (FR + LN)…"}
            </span>
            <span className="text-sm text-[#0A5EB0] font-bold">{state.progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-[#0A5EB0] h-2 rounded-full transition-all duration-500"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {state.status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-5">
          <p className="text-red-700 font-medium text-sm">{state.error}</p>
          <p className="text-red-500 text-xs mt-1">
            Bitte prüfe ob die URL von www.ademax.de stammt und das Produkt öffentlich zugänglich ist.
          </p>
        </div>
      )}

      {/* ── Vorschau ── */}
      {state.status === "done" && p && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Bild-Galerie */}
          {p.images.length > 0 && (
            <div className="flex gap-2 p-4 overflow-x-auto bg-gray-50 border-b">
              {p.images.map((img, i) => (
                <img key={i} src={img} alt={`Bild ${i + 1}`}
                  className={`h-24 w-24 object-cover rounded-lg flex-shrink-0 border-2 ${i === 0 ? "border-[#0A5EB0]" : "border-transparent"}`} />
              ))}
            </div>
          )}

          <div className="p-5 space-y-4">

            {/* Titel */}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Titel (DE)</p>
              <p className="font-bold text-[#1C1C1C] text-base">{p.translations.de.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Titre (FR)</p>
                <p className="text-sm text-gray-700">{p.translations.fr.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Titre (LN)</p>
                <p className="text-sm text-gray-700">{p.translations.ln.title}</p>
              </div>
            </div>

            {/* Beschreibung */}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Beschreibung (DE)</p>
              <p className="text-sm text-gray-600 line-clamp-3">{p.translations.de.description}</p>
            </div>

            {/* Preis */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
              <div>
                <p className="text-xs text-gray-400">ADEMAX-Preis</p>
                <p className="text-lg font-bold text-gray-700">{p.base_price.toFixed(2)} €</p>
              </div>
              <div className="text-gray-300">→</div>
              <div>
                <p className="text-xs text-gray-400">GLB-Preis (+20%)</p>
                <p className="text-xl font-bold text-[#00A86B]">{p.glb_price.toFixed(2)} €</p>
              </div>
              <div className="ml-auto">
                <span className="bg-[#0A5EB0] text-white text-xs font-bold px-2 py-1 rounded-full">
                  {p.category}
                </span>
              </div>
            </div>

            {/* Quelle — nutzt source_url aus dem state, nicht aus product */}
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
              <a href={p.source_url} target="_blank" rel="noopener noreferrer"
                className="underline hover:text-[#0A5EB0] truncate max-w-xs">
                {p.source_url}
              </a>
            </div>

            {/* Save Button */}
            {savedOk ? (
              <div className="w-full py-3 bg-[#00A86B] text-white rounded-xl font-bold text-center">
                ✅ Produkt gespeichert!
              </div>
            ) : (
              <button onClick={handleSave} disabled={saving}
                className="w-full py-3 bg-[#0A5EB0] hover:bg-[#094da0] text-white rounded-xl font-bold transition disabled:opacity-50">
                {saving ? "Wird gespeichert…" : "Produkt auf GLB veröffentlichen"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

