import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

// Mock the auth context
const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  login: jest.fn(),
  logout: jest.fn(),
  loading: false,
  error: null
};

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => <div>{children}</div>
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContext.user = null;
    mockAuthContext.isAuthenticated = false;
    mockAuthContext.login.mockClear();
    mockAuthContext.logout.mockClear();
    mockAuthContext.loading = false;
    mockAuthContext.error = null;
  });

  test('renders login form', () => {
    renderWithRouter(<Login />);

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('displays login form fields correctly', () => {
    renderWithRouter(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('allows user to type in email field', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');

    expect(emailInput.value).toBe('test@example.com');
  });

  test('allows user to type in password field', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Login />);

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'password123');

    expect(passwordInput.value).toBe('password123');
  });

  test('calls login function when form is submitted', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(mockAuthContext.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  test('shows loading state during login', async () => {
    mockAuthContext.loading = true;
    const user = userEvent.setup();
    renderWithRouter(<Login />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/signing in/i);
  });

  test('displays error message when login fails', () => {
    mockAuthContext.error = 'Invalid credentials';
    renderWithRouter(<Login />);

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  test('has link to register page', () => {
    renderWithRouter(<Login />);

    const registerLink = screen.getByText(/don't have an account/i);
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });

  test('validates required fields', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Login />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Try to submit empty form
    await user.click(submitButton);

    // Should still call login (validation happens in context)
    expect(mockAuthContext.login).toHaveBeenCalledWith({
      email: '',
      password: ''
    });
  });

  test('prevents multiple submissions', async () => {
    mockAuthContext.loading = true;
    const user = userEvent.setup();
    renderWithRouter(<Login />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.click(submitButton);

    // Should not call login again when loading
    expect(mockAuthContext.login).not.toHaveBeenCalled();
  });
});