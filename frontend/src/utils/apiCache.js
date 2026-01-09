/**
 * API Request Caching
 * Issue #250: Cache GET requests to reduce server load
 */

const cache = new Map();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Cache entry structure
 */
class CacheEntry {
  constructor(data, ttl = DEFAULT_TTL) {
    this.data = data;
    this.expiry = Date.now() + ttl;
    this.timestamp = Date.now();
  }

  isExpired() {
    return Date.now() > this.expiry;
  }

  getAge() {
    return Date.now() - this.timestamp;
  }
}

/**
 * Generate cache key from request config
 */
const generateCacheKey = (method, url, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  return `${method.toUpperCase()}:${url}:${JSON.stringify(sortedParams)}`;
};

/**
 * Get cached data
 */
export const getCachedData = (method, url, params) => {
  const key = generateCacheKey(method, url, params);
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (entry.isExpired()) {
    cache.delete(key);
    return null;
  }

  if (import.meta.env.DEV) {
    console.log(`📦 [Cache Hit] ${key} - Age: ${entry.getAge()}ms`);
  }

  return entry.data;
};

/**
 * Set cached data
 */
export const setCachedData = (method, url, params, data, ttl = DEFAULT_TTL) => {
  const key = generateCacheKey(method, url, params);
  cache.set(key, new CacheEntry(data, ttl));

  if (import.meta.env.DEV) {
    console.log(`💾 [Cache Set] ${key} - TTL: ${ttl}ms`);
  }
};

/**
 * Invalidate cache by pattern
 */
export const invalidateCache = (pattern) => {
  let invalidatedCount = 0;

  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
      invalidatedCount++;
    }
  }

  if (import.meta.env.DEV && invalidatedCount > 0) {
    console.log(`🗑️ [Cache Invalidated] ${invalidatedCount} entries matching "${pattern}"`);
  }

  return invalidatedCount;
};

/**
 * Clear all cache
 */
export const clearCache = () => {
  const size = cache.size;
  cache.clear();

  if (import.meta.env.DEV) {
    console.log(`🗑️ [Cache Cleared] ${size} entries removed`);
  }

  return size;
};

/**
 * Get cache stats
 */
export const getCacheStats = () => {
  let expired = 0;
  let valid = 0;
  let totalSize = 0;

  for (const [key, entry] of cache.entries()) {
    if (entry.isExpired()) {
      expired++;
    } else {
      valid++;
    }
    totalSize += JSON.stringify(entry.data).length;
  }

  return {
    total: cache.size,
    valid,
    expired,
    size: `${(totalSize / 1024).toFixed(2)} KB`,
  };
};

/**
 * Clean expired entries
 */
export const cleanExpiredCache = () => {
  let cleanedCount = 0;

  for (const [key, entry] of cache.entries()) {
    if (entry.isExpired()) {
      cache.delete(key);
      cleanedCount++;
    }
  }

  if (import.meta.env.DEV && cleanedCount > 0) {
    console.log(`🧹 [Cache Cleaned] ${cleanedCount} expired entries removed`);
  }

  return cleanedCount;
};

// Auto-clean expired cache every minute
if (typeof window !== 'undefined') {
  setInterval(cleanExpiredCache, 60000);
}

// Export cache utilities
export default {
  get: getCachedData,
  set: setCachedData,
  invalidate: invalidateCache,
  clear: clearCache,
  stats: getCacheStats,
  clean: cleanExpiredCache,
};
