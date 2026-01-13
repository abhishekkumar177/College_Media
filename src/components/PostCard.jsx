import React, { useState } from 'react';

const PostCard = ({ post, onLike, isLiked = false }) => {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    if (onLike) onLike(post.id);
  };

  return (
    <div data-testid="post-card" className="post-card">
      <div className="post-header">
        <img src={post.user.avatar} alt={post.user.username} className="user-avatar" />
        <span className="username">{post.user.username}</span>
      </div>
      <img src={post.media} alt="Post media" className="post-media" />
      <div className="post-content">
        <p className="caption">{post.caption}</p>
        <div className="post-actions">
          <button
            data-testid="like-button"
            onClick={handleLike}
            className={`like-button ${liked ? 'liked' : ''}`}
          >
            {liked ? '❤️' : '🤍'} Like
          </button>
          <span data-testid="like-count">{likeCount}</span>
          <span>Comments: {post.comments}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
