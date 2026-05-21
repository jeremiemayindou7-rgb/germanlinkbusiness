import React, { useEffect } from 'react';
import {
  Home, Grid3x3, Package, ShoppingBag, Users,
  MessageCircle, Settings, Search, Store, X, Upload
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  // Mobile drawer control — passed from Header hamburger button
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  mobileOpen = false,
  onMobileClose,
}) => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close on ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onMobileClose) onMobileClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onMobileClose]);

  const menuItems = [
    { id: 'dashboard',   icon: Home,          label: t('dashboard')  || 'Dashboard'     },
    { id: 'marketplace', icon: Search,         label: 'Marktplatz-Suche'                 },
    { id: 'categories',  icon: Grid3x3,        label: t('categories') || 'Kategorien'   },
    { id: 'products',    icon: Package,        label: t('products')   || 'Produkte'      },
    { id: 'orders',      icon: ShoppingBag,    label: t('orders')     || 'Bestellungen'  },
    { id: 'customers',   icon: Users,          label: t('customers')  || 'Kunden'        },
    { id: 'messages',    icon: MessageCircle,  label: t('messages')   || 'Nachrichten'   },
    { id: 'settings',    icon: Settings,       label: t('settings')   || 'Einstellungen' },
  ];

  if (isAdmin) {
    menuItems.push({ id: 'ebay-import', icon: Upload, label: 'eBay Import' });
  }

  const handleNavigate = (id: string) => {
    onViewChange(id);
    if (onMobileClose) onMobileClose();
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Mobile drawer header */}
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
        <button
          onClick={onMobileClose}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          aria-label="Menü schließen"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
                ${isActive
                  ? 'bg-[#0A5EB0] text-white shadow-md shadow-blue-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80" />
              )}
            </button>
          );
        })}

        {/* Seller section — visually separated */}
        <div className="pt-3 mt-2 border-t border-gray-100">
          <p className="px-4 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Anbieter
          </p>
          <button
            onClick={() => handleNavigate('seller')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
              ${activeView === 'seller'
                ? 'bg-[#FF6F00] text-white shadow-md shadow-orange-200'
                : 'text-[#FF6F00] border border-[#FF6F00]/30 hover:bg-orange-50'}
            `}
          >
            <Store className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium text-sm">{t('become_seller') || 'Anbieter werden'}</span>
          </button>
        </div>
      </nav>

      {/* Bottom hint on mobile */}
      <div className="lg:hidden px-5 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          🇩🇪 Qualität • 🚢 Monatlich • 🌍 Congo
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP sidebar — always visible on lg+ ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 min-h-[calc(100vh-64px)] sticky top-16 shadow-sm">
        <NavContent />
      </aside>

      {/* ── MOBILE drawer — slide in from left ── */}
      <>
        {/* Backdrop */}
        <div
          onClick={onMobileClose}
          className={`
            lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300
            ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
          `}
          aria-hidden="true"
        />

        {/* Drawer panel */}
        <aside
          className={`
            lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl
            transition-transform duration-300 ease-in-out flex flex-col
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          aria-label="Navigation Drawer"
        >
          <NavContent />
        </aside>
      </>
    </>
  );
};

