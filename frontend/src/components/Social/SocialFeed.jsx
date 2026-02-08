import { useContext, useState, useEffect } from 'react';
import PostCard from './PostCard';
import CreatePostForm from './CreatePostForm';
import { AuthContext } from '../../context/AuthContext';
import { getPosts } from './posts.service';

export default function SocialFeed() {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPosts(20, 0);
      setPosts(data.posts || []);
    } catch (err) {
      setError('Failed to load posts. Please try again.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <section className="w-full">
        <div className="w-full">
          <header style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border-primary)', backgroundColor: 'var(--color-card-bg)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Social Feed
            </h2>
          </header>
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-card-bg)' }}>
            Loading posts...
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full">
        <div className="w-full">
          <header style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border-primary)', backgroundColor: 'var(--color-card-bg)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Social Feed
            </h2>
          </header>
          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--color-card-bg)' }}>
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--color-error-light)',
              color: 'var(--color-error)',
              borderRadius: '6px',
              fontSize: '14px',
              marginBottom: '1rem',
              border: '1px solid var(--color-error)'
            }}>
              {error}
            </div>
            <button
              onClick={fetchPosts}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all var(--transition-base)'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = 'var(--color-primary-dark)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'var(--color-primary)'}
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="w-full">
        <div className="w-full">
          <header style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border-primary)', backgroundColor: 'var(--color-card-bg)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Social Feed
            </h2>
          </header>
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-tertiary)', backgroundColor: 'var(--color-card-bg)' }}>
            No posts yet. Be the first to create a post!
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="w-full">
        
        <header style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border-primary)', backgroundColor: 'var(--color-card-bg)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
            Social Feed
          </h2>
        </header>

        <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-bg-primary)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Create Post Form */}
            <CreatePostForm onPostCreated={fetchPosts} user={user} />
            
            {/* Posts List */}
            {posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={{
                  ...post,
                  timestamp: formatTimestamp(post.createdAt),
                  likes: post.likes?.length || 0,
                  comments: 0 // Will be updated by CommentSection
                }} 
                currentUserId={user?.id || user?._id}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
