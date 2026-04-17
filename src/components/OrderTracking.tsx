import React, { useState, useEffect } from 'react';
import { X, Package, Clock, Truck, Ship, MapPin, CheckCircle } from 'lucide-react';
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
}

interface OrderTrackingProps {
  isOpen: boolean;
  onClose: () => void;
}

const orderStatuses = [
  { key: 'order_received', icon: CheckCircle },
  { key: 'in_preparation', icon: Package },
  { key: 'in_container', icon: Ship },
  { key: 'en_route', icon: Truck },
  { key: 'arrived_brazzaville', icon: MapPin },
  { key: 'ready_delivery', icon: CheckCircle },
];

const statusMapping: { [key: string]: number } = {
  pending: 0,
  processing: 1,
  packed: 2,
  shipped: 3,
  arrived: 4,
  delivered: 5,
};

export const OrderTracking: React.FC<OrderTrackingProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchOrders();
    }
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

  const getCurrentStatusIndex = (status: string): number => {
    return statusMapping[status] || 0;
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getPaymentStatusText = (status: string, paymentOption: string) => {
    if (status === 'paid') return t('paid');
    if (status === 'partial') return t('partial_payment');
    return t('payment_pending');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{t('my_orders')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
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
            <div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="mb-4 text-[#009543] hover:underline flex items-center space-x-1"
              >
                <span>←</span>
                <span>{t('back_to_catalog')}</span>
              </button>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedOrder.order_number}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedOrder.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
                      selectedOrder.payment_status
                    )}`}
                  >
                    {getPaymentStatusText(
                      selectedOrder.payment_status,
                      selectedOrder.payment_option
                    )}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-900 mb-3">{t('order_items')}</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>
                          {item.product_name} x {item.quantity}
                        </span>
                        <span className="font-medium">
                          {(item.price * item.quantity).toFixed(2)} €
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                    <span>{t('total')}</span>
                    <span className="text-[#009543]">
                      {selectedOrder.total_amount.toFixed(2)} €
                    </span>
                  </div>

                  {selectedOrder.payment_option === 'deposit' &&
                    selectedOrder.payment_status === 'partial' && (
                      <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p className="text-sm text-yellow-800">
                          <strong>{t('remaining_balance')}:</strong>{' '}
                          {(selectedOrder.total_amount * 0.5).toFixed(2)} €
                        </p>
                      </div>
                    )}
                </div>
              </div>

              <div className="bg-white border-2 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-6">{t('order_status')}</h4>

                <div className="relative">
                  {orderStatuses.map((status, idx) => {
                    const currentIndex = getCurrentStatusIndex(selectedOrder.order_status);
                    const isActive = idx <= currentIndex;
                    const Icon = status.icon;

                    return (
                      <div key={status.key} className="relative pb-8 last:pb-0">
                        {idx < orderStatuses.length - 1 && (
                          <div
                            className={`absolute left-6 top-12 w-0.5 h-full ${
                              isActive ? 'bg-[#009543]' : 'bg-gray-300'
                            }`}
                          />
                        )}

                        <div className="flex items-start space-x-4">
                          <div
                            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                              isActive
                                ? 'bg-[#009543] text-white'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>

                          <div className="flex-1 pt-2">
                            <h5
                              className={`font-medium ${
                                isActive ? 'text-gray-900' : 'text-gray-500'
                              }`}
                            >
                              {t(status.key)}
                            </h5>
                            {isActive && idx === currentIndex && (
                              <p className="text-sm text-gray-600 mt-1">
                                <Clock className="w-4 h-4 inline mr-1" />
                                En cours
                              </p>
                            )}
                          </div>

                          {isActive && (
                            <CheckCircle className="w-5 h-5 text-[#009543] flex-shrink-0 mt-2" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 bg-[#FBDE4A] bg-opacity-20 p-4 rounded-lg">
                  <p className="text-sm text-center">
                    <strong>{t('estimated_delivery')}:</strong>{' '}
                    {selectedOrder.next_shipment_date
                      ? new Date(selectedOrder.next_shipment_date).toLocaleDateString()
                      : 'À déterminer'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border-2 hover:border-[#009543] rounded-lg p-4 cursor-pointer transition"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Package className="w-5 h-5 text-[#009543]" />
                      <div>
                        <h3 className="font-bold text-gray-900">{order.order_number}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#009543]">
                        {order.total_amount.toFixed(2)} €
                      </p>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(
                          order.payment_status
                        )}`}
                      >
                        {getPaymentStatusText(order.payment_status, order.payment_option)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{order.items.length} article(s)</span>
                    <span>•</span>
                    <span>{t(order.order_status)}</span>
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
