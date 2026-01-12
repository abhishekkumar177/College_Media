import { useState, useEffect } from "react";
import { accountApi } from "../api/endpoints";

const ProfileVisibilityModal = ({ isOpen, onClose }) => {
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  const [savingOption, setSavingOption] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchProfileVisibility();
      setError("");
      setSuccessMessage("");
    }
  }, [isOpen]);

  const fetchProfileVisibility = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await accountApi.getProfileVisibility();
      if (response.success) {
        setProfileVisibility(response.data.profileVisibility);
      }
    } catch (err) {
      console.error("Failed to fetch profile visibility:", err);
      setError("Failed to load profile visibility settings");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = async (newVisibility) => {
    if (newVisibility === profileVisibility || savingOption) return;
    
    const previousVisibility = profileVisibility;
    setSavingOption(newVisibility);
    setProfileVisibility(newVisibility); // Optimistic update
    setError("");
    setSuccessMessage("");
    
    try {
      const response = await accountApi.updateProfileVisibility({
        profileVisibility: newVisibility,
      });
      
      console.log("Profile visibility response:", response.data);
      
      if (response && response.success) {
        setSuccessMessage("Profile visibility updated successfully!");
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        // Revert on API error
        setProfileVisibility(previousVisibility);
        setError(response?.message || "Failed to update profile visibility.");
      }
    } catch (err) {
      console.error("Failed to update profile visibility:", err);
      // Revert on network error
      setProfileVisibility(previousVisibility);
      setError(err.message || "Failed to update profile visibility. Please try again.");
    } finally {
      setSavingOption(null);
    }
  };

  const visibilityOptions = [
    {
      value: "public",
      label: "Public",
      icon: "🌍",
      description: "Anyone can view your profile",
    },
    {
      value: "followers",
      label: "Followers Only",
      icon: "👥",
      description: "Only your followers can view your profile",
    },
    {
      value: "private",
      label: "Private",
      icon: "🔒",
      description: "Only you can view your profile",
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Profile Visibility
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Control who can see your profile
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
              {successMessage}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {visibilityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    profileVisibility === option.value
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
                  }`}
                  disabled={savingOption !== null}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{option.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {option.label}
                        </span>
                        {savingOption === option.value ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        ) : profileVisibility === option.value && (
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-blue-900 dark:text-blue-300">
                <p className="font-medium mb-1">Privacy Note</p>
                <p className="text-blue-700 dark:text-blue-400">
                  Changing your profile visibility will affect who can see your
                  posts, followers, and following lists.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            disabled={loading}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileVisibilityModal;
