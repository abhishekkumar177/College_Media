import React from "react";
import { useSettings } from "../context/SettingsContext";

const ThemeModal = ({ isOpen, onClose }) => {
  const { theme, updateTheme, loading } = useSettings();

  if (!isOpen) return null;

  const handleThemeChange = async (newTheme) => {
    await updateTheme(newTheme);
    onClose();
  };

  const themes = [
    { value: "light", label: "Light", icon: "☀️" },
    { value: "dark", label: "Dark", icon: "🌙" },
    { value: "auto", label: "System", icon: "💻" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select Theme</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Choose how College Media looks to you. Select a theme from the options below.
        </p>
        <div className="mt-6 space-y-4">
          {themes.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => handleThemeChange(value)}
              disabled={loading}
              className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition-all duration-200 ${
                theme === value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50"
                  : "border-gray-300 bg-transparent hover:border-blue-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-gray-700/50"
              }`}
            >
              <div className="flex items-center">
                <span className="mr-4 text-2xl">{icon}</span>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {value === 'auto' ? 'Sync with your system preference' : `Always use ${label} mode`}
                  </p>
                </div>
              </div>
              {theme === value && (
                <div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-blue-500 bg-blue-500 p-0.5">
                   <svg className="h-full w-full text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeModal;
