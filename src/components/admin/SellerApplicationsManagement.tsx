import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Application {
  id: string;
  user_id: string;
  full_name: string;
  city: string;
  phone: string;
  business_type: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const SellerApplicationsManagement: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('seller_applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setApplications(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdating(id);
    const { error } = await supabase
      .from('seller_applications')
      .update({ status })
      .eq('id', id);
    if (!error) {
      setApplications(prev =>
        prev.map(a => a.id === id ? { ...a, status } : a)
      );
    }
    setUpdating(null);
  };

  const filtered = applications.filter(a =>
    filter === 'all' ? true : a.status === filter
  );

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold"><Clock className="w-3 h-3"/>Ausstehend</span>;
      case 'approved':
        return <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold"><CheckCircle className="w-3 h-3"/>Genehmigt</span>;
      case 'rejected':
        return <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold"><XCircle className="w-3 h-3"/>Abgelehnt</span>;
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#009543] border-t-transparent"/>
    </div>
  );

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`p-4 rounded-xl border-2 text-left transition ${
              filter === s ? 'border-[#009543] bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-2xl font-bold text-[#1C1C1C]">{counts[s]}</p>
            <p className="text-sm text-gray-500 capitalize">{
              s === 'all' ? 'Alle' :
              s === 'pending' ? 'Ausstehend' :
              s === 'approved' ? 'Genehmigt' : 'Abgelehnt'
            }</p>
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30"/>
          <p>Keine Bewerbungen in dieser Kategorie</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(app => (
            <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-[#1C1C1C]">{app.full_name}</h3>
                    {statusBadge(app.status)}
                    <span className="text-xs text-gray-400">
                      {new Date(app.created_at).toLocaleDateString('de-DE')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-400"/>
                      {app.city}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4 text-gray-400"/>
                      {app.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4 text-gray-400"/>
                      {app.business_type === 'private' ? 'Privatperson' : 'Unternehmen'}
                    </div>
                  </div>

                  {app.message && (
                    <p className="mt-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-2 italic">
                      "{app.message}"
                    </p>
                  )}
                </div>

                {/* Aktionen */}
                {app.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(app.id, 'approved')}
                      disabled={updating === app.id}
                      className="flex items-center gap-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4"/>
                      Genehmigen
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, 'rejected')}
                      disabled={updating === app.id}
                      className="flex items-center gap-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4"/>
                      Ablehnen
                    </button>
                  </div>
                )}

                {app.status !== 'pending' && (
                  <button
                    onClick={() => updateStatus(app.id, app.status === 'approved' ? 'rejected' : 'approved')}
                    disabled={updating === app.id}
                    className="text-xs text-gray-400 hover:text-gray-600 underline transition"
                  >
                    Rückgängig
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};