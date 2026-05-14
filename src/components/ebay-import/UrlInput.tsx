// ─── GermanLink Business – URL Input Component ───────────────────────────────

import { useState, useRef } from "react";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
  onReset: () => void;
  hasResult: boolean;
}

const EBAY_PATTERN =
  /^https?:\/\/(www\.)?ebay\.[a-z.]{2,6}\/itm\/\d+/i;

export function UrlInput({ onSubmit, loading, onReset, hasResult }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValid = EBAY_PATTERN.test(url.trim());
  const showError = touched && url.length > 0 && !isValid;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (isValid) onSubmit(url.trim());
  }

  function handleReset() {
    setUrl("");
    setTouched(false);
    onReset();
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <div className="glb-url-input">
      <div className="glb-url-input__header">
        <div className="glb-url-input__icon">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
          </svg>
        </div>
        <div>
          <h3 className="glb-url-input__title">eBay-Link einfügen</h3>
          <p className="glb-url-input__subtitle">
            Unterstützt: ebay.de · ebay.com · ebay.fr
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glb-url-input__form">
        <div className={`glb-url-input__field ${showError ? "glb-url-input__field--error" : ""} ${isValid && touched ? "glb-url-input__field--valid" : ""}`}>
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="https://www.ebay.de/itm/123456789"
            disabled={loading}
            className="glb-url-input__input"
            autoComplete="off"
            autoFocus
          />
          {isValid && (
            <span className="glb-url-input__check">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </span>
          )}
        </div>

        {showError && (
          <p className="glb-url-input__error">
            Bitte eine gültige eBay-Artikel-URL eingeben (z.B. https://www.ebay.de/itm/123456789)
          </p>
        )}

        <div className="glb-url-input__actions">
          {hasResult ? (
            <button
              type="button"
              onClick={handleReset}
              className="glb-btn glb-btn--ghost"
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Neuer Import
            </button>
          ) : (
            <button
              type="submit"
              disabled={!isValid || loading}
              className="glb-btn glb-btn--primary"
            >
              {loading ? (
                <>
                  <span className="glb-btn__spinner" />
                  Wird importiert…
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Produkt importieren
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
