import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * Notification Context for managing real-time notifications
 * Handles notification state, preferences, and WebSocket-like simulation
 */
const NotificationContext = createContext();

/**
 * Notification Provider Component
 * Manages notification state and provides methods for notification operations
 */
export const NotificationProvider = ({ children }) => {
  // ============= STATE MANAGEMENT =============

  /** Array of notification objects */
  const [notifications, setNotifications] = useState([]);

  /** Count of unread notifications */
  const [unreadCount, setUnreadCount] = useState(0);

  /** User's notification preferences */
  const [preferences, setPreferences] = useState({
    likes: true,
    comments: true,
    follows: true,
    messages: true,
    mentions: true,
    pushEnabled: false,
    soundEnabled: true
  });

  /** Loading state for notifications */
  const [isLoading, setIsLoading] = useState(false);

  // ============= MOCK NOTIFICATIONS DATA =============

  /**
   * Mock notifications for demonstration
   * In production, this would come from the backend API
   */
  const mockNotifications = [
    {
      id: '1',
      type: 'like',
      actor: {
        id: 'user1',
        username: 'traveler_adventures',
        profilePicture: 'https://placehold.co/40x40/FF6B6B/FFFFFF?text=TA'
      },
      target: {
        type: 'post',
        id: 'post1',
        content: 'Exploring the hidden gems of nature 🌿'
      },
      content: 'liked your post',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
    },
    {
      id: '2',
      type: 'comment',
      actor: {
        id: 'user2',
        username: 'foodie_delights',
        profilePicture: 'https://placehold.co/40x40/45B7D1/FFFFFF?text=FD'
      },
      target: {
        type: 'post',
        id: 'post2',
        content: 'Just tried the best pasta in town! 🍝'
      },
      content: 'commented: "Looks delicious! Where is this place?"',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
    },
    {
      id: '3',
      type: 'follow',
      actor: {
        id: 'user3',
        username: 'fitness_motivation',
        profilePicture: 'https://placehold.co/40x40/96CEB4/FFFFFF?text=FM'
      },
      target: {
        type: 'user',
        id: 'currentUser'
      },
      content: 'started following you',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
    },
    {
      id: '4',
      type: 'message',
      actor: {
        id: 'user4',
        username: 'friend_one',
        profilePicture: 'https://placehold.co/40x40/96CEB4/FFFFFF?text=F1'
      },
      target: {
        type: 'message',
        id: 'msg1'
      },
      content: 'sent you a message',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    }
  ];

  // ============= EFFECTS =============

  /**
   * Initialize notifications on mount
   * Simulates fetching notifications from API
   */
  useEffect(() => {
    fetchNotifications();
  }, []);

  /**
   * Update unread count when notifications change
   */
  useEffect(() => {
    const unread = notifications.filter(notification => !notification.isRead).length;
    setUnreadCount(unread);
  }, [notifications]);

  /**
   * Simulate real-time notifications
   * In production, this would be replaced with WebSocket connection
   */
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random new notifications (20% chance every 30 seconds)
      if (Math.random() < 0.2) {
        createMockNotification();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // ============= METHODS =============

  /**
   * Fetch notifications from API
   * Currently uses mock data, in production would call backend
   */
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // In production: const response = await fetch('/api/notifications');
      // const data = await response.json();

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Mark notification as read
   * @param {string} notificationId - ID of notification to mark as read
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      // In production: await fetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' });

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      // In production: await fetch('/api/notifications/mark-all-read', { method: 'PUT' });

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  /**
   * Delete a notification
   * @param {string} notificationId - ID of notification to delete
   */
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      // In production: await fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' });

      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, []);

  /**
   * Update notification preferences
   * @param {Object} newPreferences - Updated preferences object
   */
  const updatePreferences = useCallback(async (newPreferences) => {
    try {
      // In production: await fetch('/api/notifications/preferences', {
      //   method: 'PUT',
      //   body: JSON.stringify(newPreferences)
      // });

      setPreferences(prev => ({ ...prev, ...newPreferences }));

      // Store in localStorage for persistence
      localStorage.setItem('notificationPreferences', JSON.stringify({ ...preferences, ...newPreferences }));
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  }, [preferences]);

  /**
   * Create a mock notification for demonstration
   * Simulates real-time notification arrival
   */
  const createMockNotification = useCallback(() => {
    const types = ['like', 'comment', 'follow', 'message'];
    const actors = [
      { id: 'user1', username: 'traveler_adventures', profilePicture: 'https://placehold.co/40x40/FF6B6B/FFFFFF?text=TA' },
      { id: 'user2', username: 'foodie_delights', profilePicture: 'https://placehold.co/40x40/45B7D1/FFFFFF?text=FD' },
      { id: 'user3', username: 'fitness_motivation', profilePicture: 'https://placehold.co/40x40/96CEB4/FFFFFF?text=FM' },
      { id: 'user4', username: 'friend_one', profilePicture: 'https://placehold.co/40x40/96CEB4/FFFFFF?text=F1' }
    ];

    const type = types[Math.floor(Math.random() * types.length)];
    const actor = actors[Math.floor(Math.random() * actors.length)];

    let content = '';
    switch (type) {
      case 'like':
        content = 'liked your post';
        break;
      case 'comment':
        content = 'commented on your post';
        break;
      case 'follow':
        content = 'started following you';
        break;
      case 'message':
        content = 'sent you a message';
        break;
      default:
        content = 'interacted with your content';
    }

    const newNotification = {
      id: Date.now().toString(),
      type,
      actor,
      target: { type: 'post', id: 'mock' },
      content,
      isRead: false,
      createdAt: new Date()
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Play notification sound if enabled
    if (preferences.soundEnabled) {
      // In a real app, you'd play a sound file
      console.log('🔔 Notification sound would play here');
    }
  }, [preferences.soundEnabled]);

  // ============= CONTEXT VALUE =============

  const value = {
    notifications,
    unreadCount,
    preferences,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Custom hook to use notification context
 * @returns {Object} Notification context value
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
