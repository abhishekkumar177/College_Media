import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationItem from './NotificationItem';

/**
 * NotificationList Component
 * Displays a list of notifications with filtering and actions
 */
const NotificationList = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAllAsRead
  } = useNotifications();

  /**
   * Handle mark all as read
   */
  const handleMarkAllAsRead = async () => {
    if (unreadCount > 0) {
      await markAllAsRead();
    }
  };

  /**
   * Format relative time for notifications
   * @param {Date} date - Date to format
   * @returns {string} Formatted relative time
   */
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-600">Loading notifications...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-full hover:bg-purple-600 transition-colors duration-300"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No notifications yet</h3>
            <p className="text-gray-600">
              When someone likes your posts, follows you, or sends you a message, you'll see it here.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              formatTimeAgo={formatTimeAgo}
            />
          ))
        )}
      </div>

      {/* Load More Button (for future pagination) */}
      {notifications.length > 0 && (
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-200 transition-colors duration-300">
            Load more notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
