import React from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import { Bell, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-55 space-y-3 w-80 max-w-full font-sans text-xs">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="bg-slate-900 border border-slate-850 text-white rounded-lg p-4 shadow-2xl flex items-start space-x-3 animate-in fade-in slide-in-from-top-5 duration-200"
        >
          <div className="bg-amber-500/15 p-1.5 rounded-md text-amber-400 shrink-0">
            <Bell className="h-4 w-4" />
          </div>
          <div className="flex-grow text-left">
            <h4 className="font-bold text-slate-100">Thông báo đơn hàng</h4>
            <p className="text-slate-300 mt-1 font-medium leading-relaxed">{n.message}</p>
          </div>
          <button
            onClick={() => removeNotification(n.id)}
            className="text-slate-400 hover:text-slate-200 p-0.5 rounded cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
