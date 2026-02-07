import React, { useState } from 'react';

export default function CreatePostForm({ onPostCreated, user }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [preview, setPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (!content.trim()) {
        setError('Post content cannot be empty');
        return;
      }
      if (content.trim().length > 1000) {
        setError('Post content must be less than 1000 characters');
        return;
      }
      setIsSubmitting(true);
      setError('');
      try {
        const postData = {
          content: content.trim(),
          image: image || ''
        };
        console.log('Creating post with data:', postData);
        const result = await createPost(postData);
        console.log('Post created successfully:', result);
        toast.success('Post created successfully!');
        setContent('');
        setImage('');
        setPreview('');
        if (onPostCreated) {
          onPostCreated();
        }
      } catch (err) {
        console.error('Error creating post:', err);
        setError(err.message || 'Failed to create post');
        toast.error(err.message || 'Failed to create post');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <>
        <div style={{
          background: 'var(--color-card-bg)',
          border: '1px solid var(--color-card-border)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px var(--color-card-shadow)'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`}
              alt={user?.name || 'User'}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                flexShrink: 0
              }}
            />
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--color-text-primary)',
                marginBottom: '0.5rem'
              }}>
                {user?.name || 'User'}
              </p>
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setError('');
                }}
                placeholder="Share your thoughts with your network..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '0.75rem',
                  border: '1px solid var(--color-input-border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  backgroundColor: 'var(--color-input-bg)',
                  color: 'var(--color-input-text)'
                }}
                maxLength={1000}
                disabled={isSubmitting}
              />
              <div style={{
                fontSize: '12px',
                color: content.length > 900 ? 'var(--color-error)' : 'var(--color-text-secondary)',
                marginTop: '0.5rem',
                marginBottom: '1rem'
              }}>
                {content.length}/1000
              </div>
            </div>
          </div>

          {/* Image Preview */}
          {preview && (
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: '100%',
                  maxHeight: '300px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border-primary)'
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setImage('');
                  setPreview('');
                }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-text-primary)',
                  color: 'var(--color-bg-primary)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'var(--color-error-light)',
              color: 'var(--color-error)',
              borderRadius: '6px',
              fontSize: '13px',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--color-border-primary)'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '0.5rem 1rem'
            }}>
              <span>🖼️</span>
              <span>Add Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                disabled={isSubmitting}
              />
            </label>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: (!content.trim() || isSubmitting) ? 'var(--color-border-primary)' : 'var(--color-primary)',
                color: (!content.trim() || isSubmitting) ? 'var(--color-text-tertiary)' : 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: (!content.trim() || isSubmitting) ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-base)'
              }}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </>
    );
  }
