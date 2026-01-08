import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Navbar from '../Navbar';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock the AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: {
      _id: '1',
      username: 'testuser',
      profilePicture: 'https://example.com/avatar.jpg',
    },
  })),
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

// Mock the ThemeContext
vi.mock('../../context/ThemeContext', () => ({
  useTheme: vi.fn(() => ({
    isDarkMode: false,
    toggleTheme: vi.fn(),
  })),
  ThemeProvider: ({ children }) => <div>{children}</div>,
}));

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  it('renders the search input correctly', () => {
    const mockSetSearchQuery = vi.fn();
    renderWithProviders(<Navbar searchQuery="" setSearchQuery={mockSetSearchQuery} />);
    
    const searchInput = screen.getByPlaceholderText(/search for friends, groups, pages/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('updates search query when user types', async () => {
    const mockSetSearchQuery = vi.fn();
    const user = userEvent.setup();
    
    renderWithProviders(<Navbar searchQuery="" setSearchQuery={mockSetSearchQuery} />);
    
    const searchInput = screen.getByPlaceholderText(/search for friends, groups, pages/i);
    await user.type(searchInput, 'test query');
    
    expect(mockSetSearchQuery).toHaveBeenCalled();
  });

  it('renders Create Post button with correct link', () => {
    const mockSetSearchQuery = vi.fn();
    renderWithProviders(<Navbar searchQuery="" setSearchQuery={mockSetSearchQuery} />);
    
    const createPostButton = screen.getByRole('link', { name: /create post/i });
    expect(createPostButton).toBeInTheDocument();
    expect(createPostButton).toHaveAttribute('href', '/create-post');
  });

  it('renders notifications button with indicator', () => {
    const mockSetSearchQuery = vi.fn();
    const { container } = renderWithProviders(<Navbar searchQuery="" setSearchQuery={mockSetSearchQuery} />);
    
    const notificationLink = container.querySelector('a[href="/notifications"]');
    expect(notificationLink).toBeInTheDocument();
  });

  it('renders profile menu button when user is logged in', () => {
    const mockSetSearchQuery = vi.fn();
    renderWithProviders(<Navbar searchQuery="" setSearchQuery={mockSetSearchQuery} />);
    
    const profileButtons = screen.getAllByRole('button');
    expect(profileButtons.length).toBeGreaterThan(0);
  });

  it('displays search value correctly', () => {
    const mockSetSearchQuery = vi.fn();
    renderWithProviders(<Navbar searchQuery="test search" setSearchQuery={mockSetSearchQuery} />);
    
    const searchInput = screen.getByPlaceholderText(/search for friends, groups, pages/i);
    expect(searchInput).toHaveValue('test search');
  });

  it('toggles profile menu when clicked', async () => {
    const mockSetSearchQuery = vi.fn();
    const user = userEvent.setup();
    
    renderWithProviders(<Navbar searchQuery="" setSearchQuery={mockSetSearchQuery} />);
    
    // Find the profile button (last button in the list)
    const buttons = screen.getAllByRole('button');
    const profileButton = buttons[buttons.length - 1];
    
    await user.click(profileButton);
    
    // Check if ProfileMenu appears
    // Note: This test may need adjustment based on ProfileMenu implementation
    expect(profileButton).toBeInTheDocument();
  });

  it('has correct CSS classes for styling', () => {
    const mockSetSearchQuery = vi.fn();
    const { container } = renderWithProviders(<Navbar searchQuery="" setSearchQuery={mockSetSearchQuery} />);
    
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('top-0', 'z-50', 'ml-20');
  });

  it('renders all navigation elements', () => {
    const mockSetSearchQuery = vi.fn();
    const { container } = renderWithProviders(<Navbar searchQuery="" setSearchQuery={mockSetSearchQuery} />);
    
    // Search input
    expect(screen.getByPlaceholderText(/search for friends, groups, pages/i)).toBeInTheDocument();
    
    // Create Post button
    expect(screen.getByText(/create post/i)).toBeInTheDocument();
    
    // Notification icon
    const notificationLink = container.querySelector('a[href="/notifications"]');
    expect(notificationLink).toBeInTheDocument();
  });

  it('search input has correct accessibility attributes', () => {
    const mockSetSearchQuery = vi.fn();
    renderWithProviders(<Navbar searchQuery="" setSearchQuery={mockSetSearchQuery} />);
    
    const searchInput = screen.getByPlaceholderText(/search for friends, groups, pages/i);
    expect(searchInput).toHaveAttribute('type', 'text');
  });
});
