import React, { useState, useEffect } from 'react';
import { Users, Eye, X, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp_number: string;
  delivery_address: string;
  created_at: string;
  orderCount?: number;
  totalSpent?: number;
}

export const CustomerManagement: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetchNotes(selectedCustomer.id);
    }
  }, [selectedCustomer]);

  const fetchCustomers = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profiles) {
        const customersWithStats = await Promise.all(
          profiles.map(async (profile) => {
            const { data: orders } = await supabase
              .from('orders')
              .select('total_amount')
              .eq('user_id', profile.id);

            const orderCount = orders?.length || 0;
            const totalSpent = orders?.reduce((sum, o) => sum + o.total_amount, 0) || 0;

            return {
              ...profile,
              orderCount,
              totalSpent,
            };
          })
        );

        setCustomers(customersWithStats);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async (customerId: string) => {
    try {
      const { data } = await supabase
        .from('customer_notes')
        .select('*')
        .eq('user_id', customerId)
        .order('created_at', { ascending: false });

      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedCustomer || !user) return;

    try {
      await supabase.from('customer_notes').insert({
        user_id: selectedCustomer.id,
        note: newNote,
        created_by: user.id,
      });

      setNewNote('');
      fetchNotes(selectedCustomer.id);
    } catch (error) {
      console.error('Error adding note:', error);
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
      <h2 className="text-2xl font-bold">Gestion des Clients</h2>

      {selectedCustomer ? (
        <div className="bg-white rounded-lg shadow p-6">
          <button
            onClick={() => setSelectedCustomer(null)}
            className="text-[#009543] hover:underline mb-4"
          >
            ← Retour
          </button>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-xl font-bold mb-4">{selectedCustomer.name}</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Téléphone:</strong> {selectedCustomer.phone || 'N/A'}</p>
                <p><strong>WhatsApp:</strong> {selectedCustomer.whatsapp_number || 'N/A'}</p>
                <p><strong>Adresse:</strong> {selectedCustomer.delivery_address || 'N/A'}</p>
                <p><strong>Client depuis:</strong> {new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Statistiques</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-[#009543]">{selectedCustomer.orderCount}</p>
                  <p className="text-sm text-gray-600">Commandes</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-[#009543]">
                    {selectedCustomer.totalSpent?.toFixed(2)} €
                  </p>
                  <p className="text-sm text-gray-600">Total dépensé</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-bold mb-4">Notes</h4>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {notes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune note</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">{note.note}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Ajouter une note..."
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <button
                onClick={addNote}
                className="flex items-center space-x-2 px-4 py-2 bg-[#009543] text-white rounded-lg hover:bg-[#007a36]"
              >
                <Plus className="w-5 h-5" />
                <span>Ajouter</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commandes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inscrit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{customer.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {customer.phone || customer.whatsapp_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm">{customer.orderCount}</td>
                  <td className="px-6 py-4 text-sm font-medium text-[#009543]">
                    {customer.totalSpent?.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
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
