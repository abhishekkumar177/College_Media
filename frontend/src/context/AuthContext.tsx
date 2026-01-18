import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  token: string | null;
  login: (email: string, password: string) => Promise<{ 
    success: boolean; 
    user?: User; 
    message?: string;
    requiresMFA?: boolean;
    userId?: string;
  }>;
  verifyMFA: (userId: string, token: string) => Promise<{ success: boolean; user?: User; message?: string }>;
  register: (formData: any) => Promise<{ success: boolean; message: string; errors?: any }>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (profileData: any) => Promise<{ success: boolean; data?: User; message?: string }>;
  uploadProfilePicture: (imageFile: File) => Promise<{ success: boolean; data?: any; message?: string }>;
  loading: boolean;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    console.log("🔍 AuthContext: Checking token...", storedToken ? "Token found" : "No token");
    if (storedToken) {
      fetchUserData(storedToken);
    } else {
      setLoading(false);
      setIsInitialized(true);
    }
  }, []);

  const fetchUserData = async (token: string) => {
    console.log("🔐 AuthContext: Fetching user data...");
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
        }/api/users/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("📡 AuthContext: Profile response status:", response.status);

      if (!response.ok) {
        throw new Error("Session expired. Please login again.");
      }

      const data = await response.json();
      console.log("✅ AuthContext: User data loaded successfully");
      setUser(data.data);
      setToken(token);
    } catch (err: any) {
      console.error("❌ AuthContext: Error fetching user data:", err);
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
      setIsInitialized(true);
      console.log("🏁 AuthContext: Loading complete");
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
        }/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Check if MFA is required
        if (data.requiresMFA) {
          return { 
            success: true, 
            requiresMFA: true, 
            userId: data.userId,
            message: "MFA verification required" 
          };
        }

        // Normal login flow (no MFA)
        const token = data.data?.token || data.token || data.accessToken;
        const userData = { ...data.data };
        delete userData.token;

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

  const verifyMFA = async (userId: string, mfaToken: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
        }/api/auth/2fa/verify-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, token: mfaToken }),
        }
      );

      const data = await response.json();

      if (data.success) {
        const token = data.data?.token || data.token;
        
        // Fetch user profile
        const profileResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
          }/api/users/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const profileData = await profileResponse.json();
        
        if (profileData.success) {
          localStorage.setItem("token", token);
          setToken(token);
          setUser(profileData.data);
          setError(null);
          return { success: true, user: profileData.data };
        }
      }

      return { success: false, message: data.message || "MFA verification failed" };
    } catch (err: any) {
      return {
        success: false,
        message: !navigator.onLine
          ? "No internet connection."
          : err.message || "MFA verification failed. Please try again.",
      };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log("Password reset requested for:", email);
      return Promise.resolve();
    } catch {
      throw new Error("Password reset failed");
    }
  };

  const register = async (formData: any) => {
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
    } catch (err: any) {
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
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  };

  const updateUserProfile = async (profileData: any) => {
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
    } catch (err: any) {
      console.error("Profile update error:", err);
      return {
        success: false,
        message: err.message || "Failed to update profile",
      };
    }
  };

  const uploadProfilePicture = async (imageFile: File) => {
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
        if (user) {
          setUser({ ...user, profilePicture: data.data.profilePicture });
        }
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err: any) {
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
    verifyMFA,
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
