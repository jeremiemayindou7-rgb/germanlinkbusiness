import React, { useEffect } from 'react';
import { Home, Grid3x3, Package, Store, X, HelpCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onGoHome?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView, onViewChange, onGoHome, mobileOpen = false, onMobileClose,
}) => {
  const { t } = useLanguage();

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && onMobileClose) onMobileClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onMobileClose]);

  const handleNavigate = (id: string) => { onViewChange(id); if (onMobileClose) onMobileClose(); };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            <div className="w-2.5 h-8 bg-black rounded-sm" />
            <div className="w-2.5 h-8 bg-[#DD0000] rounded-sm" />
            <div className="w-2.5 h-8 bg-[#FFCE00] rounded-sm" />
          </div>
          <div>
            <div className="text-base font-black text-[#1C1C1C] leading-none">GLB</div>
            <div className="text-[10px] font-semibold text-[#0A5EB0] leading-none">GermanLink Business</div>
          </div>
        </div>
        <button onClick={onMobileClose} className="p-2 rounded-lg hover:bg-gray-100 transition">
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Home → Landing Page */}
        <button
          onClick={() => { onGoHome?.(); if (onMobileClose) onMobileClose(); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <Home className="w-5 h-5 flex-shrink-0 text-gray-400" />
          <span className="font-medium text-sm">Home</span>
        </button>

        {/* Kategorien */}
        {[
          { id: 'dashboard',   icon: Grid3x3, label: t('categories') || 'Kategorien' },
          { id: 'marketplace', icon: Package, label: t('products')   || 'Produits'   },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button key={item.id} onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                isActive ? 'bg-[#0A5EB0] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80" />}
            </button>
          );
        })}

        {/* Anbieter */}
        <div className="pt-3 mt-2 border-t border-gray-100">
          <p className="px-4 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Anbieter</p>
          <button onClick={() => handleNavigate('seller')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
              activeView === 'seller' ? 'bg-[#FF6F00] text-white' : 'text-[#FF6F00] border border-[#FF6F00]/30 hover:bg-orange-50'
            }`}>
            <Store className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium text-sm">{t('become_seller') || 'Anbieter werden'}</span>
          </button>
        </div>

        {/* Hilfe */}
        <div className="pt-3 mt-2 border-t border-gray-100">
          <button onClick={() => handleNavigate('how-it-works')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
              activeView === 'how-it-works' ? 'bg-[#0A5EB0] text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}>
            <HelpCircle className="w-5 h-5 flex-shrink-0 text-gray-400" />
            <span className="font-medium text-sm">{t('help') || 'Aide / Hilfe'}</span>
          </button>
        </div>
      </nav>

      <div className="lg:hidden px-5 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">🇩🇪 Qualité • 🚢 Mensuel • 🌍 Congo</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-100 min-h-[calc(100vh-64px)] sticky top-16 shadow-sm">
        <NavContent />
      </aside>

      {/* Mobile drawer */}
      <div onClick={onMobileClose}
        className={`lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} />
      <aside className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <NavContent />
      </aside>
    </>
  );
};

