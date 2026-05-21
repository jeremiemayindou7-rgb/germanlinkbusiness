import React from 'react';
import { Menu, ShoppingCart, User, LogOut, Shield, Bell, Package } from 'lucide-react';
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
  // NEW: controls the mobile sidebar drawer
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAuthClick,
  onCartClick,
  onAdminClick,
  onOrdersClick,
  onNotificationsClick,
  onMenuClick,
}) => {
  const { t } = useLanguage();
  const { user, isAdmin, signOut } = useAuth();
  const { cartCount } = useCart();

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

          {/* Left: Hamburger (mobile) + Logo + badges */}
          <div className="flex items-center gap-3">
            {/* Hamburger — only on mobile/tablet (hidden lg+) */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-gray-100 transition active:scale-95"
              aria-label="Menü öffnen"
            >
              <Menu className="w-6 h-6 text-[#1C1C1C]" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                <div className="w-2.5 h-8 bg-[#000000] rounded-sm" />
                <div className="w-2.5 h-8 bg-[#DD0000] rounded-sm" />
                <div className="w-2.5 h-8 bg-[#FFCE00] rounded-sm" />
              </div>
              <div>
                <div className="text-lg font-black text-[#1C1C1C] leading-none tracking-tight">GLB</div>
                <div className="text-xs font-semibold text-[#0A5EB0] leading-none">GermanLink Business</div>
              </div>
            </div>

            {/* Badges — desktop only */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="bg-[#0A5EB0] text-white px-3 py-1 rounded-full font-bold">
                {t('european_quality')}
              </span>
              <span className="bg-[#F4B400] text-[#1C1C1C] px-3 py-1 rounded-full font-bold">
                {t('monthly_shipping')}
              </span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {/* Cart — always visible */}
            <button
              onClick={onCartClick}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label={t('cart')}
            >
              <ShoppingCart className="w-6 h-6 text-[#1C1C1C]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF6F00] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Desktop user actions */}
            <div className="hidden md:flex items-center gap-1">
              {user ? (
                <>
                  <button
                    onClick={onNotificationsClick}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    aria-label={t('notifications')}
                  >
                    <Bell className="w-6 h-6 text-[#1C1C1C]" />
                  </button>
                  <button
                    onClick={onOrdersClick}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    aria-label={t('my_orders')}
                  >
                    <Package className="w-6 h-6 text-[#1C1C1C]" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={onAdminClick}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      aria-label={t('admin')}
                    >
                      <Shield className="w-6 h-6 text-[#1C1C1C]" />
                    </button>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-[#1C1C1C] hover:text-white rounded-lg transition font-medium text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('logout')}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="flex items-center gap-2 px-4 py-2 bg-[#FF6F00] hover:bg-[#E66000] text-white rounded-lg transition font-bold shadow-md"
                >
                  <User className="w-4 h-4" />
                  <span>{t('login')}</span>
                </button>
              )}
            </div>

            {/* Mobile: login button if not logged in */}
            {!user && (
              <button
                onClick={onAuthClick}
                className="md:hidden flex items-center gap-1 px-3 py-2 bg-[#FF6F00] hover:bg-[#E66000] text-white rounded-lg transition font-bold text-sm shadow-md"
              >
                <User className="w-4 h-4" />
                <span>{t('login')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

