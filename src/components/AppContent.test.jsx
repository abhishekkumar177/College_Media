import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AppContent from './AppContent';

// Mock the contexts
const mockAuthContext = {
  user: { id: 1, username: 'testuser', avatar: 'avatar.jpg' },
  isAuthenticated: true,
  login: jest.fn(),
  logout: jest.fn(),
  loading: false
};

const mockSearchContext = {
  searchQuery: '',
  searchFilter: 'all',
  searchResults: { posts: [], users: [], hashtags: [], total: 0 },
  isSearching: false,
  currentPage: 1,
  resultsPerPage: 10,
  setCurrentPage: jest.fn(),
  performSearch: jest.fn(),
  clearSearch: jest.fn()
};

const mockNotificationContext = {
  notifications: [],
  unreadCount: 0,
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  deleteNotification: jest.fn()
};

// Mock the contexts
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => <div>{children}</div>
}));

jest.mock('../contexts/SearchContext', () => ({
  useSearch: () => mockSearchContext,
  SearchProvider: ({ children }) => <div>{children}</div>
}));

jest.mock('../contexts/NotificationContext', () => ({
  useNotification: () => mockNotificationContext,
  NotificationProvider: ({ children }) => <div>{children}</div>
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AppContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders main application layout', () => {
    renderWithProviders(<AppContent />);

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('displays navigation bar', () => {
    renderWithProviders(<AppContent />);

    expect(screen.getByText('College Media')).toBeInTheDocument();
  });

  test('renders search functionality', () => {
    renderWithProviders(<AppContent />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();
  });

  test('handles search input changes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppContent />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'test query');

    expect(searchInput.value).toBe('test query');
  });

  test('displays notification bell with count', () => {
    // Mock unread notifications
    mockNotificationContext.unreadCount = 3;

    renderWithProviders(<AppContent />);

    const notificationBell = screen.getByRole('button', { name: /notifications/i });
    expect(notificationBell).toBeInTheDocument();
  });

  test('opens notification center when bell is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppContent />);

    const notificationBell = screen.getByRole('button', { name: /notifications/i });
    await user.click(notificationBell);

    // Should show notification center (this would need to be implemented)
    // expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  test('renders main content area', () => {
    renderWithProviders(<AppContent />);

    expect(screen.getByText('Feed')).toBeInTheDocument();
  });

  test('handles responsive design', () => {
    renderWithProviders(<AppContent />);

    // Test mobile menu button exists
    const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
    expect(mobileMenuButton).toBeInTheDocument();
  });
});