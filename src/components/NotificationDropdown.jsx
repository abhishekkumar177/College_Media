import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from './NotificationItem';

const NotificationDropdown = ({ notifications, onClose }) => {
  const { unreadCount, markAllAsRead } = useNotifications();

  const handleMarkAllAsRead = async (e) => {
    e.preventDefault();
    await markAllAsRead();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-header"
      aria-describedby="notification-description"
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
        <h3 id="notification-header" className="font-semibold text-gray-900 dark:text-white">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400" aria-live="polite">
              ({unreadCount} new)
            </span>
          )}
        </h3>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 rounded px-1"
            aria-label="Mark all notifications as read"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Icon 
              icon="mdi:bell-outline" 
              width={48} 
              className="text-gray-400 dark:text-gray-600 mb-3"
            />
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No notifications yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center mt-1">
              We'll notify you when something happens
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={onClose}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Link
            to="/notifications"
            onClick={onClose}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center justify-center gap-1"
          >
            View all notifications
            <Icon icon="mdi:arrow-right" width={16} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
