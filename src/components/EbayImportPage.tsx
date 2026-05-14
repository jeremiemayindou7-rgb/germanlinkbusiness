// ─── GermanLink Business – eBay Import Page ──────────────────────────────────
// Pfad: src/components/EbayImportPage.tsx
//
// KEIN React Router – Navigation über Callback-Props,
// passend zu deinem activeView-State-System in App.tsx.
//
// Einbindung in App.tsx (renderMain):
//   if (activeView === 'ebay-import') {
//     return <EbayImportPage onBack={() => setActiveView('dashboard')} onSaved={() => setActiveView('dashboard')} />;
//   }

import { UrlInput } from "./ebay-import/UrlInput";
import { ImportProgress } from "./ebay-import/ImportProgress";
import { ImportPreviewCard } from "./ebay-import/ImportPreviewCard";
import { TranslationTabs } from "./ebay-import/TranslationTabs";
import { SaveAction } from "./ebay-import/SaveAction";
import { useEbayImport } from "./ebay-import/useEbayImport";
import "./ebay-import/EbayImportPage.css";

interface EbayImportPageProps {
  onBack: () => void;
  onSaved: () => void;
}

export function EbayImportPage({ onBack, onSaved }: EbayImportPageProps) {
  const { state, importProduct, reset } = useEbayImport();

  const isDone = state.status === "done" && state.product !== null;
  const isLoading = state.status === "fetching" || state.status === "translating";

  return (
    <div className="glb-page">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="glb-page__header">
        <button
          onClick={onBack}
          className="glb-page__back"
          aria-label="Zurück"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Zurück
        </button>

        <div className="glb-page__title-group">
          <div className="glb-page__logo">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
          <div>
            <h1 className="glb-page__title">eBay Import</h1>
            <p className="glb-page__subtitle">
              Produkt importieren → übersetzen → in GLB speichern
            </p>
          </div>
        </div>

        {/* Schritt-Anzeige */}
        <div className="glb-page__steps">
          {["URL", "Vorschau", "Speichern"].map((step, i) => {
            const stepDone =
              (i === 0 && (isDone || isLoading)) ||
              (i === 1 && isDone) ||
              false;
            const stepActive =
              (i === 0 && state.status === "idle") ||
              (i === 1 && isLoading) ||
              (i === 2 && isDone);
            return (
              <div
                key={step}
                className={`glb-page__step ${stepActive ? "glb-page__step--active" : ""} ${stepDone ? "glb-page__step--done" : ""}`}
              >
                <span className="glb-page__step-num">{i + 1}</span>
                <span>{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Hauptinhalt ────────────────────────────────────────────────── */}
      <div className="glb-page__body">
        {/* Linke Spalte: Eingabe + Fortschritt */}
        <div className="glb-page__col glb-page__col--left">
          <UrlInput
            onSubmit={importProduct}
            loading={isLoading}
            onReset={reset}
            hasResult={isDone}
          />

          {state.status !== "idle" && (
            <ImportProgress
              status={state.status}
              progress={state.progress}
            />
          )}

          {state.status === "error" && (
            <div className="glb-error">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <div>
                <strong>Import fehlgeschlagen</strong>
                <p>{state.error}</p>
              </div>
            </div>
          )}

          {/* Infokarte */}
          {state.status === "idle" && (
            <div className="glb-info-card">
              <h4 className="glb-info-card__title">So funktioniert es</h4>
              <ol className="glb-info-card__list">
                <li>eBay-Produkt-URL einfügen</li>
                <li>Automatische Datenextraktion</li>
                <li>GLB-Preis (+20%) wird berechnet</li>
                <li>Übersetzung in DE · FR · LN</li>
                <li>Direkt in die Datenbank speichern</li>
              </ol>
              <p className="glb-info-card__note">
                Bilder werden nur verlinkt, nicht heruntergeladen.
              </p>
            </div>
          )}
        </div>

        {/* Rechte Spalte: Ergebnis */}
        {isDone && state.product && (
          <div className="glb-page__col glb-page__col--right">
            <ImportPreviewCard product={state.product} />
            <TranslationTabs product={state.product} />
            <SaveAction
              product={state.product}
              onSaved={onSaved}
            />
          </div>
        )}

        {/* Skeleton während Laden */}
        {isLoading && (
          <div className="glb-page__col glb-page__col--right">
            <div className="glb-skeleton glb-skeleton--preview" />
            <div className="glb-skeleton glb-skeleton--tabs" />
            <div className="glb-skeleton glb-skeleton--save" />
          </div>
        )}
      </div>
    </div>
  );
}
