/**
 * Unit Tests - Post Component
 * Tests for the Post component including rendering, interactions, and accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Post from '../../../src/components/Post';

describe('Post Component', () => {
    const mockPost = {
        id: 1,
        user: {
            username: 'testuser',
            profilePicture: 'https://example.com/avatar.jpg',
        },
        imageUrl: 'https://example.com/post.jpg',
        caption: 'This is a test post caption',
        likes: 42,
        comments: 5,
        timestamp: '2 hours ago',
        liked: false,
    };

    const mockOnLike = vi.fn();
    const mockOnCopyLink = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render post with all elements', () => {
            render(
                <Post
                    post={mockPost}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={null}
                />
            );

            // Check user information
            expect(screen.getByText('testuser')).toBeInTheDocument();
            expect(screen.getByText('2 hours ago')).toBeInTheDocument();

            // Check caption
            expect(screen.getByText(/This is a test post caption/)).toBeInTheDocument();

            // Check like count
            expect(screen.getByText('42')).toBeInTheDocument();

            // Check images
            const images = screen.getAllByRole('img');
            expect(images).toHaveLength(2); // Profile picture and post image
        });

        it('should render profile picture with correct src and alt', () => {
            render(
                <Post
                    post={mockPost}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={null}
                />
            );

            const profilePic = screen.getByAltText('testuser');
            expect(profilePic).toHaveAttribute('src', 'https://example.com/avatar.jpg');
        });

        it('should render post image with correct src', () => {
            render(
                <Post
                    post={mockPost}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={null}
                />
            );

            const postImage = screen.getByAltText('Post');
            expect(postImage).toHaveAttribute('src', 'https://example.com/post.jpg');
        });
    });

    describe('Like Functionality', () => {
        it('should show unliked heart icon when post is not liked', () => {
            render(
                <Post
                    post={mockPost}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={null}
                />
            );

            const likeButton = screen.getByLabelText('Like post');
            expect(likeButton).toBeInTheDocument();
        });

        it('should show liked heart icon when post is liked', () => {
            const likedPost = { ...mockPost, liked: true };
            render(
                <Post
                    post={likedPost}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={null}
                />
            );

            const likeButton = screen.getByLabelText('Unlike post');
            expect(likeButton).toBeInTheDocument();
        });

        it('should call onLike with post id when like button is clicked', () => {
            render(
                <Post
                    post={mockPost}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={null}
                />
            );

            const likeButton = screen.getByLabelText('Like post');
            fireEvent.click(likeButton);

            expect(mockOnLike).toHaveBeenCalledTimes(1);
            expect(mockOnLike).toHaveBeenCalledWith(1);
        });

        it('should display correct like count', () => {
            render(
                <Post
                    post={mockPost}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={null}
                />
            );

            expect(screen.getByText('42')).toBeInTheDocument();
        });

        it('should handle zero likes', () => {
            const postWithZeroLikes = { ...mockPost, likes: 0 };
            render(
                <Post
                    post={postWithZeroLikes}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={null}
                />
            );

            expect(screen.getByText('0')).toBeInTheDocument();
        });
    });

    describe('Copy Link Functionality', () => {
        it('should show "Copy Link" text initially', () => {
            render(
                <Post
                    post={mockPost}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={null}
                />
            );

            expect(screen.getByText('Copy Link')).toBeInTheDocument();
        });

        it('should show "Link Copied" when link is copied', () => {
            render(
                <Post
                    post={mockPost}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={1}
                />
            );

            expect(screen.getByText('Link Copied')).toBeInTheDocument();
        });

        it('should call onCopyLink with post when copy button is clicked', () => {
            render(
                <Post
                    post={mockPost}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={null}
                />
            );

            const copyButton = screen.getByLabelText('Copy post link');
            fireEvent.click(copyButton);

            expect(mockOnCopyLink).toHaveBeenCalledTimes(1);
            expect(mockOnCopyLink).toHaveBeenCalledWith(mockPost);
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA labels for like button', () => {
            render(
                <Post
                    post={mockPost}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={null}
                />
            );

            const likeButton = screen.getByLabelText('Like post');
            expect(likeButton).toHaveAttribute('aria-label', 'Like post');
        });

        it('should have proper ARIA label for copy link button', () => {
            render(
                <Post
                    post={mockPost}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={null}
                />
            );

            const copyButton = screen.getByLabelText('Copy post link');
            expect(copyButton).toHaveAttribute('aria-label', 'Copy post link');
        });

        it('should have alt text for all images', () => {
            render(
                <Post
                    post={mockPost}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={null}
                />
            );

            const images = screen.getAllByRole('img');
            images.forEach((img) => {
                expect(img).toHaveAttribute('alt');
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle long captions', () => {
            const longCaption = 'A'.repeat(500);
            const postWithLongCaption = { ...mockPost, caption: longCaption };

            render(
                <Post
                    post={postWithLongCaption}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={null}
                />
            );

            expect(screen.getByText(new RegExp(longCaption))).toBeInTheDocument();
        });

        it('should handle empty caption', () => {
            const postWithEmptyCaption = { ...mockPost, caption: '' };

            render(
                <Post
                    post={postWithEmptyCaption}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={null}
                />
            );

            // Should still render without errors
            expect(screen.getByText('testuser')).toBeInTheDocument();
        });

        it('should handle large like counts', () => {
            const postWithManyLikes = { ...mockPost, likes: 999999 };

            render(
                <Post
                    post={postWithManyLikes}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={null}
                />
            );

            expect(screen.getByText('999999')).toBeInTheDocument();
        });

        it('should handle special characters in username', () => {
            const postWithSpecialChars = {
                ...mockPost,
                user: { ...mockPost.user, username: 'test_user-123' },
            };

            render(
                <Post
                    post={postWithSpecialChars}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={null}
                />
            );

            expect(screen.getAllByText('test_user-123')).toHaveLength(2); // Username appears twice
        });
    });

    describe('Interaction States', () => {
        it('should toggle like state correctly', () => {
            const { rerender } = render(
                <Post
                    post={mockPost}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={null}
                />
            );

            // Initially unliked
            expect(screen.getByLabelText('Like post')).toBeInTheDocument();

            // Simulate like
            const likedPost = { ...mockPost, liked: true, likes: 43 };
            rerender(
                <Post
                    post={likedPost}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={null}
                />
            );

            // Now liked
            expect(screen.getByLabelText('Unlike post')).toBeInTheDocument();
            expect(screen.getByText('43')).toBeInTheDocument();
        });

        it('should handle multiple rapid clicks on like button', () => {
            render(
                <Post
                    post={mockPost}
                    onLike={mockOnLike}
                    onCopyLink={mockOnCopyLink}
                    copiedLink={null}
                />
            );

            const likeButton = screen.getByLabelText('Like post');

            // Click multiple times
            fireEvent.click(likeButton);
            fireEvent.click(likeButton);
            fireEvent.click(likeButton);

            expect(mockOnLike).toHaveBeenCalledTimes(3);
        });
    });
});
