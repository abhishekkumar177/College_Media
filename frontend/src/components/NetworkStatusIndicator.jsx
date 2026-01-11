/**
 * NetworkStatusIndicator Component
 * Issue #349: Enhanced API Error Handling and Retry Logic
 * 
 * Displays network status and shows offline/online notifications
 */

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { showOfflineNotification, dismissOfflineNotification } from '../utils/apiErrorHandler';

/**
 * NetworkStatusIndicator Component
 * 
 * Monitors network status and displays visual indicator
 * Shows toast notifications when going offline/online
 * 
 * @component
 * @returns {React.ReactElement|null} Network status indicator or null if online
 */
const NetworkStatusIndicator = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        /**
         * Handle online event
         */
        const handleOnline = () => {
            setIsOnline(true);

            // Only show "back online" message if user was previously offline
            if (wasOffline) {
                dismissOfflineNotification();
                setWasOffline(false);
            }
        };

        /**
         * Handle offline event
         */
        const handleOffline = () => {
            setIsOnline(false);
            setWasOffline(true);
            showOfflineNotification();
        };

        // Add event listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Check initial status
        if (!navigator.onLine) {
            handleOffline();
        }

        // Cleanup
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [wasOffline]);

    // Don't render anything if online
    if (isOnline) {
        return null;
    }

    // Show persistent offline indicator
    return (
        <div
            className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-2 px-4 shadow-lg"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
                <WifiOff className="w-5 h-5 animate-pulse" aria-hidden="true" />
                <span className="font-semibold">
                    No Internet Connection
                </span>
                <span className="hidden sm:inline text-red-100">
                    • Some features may not work properly
                </span>
            </div>
        </div>
    );
};

/**
 * useNetworkStatus Hook
 * 
 * Custom hook to monitor network status
 * 
 * @returns {Object} Network status information
 * 
 * @example
 * const { isOnline, isOffline } = useNetworkStatus();
 */
export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return {
        isOnline,
        isOffline: !isOnline,
    };
};

export default NetworkStatusIndicator;
