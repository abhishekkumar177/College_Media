import React, { useState } from 'react';

/**
 * Post Card Component
 * Individual post display with user info, media, interactions, and caption.
 * @param {Object} props - The component props
 * @param {Object} props.post - Post object containing user, media, caption, likes
 * @param {Function} props.onLike - Handler for like toggle
 * @param {boolean} [props.isLiked=false] - Whether the post is liked
 * @returns {JSX.Element} The post card JSX element
 */
const PostCard = ({ post, onLike, isLiked = false }) => {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    if (onLike) onLike(post.id);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleLike();
    }
  };

  return (
    <article data-testid="post-card" className="post-card" role="article" aria-labelledby={`post-${post.id}-username`}>
      <header className="post-header">
        <img
          src={post.user.avatar}
          alt={`${post.user.username}'s profile picture`}
          className="user-avatar"
          role="img"
        />
        <span id={`post-${post.id}-username`} className="username">{post.user.username}</span>
      </header>
      <img
        src={post.media}
        alt={post.caption || "Post media"}
        className="post-media"
        role="img"
        aria-describedby={`post-${post.id}-caption`}
      />
      <div className="post-content">
        <p id={`post-${post.id}-caption`} className="caption">{post.caption}</p>
        <div className="post-actions">
          <button
            data-testid="like-button"
            onClick={handleLike}
            onKeyDown={handleKeyDown}
            className={`like-button ${liked ? 'liked' : ''}`}
            aria-label={liked ? `Unlike post by ${post.user.username}` : `Like post by ${post.user.username}`}
            aria-pressed={liked}
            role="button"
            tabIndex={0}
          >
            {liked ? '❤️' : '🤍'} Like
          </button>
          <span
            data-testid="like-count"
            aria-label={`${likeCount} likes`}
          >
            {likeCount}
          </span>
          <span aria-label={`${post.comments} comments`}>Comments: {post.comments}</span>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
