import React, { useState, useEffect } from 'react';
import { Plus, Package, Eye, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { SellerProductForm } from './SellerProductForm';

export const SellerDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [application, setApplication] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

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
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      setProducts(prods || []);
    }

    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm(t('confirm_delete'))) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(p => p.filter(x => x.id !== id));
  };

  if (loading) return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#0A5EB0] border-t-transparent"/>
    </div>
  );

  // Status-Ansichten
  if (!application) return (
    <div className="text-center py-16 text-gray-500">
      <Package className="w-12 h-12 mx-auto mb-3 opacity-30"/>
      <p>{t('seller_no_application')}</p>
    </div>
  );

  if (application.status === 'pending') return (
    <div className="max-w-md mx-auto text-center py-16">
      <Clock className="w-14 h-14 text-[#F4B400] mx-auto mb-4"/>
      <h2 className="text-xl font-bold text-[#1C1C1C] mb-2">{t('seller_pending_title')}</h2>
      <p className="text-gray-500">{t('seller_pending_desc')}</p>
    </div>
  );

  if (application.status === 'rejected') return (
    <div className="max-w-md mx-auto text-center py-16">
      <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4"/>
      <h2 className="text-xl font-bold text-[#1C1C1C] mb-2">{t('seller_rejected_title')}</h2>
      <p className="text-gray-500">{t('seller_rejected_desc')}</p>
    </div>
  );

  // Approved Seller Dashboard
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-[#E5E5E5] shadow-sm">
          <p className="text-sm text-gray-500">{t('products')}</p>
          <p className="text-3xl font-bold text-[#0A5EB0]">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E5E5E5] shadow-sm">
          <p className="text-sm text-gray-500">Status</p>
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle className="w-5 h-5 text-green-500"/>
            <span className="font-bold text-green-600">{t('seller_approved_badge')}</span>
          </div>
        </div>
      </div>

      {/* Produkt-Liste */}
      <div className="space-y-3">
        {products.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30"/>
            <p>{t('seller_no_products')}</p>
          </div>
        ) : products.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-[#E5E5E5] p-4 flex gap-4 items-center shadow-sm">
            <img
              src={p.image_url || '/glblogo.png'}
              alt={p.name}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              onError={e => (e.currentTarget.src = '/glblogo.png')}
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#1C1C1C] truncate">{p.name}</p>
              <p className="text-[#0A5EB0] font-bold">{p.sale_price?.toFixed(2)} €</p>
              <p className="text-xs text-gray-400">{p.category}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => deleteProduct(p.id)}
                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4"/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <SellerProductForm
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchData(); }}
        />
      )}
    </div>
  );
};