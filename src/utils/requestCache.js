/**
 * Request Cache Utility
 * Simple in-memory cache for GET requests
 */

import API_CONFIG from '../services/apiConfig';

class RequestCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
  }

  /**
   * Generate cache key from request config
   */
  generateKey(config) {
    const { method, url, params } = config;
    return `${method}:${url}:${JSON.stringify(params || {})}`;
  }

  /**
   * Check if cached data is still valid
   */
  isValid(key) {
    if (!this.timestamps.has(key)) return false;
    
    const timestamp = this.timestamps.get(key);
    const age = Date.now() - timestamp;
    
    return age < API_CONFIG.CACHE.TTL;
  }

  /**
   * Get cached response
   */
  get(config) {
    if (!API_CONFIG.CACHE.ENABLED) return null;
    
    const key = this.generateKey(config);
    
    if (this.cache.has(key) && this.isValid(key)) {
      return this.cache.get(key);
    }
    
    // Remove expired cache
    this.delete(key);
    return null;
  }

  /**
   * Set cached response
   */
  set(config, response) {
    if (!API_CONFIG.CACHE.ENABLED) return;
    
    const key = this.generateKey(config);
    
    // Check cache size limit
    if (this.cache.size >= API_CONFIG.CACHE.MAX_SIZE) {
      // Remove oldest entry
      const oldestKey = this.cache.keys().next().value;
      this.delete(oldestKey);
    }
    
    this.cache.set(key, response);
    this.timestamps.set(key, Date.now());
  }

  /**
   * Delete cached response
   */
  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  /**
   * Invalidate cache by URL pattern
   */
  invalidate(urlPattern) {
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(urlPattern)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.delete(key));
  }
}

// Export singleton instance
export default new RequestCache();
