import React, { useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
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

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [activeTab, setActiveTab] = useState('home');
  const [activeView, setActiveView] = useState('dashboard');

  React.useEffect(() => {
    const path = window.location.pathname;
    setCurrentRoute(path);

    if (path === '/auth/confirm' || path === '/agb') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    if (params.get('reset') === 'true' || hashParams.get('type') === 'recovery') {
      setShowLanding(false);
      setAuthModalOpen(true);
    }
  }, []);

  const handleGetStarted = () => {
    setShowLanding(false);
  };

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

  if (showLanding) {
    return (
      <LanguageProvider>
        <AuthProvider>
          <LandingPage onGetStarted={handleGetStarted} />
          <ChatBot />
        </AuthProvider>
      </LanguageProvider>
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
    }
  };

  return (
    <LanguageProvider>
      <AuthProvider>
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
              {activeView === 'marketplace' ? (
                <MarketplaceSearch />
              ) : (
                <ProductCatalog />
              )}
            </main>
          </div>

          <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />

          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
          />

          <CartSidebar
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            onCheckout={() => setCheckoutOpen(true)}
          />

          <CheckoutModal
            isOpen={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
          />

          <AdminDashboard
            isOpen={adminDashboardOpen}
            onClose={() => setAdminDashboardOpen(false)}
          />

          <OrderTracking
            isOpen={ordersOpen}
            onClose={() => setOrdersOpen(false)}
          />

          <Notifications
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
          />

          <ChatBot />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
