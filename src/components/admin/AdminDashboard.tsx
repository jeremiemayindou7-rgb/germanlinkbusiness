import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Ship,
  BarChart3, X, Store, FileText, Download
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { DashboardOverview } from './DashboardOverview';
import { ProductManagement } from './ProductManagement';
import { OrderManagement } from './OrderManagement';
import { ContainerManagement } from './ContainerManagement';
import { Statistics } from './Statistics';
import { CustomerManagement } from './CustomerManagement';
import { SellerApplicationsManagement } from './SellerApplicationsManagement';
import { QuoteRequestsManagement } from './QuoteRequestsManagement';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onEbayImport?: () => void; // ← NEU: Callback für eBay Import Page
}

type TabType = 'dashboard' | 'products' | 'orders' | 'containers' | 'statistics' | 'customers' | 'sellers' | 'quotes';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, onEbayImport }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingQuotes, setPendingQuotes] = useState(0);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) { setIsAdmin(false); setCheckingAdmin(false); return; }
      const { data } = await supabase
        .from('profiles')
        .select('is_admin, role')
        .eq('id', user.id)
        .single();
      setIsAdmin(data?.is_admin === true || data?.role === 'admin');
      setCheckingAdmin(false);
    };
    if (isOpen) checkAdmin();
  }, [user, isOpen]);

  useEffect(() => {
    const fetchBadges = async () => {
      const { count: sellerCount } = await supabase
        .from('seller_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      setPendingCount(sellerCount || 0);

      const { count: quoteCount } = await supabase
        .from('quote_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      setPendingQuotes(quoteCount || 0);
    };
    if (isAdmin) fetchBadges();
  }, [isAdmin]);

  if (!isOpen) return null;

  if (checkingAdmin) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#009543] border-t-transparent"/>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-[#1C1C1C] mb-2">Zugriff verweigert</h2>
          <p className="text-gray-500 mb-6">Dieser Bereich ist nur für Administratoren.</p>
          <button onClick={onClose} className="w-full py-3 bg-[#0A5EB0] text-white rounded-xl font-bold hover:bg-[#094da0] transition">
            Schließen
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard'  as TabType, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'products'   as TabType, icon: Package,         label: t('products') },
    { id: 'orders'     as TabType, icon: ShoppingBag,     label: t('order_management') },
    { id: 'quotes'     as TabType, icon: FileText,        label: 'eBay Anfragen', badge: pendingQuotes },
    { id: 'containers' as TabType, icon: Ship,            label: 'Containers' },
    { id: 'statistics' as TabType, icon: BarChart3,       label: 'Statistiques' },
    { id: 'customers'  as TabType, icon: Users,           label: 'Clients' },
    { id: 'sellers'    as TabType, icon: Store,           label: 'Seller-Bewerbungen', badge: pendingCount },
  ];

  // ── Handler: Modal schließen + eBay Import View öffnen ─────────────────────
  const handleEbayImport = () => {
    onClose();          // Admin-Modal schließen
    onEbayImport?.();   // activeView auf 'ebay-import' setzen (via App.tsx)
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex">

      {/* Sidebar */}
      <div className={`bg-[#009543] text-white transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'} flex-shrink-0 flex flex-col`}>
        <div className="p-4 border-b border-white border-opacity-20 flex items-center justify-between">
          {!sidebarCollapsed && <h2 className="text-xl font-bold">Admin Dashboard</h2>}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition"
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="p-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition mb-1 relative ${
                  activeTab === item.id ? 'bg-white bg-opacity-20' : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="flex-1 text-left">{item.label}</span>
                )}
                {/* Badge ausgeklappt */}
                {!sidebarCollapsed && item.badge && item.badge > 0 ? (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
                {/* Badge eingeklappt */}
                {sidebarCollapsed && item.badge && item.badge > 0 ? (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* ── eBay Import Button (unten in der Sidebar) ────────────────────── */}
        {onEbayImport && (
          <div className="p-3 border-t border-white border-opacity-20">
            <button
              onClick={handleEbayImport}
              title="Produkt von eBay importieren"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <Download className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="text-sm font-semibold">eBay Import</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {menuItems.find(item => item.id === activeTab)?.label}
          </h1>

          <div className="flex items-center gap-3">
            {/* ── eBay Import Button (oben rechts im Header) ───────────── */}
            {onEbayImport && (
              <button
                onClick={handleEbayImport}
                className="flex items-center gap-2 px-4 py-2 bg-[#0052cc] text-white rounded-lg hover:bg-[#0747a6] transition text-sm font-medium shadow-sm"
                title="Produkt von eBay automatisch importieren"
              >
                <Download className="w-4 h-4" />
                eBay Import
              </button>
            )}

            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard'  && <DashboardOverview />}
          {activeTab === 'products'   && (
            <ProductManagement
              onEbayImport={handleEbayImport}
            />
          )}
          {activeTab === 'orders'     && <OrderManagement />}
          {activeTab === 'quotes'     && <QuoteRequestsManagement />}
          {activeTab === 'containers' && <ContainerManagement />}
          {activeTab === 'statistics' && <Statistics />}
          {activeTab === 'customers'  && <CustomerManagement />}
          {activeTab === 'sellers'    && <SellerApplicationsManagement />}
        </div>
      </div>
    </div>
  );
};
