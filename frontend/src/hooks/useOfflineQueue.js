import { useState, useEffect } from 'react';
import offlineQueue from '../utils/offlineQueue';

const useOfflineQueue = () => {
    const [queuedCount, setQueuedCount] = useState(0);

    useEffect(() => {
        // Subscribe to queue changes
        const unsubscribe = offlineQueue.subscribe((count) => {
            setQueuedCount(count);
        });

        return () => unsubscribe();
    }, []);

    const processQueue = () => {
        offlineQueue.processQueue();
    };

    const clearQueue = () => {
        offlineQueue.clearQueue();
    };

    return {
        queuedCount,
        processQueue,
        clearQueue
    };
};

export default useOfflineQueue;
