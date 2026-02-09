import React, { useState, useEffect } from 'react';

const sampleNotifications = [
  {
    _id: '1',
    type: 'comment',
    message: 'Ayaan commented on your post.',
    fromUser: { name: 'Ayaan', avatar: 'https://ui-avatars.com/api/?name=Ayaan' },
    post: { content: 'Excited to share my latest project!' },
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    type: 'like',
    message: 'Ayaan liked your post.',
    fromUser: { name: 'Ayaan', avatar: 'https://ui-avatars.com/api/?name=Ayaan' },
    post: { content: 'Coffee + Code = Perfect day ☕👨‍💻' },
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '3',
    type: 'reply',
    message: 'Ayaan replied to your comment.',
    fromUser: { name: 'Ayaan', avatar: 'https://ui-avatars.com/api/?name=Ayaan' },
    post: { content: 'Web development workshops are the best!' },
    read: true,
    createdAt: new Date().toISOString(),
  },
];


export default function NotificationBell() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications(sampleNotifications);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '0 8px' }}
      >
        <span style={{ fontSize: 26, color: 'var(--color-primary)' }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: 2, right: 2, background: 'var(--color-error)', color: 'white', borderRadius: '50%', fontSize: 12, padding: '2px 6px', fontWeight: 600 }}>{unreadCount}</span>
        )}
      </button>
      {showDropdown && (
        <div style={{ position: 'absolute', right: 0, top: '120%', background: 'white', border: '1px solid var(--color-border-primary)', borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: 350, zIndex: 100, minHeight: 120, overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border-primary)', fontWeight: '700', color: 'var(--color-primary)', fontSize: 18, background: 'var(--color-bg-primary)' }}>Notifications</div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {notifications.length === 0 ? (
              <li style={{ padding: '1rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>No notifications</li>
            ) : (
              notifications.map(n => (
                <li key={n._id} style={{ padding: '1rem', borderBottom: '1px solid var(--color-border-primary)', background: n.read ? 'var(--color-bg-primary)' : 'var(--color-card-bg)', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f0f4fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: 18, color: 'var(--color-primary)', marginRight: 8 }}>
                    <img src={n.fromUser.avatar} alt={n.fromUser.name} style={{ width: 36, height: 36, borderRadius: '50%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>{n.message}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Post: {n.post.content.slice(0, 40)}...</div>
                  </div>
                  {!n.read && <span style={{ color: 'var(--color-primary)', fontSize: 16, fontWeight: 700 }}>●</span>}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
