import React, { useState, useEffect } from 'react';
import { Menu, ShoppingCart, User, LogOut, Shield, Bell, Package, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  onAuthClick: () => void;
  onCartClick: () => void;
  onAdminClick: () => void;
  onOrdersClick: () => void;
  onNotificationsClick: () => void;
  onMenuClick?: () => void;
}

const FLAG_MAP: Record<string, string> = {
  de: '🇩🇪',
  fr: '🇫🇷',
  ln: '🇨🇩',
};
const LANG_LABELS: Record<string, string> = {
  de: 'DE',
  fr: 'FR',
  ln: 'LN',
};

export const Header: React.FC<HeaderProps> = ({
  onAuthClick,
  onCartClick,
  onAdminClick,
  onOrdersClick,
  onNotificationsClick,
  onMenuClick,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const { user, isAdmin, signOut } = useAuth();
  const { cartCount } = useCart();
  const [isStaff, setIsStaff] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  // Staff-Rolle prüfen
  useEffect(() => {
    const checkStaff = async () => {
      if (!user) { setIsStaff(false); return; }
      if (isAdmin) { setIsStaff(false); return; }
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      setIsStaff(data?.role === 'staff');
    };
    checkStaff();
  }, [user, isAdmin]);

  const hasAdminAccess = isAdmin || isStaff;

  const handleSignOut = async () => {
    try { await signOut(); } catch (e) { console.error(e); }
  };

  const handleLangSelect = (lang: string) => {
    setLanguage(lang as 'de' | 'fr' | 'ln');
    localStorage.setItem('germanlink_language', lang);
    setLangOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-2">

          {/* Left: Hamburger + Logo + badges */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-gray-100 transition flex-shrink-0"
              aria-label="Menü öffnen"
            >
              <Menu className="w-6 h-6 text-[#1C1C1C]" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex gap-0.5">
                <div className="w-2.5 h-8 bg-[#000000] rounded-sm" />
                <div className="w-2.5 h-8 bg-[#DD0000] rounded-sm" />
                <div className="w-2.5 h-8 bg-[#FFCE00] rounded-sm" />
              </div>
              <div>
                <div className="text-base font-black text-[#1C1C1C] leading-none tracking-tight">GLB</div>
                <div className="text-[10px] font-semibold text-[#0A5EB0] leading-none">GermanLink Business</div>
              </div>
            </div>

            {/* Badges — desktop only */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="bg-[#0A5EB0] text-white px-3 py-1 rounded-full font-bold whitespace-nowrap">
                {t('european_quality')}
              </span>
              <span className="bg-[#F4B400] text-[#1C1C1C] px-3 py-1 rounded-full font-bold whitespace-nowrap">
                {t('monthly_shipping')}
              </span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1 flex-shrink-0">

            {/* ── Sprach-Dropdown (kompakt) ── */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition text-sm font-semibold"
              >
                <span>{FLAG_MAP[language]}</span>
                <span className="text-[#1C1C1C]">{LANG_LABELS[language]}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {langOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLangOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 min-w-[80px]">
                    {(['de', 'fr', 'ln'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleLangSelect(lang)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition ${
                          language === lang ? 'font-bold text-[#0A5EB0]' : 'text-gray-700'
                        }`}
                      >
                        <span>{FLAG_MAP[lang]}</span>
                        <span>{LANG_LABELS[lang]}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label={t('cart')}
            >
              <ShoppingCart className="w-5 h-5 text-[#1C1C1C]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF6F00] text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Desktop user actions */}
            <div className="hidden md:flex items-center gap-1">
              {user ? (
                <>
                  <button onClick={onNotificationsClick} className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <Bell className="w-5 h-5 text-[#1C1C1C]" />
                  </button>
                  <button onClick={onOrdersClick} className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <Package className="w-5 h-5 text-[#1C1C1C]" />
                  </button>
                  {/* Shield — Admin (schwarz) oder Staff (blau) */}
                  {hasAdminAccess && (
                    <button
                      onClick={onAdminClick}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      title={isStaff ? 'Mitarbeiter-Bereich' : 'Admin'}
                    >
                      <Shield className={`w-5 h-5 ${isStaff ? 'text-[#0A5EB0]' : 'text-[#009543]'}`} />
                    </button>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-[#1C1C1C] hover:text-white rounded-lg transition font-medium text-sm"
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

            {/* Mobile: icons wenn eingeloggt */}
            {user && (
              <div className="md:hidden flex items-center gap-1">
                <button onClick={onNotificationsClick} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <Bell className="w-5 h-5 text-[#1C1C1C]" />
                </button>
                {hasAdminAccess && (
                  <button onClick={onAdminClick} className="p-1.5 hover:bg-gray-100 rounded-lg">
                    <Shield className={`w-5 h-5 ${isStaff ? 'text-[#0A5EB0]' : 'text-[#009543]'}`} />
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="p-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <LogOut className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            )}

            {/* Mobile: login wenn nicht eingeloggt */}
            {!user && (
              <button
                onClick={onAuthClick}
                className="md:hidden flex items-center gap-1 px-3 py-2 bg-[#FF6F00] text-white rounded-lg font-bold text-sm"
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

