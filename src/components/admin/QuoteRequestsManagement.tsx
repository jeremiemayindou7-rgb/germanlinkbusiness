import React, { useState, useEffect } from 'react';
import { Eye, FileText, Phone, MapPin, MessageCircle, Euro } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface QuoteRequest {
  id: string;
  product_id: string;
  customer_name: string;
  customer_phone: string;
  customer_location: string | null;
  message: string | null;
  price_proposal: number | null;
  status: 'pending' | 'reviewing' | 'offer_sent' | 'accepted' | 'rejected';
  admin_notes: string | null;
  offer_amount: number | null;
  created_at: string;
  product?: {
    name: string;
    ebay_url: string | null;
    image_url: string | null;
  };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Neu',             color: 'bg-red-100 text-red-800' },
  reviewing:  { label: 'In Prüfung',      color: 'bg-yellow-100 text-yellow-800' },
  offer_sent: { label: 'Angebot gesendet', color: 'bg-blue-100 text-blue-800' },
  accepted:   { label: 'Akzeptiert',       color: 'bg-green-100 text-green-800' },
  rejected:   { label: 'Abgelehnt',        color: 'bg-gray-100 text-gray-600' },
};

export const QuoteRequestsManagement: React.FC = () => {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [filtered, setFiltered] = useState<QuoteRequest[]>([]);
  const [selected, setSelected] = useState<QuoteRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [offerAmount, setOfferAmount] = useState('');

  useEffect(() => { fetchRequests(); }, []);

  useEffect(() => {
    setFiltered(
      statusFilter === 'all'
        ? requests
        : requests.filter(r => r.status === statusFilter)
    );
  }, [requests, statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select(`
          *,
          product:products(name, ebay_url, image_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching quote requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRequest = (req: QuoteRequest) => {
    setSelected(req);
    setAdminNotes(req.admin_notes || '');
    setOfferAmount(req.offer_amount?.toString() || '');
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selected) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({
          status: newStatus,
          admin_notes: adminNotes || null,
          offer_amount: offerAmount ? parseFloat(offerAmount) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selected.id);

      if (error) throw error;

      // ── Option A: WhatsApp automatisch öffnen bei "Angebot gesendet" ──
      if (newStatus === 'offer_sent' && offerAmount) {
        const productName = selected.product?.name || 'das Produkt';
        const phone = selected.customer_phone.replace(/\D/g, '');
        const message = encodeURIComponent(
          `Bonjour ${selected.customer_name} 👋\n\n` +
          `Voici notre offre pour *${productName}*:\n\n` +
          `💰 *Prix total: ${parseFloat(offerAmount).toFixed(2)} €*\n` +
          `(inkl. Transport & Verzollung bis Kinshasa/Brazzaville)\n\n` +
          `Pour confirmer votre commande, veuillez effectuer le paiement via UBA.\n\n` +
          `Merci de votre confiance 🙏\n` +
          `— GermanLink Business`
        );
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
      }

      await fetchRequests();
      setSelected(prev => prev
        ? { ...prev, status: newStatus as any, admin_notes: adminNotes, offer_amount: offerAmount ? parseFloat(offerAmount) : null }
        : null
      );
    } catch (err: any) {
      alert('Fehler: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#009543] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">eBay Anfragen</h2>
          <p className="text-sm text-gray-500 mt-1">
            Kundenanfragen für verlinkte eBay-Produkte
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-full text-sm">
            {pendingCount} neue Anfrage{pendingCount > 1 ? 'n' : ''}
          </span>
        )}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-3 items-center">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm">
          <option value="all">Alle Status</option>
          <option value="pending">Neu</option>
          <option value="reviewing">In Prüfung</option>
          <option value="offer_sent">Angebot gesendet</option>
          <option value="accepted">Akzeptiert</option>
          <option value="rejected">Abgelehnt</option>
        </select>
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} Anfrage(n)</span>
      </div>

      {selected ? (
        // ── DETAIL-ANSICHT ──
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <button onClick={() => setSelected(null)} className="text-[#009543] hover:underline flex items-center gap-1 text-sm">
            ← Zurück zur Liste
          </button>

          {/* Produkt Info */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border">
            {selected.product?.image_url && (
              <img src={selected.product.image_url} alt="" className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">eBay Produkt</span>
              </div>
              <h3 className="font-bold text-lg text-[#1C1C1C]">{selected.product?.name || 'Unbekanntes Produkt'}</h3>
              {selected.product?.ebay_url && (
                <a href={selected.product.ebay_url} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline">
                  eBay Link öffnen →
                </a>
              )}
            </div>
            <span className={`self-start px-3 py-1 rounded-full text-xs font-bold ${STATUS_LABELS[selected.status]?.color}`}>
              {STATUS_LABELS[selected.status]?.label}
            </span>
          </div>

          {/* Kundeninfos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-bold text-[#1C1C1C]">Kundeninfos</h4>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium w-24 text-gray-500">Name:</span>
                <span className="font-bold">{selected.customer_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href={`tel:${selected.customer_phone}`} className="text-blue-600 hover:underline font-medium">
                  {selected.customer_phone}
                </a>
                <a href={`https://wa.me/${selected.customer_phone.replace(/\D/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="ml-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full hover:bg-green-600">
                  WhatsApp
                </a>
              </div>
              {selected.customer_location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{selected.customer_location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium w-24 text-gray-500">Eingegangen:</span>
                <span>{new Date(selected.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-[#1C1C1C]">Anfrage-Details</h4>
              {selected.price_proposal && (
                <div className="flex items-center gap-2 text-sm">
                  <Euro className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-500">Preisvorschlag:</span>
                  <span className="font-bold text-green-700">{selected.price_proposal.toFixed(2)} €</span>
                </div>
              )}
              {selected.message && (
                <div>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-500">Nachricht:</span>
                  </div>
                  <p className="text-sm bg-gray-50 border rounded-lg p-3 text-gray-700">{selected.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Admin Aktionen */}
          <div className="border-t pt-6 space-y-4">
            <h4 className="font-bold text-[#1C1C1C]">Admin Aktionen</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Angebot (€) – was GLB dem Kunden berechnet (inkl. Versand/Verzollung):
              </label>
              <input type="number" min="0" step="0.01" value={offerAmount}
                onChange={e => setOfferAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009543]"
                placeholder="z.B. 850.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interne Notizen:
              </label>
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                rows={3} placeholder="z.B. Produkt verfügbar, Abholung 45€, Schiff Feb..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009543] resize-none text-sm"
              />
            </div>

            {/* Status-Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleUpdateStatus('reviewing')} disabled={saving}
                className="py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg font-bold text-sm transition disabled:opacity-50">
                🔍 In Prüfung setzen
              </button>
              <button onClick={() => handleUpdateStatus('offer_sent')} disabled={saving}
                className="py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-bold text-sm transition disabled:opacity-50">
                📤 Angebot gesendet
              </button>
              <button onClick={() => handleUpdateStatus('accepted')} disabled={saving}
                className="py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-sm transition disabled:opacity-50">
                ✅ Akzeptiert
              </button>
              <button onClick={() => handleUpdateStatus('rejected')} disabled={saving}
                className="py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold text-sm transition disabled:opacity-50">
                ❌ Ablehnen
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              💡 Nach dem Angebot: Kontaktiere den Kunden via WhatsApp mit dem Gesamtpreis und UBA-Zahlungsprozess.
            </div>
          </div>
        </div>

      ) : (
        // ── LISTEN-ANSICHT ──
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Keine Anfragen vorhanden</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kunde</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produkt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preisvorschlag</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(req => (
                  <tr key={req.id} className={`hover:bg-gray-50 ${req.status === 'pending' ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(req.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{req.customer_name}</td>
                    <td className="px-6 py-4 text-sm">
                      <a href={`https://wa.me/${req.customer_phone.replace(/\D/g, '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-green-600 hover:underline">
                        {req.customer_phone}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm">{req.product?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-700">
                      {req.price_proposal ? `${req.price_proposal.toFixed(2)} €` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_LABELS[req.status]?.color}`}>
                        {STATUS_LABELS[req.status]?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleSelectRequest(req)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition">
                        <Eye className="w-4 h-4" />
                        Öffnen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

