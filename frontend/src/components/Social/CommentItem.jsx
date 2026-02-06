import { useState } from 'react';
import CommentForm from './CommentForm';
import { deleteComment, toggleCommentLike } from './comments.service';

export default function CommentItem({ 
  comment, 
  onReply, 
  onDelete, 
  onUpdate,
  currentUserId,
  depth = 0 
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [localLikes, setLocalLikes] = useState(comment.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(
    comment.likes?.some(id => id === currentUserId) || false
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = comment.user._id === currentUserId;
  const formattedDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleReplySubmit = async (text) => {
    await onReply(comment._id, text);
    setShowReplyForm(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setIsDeleting(true);
      try {
        await deleteComment(comment._id);
        onDelete(comment._id);
      } catch (error) {
        alert('Failed to delete comment');
        setIsDeleting(false);
      }
    }
  };

  const handleLike = async () => {
    try {
      const result = await toggleCommentLike(comment._id);
      setIsLiked(result.isLiked);
      setLocalLikes(result.likesCount);
    } catch (error) {
      console.error('Failed to toggle like');
    }
  };

  const handleEditSubmit = async (text) => {
    try {
      await onUpdate(comment._id, text);
      setEditText(text);
      setIsEditing(false);
    } catch (error) {
      alert('Failed to update comment');
    }
  };

  if (isDeleting) {
    return null;
  }

  return (
    <div style={{
      marginLeft: depth > 0 ? '2rem' : '0',
      marginBottom: '1rem',
      padding: '0.75rem',
      backgroundColor: depth > 0 ? 'var(--color-bg-secondary)' : 'var(--color-card-bg)',
      borderLeft: depth > 0 ? '3px solid var(--color-border-primary)' : 'none',
      borderRadius: '6px'
    }}>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        {/* Avatar */}
        <img
          src={comment.user.avatar || `https://ui-avatars.com/api/?name=${comment.user.name}&background=random`}
          alt={comment.user.name}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            flexShrink: 0
          }}
        />

        <div style={{ flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-text-primary)' }}>
              {comment.user.name}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>•</span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {formattedDate}
            </span>
            {isOwner && !isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    marginLeft: 'auto',
                    fontSize: '12px',
                    color: 'var(--color-primary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem 0.5rem'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-error)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem 0.5rem'
                  }}
                >
                  Delete
                </button>
              </>
            )}
          </div>

          {/* Comment Text or Edit Form */}
          {isEditing ? (
            <div style={{ marginTop: '0.5rem' }}>
              <CommentForm
                onSubmit={handleEditSubmit}
                placeholder="Edit your comment..."
                buttonText="Update"
                autoFocus={true}
              />
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '0.25rem'
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <p style={{
              fontSize: '14px',
              color: 'var(--color-text-primary)',
              lineHeight: '1.5',
              marginBottom: '0.5rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {editText}
            </p>
          )}

          {/* Action Buttons */}
          {!isEditing && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                onClick={handleLike}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '13px',
                  color: isLiked ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: isLiked ? '600' : '400',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <span>{isLiked ? '👍' : '👍🏻'}</span>
                {localLikes > 0 && <span>{localLikes}</span>}
              </button>

              {depth < 2 && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)',
                    fontWeight: '500',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem'
                  }}
                >
                  Reply
                </button>
              )}

              {comment.replies?.length > 0 && (
                <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                  {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </span>
              )}
            </div>
          )}

          {/* Reply Form */}
          {showReplyForm && (
            <div style={{ marginTop: '0.75rem' }}>
              <CommentForm
                onSubmit={handleReplySubmit}
                placeholder={`Reply to ${comment.user.name}...`}
                buttonText="Reply"
                autoFocus={true}
              />
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div style={{ marginTop: '0.75rem' }}>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  onReply={onReply}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  currentUserId={currentUserId}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
