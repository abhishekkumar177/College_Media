import React, { useState } from 'react';

const Notifications = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'like',
      user: { name: 'Sarah Chen', avatar: 'https://placehold.co/48x48/EC4899/FFFFFF?text=SC' },
      action: 'liked your post',
      time: '5 minutes ago',
      read: false,
    },
    {
      id: 2,
      type: 'comment',
      user: { name: 'Mike Johnson', avatar: 'https://placehold.co/48x48/3B82F6/FFFFFF?text=MJ' },
      action: 'commented on your post',
      content: 'Great work on the project!',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 3,
      type: 'follow',
      user: { name: 'Emma Davis', avatar: 'https://placehold.co/48x48/10B981/FFFFFF?text=ED' },
      action: 'started following you',
      time: '2 hours ago',
      read: true,
    },
    {
      id: 4,
      type: 'mention',
      user: { name: 'Alex Wilson', avatar: 'https://placehold.co/48x48/F59E0B/FFFFFF?text=AW' },
      action: 'mentioned you in a comment',
      content: '@you check this out!',
      time: '3 hours ago',
      read: true,
    },
    {
      id: 5,
      type: 'event',
      user: { name: 'Campus Events', avatar: 'https://placehold.co/48x48/8B5CF6/FFFFFF?text=CE' },
      action: 'Tech Talk starts in 1 hour',
      time: '4 hours ago',
      read: true,
    },
  ];

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'mentions', label: 'Mentions' },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return (
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        );
      case 'comment':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      case 'follow':
        return (
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'mention':
        return (
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
        );
      case 'event':
        return (
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">Stay updated with your activity</p>
          </div>
          <button className="text-indigo-600 font-medium hover:text-indigo-700">
            Mark all as read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="flex space-x-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-5 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
              !notification.read ? 'bg-indigo-50/30' : ''
            }`}
          >
            <div className="flex space-x-4">
              <img
                src={notification.user.avatar}
                alt={notification.user.name}
                className="w-12 h-12 rounded-full flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900">
                      <span className="font-bold">{notification.user.name}</span>{' '}
                      <span className="text-gray-600">{notification.action}</span>
                    </p>
                    {notification.content && (
                      <p className="text-gray-600 text-sm mt-1">{notification.content}</p>
                    )}
                    <p className="text-gray-500 text-sm mt-1">{notification.time}</p>
                  </div>
                  {getIcon(notification.type)}
                </div>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0 mt-2"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
