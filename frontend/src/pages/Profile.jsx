// import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PostCard from '../components/Social/PostCard';
import { toast } from 'react-toastify';
import { mockUser, mockPosts } from '../mockData';

export default function Profile() {
  // Use mock data for development
  const [user, setUser] = useState(mockUser);
  const [posts, setPosts] = useState(mockPosts);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: mockUser.name, avatar: mockUser.avatar, bio: mockUser.bio });
  const [username, setUsername] = useState(mockUser.username);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Get current user ID from JWT
  const getCurrentUserId = () => {
    // For mock, always own profile
    return mockUser._id;
  };

  const currentUserId = getCurrentUserId();
  const isOwnProfile = true;
  useEffect(() => {
    // No API call needed for mock data
  }, []);

  const fetchUserData = async () => {
    // No-op for mock data
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    let avatarUrl = user.avatar;
    if (avatarFile) {
      // Upload avatar
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const uploadRes = await fetch(`http://localhost:3002/api/users/${id}/avatar`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        avatarUrl = uploadData.avatar;
      } else {
        toast.error('Failed to upload avatar');
      }
    }
    try {
      const response = await fetch(`http://localhost:3002/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...editForm, avatar: avatarUrl }),
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setEditing(false);
        setAvatarFile(null);
        setAvatarPreview('');
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Error updating profile');
    }
  };

  // ...existing code...

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img src={user.avatar ? user.avatar : '/default-avatar.png'} alt="Avatar" className="avatar" />
        <div className="profile-info">
          <h1>{user.name}</h1>
          {username && <p>@{username}</p>}
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
        <form onSubmit={e => { e.preventDefault(); if (avatarPreview) setUser({ ...user, avatar: avatarPreview }); setEditing(false); }} className="edit-form">
          <input
            type="text"
            placeholder="Name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />
          <div className="avatar-upload">
            <label>Profile Picture:</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files[0];
                setAvatarFile(file);
                if (file) {
                  setAvatarPreview(URL.createObjectURL(file));
                } else {
                  setAvatarPreview('');
                }
              }}
            />
            {avatarPreview && (
              <img src={avatarPreview} alt="Preview" className="avatar-preview" />
            )}
          </div>
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
          posts.map((post) => <PostCard key={post._id} post={post} currentUserId={user._id} />)
        ) : (
          <p>No posts yet.</p>
        )}
      </div>
    </div>
  );
}
