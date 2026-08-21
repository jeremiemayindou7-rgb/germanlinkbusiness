import React, { useState, useEffect } from 'react';
import { Download, Eye, Search, ChevronDown, Package, User, Phone, MapPin, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface OrderItem { product_name: string; quantity: number; price: number; product_id?: string; }
interface Order {
  id: string; order_number: string; user_id: string; items: OrderItem[];
  total_amount: number; subtotal: number; shipping_cost: number;
  payment_option: string; payment_status: string; order_status: string;
  container_id: string | null; created_at: string;
  payment_method: string; customer_phone: string | null;
  profiles?: { name: string; email?: string; phone: string; whatsapp_number: string; delivery_address: string; };
}

const STATUS_COLORS: Record<string, string> = {
  pending:          'bg-gray-100 text-gray-700',
  awaiting_payment: 'bg-yellow-100 text-yellow-800',
  paid:             'bg-green-100 text-green-800',
  pickup_scheduled: 'bg-blue-100 text-blue-700',
  in_warehouse:     'bg-blue-100 text-blue-800',
  in_container:     'bg-indigo-100 text-indigo-800',
  shipped:          'bg-indigo-100 text-indigo-700',
  arrived_port:     'bg-purple-100 text-purple-800',
  customs_clearance:'bg-orange-100 text-orange-800',
  out_for_delivery: 'bg-emerald-100 text-emerald-700',
  delivered:        'bg-green-200 text-green-900',
};
const PAY_COLORS: Record<string, string> = {
  paid:             'bg-green-100 text-green-800',
  partial:          'bg-yellow-100 text-yellow-800',
  pending:          'bg-red-100 text-red-700',
  agent_contacted:  'bg-purple-100 text-purple-800',
};
const PAY_LABELS: Record<string, string> = {
  paid: 'Bezahlt', partial: 'Anzahlung', pending: 'Ausstehend', agent_contacted: 'Agent',
};
const ORDER_LABELS: Record<string, string> = {
  pending: 'Ausstehend', awaiting_payment: 'Zahlung ausstehend', paid: 'Bezahlt',
  pickup_scheduled: 'Abholung geplant', in_warehouse: 'Im Lager', in_container: 'Im Container',
  shipped: 'Versendet', arrived_port: 'Im Hafen', customs_clearance: 'Verzollung',
  out_for_delivery: 'Unterwegs', delivered: 'Geliefert',
};

const fmt = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchOrders(); }, []);
  useEffect(() => { applyFilters(); }, [orders, search, statusFilter, paymentFilter, methodFilter, sortBy]);

  const fetchOrders = async () => {
    setLoading(true);
    const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!ordersData) { setLoading(false); return; }
    const userIds = [...new Set(ordersData.map(o => o.user_id))];
    const { data: profilesData } = await supabase.from('profiles').select('id, name, email, phone, whatsapp_number, delivery_address').in('id', userIds);
    const profilesMap = new Map((profilesData || []).map(p => [p.id, p]));
    setOrders(ordersData.map(o => ({ ...o, profiles: profilesMap.get(o.user_id) || { name: 'N/A', phone: '', whatsapp_number: '', delivery_address: '' } })));
    setLoading(false);
  };

  const applyFilters = () => {
    let f = [...orders];
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(o =>
        o.order_number.toLowerCase().includes(q) ||
        (o.profiles?.name || '').toLowerCase().includes(q) ||
        (o.profiles?.email || '').toLowerCase().includes(q) ||
        (o.items || []).some(i => i.product_name?.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== 'all') f = f.filter(o => o.order_status === statusFilter);
    if (paymentFilter !== 'all') f = f.filter(o => o.payment_status === paymentFilter);
    if (methodFilter !== 'all') f = f.filter(o => o.payment_method === methodFilter);
    if (sortBy === 'amount') f.sort((a, b) => b.total_amount - a.total_amount);
    setFiltered(f);
  };

  const updatePaymentStatus = async (order: Order, newStatus: string) => {
    setUpdating(true);
    const { error } = await supabase.from('orders').update({
      payment_status: newStatus,
      ...(newStatus === 'paid' ? { payment_confirmed_at: new Date().toISOString() } : {}),
    }).eq('id', order.id);
    if (error) { alert('Fehler: ' + error.message); setUpdating(false); return; }
    if (newStatus === 'paid' && order.payment_status !== 'paid') {
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
          body: JSON.stringify({ orderId: order.id, type: 'payment_confirmed' }),
        });
      } catch (e) { console.error(e); }
    }
    setUpdating(false);
    await fetchOrders();
    if (selected?.id === order.id) setSelected({ ...selected, payment_status: newStatus });
  };

  const updateOrderStatus = async (order: Order, newStatus: string) => {
    setUpdating(true);
    const { error } = await supabase.from('orders').update({ order_status: newStatus }).eq('id', order.id);
    if (error) { alert('Fehler: ' + error.message); setUpdating(false); return; }
    if (['shipped', 'delivered'].includes(newStatus)) {
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
          body: JSON.stringify({ orderId: order.id, type: newStatus === 'shipped' ? 'order_shipped' : 'order_delivered' }),
        });
      } catch (e) { console.error(e); }
    }
    setUpdating(false);
    await fetchOrders();
    if (selected?.id === order.id) setSelected({ ...selected, order_status: newStatus });
  };

  const exportCSV = () => {
    const rows = [
      ['Bestellnummer', 'Kunde', 'Email', 'Datum', 'Produkte', 'Menge', 'Betrag (€)', 'Zahlungsmethode', 'Zahlungsstatus', 'Bestellstatus'],
      ...filtered.map(o => {
        const products = (o.items || []).map(i => i.product_name).join(' | ');
        const qty = (o.items || []).reduce((s, i) => s + i.quantity, 0);
        return [
          o.order_number,
          o.profiles?.name || '',
          o.profiles?.email || '',
          new Date(o.created_at).toLocaleDateString('de-DE'),
          products,
          qty,
          o.total_amount.toFixed(2),
          o.payment_method,
          o.payment_status,
          o.order_status,
        ];
      }),
    ];
    const blob = new Blob([rows.map(r => r.join(';')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // ── Detailansicht ──────────────────────────────────────────────────────────
  if (selected) return (
    <div className="space-y-5 max-w-4xl">
      <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-[#009543] font-medium hover:underline">
        ← Zurück zur Liste
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{selected.order_number}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date(selected.created_at).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[selected.order_status] || 'bg-gray-100 text-gray-700'}`}>
              {ORDER_LABELS[selected.order_status] || selected.order_status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${PAY_COLORS[selected.payment_status] || 'bg-gray-100'}`}>
              {PAY_LABELS[selected.payment_status] || selected.payment_status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Kunde */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Kunde
            </h4>
            <p className="font-semibold text-gray-900">{selected.profiles?.name || 'N/A'}</p>
            {selected.profiles?.email && <p className="text-sm text-gray-600">{selected.profiles.email}</p>}
            {selected.profiles?.phone && (
              <p className="text-sm text-gray-600 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {selected.profiles.phone}</p>
            )}
            {selected.customer_phone && (
              <p className="text-sm text-gray-600 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {selected.customer_phone}</p>
            )}
            {selected.profiles?.delivery_address && (
              <p className="text-sm text-gray-600 flex items-start gap-1"><MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {selected.profiles.delivery_address}</p>
            )}
          </div>

          {/* Zahlungsinfos */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Zahlung
            </h4>
            <p className="text-sm text-gray-700"><strong>Methode:</strong> {selected.payment_method === 'uba_congo' ? 'UBA Congo' : selected.payment_method === 'lemfi' ? 'LemFi' : selected.payment_method}</p>
            <p className="text-sm text-gray-700"><strong>Option:</strong> {selected.payment_option === 'full' ? 'Vollzahlung' : '50% Anzahlung'}</p>
          </div>
        </div>
      </div>

      {/* Bestellpositionen */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-4">
          <Package className="w-3.5 h-3.5" /> Bestellpositionen
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                <th className="pb-2 text-left">Produkt</th>
                <th className="pb-2 text-center">Menge</th>
                <th className="pb-2 text-right">Einzelpreis</th>
                <th className="pb-2 text-right">Gesamt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(selected.items || []).map((item, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3 text-sm font-medium text-gray-900">{item.product_name}</td>
                  <td className="py-3 text-center">
                    <span className="px-2.5 py-1 bg-[#009543] text-white rounded-full text-xs font-bold">{item.quantity}</span>
                  </td>
                  <td className="py-3 text-right text-sm text-gray-600">{fmt(item.price)} €</td>
                  <td className="py-3 text-right text-sm font-semibold text-emerald-600">{fmt(item.price * item.quantity)} €</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200">
                <td colSpan={3} className="py-3 text-right text-sm text-gray-500">Zwischensumme</td>
                <td className="py-3 text-right text-sm text-gray-700">{fmt(selected.subtotal || selected.total_amount)} €</td>
              </tr>
              {selected.shipping_cost > 0 && (
                <tr>
                  <td colSpan={3} className="py-1 text-right text-sm text-gray-500">Versand</td>
                  <td className="py-1 text-right text-sm text-gray-700">{fmt(selected.shipping_cost)} €</td>
                </tr>
              )}
              <tr className="border-t-2 border-gray-200">
                <td colSpan={3} className="py-3 text-right font-bold text-gray-900">GESAMT</td>
                <td className="py-3 text-right font-bold text-lg text-[#009543]">{fmt(selected.total_amount)} €</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Status ändern */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Status aktualisieren</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Zahlungsstatus</label>
            <select value={selected.payment_status} disabled={updating}
              onChange={e => updatePaymentStatus(selected, e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#009543] text-sm">
              <option value="pending">Ausstehend</option>
              {selected.payment_method === 'uba_congo' && <option value="agent_contacted">Agent kontaktiert</option>}
              <option value="partial">Anzahlung (50%)</option>
              <option value="paid">Bezahlt ✓</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bestellstatus</label>
            <select value={selected.order_status} disabled={updating}
              onChange={e => updateOrderStatus(selected, e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#009543] text-sm">
              {Object.entries(ORDER_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
          <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
          Bei Statuswechsel zu <strong>Bezahlt</strong> oder <strong>Versendet</strong> wird automatisch eine E-Mail an den Kunden gesendet.
        </div>
      </div>
    </div>
  );

  // ── Listenansicht ──────────────────────────────────────────────────────────
  const totalAmount = filtered.reduce((s, o) => s + o.total_amount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Commandes</h2>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#009543] text-white rounded-xl text-sm font-semibold hover:bg-[#007a36] transition">
          <Download className="w-4 h-4" /> Exporter CSV
        </button>
      </div>

      {/* Filter + Suche */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Suche */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Bestellnr., Kunde, Produkt..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#009543] focus:border-transparent" />
          </div>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#009543]">
            <option value="all">Alle Status</option>
            {Object.entries(ORDER_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>

          <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#009543]">
            <option value="all">Alle Zahlungen</option>
            <option value="paid">Bezahlt</option>
            <option value="partial">Anzahlung</option>
            <option value="pending">Ausstehend</option>
            <option value="agent_contacted">Agent</option>
          </select>

          <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#009543]">
            <option value="all">Alle Methoden</option>
            <option value="lemfi">LemFi</option>
            <option value="uba_congo">UBA Congo</option>
          </select>

          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#009543]">
            <option value="date">↓ Datum</option>
            <option value="amount">↓ Betrag</option>
          </select>
        </div>

        {/* Zusammenfassung */}
        <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-100 text-sm">
          <span className="text-gray-500"><strong className="text-gray-900">{filtered.length}</strong> Bestellung(en)</span>
          <span className="text-gray-500">Gesamt: <strong className="text-emerald-600">{fmt(totalAmount)} €</strong></span>
        </div>
      </div>

      {/* Tabelle */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#009543] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Bestellnr.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Kunde</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Produkte & Menge</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Datum</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Betrag</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Methode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Zahlung</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">Keine Bestellungen gefunden</td></tr>
                ) : filtered.map(order => {
                  const totalQty = (order.items || []).reduce((s, i) => s + i.quantity, 0);
                  const productNames = (order.items || []).map(i => `${i.product_name} ×${i.quantity}`);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-xs font-mono text-gray-700 whitespace-nowrap">{order.order_number}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">{order.profiles?.name || 'N/A'}</p>
                        {order.profiles?.email && <p className="text-xs text-gray-400 truncate max-w-[120px]">{order.profiles.email}</p>}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="space-y-0.5">
                          {productNames.slice(0, 2).map((n, i) => (
                            <p key={i} className="text-xs text-gray-700 truncate">{n}</p>
                          ))}
                          {productNames.length > 2 && (
                            <p className="text-xs text-gray-400">+{productNames.length - 2} weiteres</p>
                          )}
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Package className="w-3 h-3" /> {totalQty} Stück gesamt
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600 whitespace-nowrap">{fmt(order.total_amount)} €</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          order.payment_method === 'uba_congo' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.payment_method === 'uba_congo' ? 'UBA Congo' : 'LemFi'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[order.order_status] || 'bg-gray-100 text-gray-700'}`}>
                          {ORDER_LABELS[order.order_status] || order.order_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PAY_COLORS[order.payment_status] || 'bg-gray-100'}`}>
                          {PAY_LABELS[order.payment_status] || order.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setSelected(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition">
                          <Eye className="w-3.5 h-3.5" /> Voir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

