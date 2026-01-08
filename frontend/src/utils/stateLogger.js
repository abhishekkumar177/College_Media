/**
 * State Logger
 * Development utility for logging state changes
 */

const IS_DEVELOPMENT = import.meta.env.MODE === 'development';
const ENABLE_LOGGING = IS_DEVELOPMENT && true; // Toggle logging

/**
 * Log levels
 */
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

/**
 * Colors for different log types
 */
const LOG_COLORS = {
  AUTH: '#4CAF50',
  POSTS: '#2196F3',
  UI: '#FF9800',
  ACTION: '#9C27B0',
  STATE: '#00BCD4',
  ERROR: '#F44336',
};

/**
 * Log state change
 * @param {string} contextName - Context name (AUTH, POSTS, UI)
 * @param {Object} action - Dispatched action
 * @param {Object} prevState - Previous state
 * @param {Object} nextState - Next state
 */
export const logStateChange = (contextName, action, prevState, nextState) => {
  if (!ENABLE_LOGGING) return;

  const color = LOG_COLORS[contextName] || LOG_COLORS.STATE;
  const timestamp = new Date().toLocaleTimeString();

  console.group(
    `%c${contextName} STATE CHANGE @ ${timestamp}`,
    `color: ${color}; font-weight: bold;`
  );

  console.log(
    '%cACTION',
    `color: ${LOG_COLORS.ACTION}; font-weight: bold;`,
    action
  );

  console.log(
    '%cPREVIOUS STATE',
    'color: #9E9E9E; font-weight: bold;',
    prevState
  );

  console.log(
    '%cNEXT STATE',
    `color: ${color}; font-weight: bold;`,
    nextState
  );

  // Log state diff
  const diff = getStateDiff(prevState, nextState);
  if (diff && Object.keys(diff).length > 0) {
    console.log(
      '%cSTATE DIFF',
      'color: #FF5722; font-weight: bold;',
      diff
    );
  }

  console.groupEnd();
};

/**
 * Get difference between two states
 * @param {Object} prev - Previous state
 * @param {Object} next - Next state
 * @returns {Object} Difference object
 */
const getStateDiff = (prev, next) => {
  const diff = {};

  // Check for changed properties
  Object.keys(next).forEach((key) => {
    if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
      diff[key] = {
        from: prev[key],
        to: next[key],
      };
    }
  });

  return diff;
};

/**
 * Log action dispatch
 * @param {string} contextName - Context name
 * @param {Object} action - Action being dispatched
 */
export const logAction = (contextName, action) => {
  if (!ENABLE_LOGGING) return;

  const color = LOG_COLORS[contextName] || LOG_COLORS.ACTION;
  const timestamp = new Date().toLocaleTimeString();

  console.log(
    `%c[${contextName}] ACTION @ ${timestamp}`,
    `color: ${color}; font-weight: bold;`,
    action
  );
};

/**
 * Log error
 * @param {string} contextName - Context name
 * @param {string} message - Error message
 * @param {Error} error - Error object
 */
export const logError = (contextName, message, error) => {
  if (!ENABLE_LOGGING) return;

  console.group(
    `%c[${contextName}] ERROR`,
    `color: ${LOG_COLORS.ERROR}; font-weight: bold;`
  );

  console.error(message);
  console.error(error);

  if (error.stack) {
    console.log('%cSTACK TRACE', 'color: #757575;', error.stack);
  }

  console.groupEnd();
};

/**
 * Log performance timing
 * @param {string} operation - Operation name
 * @param {number} duration - Duration in ms
 */
export const logPerformance = (operation, duration) => {
  if (!ENABLE_LOGGING) return;

  const color = duration > 100 ? '#FF9800' : '#4CAF50';

  console.log(
    `%c⏱️ ${operation}`,
    `color: ${color}; font-weight: bold;`,
    `${duration.toFixed(2)}ms`
  );
};

/**
 * Create a performance logger
 * @param {string} operation - Operation name
 * @returns {Function} End function to log duration
 */
export const startPerformanceLog = (operation) => {
  const start = performance.now();

  return () => {
    const duration = performance.now() - start;
    logPerformance(operation, duration);
  };
};

/**
 * Log state tree
 * @param {string} title - Log title
 * @param {Object} state - State object
 */
export const logStateTree = (title, state) => {
  if (!ENABLE_LOGGING) return;

  console.group(`%c${title}`, 'color: #00BCD4; font-weight: bold; font-size: 14px;');
  console.log(state);
  console.groupEnd();
};

/**
 * Log component render
 * @param {string} componentName - Component name
 * @param {Object} props - Component props
 */
export const logRender = (componentName, props = {}) => {
  if (!ENABLE_LOGGING) return;

  console.log(
    `%c🔄 ${componentName}`,
    'color: #9C27B0; font-weight: bold;',
    props
  );
};

/**
 * Create logger middleware for reducers
 * @param {string} contextName - Context name
 * @returns {Function} Middleware function
 */
export const createStateLogger = (contextName) => {
  return (reducer) => {
    return (state, action) => {
      if (ENABLE_LOGGING) {
        const prevState = state;
        const nextState = reducer(state, action);
        logStateChange(contextName, action, prevState, nextState);
        return nextState;
      }
      
      return reducer(state, action);
    };
  };
};

/**
 * Log cache operation
 * @param {string} operation - Operation type (HIT, MISS, SET, CLEAR)
 * @param {string} key - Cache key
 * @param {any} data - Associated data
 */
export const logCache = (operation, key, data = null) => {
  if (!ENABLE_LOGGING) return;

  const colors = {
    HIT: '#4CAF50',
    MISS: '#FF9800',
    SET: '#2196F3',
    CLEAR: '#F44336',
  };

  console.log(
    `%c💾 CACHE ${operation}`,
    `color: ${colors[operation] || '#9E9E9E'}; font-weight: bold;`,
    key,
    data
  );
};

/**
 * Group related logs
 * @param {string} title - Group title
 * @param {Function} callback - Callback function
 */
export const logGroup = (title, callback) => {
  if (!ENABLE_LOGGING) return callback();

  console.group(title);
  const result = callback();
  console.groupEnd();
  
  return result;
};

/**
 * Log API request
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {Object} data - Request data
 */
export const logAPIRequest = (method, url, data = null) => {
  if (!ENABLE_LOGGING) return;

  console.log(
    `%c🌐 ${method} ${url}`,
    'color: #3F51B5; font-weight: bold;',
    data
  );
};

/**
 * Log API response
 * @param {number} status - Response status
 * @param {Object} data - Response data
 * @param {number} duration - Request duration
 */
export const logAPIResponse = (status, data, duration) => {
  if (!ENABLE_LOGGING) return;

  const color = status >= 200 && status < 300 ? '#4CAF50' : '#F44336';

  console.log(
    `%c✓ ${status} (${duration.toFixed(0)}ms)`,
    `color: ${color}; font-weight: bold;`,
    data
  );
};

export default {
  logStateChange,
  logAction,
  logError,
  logPerformance,
  startPerformanceLog,
  logStateTree,
  logRender,
  createStateLogger,
  logCache,
  logGroup,
  logAPIRequest,
  logAPIResponse,
};
