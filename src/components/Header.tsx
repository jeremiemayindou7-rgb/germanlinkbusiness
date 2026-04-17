import React, { useState } from 'react';
import { Menu, X, ShoppingCart, User, LogOut, Shield, Bell, Package } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';
import { LanguageSwitcher } from './LanguageSwitcher';

interface HeaderProps {
  onAuthClick: () => void;
  onCartClick: () => void;
  onAdminClick: () => void;
  onOrdersClick: () => void;
  onNotificationsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAuthClick, onCartClick, onAdminClick, onOrdersClick, onNotificationsClick }) => {
  const { t } = useLanguage();
  const { user, isAdmin, signOut } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-[#0A5EB0]">
              {t('app_title')}
            </h1>
            <div className="hidden md:flex items-center space-x-2 text-xs">
              <span className="bg-[#0A5EB0] text-white px-3 py-1 rounded-full font-bold">
                {t('european_quality')}
              </span>
              <span className="bg-[#F4B400] text-[#1C1C1C] px-3 py-1 rounded-full font-bold">
                {t('monthly_shipping')}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />

            <button
              onClick={onCartClick}
              className="relative p-2 hover:bg-[#E5E5E5] rounded-lg transition"
              aria-label={t('cart')}
            >
              <ShoppingCart className="w-6 h-6 text-[#1C1C1C]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF6F00] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="hidden md:block">
              {user ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onNotificationsClick}
                    className="p-2 hover:bg-[#E5E5E5] rounded-lg transition"
                    aria-label={t('notifications')}
                  >
                    <Bell className="w-6 h-6 text-[#1C1C1C]" />
                  </button>
                  <button
                    onClick={onOrdersClick}
                    className="p-2 hover:bg-[#E5E5E5] rounded-lg transition"
                    aria-label={t('my_orders')}
                  >
                    <Package className="w-6 h-6 text-[#1C1C1C]" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={onAdminClick}
                      className="p-2 hover:bg-[#E5E5E5] rounded-lg transition"
                      aria-label={t('admin')}
                    >
                      <Shield className="w-6 h-6 text-[#1C1C1C]" />
                    </button>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#E5E5E5] hover:bg-[#1C1C1C] hover:text-white rounded-lg transition font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">{t('logout')}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#FF6F00] hover:bg-[#E66000] text-white rounded-lg transition font-bold shadow-md hover:shadow-lg"
                >
                  <User className="w-4 h-4" />
                  <span>{t('login')}</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      onNotificationsClick();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-100 rounded-lg transition text-left"
                  >
                    <Bell className="w-5 h-5" />
                    <span>{t('notifications')}</span>
                  </button>
                  <button
                    onClick={() => {
                      onOrdersClick();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-100 rounded-lg transition text-left"
                  >
                    <Package className="w-5 h-5" />
                    <span>{t('my_orders')}</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        onAdminClick();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-100 rounded-lg transition text-left"
                    >
                      <Shield className="w-5 h-5" />
                      <span>{t('admin')}</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-100 rounded-lg transition text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t('logout')}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onAuthClick();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-3 bg-[#FF6F00] hover:bg-[#E66000] text-white rounded-lg transition font-bold shadow-md"
                >
                  <User className="w-5 h-5" />
                  <span>{t('login')}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
