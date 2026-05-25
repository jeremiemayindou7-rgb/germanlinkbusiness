import React, { useState, useEffect } from 'react';
import { X, Package, Clock, Truck, Ship, CheckCircle, CreditCard, Home, AlertCircle, Warehouse, Anchor } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Order {
  id: string;
  order_number: string;
  items: Array<{ product_name: string; quantity: number; price: number; }>;
  total_amount: number;
  payment_option: string;
  payment_status: string;
  order_status: string;
  next_shipment_date: string;
  created_at: string;
  customer_phone?: string;
  source_type?: string;
}

interface OrderTrackingProps {
  isOpen: boolean;
  onClose: () => void;
}

const orderStatuses = [
  { key: 'pending',           label: 'Bestellung eingegangen',                    labelFr: 'Commande reçue',                  icon: CheckCircle, color: 'bg-gray-500' },
  { key: 'awaiting_payment',  label: 'Versandkosten gesendet – Zahlung ausstehend', labelFr: 'Frais envoyés – En attente',      icon: CreditCard,  color: 'bg-yellow-500' },
  { key: 'paid',              label: 'Zahlung bestätigt',                          labelFr: 'Paiement confirmé',               icon: CheckCircle, color: 'bg-green-500' },
  { key: 'pickup_scheduled',  label: 'Abholung geplant',                           labelFr: 'Enlèvement planifié',             icon: Truck,       color: 'bg-blue-400' },
  { key: 'in_warehouse',      label: 'Im deutschen Lager',                         labelFr: 'En entrepôt Allemagne',           icon: Warehouse,   color: 'bg-blue-500' },
  { key: 'in_container',      label: 'Im Container',                               labelFr: 'Dans le conteneur',               icon: Package,     color: 'bg-blue-600' },
  { key: 'shipped',           label: 'Auf dem Schiff',                             labelFr: 'En mer',                          icon: Ship,        color: 'bg-indigo-500' },
  { key: 'arrived_port',      label: 'Hafen erreicht',                             labelFr: 'Arrivé au port',                  icon: Anchor,      color: 'bg-purple-500' },
  { key: 'customs_clearance', label: 'Verzollung läuft',                           labelFr: 'Dédouanement en cours',           icon: AlertCircle, color: 'bg-orange-500' },
  { key: 'out_for_delivery',  label: 'Fahrer unterwegs',                           labelFr: 'En cours de livraison',           icon: Truck,       color: 'bg-green-400' },
  { key: 'delivered',         label: 'Geliefert ✓',                                labelFr: 'Livré ✓',                         icon: Home,        color: 'bg-green-600' },
];

const statusMapping: Record<string, number> = {
  pending: 0, awaiting_payment: 1, paid: 2, pickup_scheduled: 3,
  in_warehouse: 4, in_container: 5, shipped: 6, arrived_port: 7,
  customs_clearance: 8, out_for_delivery: 9, delivered: 10,
};

