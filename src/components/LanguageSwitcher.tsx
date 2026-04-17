import React from 'react';
import { useLanguage, Language } from '../contexts/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string; flagPath: string; ariaLabel: string }[] = [
    { code: 'de', label: 'DE', flagPath: '/flags/de.svg', ariaLabel: 'Deutsch' },
    { code: 'fr', label: 'FR', flagPath: '/flags/fr.svg', ariaLabel: 'Français' },
    { code: 'ln', label: 'LN', flagPath: '/flags/cg.svg', ariaLabel: 'Lingala' }
  ];

  return (
    <div className="inline-flex items-center bg-gray-100 rounded-full p-0.5 gap-0.5">
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => setLanguage(lang.code)}
          aria-pressed={language === lang.code}
          aria-label={lang.ariaLabel}
          title={lang.ariaLabel}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 font-medium text-sm
            ${language === lang.code
              ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
        >
          <img
            src={lang.flagPath}
            alt=""
            className="w-5 h-4 object-cover rounded-sm"
          />
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
};
