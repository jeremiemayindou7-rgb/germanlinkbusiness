// ─── GermanLink Business – Microsoft Clarity Integration ─────────────────────
// Lädt Microsoft Clarity NUR, wenn der Nutzer der Cookie-/Analytics-Nutzung
// zugestimmt hat (DSGVO-konform). Wird von CookieConsent.tsx aufgerufen.

declare global {
  interface Window {
    clarity?: (...args: any[]) => void;
  }
}

const CLARITY_PROJECT_ID: string = 'xoyio9qpg0'; // Ihre echte Clarity Project ID

let isLoaded = false;

/**
 * Lädt das Microsoft Clarity Skript dynamisch.
 * Aufrufen NACHDEM der Nutzer der Analyse-/Tracking-Nutzung zugestimmt hat.
 */
export function loadClarity(): void {
  if (isLoaded) return; // verhindert doppeltes Laden
  if (!CLARITY_PROJECT_ID || CLARITY_PROJECT_ID === 'HIER_IHRE_PROJECT_ID_EINTRAGEN') {
    console.warn('[Clarity] Keine Project ID gesetzt – Clarity wird nicht geladen.');
    return;
  }

  (function (c: any, l: Document, a: string, r: string, i: string) {
    c[a] =
      c[a] ||
      function (...args: any[]) {
        (c[a].q = c[a].q || []).push(args);
      };
    const t = l.createElement(r) as HTMLScriptElement;
    t.async = true;
    t.src = 'https://www.clarity.ms/tag/' + i;
    const y = l.getElementsByTagName(r)[0];
    y.parentNode?.insertBefore(t, y);
  })(window, document, 'clarity', 'script', CLARITY_PROJECT_ID);

  isLoaded = true;
  console.info('[Clarity] Tracking aktiviert.');
}

/**
 * Entfernt/deaktiviert Clarity-Cookies (z.B. wenn Nutzer Einwilligung widerruft).
 * Clarity selbst bietet keine "Unload"-Funktion – wir setzen daher clarity("stop")
 * falls verfügbar, und leeren die bekannten Cookies.
 */
export function revokeClarity(): void {
  if (window.clarity) {
    try {
      window.clarity('stop');
    } catch {
      // ignore
    }
  }
  ['_clck', '_clsk', 'CLID', 'ANONCHK', 'MR', 'MUID', 'SM'].forEach((name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
  isLoaded = false;
}

/**
 * Optional: Nutzer-Segment für Clarity setzen (z.B. "logged_in", "seller"),
 * OHNE personenbezogene Daten wie Namen/E-Mail zu übergeben (DSGVO!).
 */
export function setClarityTag(key: string, value: string): void {
  if (window.clarity) {
    window.clarity('set', key, value);
  }
}

/**
 * Optional: Custom Event an Clarity senden (z.B. "checkout_started").
 */
export function trackClarityEvent(eventName: string): void {
  if (window.clarity) {
    window.clarity('event', eventName);
  }
}