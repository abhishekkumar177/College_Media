import React, { useEffect, useState } from 'react';
import { getMyComments, updateComment, deleteComment } from '../components/Social/comments.service';
import { toast } from 'react-toastify';

export default function CommentManagement() {
  const [comments, setComments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments() {
    setLoading(true);
    try {
      const data = await getMyComments();
      setComments(data.comments || []);
    } catch (err) {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (comment) => {
    setEditingId(comment._id);
    setEditText(comment.text);
  };

  const handleEditSave = async (commentId) => {
    try {
      await updateComment(commentId, editText);
      toast.success('Comment updated');
      setEditingId(null);
      fetchComments();
    } catch (err) {
      toast.error('Failed to update comment');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(commentId);
      toast.success('Comment deleted');
      fetchComments();
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', background: 'var(--color-card-bg)', borderRadius: 12, boxShadow: '0 1px 6px var(--color-card-shadow)', padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>My Comments</h2>
      {loading ? (
        <p>Loading...</p>
      ) : comments.length === 0 ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>You have not made any comments yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {comments.map((comment) => (
            <li key={comment._id} style={{ borderBottom: '1px solid var(--color-border-primary)', marginBottom: 16, paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  {editingId === comment._id ? (
                    <textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      style={{ width: '100%', minHeight: 60, borderRadius: 6, border: '1px solid var(--color-input-border)', padding: 8, fontSize: 14 }}
                    />
                  ) : (
                    <span style={{ fontSize: 15 }}>{comment.text}</span>
                  )}
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                    On post: <b>{comment.postTitle || comment.post?.content?.slice(0, 40) || 'Post'}</b>
                  </div>
                </div>
                <div style={{ marginLeft: 16 }}>
                  {editingId === comment._id ? (
                    <>
                      <button onClick={() => handleEditSave(comment._id)} style={{ color: 'white', background: 'var(--color-primary)', border: 'none', borderRadius: 4, padding: '6px 12px', marginRight: 8, cursor: 'pointer' }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ color: 'var(--color-text-secondary)', background: 'none', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer' }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(comment)} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', borderRadius: 4, padding: '6px 12px', marginRight: 8, cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(comment._id)} style={{ color: 'var(--color-error)', background: 'none', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer' }}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
