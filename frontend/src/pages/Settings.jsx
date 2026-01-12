import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { accountApi } from "../api/endpoints";
import FontSizeModal from "../components/FontSizeModal";
import ThemeModal from "../components/ThemeModal";
import NotificationPreferencesModal from "../components/NotificationPreferencesModal";
import BlockedUsersModal from "../components/BlockedUsersModal";
import ProfileVisibilityModal from "../components/ProfileVisibilityModal";
import EditProfileModal from "../components/EditProfileModal";

// import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  // const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    postPrivacy: "friends",
    storyPrivacy: "public",
    twoFactorAuth: false,
    darkMode: false,
  });

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showFontSizeModal, setShowFontSizeModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showNotificationPreferences, setShowNotificationPreferences] = useState(false);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [showProfileVisibility, setShowProfileVisibility] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [showDeactivateAccount, setShowDeactivateAccount] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivateReason, setDeactivateReason] = useState("");
  const [deactivateError, setDeactivateError] = useState("");
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState(1); // 1: QR Code, 2: Verify
  const [twoFASecret, setTwoFASecret] = useState("");
  const [twoFAQRCode, setTwoFAQRCode] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFAError, setTwoFAError] = useState("");
  const [twoFALoading, setTwoFALoading] = useState(false);

  const toggleSetting = async (key) => {
    if (key === "twoFactorAuth") {
      if (settings.twoFactorAuth) {
        // Disable 2FA - show password confirmation
        const password = prompt("Enter your password to disable 2FA:");
        if (password) {
          await handle2FADisable(password);
        }
      } else {
        // Enable 2FA - show modal
        await handle2FAEnable();
      }
    } else {
      setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate("/login");
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleChangePasswordClick = () => {
    setShowChangePassword(true);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordError("");
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordError("");
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setPasswordLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowChangePassword(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        alert("Password changed successfully!");
      } else {
        setPasswordError(data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      setPasswordError("Failed to change password. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleChangePasswordCancel = () => {
    setShowChangePassword(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordError("");
  };

  const handle2FAEnable = async () => {
    setTwoFALoading(true);
    setTwoFAError("");

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/auth/2fa/enable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setTwoFASecret(data.data.secret);
        setTwoFAQRCode(data.data.qrCode);
        setShow2FAModal(true);
        setTwoFAStep(1);
      } else {
        setTwoFAError(data.message || "Failed to enable 2FA");
      }
    } catch (error) {
      console.error("Enable 2FA error:", error);
      setTwoFAError("Failed to enable 2FA. Please try again.");
    } finally {
      setTwoFALoading(false);
    }
  };

  const handle2FAVerify = async (e) => {
    e.preventDefault();
    setTwoFALoading(true);
    setTwoFAError("");

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/auth/2fa/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          secret: twoFASecret,
          token: twoFACode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSettings((prev) => ({ ...prev, twoFactorAuth: true }));
        setShow2FAModal(false);
        setTwoFACode("");
        alert("Two-factor authentication enabled successfully!");
      } else {
        setTwoFAError(data.message || "Invalid verification code");
      }
    } catch (error) {
      console.error("Verify 2FA error:", error);
      setTwoFAError("Failed to verify code. Please try again.");
    } finally {
      setTwoFALoading(false);
    }
  };

  const handle2FADisable = async (password) => {
    setTwoFALoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/auth/2fa/disable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setSettings((prev) => ({ ...prev, twoFactorAuth: false }));
        alert("Two-factor authentication disabled successfully!");
      } else {
        alert(data.message || "Failed to disable 2FA");
      }
    } catch (error) {
      console.error("Disable 2FA error:", error);
      alert("Failed to disable 2FA. Please try again.");
    } finally {
      setTwoFALoading(false);
    }
  };

  const handle2FAModalClose = () => {
    setShow2FAModal(false);
    setTwoFAStep(1);
    setTwoFACode("");
    setTwoFAError("");
  };

  const handleDeactivateAccountClick = () => {
    setShowDeactivateAccount(true);
    setDeactivatePassword("");
    setDeactivateReason("");
    setDeactivateError("");
  };

  const handleDeactivateAccountSubmit = async (e) => {
    e.preventDefault();
    setDeactivateError("");

    if (!deactivatePassword) {
      setDeactivateError("Password is required");
      return;
    }

    setDeactivateLoading(true);

    try {
      const response = await accountApi.deactivateAccount({
        password: deactivatePassword,
        reason: deactivateReason
      });

      if (response.success) {
        // Logout and redirect to login
        logout();
        navigate("/login", { 
          state: { 
            message: "Your account has been deactivated. You can reactivate it anytime by logging in again." 
          }
        });
      } else {
        setDeactivateError(response.message || "Failed to deactivate account");
      }
    } catch (error) {
      console.error("Deactivate account error:", error);
      setDeactivateError(
        error.response?.data?.message || "An error occurred while deactivating your account"
      );
    } finally {
      setDeactivateLoading(false);
    }
  };

  const handleDeactivateAccountCancel = () => {
    setShowDeactivateAccount(false);
    setDeactivatePassword("");
    setDeactivateReason("");
    setDeactivateError("");
  };

  const handleDeleteAccountClick = () => {
    setShowDeleteAccount(true);
    setDeletePassword("");
    setDeleteReason("");
    setDeleteError("");
  };

  const handleDeleteAccountCancel = () => {
    setShowDeleteAccount(false);
    setDeletePassword("");
    setDeleteReason("");
    setDeleteError("");
  };

  const handleDeleteAccountSubmit = async (e) => {
    e.preventDefault();
    setDeleteError("");

    if (!deletePassword) {
      setDeleteError("Password is required to delete your account");
      return;
    }

    if (!window.confirm("Are you absolutely sure? Your account will be scheduled for deletion in 30 days. You can restore it within this period.")) {
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await accountApi.deleteAccount({
        password: deletePassword,
        confirmDeletion: true,
        reason: deleteReason || undefined,
      });

      if (response.data.success) {
        // Check if account was already scheduled (idempotent response)
        if (response.data.data.isDeleted) {
          const deletionDate = new Date(response.data.data.scheduledDeletionDate).toLocaleDateString();
          
          if (window.confirm(`Your account is already scheduled for deletion on ${deletionDate}.\n\nWould you like to restore your account instead?`)) {
            // Restore account
            try {
              const restoreResponse = await accountApi.restoreAccount();
              if (restoreResponse.data.success) {
                alert("Account restored successfully! You can continue using your account.");
                setShowDeleteAccount(false);
                window.location.reload();
              }
            } catch (restoreError) {
              setDeleteError("Failed to restore account. Please try again.");
            }
          } else {
            setShowDeleteAccount(false);
          }
        } else {
          // Newly scheduled deletion
          alert(`Account scheduled for deletion. You have 30 days to restore it before permanent deletion on ${new Date(response.data.data.scheduledDeletionDate).toLocaleDateString()}.`);
          setShowDeleteAccount(false);
          logout();
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("Delete account error:", error);
      setDeleteError(error.response?.data?.message || "Failed to delete account. Please check your password and try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          icon: "👤",
          label: "Edit Profile",
          description: "Update your profile information",
          type: "button",
          onClick: () => setShowEditProfile(true),
        },
        {
          icon: "🔒",
          label: "Change Password",
          description: "Update your password",
          type: "button",
          onClick: handleChangePasswordClick,
        },
        {
          icon: "📧",
          label: "Email Address",
          description: "Manage your email",
          type: "link",
        },
        {
          icon: "🔐",
          label: "Two-Factor Authentication",
          description: "Add an extra layer of security",
          type: "toggle",
          key: "twoFactorAuth",
        },
      ],
    },
    {
      title: "Privacy & Safety",
      items: [
        {
          icon: "🔓",
          label: "Post Privacy",
          description: settings.postPrivacy,
          type: "select",
          key: "postPrivacy",
          options: ["public", "friends", "private"],
        },
        {
          icon: "📖",
          label: "Story Privacy",
          description: settings.storyPrivacy,
          type: "select",
          key: "storyPrivacy",
          options: ["public", "friends", "private"],
        },
        {
          icon: "🚫",
          label: "Blocked Users",
          description: "Manage blocked accounts",
          onClick: () => setShowBlockedUsers(true),
          type: "link",
        },
        {
          icon: "👁️",
          label: "Who can see your profile",
          description: "Control profile visibility",
          type: "link",
          onClick: () => setShowProfileVisibility(true),
        },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          icon: "📧",
          label: "Email Notifications",
          description: "Receive updates via email",
          type: "toggle",
          key: "emailNotifications",
        },
        {
          icon: "🔔",
          label: "Push Notifications",
          description: "Receive push notifications",
          type: "toggle",
          key: "pushNotifications",
        },
        {
          icon: "📱",
          label: "Notification Preferences",
          description: "Customize what you get notified about",
          type: "link",
          onClick: () => setShowNotificationPreferences(true),
        },
      ],
    },
    {
      title: "Appearance",
      items: [
        {
          icon: "�",
          label: "Theme",
          description: "Switch between light, dark, and system themes",
          onClick: () => setShowThemeModal(true),
          type: "link",
        },
        {
          icon: "🔤",
          label: "Font Size",
          description: "Adjust text size",
          type: "link",
          onClick: () => setShowFontSizeModal(true),
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account and preferences
        </p>
      </div>

      {/* Settings Sections */}
      {settingsSections.map((section, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {section.title}
          </h2>
          <div className="space-y-2">
            {section.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                onClick={item.type === "button" ? item.onClick : (item.type === "link" && item.onClick) ? item.onClick : undefined}
                className={`flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${(item.type === "button" || (item.type === "link" && item.onClick)) ? "cursor-pointer" : ""}`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="text-2xl">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {item.label}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {item.description}
                    </p>
                  </div>
                </div>
                {item.type === "toggle" && (
                  <button
                    onClick={() => toggleSetting(item.key)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings[item.key] ? "bg-indigo-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                        settings[item.key] ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                )}
                {(item.type === "link" || item.type === "button") && (
                  <svg
                    className="w-5 h-5 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
                {item.type === "select" && (
                  <select
                    value={settings[item.key]}
                    onChange={(e) =>
                      setSettings({ ...settings, [item.key]: e.target.value })
                    }
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
        <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">
          Danger Zone
        </h2>
        <div className="space-y-3">
          <button 
            onClick={handleDeactivateAccountClick}
            className="w-full p-4 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 text-left"
          >
            <p className="font-bold text-red-600 dark:text-red-400">
              Deactivate Account
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Temporarily disable your account
            </p>
          </button>
          <button 
            onClick={handleDeleteAccountClick}
            className="w-full p-4 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 text-left"
          >
            <p className="font-bold text-red-600 dark:text-red-400">
              Delete Account
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Permanently delete your account and data
            </p>
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogoutClick}
        className="w-full p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <p className="font-bold text-gray-900 dark:text-gray-100">Log Out</p>
      </button>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Confirm Logout
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to log out? You'll need to sign in again to access your account.
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleLogoutCancel}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors duration-200"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Change Password
            </h3>
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Confirm new password"
                />
              </div>
              {passwordError && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {passwordError}
                </p>
              )}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleChangePasswordCancel}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium transition-colors duration-200"
                >
                  {passwordLoading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Two-Factor Authentication Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Enable Two-Factor Authentication
            </h3>

            {twoFAStep === 1 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <div className="flex justify-center bg-white p-4 rounded-lg">
                  <img src={twoFAQRCode} alt="2FA QR Code" className="w-64 h-64" />
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Manual Entry Code:</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                    {twoFASecret}
                  </p>
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={handle2FAModalClose}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setTwoFAStep(2)}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors duration-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handle2FAVerify} className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter the 6-digit code from your authenticator app to verify setup
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-2.5 text-center text-2xl tracking-widest rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="000000"
                    maxLength="6"
                  />
                </div>
                {twoFAError && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {twoFAError}
                  </p>
                )}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTwoFAStep(1)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={twoFALoading || twoFACode.length !== 6}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium transition-colors duration-200"
                  >
                    {twoFALoading ? "Verifying..." : "Verify & Enable"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
              Delete Account
            </h3>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-2">
                ⚠️ Warning: This action will:
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 ml-4 list-disc">
                <li>Schedule your account for deletion in 30 days</li>
                <li>You can restore it within 30 days</li>
                <li>After 30 days, all data will be permanently deleted</li>
                <li>Your messages, posts, and profile will be removed</li>
              </ul>
            </div>
            <form onSubmit={handleDeleteAccountSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason for Deletion (Optional)
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Help us improve by telling us why you're leaving..."
                  rows="3"
                />
              </div>
              {deleteError && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {deleteError}
                </p>
              )}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleDeleteAccountCancel}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium transition-colors duration-200"
                >
                  {deleteLoading ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Font Size Modal */}
      <FontSizeModal 
        isOpen={showFontSizeModal} 
        onClose={() => setShowFontSizeModal(false)} 
      />

      <ThemeModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />

      <NotificationPreferencesModal
        isOpen={showNotificationPreferences}
        onClose={() => setShowNotificationPreferences(false)}
      />

      <BlockedUsersModal
        isOpen={showBlockedUsers}
        onClose={() => setShowBlockedUsers(false)}
      />

      <ProfileVisibilityModal
        isOpen={showProfileVisibility}
        onClose={() => setShowProfileVisibility(false)}
      />

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />
    </div>
  );
};

export default Settings;
