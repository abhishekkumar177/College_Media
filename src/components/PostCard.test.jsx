import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostCard from './PostCard';

const mockPost = {
  id: 1,
  user: {
    username: 'testuser',
    avatar: 'https://example.com/avatar.jpg'
  },
  media: 'https://example.com/post.jpg',
  caption: 'Test post caption #hashtag',
  likes: 42,
  comments: 7
};

describe('PostCard', () => {
  test('renders post content correctly', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText(/Test post caption/)).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  test('handles like button click', async () => {
    const user = userEvent.setup();
    const mockOnLike = jest.fn();

    render(<PostCard post={mockPost} onLike={mockOnLike} />);

    const likeButton = screen.getByRole('button', { name: /like/i });
    await user.click(likeButton);

    expect(mockOnLike).toHaveBeenCalledWith(1);
  });

  test('updates like count when liked', async () => {
    const user = userEvent.setup();
    let likedPosts = {};

    const TestWrapper = () => {
      const [likes, setLikes] = React.useState(likedPosts);

      const handleLike = (postId) => {
        setLikes(prev => ({
          ...prev,
          [postId]: !prev[postId]
        }));
      };

      return (
        <PostCard
          post={mockPost}
          onLike={handleLike}
          isLiked={likes[1]}
        />
      );
    };

    render(<TestWrapper />);

    const likeButton = screen.getByRole('button', { name: /like/i });
    await user.click(likeButton);

    expect(screen.getByText('43')).toBeInTheDocument(); // 42 + 1
  });

  test('displays correct comment count', () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText('7')).toBeInTheDocument();
  });
});
