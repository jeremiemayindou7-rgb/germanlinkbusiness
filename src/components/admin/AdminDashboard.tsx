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
  onEbayImport?: () => void;
}

type TabType = 'dashboard' | 'products' | 'orders' | 'containers' | 'statistics' | 'customers' | 'sellers' | 'quotes';
type UserRole = 'admin' | 'staff' | null;

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, onEbayImport }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingQuotes, setPendingQuotes] = useState(0);

  const isAdmin = userRole === 'admin';
  const isStaff = userRole === 'staff';
  const hasAccess = isAdmin || isStaff;

  useEffect(() => {
    const checkRole = async () => {
      if (!user) { setUserRole(null); setCheckingAdmin(false); return; }
      const { data } = await supabase
        .from('profiles')
        .select('is_admin, role')
        .eq('id', user.id)
        .single();

      if (data?.is_admin === true || data?.role === 'admin') {
        setUserRole('admin');
      } else if (data?.role === 'staff') {
        setUserRole('staff');
      } else {
        setUserRole(null);
      }
      setCheckingAdmin(false);
    };
    if (isOpen) checkRole();
  }, [user, isOpen]);

  useEffect(() => {
    const fetchBadges = async () => {
      if (isAdmin) {
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
      }
    };
    if (hasAccess) fetchBadges();
  }, [userRole]);

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

  if (!user || !hasAccess) {
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

  // ── Menü je nach Rolle ────────────────────────────────────────────────────
  const allMenuItems = [
    { id: 'dashboard'  as TabType, icon: LayoutDashboard, label: 'Dashboard',           roles: ['admin'] },
    { id: 'products'   as TabType, icon: Package,         label: t('products'),          roles: ['admin', 'staff'] },
    { id: 'orders'     as TabType, icon: ShoppingBag,     label: t('order_management'),  roles: ['admin', 'staff'] },
    { id: 'quotes'     as TabType, icon: FileText,        label: 'eBay Anfragen',        roles: ['admin'], badge: pendingQuotes },
    { id: 'containers' as TabType, icon: Ship,            label: 'Containers',           roles: ['admin'] },
    { id: 'statistics' as TabType, icon: BarChart3,       label: 'Statistiques',         roles: ['admin'] },
    { id: 'customers'  as TabType, icon: Users,           label: 'Clients',              roles: ['admin', 'staff'] },
    { id: 'sellers'    as TabType, icon: Store,           label: 'Seller-Bewerbungen',   roles: ['admin'], badge: pendingCount },
  ];

  // Nur Menüpunkte anzeigen die der User sehen darf
  const menuItems = allMenuItems.filter(item =>
    item.roles.includes(userRole as string)
  );

  // Sicherstellen dass activeTab erlaubt ist
  const allowedTabs = menuItems.map(m => m.id);
  const currentTab = allowedTabs.includes(activeTab) ? activeTab : allowedTabs[0];

  const handleEbayImport = () => {
    onClose();
    onEbayImport?.();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col md:flex-row">

      {/* ── MOBILE: Top Bar mit Tabs ── */}
      <div className={`md:hidden flex items-center justify-between px-3 py-2 text-white flex-shrink-0 ${isStaff ? 'bg-[#0A5EB0]' : 'bg-[#009543]'}`}>
        <div>
          <p className="text-sm font-bold">{isStaff ? 'Mitarbeiter' : 'Admin'}</p>
          {isStaff && <p className="text-[10px] text-white/60">Eingeschränkter Zugriff</p>}
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── MOBILE: Bottom Navigation ── */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center py-2 px-1 text-white border-t border-white/20 ${isStaff ? 'bg-[#0A5EB0]' : 'bg-[#009543]'}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition relative ${
                currentTab === item.id ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium leading-none">{item.label.split('-')[0].split(' ')[0]}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
        {isAdmin && onEbayImport && (
          <button
            onClick={handleEbayImport}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-white/10 transition"
          >
            <Download className="w-5 h-5" />
            <span className="text-[9px] font-medium leading-none">eBay</span>
          </button>
        )}
      </div>

      {/* ── DESKTOP: Sidebar ── */}
      <div className={`hidden md:flex flex-col text-white transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'} flex-shrink-0 ${
        isStaff ? 'bg-[#0A5EB0]' : 'bg-[#009543]'
      }`}>
        <div className="p-4 border-b border-white border-opacity-20 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div>
              <h2 className="text-lg font-bold">
                {isStaff ? 'Mitarbeiter' : 'Admin Dashboard'}
              </h2>
              {isStaff && (
                <p className="text-xs text-white/60 mt-0.5">Eingeschränkter Zugriff</p>
              )}
            </div>
          )}
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
                  currentTab === item.id ? 'bg-white bg-opacity-20' : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="flex-1 text-left">{item.label}</span>}
                {!sidebarCollapsed && item.badge && item.badge > 0 ? (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
                {sidebarCollapsed && item.badge && item.badge > 0 ? (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* eBay Import Button — nur für Admin */}
        {isAdmin && onEbayImport && (
          <div className="p-3 border-t border-white border-opacity-20">
            <button
              onClick={handleEbayImport}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <Download className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-semibold">eBay Import</span>}
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden md:flex bg-white border-b p-4 items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {menuItems.find(item => item.id === currentTab)?.label}
            </h1>
            {isStaff && <p className="text-xs text-gray-400 mt-0.5">Mitarbeiter-Zugriff</p>}
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && onEbayImport && (
              <button onClick={handleEbayImport} className="flex items-center gap-2 px-4 py-2 bg-[#0052cc] text-white rounded-lg hover:bg-[#0747a6] transition text-sm font-medium">
                <Download className="w-4 h-4" />
                eBay Import
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile: current tab title */}
        <div className="md:hidden bg-white border-b px-4 py-2.5">
          <h1 className="text-base font-bold text-gray-900">
            {menuItems.find(item => item.id === currentTab)?.label}
          </h1>
        </div>

        {/* Content — pb-20 on mobile for bottom nav */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6 pb-24 md:pb-6">
          {currentTab === 'dashboard'  && <DashboardOverview />}
          {currentTab === 'products'   && <ProductManagement onEbayImport={isAdmin ? handleEbayImport : undefined} />}
          {currentTab === 'orders'     && <OrderManagement />}
          {currentTab === 'quotes'     && <QuoteRequestsManagement />}
          {currentTab === 'containers' && <ContainerManagement />}
          {currentTab === 'statistics' && <Statistics />}
          {currentTab === 'customers'  && <CustomerManagement />}
          {currentTab === 'sellers'    && <SellerApplicationsManagement />}
        </div>
      </div>
    </div>
  );
};

