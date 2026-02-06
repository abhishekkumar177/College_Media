import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PostCard from '../components/Social/PostCard';

export default function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', avatar: '', bio: '' });

  // Get current user ID from JWT
  const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();
  const isOwnProfile = currentUserId === id;

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/users/${id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setPosts(data.posts);
        setEditForm({ name: data.user.name, avatar: data.user.avatar, bio: data.user.bio });
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3002/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setEditing(false);
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img src={user.avatar || '/default-avatar.png'} alt="Avatar" className="avatar" />
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p>{user.email}</p>
          {user.bio && <p>{user.bio}</p>}
          {isOwnProfile && (
            <button onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          )}
        </div>
      </div>

      {editing && isOwnProfile && (
        <form onSubmit={handleEditSubmit} className="edit-form">
          <input
            type="text"
            placeholder="Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Avatar URL"
            value={editForm.avatar}
            onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
          />
          <textarea
            placeholder="Bio"
            value={editForm.bio}
            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
          />
          <button type="submit">Save Changes</button>
        </form>
      )}

      <div className="posts-section">
        <h2>Posts</h2>
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        ) : (
          <p>No posts yet.</p>
        )}
      </div>
    </div>
  );
}
