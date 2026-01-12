/**
 * Unit Tests - NotificationCenter Component
 * Issue #348: Add Unit Tests for Core Components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationCenter from '../../../src/components/NotificationCenter';

// Mock dependencies
const mockMarkAllAsRead = vi.fn();
const mockClearAll = vi.fn();

vi.mock('../../../src/context/NotificationContext', () => ({
    useNotifications: vi.fn(() => ({
        notifications: [
            {
                id: '1',
                type: 'like',
                message: 'John liked your post',
                read: false,
                timestamp: '2 hours ago',
            },
            {
                id: '2',
                type: 'comment',
                message: 'Jane commented on your post',
                read: false,
                timestamp: '3 hours ago',
            },
            {
                id: '3',
                type: 'follow',
                message: 'Bob started following you',
                read: true,
                timestamp: '1 day ago',
            },
        ],
        unreadCount: 2,
        markAllAsRead: mockMarkAllAsRead,
        clearAll: mockClearAll,
        loading: false,
    })),
}));

vi.mock('../../../src/api/endpoints', () => ({
    notificationsApi: {
        getAll: vi.fn(({ page }) =>
            Promise.resolve({
                notifications: page === 1 ? [
                    { id: '4', type: 'like', message: 'New notification', read: false },
                ] : [],
                hasMore: page === 1,
            })
        ),
    },
}));

vi.mock('../../../src/components/NotificationItem', () => ({
    default: ({ notification }) => (
        <div data-testid={`notification-${notification.id}`}>
            <span>{notification.message}</span>
            {!notification.read && <span data-testid="unread-indicator">•</span>}
        </div>
    ),
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

describe('NotificationCenter Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.confirm = vi.fn(() => true);
    });

    describe('Rendering', () => {
        it('should render the component with header', () => {
            render(<NotificationCenter />);

            expect(screen.getByText('Notifications')).toBeInTheDocument();
        });

        it('should display unread count badge', () => {
            render(<NotificationCenter />);

            expect(screen.getByText('2')).toBeInTheDocument();
        });

        it('should not display badge when unread count is zero', () => {
            const { useNotifications } = require('../../../src/context/NotificationContext');
            useNotifications.mockReturnValue({
                notifications: [],
                unreadCount: 0,
                markAllAsRead: mockMarkAllAsRead,
                clearAll: mockClearAll,
                loading: false,
            });

            render(<NotificationCenter />);

            expect(screen.queryByText('2')).not.toBeInTheDocument();
        });

        it('should render all notifications', () => {
            render(<NotificationCenter />);

            expect(screen.getByText('John liked your post')).toBeInTheDocument();
            expect(screen.getByText('Jane commented on your post')).toBeInTheDocument();
            expect(screen.getByText('Bob started following you')).toBeInTheDocument();
        });

        it('should render filter tabs', () => {
            render(<NotificationCenter />);

            expect(screen.getByText('All')).toBeInTheDocument();
            expect(screen.getByText('Likes')).toBeInTheDocument();
            expect(screen.getByText('Comments')).toBeInTheDocument();
            expect(screen.getByText('Follows')).toBeInTheDocument();
            expect(screen.getByText('Mentions')).toBeInTheDocument();
            expect(screen.getByText('Shares')).toBeInTheDocument();
            expect(screen.getByText('Replies')).toBeInTheDocument();
        });
    });

    describe('Action Buttons', () => {
        it('should show "Mark all as read" button when there are unread notifications', () => {
            render(<NotificationCenter />);

            expect(screen.getByText('Mark all as read')).toBeInTheDocument();
        });

        it('should not show "Mark all as read" button when all notifications are read', () => {
            const { useNotifications } = require('../../../src/context/NotificationContext');
            useNotifications.mockReturnValue({
                notifications: [
                    { id: '1', type: 'like', message: 'Test', read: true },
                ],
                unreadCount: 0,
                markAllAsRead: mockMarkAllAsRead,
                clearAll: mockClearAll,
                loading: false,
            });

            render(<NotificationCenter />);

            expect(screen.queryByText('Mark all as read')).not.toBeInTheDocument();
        });

        it('should call markAllAsRead when button is clicked', async () => {
            const user = userEvent.setup();
            render(<NotificationCenter />);

            const markAllButton = screen.getByText('Mark all as read');
            await user.click(markAllButton);

            expect(mockMarkAllAsRead).toHaveBeenCalledTimes(1);
        });

        it('should show "Clear all" button when there are notifications', () => {
            render(<NotificationCenter />);

            expect(screen.getByText('Clear all')).toBeInTheDocument();
        });

        it('should not show "Clear all" button when there are no notifications', () => {
            const { useNotifications } = require('../../../src/context/NotificationContext');
            useNotifications.mockReturnValue({
                notifications: [],
                unreadCount: 0,
                markAllAsRead: mockMarkAllAsRead,
                clearAll: mockClearAll,
                loading: false,
            });

            render(<NotificationCenter />);

            expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
        });

        it('should show confirmation dialog when clearing all notifications', async () => {
            const user = userEvent.setup();
            render(<NotificationCenter />);

            const clearAllButton = screen.getByText('Clear all');
            await user.click(clearAllButton);

            expect(global.confirm).toHaveBeenCalledWith(
                'Are you sure you want to clear all notifications?'
            );
        });

        it('should call clearAll when confirmation is accepted', async () => {
            const user = userEvent.setup();
            global.confirm = vi.fn(() => true);
            render(<NotificationCenter />);

            const clearAllButton = screen.getByText('Clear all');
            await user.click(clearAllButton);

            expect(mockClearAll).toHaveBeenCalledTimes(1);
        });

        it('should not call clearAll when confirmation is rejected', async () => {
            const user = userEvent.setup();
            global.confirm = vi.fn(() => false);
            render(<NotificationCenter />);

            const clearAllButton = screen.getByText('Clear all');
            await user.click(clearAllButton);

            expect(mockClearAll).not.toHaveBeenCalled();
        });
    });

    describe('Filtering', () => {
        it('should highlight "All" filter by default', () => {
            render(<NotificationCenter />);

            const allButton = screen.getByText('All');
            expect(allButton.className).toContain('bg-blue-600');
        });

        it('should filter notifications by type when filter is clicked', async () => {
            const user = userEvent.setup();
            render(<NotificationCenter />);

            const likesButton = screen.getByText('Likes');
            await user.click(likesButton);

            await waitFor(() => {
                expect(likesButton.className).toContain('bg-blue-600');
            });
        });

        it('should show only like notifications when "Likes" filter is active', async () => {
            const user = userEvent.setup();
            render(<NotificationCenter />);

            const likesButton = screen.getByText('Likes');
            await user.click(likesButton);

            await waitFor(() => {
                expect(screen.getByText('John liked your post')).toBeInTheDocument();
                expect(screen.queryByText('Jane commented on your post')).not.toBeInTheDocument();
                expect(screen.queryByText('Bob started following you')).not.toBeInTheDocument();
            });
        });

        it('should show only comment notifications when "Comments" filter is active', async () => {
            const user = userEvent.setup();
            render(<NotificationCenter />);

            const commentsButton = screen.getByText('Comments');
            await user.click(commentsButton);

            await waitFor(() => {
                expect(screen.queryByText('John liked your post')).not.toBeInTheDocument();
                expect(screen.getByText('Jane commented on your post')).toBeInTheDocument();
                expect(screen.queryByText('Bob started following you')).not.toBeInTheDocument();
            });
        });

        it('should show only follow notifications when "Follows" filter is active', async () => {
            const user = userEvent.setup();
            render(<NotificationCenter />);

            const followsButton = screen.getByText('Follows');
            await user.click(followsButton);

            await waitFor(() => {
                expect(screen.queryByText('John liked your post')).not.toBeInTheDocument();
                expect(screen.queryByText('Jane commented on your post')).not.toBeInTheDocument();
                expect(screen.getByText('Bob started following you')).toBeInTheDocument();
            });
        });

        it('should show all notifications when switching back to "All" filter', async () => {
            const user = userEvent.setup();
            render(<NotificationCenter />);

            // First filter by likes
            const likesButton = screen.getByText('Likes');
            await user.click(likesButton);

            // Then switch back to all
            const allButton = screen.getByText('All');
            await user.click(allButton);

            await waitFor(() => {
                expect(screen.getByText('John liked your post')).toBeInTheDocument();
                expect(screen.getByText('Jane commented on your post')).toBeInTheDocument();
                expect(screen.getByText('Bob started following you')).toBeInTheDocument();
            });
        });
    });

    describe('Loading State', () => {
        it('should show loading spinner when loading', () => {
            const { useNotifications } = require('../../../src/context/NotificationContext');
            useNotifications.mockReturnValue({
                notifications: [],
                unreadCount: 0,
                markAllAsRead: mockMarkAllAsRead,
                clearAll: mockClearAll,
                loading: true,
            });

            render(<NotificationCenter />);

            // Should show loading icon (mdi:loading)
            const loadingElement = screen.getByText((content, element) => {
                return element.tagName.toLowerCase() === 'div' &&
                    element.className.includes('animate-spin');
            });
            expect(loadingElement).toBeInTheDocument();
        });

        it('should not show notifications while loading', () => {
            const { useNotifications } = require('../../../src/context/NotificationContext');
            useNotifications.mockReturnValue({
                notifications: [
                    { id: '1', type: 'like', message: 'Test', read: false },
                ],
                unreadCount: 1,
                markAllAsRead: mockMarkAllAsRead,
                clearAll: mockClearAll,
                loading: true,
            });

            render(<NotificationCenter />);

            expect(screen.queryByText('Test')).not.toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('should show empty state when there are no notifications', () => {
            const { useNotifications } = require('../../../src/context/NotificationContext');
            useNotifications.mockReturnValue({
                notifications: [],
                unreadCount: 0,
                markAllAsRead: mockMarkAllAsRead,
                clearAll: mockClearAll,
                loading: false,
            });

            render(<NotificationCenter />);

            expect(screen.getByText('No notifications yet')).toBeInTheDocument();
            expect(screen.getByText(/you're all caught up/i)).toBeInTheDocument();
        });

        it('should show filter-specific empty message', async () => {
            const user = userEvent.setup();
            render(<NotificationCenter />);

            const mentionsButton = screen.getByText('Mentions');
            await user.click(mentionsButton);

            await waitFor(() => {
                expect(screen.getByText('No notifications yet')).toBeInTheDocument();
                expect(screen.getByText(/no mention notifications to show/i)).toBeInTheDocument();
            });
        });
    });

    describe('Infinite Scroll', () => {
        it('should show "Load more" button when there are more notifications', () => {
            render(<NotificationCenter />);

            expect(screen.getByText('Load more')).toBeInTheDocument();
        });

        it('should load more notifications when "Load more" is clicked', async () => {
            const { notificationsApi } = require('../../../src/api/endpoints');
            const user = userEvent.setup();
            render(<NotificationCenter />);

            const loadMoreButton = screen.getByText('Load more');
            await user.click(loadMoreButton);

            await waitFor(() => {
                expect(notificationsApi.getAll).toHaveBeenCalled();
            });
        });

        it('should show loading spinner while loading more', async () => {
            const { notificationsApi } = require('../../../src/api/endpoints');
            notificationsApi.getAll.mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve({ notifications: [], hasMore: false }), 100))
            );

            const user = userEvent.setup();
            render(<NotificationCenter />);

            const loadMoreButton = screen.getByText('Load more');
            await user.click(loadMoreButton);

            // Should show loading spinner
            await waitFor(() => {
                const loadingIcon = screen.getByText((content, element) => {
                    return element.className && element.className.includes('animate-spin');
                });
                expect(loadingIcon).toBeInTheDocument();
            });
        });

        it('should hide "Load more" button when no more notifications', async () => {
            const { notificationsApi } = require('../../../src/api/endpoints');
            notificationsApi.getAll.mockResolvedValueOnce({
                notifications: [],
                hasMore: false,
            });

            const user = userEvent.setup();
            render(<NotificationCenter />);

            const loadMoreButton = screen.getByText('Load more');
            await user.click(loadMoreButton);

            await waitFor(() => {
                expect(screen.queryByText('Load more')).not.toBeInTheDocument();
            });
        });

        it('should handle load more errors gracefully', async () => {
            const { notificationsApi } = require('../../../src/api/endpoints');
            const { toast } = require('react-hot-toast');
            notificationsApi.getAll.mockRejectedValueOnce(new Error('Network error'));

            const user = userEvent.setup();
            render(<NotificationCenter />);

            const loadMoreButton = screen.getByText('Load more');
            await user.click(loadMoreButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Failed to load more notifications');
            });
        });
    });

    describe('Accessibility', () => {
        it('should have proper heading structure', () => {
            render(<NotificationCenter />);

            const heading = screen.getByText('Notifications');
            expect(heading.tagName).toBe('H1');
        });

        it('should have accessible filter buttons', () => {
            render(<NotificationCenter />);

            const allButton = screen.getByText('All');
            expect(allButton.tagName).toBe('BUTTON');
        });

        it('should have accessible action buttons', () => {
            render(<NotificationCenter />);

            const markAllButton = screen.getByText('Mark all as read');
            expect(markAllButton.tagName).toBe('BUTTON');

            const clearAllButton = screen.getByText('Clear all');
            expect(clearAllButton.tagName).toBe('BUTTON');
        });
    });

    describe('Edge Cases', () => {
        it('should handle notifications with missing data gracefully', () => {
            const { useNotifications } = require('../../../src/context/NotificationContext');
            useNotifications.mockReturnValue({
                notifications: [
                    { id: '1', type: 'like', message: '', read: false },
                ],
                unreadCount: 1,
                markAllAsRead: mockMarkAllAsRead,
                clearAll: mockClearAll,
                loading: false,
            });

            render(<NotificationCenter />);

            expect(screen.getByTestId('notification-1')).toBeInTheDocument();
        });

        it('should handle very large notification counts', () => {
            const { useNotifications } = require('../../../src/context/NotificationContext');
            useNotifications.mockReturnValue({
                notifications: Array.from({ length: 100 }, (_, i) => ({
                    id: `${i}`,
                    type: 'like',
                    message: `Notification ${i}`,
                    read: false,
                })),
                unreadCount: 999,
                markAllAsRead: mockMarkAllAsRead,
                clearAll: mockClearAll,
                loading: false,
            });

            render(<NotificationCenter />);

            expect(screen.getByText('999')).toBeInTheDocument();
        });

        it('should handle rapid filter switching', async () => {
            const user = userEvent.setup({ delay: null });
            render(<NotificationCenter />);

            const likesButton = screen.getByText('Likes');
            const commentsButton = screen.getByText('Comments');
            const allButton = screen.getByText('All');

            await user.click(likesButton);
            await user.click(commentsButton);
            await user.click(allButton);
            await user.click(likesButton);

            // Should not crash and should show correct filter
            expect(likesButton.className).toContain('bg-blue-600');
        });

        it('should handle notifications with unknown types', () => {
            const { useNotifications } = require('../../../src/context/NotificationContext');
            useNotifications.mockReturnValue({
                notifications: [
                    { id: '1', type: 'unknown_type', message: 'Unknown notification', read: false },
                ],
                unreadCount: 1,
                markAllAsRead: mockMarkAllAsRead,
                clearAll: mockClearAll,
                loading: false,
            });

            render(<NotificationCenter />);

            expect(screen.getByText('Unknown notification')).toBeInTheDocument();
        });
    });

    describe('Scroll Behavior', () => {
        it('should trigger load more on scroll to bottom', async () => {
            const { notificationsApi } = require('../../../src/api/endpoints');
            render(<NotificationCenter />);

            // Simulate scroll to bottom
            Object.defineProperty(window, 'innerHeight', { value: 1000, writable: true });
            Object.defineProperty(document.documentElement, 'scrollTop', { value: 1000, writable: true });
            Object.defineProperty(document.documentElement, 'offsetHeight', { value: 1500, writable: true });

            window.dispatchEvent(new Event('scroll'));

            await waitFor(() => {
                expect(notificationsApi.getAll).toHaveBeenCalled();
            });
        });
    });
});
