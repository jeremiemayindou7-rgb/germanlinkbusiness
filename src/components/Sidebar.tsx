import React from 'react';
import { Home, Grid3x3, Package, ShoppingBag, Users, MessageCircle, Settings, Search, Store } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const { t } = useLanguage();

  const menuItems = [
    { id: 'dashboard', icon: Home, label: t('dashboard') || 'Dashboard' },
    { id: 'marketplace', icon: Search, label: 'Marktplatz-Suche' },
    { id: 'categories', icon: Grid3x3, label: t('categories') || 'Kategorien' },
    { id: 'products', icon: Package, label: t('products') || 'Produkte' },
    { id: 'orders', icon: ShoppingBag, label: t('orders') || 'Bestellungen' },
    { id: 'customers', icon: Users, label: t('customers') || 'Kunden' },
    { id: 'messages', icon: MessageCircle, label: t('messages') || 'Nachrichten' },
    { id: 'settings', icon: Settings, label: t('settings') || 'Einstellungen' },
  ];

  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-[#E5E5E5] min-h-screen sticky top-16">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive ? 'bg-[#0A5EB0] text-white shadow-md' : 'text-gray-700 hover:bg-[#E5E5E5]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Seller-Bereich – visuell getrennt */}
        <div className="pt-3 mt-3 border-t border-[#E5E5E5]">
          <button
            onClick={() => onViewChange('seller')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              activeView === 'seller'
                ? 'bg-[#FF6F00] text-white shadow-md'
                : 'text-[#FF6F00] border border-[#FF6F00] hover:bg-orange-50'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="font-medium">{t('become_seller') || 'Anbieter werden'}</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};