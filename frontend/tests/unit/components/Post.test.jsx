/**
 * Unit Tests - Post Component
 * Issue #348: Add Unit Tests for Core Components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Post from '../../../src/components/Post';

// Mock the hooks and components
vi.mock('../../../src/hooks/usePolls', () => ({
  usePollByPost: vi.fn(() => ({
    poll: null,
    hasPoll: false,
  })),
}));

vi.mock('../../../src/components/ReportButton', () => ({
  default: ({ onReportSubmitted }) => (
    <button onClick={onReportSubmitted}>Report</button>
  ),
}));

vi.mock('../../../src/components/PollDisplay', () => ({
  default: ({ poll }) => <div>Poll: {poll?.question}</div>,
}));

describe('Post Component', () => {
  const mockPost = {
    id: '1',
    user: {
      id: 'user1',
      username: 'testuser',
      profilePicture: 'https://example.com/avatar.jpg',
    },
    imageUrl: 'https://example.com/post.jpg',
    caption: 'This is a test post caption',
    likes: 10,
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
    it('should render the post with all basic elements', () => {
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
      expect(screen.getByAltText('testuser')).toHaveAttribute(
        'src',
        'https://example.com/avatar.jpg'
      );

      // Check timestamp
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();

      // Check caption
      expect(screen.getByText('This is a test post caption')).toBeInTheDocument();

      // Check likes count
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should render post image when imageUrl is provided', () => {
      render(
        <Post
          post={mockPost}
          onLike={mockOnLike}
          onCopyLink={mockOnCopyLink}
          copiedLink={null}
        />
      );

      const postImage = screen.getByAltText('Post');
      expect(postImage).toBeInTheDocument();
      expect(postImage).toHaveAttribute('src', 'https://example.com/post.jpg');
    });

    it('should not render post image when imageUrl is not provided', () => {
      const postWithoutImage = { ...mockPost, imageUrl: null };
      render(
        <Post
          post={postWithoutImage}
          onLike={mockOnLike}
          onCopyLink={mockOnCopyLink}
          copiedLink={null}
        />
      );

      expect(screen.queryByAltText('Post')).not.toBeInTheDocument();
    });

    it('should render the more options button', () => {
      render(
        <Post
          post={mockPost}
          onLike={mockOnLike}
          onCopyLink={mockOnCopyLink}
          copiedLink={null}
        />
      );

      const moreButton = screen.getByLabelText('More options');
      expect(moreButton).toBeInTheDocument();
    });
  });

  describe('Like Functionality', () => {
    it('should display unliked heart icon when post is not liked', () => {
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

    it('should display liked heart icon when post is liked', () => {
      const likedPost = { ...mockPost, liked: true };
      render(
        <Post
          post={likedPost}
          onLike={mockOnLike}
          onCopyLink={mockOnCopyLink}
          copiedLink={null}
        />
      );

      const unlikeButton = screen.getByLabelText('Unlike post');
      expect(unlikeButton).toBeInTheDocument();
    });

    it('should call onLike with post id when like button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Post
          post={mockPost}
          onLike={mockOnLike}
          onCopyLink={mockOnCopyLink}
          copiedLink={null}
        />
      );

      const likeButton = screen.getByLabelText('Like post');
      await user.click(likeButton);

      expect(mockOnLike).toHaveBeenCalledTimes(1);
      expect(mockOnLike).toHaveBeenCalledWith('1');
    });

    it('should display correct likes count', () => {
      render(
        <Post
          post={mockPost}
          onLike={mockOnLike}
          onCopyLink={mockOnCopyLink}
          copiedLink={null}
        />
      );

      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  describe('Copy Link Functionality', () => {
    it('should render copy link button', () => {
      render(
        <Post
          post={mockPost}
          onLike={mockOnLike}
          onCopyLink={mockOnCopyLink}
          copiedLink={null}
        />
      );

      const copyLinkButton = screen.getByLabelText('Copy post link');
      expect(copyLinkButton).toBeInTheDocument();
      expect(screen.getByText('Copy Link')).toBeInTheDocument();
    });

    it('should call onCopyLink with post when copy link button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Post
          post={mockPost}
          onLike={mockOnLike}
          onCopyLink={mockOnCopyLink}
          copiedLink={null}
        />
      );

      const copyLinkButton = screen.getByLabelText('Copy post link');
      await user.click(copyLinkButton);

      expect(mockOnCopyLink).toHaveBeenCalledTimes(1);
      expect(mockOnCopyLink).toHaveBeenCalledWith(mockPost);
    });

    it('should display "Link Copied" when copiedLink matches post id', () => {
      render(
        <Post
          post={mockPost}
          onLike={mockOnLike}
          onCopyLink={mockOnCopyLink}
          copiedLink="1"
        />
      );

      expect(screen.getByText('Link Copied')).toBeInTheDocument();
      expect(screen.queryByText('Copy Link')).not.toBeInTheDocument();
    });

    it('should display "Copy Link" when copiedLink does not match post id', () => {
      render(
        <Post
          post={mockPost}
          onLike={mockOnLike}
          onCopyLink={mockOnCopyLink}
          copiedLink="2"
        />
      );

      expect(screen.getByText('Copy Link')).toBeInTheDocument();
      expect(screen.queryByText('Link Copied')).not.toBeInTheDocument();
    });
  });

  describe('More Options Menu', () => {
    it('should not show menu by default', () => {
      render(
        <Post
          post={mockPost}
          onLike={mockOnLike}
          onCopyLink={mockOnCopyLink}
          copiedLink={null}
        />
      );

      expect(screen.queryByText('Report')).not.toBeInTheDocument();
    });

    it('should show menu when more options button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Post
          post={mockPost}
          onLike={mockOnLike}
          onCopyLink={mockOnCopyLink}
          copiedLink={null}
        />
      );

      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      await waitFor(() => {
        expect(screen.getByText('Report')).toBeInTheDocument();
      });
    });

    it('should hide menu when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <Post
          post={mockPost}
          onLike={mockOnLike}
          onCopyLink={mockOnCopyLink}
          copiedLink={null}
        />
      );

      const moreButton = screen.getByLabelText('More options');
      await user.click(moreButton);

      await waitFor(() => {
        expect(screen.getByText('Report')).toBeInTheDocument();
      });

      // Click the overlay to close
      const overlay = screen.getByText('Report').parentElement.previousSibling;
      await user.click(overlay);

      await waitFor(() => {
        expect(screen.queryByText('Report')).not.toBeInTheDocument();
      });
    });

    it('should toggle menu when clicking more options button multiple times', async () => {
      const user = userEvent.setup();
      render(
        <Post
          post={mockPost}
          onLike={mockOnLike}
          onCopyLink={mockOnCopyLink}
          copiedLink={null}
        />
      );

      const moreButton = screen.getByLabelText('More options');

      // Open menu
      await user.click(moreButton);
      await waitFor(() => {
        expect(screen.getByText('Report')).toBeInTheDocument();
      });

      // Close menu
      await user.click(moreButton);
      await waitFor(() => {
        expect(screen.queryByText('Report')).not.toBeInTheDocument();
      });
    });
  });

  describe('Poll Display', () => {
    it('should not render poll when hasPoll is false', () => {
      render(
        <Post
          post={mockPost}
          onLike={mockOnLike}
          onCopyLink={mockOnCopyLink}
          copiedLink={null}
        />
      );

      expect(screen.queryByText(/Poll:/)).not.toBeInTheDocument();
    });

    it('should render poll when post has poll data', () => {
      const { usePollByPost } = require('../../../src/hooks/usePolls');
      usePollByPost.mockReturnValue({
        poll: { question: 'What is your favorite color?' },
        hasPoll: true,
      });

      render(
        <Post
          post={mockPost}
          onLike={mockOnLike}
          onCopyLink={mockOnCopyLink}
          copiedLink={null}
        />
      );

      expect(screen.getByText('Poll: What is your favorite color?')).toBeInTheDocument();
    });

    it('should render poll from post.poll if available', () => {
      const postWithPoll = {
        ...mockPost,
        poll: { question: 'Best programming language?' },
      };

      render(
        <Post
          post={postWithPoll}
          onLike={mockOnLike}
          onCopyLink={mockOnCopyLink}
          copiedLink={null}
        />
      );

      expect(screen.getByText('Poll: Best programming language?')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-labels for interactive elements', () => {
      render(
        <Post
          post={mockPost}
          onLike={mockOnLike}
          onCopyLink={mockOnCopyLink}
          copiedLink={null}
        />
      );

      expect(screen.getByLabelText('Like post')).toBeInTheDocument();
      expect(screen.getByLabelText('Copy post link')).toBeInTheDocument();
      expect(screen.getByLabelText('More options')).toBeInTheDocument();
    });

    it('should have proper alt text for images', () => {
      render(
        <Post
          post={mockPost}
          onLike={mockOnLike}
          onCopyLink={mockOnCopyLink}
          copiedLink={null}
        />
      );

      expect(screen.getByAltText('testuser')).toBeInTheDocument();
      expect(screen.getByAltText('Post')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle post with zero likes', () => {
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

    it('should handle post with empty caption', () => {
      const postWithEmptyCaption = { ...mockPost, caption: '' };
      render(
        <Post
          post={postWithEmptyCaption}
          onLike={mockOnLike}
          onCopyLink={mockOnCopyLink}
          copiedLink={null}
        />
      );

      // Username should still be visible
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('should handle long captions gracefully', () => {
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

      expect(screen.getByText(longCaption)).toBeInTheDocument();
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
  });
});
