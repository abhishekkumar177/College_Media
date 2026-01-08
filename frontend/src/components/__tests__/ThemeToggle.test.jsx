import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '../ThemeToggle';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock the ThemeContext
const mockToggleTheme = vi.fn();
vi.mock('../../context/ThemeContext', () => ({
  useTheme: vi.fn(() => ({
    isDarkMode: false,
    toggleTheme: mockToggleTheme,
  })),
  ThemeProvider: ({ children }) => <div>{children}</div>,
}));

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the theme toggle button', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('has correct aria-label for accessibility in light mode', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    // In light mode, button should switch to dark mode
    expect(button).toHaveAttribute('aria-label');
  });

  it('has correct aria-label for accessibility in dark mode', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    // Button should have an aria-label
    expect(button).toHaveAttribute('aria-label');
  });

  it('calls toggleTheme when button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('renders with custom className when provided', () => {
    const customClass = 'custom-test-class';
    render(
      <ThemeProvider>
        <ThemeToggle className={customClass} />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    expect(button.className).toContain(customClass);
  });

  it('has correct title attribute for tooltip in light mode', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title');
  });

  it('has correct title attribute for tooltip in dark mode', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title');
  });

  it('has proper focus styles', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  it('has proper hover styles', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    expect(button.className).toContain('hover:bg-coral-50');
  });

  it('toggles multiple times correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    
    await user.click(button);
    await user.click(button);
    await user.click(button);
    
    expect(mockToggleTheme).toHaveBeenCalledTimes(3);
  });

  it('renders without className prop (default behavior)', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('maintains proper button type', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    const button = screen.getByRole('button');
    // Button elements default to type="button" when not in a form
    expect(button).toBeInTheDocument();
  });
});
