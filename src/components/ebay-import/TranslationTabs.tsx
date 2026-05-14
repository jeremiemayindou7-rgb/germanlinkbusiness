// ─── GermanLink Business – Translation Tabs Component ────────────────────────

import { useState } from "react";
import { ImportedProduct, SupportedLang } from "./types";

interface TranslationTabsProps {
  product: ImportedProduct;
}

const LANGUAGES: { code: SupportedLang; label: string; flag: string }[] = [
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ln", label: "Lingala", flag: "🇨🇩" },
];

export function TranslationTabs({ product }: TranslationTabsProps) {
  const [active, setActive] = useState<SupportedLang>("de");
  const [copied, setCopied] = useState<string | null>(null);

  const entry = product.translations[active];

  async function copyToClipboard(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  }

  return (
    <div className="glb-translations">
      <div className="glb-translations__header">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
        </svg>
        <span>Übersetzungen</span>
      </div>

      {/* Tabs */}
      <div className="glb-translations__tabs" role="tablist">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            role="tab"
            aria-selected={active === lang.code}
            onClick={() => setActive(lang.code)}
            className={`glb-translations__tab ${active === lang.code ? "glb-translations__tab--active" : ""}`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="glb-translations__content" role="tabpanel">
        {/* Titel */}
        <div className="glb-translations__field">
          <div className="glb-translations__field-header">
            <label className="glb-translations__label">Titel</label>
            <button
              onClick={() => copyToClipboard(entry.title, `${active}-title`)}
              className="glb-translations__copy-btn"
              title="Kopieren"
            >
              {copied === `${active}-title` ? (
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : (
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                </svg>
              )}
            </button>
          </div>
          <p className="glb-translations__value">{entry.title}</p>
        </div>

        {/* Beschreibung */}
        <div className="glb-translations__field">
          <div className="glb-translations__field-header">
            <label className="glb-translations__label">Beschreibung</label>
            <button
              onClick={() => copyToClipboard(entry.description, `${active}-desc`)}
              className="glb-translations__copy-btn"
              title="Kopieren"
            >
              {copied === `${active}-desc` ? (
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : (
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                </svg>
              )}
            </button>
          </div>
          <p className="glb-translations__value glb-translations__value--desc">
            {entry.description}
          </p>
        </div>
      </div>
    </div>
  );
}
