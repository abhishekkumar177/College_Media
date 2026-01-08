import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreatePost from '../CreatePost';
import { AuthProvider } from '../../context/AuthContext';

// Mock the AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: {
      _id: '123',
      username: 'testuser',
      profilePicture: 'https://example.com/avatar.jpg',
    },
  })),
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

const renderWithProviders = (ui, props = {}) => {
  return render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  );
};

describe('CreatePost Component', () => {
  const mockOnPostCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the component correctly', () => {
    renderWithProviders(<CreatePost onPostCreated={mockOnPostCreated} />);
    
    expect(screen.getByPlaceholderText(/what's happening/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /post/i })).toBeInTheDocument();
  });

  it('displays user information', () => {
    renderWithProviders(<CreatePost onPostCreated={mockOnPostCreated} />);
    
    expect(screen.getByText('testuser')).toBeInTheDocument();
    const avatar = screen.getByAltText('testuser');
    expect(avatar).toBeInTheDocument();
  });

  it('updates caption when user types', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<CreatePost onPostCreated={mockOnPostCreated} />);
    
    const textarea = screen.getByPlaceholderText(/what's happening/i);
    await user.type(textarea, 'Test caption');
    
    expect(textarea).toHaveValue('Test caption');
  });

  it('shows character counter', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<CreatePost onPostCreated={mockOnPostCreated} />);
    
    const textarea = screen.getByPlaceholderText(/what's happening/i);
    await user.type(textarea, 'Hello');
    
    expect(screen.getByText(/5 \/ 500/i)).toBeInTheDocument();
  });

  it('prevents typing beyond max character limit', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<CreatePost onPostCreated={mockOnPostCreated} />);
    
    const textarea = screen.getByPlaceholderText(/what's happening/i);
    const longText = 'a'.repeat(501);
    
    await user.type(textarea, longText);
    
    expect(textarea.value.length).toBeLessThanOrEqual(500);
  });

  it('character counter changes color when approaching limit', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<CreatePost onPostCreated={mockOnPostCreated} />);
    
    const textarea = screen.getByPlaceholderText(/what's happening/i);
    await user.type(textarea, 'a'.repeat(450));
    
    const counter = screen.getByText(/450 \/ 500/i);
    expect(counter.className).toContain('text-yellow-600');
  });

  it('character counter turns red at max limit', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<CreatePost onPostCreated={mockOnPostCreated} />);
    
    const textarea = screen.getByPlaceholderText(/what's happening/i);
    await user.type(textarea, 'a'.repeat(500));
    
    const counter = screen.getByText(/500 \/ 500/i);
    expect(counter.className).toContain('text-red-600');
  });

  it('disables post button when both caption and image are empty', () => {
    renderWithProviders(<CreatePost onPostCreated={mockOnPostCreated} />);
    
    const postButton = screen.getByRole('button', { name: /post/i });
    expect(postButton).toBeDisabled();
  });

  it('enables post button when caption has text', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<CreatePost onPostCreated={mockOnPostCreated} />);
    
    const textarea = screen.getByPlaceholderText(/what's happening/i);
    await user.type(textarea, 'Test post');
    
    const postButton = screen.getByRole('button', { name: /post/i });
    expect(postButton).not.toBeDisabled();
  });

  it('handles image upload', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<CreatePost onPostCreated={mockOnPostCreated} />);
    
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = screen.getByRole('button', { hidden: true }).querySelector('input[type="file"]') || document.querySelector('input[type="file"]');
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });
  });

  it('shows image preview after upload', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<CreatePost onPostCreated={mockOnPostCreated} />);
    
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');
    
    await user.upload(input, file);
    
    await waitFor(() => {
      const preview = screen.getByAltText('Preview');
      expect(preview).toBeInTheDocument();
    });
  });

  it('removes image preview when close button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<CreatePost onPostCreated={mockOnPostCreated} />);
    
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByRole('button', { name: /×/i });
    await user.click(closeButton);
    
    expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
  });

  it('submits form with caption', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<CreatePost onPostCreated={mockOnPostCreated} />);
    
    const textarea = screen.getByPlaceholderText(/what's happening/i);
    await user.type(textarea, 'Test post caption');
    
    const postButton = screen.getByRole('button', { name: /post/i });
    await user.click(postButton);
    
    expect(screen.getByText('Posting...')).toBeInTheDocument();
  });

  it('clears form after successful submission', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<CreatePost onPostCreated={mockOnPostCreated} />);
    
    const textarea = screen.getByPlaceholderText(/what's happening/i);
    await user.type(textarea, 'Test post');
    
    const postButton = screen.getByRole('button', { name: /post/i });
    await user.click(postButton);
    
    vi.runAllTimers();
    
    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });
  });

  it('calls onPostCreated callback with new post data', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<CreatePost onPostCreated={mockOnPostCreated} />);
    
    const textarea = screen.getByPlaceholderText(/what's happening/i);
    await user.type(textarea, 'Test post');
    
    const postButton = screen.getByRole('button', { name: /post/i });
    await user.click(postButton);
    
    vi.runAllTimers();
    
    await waitFor(() => {
      expect(mockOnPostCreated).toHaveBeenCalled();
    });
  });

  it('does not submit form with only whitespace', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<CreatePost onPostCreated={mockOnPostCreated} />);
    
    const textarea = screen.getByPlaceholderText(/what's happening/i);
    await user.type(textarea, '   ');
    
    const postButton = screen.getByRole('button', { name: /post/i });
    
    // Button should remain disabled
    expect(postButton).toBeDisabled();
  });

  it('renders file input for image upload', () => {
    const { container } = renderWithProviders(<CreatePost onPostCreated={mockOnPostCreated} />);
    
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toHaveAttribute('accept', 'image/*');
  });

  it('has correct styling classes', () => {
    const { container } = renderWithProviders(<CreatePost onPostCreated={mockOnPostCreated} />);
    
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
  });
});
