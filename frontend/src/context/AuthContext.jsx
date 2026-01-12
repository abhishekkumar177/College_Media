import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      fetchUserData(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      setError(null);
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
        }/api/users/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Session expired. Please login again.");
      }

      const data = await response.json();
      setUser(data.data);
      setToken(token);
    } catch (err) {
      console.error(err);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);

      if (!navigator.onLine) {
        setError("No internet connection. Please check your network.");
      } else {
        setError(err.message || "Failed to load user data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
        }/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Backend sends token inside data object
        const token = data.data.token || data.token;
        const userData = { ...data.data };
        delete userData.token; // Remove token from user object
        
        localStorage.setItem("token", token);
        setToken(token);
        setUser(userData);
        setError(null);
        return { success: true, user: userData };
      } else {
        return { success: false, message: data.message };
      }
    } catch {
      return {
        success: false,
        message: !navigator.onLine
          ? "No internet connection."
          : "Login failed. Please try again.",
      };
    }
  };

  const resetPassword = async (email) => {
    try {
      // Mock password reset - replace with actual implementation
      console.log("Password reset requested for:", email);
      return Promise.resolve();
    } catch {
      throw new Error("Password reset failed");
    }
  };

  const register = async (formData) => {
    try {
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      console.log("📤 Registering user with data:", { ...formData, password: '***' });

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("📥 Response status:", response.status);

      let data;
      try {
        data = await response.json();
        console.log("📥 Response data:", data);
      } catch {
        throw new Error(
          "Server returned an invalid response. Please try again later."
        );
      }

      if (data.success) {
        // Registration successful - user needs to login
        // Registration doesn't return token, only success message
        setError(null);

        return { success: true, message: data.message };
      } else {
        console.error("❌ Registration failed:", data.message, data.errors);
        return {
          success: false,
          message: data.message || "Registration failed.",
          errors: data.errors
        };
      }
    } catch (err) {
      console.error("❌ Registration Error:", err);

      return {
        success: false,
        message: !navigator.onLine
          ? "No internet connection."
          : err.message ||
            "Registration failed. Please check your server connection.",
      };
    }
  };

  const logout = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const authToken = token || localStorage.getItem("token");

      // Call backend logout endpoint if token exists
      if (authToken) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
          },
        });
      }
    } catch (error) {
      // Continue with logout even if backend call fails
      console.error("Logout API error:", error);
    } finally {
      // Always clear local storage and state
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const authToken = token || localStorage.getItem("token");

      if (!authToken) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      if (data.success) {
        setUser(data.data);
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error("Profile update error:", err);
      return {
        success: false,
        message: err.message || "Failed to update profile",
      };
    }
  };

  const uploadProfilePicture = async (imageFile) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const authToken = token || localStorage.getItem("token");

      if (!authToken) {
        throw new Error("Authentication required");
      }

      const formData = new FormData();
      formData.append("profilePicture", imageFile);

      const response = await fetch(`${API_BASE_URL}/api/users/profile-picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload profile picture");
      }

      if (data.success) {
        setUser({ ...user, profilePicture: data.data.profilePicture });
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error("Profile picture upload error:", err);
      return {
        success: false,
        message: err.message || "Failed to upload profile picture",
      };
    }
  };

  const value = {
    user,
    setUser,
    token,
    login,
    register,
    resetPassword,
    logout,
    updateUserProfile,
    uploadProfilePicture,
    loading,
    error,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
          {children}
    </AuthContext.Provider>
  );
};
