import React, { useState, useEffect } from 'react';
import { Filter, Download, Eye, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  items: any[];
  total_amount: number;
  payment_option: string;
  payment_status: string;
  order_status: string;
  container_id: string | null;
  created_at: string;
  payment_method: string;
  customer_phone: string | null;
  profiles?: {
    name: string;
    phone: string;
    whatsapp_number: string;
    delivery_address: string;
  };
}

export const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, paymentFilter, paymentMethodFilter]);

  const fetchOrders = async () => {
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('[OrderManagement] Orders query error:', ordersError);
      setOrders([]);
      return;
    }

    if (!ordersData || ordersData.length === 0) {
      setOrders([]);
      return;
    }

    const userIds = [...new Set(ordersData.map(o => o.user_id))];

    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, phone, whatsapp_number, delivery_address')
      .in('id', userIds);

    if (profilesError) {
      console.error('[OrderManagement] Profiles query error:', profilesError);
    }

    const profilesMap = new Map(
      (profilesData || []).map(p => [p.id, {
        name: p.name,
        phone: p.phone,
        whatsapp_number: p.whatsapp_number,
        delivery_address: p.delivery_address
      }])
    );

    const enrichedOrders = ordersData.map(order => ({
      ...order,
      profiles: profilesMap.get(order.user_id) || {
        name: 'N/A',
        phone: '',
        whatsapp_number: '',
        delivery_address: ''
      }
    }));

    setOrders(enrichedOrders);
  };

  const filterOrders = () => {
    let filtered = [...orders];
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.order_status === statusFilter);
    }
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(o => o.payment_status === paymentFilter);
    }
    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter(o => o.payment_method === paymentMethodFilter);
    }
    setFilteredOrders(filtered);
  };

  const exportCSV = () => {
    const csv = [
      ['Numéro', 'Client', 'Date', 'Montant', 'Statut', 'Paiement'].join(','),
      ...filteredOrders.map(o => [
        o.order_number,
        o.profiles?.name || '',
        new Date(o.created_at).toLocaleDateString(),
        o.total_amount.toFixed(2),
        o.order_status,
        o.payment_status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Commandes</h2>
        <button
          onClick={exportCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-[#009543] text-white rounded-lg hover:bg-[#007a36]"
        >
          <Download className="w-5 h-5" />
          <span>Exporter CSV</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 flex space-x-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="processing">En traitement</option>
          <option value="shipped">Expédié</option>
          <option value="delivered">Livré</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">Tous les paiements</option>
          <option value="paid">Payé</option>
          <option value="partial">Acompte</option>
          <option value="pending">En attente</option>
          <option value="agent_contacted">Agent contacté</option>
        </select>

        <select
          value={paymentMethodFilter}
          onChange={(e) => setPaymentMethodFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">Alle Methoden</option>
          <option value="lemfi">LemFi</option>
          <option value="uba_congo">UBA Congo</option>
        </select>

        <div className="flex-1 text-right text-sm text-gray-600">
          {filteredOrders.length} commande(s)
        </div>
      </div>

      {selectedOrder ? (
        <div className="bg-white rounded-lg shadow p-6">
          <button onClick={() => setSelectedOrder(null)} className="text-[#009543] hover:underline mb-4">
            ← Retour
          </button>
          <h3 className="text-2xl font-bold mb-4">{selectedOrder.order_number}</h3>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-bold mb-2">Client</h4>
              <p>Nom: {selectedOrder.profiles?.name}</p>
              <p>Tél: {selectedOrder.profiles?.phone}</p>
              <p>WhatsApp: {selectedOrder.profiles?.whatsapp_number}</p>
              <p>Adresse: {selectedOrder.profiles?.delivery_address}</p>
              {selectedOrder.payment_method === 'uba_congo' && selectedOrder.customer_phone && (
                <p className="mt-2 pt-2 border-t border-gray-200">
                  <strong>Kundentelefon (UBA):</strong>{' '}
                  <a href={`tel:${selectedOrder.customer_phone}`} className="text-blue-600 hover:underline">
                    {selectedOrder.customer_phone}
                  </a>
                </p>
              )}
            </div>
            <div>
              <h4 className="font-bold mb-2">Commande</h4>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm mb-1">
                  <span>{item.product_name} x {item.quantity}</span>
                  <span>{(item.price * item.quantity).toFixed(2)} €</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 font-bold">
                Total: {selectedOrder.total_amount.toFixed(2)} €
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut de Paiement
              </label>
              <select
                value={selectedOrder.payment_status}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  const oldStatus = selectedOrder.payment_status;

                  const { error } = await supabase
                    .from('orders')
                    .update({
                      payment_status: newStatus,
                      payment_confirmed_at: newStatus === 'paid' ? new Date().toISOString() : undefined
                    })
                    .eq('id', selectedOrder.id);

                  if (error) {
                    alert('Erreur lors de la mise à jour du statut de paiement');
                    console.error(error);
                    return;
                  }

                  let emailType = null;
                  if (oldStatus !== 'paid' && newStatus === 'paid') {
                    emailType = 'payment_confirmed';
                  } else if (oldStatus !== 'agent_contacted' && newStatus === 'agent_contacted') {
                    emailType = 'agent_dispatched';
                  }

                  if (emailType) {
                    try {
                      const { data: { user } } = await supabase.auth.getUser(selectedOrder.user_id);
                      const email = user?.email;

                      if (email) {
                        const emailResponse = await fetch(
                          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-email`,
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                            },
                            body: JSON.stringify({
                              orderId: selectedOrder.id,
                              type: emailType,
                            }),
                          }
                        );

                        if (!emailResponse.ok) {
                          console.error('Erreur lors de l\'envoi de l\'email');
                        } else {
                          await supabase
                            .from('orders')
                            .update({ email_sent: true })
                            .eq('id', selectedOrder.id);
                          alert('Statut mis à jour et email envoyé au client!');
                        }
                      }
                    } catch (emailError) {
                      console.error('Email error:', emailError);
                      alert('Statut mis à jour, mais erreur lors de l\'envoi de l\'email');
                    }
                  } else {
                    alert('Statut de paiement mis à jour avec succès!');
                  }

                  setSelectedOrder({ ...selectedOrder, payment_status: newStatus });
                  await fetchOrders();
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009543] focus:border-transparent"
              >
                <option value="pending">En attente</option>
                {selectedOrder.payment_method === 'uba_congo' && (
                  <option value="agent_contacted">Agent contacté</option>
                )}
                <option value="partial">Acompte (50%)</option>
                <option value="paid">Payé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut de Commande
              </label>
              <select
                value={selectedOrder.order_status}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  const oldStatus = selectedOrder.order_status;

                  const { error } = await supabase
                    .from('orders')
                    .update({ order_status: newStatus })
                    .eq('id', selectedOrder.id);

                  if (error) {
                    alert('Erreur lors de la mise à jour du statut de commande');
                    console.error(error);
                    return;
                  }

                  let emailType = null;
                  if (oldStatus !== 'shipped' && newStatus === 'shipped') {
                    emailType = 'order_shipped';
                  } else if (oldStatus !== 'delivered' && newStatus === 'delivered') {
                    emailType = 'order_delivered';
                  }

                  if (emailType) {
                    try {
                      const { data: { user } } = await supabase.auth.getUser(selectedOrder.user_id);
                      const email = user?.email;

                      if (email) {
                        const emailResponse = await fetch(
                          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-email`,
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                            },
                            body: JSON.stringify({
                              orderId: selectedOrder.id,
                              type: emailType,
                            }),
                          }
                        );

                        if (emailResponse.ok) {
                          alert('Statut mis à jour et email envoyé au client!');
                        } else {
                          console.error('Erreur lors de l\'envoi de l\'email');
                          alert('Statut mis à jour, mais erreur lors de l\'envoi de l\'email');
                        }
                      }
                    } catch (emailError) {
                      console.error('Email error:', emailError);
                      alert('Statut mis à jour, mais erreur lors de l\'envoi de l\'email');
                    }
                  } else {
                    alert('Statut de commande mis à jour avec succès!');
                  }

                  setSelectedOrder({ ...selectedOrder, order_status: newStatus });
                  await fetchOrders();
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009543] focus:border-transparent"
              >
                <option value="pending">En attente</option>
                <option value="processing">En traitement</option>
                <option value="shipped">Expédié</option>
                <option value="delivered">Livré</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-2">💡 Instruction:</h4>
            <p className="text-sm text-blue-800">
              Lorsque vous changez le statut de paiement de <strong>"pending"</strong> vers <strong>"paid"</strong>,
              un email de confirmation sera automatiquement envoyé au client.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zahlungsmethode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paiement</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{order.order_number}</td>
                  <td className="px-6 py-4 text-sm">{order.profiles?.name}</td>
                  <td className="px-6 py-4 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-medium text-[#009543]">{order.total_amount.toFixed(2)} €</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      order.payment_method === 'uba_congo' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.payment_method === 'uba_congo' ? 'UBA Congo' : 'LemFi'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                      order.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      order.payment_status === 'agent_contacted' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
