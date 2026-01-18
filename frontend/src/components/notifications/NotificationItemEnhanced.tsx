import React from 'react';
import { format } from 'date-fns';
import './NotificationItemEnhanced.css';

interface Notification {
  _id: string;
  type: string;
  title: string;
  content: string;
  sender?: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  aggregatedUsers?: Array<{
    _id: string;
    name: string;
    profilePicture?: string;
  }>;
  aggregatedCount: number;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  priority: string;
}

interface NotificationItemEnhancedProps {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

const NotificationItemEnhanced: React.FC<NotificationItemEnhancedProps> = ({
  notification,
  onRead,
  onDelete,
  onClick
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
      case 'reply':
        return '💬';
      case 'follow':
        return '👤';
      case 'mention':
        return '@';
      case 'event':
      case 'event_reminder':
        return '📅';
      case 'system':
      case 'admin':
        return '⚙️';
      case 'message':
        return '✉️';
      case 'study_match':
        return '🎓';
      case 'achievement':
        return '🏆';
      default:
        return '🔔';
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'notification-urgent';
      case 'high':
        return 'notification-high';
      case 'low':
        return 'notification-low';
      default:
        return '';
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification._id);
    }
    if (onClick) {
      onClick(notification);
    } else if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div
      className={`notification-item ${!notification.isRead ? 'unread' : ''} ${getPriorityClass(notification.priority)}`}
      onClick={handleClick}
    >
      {/* Icon/Avatar */}
      <div className="notification-icon">
        {notification.sender?.profilePicture ? (
          <img
            src={notification.sender.profilePicture}
            alt={notification.sender.name}
            className="avatar"
          />
        ) : (
          <div className="icon-fallback">
            {getTypeIcon(notification.type)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="notification-content">
        <h4 className="notification-title">
          {notification.title}
          {notification.aggregatedCount > 1 && (
            <span className="aggregated-badge">
              {notification.aggregatedCount}
            </span>
          )}
        </h4>
        <p className="notification-message">{notification.content}</p>
        
        {/* Aggregated Users */}
        {notification.aggregatedUsers && notification.aggregatedUsers.length > 0 && (
          <div className="aggregated-users">
            {notification.aggregatedUsers.slice(0, 3).map(user => (
              <img
                key={user._id}
                src={user.profilePicture || '/default-avatar.png'}
                alt={user.name}
                className="aggregated-avatar"
                title={user.name}
              />
            ))}
            {notification.aggregatedUsers.length > 3 && (
              <span className="aggregated-more">
                +{notification.aggregatedUsers.length - 3}
              </span>
            )}
          </div>
        )}

        <span className="notification-time">
          {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
        </span>
      </div>

      {/* Actions */}
      <div className="notification-actions">
        {!notification.isRead && (
          <button
            className="action-btn mark-read"
            onClick={(e) => {
              e.stopPropagation();
              onRead(notification._id);
            }}
            title="Mark as read"
          >
            <i className="fas fa-check"></i>
          </button>
        )}
        <button
          className="action-btn delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification._id);
          }}
          title="Delete"
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && <div className="unread-indicator"></div>}
    </div>
  );
};

export default NotificationItemEnhanced;
