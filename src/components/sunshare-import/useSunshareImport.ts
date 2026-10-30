import { useState, useCallback } from 'react';
import { ImportState, SunshareProduct } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Mock-Daten für Fallback wenn Backend nicht erreichbar
const MOCK_PRODUCT: SunshareProduct = {
  title: 'Balkonkraftwerk 800W – Komplettset mit Wechselrichter',
  title_de: 'Balkonkraftwerk 800W – Komplettset mit Wechselrichter',
  title_fr: 'Centrale électrique de balcon 800W – Kit complet avec onduleur',
  title_ln: 'Centrale électrique 800W – Kit complet na onduleur',
  description: 'Plug & Play Solaranlage für Ihren Balkon oder Garten. Inkl. 2× 400W Solarmodul, 800W Mikrowechselrichter, Kabel und Halterung. Sofort einsatzbereit.',
  description_de: 'Plug & Play Solaranlage für Ihren Balkon oder Garten. Inkl. 2× 400W Solarmodul, 800W Mikrowechselrichter, Kabel und Halterung. Sofort einsatzbereit.',
  description_fr: 'Système solaire plug & play pour votre balcon ou jardin. Incl. 2× panneaux solaires 400W, micro-onduleur 800W, câbles et fixations. Prêt à l\'emploi immédiatement.',
  description_ln: 'Système solaire plug & play mpo na balcon to jardin na yo. Ezali na 2× panneaux solaires 400W, micro-onduleur 800W, câbles mpe fixations.',
  price_eur: 549.00,
  glb_price_eur: 658.80,
  images: [
    'https://images.weserv.nl/?url=sunshare.de/cdn/shop/products/balkonkraftwerk-800w.jpg&output=jpg&w=600',
  ],
  url: 'https://sunshare.de/products/balkonkraftwerk-800w',
  wattage: '800W',
  category: 'solar_energie',
  source_type: 'sunshare',
};

export function useSunshareImport() {
  const [state, setState] = useState<ImportState>({
    status: 'idle',
    product: null,
    error: null,
  });

  const importProduct = useCallback(async (url: string) => {
    if (!url.trim()) return;

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

      const response = await fetch(`${API_URL}/api/import-sunshare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      // Kein Mock-Fallback mehr – echter Fehler anzeigen
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

