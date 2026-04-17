import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../hooks/useCart';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, onCheckout }) => {
  const { t } = useLanguage();
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();

  const shippingCost = 50;
  const total = cartTotal + shippingCost;

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      onCheckout();
      onClose();
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <ShoppingBag className="w-6 h-6" />
              <span>{t('cart')}</span>
              {cartItems.length > 0 && (
                <span className="text-sm text-gray-500">({cartItems.length})</span>
              )}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <ShoppingBag className="w-20 h-20 text-[#E5E5E5] mb-4" />
              <p className="text-gray-600 text-lg mb-4">{t('empty_cart')}</p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-[#F4B400] hover:bg-[#0A5EB0] hover:text-white rounded-lg font-bold transition text-[#1C1C1C]"
              >
                {t('continue_shopping')}
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex space-x-4 bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product?.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#1C1C1C] mb-1 truncate">
                        {item.product?.name}
                      </h3>
                      <p className="text-[#00A86B] font-bold mb-2">
                        {item.product?.sale_price.toFixed(2)} €
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-200 rounded transition"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-200 rounded transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t p-4 space-y-3">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>{t('subtotal')}</span>
                  <span>{cartTotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>{t('shipping')}</span>
                  <span>{shippingCost.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-[#1C1C1C] pt-2 border-t">
                  <span>{t('total')}</span>
                  <span className="text-[#00A86B]">{total.toFixed(2)} €</span>
                </div>

                <div className="bg-[#0099CC] bg-opacity-10 border border-[#0099CC] p-3 rounded-lg text-sm text-center">
                  <span className="font-bold text-[#1C1C1C]">{t('next_shipment')}:</span>{' '}
                  <span className="font-bold text-[#0A5EB0]">15/02/2026</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-[#0A5EB0] hover:bg-[#00A86B] text-white rounded-lg font-bold transition shadow-md hover:shadow-lg"
                >
                  {t('checkout')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
