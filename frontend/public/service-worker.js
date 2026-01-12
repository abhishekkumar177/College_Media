/**
 * Service Worker - PWA Offline Support
 * Issue #249: Progressive Web App Implementation
 */

const CACHE_NAME = 'college-media-v1';
const OFFLINE_URL = '/offline.html';

// Static assets to cache on install
const STATIC_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// API cache configuration
const API_CACHE_NAME = 'college-media-api-v1';
const IMAGE_CACHE_NAME = 'college-media-images-v1';

// Cache size limits
const MAX_API_CACHE = 50;
const MAX_IMAGE_CACHE = 100;

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_CACHE);
    }).catch((err) => {
      console.error('Failed to cache static assets:', err);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) =>
            name !== CACHE_NAME &&
            name !== API_CACHE_NAME &&
            name !== IMAGE_CACHE_NAME
          )
          .map((name) => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Handle API requests - Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response to store in cache
          const responseClone = response.clone();
          caches.open(API_CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
            // Limit cache size
            limitCacheSize(API_CACHE_NAME, MAX_API_CACHE);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request);
        })
    );
    return;
  }

  // Handle images - Stale-while-revalidate
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            cache.put(request, networkResponse.clone());
            limitCacheSize(IMAGE_CACHE_NAME, MAX_IMAGE_CACHE);
            return networkResponse;
          });

          // Return cached response immediately, update cache in background
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Handle other requests - Cache first, network fallback
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, response.clone());
          return response;
        });
      });
    })
  );
});

// Background sync for offline POST requests
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPosts());
  } else if (event.tag === 'sync-comments') {
    event.waitUntil(syncComments());
  } else if (event.tag === 'sync-offline-queue') {
    event.waitUntil(syncOfflineQueue());
  }
});

// ... (existing push/notification handlers) ...

// Sync offline queue (generic)
async function syncOfflineQueue() {
  try {
    const db = await openQueueDB();
    const requests = await getAllQueueRequests(db);

    for (const request of requests) {
      try {
        // Re-execute the request
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(request.data), // Axios stores data as 'data', fetch needs body string
        });

        if (response.ok) {
          await deleteQueueRequest(db, request.id);
          console.log('Offline request synced:', request.id);
        } else {
          // If failed, we might want to update retry count or just leave it for main thread to handle
          // Since this is background sync, we'll leave it. Main thread logic handles complex retries.
          // Or we could delete if 4xx error (except 408/429).
          if (response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429) {
            await deleteQueueRequest(db, request.id);
          }
        }
      } catch (err) {
        console.error('Failed to sync offline request:', err);
      }
    }
  } catch (err) {
    console.error('Sync offline queue error:', err);
  }
}

// Queue DB Helpers (separate DB for generic queue)
function openQueueDB() {
  return new Promise((resolve, reject) => {
    // Check frontend/src/utils/indexedDB.js for DB_NAME
    const request = indexedDB.open('offline-queue-db', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    // Upgrade should be handled by frontend, but good to have fallback if SW runs first? 
    // Usually frontend opens it first.
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('requests')) {
        db.createObjectStore('requests', { keyPath: 'id' });
      }
    };
  });
}

function getAllQueueRequests(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('requests', 'readonly');
    const store = transaction.objectStore('requests');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deleteQueueRequest(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('requests', 'readwrite');
    const store = transaction.objectStore('requests');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Sync posts when back online
async function syncPosts() {
  try {
    const db = await openIndexedDB();
    const posts = await getAllPendingPosts(db);

    for (const post of posts) {
      try {
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(post),
        });

        if (response.ok) {
          await deletePendingPost(db, post.id);
          console.log('Post synced:', post.id);
        }
      } catch (err) {
        console.error('Failed to sync post:', err);
      }
    }
  } catch (err) {
    console.error('Sync posts error:', err);
  }
}

// Sync comments when back online
async function syncComments() {
  try {
    const db = await openIndexedDB();
    const comments = await getAllPendingComments(db);

    for (const comment of comments) {
      try {
        const response = await fetch(`/api/posts/${comment.postId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(comment),
        });

        if (response.ok) {
          await deletePendingComment(db, comment.id);
          console.log('Comment synced:', comment.id);
        }
      } catch (err) {
        console.error('Failed to sync comment:', err);
      }
    }
  } catch (err) {
    console.error('Sync comments error:', err);
  }
}

// IndexedDB helpers
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('college-media-db', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-posts')) {
        db.createObjectStore('pending-posts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pending-comments')) {
        db.createObjectStore('pending-comments', { keyPath: 'id' });
      }
    };
  });
}

function getAllPendingPosts(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pending-posts', 'readonly');
    const store = transaction.objectStore('pending-posts');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function getAllPendingComments(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pending-comments', 'readonly');
    const store = transaction.objectStore('pending-comments');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deletePendingPost(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pending-posts', 'readwrite');
    const store = transaction.objectStore('pending-posts');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

function deletePendingComment(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pending-comments', 'readwrite');
    const store = transaction.objectStore('pending-comments');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
