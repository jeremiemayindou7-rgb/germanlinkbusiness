import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  channels: {
    whatsapp: boolean;
    sms: boolean;
  };
  is_read: boolean;
  created_at: string;
}

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setError(null);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error('[Notifications] Error fetching notifications:', error);
      setError(error?.message || 'Fehler beim Laden der Benachrichtigungen');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_status':
        return '📦';
      case 'payment':
        return '💳';
      default:
        return '🔔';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <Bell className="w-6 h-6 text-[#009543]" />
            <span>{t('notifications')}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={fetchNotifications}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  {t('retry') || 'Erneut versuchen'}
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#009543] border-t-transparent"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">{t('no_notifications')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-2 rounded-lg p-4 transition ${
                    notification.is_read
                      ? 'bg-white border-gray-200'
                      : 'bg-green-50 border-[#009543]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start space-x-3 flex-1">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>
                            {new Date(notification.created_at).toLocaleDateString()}{' '}
                            {new Date(notification.created_at).toLocaleTimeString()}
                          </span>
                          {(notification.channels.whatsapp || notification.channels.sms) && (
                            <>
                              <span>•</span>
                              <span>
                                Envoyé via:{' '}
                                {notification.channels.whatsapp && 'WhatsApp'}
                                {notification.channels.whatsapp &&
                                  notification.channels.sms &&
                                  ', '}
                                {notification.channels.sms && 'SMS'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="flex-shrink-0 ml-2 p-2 hover:bg-white rounded-lg transition"
                        title={t('mark_as_read')}
                      >
                        <CheckCircle className="w-5 h-5 text-[#009543]" />
                      </button>
                    )}
                  </div>

                  {!notification.is_read && (
                    <div className="mt-3 pt-3 border-t border-[#009543]">
                      <p className="text-xs text-[#009543] font-medium">
                        MODE DÉMO: Notification simulée (non envoyée réellement)
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
