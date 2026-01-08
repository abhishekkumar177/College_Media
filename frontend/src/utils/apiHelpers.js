/**
 * API Helper Functions
 * Utility functions for API operations
 */

/**
 * Build query string from params object
 */
export const buildQueryString = (params) => {
  if (!params || Object.keys(params).length === 0) return "";

  const queryString = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map((v) => `${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`)
          .join("&");
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join("&");

  return queryString ? `?${queryString}` : "";
};

/**
 * Normalize error response
 */
export const normalizeError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || "An error occurred",
      status: error.response.status,
      data: error.response.data,
      type: "SERVER_ERROR",
    };
  } else if (error.request) {
    // Request was made but no response
    return {
      message: "No response from server. Please check your connection.",
      status: 0,
      data: null,
      type: "NETWORK_ERROR",
    };
  } else {
    // Something else happened
    return {
      message: error.message || "An unexpected error occurred",
      status: 0,
      data: null,
      type: "UNKNOWN_ERROR",
    };
  }
};

/**
 * Format response data
 */
export const formatResponse = (response) => {
  return {
    data: response.data,
    status: response.status,
    headers: response.headers,
    timestamp: Date.now(),
  };
};

/**
 * Check if error is network error
 */
export const isNetworkError = (error) => {
  return (
    error.code === "ERR_NETWORK" ||
    error.code === "ECONNABORTED" ||
    !error.response
  );
};

/**
 * Check if error is authentication error
 */
export const isAuthError = (error) => {
  return error.response?.status === 401;
};

/**
 * Check if error is authorization error
 */
export const isAuthorizationError = (error) => {
  return error.response?.status === 403;
};

/**
 * Check if error is validation error
 */
export const isValidationError = (error) => {
  return error.response?.status === 400 || error.response?.status === 422;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Create FormData from object
 */
export const createFormData = (data) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        formData.append(`${key}[${index}]`, item);
      });
    } else if (typeof value === "object" && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });

  return formData;
};
