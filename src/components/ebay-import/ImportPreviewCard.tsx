// ─── GermanLink Business – Import Preview Card ───────────────────────────────

import { useState } from "react";
import { ImportedProduct } from "./types";

interface ImportPreviewCardProps {
  product: ImportedProduct;
}

// ── eBay Bild-URLs durch Proxy leiten (CORS-Fix) ──────────────────────────────
// eBay blockiert direkte Bildladungen von Drittseiten.
// images.weserv.nl ist ein kostenloser, zuverlässiger Bild-Proxy mit CORS-Support.
function proxyImageUrl(url: string): string {
  if (!url) return url;
  if (!url.includes('ebayimg.com') && !url.includes('ebay.com')) return url;
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=800&q=85`;
}

export function ImportPreviewCard({ product }: ImportPreviewCardProps) {
  const [activeImg, setActiveImg] = useState(0);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  // Alle Bilder durch Proxy leiten
  const proxiedImages = product.images.map(proxyImageUrl);
  const validImages = proxiedImages.filter((_, i) => !imgError[i]);

  return (
    <div className="glb-preview">
      <div className="glb-preview__header">
        <span className="glb-preview__badge">
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
          </svg>
          Vorschau
        </span>
        <a
          href={product.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="glb-preview__source-link"
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          eBay-Original öffnen
        </a>
      </div>

      <div className="glb-preview__body">
        {/* ── Bildergalerie ── */}
        {validImages.length > 0 ? (
          <div className="glb-gallery">
            <div className="glb-gallery__main">
              <img
                src={validImages[activeImg]}
                alt={product.translations.de.title}
                className="glb-gallery__main-img"
                onError={() => setImgError((e) => ({ ...e, [activeImg]: true }))}
              />
              <div className="glb-gallery__overlay-badge">
                {activeImg + 1} / {validImages.length}
              </div>
            </div>
            {validImages.length > 1 && (
              <div className="glb-gallery__thumbs">
                {validImages.slice(0, 5).map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`glb-gallery__thumb ${i === activeImg ? "glb-gallery__thumb--active" : ""}`}
                  >
                    <img
                      src={src}
                      alt={`Bild ${i + 1}`}
                      onError={() => setImgError((e) => ({ ...e, [i]: true }))}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Fallback wenn alle Bilder fehlschlagen */
          <div className="glb-gallery">
            <div className="glb-gallery__main" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#f3f4f6', minHeight: 220, borderRadius: 8
            }}>
              <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ margin: '0 auto 8px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />
                </svg>
                <p style={{ fontSize: '0.875rem' }}>Kein Bild verfügbar</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Produkt-Info ── */}
        <div className="glb-preview__info">
          <p className="glb-preview__category">{product.category}</p>
          <h2 className="glb-preview__title">{product.translations.de.title}</h2>

          {/* Preis-Block */}
          <div className="glb-preview__prices">
            <div className="glb-preview__price-item">
              <span className="glb-preview__price-label">eBay-Preis</span>
              <span className="glb-preview__price-value glb-preview__price-value--base">
                {product.base_price.toFixed(2)} {product.currency}
              </span>
            </div>
            <div className="glb-preview__price-arrow">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
            <div className="glb-preview__price-item">
              <span className="glb-preview__price-label">GLB-Preis (+20%)</span>
              <span className="glb-preview__price-value glb-preview__price-value--glb">
                {product.glb_price.toFixed(2)} {product.currency}
              </span>
            </div>
          </div>

          {/* Meta-Tags */}
          <div className="glb-preview__meta">
            <span className="glb-preview__tag">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              {product.images.length} Bilder
            </span>
            <span className="glb-preview__tag">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21 5.25 11.25 21 3l-3 18-5.25-2.25Zm0 0-5.25-2.25" />
              </svg>
              DE · FR · LN
            </span>
            <span className="glb-preview__tag">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
              </svg>
              {product.source}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

