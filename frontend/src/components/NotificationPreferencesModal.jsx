import React, { useState, useEffect } from "react";
import { accountApi } from "../api/endpoints";

const NotificationPreferencesModal = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    likes: true,
    comments: true,
    follows: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchPreferences();
    }
  }, [isOpen]);

  const fetchPreferences = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await accountApi.getNotificationPreferences();
      if (response.data.success) {
        setPreferences(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch notification preferences:", err);
      setError("Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSuccessMessage("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccessMessage("");
    try {
      const response = await accountApi.updateNotificationPreferences(preferences);
      if (response.data.success) {
        setSuccessMessage("Preferences saved successfully!");
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      }
    } catch (err) {
      console.error("Failed to update notification preferences:", err);
      setError("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const notificationOptions = [
    {
      key: "email",
      icon: "📧",
      title: "Email Notifications",
      description: "Receive notifications via email",
    },
    {
      key: "push",
      icon: "🔔",
      title: "Push Notifications",
      description: "Receive push notifications in your browser",
    },
    {
      key: "likes",
      icon: "❤️",
      title: "Likes",
      description: "Get notified when someone likes your posts",
    },
    {
      key: "comments",
      icon: "💬",
      title: "Comments",
      description: "Get notified when someone comments on your posts",
    },
    {
      key: "follows",
      icon: "👥",
      title: "New Followers",
      description: "Get notified when someone follows you",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Notification Preferences
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Customize what you get notified about
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {notificationOptions.map(({ key, icon, title, description }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center flex-1">
                    <span className="text-2xl mr-4">{icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(key)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      preferences[key]
                        ? "bg-blue-600"
                        : "bg-gray-200 dark:bg-gray-600"
                    }`}
                    role="switch"
                    aria-checked={preferences[key]}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        preferences[key] ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  {successMessage}
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium transition-colors duration-200"
              >
                {saving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationPreferencesModal;
