import React, { useState, useEffect } from "react";
import { usersApi } from "../api/endpoints";

const BlockedUsersModal = ({ isOpen, onClose }) => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unblockingUserId, setUnblockingUserId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchBlockedUsers();
    }
  }, [isOpen]);

  const fetchBlockedUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await usersApi.getBlockedUsers();
      if (response.data.success) {
        setBlockedUsers(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch blocked users:", err);
      setError("Failed to load blocked users");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId) => {
    setUnblockingUserId(userId);
    setError("");
    try {
      const response = await usersApi.unblockUser(userId);
      if (response.data.success) {
        // Remove from local state
        setBlockedUsers((prev) => prev.filter((user) => user._id !== userId));
      }
    } catch (err) {
      console.error("Failed to unblock user:", err);
      setError("Failed to unblock user. Please try again.");
    } finally {
      setUnblockingUserId(null);
    }
  };

  if (!isOpen) return null;

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
          Blocked Users
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Manage accounts you have blocked
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {blockedUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚫</div>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                  No blocked users
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  You haven't blocked anyone yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {blockedUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center flex-1">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mr-4">
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
                            alt={user.username}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <span>
                            {user.firstName
                              ? user.firstName[0].toUpperCase()
                              : user.username[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.username}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnblock(user._id)}
                      disabled={unblockingUserId === user._id}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium transition-colors duration-200 text-sm"
                    >
                      {unblockingUserId === user._id ? "Unblocking..." : "Unblock"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BlockedUsersModal;
