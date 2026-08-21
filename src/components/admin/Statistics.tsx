import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Package, DollarSign, Users, Award,
  ShoppingCart, BarChart2, RefreshCw, Download
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { supabase } from '../../lib/supabase';

const fmt = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = (n: number) => n.toLocaleString('de-DE');

type Period = '7d' | '30d' | '90d' | 'all';

const COLORS = ['#009543', '#0A5EB0', '#FF6F00', '#8B5CF6', '#EF4444', '#06B6D4', '#F59E0B', '#10B981'];

// Custom Tooltip für AreaChart
const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      <p className="text-emerald-600 font-semibold">{fmt(payload[0]?.value || 0)} €</p>
      {payload[1] && <p className="text-blue-500">{payload[1]?.value} Bestellungen</p>}
    </div>
  );
};

const ProductTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-bold text-gray-700 truncate max-w-[180px]">{payload[0]?.payload?.name}</p>
      <p className="text-emerald-600">{payload[0]?.value} verkauft</p>
      <p className="text-blue-600">{fmt(payload[0]?.payload?.revenue || 0)} € Umsatz</p>
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-bold text-gray-700">{payload[0]?.name}</p>
      <p style={{ color: payload[0]?.payload?.fill }}>{payload[0]?.value} Einheiten ({payload[0]?.payload?.percentage}%)</p>
    </div>
  );
};

