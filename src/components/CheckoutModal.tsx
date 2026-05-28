import React, { useState } from 'react';
import { X, CreditCard, AlertCircle, CheckCircle, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface SingleProduct {
  id: string;
  name: string;
  sale_price: number;
  source_type?: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  // ── NEU: direkter Kauf aus ProductDetail ──
  singleProduct?: SingleProduct;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, singleProduct }) => {
  const { t } = useLanguage();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentOption, setPaymentOption] = useState<'full' | 'deposit'>('full');
  const [paymentMethod, setPaymentMethod] = useState<'lemfi' | 'uba_congo'>('lemfi');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [agbError, setAgbError] = useState(false);

  const shippingCost = 50;

  // Einzel-Produkt oder Warenkorb
  const subtotal = singleProduct
    ? singleProduct.sale_price
    : cartTotal;

  const total = subtotal + shippingCost;
  const amountToPay = paymentOption === 'deposit' ? total * 0.5 : total;

  const handlePayment = async () => {
    if (!user) return;
    if (!agbAccepted) { setAgbError(true); return; }
    if (!customerPhone.trim()) { alert(t('phone_required')); return; }

    setLoading(true);
    setAgbError(false);

    try {
      const orderNum = `CEE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const orderItems = singleProduct
        ? [{ product_id: singleProduct.id, product_name: singleProduct.name, quantity: 1, price: singleProduct.sale_price, source_type: singleProduct.source_type || 'own' }]
        : cartItems.map(item => ({
            product_id: item.product_id,
            product_name: item.product?.name || '',
            quantity: item.quantity,
            price: item.product?.sale_price || 0,
            source_type: (item.product as any)?.source_type || 'own',
          }));

      const { data: newOrder, error } = await supabase.from('orders').insert({
        order_number:     orderNum,
        user_id:          user.id,
        items:            orderItems,
        subtotal,
        shipping_cost:    shippingCost,
        total_amount:     total,
        payment_option:   paymentOption,
        payment_method:   paymentMethod,
        customer_phone:   customerPhone,
        payment_status:   'pending',
        order_status:     'awaiting_payment',
        source_type:      'own',
        next_shipment_date: '2026-02-15',
        agb_accepted:     true,
        agb_accepted_at:  new Date().toISOString(),
      }).select().single();

      if (error) throw error;

      // Email-Bestätigung
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
          body: JSON.stringify({ orderId: newOrder.id, type: 'order_confirmation' })
        });
      } catch (e) { console.error('Email error:', e); }

      setOrderNumber(orderNum);
      setOrderCompleted(true);
      if (!singleProduct) await clearCart();

    } catch (error) {
      console.error('Error creating order:', error);
      alert(t('order_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOrderCompleted(false);
    setOrderNumber('');
    setAgbAccepted(false);
    setAgbError(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between rounded-t-lg flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {orderCompleted ? `✓ ${t('order_confirmed_header')}` : t('checkout')}
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {orderCompleted ? (
            <div className="space-y-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-900 mb-2">{t('order_confirmed_title')}</h3>
                <p className="text-green-700 mb-4">{t('order_confirmed_desc')}</p>
                <div className="bg-white rounded-lg p-4 inline-block">
                  <p className="text-sm text-gray-600 mb-1">{t('order_reference')}</p>
                  <p className="text-2xl font-bold text-gray-900">{orderNumber}</p>
                </div>
              </div>

              {paymentMethod === 'lemfi' && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {t('lemfi_payment_instructions')}
                  </h4>
                  <div className="space-y-2 text-sm text-yellow-900 bg-white rounded p-3">
                    <p><strong>{t('amount_to_pay')}:</strong> {amountToPay.toFixed(2)} €</p>
                    <p><strong>{t('recipient')}:</strong> GermanLink Business GmbH</p>
                    <p><strong>IBAN:</strong> DE89 3704 0044 0532 0130 00</p>
                    <p className="text-red-700 font-bold"><strong>{t('mandatory_reference')}:</strong> {orderNumber}</p>
                    <p className="pt-2 border-t border-yellow-200 text-xs">{t('email_instructions_sent')}</p>
                  </div>
                </div>
              )}

              {paymentMethod === 'uba_congo' && (
                <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    {t('uba_next_steps_title')}
                  </h4>
                  <div className="space-y-3 text-sm text-blue-900 bg-white rounded p-4">
                    {[1,2,3].map(n => (
                      <div key={n}>
                        <div className="flex items-center gap-2 font-bold">
                          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">{n}</span>
                          {t(`uba_step${n}`)}
                        </div>
                        <p className="ml-8 text-gray-600 text-xs mt-0.5">{t(`uba_step${n}_sub`)}</p>
                      </div>
                    ))}
                    <p className="font-mono bg-blue-50 px-3 py-2 rounded border border-blue-200 text-blue-800 font-bold ml-8">{orderNumber}</p>
                    <p className="pt-2 border-t border-blue-200 text-xs text-blue-700">{t('email_instructions_sent')}</p>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm"><strong>{t('next_shipment')}:</strong> 15/02/2026</p>
              </div>

              <button onClick={handleClose} className="w-full py-3 bg-[#009543] text-white rounded-lg font-medium">
                {t('close')}
              </button>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Produkt-Info wenn Direktkauf */}
              {singleProduct && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Produkt</p>
                    <p className="font-bold text-sm text-gray-900 truncate max-w-[280px]">{singleProduct.name}</p>
                  </div>
                  <p className="font-bold text-[#0A5EB0] text-lg">{singleProduct.sale_price.toFixed(2)} €</p>
                </div>
              )}

              {/* Telefon */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <label className="block">
                  <span className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    {t('phone_whatsapp_label')}
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">{t('required_field')}</span>
                  </span>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="+243 XXX XXX XXX oder +242 XXX XXX XXX"
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-blue-600 mt-1">{t('phone_contact_note')}</p>
                </label>
              </div>

              {/* Zahlungsoption */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900">{t('payment_options')}</h3>
                {[
                  { val: 'full',    label: t('full_payment'),  sub: `${t('pay_now_prefix')} ${total.toFixed(2)} € ${t('pay_now_suffix')}` },
                  { val: 'deposit', label: t('deposit_50'),    sub: `${t('pay_now_prefix')} ${(total*0.5).toFixed(2)} € ${t('deposit_rest_note')}` },
                ].map(opt => (
                  <label key={opt.val} className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="payment" value={opt.val}
                      checked={paymentOption === opt.val}
                      onChange={() => setPaymentOption(opt.val as 'full' | 'deposit')}
                      className="mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">{opt.label}</div>
                      <div className="text-sm text-gray-600">{opt.sub}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Zahlungsmethode */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-900">{t('payment_method_title')}</h3>
                {[
                  { val: 'lemfi',     label: t('lemfi_method_name'),  sub: t('lemfi_method_desc') },
                  { val: 'uba_congo', label: t('uba_method_name'),    sub: t('uba_method_desc') },
                ].map(m => (
                  <label key={m.val} className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="paymentMethod" value={m.val}
                      checked={paymentMethod === m.val}
                      onChange={() => setPaymentMethod(m.val as 'lemfi' | 'uba_congo')}
                      className="mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">{m.label}</div>
                      <div className="text-sm text-gray-600">{m.sub}</div>
                    </div>
                  </label>
                ))}
                {paymentMethod === 'uba_congo' && (
                  <div className="ml-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 space-y-1">
                    <p className="font-bold">{t('uba_how_it_works')}</p>
                    {[1,2,3,4].map(n => <p key={n}>{'①②③④'[n-1]} {t(`uba_info_step${n}`)}</p>)}
                  </div>
                )}
              </div>

              {/* Preisübersicht */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>{t('subtotal')}</span><span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t('shipping')}</span><span>{shippingCost.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                  <span>{t('total')}</span><span className="text-[#009543]">{total.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-[#DC241F] pt-2 border-t-2 border-[#DC241F]">
                  <span>{t('to_pay_now')}</span><span>{amountToPay.toFixed(2)} €</span>
                </div>
              </div>

              {/* AGB */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 border-2 rounded-lg">
                  <input type="checkbox" id="agb-checkbox" checked={agbAccepted}
                    onChange={e => { setAgbAccepted(e.target.checked); setAgbError(false); }}
                    className="mt-1 w-4 h-4 text-[#009543] rounded" />
                  <label htmlFor="agb-checkbox" className="flex-1 text-sm text-gray-700">
                    {t('agb_prefix')}
                    <a href="/agb" target="_blank" rel="noopener noreferrer"
                      className="text-[#009543] underline font-medium mx-1">{t('agb_link_text')}</a>
                    {t('agb_suffix')}
                  </label>
                </div>
                {agbError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-800">{t('agb_error')}</p>
                  </div>
                )}

                {paymentMethod === 'lemfi' && (
                  <>
                    <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                      <CreditCard className="w-8 h-8 text-white" />
                      <span className="text-2xl font-bold text-white">LemFi</span>
                    </div>
                    <button onClick={handlePayment}
                      disabled={loading || !agbAccepted || !customerPhone.trim()}
                      className="w-full py-4 bg-[#009543] text-white rounded-lg font-bold text-lg disabled:opacity-50">
                      {loading ? t('processing_btn') : t('pay_with_lemfi')}
                    </button>
                    <a href="https://lemfi.com" target="_blank" rel="noopener noreferrer"
                      className="block text-center py-3 border-2 border-gray-300 rounded-lg font-medium">
                      {t('register_lemfi')} →
                    </a>
                  </>
                )}

                {paymentMethod === 'uba_congo' && (
                  <button onClick={handlePayment}
                    disabled={loading || !agbAccepted || !customerPhone.trim()}
                    className="w-full py-4 bg-[#009543] text-white rounded-lg font-bold text-lg disabled:opacity-50">
                    {loading ? t('processing_btn') : t('uba_submit_btn')}
                  </button>
                )}
              </div>

              <div className="bg-[#FBDE4A] bg-opacity-20 p-4 rounded-lg text-center">
                <p className="text-sm"><span className="font-bold">{t('next_shipment')}:</span> 15/02/2026</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

