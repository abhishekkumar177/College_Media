export default function PostCard({ post }) {
  return (
    <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1.25rem', transition: 'all 0.2s' }}>
      {/* Header: Avatar, Name, Title, Timestamp */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <img
          src={post.user.avatar}
          alt={post.user.name}
          style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '0.75rem' }}
        />
        <div>
          <h3 style={{ fontWeight: '600', fontSize: '14px', color: '#111827', marginBottom: '0.125rem' }}>{post.user.name}</h3>
          <p style={{ fontSize: '12px', color: '#6B7280' }}>{post.user.title} • {post.timestamp}</p>
        </div>
      </div>

      {/* Content */}
      <p style={{ fontSize: '14px', color: '#374151', marginBottom: '1rem', lineHeight: '1.6' }}>{post.content}</p>

      {/* Engagement Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E5E7EB' }}>
        <span>{post.likes} likes</span>
        <span>{post.comments} comments</span>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-around', gap: '0.5rem' }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: '#6B7280', background: 'transparent', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#E5E7EB'} onMouseOut={(e) => e.target.style.background = 'transparent'}>
          <span>👍</span> Like
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: '#6B7280', background: 'transparent', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#E5E7EB'} onMouseOut={(e) => e.target.style.background = 'transparent'}>
          <span>💬</span> Comment
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '13px', color: '#6B7280', background: 'transparent', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#E5E7EB'} onMouseOut={(e) => e.target.style.background = 'transparent'}>
          <span>🔗</span> Share
        </button>
      </div>
    </div>
  );
}
