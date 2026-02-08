
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function SampleProfile() {
  const [userId, setUserId] = useState('');
  const [user, setUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Allow fetch by username or ObjectId
  const fetchUser = async () => {
    let url = `http://localhost:3002/api/users/${userId}`;
    // If not a valid ObjectId, try username endpoint
    if (!/^[a-fA-F0-9]{24}$/.test(userId)) {
      url = `http://localhost:3002/api/users/by-username/${userId}`;
    }
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || data); // support both {user, posts} and user only
        setAvatarPreview('');
        setAvatarFile(null);
      } else {
        toast.error('User not found');
      }
    } catch {
      toast.error('Error fetching user');
    }
  };

  const handleAvatarUpload = async (e) => {
    e.preventDefault();
    if (!avatarFile || !userId) return toast.error('Select user and image');
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    try {
      const res = await fetch(`http://localhost:3002/api/users/${userId}/avatar`, {
        method: 'PATCH',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ ...user, avatar: data.avatar });
        setAvatarPreview('');
        setAvatarFile(null);
        toast.success('Avatar updated!');
      } else {
        toast.error('Upload failed');
      }
    } catch {
      toast.error('Error uploading');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 420, width: '100%', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0001', padding: 32, margin: 24 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#1a237e', letterSpacing: 1 }}>Sample Profile Page</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #bdbdbd', fontSize: 16 }}
          />
          <button onClick={fetchUser} style={{ padding: '10px 18px', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Fetch</button>
        </div>
        {user && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
              <img
                src={avatarPreview || (user.avatar ? `http://localhost:3002${user.avatar}` : '/default-avatar.png')}
                alt="Avatar"
                style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', marginBottom: 8, border: '3px solid #1976d2', background: '#e3eafc' }}
              />
              <form onSubmit={handleAvatarUpload} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 8, width: '100%' }}>
                <label style={{ fontWeight: 500, color: '#333', marginBottom: 4 }}>Change Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  style={{ marginBottom: 4 }}
                  onChange={e => {
                    const file = e.target.files[0];
                    setAvatarFile(file);
                    setAvatarPreview(file ? URL.createObjectURL(file) : '');
                  }}
                />
                {avatarPreview && (
                  <img src={avatarPreview} alt="Preview" style={{ width: 80, height: 80, borderRadius: '50%', marginTop: 4, border: '2px solid #90caf9' }} />
                )}
                <button type="submit" style={{ marginTop: 8, padding: '8px 20px', borderRadius: 8, background: '#43a047', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Upload</button>
              </form>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 8, fontSize: 18, fontWeight: 600, color: '#263238' }}>{user.name}</div>
            <div style={{ textAlign: 'center', color: '#607d8b', marginBottom: 4 }}>{user.email}</div>
          </div>
        )}
      </div>
    </div>
  );
}
