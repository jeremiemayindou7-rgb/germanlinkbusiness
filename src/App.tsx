import React, { useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
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

function AppContent() {
  const { user } = useAuth();
  const [showLanding, setShowLanding] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [activeTab, setActiveTab] = useState('home');
  const [activeView, setActiveView] = useState('dashboard');
  const [showSellerApply, setShowSellerApply] = useState(false);

  React.useEffect(() => {
    const path = window.location.pathname;
    setCurrentRoute(path);
    if (path === '/auth/confirm' || path === '/agb') return;
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (params.get('reset') === 'true' || hashParams.get('type') === 'recovery') {
      setShowLanding(false);
      setAuthModalOpen(true);
    }
  }, []);

  if (currentRoute === '/auth/confirm') {
    return <PasswordConfirm />;
  }
  if (currentRoute === '/agb') {
    return <AGBPage />;
  }
  if (showLanding) {
    return (
      <>
        <LandingPage onGetStarted={() => setShowLanding(false)} />
        <ChatBot />
      </>
    );
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'upload') {
      setAdminDashboardOpen(true);
    } else if (tab === 'messages') {
      setNotificationsOpen(true);
    } else if (tab === 'profile') {
      setAuthModalOpen(true);
    } else if (tab === 'marketplace') {
      setActiveView('marketplace');
    } else if (tab === 'home') {
      setActiveView('dashboard');
    } else if (tab === 'seller') {
      // Seller-Tab: eingeloggt? → Dashboard, sonst → Anmelden
      if (user) {
        setActiveView('seller');
      } else {
        setAuthModalOpen(true);
      }
    }
  };

  const renderMain = () => {
    if (activeView === 'marketplace') return <MarketplaceSearch />;
    if (activeView === 'seller') return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Seller-Bereich Header */}
        <div className="bg-gradient-to-r from-[#0A5EB0] to-[#1a7fd4] rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">🇩🇪 Seller-Programm</h1>
              <p className="text-blue-100 text-sm">
                Verkaufe Produkte aus Deutschland nach Afrika – GLB liefert
              </p>
            </div>
            {user && (
              <button
                onClick={() => setShowSellerApply(true)}
                className="px-5 py-2.5 bg-white text-[#0A5EB0] rounded-xl font-bold hover:bg-blue-50 transition shadow-md text-sm"
              >
                + Bewerben
              </button>
            )}
          </div>
        </div>
        <SellerDashboard />
      </div>
    );
    return <ProductCatalog />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onAuthClick={() => setAuthModalOpen(true)}
        onCartClick={() => setCartOpen(true)}
        onAdminClick={() => setAdminDashboardOpen(true)}
        onOrdersClick={() => setOrdersOpen(true)}
        onNotificationsClick={() => setNotificationsOpen(true)}
      />

      <div className="flex">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 pb-20 md:pb-0">
          {renderMain()}
        </main>
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => setCheckoutOpen(true)} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <AdminDashboard isOpen={adminDashboardOpen} onClose={() => setAdminDashboardOpen(false)} />
      <OrderTracking isOpen={ordersOpen} onClose={() => setOrdersOpen(false)} />
      <Notifications isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <ChatBot />

      {/* Seller Bewerbungsformular */}
      {showSellerApply && (
        <SellerApplyForm onClose={() => setShowSellerApply(false)} />
      )}
    </div>
  );
}

function App() {
  const [currentRoute] = useState(window.location.pathname);

  if (currentRoute === '/auth/confirm') {
    return (
      <LanguageProvider>
        <AuthProvider>
          <PasswordConfirm />
        </AuthProvider>
      </LanguageProvider>
    );
  }

  if (currentRoute === '/agb') {
    return (
      <LanguageProvider>
        <AuthProvider>
          <AGBPage />
        </AuthProvider>
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