import React, { useState, useEffect } from 'react';
import {
  Plus, Package, Trash2, Clock, CheckCircle, XCircle,
  ShoppingBag, ChevronDown, ChevronUp
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { SellerProductForm } from './SellerProductForm';

// ── Status Badge ──────────────────────────────────────────────────────────────
const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { label: string; className: string }> = {
    pending:    { label: 'Ausstehend',  className: 'bg-yellow-100 text-yellow-700' },
    confirmed:  { label: 'Bestätigt',  className: 'bg-blue-100 text-blue-700' },
    paid:       { label: 'Bezahlt',    className: 'bg-purple-100 text-purple-700' },
    shipped:    { label: 'Versendet',  className: 'bg-indigo-100 text-indigo-700' },
    delivered:  { label: 'Geliefert',  className: 'bg-green-100 text-green-700' },
    cancelled:  { label: 'Storniert',  className: 'bg-red-100 text-red-700' },
    inquiry:    { label: 'Anfrage',    className: 'bg-orange-100 text-orange-700' },
  };
  const s = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.className}`}>
      {s.label}
    </span>
  );
};

export const SellerDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [application, setApplication] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  useEffect(() => { fetchData(); }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: app } = await supabase
      .from('seller_applications')
      .select('*')
      .eq('user_id', user.id)
      .single();
    setApplication(app);

    if (app?.status === 'approved') {
      // Produkte laden
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      setProducts(prods || []);

      // Bestellungen/Anfragen für alle Seller-Produkte laden
      if (prods && prods.length > 0) {
        const productIds = prods.map((p: any) => p.id);
        const { data: orderData } = await supabase
          .from('orders')
          .select(`
            id, status, created_at, total_amount, quantity,
            product_id,
            products ( name, image_url ),
            profiles ( full_name, email )
          `)
          .in('product_id', productIds)
          .order('created_at', { ascending: false });
        setOrders(orderData || []);
      }
    }

    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm(t('confirm_delete'))) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(p => p.filter(x => x.id !== id));
    setOrders(o => o.filter(x => x.product_id !== id));
  };

  // Bestellungen pro Produkt gruppieren
  const ordersForProduct = (productId: string) =>
    orders.filter(o => o.product_id === productId);

  const totalOrders   = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#0A5EB0] border-t-transparent"/>
    </div>
  );

  if (!application) return (
    <div className="text-center py-16 text-gray-500">
      <Package className="w-12 h-12 mx-auto mb-3 opacity-30"/>
      <p>{t('seller_no_application')}</p>
    </div>
  );

  if (application.status === 'pending') return (
    <div className="max-w-md mx-auto text-center py-16">
      <Clock className="w-14 h-14 text-[#F4B400] mx-auto mb-4"/>
      <h2 className="text-xl font-bold mb-2">{t('seller_pending_title')}</h2>
      <p className="text-gray-500">{t('seller_pending_desc')}</p>
    </div>
  );

  if (application.status === 'rejected') return (
    <div className="max-w-md mx-auto text-center py-16">
      <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4"/>
      <h2 className="text-xl font-bold mb-2">{t('seller_rejected_title')}</h2>
      <p className="text-gray-500">{t('seller_rejected_desc')}</p>
    </div>
  );

  // ── Approved Seller Dashboard ──────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1C]">{t('seller_dashboard_title')}</h1>
          <p className="text-gray-500 text-sm">{t('seller_dashboard_desc')}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-3 bg-[#FF6F00] text-white rounded-xl font-bold hover:bg-[#E66000] transition shadow-md"
        >
          <Plus className="w-5 h-5"/>
          {t('add_product')}
        </button>
      </div>

      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 border border-[#E5E5E5] shadow-sm">
          <p className="text-xs text-gray-500 mb-1">{t('products')}</p>
          <p className="text-2xl font-bold text-[#0A5EB0]">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E5E5E5] shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Bestellungen</p>
          <p className="text-2xl font-bold text-[#1C1C1C]">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E5E5E5] shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Ausstehend</p>
          <p className="text-2xl font-bold text-yellow-500">{pendingOrders}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center gap-1 mb-1">
            <CheckCircle className="w-3 h-3 text-green-500"/>
            <p className="text-xs text-gray-500">Status</p>
          </div>
          <span className="text-xs font-bold text-green-600">{t('seller_approved_badge')}</span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
            activeTab === 'products'
              ? 'bg-white text-[#0A5EB0] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package className="w-4 h-4"/>
          Meine Produkte ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
            activeTab === 'orders'
              ? 'bg-white text-[#0A5EB0] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShoppingBag className="w-4 h-4"/>
          Bestellungen ({totalOrders})
          {pendingOrders > 0 && (
            <span className="bg-[#FF6F00] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {pendingOrders}
            </span>
          )}
        </button>
      </div>

      {/* ── TAB: PRODUKTE ── */}
      {activeTab === 'products' && (
        <div className="space-y-3">
          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30"/>
              <p>{t('seller_no_products')}</p>
            </div>
          ) : products.map(p => {
            const productOrders = ordersForProduct(p.id);
            const isExpanded = expandedProduct === p.id;
            // Hauptbild: images[0] oder image_url
            const mainImage = (p.images && p.images[0]) || p.image_url || '/glblogo.png';

            return (
              <div key={p.id} className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden">
                {/* Produkt-Zeile */}
                <div className="flex gap-3 items-center p-4">
                  {/* Bilder-Stack */}
                  <div className="relative flex-shrink-0 w-16 h-16">
                    <img
                      src={mainImage}
                      alt={p.name}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={e => (e.currentTarget.src = '/glblogo.png')}
                    />
                    {/* Zusätzliche Bilder Indikator */}
                    {p.images && p.images.length > 1 && (
                      <div className="absolute -bottom-1 -right-1 bg-[#0A5EB0] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        +{p.images.length - 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1C1C1C] truncate">{p.name}</p>
                    <p className="text-[#0A5EB0] font-bold text-sm">{p.sale_price?.toFixed(2)} €</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{p.category}</span>
                      {productOrders.length > 0 && (
                        <span className="text-xs bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded-full">
                          {productOrders.length} Bestellung{productOrders.length !== 1 ? 'en' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {productOrders.length > 0 && (
                      <button
                        onClick={() => setExpandedProduct(isExpanded ? null : p.id)}
                        className="p-2 text-[#0A5EB0] hover:bg-blue-50 rounded-lg transition"
                        title="Bestellungen anzeigen"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                      </button>
                    )}
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                </div>

                {/* Alle Bilder Vorschau (wenn > 1) */}
                {p.images && p.images.length > 1 && (
                  <div className="px-4 pb-3 flex gap-2">
                    {p.images.map((imgUrl: string, idx: number) => (
                      <img
                        key={idx}
                        src={imgUrl}
                        alt={`Bild ${idx + 1}`}
                        className="w-10 h-10 rounded-lg object-cover border-2 border-gray-100"
                        onError={e => (e.currentTarget.src = '/glblogo.png')}
                      />
                    ))}
                  </div>
                )}

                {/* Expanded: Bestellungen für dieses Produkt */}
                {isExpanded && productOrders.length > 0 && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    <p className="text-xs font-bold text-gray-500 px-4 py-2 uppercase tracking-wide">
                      Bestellungen für dieses Produkt
                    </p>
                    {productOrders.map(order => (
                      <div key={order.id} className="flex items-center gap-3 px-4 py-3 border-t border-gray-100">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1C1C1C] truncate">
                            {order.profiles?.full_name || order.profiles?.email || 'Kunde'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleDateString('de-DE')}
                            {order.quantity && ` · ${order.quantity}×`}
                          </p>
                        </div>
                        {order.total_amount && (
                          <p className="text-sm font-bold text-[#0A5EB0]">
                            {order.total_amount.toFixed(2)} €
                          </p>
                        )}
                        <OrderStatusBadge status={order.status}/>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB: ALLE BESTELLUNGEN ── */}
      {activeTab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30"/>
              <p className="font-medium">Noch keine Bestellungen</p>
              <p className="text-sm mt-1">Bestellungen erscheinen hier sobald Kunden deine Produkte kaufen.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm p-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={order.products?.image_url || '/glblogo.png'}
                      alt={order.products?.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      onError={e => (e.currentTarget.src = '/glblogo.png')}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1C1C1C] text-sm truncate">
                        {order.products?.name || 'Produkt'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        👤 {order.profiles?.full_name || order.profiles?.email || 'Kunde'}
                      </p>
                      <p className="text-xs text-gray-400">
                        📅 {new Date(order.created_at).toLocaleDateString('de-DE', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                        {order.quantity && ` · Menge: ${order.quantity}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <OrderStatusBadge status={order.status}/>
                      {order.total_amount && (
                        <p className="text-sm font-bold text-[#0A5EB0]">
                          {order.total_amount.toFixed(2)} €
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <SellerProductForm
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchData(); }}
        />
      )}
    </div>
  );
};

