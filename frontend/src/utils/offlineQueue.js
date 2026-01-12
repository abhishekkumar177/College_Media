import { openDB, addRequestToDB, getAllRequestsFromDB, deleteRequestFromDB, updateRequestInDB, clearQueueDB } from './indexedDB';
import axios from 'axios';

class OfflineQueue {
    constructor() {
        this.listeners = [];
        this.processing = false;

        // Listen for online status
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                this.processQueue();
            });
        }
    }

    async add(config) {
        const request = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            url: config.url,
            method: config.method,
            data: config.data,
            headers: config.headers,
            timestamp: Date.now(),
            retries: 0
        };

        try {
            await addRequestToDB(request);
            this.notifyListeners();

            // Register background sync if available
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                try {
                    const swRegistration = await navigator.serviceWorker.ready;
                    await swRegistration.sync.register('sync-offline-queue');
                } catch (err) {
                    console.warn('Background sync registration failed:', err);
                }
            }
        } catch (error) {
            console.error('Failed to add request to offline queue:', error);
        }
    }

    async getQueuedCount() {
        try {
            const requests = await getAllRequestsFromDB();
            return requests.length;
        } catch (error) {
            return 0;
        }
    }

    async processQueue() {
        if (this.processing || !navigator.onLine) return;

        this.processing = true;
        try {
            const requests = await getAllRequestsFromDB();

            for (const request of requests) {
                try {
                    await this.executeRequest(request);
                    await deleteRequestFromDB(request.id);
                } catch (error) {
                    console.error(`Failed to retry request ${request.id}:`, error);

                    if (request.retries >= 3) {
                        // Max retries reached, remove from queue
                        await deleteRequestFromDB(request.id);
                    } else {
                        // Increment retry count
                        request.retries += 1;
                        await updateRequestInDB(request);
                    }
                }
            }
        } catch (error) {
            console.error('Error processing offline queue:', error);
        } finally {
            this.processing = false;
            this.notifyListeners();
        }
    }

    async executeRequest(request) {
        // Reconstruct the request
        // Note: We avoid importing apiClient to prevent circular dependencies.
        // Instead we use a fresh axios instance or just axios.
        // We assume the token in headers might be stale, so we might want to refresh it here
        // But for simplicity, we use the stored headers or get current token.

        const token = localStorage.getItem('token');
        const headers = { ...request.headers };
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return axios({
            url: request.url,
            method: request.method,
            data: request.data,
            headers: headers,
            baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Mirroring client.js
        });
    }

    async clearQueue() {
        await clearQueueDB();
        this.notifyListeners();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        // Initial call
        this.getQueuedCount().then(count => listener(count));

        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notifyListeners() {
        this.getQueuedCount().then(count => {
            this.listeners.forEach(listener => listener(count));
        });
    }
}

export const offlineQueue = new OfflineQueue();
export default offlineQueue;
