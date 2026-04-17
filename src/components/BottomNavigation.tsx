import React from 'react';
import { Home, Grid3x3, PlusSquare, MessageCircle, User, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const { t } = useLanguage();

  const tabs = [
    { id: 'home', icon: Home, label: t('home') || 'Home' },
    { id: 'marketplace', icon: Search, label: 'Marktplatz' },
    { id: 'upload', icon: PlusSquare, label: t('upload_product') || 'Hochladen' },
    { id: 'messages', icon: MessageCircle, label: t('messages') || 'Nachrichten' },
    { id: 'profile', icon: User, label: t('profile') || 'Profil' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5E5] shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-[#0A5EB0]' : 'text-gray-500'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-2' : 'stroke-1.5'}`} />
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
