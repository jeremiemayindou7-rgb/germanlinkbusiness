import React, { useState, useEffect } from 'react';
import { X, Package, Clock, Truck, Ship, MapPin, CheckCircle, CreditCard, Home, AlertCircle, Warehouse, Anchor } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Order {
  id: string;
  order_number: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
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

// ── Alle 10 Status-Schritte aus dem Workflow-Konzept ──
const orderStatuses = [
  {
    key: 'pending',
    label: 'Bestellung eingegangen',
    labelFr: 'Commande reçue',
    icon: CheckCircle,
    color: 'bg-gray-500',
  },
  {
    key: 'awaiting_payment',
    label: 'Versandkosten gesendet – Zahlung ausstehend',
    labelFr: 'Frais envoyés – En attente de paiement',
    icon: CreditCard,
    color: 'bg-yellow-500',
  },
  {
    key: 'paid',
    label: 'Zahlung bestätigt',
    labelFr: 'Paiement confirmé',
    icon: CheckCircle,
    color: 'bg-green-500',
  },
  {
    key: 'pickup_scheduled',
    label: 'Abholung geplant',
    labelFr: 'Enlèvement planifié',
    icon: Truck,
    color: 'bg-blue-400',
  },
  {
    key: 'in_warehouse',
    label: 'Im deutschen Lager',
    labelFr: 'En entrepôt Allemagne',
    icon: Warehouse,
    color: 'bg-blue-500',
  },
  {
    key: 'in_container',
    label: 'Im Container – Verladung abgeschlossen',
    labelFr: 'Dans le conteneur',
    icon: Package,
    color: 'bg-blue-600',
  },
  {
    key: 'shipped',
    label: 'Auf dem Schiff – unterwegs',
    labelFr: 'En mer',
    icon: Ship,
    color: 'bg-indigo-500',
  },
  {
    key: 'arrived_port',
    label: 'Hafen erreicht',
    labelFr: 'Arrivé au port',
    icon: Anchor,
    color: 'bg-purple-500',
  },
  {
    key: 'customs_clearance',
    label: 'Verzollung läuft',
    labelFr: 'Dédouanement en cours',
    icon: AlertCircle,
    color: 'bg-orange-500',
  },
  {
    key: 'out_for_delivery',
    label: 'Fahrer unterwegs – Lieferung heute',
    labelFr: 'En cours de livraison',
    icon: Truck,
    color: 'bg-green-400',
  },
  {
    key: 'delivered',
    label: 'Geliefert ✓',
    labelFr: 'Livré ✓',
    icon: Home,
    color: 'bg-green-600',
  },
];

const statusMapping: { [key: string]: number } = {
  pending: 0,
  awaiting_payment: 1,
  paid: 2,
  pickup_scheduled: 3,
  in_warehouse: 4,
  in_container: 5,
  shipped: 6,
  arrived_port: 7,
  customs_clearance: 8,
  out_for_delivery: 9,
  delivered: 10,
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
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStatusIndex = (status: string): number => statusMapping[status] ?? 0;

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':    return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      default:        return 'bg-red-100 text-red-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    if (status === 'paid')    return t('paid');
    if (status === 'partial') return t('partial_payment');
    return t('payment_pending');
  };

  // Badge-Farbe für Order-Status in der Listenansicht
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8 max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{t('my_orders')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">

          {/* Loading */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#009543] border-t-transparent"></div>
            </div>

          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">{t('no_products')}</p>
            </div>

          ) : selectedOrder ? (
            // ── DETAIL-ANSICHT ──
            <div>
              <button onClick={() => setSelectedOrder(null)}
                className="mb-4 text-[#009543] hover:underline flex items-center space-x-1">
                <span>←</span>
                <span>{t('back_to_catalog')}</span>
              </button>

              {/* Bestellinfo */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedOrder.order_number}</h3>
                    <p className="text-sm text-gray-600">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                    {selectedOrder.customer_phone && (
                      <p className="text-sm text-gray-500 mt-1">📞 {selectedOrder.customer_phone}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                    {getPaymentStatusText(selectedOrder.payment_status)}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-900 mb-3">{t('order_items')}</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.product_name} x {item.quantity}</span>
                        <span className="font-medium">{(item.price * item.quantity).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                    <span>{t('total')}</span>
                    <span className="text-[#009543]">{selectedOrder.total_amount.toFixed(2)} €</span>
                  </div>
                  {selectedOrder.payment_option === 'deposit' && selectedOrder.payment_status === 'partial' && (
                    <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>{t('remaining_balance')}:</strong> {(selectedOrder.total_amount * 0.5).toFixed(2)} €
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── 10-Schritte Tracking ── */}
              <div className="bg-white border-2 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-2">{t('order_status')}</h4>
                <p className="text-sm text-gray-500 mb-6">
                  Schritt {getCurrentStatusIndex(selectedOrder.order_status) + 1} von {orderStatuses.length}
                </p>

                {/* Fortschrittsbalken */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
                  <div
                    className="bg-[#009543] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(getCurrentStatusIndex(selectedOrder.order_status) / (orderStatuses.length - 1)) * 100}%` }}
                  />
                </div>

                <div className="relative">
                  {orderStatuses.map((status, idx) => {
                    const currentIndex = getCurrentStatusIndex(selectedOrder.order_status);
                    const isCompleted = idx < currentIndex;
                    const isCurrent  = idx === currentIndex;
                    const isPending  = idx > currentIndex;
                    const Icon = status.icon;

                    return (
                      <div key={status.key} className="relative pb-6 last:pb-0">
                        {/* Verbindungslinie */}
                        {idx < orderStatuses.length - 1 && (
                          <div className={`absolute left-6 top-12 w-0.5 h-full ${isCompleted ? 'bg-[#009543]' : 'bg-gray-200'}`} />
                        )}

                        <div className="flex items-start space-x-4">
                          {/* Icon-Kreis */}
                          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            isCompleted ? 'bg-[#009543] text-white' :
                            isCurrent   ? `${status.color} text-white ring-4 ring-offset-2 ring-green-200` :
                                          'bg-gray-100 text-gray-400'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>

                          {/* Text */}
                          <div className="flex-1 pt-2">
                            <h5 className={`font-semibold ${
                              isCompleted ? 'text-[#009543]' :
                              isCurrent   ? 'text-gray-900' :
                                            'text-gray-400'
                            }`}>
                              {status.label}
                            </h5>
                            <p className={`text-xs mt-0.5 ${isCurrent ? 'text-gray-500' : 'text-gray-300'}`}>
                              {status.labelFr}
                            </p>
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 mt-1 font-medium">
                                <Clock className="w-3 h-3" />
                                En cours
                              </span>
                            )}
                          </div>

                          {/* Haken für abgeschlossene */}
                          {isCompleted && (
                            <CheckCircle className="w-5 h-5 text-[#009543] flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Lieferdatum */}
                <div className="mt-8 bg-[#FBDE4A] bg-opacity-20 p-4 rounded-lg">
                  <p className="text-sm text-center">
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
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id}
                  className="bg-white border-2 hover:border-[#009543] rounded-lg p-4 cursor-pointer transition"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Package className="w-5 h-5 text-[#009543]" />
                      <div>
                        <h3 className="font-bold text-gray-900">{order.order_number}</h3>
                        <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#009543]">{order.total_amount.toFixed(2)} €</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                        {getPaymentStatusText(order.payment_status)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
                    <div className="flex items-center gap-2">
                      <span>{order.items.length} article(s)</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusBadge(order.order_status)}`}>
                        {getCurrentStatusLabel(order.order_status)}
                      </span>
                    </div>
                    {/* Mini-Fortschrittsbalken */}
                    <div className="w-24 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-[#009543] h-1.5 rounded-full"
                        style={{ width: `${(getCurrentStatusIndex(order.order_status) / (orderStatuses.length - 1)) * 100}%` }}
                      />
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

