import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, DollarSign, Users, TrendingDown, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const Statistics: React.FC = () => {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [paymentStats, setPaymentStats] = useState({ paid: 0, partial: 0, pending: 0 });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [containerStats, setContainerStats] = useState<any[]>([]);
  const [stats, setStats] = useState({
    avgOrderValue: 0,
    newCustomersWeek: 0,
    newCustomersMonth: 0,
    returningCustomers: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const { data: orders } = await supabase.from('orders').select('*');
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: containers } = await supabase.from('containers').select('*');

      if (!orders) return;

      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });

      const revenueByDay = last30Days.map(date => {
        const dayOrders = orders.filter(o => o.created_at.startsWith(date));
        const revenue = dayOrders.reduce((sum, o) => sum + o.total_amount, 0);
        return {
          date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          revenue: parseFloat(revenue.toFixed(2))
        };
      }).filter(d => d.revenue > 0);
      setRevenueData(revenueByDay.slice(-10));

      const paymentStatusCount = {
        paid: orders.filter(o => o.payment_status === 'paid').length,
        partial: orders.filter(o => o.payment_status === 'partial').length,
        pending: orders.filter(o => o.payment_status === 'pending').length,
      };
      setPaymentStats(paymentStatusCount);

      const productSales: any = {};
      orders.forEach(order => {
        order.items.forEach((item: any) => {
          if (!productSales[item.product_name]) {
            productSales[item.product_name] = 0;
          }
          productSales[item.product_name] += item.quantity;
        });
      });
      const topProds = Object.entries(productSales)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, sales]) => ({ name, sales }));
      setTopProducts(topProds);

      const categorySales: any = {};
      const { data: products } = await supabase.from('products').select('*');
      if (products) {
        orders.forEach(order => {
          order.items.forEach((item: any) => {
            const product = products.find(p => p.name === item.product_name);
            if (product) {
              if (!categorySales[product.category]) {
                categorySales[product.category] = 0;
              }
              categorySales[product.category] += item.quantity;
            }
          });
        });
      }
      const totalCategorySales = Object.values(categorySales).reduce((sum: any, val: any) => sum + val, 0);
      const topCats = Object.entries(categorySales)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, sales]: any) => ({
          name,
          sales,
          percentage: ((sales / totalCategorySales) * 100).toFixed(1)
        }));
      setTopCategories(topCats);

      const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
      const avgOrderValue = totalRevenue / orders.length || 0;

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const newCustomersWeek = profiles?.filter(p =>
        new Date(p.created_at) >= weekAgo
      ).length || 0;
      const newCustomersMonth = profiles?.filter(p =>
        new Date(p.created_at) >= monthAgo
      ).length || 0;

      const customerOrderCounts: any = {};
      orders.forEach(order => {
        customerOrderCounts[order.user_id] = (customerOrderCounts[order.user_id] || 0) + 1;
      });
      const returningCustomers = Object.values(customerOrderCounts).filter((count: any) => count > 1).length;

      if (containers) {
        const containerStatsData = await Promise.all(
          containers.filter(c => c.status !== 'arrived').map(async (container) => {
            const { count } = await supabase
              .from('orders')
              .select('id', { count: 'exact', head: true })
              .eq('container_id', container.id);

            return {
              name: container.name,
              current: count || 0,
              max: container.max_capacity,
              percentage: ((count || 0) / container.max_capacity) * 100
            };
          })
        );
        setContainerStats(containerStatsData);
      }

      setStats({
        avgOrderValue,
        newCustomersWeek,
        newCustomersMonth,
        returningCustomers,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Statistiques & Rapports</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-[#009543]" />
          </div>
          <p className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} €</p>
          <p className="text-sm text-gray-600">CA Total</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-2xl font-bold">{stats.avgOrderValue.toFixed(2)} €</p>
          <p className="text-sm text-gray-600">Panier moyen</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-2xl font-bold">{stats.newCustomersWeek}</p>
          <p className="text-sm text-gray-600">Nouveaux (7j)</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-2xl font-bold">{stats.newCustomersMonth}</p>
          <p className="text-sm text-gray-600">Nouveaux (30j)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <h3 className="text-lg font-bold text-green-900">Payé complet</h3>
          </div>
          <p className="text-3xl font-bold text-green-700">{paymentStats.paid}</p>
          <p className="text-sm text-green-600 mt-1">Bestellungen vollständig bezahlt</p>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
            <h3 className="text-lg font-bold text-yellow-900">Acompte</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-700">{paymentStats.partial}</p>
          <p className="text-sm text-yellow-600 mt-1">Bestellungen mit Anzahlung</p>
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <h3 className="text-lg font-bold text-red-900">En attente</h3>
          </div>
          <p className="text-3xl font-bold text-red-700">{paymentStats.pending}</p>
          <p className="text-sm text-red-600 mt-1">Bestellungen ausstehend</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Chiffre d'affaires (10 derniers jours)</h3>
          <div className="space-y-3">
            {revenueData.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune donnée</p>
            ) : (
              revenueData.map((day, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span className="font-medium text-gray-700">{day.date}</span>
                    <span className="font-bold text-[#009543]">{day.revenue.toFixed(2)} €</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-[#009543] h-3 rounded-full transition-all"
                      style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Statistiques clients</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-blue-600 font-medium">Nouveaux cette semaine</p>
                <p className="text-2xl font-bold text-blue-900">{stats.newCustomersWeek}</p>
              </div>
              <Users className="w-10 h-10 text-blue-400" />
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-purple-600 font-medium">Nouveaux ce mois</p>
                <p className="text-2xl font-bold text-purple-900">{stats.newCustomersMonth}</p>
              </div>
              <Users className="w-10 h-10 text-purple-400" />
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-green-600 font-medium">Clients récurrents</p>
                <p className="text-2xl font-bold text-green-900">{stats.returningCustomers}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-400" />
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Panier moyen</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.avgOrderValue.toFixed(2)} €</p>
              </div>
              <DollarSign className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Top 5 Produits</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rang</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ventes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                      Aucune donnée
                    </td>
                  </tr>
                ) : (
                  topProducts.map((product, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#009543] text-white font-bold">
                          {idx + 1}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="px-3 py-1 bg-[#009543] text-white rounded-full font-bold">
                          {product.sales}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Top 3 Catégories</h3>
          <div className="space-y-4">
            {topCategories.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune donnée</p>
            ) : (
              topCategories.map((cat, idx) => (
                <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 hover:border-[#009543] transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Award className="w-6 h-6 text-[#FBDE4A]" />
                      <span className="font-bold text-gray-900 capitalize">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-[#009543]">{cat.percentage}%</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-[#009543] h-3 rounded-full transition-all"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{cat.sales} ventes</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {containerStats.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Auslastung Container</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {containerStats.map((container, idx) => (
              <div key={idx} className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900">{container.name}</h4>
                  <span className="text-sm font-medium text-gray-600">
                    {container.current} / {container.max}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      container.percentage >= 90 ? 'bg-red-600' :
                      container.percentage >= 70 ? 'bg-yellow-500' :
                      'bg-[#009543]'
                    }`}
                    style={{ width: `${Math.min(container.percentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {container.percentage.toFixed(1)}% ausgelastet
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
