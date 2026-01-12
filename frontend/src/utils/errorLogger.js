/**
 * Error Logging Utility
 * Issue #368: Error Boundary System
 * 
 * Centralized error logging service for the application.
 * Currently logs to console, but can be extended to report to external services (Sentry, LogRocket, etc.)
 */

const LOG_LEVELS = {
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
};

/**
 * Log an error to the console and/or external service
 * @param {Error} error - The error object
 * @param {Object} errorInfo - Additional error information (component stack, etc.)
 */
export const logError = (error, errorInfo = null) => {
    // In development, log full details to console
    if (import.meta.env.DEV) {
        console.group('🚨 Error Logger');
        console.error('Error:', error);
        if (errorInfo) {
            console.error('Error Info:', errorInfo);
        }
        console.groupEnd();
    }

    // TODO: Integrate with external error tracking service (e.g., Sentry)
    // Sentry.captureException(error, { extra: errorInfo });
};

/**
 * Log a warning message
 * @param {string} message - Warning message
 * @param {Object} data - Additional data
 */
export const logWarning = (message, data = null) => {
    if (import.meta.env.DEV) {
        console.warn(`⚠️ Warning: ${message}`, data || '');
    }
};

/**
 * Log an info message
 * @param {string} message - Info message
 * @param {Object} data - Additional data
 */
export const logInfo = (message, data = null) => {
    if (import.meta.env.DEV) {
        console.info(`ℹ️ Info: ${message}`, data || '');
    }
};

export default {
    logError,
    logWarning,
    logInfo,
};
