import { useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import SocialFeed from '../components/Social/SocialFeed';

export default function Dashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)' }}>
      {/* Dashboard Navigation */}
      <nav style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', background: '#4F46E5', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>C</span>
              </div>
              <span style={{ fontSize: '18px', fontWeight: '600', color: '#111827', letterSpacing: '0.025em' }}>COLLEGE MEDIA</span>
            </div>

            {/* User Menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/profile" style={{ fontSize: '14px', fontWeight: '500', color: '#374151', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#4F46E5'} onMouseOut={(e) => e.target.style.color = '#374151'}>
                Profile
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '32px', height: '32px', background: '#EEF2FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#4F46E5', fontWeight: '600', fontSize: '14px' }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  style={{ padding: '0.5rem 1rem', fontSize: '14px', fontWeight: '500', color: 'white', background: '#4F46E5', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.target.style.background = '#4338CA'}
                  onMouseOut={(e) => e.target.style.background = '#4F46E5'}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Layout */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          
          {/* Welcome Section */}
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem', border: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
                  Welcome back, {user.name}! 👋
                </h1>
                <p style={{ color: '#6B7280', fontSize: '15px' }}>
                  Here's what's happening in your network today.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ background: '#EEF2FF', borderRadius: '12px', padding: '1rem 1.5rem', textAlign: 'center', minWidth: '100px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#4F46E5' }}>24</div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '0.25rem' }}>Posts</div>
                </div>
                <div style={{ background: '#D1FAE5', borderRadius: '12px', padding: '1rem 1.5rem', textAlign: 'center', minWidth: '100px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>156</div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '0.25rem' }}>Connections</div>
                </div>
                <div style={{ background: '#E9D5FF', borderRadius: '12px', padding: '1rem 1.5rem', textAlign: 'center', minWidth: '100px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#7C3AED' }}>8</div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '0.25rem' }}>Events</div>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.5rem' }}>
            
            {/* Left Column - Social Feed */}
            <div style={{ gridColumn: '1 / -1' }}>
              {/* Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <button style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #F3F4F6', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'} onMouseOut={(e) => e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}>
                  <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>📝</div>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>Create Post</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '0.25rem' }}>Share your thoughts</div>
                </button>
                <button style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #F3F4F6', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'} onMouseOut={(e) => e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}>
                  <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>📅</div>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>Events</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '0.25rem' }}>Browse upcoming events</div>
                </button>
                <button style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #F3F4F6', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'} onMouseOut={(e) => e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}>
                  <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>👥</div>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>Network</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '0.25rem' }}>Connect with peers</div>
                </button>
                <button style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #F3F4F6', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'} onMouseOut={(e) => e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}>
                  <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>💬</div>
                  <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>Messages</div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '0.25rem' }}>Check your inbox</div>
                </button>
              </div>

              {/* Social Feed */}
              <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #F3F4F6', overflow: 'hidden' }}>
                <SocialFeed />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
