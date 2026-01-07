import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      fetchUserData(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      setError(null);
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Session expired. Please login again.");
      }

      const data = await response.json();
      setUser(data.data);
      setToken(token);
    } catch (err) {
      console.error(err);
      localStorage.removeItem('token');
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
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        const { token, ...userData } = data.data;
        localStorage.setItem('token', token);
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
          : "Login failed. Please try again."
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    error,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {error && (
        <div style={{
          background: "#fee",
          color: "#900",
          padding: "12px",
          margin: "10px",
          borderRadius: "6px",
          textAlign: "center"
        }}>
          ⚠️ {error}
        </div>
      )}
      {!loading && !error && children}
    </AuthContext.Provider>
  );
};
