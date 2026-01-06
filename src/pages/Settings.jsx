import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
// import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout } = useAuth();
  // const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    postPrivacy: 'friends',
    storyPrivacy: 'public',
    twoFactorAuth: false,
    darkMode: false,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: '👤', label: 'Edit Profile', description: 'Update your profile information', type: 'link' },
        { icon: '🔒', label: 'Change Password', description: 'Update your password', type: 'link' },
        { icon: '📧', label: 'Email Address', description: 'Manage your email', type: 'link' },
        { icon: '🔐', label: 'Two-Factor Authentication', description: 'Add an extra layer of security', type: 'toggle', key: 'twoFactorAuth' },
      ],
    },
    {
      title: 'Privacy & Safety',
      items: [
        { icon: '🔓', label: 'Post Privacy', description: settings.postPrivacy, type: 'select', key: 'postPrivacy', options: ['public', 'friends', 'private'] },
        { icon: '📖', label: 'Story Privacy', description: settings.storyPrivacy, type: 'select', key: 'storyPrivacy', options: ['public', 'friends', 'private'] },
        { icon: '🚫', label: 'Blocked Users', description: 'Manage blocked accounts', type: 'link' },
        { icon: '👁️', label: 'Who can see your profile', description: 'Control profile visibility', type: 'link' },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { icon: '📧', label: 'Email Notifications', description: 'Receive updates via email', type: 'toggle', key: 'emailNotifications' },
        { icon: '🔔', label: 'Push Notifications', description: 'Receive push notifications', type: 'toggle', key: 'pushNotifications' },
        { icon: '📱', label: 'Notification Preferences', description: 'Customize what you get notified about', type: 'link' },
      ],
    },
    {
      title: 'Appearance',
      items: [
        { icon: '🌙', label: 'Dark Mode', description: 'Switch to dark theme', type: 'toggle', key: 'darkMode' },
        { icon: '🎨', label: 'Theme', description: 'Customize your theme', type: 'link' },
        { icon: '🔤', label: 'Font Size', description: 'Adjust text size', type: 'link' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
      </div>

      {/* Settings Sections */}
      {settingsSections.map((section, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{section.title}</h2>
          <div className="space-y-2">
            {section.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="text-2xl">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-gray-100">{item.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{item.description}</p>
                  </div>
                </div>
                {item.type === 'toggle' && (
                  <button
                    onClick={() => toggleSetting(item.key)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings[item.key] ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                        settings[item.key] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                )}
                {item.type === 'link' && (
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                {item.type === 'select' && (
                  <select
                    value={settings[item.key]}
                    onChange={(e) => setSettings({ ...settings, [item.key]: e.target.value })}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {item.options.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-red-200 dark:border-red-900/50 p-6">
        <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
        <div className="space-y-3">
          <button className="w-full p-4 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 text-left">
            <p className="font-bold text-red-600 dark:text-red-400">Deactivate Account</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Temporarily disable your account</p>
          </button>
          <button className="w-full p-4 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 text-left">
            <p className="font-bold text-red-600 dark:text-red-400">Delete Account</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Permanently delete your account and data</p>
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <button className="w-full p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
        <p className="font-bold text-gray-900 dark:text-gray-100">Log Out</p>
      </button>
    </div>
  );
};

export default Settings;
