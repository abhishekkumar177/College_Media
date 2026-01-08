/**
 * Logging Interceptor
 * Logs requests and responses in development mode
 */

/**
 * Request logging interceptor
 */
export const loggingRequestInterceptor = (config) => {
  if (import.meta.env.MODE === 'development') {
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      params: config.params,
      data: config.data,
      headers: config.headers
    });
  }
  
  // Add request timestamp
  config.metadata = { startTime: Date.now() };
  
  return config;
};

/**
 * Response logging interceptor
 */
export const loggingResponseInterceptor = (response) => {
  if (import.meta.env.MODE === 'development') {
    const duration = Date.now() - (response.config.metadata?.startTime || 0);
    
    console.log('📥 API Response:', {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      duration: `${duration}ms`,
      data: response.data
    });
  }
  
  return response;
};

/**
 * Error logging interceptor
 */
export const loggingErrorInterceptor = (error) => {
  if (import.meta.env.MODE === 'development') {
    const duration = Date.now() - (error.config?.metadata?.startTime || 0);
    
    console.error('❌ API Error:', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      duration: `${duration}ms`,
      message: error.message,
      data: error.response?.data
    });
  }
  
  return Promise.reject(error);
};
