import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface UseNotificationSocketProps {
  userId?: string;
  onNewNotification?: (notification: any) => void;
  onUnreadCount?: (count: number) => void;
  onNotificationUpdated?: (notification: any) => void;
  onAllMarkedRead?: () => void;
}

export const useNotificationSocket = ({
  userId,
  onNewNotification,
  onUnreadCount,
  onNotificationUpdated,
  onAllMarkedRead
}: UseNotificationSocketProps = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Connect to notification namespace
    const socket = io(`${SOCKET_URL}/notifications`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Notifications] WebSocket connected');
      setConnected(true);
      setReconnecting(false);
      
      // Authenticate socket
      socket.emit('authenticate', { userId });
    });

    socket.on('disconnect', () => {
      console.log('[Notifications] WebSocket disconnected');
      setConnected(false);
    });

    socket.on('reconnect_attempt', () => {
      console.log('[Notifications] Attempting to reconnect...');
      setReconnecting(true);
    });

    socket.on('reconnect', () => {
      console.log('[Notifications] Reconnected');
      setReconnecting(false);
      socket.emit('authenticate', { userId });
    });

    // Listen for new notifications
    socket.on('new_notification', (notification) => {
      console.log('[Notifications] New notification received:', notification);
      
      // Play notification sound
      playNotificationSound();
      
      // Show browser notification if permission granted
      showBrowserNotification(notification);
      
      if (onNewNotification) {
        onNewNotification(notification);
      }
    });

    // Listen for unread count updates
    socket.on('unread_count', (data) => {
      console.log('[Notifications] Unread count:', data.count);
      if (onUnreadCount) {
        onUnreadCount(data.count);
      }
    });

    // Listen for notification updates (aggregation)
    socket.on('notification_updated', (notification) => {
      console.log('[Notifications] Notification updated:', notification);
      if (onNotificationUpdated) {
        onNotificationUpdated(notification);
      }
    });

    // Listen for all marked as read
    socket.on('all_marked_read', () => {
      console.log('[Notifications] All marked as read');
      if (onAllMarkedRead) {
        onAllMarkedRead();
      }
    });

    return () => {
      console.log('[Notifications] Cleaning up WebSocket');
      socket.disconnect();
    };
  }, [userId, onNewNotification, onUnreadCount, onNotificationUpdated, onAllMarkedRead]);

  const markAsRead = useCallback((notificationId: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('mark_read', { notificationId });
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('mark_all_read');
    }
  }, []);

  return {
    connected,
    reconnecting,
    markAsRead,
    markAllAsRead
  };
};

// Helper function to play notification sound
const playNotificationSound = () => {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(err => {
      console.log('Could not play notification sound:', err);
    });
  } catch (error) {
    console.log('Notification sound not available');
  }
};

// Helper function to show browser notification
const showBrowserNotification = (notification: any) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(notification.title, {
        body: notification.content,
        icon: notification.sender?.profilePicture || '/logo.png',
        badge: '/logo.png',
        tag: notification._id,
        requireInteraction: notification.priority === 'urgent',
        data: {
          url: notification.actionUrl
        }
      });
    } catch (error) {
      console.log('Could not show browser notification:', error);
    }
  }
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
  return Notification.permission === 'granted';
};
