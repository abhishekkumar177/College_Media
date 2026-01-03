import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    publicProfile: true,
    showOnlineStatus: true,
    allowTagging: true,
    allowComments: true,
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-slate-800 transition-colors">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-slate-300 text-sm">Manage your account settings and preferences</p>
      </div>

      {/* Account Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-slate-800 transition-colors">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <span>👤</span> Account
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-slate-100">{user?.username || 'Username'}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">{user?.email || 'email@example.com'}</p>
            </div>
            <button
              onClick={() => navigate('/profile/edit')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-slate-800 transition-colors">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <span>🎨</span> Appearance
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-slate-100">Theme</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Current: {theme === 'dark' ? 'Dark' : 'Light'} mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-slate-800 transition-colors">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <span>🔔</span> Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-slate-100">Email Notifications</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Receive notifications via email</p>
            </div>
            <button
              onClick={() => handleToggle('emailNotifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.emailNotifications ? 'bg-purple-600' : 'bg-gray-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-slate-100">Push Notifications</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Receive push notifications on your device</p>
            </div>
            <button
              onClick={() => handleToggle('pushNotifications')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.pushNotifications ? 'bg-purple-600' : 'bg-gray-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-slate-800 transition-colors">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <span>🔒</span> Privacy
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-slate-100">Public Profile</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Make your profile visible to everyone</p>
            </div>
            <button
              onClick={() => handleToggle('publicProfile')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.publicProfile ? 'bg-purple-600' : 'bg-gray-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.publicProfile ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-slate-100">Show Online Status</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Let others see when you're online</p>
            </div>
            <button
              onClick={() => handleToggle('showOnlineStatus')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.showOnlineStatus ? 'bg-purple-600' : 'bg-gray-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-slate-100">Allow Tagging</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Allow others to tag you in posts</p>
            </div>
            <button
              onClick={() => handleToggle('allowTagging')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.allowTagging ? 'bg-purple-600' : 'bg-gray-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.allowTagging ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-slate-100">Allow Comments</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Allow others to comment on your posts</p>
            </div>
            <button
              onClick={() => handleToggle('allowComments')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.allowComments ? 'bg-purple-600' : 'bg-gray-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.allowComments ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-red-200 dark:border-red-900 transition-colors">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
          <span>⚠️</span> Danger Zone
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900">
            <div>
              <p className="font-medium text-gray-900 dark:text-slate-100">Log Out</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Sign out of your account</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Log Out
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900">
            <div>
              <p className="font-medium text-gray-900 dark:text-slate-100">Delete Account</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">Permanently delete your account and all data</p>
            </div>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              onClick={() => alert('Account deletion feature coming soon!')}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-slate-400">Changes are saved automatically</p>
          <button
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors font-medium"
            onClick={() => alert('Settings saved successfully!')}
          >
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
