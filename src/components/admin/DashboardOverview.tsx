import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Users, Ship, TrendingUp, Clock, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Stats {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  pendingOrders: number;
  totalCustomers: number;
  nextShipment: string | null;
  nextShipmentDays: number;
}

export const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    pendingOrders: 0,
    totalCustomers: 0,
    nextShipment: null,
    nextShipmentDays: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();
  }, []);

  const fetchStats = async () => {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data: allOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*');

      if (ordersError) {
        console.error('[DashboardOverview] Stats orders query error:', {
          message: ordersError.message,
          details: ordersError.details,
          hint: ordersError.hint,
          code: ordersError.code
        });
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id');

      const { data: nextContainer } = await supabase
        .from('containers')
        .select('*')
        .eq('status', 'planning')
        .order('shipping_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (allOrders) {
        const todayOrders = allOrders.filter(
          o => new Date(o.created_at) >= todayStart
        );
        const weekOrders = allOrders.filter(
          o => new Date(o.created_at) >= weekStart
        );
        const monthOrders = allOrders.filter(
          o => new Date(o.created_at) >= monthStart
        );

        const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total_amount, 0);
        const weekRevenue = weekOrders.reduce((sum, o) => sum + o.total_amount, 0);
        const monthRevenue = monthOrders.reduce((sum, o) => sum + o.total_amount, 0);

        const pendingOrders = allOrders.filter(
          o => o.order_status === 'pending' || o.order_status === 'processing'
        ).length;

        let nextShipmentDays = 0;
        if (nextContainer?.shipping_date) {
          const shipDate = new Date(nextContainer.shipping_date);
          nextShipmentDays = Math.ceil((shipDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }

        setStats({
          todayRevenue,
          weekRevenue,
          monthRevenue,
          pendingOrders,
          totalCustomers: profiles?.length || 0,
          nextShipment: nextContainer?.shipping_date || null,
          nextShipmentDays,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (ordersError) {
        console.error('[DashboardOverview] Orders query error:', {
          message: ordersError.message,
          details: ordersError.details,
          hint: ordersError.hint,
          code: ordersError.code
        });
        setRecentOrders([]);
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        setRecentOrders([]);
        return;
      }

      const userIds = [...new Set(ordersData.map(o => o.user_id))];

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);

      if (profilesError) {
        console.error('[DashboardOverview] Profiles query error:', profilesError);
      }

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, p.name])
      );

      const enrichedOrders = ordersData.map(order => ({
        ...order,
        profiles: { name: profilesMap.get(order.user_id) || 'N/A' }
      }));

      setRecentOrders(enrichedOrders);
    } catch (error) {
      console.error('[DashboardOverview] Unexpected error fetching orders:', error);
      setRecentOrders([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#009543] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-medium">Chiffre d'affaires aujourd'hui</h3>
            <DollarSign className="w-8 h-8 text-[#009543]" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.todayRevenue.toFixed(2)} €</p>
          <p className="text-xs text-gray-500 mt-2">Cette semaine: {stats.weekRevenue.toFixed(2)} €</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-medium">CA ce mois</h3>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.monthRevenue.toFixed(2)} €</p>
          <p className="text-xs text-gray-500 mt-2">
            +{((stats.monthRevenue / (stats.weekRevenue || 1)) * 100 - 100).toFixed(1)}% vs semaine
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-medium">Commandes en attente</h3>
            <ShoppingBag className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
          <p className="text-xs text-gray-500 mt-2">À traiter</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-medium">Clients totaux</h3>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
          <p className="text-xs text-gray-500 mt-2">Inscrits</p>
        </div>
      </div>

      {stats.nextShipment && (
        <div className="bg-gradient-to-r from-[#009543] to-[#007a36] rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Ship className="w-12 h-12" />
              <div>
                <h3 className="text-lg font-bold">Prochain envoi container</h3>
                <p className="text-sm opacity-90">
                  {new Date(stats.nextShipment).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{stats.nextShipmentDays}</div>
              <div className="text-sm opacity-90">jours restants</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">Commandes récentes</h3>
        </div>
        <div className="divide-y">
          {recentOrders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Aucune commande récente</p>
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{order.order_number}</p>
                    <p className="text-sm text-gray-600">{order.profiles?.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#009543]">{order.total_amount.toFixed(2)} €</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                      order.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.payment_status === 'paid' ? 'Payé' :
                       order.payment_status === 'partial' ? 'Acompte' :
                       'En attente'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
