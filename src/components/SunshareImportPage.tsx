import React, { useState } from 'react';
import { ArrowLeft, Sun, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { SunshareUrlInput } from './sunshare-import/SunshareUrlInput';
import { SunsharePreviewCard } from './sunshare-import/SunsharePreviewCard';
import { SunshareSaveAction } from './sunshare-import/SunshareSaveAction';
import { useSunshareImport } from './sunshare-import/useSunshareImport';

interface SunshareImportPageProps {
  onBack: () => void;
  onSaved: () => void;
}

export default function SunshareImportPage({ onBack, onSaved }: SunshareImportPageProps) {
  const { state, importProduct, reset } = useSunshareImport();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
            <Sun className="w-5 h-5 text-yellow-900" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm leading-tight">Sunshare Import</h1>
            <p className="text-xs text-gray-500">sunshare.de → GLB Katalog</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
            ☀️ Solar & Energie
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Sun className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-900 mb-1">
                Sunshare Balkonkraftwerke importieren
              </p>
              <p className="text-xs text-yellow-700">
                Füge eine Sunshare Produkt-URL ein (z.B. Balkonkraftwerk 800W) –
                GLB importiert Titel, Preis, Bilder und Beschreibung automatisch
                und übersetzt auf Französisch &amp; Lingala.
              </p>
            </div>
          </div>
        </div>

        {/* URL Eingabe */}
        <SunshareUrlInput
          onImport={importProduct}
          loading={state.status === 'loading'}
          disabled={state.status === 'success'}
        />

        {/* Lade-Status */}
        {state.status === 'loading' && (
          <div className="bg-white rounded-xl border p-6 text-center">
            <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">Sunshare wird geladen…</p>
            <p className="text-xs text-gray-500 mt-1">Produkt wird importiert und übersetzt</p>
          </div>
        )}

        {/* Fehler */}
        {state.status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Import fehlgeschlagen</p>
              <p className="text-xs text-red-600 mt-1">{state.error}</p>
              <button
                onClick={reset}
                className="mt-2 text-xs text-red-700 underline hover:no-underline"
              >
                Erneut versuchen
              </button>
            </div>
          </div>
        )}

        {/* Produkt Preview */}
        {state.status === 'success' && state.product && (
          <>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-semibold">Produkt erfolgreich importiert!</span>
            </div>
            <SunsharePreviewCard product={state.product} />
            <SunshareSaveAction
              product={state.product}
              onSaved={() => {
                onSaved();
              }}
              onReset={reset}
            />
          </>
        )}

        {/* Tipps */}
        {state.status === 'idle' && (
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              💡 Beispiel-URLs
            </p>
            <div className="space-y-2">
              {[
                'https://sunshare.de/products/balkonkraftwerk-800w',
                'https://sunshare.de/collections/balkonkraftwerke',
                'https://sunshare.de/products/solaranlage-600w-komplettset',
              ].map((url) => (
                <button
                  key={url}
                  onClick={() => importProduct(url)}
                  className="w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition truncate"
                >
                  {url}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

