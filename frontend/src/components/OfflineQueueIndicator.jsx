import React, { useState } from 'react';
import useOfflineQueue from '../hooks/useOfflineQueue';
import { Icon } from '@iconify/react';

const OfflineQueueIndicator = () => {
    const { queuedCount, processQueue, clearQueue } = useOfflineQueue();
    const [isOpen, setIsOpen] = useState(false);

    // Only show if there are queued items or we are offline
    const isOffline = !navigator.onLine;

    // We can use a window event listener to update offline state dynamically
    const [onlineStatus, setOnlineStatus] = React.useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

    React.useEffect(() => {
        const handleOnline = () => setOnlineStatus(true);
        const handleOffline = () => setOnlineStatus(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (queuedCount === 0 && onlineStatus) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center p-2 rounded-full transition-colors ${!onlineStatus ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                    }`}
                title={!onlineStatus ? "You are offline" : `${queuedCount} pending actions`}
            >
                <Icon icon={!onlineStatus ? "mdi:wifi-off" : "mdi:sync"} className={`w-6 h-6 ${onlineStatus && queuedCount > 0 ? "animate-spin-slow" : ""}`} />
                {queuedCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                        {queuedCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-50 p-4">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Icon icon="mdi:cloud-sync" />
                            Pending Actions
                        </h3>

                        {!onlineStatus && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded text-sm mb-3">
                                You are currently offline. Actions will be synced when connection is restored.
                            </div>
                        )}

                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            You have {queuedCount} action{queuedCount !== 1 ? 's' : ''} waiting to be synced.
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    processQueue();
                                    setIsOpen(false);
                                }}
                                disabled={!onlineStatus || queuedCount === 0}
                                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sync Now
                            </button>
                            <button
                                onClick={() => {
                                    clearQueue();
                                    setIsOpen(false);
                                }}
                                disabled={queuedCount === 0}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm font-medium disabled:opacity-50"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default OfflineQueueIndicator;
