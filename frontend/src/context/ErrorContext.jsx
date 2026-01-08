/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useCallback } from "react";
import toast from "react-hot-toast";

export const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);

  const showError = useCallback((message, options = {}) => {
    const { duration = 4000, position = "top-right", type = "error" } = options;

    setError(message);

    if (type === "error") {
      toast.error(message, { duration, position });
    } else if (type === "warning") {
      toast(message, {
        duration,
        position,
        icon: "⚠️",
        style: {
          background: "#FEF3C7",
          color: "#92400E",
        },
      });
    }

    // Auto-clear error after duration
    setTimeout(() => setError(null), duration);
  }, []);

  const showSuccess = useCallback((message, options = {}) => {
    const { duration = 3000, position = "top-right" } = options;

    toast.success(message, { duration, position });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    toast.dismiss();
  }, []);

  const value = {
    error,
    showError,
    showSuccess,
    clearError,
  };

  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
};
