import { useState } from 'react';

export default function CommentForm({ onSubmit, placeholder = "Write a comment...", buttonText = "Comment", autoFocus = false }) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (text.trim().length > 500) {
      setError('Comment must be less than 500 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(text.trim());
      setText('');
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <div style={{ position: 'relative' }}>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError('');
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={isSubmitting}
          style={{
            width: '100%',
            minHeight: '60px',
            padding: '0.75rem',
            border: '1px solid var(--color-input-border)',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical',
            fontFamily: 'inherit',
            backgroundColor: isSubmitting ? 'var(--color-bg-secondary)' : 'var(--color-input-bg)',
            color: 'var(--color-input-text)',
            opacity: isSubmitting ? 0.6 : 1,
            transition: 'all var(--transition-base)'
          }}
          maxLength={500}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.5rem'
        }}>
          <span style={{
            fontSize: '12px',
            color: text.length > 450 ? 'var(--color-error)' : 'var(--color-text-secondary)'
          }}>
            {text.length}/500
          </span>
          <button
            type="submit"
            disabled={isSubmitting || !text.trim()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: (!text.trim() || isSubmitting) ? 'var(--color-border-primary)' : 'var(--color-primary)',
              color: (!text.trim() || isSubmitting) ? 'var(--color-text-tertiary)' : 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: (!text.trim() || isSubmitting) ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-base)',
            }}
          >
            {isSubmitting ? 'Posting...' : buttonText}
          </button>
        </div>
      </div>
      {error && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.5rem',
          backgroundColor: 'var(--color-error-light)',
          color: 'var(--color-error)',
          borderRadius: '6px',
          fontSize: '13px',
          border: '1px solid var(--color-error)'
        }}>
          {error}
        </div>
      )}
    </form>
  );
}
