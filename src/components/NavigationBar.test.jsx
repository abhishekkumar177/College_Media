import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NavigationBar from './NavigationBar';

describe('NavigationBar', () => {
  test('renders navigation bar with logo and search', () => {
    const mockOnSearchChange = jest.fn();
    render(<NavigationBar searchQuery="" onSearchChange={mockOnSearchChange} />);

    expect(screen.getByText('InstaClone')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.getByText('Create Post')).toBeInTheDocument();
  });

  test('displays search query value', () => {
    const mockOnSearchChange = jest.fn();
    render(<NavigationBar searchQuery="test search" onSearchChange={mockOnSearchChange} />);

    const searchInput = screen.getByDisplayValue('test search');
    expect(searchInput).toBeInTheDocument();
  });

  test('calls onSearchChange when search input changes', async () => {
    const user = userEvent.setup();
    const mockOnSearchChange = jest.fn();
    render(<NavigationBar searchQuery="" onSearchChange={mockOnSearchChange} />);

    const searchInput = screen.getByPlaceholderText('Search');
    await user.type(searchInput, 'new search');

    expect(mockOnSearchChange).toHaveBeenLastCalledWith('new search');
  });

  test('blurs search input on Escape key', async () => {
    const user = userEvent.setup();
    const mockOnSearchChange = jest.fn();
    render(<NavigationBar searchQuery="" onSearchChange={mockOnSearchChange} />);

    const searchInput = screen.getByPlaceholderText('Search');
    await user.click(searchInput);
    expect(searchInput).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(searchInput).not.toHaveFocus();
  });

  test('has proper accessibility attributes', () => {
    const mockOnSearchChange = jest.fn();
    render(<NavigationBar searchQuery="" onSearchChange={mockOnSearchChange} />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByLabelText('InstaClone home')).toBeInTheDocument();
    expect(screen.getByLabelText('Create new post')).toBeInTheDocument();
    expect(screen.getByLabelText('User profile menu')).toBeInTheDocument();
  });
});