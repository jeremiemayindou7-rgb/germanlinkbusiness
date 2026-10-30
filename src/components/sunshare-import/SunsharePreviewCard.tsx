import React, { useState } from 'react';
import { SunshareProduct } from './types';
import { ExternalLink, Zap } from 'lucide-react';

interface Props {
  product: SunshareProduct;
}

export function SunsharePreviewCard({ product }: Props) {
  const [activeImg, setActiveImg] = useState(0);
  const [activeLang, setActiveLang] = useState<'de' | 'fr' | 'ln'>('de');

  const langs = [
    { key: 'de' as const, label: '🇩🇪 DE' },
    { key: 'fr' as const, label: '🇫🇷 FR' },
    { key: 'ln' as const, label: '🇨🇩 LN' },
  ];

  const titles = { de: product.title_de, fr: product.title_fr, ln: product.title_ln };
  const descs  = { de: product.description_de, fr: product.description_fr, ln: product.description_ln };

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      {/* Image */}
      {product.images.length > 0 && (
        <div className="relative bg-gray-50">
          <img
            src={product.images[activeImg]}
            alt={product.title}
            className="w-full h-52 object-contain p-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {product.wattage && (
            <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {product.wattage}
            </span>
          )}
          {/* Thumbnail row */}
          {product.images.length > 1 && (
            <div className="flex gap-2 p-2 border-t overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-12 h-12 flex-shrink-0 rounded border-2 overflow-hidden transition ${
                    activeImg === i ? 'border-yellow-400' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Preis */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Sunshare Preis</p>
            <p className="text-lg font-bold text-gray-700">{product.price_eur.toFixed(2)} €</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">GLB Verkaufspreis (+20%)</p>
            <p className="text-2xl font-bold text-[#009543]">{product.glb_price_eur.toFixed(2)} €</p>
          </div>
        </div>

        {/* Kategorie */}
        <div className="flex items-center gap-2">
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
            ☀️ Solar &amp; Energie
          </span>
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Auf Sunshare ansehen
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Sprachumschalter */}
        <div>
          <div className="flex gap-1 mb-2">
            {langs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveLang(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  activeLang === key
                    ? 'bg-yellow-400 text-yellow-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2">
            {titles[activeLang]}
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">
            {descs[activeLang]}
          </p>
        </div>
      </div>
    </div>
  );
}
