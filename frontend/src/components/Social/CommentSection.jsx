import { useState, useEffect } from 'react';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { getComments, createComment, updateComment } from './comments.service';

export default function CommentSection({ postId, initialCount = 0, currentUserId, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalComments, setTotalComments] = useState(initialCount);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getComments(postId);
      setComments(data.comments || []);
      
      // Calculate total including replies
      const total = data.comments.reduce((acc, comment) => {
        return acc + 1 + (comment.replies?.length || 0);
      }, 0);
      
      setTotalComments(total);
      
      // Notify parent of count change
      if (onCommentCountChange) {
        onCommentCountChange(total);
      }
    } catch (err) {
      setError('Failed to load comments. Please try again.');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (text) => {
    try {
      const result = await createComment({
        postId,
        text
      });
      
      // Add new comment to the list
      const newComment = {
        ...result.comment,
        replies: []
      };
      
      setComments([newComment, ...comments]);
      setTotalComments(totalComments + 1);
      
      if (onCommentCountChange) {
        onCommentCountChange(totalComments + 1);
      }
    } catch (err) {
      throw new Error(err.message || 'Failed to post comment');
    }
  };

  const handleReply = async (parentCommentId, text) => {
    try {
      const result = await createComment({
        postId,
        text,
        parentCommentId
      });

      // Update comments with new reply
      setComments(comments.map(comment => {
        if (comment._id === parentCommentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), result.comment]
          };
        }
        return comment;
      }));
      
      setTotalComments(totalComments + 1);
      
      if (onCommentCountChange) {
        onCommentCountChange(totalComments + 1);
      }
    } catch (err) {
      throw new Error(err.message || 'Failed to post reply');
    }
  };

  const handleDelete = (commentId) => {
    // Remove comment or reply from state
    let deletedCount = 0;
    
    setComments(prevComments => {
      const filtered = prevComments.filter(comment => {
        if (comment._id === commentId) {
          deletedCount = 1 + (comment.replies?.length || 0);
          return false;
        }
        
        // Check if it's a reply
        if (comment.replies?.length > 0) {
          const replyIndex = comment.replies.findIndex(r => r._id === commentId);
          if (replyIndex !== -1) {
            deletedCount = 1;
            comment.replies = comment.replies.filter(r => r._id !== commentId);
          }
        }
        
        return true;
      });
      
      return filtered;
    });
    
    setTotalComments(prev => prev - deletedCount);
    
    if (onCommentCountChange) {
      onCommentCountChange(totalComments - deletedCount);
    }
  };

  const handleUpdate = async (commentId, text) => {
    try {
      await updateComment(commentId, text);
      
      // Update comment in state
      setComments(prevComments => {
        return prevComments.map(comment => {
          if (comment._id === commentId) {
            return { ...comment, text };
          }
          
          // Check if it's a reply
          if (comment.replies?.length > 0) {
            comment.replies = comment.replies.map(reply => {
              if (reply._id === commentId) {
                return { ...reply, text };
              }
              return reply;
            });
          }
          
          return comment;
        });
      });
    } catch (err) {
      throw new Error('Failed to update comment');
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#6B7280',
        fontSize: '14px'
      }}>
        Loading comments...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '1rem',
        backgroundColor: '#FEE2E2',
        color: '#DC2626',
        borderRadius: '6px',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        {error}
        <button
          onClick={fetchComments}
          style={{
            marginLeft: '0.5rem',
            padding: '0.25rem 0.75rem',
            backgroundColor: '#DC2626',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{
      marginTop: '1rem',
      padding: '1rem',
      backgroundColor: '#F9FAFB',
      borderRadius: '8px',
      border: '1px solid #E5E7EB'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#111827'
        }}>
          Comments {totalComments > 0 && `(${totalComments})`}
        </h3>
      </div>

      {/* Comment Form */}
      <CommentForm onSubmit={handleCommentSubmit} />

      {/* Comments List */}
      {comments.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#9CA3AF',
          fontSize: '14px'
        }}>
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onReply={handleReply}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              currentUserId={currentUserId}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
