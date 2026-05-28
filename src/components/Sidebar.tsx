import React from 'react';
import { Home, Grid3x3, Store, HelpCircle, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onGoHome?: () => void;
  // mobileOpen and onMobileClose are kept for API compatibility but unused — no mobile sidebar
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const BROWSE_LABEL: Record<string, string> = {
  de: 'Märkte durchsuchen',
  fr: 'Parcourir les marchés',
  ln: 'Talela bazando',
};

const CATEGORIES_LABEL: Record<string, string> = {
  de: 'Kategorien',
  fr: 'Catégories',
  ln: 'Bibende',
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeView, onViewChange, onGoHome,
}) => {
  const { t, language } = useLanguage();

  const handleNavigate = (id: string) => onViewChange(id);

  return (
    /* Desktop only — completely hidden on mobile */
    <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-100 min-h-[calc(100vh-64px)] sticky top-16 shadow-sm">
      <div className="flex flex-col h-full">
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">

          {/* Home */}
          <button
            onClick={() => onGoHome?.()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <Home className="w-5 h-5 flex-shrink-0 text-gray-400" />
            <span className="font-medium text-sm">Home</span>
          </button>

          {/* Kategorien */}
          {[
            {
              id: 'dashboard',
              icon: Grid3x3,
              label: CATEGORIES_LABEL[language] || CATEGORIES_LABEL.fr,
            },
            {
              id: 'marketplace',
              icon: Search,
              // ← Changed from "Produits" to "Parcourir les marchés"
              label: BROWSE_LABEL[language] || BROWSE_LABEL.fr,
            },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  isActive
                    ? 'bg-[#0A5EB0] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80" />}
              </button>
            );
          })}

          {/* Anbieter */}
          <div className="pt-3 mt-2 border-t border-gray-100">
            <p className="px-4 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              {language === 'de' ? 'Anbieter' : 'Vendeur'}
            </p>
            <button
              onClick={() => handleNavigate('seller')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                activeView === 'seller'
                  ? 'bg-[#FF6F00] text-white'
                  : 'text-[#FF6F00] border border-[#FF6F00]/30 hover:bg-orange-50'
              }`}
            >
              <Store className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">{t('become_seller') || 'Devenir vendeur'}</span>
            </button>
          </div>

          {/* Hilfe */}
          <div className="pt-3 mt-2 border-t border-gray-100">
            <button
              onClick={() => handleNavigate('how-it-works')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                activeView === 'how-it-works'
                  ? 'bg-[#0A5EB0] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <HelpCircle className={`w-5 h-5 flex-shrink-0 ${activeView === 'how-it-works' ? 'text-white' : 'text-gray-400'}`} />
              <span className="font-medium text-sm">{t('help') || 'Aide / Hilfe'}</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
};