export const OrderTracking: React.FC<OrderTrackingProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (isOpen && user) fetchOrders();
  }, [isOpen, user]);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (error) { console.error('Error fetching orders:', error); }
    finally { setLoading(false); }
  };

  const getCurrentStatusIndex = (status: string) => statusMapping[status] ?? 0;

  const getPaymentStatusColor = (status: string) => {
    if (status === 'paid')    return 'bg-green-100 text-green-800';
    if (status === 'partial') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPaymentStatusText = (status: string) => {
    if (status === 'paid')    return t('paid');
    if (status === 'partial') return t('partial_payment');
    return t('payment_pending');
  };

  const getOrderStatusBadge = (status: string) => {
    const idx = statusMapping[status] ?? 0;
    if (idx === 0)  return 'bg-gray-100 text-gray-700';
    if (idx === 1)  return 'bg-yellow-100 text-yellow-800';
    if (idx === 2)  return 'bg-green-100 text-green-800';
    if (idx <= 5)   return 'bg-blue-100 text-blue-800';
    if (idx <= 8)   return 'bg-indigo-100 text-indigo-800';
    if (idx === 9)  return 'bg-orange-100 text-orange-800';
    return 'bg-green-200 text-green-900';
  };

  const getCurrentStatusLabel = (status: string) => {
    const found = orderStatuses.find(s => s.key === status);
    return found ? found.label : status;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-lg rounded-t-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
          <h2 className="text-base sm:text-xl font-bold text-gray-900">
            {selectedOrder ? selectedOrder.order_number : t('my_orders')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-6">

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#009543] border-t-transparent"></div>
            </div>

          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-sm">{t('no_products')}</p>
            </div>

          ) : selectedOrder ? (
            // ── DETAIL-ANSICHT ──
            <div>
              <button onClick={() => setSelectedOrder(null)}
                className="mb-3 text-[#009543] hover:underline flex items-center gap-1 text-sm">
                ← {t('back_to_catalog')}
              </button>

              {/* Bestellinfo */}
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{selectedOrder.order_number}</h3>
                    <p className="text-xs text-gray-600">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                    {selectedOrder.customer_phone && (
                      <p className="text-xs text-gray-500 mt-0.5">📞 {selectedOrder.customer_phone}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                    {getPaymentStatusText(selectedOrder.payment_status)}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <h4 className="font-bold text-gray-900 mb-2 text-sm">{t('order_items')}</h4>
                  <div className="space-y-1">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="truncate mr-2">{item.product_name} ×{item.quantity}</span>
                        <span className="font-medium flex-shrink-0">{(item.price * item.quantity).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-2 pt-2 flex justify-between font-bold text-sm">
                    <span>{t('total')}</span>
                    <span className="text-[#009543]">{selectedOrder.total_amount.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              {/* Fortschrittsbalken */}
              <div className="bg-white border rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-gray-900 text-sm">{t('order_status')}</h4>
                  <span className="text-xs text-gray-500">
                    {getCurrentStatusIndex(selectedOrder.order_status) + 1}/{orderStatuses.length}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div className="bg-[#009543] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(getCurrentStatusIndex(selectedOrder.order_status) / (orderStatuses.length - 1)) * 100}%` }} />
                </div>

                {/* Steps — compact on mobile */}
                <div className="space-y-0">
                  {orderStatuses.map((status, idx) => {
                    const currentIndex = getCurrentStatusIndex(selectedOrder.order_status);
                    const isCompleted = idx < currentIndex;
                    const isCurrent = idx === currentIndex;
                    const Icon = status.icon;

                    return (
                      <div key={status.key} className="relative flex items-start gap-3 pb-3 last:pb-0">
                        {/* Connector line */}
                        {idx < orderStatuses.length - 1 && (
                          <div className={`absolute left-4 top-8 w-0.5 h-full ${isCompleted ? 'bg-[#009543]' : 'bg-gray-200'}`} style={{ bottom: '-4px' }} />
                        )}

                        {/* Icon */}
                        <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center z-10 ${
                          isCompleted ? 'bg-[#009543] text-white' :
                          isCurrent   ? `${status.color} text-white ring-2 ring-offset-1 ring-green-300` :
                                        'bg-gray-100 text-gray-300'
                        }`}>
                          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>

                        {/* Text */}
                        <div className="flex-1 pt-1 min-w-0">
                          <p className={`text-xs sm:text-sm font-semibold ${
                            isCompleted ? 'text-[#009543]' : isCurrent ? 'text-gray-900' : 'text-gray-300'
                          }`}>{status.label}</p>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-green-50 text-green-700 border border-green-200 rounded-full px-1.5 py-0.5 mt-0.5">
                              <Clock className="w-2.5 h-2.5" /> En cours
                            </span>
                          )}
                        </div>

                        {isCompleted && (
                          <CheckCircle className="w-4 h-4 text-[#009543] flex-shrink-0 mt-1" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Lieferdatum */}
                <div className="mt-4 bg-[#FBDE4A] bg-opacity-20 p-3 rounded-lg">
                  <p className="text-xs text-center">
                    <strong>{t('estimated_delivery')}:</strong>{' '}
                    {selectedOrder.next_shipment_date
                      ? new Date(selectedOrder.next_shipment_date).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
                      : 'À déterminer'}
                  </p>
                </div>
              </div>
            </div>

          ) : (
            // ── LISTEN-ANSICHT ──
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id}
                  className="bg-white border-2 hover:border-[#009543] rounded-xl p-3 cursor-pointer transition"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Package className="w-4 h-4 text-[#009543] flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm truncate">{order.order_number}</h3>
                        <p className="text-xs text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-[#009543] text-sm">{order.total_amount.toFixed(2)} €</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                        {getPaymentStatusText(order.payment_status)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getOrderStatusBadge(order.order_status)}`}>
                      {getCurrentStatusLabel(order.order_status)}
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-1.5 flex-shrink-0">
                      <div className="bg-[#009543] h-1.5 rounded-full"
                        style={{ width: `${(getCurrentStatusIndex(order.order_status) / (orderStatuses.length - 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

