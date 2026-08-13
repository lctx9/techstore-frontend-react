import { create } from 'zustand';

export interface AppNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warn';
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (message: string, type?: 'info' | 'success' | 'warn') => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (message, type = 'info') => {
    const id = crypto.randomUUID();
    set((state) => ({
      notifications: [...state.notifications, { id, message, type }],
    }));
    // Auto-remove after 6 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, 6000);
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));
