import { useState, useEffect } from 'react';
import PostCard from './PostCard';

export default function SocialFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/posts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      } else {
        console.error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts([newPost, ...posts]);
        setContent('');
        setImage(null);
      } else {
        console.error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  if (loading) return <div className="text-center py-8">Loading posts...</div>;

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
