import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

/**
 * NotificationPreferences Component
 * Allows users to customize their notification settings
 */
const NotificationPreferences = () => {
  const { preferences, updatePreferences } = useNotifications();
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Handle preference toggle
   * @param {string} key - Preference key to toggle
   */
  const handleToggle = (key) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  /**
   * Handle save preferences
   */
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePreferences(localPreferences);
      // Show success message (in a real app, you'd use a toast notification)
      console.log('✅ Preferences saved successfully!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle reset to defaults
   */
  const handleReset = () => {
    const defaults = {
      likes: true,
      comments: true,
      follows: true,
      messages: true,
      mentions: true,
      pushEnabled: false,
      soundEnabled: true
    };
    setLocalPreferences(defaults);
  };

  /**
   * Check if preferences have changed
   */
  const hasChanges = JSON.stringify(localPreferences) !== JSON.stringify(preferences);

  const preferenceOptions = [
    {
      key: 'likes',
      label: 'Likes',
      description: 'Get notified when someone likes your posts',
      icon: '❤️'
    },
    {
      key: 'comments',
      label: 'Comments',
      description: 'Get notified when someone comments on your posts',
      icon: '💬'
    },
    {
      key: 'follows',
      label: 'Follows',
      description: 'Get notified when someone starts following you',
      icon: '👥'
    },
    {
      key: 'messages',
      label: 'Messages',
      description: 'Get notified when you receive direct messages',
      icon: '✉️'
    },
    {
      key: 'mentions',
      label: 'Mentions',
      description: 'Get notified when someone mentions you in posts or comments',
      icon: '🏷️'
    }
  ];

  const additionalOptions = [
    {
      key: 'pushEnabled',
      label: 'Push Notifications',
      description: 'Receive push notifications on your device',
      icon: '📱'
    },
    {
      key: 'soundEnabled',
      label: 'Notification Sounds',
      description: 'Play sound when receiving notifications',
      icon: '🔊'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Notification Preferences</h1>
        <p className="text-gray-600">
          Customize which notifications you'd like to receive and how you want to be notified.
        </p>
      </div>

      {/* Notification Types */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Activity Notifications</h2>
          <div className="space-y-4">
            {preferenceOptions.map((option) => (
              <div
                key={option.key}
                className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{option.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-800">{option.label}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={localPreferences[option.key]}
                    onChange={() => handleToggle(option.key)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Settings */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Additional Settings</h2>
          <div className="space-y-4">
            {additionalOptions.map((option) => (
              <div
                key={option.key}
                className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{option.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-800">{option.label}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={localPreferences[option.key]}
                    onChange={() => handleToggle(option.key)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-full hover:bg-gray-200 transition-colors duration-300"
        >
          Reset to Defaults
        </button>

        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`px-6 py-3 font-medium rounded-full transition-colors duration-300 ${
            hasChanges && !isSaving
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSaving ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>

      {/* Info Section */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-start space-x-3">
          <span className="text-blue-500 text-xl">ℹ️</span>
          <div>
            <h3 className="font-medium text-blue-800 mb-1">About Notifications</h3>
            <p className="text-sm text-blue-700">
              You can change these preferences at any time. Push notifications require device permission and may not be available on all platforms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
