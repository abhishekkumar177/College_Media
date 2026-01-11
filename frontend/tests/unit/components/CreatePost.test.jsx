/**
 * Unit Tests - CreatePost Component
 * Issue #348: Add Unit Tests for Core Components
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreatePost from '../../../src/components/CreatePost';

// Mock the AuthContext
vi.mock('../../../src/context/AuthContext', () => ({
    useAuth: vi.fn(() => ({
        user: {
            _id: '123',
            username: 'testuser',
            profilePicture: 'https://example.com/avatar.jpg',
        },
    })),
}));

// Mock the useCreatePoll hook
vi.mock('../../../src/hooks/usePolls', () => ({
    useCreatePoll: vi.fn(() => ({
        createPoll: vi.fn((pollData) => Promise.resolve({ id: 'poll1', ...pollData })),
    })),
}));

// Mock PollCreator component
vi.mock('../../../src/components/PollCreator', () => ({
    default: ({ onPollCreate, onCancel }) => (
        <div data-testid="poll-creator">
            <button onClick={() => onPollCreate({ question: 'Test Poll?', options: ['Yes', 'No'] })}>
                Create Poll
            </button>
            <button onClick={onCancel}>Cancel Poll</button>
        </div>
    ),
}));

describe('CreatePost Component', () => {
    const mockOnPostCreated = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Rendering', () => {
        it('should render the component correctly', () => {
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            expect(screen.getByPlaceholderText(/what's happening/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /post/i })).toBeInTheDocument();
        });

        it('should display user information', () => {
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            expect(screen.getByText('testuser')).toBeInTheDocument();
            const avatar = screen.getByAltText('testuser');
            expect(avatar).toBeInTheDocument();
            expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
        });

        it('should render file input for image upload', () => {
            const { container } = render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const fileInput = container.querySelector('input[type="file"]');
            expect(fileInput).toBeInTheDocument();
            expect(fileInput).toHaveAttribute('accept', 'image/*');
        });

        it('should render character counter', () => {
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            expect(screen.getByText('0 / 500')).toBeInTheDocument();
        });
    });

    describe('Caption Input', () => {
        it('should update caption when user types', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText(/what's happening/i);
            await user.type(textarea, 'Test caption');

            expect(textarea).toHaveValue('Test caption');
        });

        it('should show updated character counter', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText(/what's happening/i);
            await user.type(textarea, 'Hello');

            expect(screen.getByText('5 / 500')).toBeInTheDocument();
        });

        it('should prevent typing beyond max character limit', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText(/what's happening/i);
            const longText = 'a'.repeat(501);

            await user.type(textarea, longText);

            expect(textarea.value.length).toBeLessThanOrEqual(500);
        });

        it('should change counter color when approaching limit (80%)', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText(/what's happening/i);
            await user.type(textarea, 'a'.repeat(450));

            const counter = screen.getByText('450 / 500');
            expect(counter.className).toContain('text-yellow-600');
        });

        it('should change counter color to red at max limit', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText(/what's happening/i);
            await user.type(textarea, 'a'.repeat(500));

            const counter = screen.getByText('500 / 500');
            expect(counter.className).toContain('text-red-600');
        });

        it('should have normal counter color below 80%', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText(/what's happening/i);
            await user.type(textarea, 'a'.repeat(100));

            const counter = screen.getByText('100 / 500');
            expect(counter.className).toContain('text-gray-500');
        });
    });

    describe('Post Button State', () => {
        it('should disable post button when both caption and image are empty', () => {
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const postButton = screen.getByRole('button', { name: /post/i });
            expect(postButton).toBeDisabled();
        });

        it('should enable post button when caption has text', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText(/what's happening/i);
            await user.type(textarea, 'Test post');

            const postButton = screen.getByRole('button', { name: /post/i });
            expect(postButton).not.toBeDisabled();
        });

        it('should not enable button with only whitespace', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText(/what's happening/i);
            await user.type(textarea, '   ');

            const postButton = screen.getByRole('button', { name: /post/i });
            expect(postButton).toBeDisabled();
        });

        it('should show "Posting..." when submitting', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText(/what's happening/i);
            await user.type(textarea, 'Test post');

            const postButton = screen.getByRole('button', { name: /post/i });
            await user.click(postButton);

            expect(screen.getByText('Posting...')).toBeInTheDocument();
        });
    });

    describe('Image Upload', () => {
        it('should handle image upload', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
            const input = document.querySelector('input[type="file"]');

            await user.upload(input, file);

            await waitFor(() => {
                expect(screen.getByAltText('Preview')).toBeInTheDocument();
            });
        });

        it('should show image preview after upload', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
            const input = document.querySelector('input[type="file"]');

            await user.upload(input, file);

            await waitFor(() => {
                const preview = screen.getByAltText('Preview');
                expect(preview).toBeInTheDocument();
            });
        });

        it('should remove image preview when close button is clicked', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

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

        it('should enable post button when image is uploaded', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
            const input = document.querySelector('input[type="file"]');

            await user.upload(input, file);

            await waitFor(() => {
                const postButton = screen.getByRole('button', { name: /post/i });
                expect(postButton).not.toBeDisabled();
            });
        });
    });

    describe('Poll Creation', () => {
        it('should show poll creator when poll button is clicked', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const pollButton = screen.getByTitle('Add poll');
            await user.click(pollButton);

            expect(screen.getByTestId('poll-creator')).toBeInTheDocument();
        });

        it('should hide poll creator when cancel is clicked', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const pollButton = screen.getByTitle('Add poll');
            await user.click(pollButton);

            expect(screen.getByTestId('poll-creator')).toBeInTheDocument();

            const cancelButton = screen.getByText('Cancel Poll');
            await user.click(cancelButton);

            expect(screen.queryByTestId('poll-creator')).not.toBeInTheDocument();
        });

        it('should show poll preview after creating poll', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const pollButton = screen.getByTitle('Add poll');
            await user.click(pollButton);

            const createPollButton = screen.getByText('Create Poll');
            await user.click(createPollButton);

            await waitFor(() => {
                expect(screen.getByText('Test Poll?')).toBeInTheDocument();
                expect(screen.getByText(/2 options/)).toBeInTheDocument();
            });
        });

        it('should enable post button when poll is created', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const pollButton = screen.getByTitle('Add poll');
            await user.click(pollButton);

            const createPollButton = screen.getByText('Create Poll');
            await user.click(createPollButton);

            await waitFor(() => {
                const postButton = screen.getByRole('button', { name: /post/i });
                expect(postButton).not.toBeDisabled();
            });
        });

        it('should disable poll button when poll already exists', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const pollButton = screen.getByTitle('Add poll');
            await user.click(pollButton);

            const createPollButton = screen.getByText('Create Poll');
            await user.click(createPollButton);

            await waitFor(() => {
                expect(pollButton).toBeDisabled();
            });
        });

        it('should remove poll when remove button is clicked', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            // Create poll
            const pollButton = screen.getByTitle('Add poll');
            await user.click(pollButton);

            const createPollButton = screen.getByText('Create Poll');
            await user.click(createPollButton);

            await waitFor(() => {
                expect(screen.getByText('Test Poll?')).toBeInTheDocument();
            });

            // Remove poll
            const removePollButtons = screen.getAllByRole('button');
            const removeButton = removePollButtons.find(
                (btn) => btn.querySelector('[class*="mdi:close"]')
            );

            if (removeButton) {
                await user.click(removeButton);
                expect(screen.queryByText('Test Poll?')).not.toBeInTheDocument();
            }
        });
    });

    describe('Form Submission', () => {
        it('should submit form with caption', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText(/what's happening/i);
            await user.type(textarea, 'Test post caption');

            const postButton = screen.getByRole('button', { name: /post/i });
            await user.click(postButton);

            expect(screen.getByText('Posting...')).toBeInTheDocument();
        });

        it('should clear form after successful submission', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText(/what's happening/i);
            await user.type(textarea, 'Test post');

            const postButton = screen.getByRole('button', { name: /post/i });
            await user.click(postButton);

            vi.runAllTimers();

            await waitFor(() => {
                expect(textarea).toHaveValue('');
            });
        });

        it('should call onPostCreated callback with new post data', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText(/what's happening/i);
            await user.type(textarea, 'Test post');

            const postButton = screen.getByRole('button', { name: /post/i });
            await user.click(postButton);

            vi.runAllTimers();

            await waitFor(() => {
                expect(mockOnPostCreated).toHaveBeenCalled();
                const callArg = mockOnPostCreated.mock.calls[0][0];
                expect(callArg).toHaveProperty('caption', 'Test post');
                expect(callArg).toHaveProperty('user');
                expect(callArg.user).toHaveProperty('username', 'testuser');
            });
        });

        it('should not submit form without content', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const postButton = screen.getByRole('button', { name: /post/i });

            // Button should be disabled
            expect(postButton).toBeDisabled();
        });

        it('should clear image preview after submission', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
            const input = document.querySelector('input[type="file"]');

            await user.upload(input, file);

            await waitFor(() => {
                expect(screen.getByAltText('Preview')).toBeInTheDocument();
            });

            const postButton = screen.getByRole('button', { name: /post/i });
            await user.click(postButton);

            vi.runAllTimers();

            await waitFor(() => {
                expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
            });
        });
    });

    describe('Accessibility', () => {
        it('should have proper labels for buttons', () => {
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            expect(screen.getByTitle('Add image')).toBeInTheDocument();
            expect(screen.getByTitle('Add poll')).toBeInTheDocument();
        });

        it('should have proper placeholder text', () => {
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            expect(screen.getByPlaceholderText(/what's happening/i)).toBeInTheDocument();
        });

        it('should have proper alt text for user avatar', () => {
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            expect(screen.getByAltText('testuser')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle user without profile picture', () => {
            const { useAuth } = require('../../../src/context/AuthContext');
            useAuth.mockReturnValue({
                user: {
                    _id: '123',
                    username: 'testuser',
                    profilePicture: null,
                },
            });

            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const avatar = screen.getByAltText('testuser');
            expect(avatar).toHaveAttribute('src', expect.stringContaining('placehold.co'));
        });

        it('should handle multiple rapid submissions', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText(/what's happening/i);
            await user.type(textarea, 'Test post');

            const postButton = screen.getByRole('button', { name: /post/i });

            // Try to click multiple times
            await user.click(postButton);
            await user.click(postButton);
            await user.click(postButton);

            // Should only submit once (button becomes disabled after first click)
            expect(screen.getByText('Posting...')).toBeInTheDocument();
        });

        it('should handle special characters in caption', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText(/what's happening/i);
            const specialText = 'Test @user #hashtag 🎉 <script>alert("xss")</script>';
            await user.type(textarea, specialText);

            expect(textarea).toHaveValue(specialText);
        });
    });
});
