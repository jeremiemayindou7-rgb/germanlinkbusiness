import React, { useState } from 'react';
import { Search, Sun } from 'lucide-react';

interface Props {
  onImport: (url: string) => void;
  loading: boolean;
  disabled: boolean;
}

export function SunshareUrlInput({ onImport, loading, disabled }: Props) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onImport(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border shadow-sm p-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        🔗 Sunshare Produkt-URL
      </label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Sun className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://sunshare.de/products/..."
            disabled={disabled || loading}
            className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>
        <button
          type="submit"
          disabled={!url.trim() || loading || disabled}
          className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-yellow-900 font-semibold rounded-lg transition flex items-center gap-2 text-sm whitespace-nowrap"
        >
          <Search className="w-4 h-4" />
          Importieren
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Tipp: Du kannst auch eine Kategorie-URL eingeben – das erste Produkt wird importiert.
      </p>
    </form>
  );
}
