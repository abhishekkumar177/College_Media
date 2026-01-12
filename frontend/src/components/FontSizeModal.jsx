import React from "react";
import { useSettings } from "../context/SettingsContext";

const FontSizeModal = ({ isOpen, onClose }) => {
  const { fontSize, updateFontSize, loading } = useSettings();

  if (!isOpen) return null;

  const fontSizes = [
    { value: "small", label: "Small", description: "Compact text for more content", example: "The quick brown fox" },
    { value: "medium", label: "Medium", description: "Default comfortable reading", example: "The quick brown fox" },
    { value: "large", label: "Large", description: "Larger text for better readability", example: "The quick brown fox" },
  ];

  const handleFontSizeChange = async (size) => {
    await updateFontSize(size);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Font Size
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose your preferred text size across the app
          </p>

          {fontSizes.map((size) => (
            <button
              key={size.value}
              onClick={() => handleFontSizeChange(size.value)}
              disabled={loading}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                fontSize === size.value
                  ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700"
              } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      fontSize === size.value
                        ? "border-indigo-600 bg-indigo-600"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {fontSize === size.value && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {size.label}
                  </span>
                </div>
                {fontSize === size.value && (
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {size.description}
              </p>
              <div
                className={`font-medium ${
                  size.value === "small" ? "text-sm" : size.value === "large" ? "text-lg" : "text-base"
                } text-gray-800 dark:text-gray-200`}
              >
                {size.example}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors duration-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default FontSizeModal;
