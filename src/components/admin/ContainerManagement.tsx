import React, { useState, useEffect } from 'react';
import { Plus, Ship, Calendar, Package, TrendingUp, X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Container {
  id: string;
  name: string;
  shipping_date: string;
  max_capacity: number;
  status: string;
  created_at: string;
  orderCount?: number;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  created_at: string;
  container_id: string | null;
  profiles?: {
    name: string;
  };
}

export const ContainerManagement: React.FC = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    shipping_date: '',
    max_capacity: 50,
    status: 'planning',
  });

  useEffect(() => {
    fetchContainers();
    fetchOrders();
  }, []);

  const fetchContainers = async () => {
    try {
      const { data, error } = await supabase
        .from('containers')
        .select('*')
        .order('shipping_date', { ascending: false });

      if (error) throw error;

      const containersWithCounts = await Promise.all(
        (data || []).map(async (container) => {
          const { count } = await supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('container_id', container.id);

          return {
            ...container,
            orderCount: count || 0,
          };
        })
      );

      setContainers(containersWithCounts);
    } catch (error) {
      console.error('Error fetching containers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('[ContainerManagement] Orders query error:', ordersError);
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
        .select('id, name')
        .in('id', userIds);

      if (profilesError) {
        console.error('[ContainerManagement] Profiles query error:', profilesError);
      }

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, p.name])
      );

      const enrichedOrders = ordersData.map(order => ({
        ...order,
        profiles: { name: profilesMap.get(order.user_id) || 'N/A' }
      }));

      setOrders(enrichedOrders);
    } catch (error) {
      console.error('[ContainerManagement] Unexpected error fetching orders:', error);
      setOrders([]);
    }
  };

  const handleCreateContainer = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('containers')
        .insert(formData);

      if (error) throw error;

      setShowNewForm(false);
      setFormData({
        name: '',
        shipping_date: '',
        max_capacity: 50,
        status: 'planning',
      });
      fetchContainers();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const assignOrderToContainer = async (orderId: string, containerId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ container_id: containerId })
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders();
      fetchContainers();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const updateContainerStatus = async (containerId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('containers')
        .update({ status: newStatus })
        .eq('id', containerId);

      if (error) throw error;

      const { data: orders } = await supabase
        .from('orders')
        .select('user_id, order_number')
        .eq('container_id', containerId);

      if (orders) {
        for (const order of orders) {
          await supabase.from('notifications').insert({
            user_id: order.user_id,
            type: 'order_status',
            title: 'Mise à jour container',
            message: `Votre commande ${order.order_number} est maintenant ${
              newStatus === 'shipped' ? 'en route' : 'arrivée'
            } vers Brazzaville!`,
            channels: { whatsapp: true, sms: false },
          });
        }
      }

      fetchContainers();
      if (selectedContainer?.id === containerId) {
        setSelectedContainer({ ...selectedContainer, status: newStatus });
      }
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  const containerOrders = orders.filter(o => o.container_id === selectedContainer?.id);
  const unassignedOrders = orders.filter(o => !o.container_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#009543] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Containers</h2>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-[#009543] hover:bg-[#007a36] text-white rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Container</span>
        </button>
      </div>

      {showNewForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Créer un nouveau container</h3>
            <button
              onClick={() => setShowNewForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateContainer} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du container *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Container Janvier 2026"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#009543]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'envoi *
                </label>
                <input
                  type="date"
                  required
                  value={formData.shipping_date}
                  onChange={(e) => setFormData({ ...formData, shipping_date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#009543]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacité maximale *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.max_capacity}
                  onChange={(e) => setFormData({ ...formData, max_capacity: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#009543]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#009543]"
                >
                  <option value="planning">En planification</option>
                  <option value="shipped">Expédié</option>
                  <option value="arrived">Arrivé</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center space-x-2 py-2 bg-[#009543] hover:bg-[#007a36] text-white rounded-lg transition"
              >
                <Save className="w-5 h-5" />
                <span>Créer</span>
              </button>
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedContainer ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex items-center justify-between">
            <div>
              <button
                onClick={() => setSelectedContainer(null)}
                className="text-[#009543] hover:underline mb-2"
              >
                ← Retour aux containers
              </button>
              <h3 className="text-2xl font-bold text-gray-900">{selectedContainer.name}</h3>
              <p className="text-gray-600">
                Date d'envoi: {new Date(selectedContainer.shipping_date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#009543]">
                {selectedContainer.orderCount} / {selectedContainer.max_capacity}
              </div>
              <p className="text-sm text-gray-600">Commandes</p>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Changer le statut du container
              </label>
              <select
                value={selectedContainer.status}
                onChange={(e) => updateContainerStatus(selectedContainer.id, e.target.value)}
                className="w-full max-w-xs px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#009543]"
              >
                <option value="planning">En planification</option>
                <option value="shipped">Expédié</option>
                <option value="arrived">Arrivé</option>
              </select>
            </div>

            <h4 className="font-bold text-lg mb-4">Commandes assignées ({containerOrders.length})</h4>
            <div className="space-y-2 mb-6">
              {containerOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune commande assignée</p>
              ) : (
                containerOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-gray-600">{order.profiles?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#009543]">{order.total_amount.toFixed(2)} €</p>
                      <button
                        onClick={() => assignOrderToContainer(order.id, '')}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <h4 className="font-bold text-lg mb-4">
              Commandes non assignées ({unassignedOrders.length})
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {unassignedOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Toutes les commandes sont assignées</p>
              ) : (
                unassignedOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg hover:border-[#009543] transition">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-gray-600">{order.profiles?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{order.total_amount.toFixed(2)} €</p>
                      <button
                        onClick={() => assignOrderToContainer(order.id, selectedContainer.id)}
                        disabled={selectedContainer.orderCount! >= selectedContainer.max_capacity}
                        className="text-xs text-[#009543] hover:underline disabled:text-gray-400 disabled:no-underline"
                      >
                        Assigner
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {containers.map((container) => {
            const fillPercentage = (container.orderCount! / container.max_capacity) * 100;
            const statusColors = {
              planning: 'bg-blue-100 text-blue-800',
              shipped: 'bg-orange-100 text-orange-800',
              arrived: 'bg-green-100 text-green-800',
            };

            return (
              <div
                key={container.id}
                onClick={() => setSelectedContainer(container)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Ship className="w-10 h-10 text-[#009543]" />
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[container.status as keyof typeof statusColors]}`}>
                      {container.status === 'planning' ? 'En planification' :
                       container.status === 'shipped' ? 'Expédié' : 'Arrivé'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{container.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(container.shipping_date).toLocaleDateString()}</span>
                  </div>

                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Capacité</span>
                      <span className="font-medium">
                        {container.orderCount} / {container.max_capacity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#009543] h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 mt-4">
                    {fillPercentage >= 100 ? (
                      <span className="text-red-600 font-medium">Plein</span>
                    ) : fillPercentage >= 80 ? (
                      <span className="text-orange-600 font-medium">Presque plein</span>
                    ) : (
                      <span>{Math.round(100 - fillPercentage)}% disponible</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
