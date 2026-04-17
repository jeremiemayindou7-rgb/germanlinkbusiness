import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Ship,
  BarChart3, X, TrendingUp, DollarSign, Clock, Calendar
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { DashboardOverview } from './DashboardOverview';
import { ProductManagement } from './ProductManagement';
import { OrderManagement } from './OrderManagement';
import { ContainerManagement } from './ContainerManagement';
import { Statistics } from './Statistics';
import { CustomerManagement } from './CustomerManagement';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'dashboard' | 'products' | 'orders' | 'containers' | 'statistics' | 'customers';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isOpen) return null;

  const menuItems = [
    { id: 'dashboard' as TabType, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'products' as TabType, icon: Package, label: t('products') },
    { id: 'orders' as TabType, icon: ShoppingBag, label: t('order_management') },
    { id: 'containers' as TabType, icon: Ship, label: 'Containers' },
    { id: 'statistics' as TabType, icon: BarChart3, label: 'Statistiques' },
    { id: 'customers' as TabType, icon: Users, label: 'Clients' },
  ];

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex">
      <div
        className={`bg-[#009543] text-white transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } flex-shrink-0`}
      >
        <div className="p-4 border-b border-white border-opacity-20 flex items-center justify-between">
          {!sidebarCollapsed && (
            <h2 className="text-xl font-bold">Admin Dashboard</h2>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition"
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition mb-1 ${
                  activeTab === item.id
                    ? 'bg-white bg-opacity-20'
                    : 'hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <Icon className="w-5 h-5" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {menuItems.find(item => item.id === activeTab)?.label}
          </h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'containers' && <ContainerManagement />}
          {activeTab === 'statistics' && <Statistics />}
          {activeTab === 'customers' && <CustomerManagement />}
        </div>
      </div>
    </div>
  );
};
