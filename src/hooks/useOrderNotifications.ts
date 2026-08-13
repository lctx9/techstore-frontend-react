import { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

export const useOrderNotifications = () => {
  const { user, accessToken } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!user || !accessToken) return;

    const email = user.email;
    const stompClient = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(`/topic/orders/${email}`, (message) => {
          try {
            const body = JSON.parse(message.body);
            // Example body: { id: 1, status: "SHIPPED" }
            const statusMsg = `Đơn hàng #DH${body.id} của bạn đã được chuyển trạng thái thành: ${body.status}!`;
            addNotification(statusMsg, 'success');
          } catch {
            addNotification(message.body, 'info');
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [user, accessToken, addNotification]);
};
