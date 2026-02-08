
import { useState, useEffect } from 'react';
import { getCommentCount } from './comments.service';
import CommentSection from './CommentSection';
import EditPostForm from './EditPostForm';

export default function PostCard({ post, currentUserId }) {
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const [loadingCount, setLoadingCount] = useState(true);
    useEffect(() => {
      let mounted = true;
      async function fetchCount() {
        setLoadingCount(true);
        try {
          const data = await getCommentCount(post._id || post.id);
          if (mounted && data && typeof data.count === 'number') {
            setCommentCount(data.count);
          }
        } catch (e) {
          // fallback: keep previous count
        } finally {
          if (mounted) setLoadingCount(false);
        }
      }
      fetchCount();
      return () => { mounted = false; };
    }, [post._id, post.id]);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [editing, setEditing] = useState(false);

  const handleCommentClick = () => {
    setShowComments(!showComments);
  };

  const handleCommentCountChange = (newCount) => {
    setCommentCount(newCount);
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleEditCancel = () => {
    setEditing(false);
  };

  const handlePostUpdated = () => {
    setEditing(false);
    // Optionally, trigger a refresh in parent component
  };

  return (
    <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-card-border)', borderRadius: '12px', padding: '1.25rem', transition: 'all var(--transition-base)', boxShadow: '0 1px 3px var(--color-card-shadow)' }}>
      {/* Header: Avatar, Name, Title, Timestamp */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <img
          src={post.user?.avatar || `https://ui-avatars.com/api/?name=${post.user?.name || 'User'}&background=random`}
          alt={post.user?.name || 'User'}
          style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '0.75rem' }}
        />
        <div>
          <h3 style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text-primary)', marginBottom: '0.125rem' }}>{post.user?.name || 'Anonymous'}</h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{post.user?.email || 'User'} • {post.timestamp}</p>
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

      {/* Engagement Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border-primary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 16 }}>👍</span> {likesCount} likes
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 16, color: 'var(--color-primary)' }}>💬</span>
          {loadingCount ? <span style={{ fontStyle: 'italic', color: '#aaa' }}>...</span> : <b>{commentCount}</b>} comments
        </span>
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
      {showComments && (
        <CommentSection 
          postId={post._id || post.id}
          initialCount={commentCount}
          currentUserId={currentUserId}
          onCommentCountChange={handleCommentCountChange}
        />
      )}
    </div>
  );
}