export const Statistics: React.FC = () => {
  const [period, setPeriod] = useState<Period>('30d');
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number; orders: number }[]>([]);
  const [paymentStats, setPaymentStats] = useState({ paid: 0, partial: 0, pending: 0 });
  const [topProducts, setTopProducts] = useState<{ name: string; sales: number; revenue: number }[]>([]);
  const [topCategories, setTopCategories] = useState<{ name: string; sales: number; percentage: string; fill: string }[]>([]);
  const [containerStats, setContainerStats] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0, avgOrderValue: 0, totalOrders: 0,
    newCustomersWeek: 0, newCustomersMonth: 0, returningCustomers: 0,
    revenueGrowth: 0,
  });

  useEffect(() => { fetchStatistics(); }, [period]);

  const getDays = () => period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const { data: orders } = await supabase.from('orders').select('*');
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: products } = await supabase.from('products').select('*');
      const { data: containers } = await supabase.from('containers').select('*');
      if (!orders) return;

      const days = getDays();
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const filtered = period === 'all' ? orders : orders.filter(o => new Date(o.created_at) >= cutoff);

      // Revenue by day
      const dayMap: Record<string, { revenue: number; orders: number }> = {};
      filtered.forEach(o => {
        const day = o.created_at.split('T')[0];
        if (!dayMap[day]) dayMap[day] = { revenue: 0, orders: 0 };
        dayMap[day].revenue += o.total_amount;
        dayMap[day].orders += 1;
      });
      const revData = Object.entries(dayMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-14)
        .map(([date, v]) => ({
          date: new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
          revenue: parseFloat(v.revenue.toFixed(2)),
          orders: v.orders,
        }));
      setRevenueData(revData);

      // Payment stats
      setPaymentStats({
        paid: filtered.filter(o => o.payment_status === 'paid').length,
        partial: filtered.filter(o => o.payment_status === 'partial').length,
        pending: filtered.filter(o => o.payment_status === 'pending').length,
      });

      // Top products
      const prodMap: Record<string, { sales: number; revenue: number }> = {};
      filtered.forEach(o => {
        (o.items || []).forEach((item: any) => {
          const key = item.product_name || 'Unbekannt';
          if (!prodMap[key]) prodMap[key] = { sales: 0, revenue: 0 };
          prodMap[key].sales += item.quantity || 1;
          prodMap[key].revenue += (item.price || 0) * (item.quantity || 1);
        });
      });
      setTopProducts(
        Object.entries(prodMap)
          .sort((a, b) => b[1].sales - a[1].sales)
          .slice(0, 8)
          .map(([name, v]) => ({
            name: name.length > 25 ? name.slice(0, 24) + '…' : name,
            sales: v.sales,
            revenue: v.revenue,
          }))
      );

      // Top categories
      const catMap: Record<string, number> = {};
      filtered.forEach(o => {
        (o.items || []).forEach((item: any) => {
          const prod = products?.find(p => p.name === item.product_name || p.id === item.product_id);
          const cat = prod?.category || 'Autre';
          catMap[cat] = (catMap[cat] || 0) + (item.quantity || 1);
        });
      });
      const totalCat = Object.values(catMap).reduce((s, v) => s + v, 0);
      setTopCategories(
        Object.entries(catMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, sales], i) => ({
            name: name.length > 20 ? name.slice(0, 19) + '…' : name,
            sales,
            percentage: totalCat > 0 ? ((sales / totalCat) * 100).toFixed(1) : '0',
            fill: COLORS[i % COLORS.length],
          }))
      );

      // KPI stats
      const totalRevenue = filtered.reduce((s, o) => s + o.total_amount, 0);
      const avgOrderValue = filtered.length > 0 ? totalRevenue / filtered.length : 0;
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      const monthAgo = new Date(now.getTime() - 30 * 86400000);
      const newCustomersWeek = profiles?.filter(p => new Date(p.created_at) >= weekAgo).length || 0;
      const newCustomersMonth = profiles?.filter(p => new Date(p.created_at) >= monthAgo).length || 0;
      const custMap: Record<string, number> = {};
      orders.forEach(o => { custMap[o.user_id] = (custMap[o.user_id] || 0) + 1; });
      const returningCustomers = Object.values(custMap).filter(c => c > 1).length;
      const prevCutoff = new Date(cutoff.getTime() - days * 86400000);
      const prevOrders = orders.filter(o => { const d = new Date(o.created_at); return d >= prevCutoff && d < cutoff; });
      const prevRevenue = prevOrders.reduce((s, o) => s + o.total_amount, 0);
      const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

      setStats({ totalRevenue, avgOrderValue, totalOrders: filtered.length, newCustomersWeek, newCustomersMonth, returningCustomers, revenueGrowth });

      // Container
      if (containers) {
        const cStats = await Promise.all(
          containers.filter(c => c.status !== 'arrived').map(async c => {
            const { count } = await supabase.from('orders').select('id', { count: 'exact', head: true }).eq('container_id', c.id);
            return { name: c.name, current: count || 0, max: c.max_capacity, percentage: ((count || 0) / c.max_capacity) * 100 };
          })
        );
        setContainerStats(cStats);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const exportCSV = () => {
    const rows = [
      ['Produkt', 'Menge', 'Umsatz (€)'],
      ...topProducts.map(p => [p.name, p.sales, p.revenue.toFixed(2)]),
    ];
    const blob = new Blob([rows.map(r => r.join(';')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `statistiques_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const pieData = [
    { name: 'Bezahlt', value: paymentStats.paid, fill: '#009543', percentage: ((paymentStats.paid / Math.max(paymentStats.paid + paymentStats.partial + paymentStats.pending, 1)) * 100).toFixed(0) },
    { name: 'Anzahlung', value: paymentStats.partial, fill: '#F59E0B', percentage: ((paymentStats.partial / Math.max(paymentStats.paid + paymentStats.partial + paymentStats.pending, 1)) * 100).toFixed(0) },
    { name: 'Ausstehend', value: paymentStats.pending, fill: '#EF4444', percentage: ((paymentStats.pending / Math.max(paymentStats.paid + paymentStats.partial + paymentStats.pending, 1)) * 100).toFixed(0) },
  ].filter(d => d.value > 0);

  const kpis = [
    { label: 'CA Total', value: `${fmt(stats.totalRevenue)} €`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: stats.revenueGrowth !== 0 ? `${stats.revenueGrowth > 0 ? '+' : ''}${stats.revenueGrowth.toFixed(1)}% vs. Vorperiode` : undefined, up: stats.revenueGrowth >= 0 },
    { label: 'Commandes', value: fmtInt(stats.totalOrders), icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Panier moyen', value: `${fmt(stats.avgOrderValue)} €`, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Clients récurrents', value: fmtInt(stats.returningCustomers), icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-900">Statistiques & Rapports</h2>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {(['7d','30d','90d','all'] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {p === '7d' ? '7 J' : p === '30d' ? '30 J' : p === '90d' ? '90 J' : 'Tout'}
              </button>
            ))}
          </div>
          <button onClick={fetchStatistics} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 bg-[#009543] text-white rounded-xl text-sm font-semibold hover:bg-[#007a36] transition">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#009543] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k, i) => {
              const Icon = k.icon;
              return (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className={`w-10 h-10 ${k.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${k.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{k.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{k.label}</p>
                  {k.sub && (
                    <p className={`text-xs mt-1 font-medium ${k.up ? 'text-emerald-600' : 'text-red-500'}`}>
                      {k.up ? '↑' : '↓'} {k.sub}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Kundenstats klein */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Nouveaux cette semaine', value: stats.newCustomersWeek, bg: 'bg-blue-50', text: 'text-blue-700' },
              { label: 'Nouveaux ce mois', value: stats.newCustomersMonth, bg: 'bg-violet-50', text: 'text-violet-700' },
              { label: 'Clients récurrents', value: stats.returningCustomers, bg: 'bg-emerald-50', text: 'text-emerald-700' },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} rounded-2xl p-4 flex items-center justify-between`}>
                <p className={`text-sm font-medium ${s.text}`}>{s.label}</p>
                <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── Area Chart: Umsatz ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart2 className="w-5 h-5 text-[#009543]" />
              <h3 className="text-base font-bold text-gray-900">Chiffre d'affaires par jour</h3>
              <span className="ml-auto text-xs text-gray-400">{revenueData.length} jours avec données</span>
            </div>
            {revenueData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400">Aucune donnée pour cette période</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#009543" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#009543" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A5EB0" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0A5EB0" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<RevenueTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Area type="monotone" dataKey="revenue" name="Umsatz (€)" stroke="#009543" strokeWidth={2.5}
                    fill="url(#colorRevenue)" dot={false} activeDot={{ r: 5, fill: '#009543' }} />
                  <Area type="monotone" dataKey="orders" name="Bestellungen" stroke="#0A5EB0" strokeWidth={2}
                    fill="url(#colorOrders)" dot={false} activeDot={{ r: 4, fill: '#0A5EB0' }} yAxisId={0} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Pie: Zahlungsstatus + Bar: Top Produkte ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Pie Chart Zahlungsstatus */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-5">Statut des paiements</h3>
              {pieData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400">Aucune donnée</div>
              ) : (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                        dataKey="value" paddingAngle={3} stroke="none">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {pieData.map((d, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: d.fill }} />
                        <span className="text-xs text-gray-600">{d.name}: <strong>{d.value}</strong> ({d.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bar Chart Top Produkte (horizontal) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-gray-900">Top Produits — Ventes</h3>
              </div>
              {topProducts.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400">Aucune donnée</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 20, left: 5, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} width={100} />
                    <Tooltip content={<ProductTooltip />} />
                    <Bar dataKey="sales" name="Verkauft" fill="#009543" radius={[0, 4, 4, 0]}>
                      {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ── Bar Chart: Umsatz pro Produkt ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-gray-900">Umsatz pro Produkt (€)</h3>
            </div>
            {topProducts.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400">Aucune donnée</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topProducts} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false}
                    angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => [`${fmt(Number(v))} €`, 'Umsatz']} />
                  <Bar dataKey="revenue" name="Umsatz" radius={[4, 4, 0, 0]}>
                    {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Pie: Top Kategorien ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Package className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-gray-900">Répartition par catégorie</h3>
            </div>
            {topCategories.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400">Aucune donnée</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={topCategories} cx="50%" cy="50%" outerRadius={100}
                      dataKey="sales" paddingAngle={2} stroke="none">
                      {topCategories.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {topCategories.map((cat, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.fill }} />
                          <span className="text-sm font-medium text-gray-700 capitalize">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{cat.sales}</span>
                          <span className="text-sm font-bold" style={{ color: cat.fill }}>{cat.percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ width: `${cat.percentage}%`, background: cat.fill }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Container */}
          {containerStats.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-5">Auslastung Container</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {containerStats.map((c, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-gray-900">{c.name}</h4>
                      <span className="text-sm text-gray-500">{c.current} / {c.max}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4">
                      <div className={`h-4 rounded-full transition-all ${c.percentage >= 90 ? 'bg-red-500' : c.percentage >= 70 ? 'bg-amber-500' : 'bg-[#009543]'}`}
                        style={{ width: `${Math.min(c.percentage, 100)}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{c.percentage.toFixed(1)}% ausgelastet</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

