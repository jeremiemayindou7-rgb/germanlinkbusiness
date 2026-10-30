import { useState, useCallback } from 'react';
import { ImportState, SunshareProduct } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Bereinigt eine URL von unsichtbaren Sonderzeichen.
 * Soft Hyphen (U+00AD / 0xAD) und andere unsichtbare Zeichen
 * werden beim Kopieren aus Browsern manchmal eingefügt.
 */
function sanitizeUrl(url: string): string {
  return url
    .replace(/­/g, '')   // Soft Hyphen entfernen
    .replace(/​/g, '')   // Zero Width Space entfernen
    .replace(/‌/g, '')   // Zero Width Non-Joiner entfernen
    .replace(/‍/g, '')   // Zero Width Joiner entfernen
    .replace(/﻿/g, '')   // BOM entfernen
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '') // Steuerzeichen
    .trim();
}

export function useSunshareImport() {
  const [state, setState] = useState<ImportState>({
    status: 'idle',
    product: null,
    error: null,
  });

  const importProduct = useCallback(async (rawUrl: string) => {
    if (!rawUrl.trim()) return;

    // URL bereinigen BEVOR Validierung und API-Aufruf
    const url = sanitizeUrl(rawUrl);

    // Validate it's a sunshare URL
    if (!url.includes('sunshare.de')) {
      setState({
        status: 'error',
        product: null,
        error: 'Bitte eine gültige sunshare.de URL eingeben.',
      });
      return;
    }

    setState({ status: 'loading', product: null, error: null });

    try {
      console.log(`[SunshareImport] Calling: ${API_URL}/api/import-sunshare`);
      console.log(`[SunshareImport] URL (bereinigt): ${url}`);

      const response = await fetch(`${API_URL}/api/import-sunshare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(60000), // 60s für Render Cold Start
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `Server-Fehler: ${response.status}`);
      }

      const data: SunshareProduct = await response.json();
      console.log('[SunshareImport] Success:', data.title, '| Images:', data.images?.length);
      setState({ status: 'success', product: data, error: null });
    } catch (err: any) {
      console.error('[SunshareImport] Error:', err.message, err.name);
      setState({
        status: 'error',
        product: null,
        error: err.name === 'TimeoutError'
          ? `Backend antwortet nicht (Timeout). API URL: ${API_URL} – prüfe VITE_API_URL in .env`
          : err.message || 'Unbekannter Fehler beim Import',
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle', product: null, error: null });
  }, []);

  return { state, importProduct, reset };
}

