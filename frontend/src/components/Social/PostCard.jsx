import { useState, useEffect } from 'react';

export default function PostCard({ post }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  useEffect(() => {
    fetchComments();
  }, [post._id]);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });
      if (response.ok) {
        const newCommentData = await response.json();
        setComments([...comments, newCommentData]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${post._id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setComments(comments.filter(c => c._id !== commentId));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-card-border)', borderRadius: '12px', padding: '1.25rem', transition: 'all var(--transition-base)', boxShadow: '0 1px 3px var(--color-card-shadow)' }}>
      {/* Header: Avatar, Name, Title, Timestamp */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <img
          src={post.user.avatar || '/default-avatar.png'}
          alt={post.user.name}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <h3 className="font-semibold text-sm text-gray-900">{post.user.name}</h3>
          <p className="text-xs text-gray-500">{formatTimestamp(post.createdAt)}</p>
        </div>
      </div>


      {/* Edit Mode or Content */}
      {editing ? (
        <EditPostForm post={post} onPostUpdated={handlePostUpdated} onCancel={handleEditCancel} />
      ) : (
        <>
          <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', marginBottom: '1rem', lineHeight: '1.6' }}>{post.content}</p>
          {/* Show Edit button if current user is the author */}
          {currentUserId && post.user && currentUserId === post.user._id && (
            <button
              onClick={handleEditClick}
              style={{
                fontSize: '12px',
                color: 'var(--color-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '1rem',
                textDecoration: 'underline',
                float: 'right'
              }}
            >
              Edit
            </button>
          )}
        </>
      )}

      {/* Image */}
      {post.image && (
        <img
          src={`http://localhost:5000${post.image}`}
          alt="Post image"
          className="w-full h-auto rounded-lg mb-3"
        />
      )}

      {/* Engagement Stats */}
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>{post.likes?.length || 0} likes</span>
        <span>{post.comments?.length || 0} comments</span>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-around', gap: '0.5rem' }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: 'var(--color-text-secondary)', background: 'transparent', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', transition: 'all var(--transition-base)' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-hover-bg)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
          <span>👍</span> Like
        </button>
        <button 
          onClick={handleCommentClick}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '13px', 
            color: showComments ? 'var(--color-primary)' : 'var(--color-text-secondary)', 
            background: 'transparent', 
            border: 'none', 
            padding: '0.5rem 1rem', 
            borderRadius: '6px', 
            cursor: 'pointer', 
            transition: 'all var(--transition-base)',
            fontWeight: showComments ? '600' : '400'
          }} 
          onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-hover-bg)'} 
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <span>💬</span> Comment
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: 'var(--color-text-secondary)', background: 'transparent', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', transition: 'all var(--transition-base)' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-hover-bg)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
          <span>🔗</span> Share
        </button>
      </div>

      {/* Comments Section */}
      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="mb-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddComment}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Comment
          </button>
        </div>
        <div className="space-y-2">
          {comments.map((comment) => (
            <div key={comment._id} className="flex items-start space-x-2">
              <img
                src={comment.user.avatar || '/default-avatar.png'}
                alt={comment.user.name}
                className="w-6 h-6 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm">{comment.user.name}</span>
                  <span className="text-xs text-gray-500">{formatTimestamp(comment.date)}</span>
                </div>
                <p className="text-sm text-gray-800">{comment.text}</p>
              </div>
              {comment.user._id === user?.id && (
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
