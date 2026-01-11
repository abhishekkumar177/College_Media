/**
 * Unit Tests - CreatePost Component
 * Tests for post creation form including validation, image upload, and submission
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CreatePost from '../../../src/components/CreatePost';

// Mock AuthContext
const mockUser = {
    _id: '123',
    username: 'testuser',
    profilePicture: 'https://example.com/avatar.jpg',
};

vi.mock('../../../src/context/AuthContext', () => ({
    useAuth: () => ({ user: mockUser }),
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
        it('should render create post form', () => {
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            expect(screen.getByPlaceholderText("What's happening?")).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /post/i })).toBeInTheDocument();
        });

        it('should display user profile picture and username', () => {
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            expect(screen.getByText('testuser')).toBeInTheDocument();
            expect(screen.getByAltText('testuser')).toHaveAttribute(
                'src',
                'https://example.com/avatar.jpg'
            );
        });

        it('should show character counter', () => {
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            expect(screen.getByText('0 / 500')).toBeInTheDocument();
        });

        it('should have file input for image upload', () => {
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const fileInput = screen.getByLabelText(/image/i, { selector: 'input[type="file"]' });
            expect(fileInput).toBeInTheDocument();
            expect(fileInput).toHaveAttribute('accept', 'image/*');
        });
    });

    describe('Caption Input', () => {
        it('should update caption when user types', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText("What's happening?");
            await user.type(textarea, 'Hello World!');

            expect(textarea).toHaveValue('Hello World!');
        });

        it('should update character counter as user types', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText("What's happening?");
            await user.type(textarea, 'Test');

            expect(screen.getByText('4 / 500')).toBeInTheDocument();
        });

        it('should not allow input beyond max length', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText("What's happening?");
            const longText = 'A'.repeat(600); // Exceeds 500 limit

            await user.type(textarea, longText);

            expect(textarea.value.length).toBeLessThanOrEqual(500);
        });

        it('should show warning color when approaching character limit', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText("What's happening?");
            const warningText = 'A'.repeat(420); // 84% of 500

            await user.type(textarea, warningText);

            const counter = screen.getByText(/420 \/ 500/);
            expect(counter).toHaveClass('text-yellow-600');
        });

        it('should show error color when at character limit', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText("What's happening?");
            const maxText = 'A'.repeat(500);

            await user.type(textarea, maxText);

            const counter = screen.getByText(/500 \/ 500/);
            expect(counter).toHaveClass('text-red-600');
        });
    });

    describe('Image Upload', () => {
        it('should show image preview when file is selected', async () => {
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const file = new File(['test'], 'test.png', { type: 'image/png' });
            const fileInput = screen.getByLabelText(/image/i, { selector: 'input[type="file"]' });

            // Mock FileReader
            const mockFileReader = {
                readAsDataURL: vi.fn(),
                onloadend: null,
                result: 'data:image/png;base64,test',
            };
            global.FileReader = vi.fn(() => mockFileReader);

            fireEvent.change(fileInput, { target: { files: [file] } });

            // Trigger onloadend
            mockFileReader.onloadend();

            await waitFor(() => {
                expect(screen.getByAltText('Preview')).toBeInTheDocument();
            });
        });

        it('should show remove button on image preview', async () => {
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const file = new File(['test'], 'test.png', { type: 'image/png' });
            const fileInput = screen.getByLabelText(/image/i, { selector: 'input[type="file"]' });

            const mockFileReader = {
                readAsDataURL: vi.fn(),
                onloadend: null,
                result: 'data:image/png;base64,test',
            };
            global.FileReader = vi.fn(() => mockFileReader);

            fireEvent.change(fileInput, { target: { files: [file] } });
            mockFileReader.onloadend();

            await waitFor(() => {
                const removeButton = screen.getByRole('button', { name: /×/ });
                expect(removeButton).toBeInTheDocument();
            });
        });

        it('should remove image preview when remove button is clicked', async () => {
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const file = new File(['test'], 'test.png', { type: 'image/png' });
            const fileInput = screen.getByLabelText(/image/i, { selector: 'input[type="file"]' });

            const mockFileReader = {
                readAsDataURL: vi.fn(),
                onloadend: null,
                result: 'data:image/png;base64,test',
            };
            global.FileReader = vi.fn(() => mockFileReader);

            fireEvent.change(fileInput, { target: { files: [file] } });
            mockFileReader.onloadend();

            await waitFor(() => {
                const removeButton = screen.getByRole('button', { name: /×/ });
                fireEvent.click(removeButton);
            });

            expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
        });
    });

    describe('Form Submission', () => {
        it('should disable submit button when form is empty', () => {
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const submitButton = screen.getByRole('button', { name: /post/i });
            expect(submitButton).toBeDisabled();
        });

        it('should enable submit button when caption is entered', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText("What's happening?");
            await user.type(textarea, 'Test post');

            const submitButton = screen.getByRole('button', { name: /post/i });
            expect(submitButton).not.toBeDisabled();
        });

        it('should enable submit button when image is selected', async () => {
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const file = new File(['test'], 'test.png', { type: 'image/png' });
            const fileInput = screen.getByLabelText(/image/i, { selector: 'input[type="file"]' });

            const mockFileReader = {
                readAsDataURL: vi.fn(),
                onloadend: null,
                result: 'data:image/png;base64,test',
            };
            global.FileReader = vi.fn(() => mockFileReader);

            fireEvent.change(fileInput, { target: { files: [file] } });
            mockFileReader.onloadend();

            await waitFor(() => {
                const submitButton = screen.getByRole('button', { name: /post/i });
                expect(submitButton).not.toBeDisabled();
            });
        });

        it('should show loading state when submitting', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText("What's happening?");
            await user.type(textarea, 'Test post');

            const submitButton = screen.getByRole('button', { name: /post/i });
            fireEvent.click(submitButton);

            expect(screen.getByText('Posting...')).toBeInTheDocument();
            expect(submitButton).toBeDisabled();
        });

        it('should call onPostCreated with new post data', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText("What's happening?");
            await user.type(textarea, 'Test post');

            const submitButton = screen.getByRole('button', { name: /post/i });
            fireEvent.click(submitButton);

            // Fast-forward timer
            vi.advanceTimersByTime(1000);

            await waitFor(() => {
                expect(mockOnPostCreated).toHaveBeenCalledTimes(1);
                expect(mockOnPostCreated).toHaveBeenCalledWith(
                    expect.objectContaining({
                        caption: 'Test post',
                        user: expect.objectContaining({
                            username: 'testuser',
                        }),
                    })
                );
            });
        });

        it('should reset form after successful submission', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText("What's happening?");
            await user.type(textarea, 'Test post');

            const submitButton = screen.getByRole('button', { name: /post/i });
            fireEvent.click(submitButton);

            vi.advanceTimersByTime(1000);

            await waitFor(() => {
                expect(textarea).toHaveValue('');
                expect(screen.getByText('0 / 500')).toBeInTheDocument();
            });
        });

        it('should not submit with only whitespace', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText("What's happening?");
            await user.type(textarea, '   ');

            const submitButton = screen.getByRole('button', { name: /post/i });
            expect(submitButton).toBeDisabled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle missing user gracefully', () => {
            vi.mock('../../../src/context/AuthContext', () => ({
                useAuth: () => ({ user: null }),
            }));

            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            // Should render with placeholder image
            expect(screen.getByPlaceholderText("What's happening?")).toBeInTheDocument();
        });

        it('should handle rapid form submissions', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText("What's happening?");
            await user.type(textarea, 'Test');

            const submitButton = screen.getByRole('button', { name: /post/i });

            // Try to submit multiple times
            fireEvent.click(submitButton);
            fireEvent.click(submitButton);
            fireEvent.click(submitButton);

            vi.advanceTimersByTime(1000);

            await waitFor(() => {
                // Should only call once due to disabled state
                expect(mockOnPostCreated).toHaveBeenCalledTimes(1);
            });
        });

        it('should handle special characters in caption', async () => {
            const user = userEvent.setup({ delay: null });
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText("What's happening?");
            const specialText = 'Test @user #hashtag 🎉 <script>alert("xss")</script>';

            await user.type(textarea, specialText);

            expect(textarea).toHaveValue(specialText);
        });
    });

    describe('Accessibility', () => {
        it('should have proper form structure', () => {
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const form = screen.getByRole('form', { hidden: true });
            expect(form).toBeInTheDocument();
        });

        it('should have accessible textarea', () => {
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const textarea = screen.getByPlaceholderText("What's happening?");
            expect(textarea).toHaveAttribute('maxLength', '500');
        });

        it('should have accessible file input', () => {
            render(<CreatePost onPostCreated={mockOnPostCreated} />);

            const fileInput = screen.getByLabelText(/image/i, { selector: 'input[type="file"]' });
            expect(fileInput).toHaveAttribute('accept', 'image/*');
        });
    });
});
