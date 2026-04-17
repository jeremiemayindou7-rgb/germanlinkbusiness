import React, { useState, useEffect } from 'react';
import { X, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AGBLanguage = 'de' | 'fr' | 'ln';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
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
  const [agbLanguage, setAgbLanguage] = useState<AGBLanguage>('de');

  useEffect(() => {
    const savedLang = localStorage.getItem('agb_lang') as AGBLanguage;
    if (savedLang && ['de', 'fr', 'ln'].includes(savedLang)) {
      setAgbLanguage(savedLang);
    }
  }, []);

  const agbTexts = {
    de: {
      checkbox: 'Ich habe die AGB gelesen und stimme diesen zu.*',
      error: 'Bitte stimmen Sie den AGB zu, um fortzufahren.'
    },
    fr: {
      checkbox: 'J\'ai lu et j\'accepte les CGV.*',
      error: 'Veuillez accepter les CGV pour continuer.'
    },
    ln: {
      checkbox: 'Natanga mpe nasangisi na Mibeko oyo.*',
      error: 'Sangisa na Mibeko liboso ya kotindela commande.'
    }
  };

  const shippingCost = 50;
  const subtotal = cartTotal;
  const total = subtotal + shippingCost;
  const amountToPay = paymentOption === 'deposit' ? total * 0.5 : total;

  const handlePayment = async () => {
    if (!user || cartItems.length === 0) return;

    // Validation: AGB must be accepted
    if (!agbAccepted) {
      setAgbError(true);
      return;
    }

    // Validation: customer_phone is required for uba_congo
    if (paymentMethod === 'uba_congo' && !customerPhone.trim()) {
      alert('Telefonnummer ist erforderlich für UBA Congo Zahlung / Numéro de téléphone requis');
      return;
    }

    setLoading(true);
    setAgbError(false);

    try {
      const orderNum = `CEE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const orderItems = cartItems.map(item => ({
        product_id: item.product_id,
        product_name: item.product?.name || '',
        quantity: item.quantity,
        price: item.product?.sale_price || 0,
      }));

      const { data: newOrder, error } = await supabase.from('orders').insert({
        order_number: orderNum,
        user_id: user.id,
        items: orderItems,
        subtotal,
        shipping_cost: shippingCost,
        total_amount: total,
        payment_option: paymentOption,
        payment_method: paymentMethod,
        customer_phone: paymentMethod === 'uba_congo' ? customerPhone : null,
        payment_status: 'pending',
        order_status: 'pending',
        next_shipment_date: '2026-02-15',
        agb_accepted: true,
        agb_accepted_at: new Date().toISOString(),
      }).select().single();

      if (error) throw error;

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            orderId: newOrder.id,
            type: 'order_confirmation'
          })
        });

        if (!emailResponse.ok) {
          console.error('Failed to send order confirmation email');
        }
      } catch (emailError) {
        console.error('Email service error:', emailError);
      }

      setOrderNumber(orderNum);
      setOrderCompleted(true);
      await clearCart();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Une erreur est survenue lors de la création de la commande');
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
        <div className="bg-white border-b p-4 flex items-center justify-between rounded-t-lg flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">
            {orderCompleted ? '✓ Commande confirmée' : t('checkout')}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {orderCompleted ? (
            <div className="space-y-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-900 mb-2">
                  Commande enregistrée !
                </h3>
                <p className="text-green-700 mb-4">
                  Votre commande a été créée avec succès
                </p>
                <div className="bg-white rounded-lg p-4 inline-block">
                  <p className="text-sm text-gray-600 mb-1">{t('order_reference')}</p>
                  <p className="text-2xl font-bold text-gray-900">{orderNumber}</p>
                </div>
              </div>

              {paymentMethod === 'lemfi' ? (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-900 mb-3 flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>Instructions de paiement LemFi</span>
                  </h4>
                  <div className="space-y-2 text-sm text-yellow-900 bg-white rounded p-3">
                    <p>
                      <strong>Montant à payer:</strong> {amountToPay.toFixed(2)} €
                    </p>
                    <p>
                      <strong>Destinataire:</strong> GermanLink Business GmbH
                    </p>
                    <p>
                      <strong>IBAN:</strong> DE89 3704 0044 0532 0130 00
                    </p>
                    <p className="text-red-700 font-bold">
                      <strong>Référence OBLIGATOIRE:</strong> {orderNumber}
                    </p>
                    <p className="pt-2 border-t border-yellow-200 text-xs">
                      Un email avec toutes les instructions détaillées vous a été envoyé.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>Agent UBA Bank (Congo)</span>
                  </h4>
                  <div className="space-y-3 text-sm text-blue-900 bg-white rounded p-4">
                    <p className="text-base">
                      <strong>Ihre Bestellnummer:</strong> {orderNumber}
                    </p>
                    <div className="border-t border-blue-200 pt-3">
                      <p className="mb-2">
                        Ein Agent wird Sie innerhalb von <strong>24 Stunden</strong> unter
                        <strong className="block mt-1 text-lg">{customerPhone}</strong> kontaktieren.
                      </p>
                      <p className="text-xs text-blue-700 mt-3">
                        Gemeinsam gehen Sie zur UBA Bank und zahlen mit dieser Referenz: <strong>{orderNumber}</strong>
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Empfänger: <strong>GermanLink Business GmbH</strong>
                      </p>
                    </div>
                    <p className="pt-2 border-t border-blue-200 text-xs">
                      Un email avec toutes les instructions détaillées vous a été envoyé.
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>{t('next_shipment')}:</strong> 15/02/2026
                </p>
                <p className="text-yellow-700 text-xs mt-1">
                  Votre commande sera expédiée lors du prochain envoi mensuel
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 bg-[#009543] hover:bg-[#007a36] text-white rounded-lg font-medium transition"
              >
                Fermer
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-bold mb-1">{t('demo_mode')}</p>
                  <p>Cette plateforme est en mode démonstration. Aucun paiement réel ne sera effectué.</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-gray-900">{t('payment_options')}</h3>

                <label className="flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="payment"
                    value="full"
                    checked={paymentOption === 'full'}
                    onChange={() => setPaymentOption('full')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{t('full_payment')}</div>
                    <div className="text-sm text-gray-600">
                      Payer {total.toFixed(2)} € maintenant
                    </div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="payment"
                    value="deposit"
                    checked={paymentOption === 'deposit'}
                    onChange={() => setPaymentOption('deposit')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{t('deposit_50')}</div>
                    <div className="text-sm text-gray-600">
                      Payer {(total * 0.5).toFixed(2)} € maintenant, le reste à la livraison
                    </div>
                  </div>
                </label>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-gray-900">Zahlungsmethode / Méthode de paiement</h3>

                <label className="flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="lemfi"
                    checked={paymentMethod === 'lemfi'}
                    onChange={() => setPaymentMethod('lemfi')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Banküberweisung via LemFi</div>
                    <div className="text-sm text-gray-600">
                      Virement bancaire international / Bank transfer
                    </div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="uba_congo"
                    checked={paymentMethod === 'uba_congo'}
                    onChange={() => setPaymentMethod('uba_congo')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Agent + UBA Bank (Congo)</div>
                    <div className="text-sm text-gray-600">
                      Un agent vous accompagne à la banque
                    </div>
                  </div>
                </label>

                {paymentMethod === 'uba_congo' && (
                  <div className="ml-9 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="block">
                      <span className="text-sm font-medium text-gray-900 mb-2 block">
                        Ihre Telefonnummer / Votre numéro de téléphone *
                      </span>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+243 XXX XXX XXX"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>{t('subtotal')}</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t('shipping')}</span>
                  <span>{shippingCost.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                  <span>{t('total')}</span>
                  <span className="text-[#009543]">{total.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-[#DC241F] pt-2 border-t-2 border-[#DC241F]">
                  <span>À payer maintenant</span>
                  <span>{amountToPay.toFixed(2)} €</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 border-2 rounded-lg" style={{ marginTop: '16px' }}>
                  <input
                    type="checkbox"
                    id="agb-checkbox"
                    checked={agbAccepted}
                    onChange={(e) => {
                      setAgbAccepted(e.target.checked);
                      setAgbError(false);
                    }}
                    className="mt-1 w-4 h-4 text-[#009543] border-gray-300 rounded focus:ring-[#009543]"
                  />
                  <label htmlFor="agb-checkbox" className="flex-1 text-sm text-gray-700">
                    {agbLanguage === 'de' && <>Ich habe die </>}
                    {agbLanguage === 'fr' && <>J'ai lu et j'accepte les </>}
                    {agbLanguage === 'ln' && <>Natanga mpe nasangisi na </>}
                    <a
                      href="/agb"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#009543] hover:text-[#007a36] underline font-medium"
                    >
                      {agbLanguage === 'de' && 'AGB'}
                      {agbLanguage === 'fr' && 'CGV'}
                      {agbLanguage === 'ln' && 'Mibeko oyo'}
                    </a>
                    {agbLanguage === 'de' && <> gelesen und stimme diesen zu.*</>}
                    {agbLanguage === 'fr' && <>.*</>}
                    {agbLanguage === 'ln' && <>.*</>}
                  </label>
                </div>

                {agbError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">
                      {agbTexts[agbLanguage].error}
                    </p>
                  </div>
                )}

                {paymentMethod === 'lemfi' && (
                  <>
                    <div className="flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                      <CreditCard className="w-8 h-8 text-white" />
                      <span className="text-2xl font-bold text-white">LemFi</span>
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={loading || !agbAccepted}
                      className="w-full py-4 bg-[#009543] hover:bg-[#007a36] text-white rounded-lg font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Traitement...' : t('pay_with_lemfi')}
                    </button>

                    <a
                      href="https://lemfi.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center py-3 border-2 border-gray-300 hover:border-gray-400 rounded-lg font-medium transition"
                    >
                      {t('register_lemfi')} →
                    </a>
                  </>
                )}

                {paymentMethod === 'uba_congo' && (
                  <button
                    onClick={handlePayment}
                    disabled={loading || !agbAccepted}
                    className="w-full py-4 bg-[#009543] hover:bg-[#007a36] text-white rounded-lg font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Traitement...' : 'Bestellung absenden (Agent Zahlung)'}
                  </button>
                )}
              </div>

              <div className="bg-[#FBDE4A] bg-opacity-20 p-4 rounded-lg text-center">
                <p className="text-sm">
                  <span className="font-bold">{t('next_shipment')}:</span> 15/02/2026
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
