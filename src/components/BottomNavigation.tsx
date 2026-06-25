import React from 'react';
import { Home, Search, Store, Package, HelpCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'home',        icon: Home,        de: 'Home',         fr: 'Home',       ln: 'Home'     },
  { id: 'marketplace', icon: Search,      de: 'Occasion EU',  fr: 'Occasion',   ln: 'Occasion' },
  { id: 'seller',      icon: Store,       de: 'Verkaufen',    fr: 'Vendre',     ln: 'Teka'     },
  { id: 'orders',      icon: Package,     de: 'Bestellungen', fr: 'Commandes',  ln: 'Bileko'   },
  { id: 'help',        icon: HelpCircle,  de: 'Hilfe',        fr: 'Aide',       ln: 'Lisalisi' },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const { language } = useLanguage();

  const getLabel = (tab: typeof TABS[0]) => {
    if (language === 'fr') return tab.fr;
    if (language === 'ln') return tab.ln;
    return tab.de;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5E5] shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isSeller = tab.id === 'seller';
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? isSeller ? 'text-[#FF6F00]' : 'text-[#0A5EB0]'
                  : 'text-gray-500'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {getLabel(tab)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

