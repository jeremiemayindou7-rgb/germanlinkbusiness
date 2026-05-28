import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { Header } from './components/Header';
import { ProductCatalog } from './components/ProductCatalog';
import { AuthModal } from './components/AuthModal';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { OrderTracking } from './components/OrderTracking';
import { Notifications } from './components/Notifications';
import { ChatBot } from './components/ChatBot';
import { PasswordConfirm } from './components/PasswordConfirm';
import { BottomNavigation } from './components/BottomNavigation';
import { Sidebar } from './components/Sidebar';
import MarketplaceSearch from './components/MarketplaceSearch';
import AGBPage from './components/AGBPage';
import { SellerApplyForm } from './components/SellerApplyForm';
import { SellerDashboard } from './components/SellerDashboard';
import { EbayImportPage } from './components/EbayImportPage';
import { HowItWorksPage } from './components/HowItWorksPage';
import { CookieConsent } from './components/CookieConsent';

function AppContent() {
  const { user } = useAuth();
  const { language } = useLanguage();

  // ── Hash-basiertes Routing ─────────────────────────────────────────────────
  const getInitialView = () => {
    const hash = window.location.hash.replace('#', '');
    const validViews = ['dashboard', 'marketplace', 'seller', 'how-it-works', 'impressum', 'ebay-import'];
    return validViews.includes(hash) ? hash : 'dashboard';
  };

  const getInitialShowLanding = () => {
    const hash = window.location.hash.replace('#', '');
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (params.get('reset') === 'true' || hashParams.get('type') === 'recovery') return false;
    if (hash && hash !== '') return false;
    return true;
  };

  const [showLanding, setShowLanding] = useState(getInitialShowLanding);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [activeTab, setActiveTab] = useState('home');
  const [activeView, setActiveView] = useState(getInitialView);
  const [showSellerApply, setShowSellerApply] = useState(false);
  // sidebarOpen is only used for desktop (lg+) hamburger — mobile has no sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigateTo = (view: string) => {
    setActiveView(view);
    setShowLanding(false);
    window.location.hash = view;
  };

  React.useEffect(() => {
    const path = window.location.pathname;
    setCurrentRoute(path);
    if (path === '/auth/confirm' || path === '/agb') return;

    if (path === '/how-it-works') {
      setShowLanding(false);
      setActiveView('how-it-works');
      window.location.hash = 'how-it-works';
      return;
    }
    if (path === '/impressum') {
      setShowLanding(false);
      setActiveView('impressum');
      window.location.hash = 'impressum';
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (params.get('reset') === 'true' || hashParams.get('type') === 'recovery') {
      setShowLanding(false);
      setAuthModalOpen(true);
    }
  }, []);

  if (currentRoute === '/auth/confirm') return <PasswordConfirm />;
  if (currentRoute === '/agb') return <AGBPage />;

  if (showLanding) {
    return (
      <>
        <LandingPage
          onGetStarted={() => { setShowLanding(false); window.location.hash = 'dashboard'; }}
          onNavigate={(view) => {
            setShowLanding(false);
            setTimeout(() => navigateTo(view), 0);
          }}
        />
        <ChatBot />
        <CookieConsent
          language={language as 'de' | 'fr' | 'ln'}
          onPrivacyClick={() => {
            setShowLanding(false);
            setTimeout(() => navigateTo('impressum'), 0);
          }}
        />
      </>
    );
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setShowLanding(true);
      window.location.hash = '';
    } else if (tab === 'marketplace') {
      navigateTo('marketplace');
    } else if (tab === 'seller') {
      if (user) navigateTo('seller');
      else setAuthModalOpen(true);
    } else if (tab === 'orders') {
      setOrdersOpen(true);
    } else if (tab === 'help') {
      navigateTo('how-it-works');
    }
  };

  const renderMain = () => {
    if (activeView === 'how-it-works') {
      if (!user) {
        setAuthModalOpen(true);
        navigateTo('dashboard');
        return null;
      }
      return <HowItWorksPage />;
    }
    if (activeView === 'impressum') return <HowItWorksPage initialTab="impressum" />;
    if (activeView === 'ebay-import') return (
      <EbayImportPage
        onBack={() => navigateTo('dashboard')}
        onSaved={() => navigateTo('dashboard')}
      />
    );
    if (activeView === 'marketplace') return <MarketplaceSearch />;
    if (activeView === 'seller') return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-[#0A5EB0] to-[#1a7fd4] rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">🇩🇪 Seller-Programm</h1>
              <p className="text-blue-100 text-sm mb-5">Verkaufe Produkte aus Deutschland nach Afrika – GLB liefert</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white/10 rounded-xl px-4 py-3">
                  <p className="text-white font-semibold text-sm mb-1">🌍 Zugang zum afrikanischen Markt</p>
                  <p className="text-blue-100 text-xs leading-relaxed">Erreiche Käufer in Kinshasa, Brazzaville, Matadi und Pointe-Noire.</p>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-3">
                  <p className="text-white font-semibold text-sm mb-1">💶 Du verkaufst — wir zahlen dich aus</p>
                  <p className="text-blue-100 text-xs leading-relaxed">GLB übernimmt Abholung, Verpackung, Transport und Lieferung bis nach Afrika.</p>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-3">
                  <p className="text-white font-semibold text-sm mb-1">🏢 Privat oder Unternehmen</p>
                  <p className="text-blue-100 text-xs leading-relaxed">Ob Privatperson oder Händler — verkaufe zuverlässig nach Kongo und ganz Afrika.</p>
                </div>
              </div>
            </div>
            {user && (
              <div className="shrink-0 self-start">
                <button
                  onClick={() => setShowSellerApply(true)}
                  className="px-5 py-2.5 bg-white text-[#0A5EB0] rounded-xl font-bold hover:bg-blue-50 transition shadow-md text-sm whitespace-nowrap"
                >
                  + Bewerben
                </button>
              </div>
            )}
          </div>
        </div>
        <SellerDashboard />
      </div>
    );

    return <ProductCatalog onCartOpen={() => setCartOpen(true)} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onAuthClick={() => setAuthModalOpen(true)}
        onCartClick={() => setCartOpen(true)}
        onAdminClick={() => setAdminDashboardOpen(true)}
        // Desktop hamburger only — mobile has no sidebar
        onMenuClick={() => setSidebarOpen(true)}
        onHelpClick={() => navigateTo('how-it-works')}
        // ← NEW: Package icon opens "Mes commandes"
        onOrdersClick={() => setOrdersOpen(true)}
      />

      <div className="flex">
        {/*
         * Sidebar is desktop-only (hidden on mobile via CSS inside Sidebar.tsx).
         * mobileOpen / onMobileClose props are still passed for API compatibility
         * but the mobile drawer JSX has been removed from Sidebar.tsx.
         */}
        <Sidebar
          activeView={activeView}
          onViewChange={navigateTo}
          onGoHome={() => { setShowLanding(true); window.location.hash = ''; }}
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 pb-20 md:pb-0 min-w-0">
          {renderMain()}
        </main>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => setCheckoutOpen(true)} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <AdminDashboard
        isOpen={adminDashboardOpen}
        onClose={() => setAdminDashboardOpen(false)}
        onEbayImport={() => {
          setAdminDashboardOpen(false);
          navigateTo('ebay-import');
        }}
      />
      <OrderTracking isOpen={ordersOpen} onClose={() => setOrdersOpen(false)} />
      <Notifications isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <ChatBot />
      <CookieConsent
        language={language as 'de' | 'fr' | 'ln'}
        onPrivacyClick={() => navigateTo('impressum')}
      />

      {showSellerApply && <SellerApplyForm onClose={() => setShowSellerApply(false)} />}
    </div>
  );
}

function App() {
  const [currentRoute] = useState(window.location.pathname);

  if (currentRoute === '/auth/confirm') {
    return (
      <LanguageProvider>
        <AuthProvider><PasswordConfirm /></AuthProvider>
      </LanguageProvider>
    );
  }

  if (currentRoute === '/agb') {
    return (
      <LanguageProvider>
        <AuthProvider><AGBPage /></AuthProvider>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

