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
    <div style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '100vh' }}>
      {/* Dashboard Navigation */}
      <nav style={{ 
        background: 'var(--color-card-bg)', 
        boxShadow: '0 1px 3px var(--color-card-shadow)', 
        borderBottom: '1px solid var(--color-border-primary)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 50 
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                background: 'var(--color-primary)', 
                borderRadius: '6px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>C</span>
              </div>
              <span style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: 'var(--color-text-primary)', 
                letterSpacing: '0.025em' 
              }}>
                COLLEGE MEDIA
              </span>
            </div>

            {/* User Menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link 
                to="/profile" 
                style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: 'var(--color-text-secondary)', 
                  textDecoration: 'none', 
                  transition: 'color var(--transition-base)' 
                }} 
                onMouseOver={(e) => e.target.style.color = 'var(--color-primary)'} 
                onMouseOut={(e) => e.target.style.color = 'var(--color-text-secondary)'}
              >
                Profile
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    background: 'var(--color-primary-light)', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <span style={{ 
                      color: 'var(--color-primary)', 
                      fontWeight: '600', 
                      fontSize: '14px' 
                    }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: 'var(--color-text-primary)' 
                  }}>
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: 'white', 
                    background: 'var(--color-primary)', 
                    borderRadius: '8px', 
                    border: 'none', 
                    cursor: 'pointer', 
                    transition: 'background var(--transition-base)' 
                  }}
                  onMouseOver={(e) => e.target.style.background = 'var(--color-primary-dark)'}
                  onMouseOut={(e) => e.target.style.background = 'var(--color-primary)'}
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
          <div style={{ 
            background: 'var(--color-card-bg)', 
            borderRadius: '16px', 
            boxShadow: '0 1px 3px var(--color-card-shadow)', 
            padding: '2rem', 
            border: '1px solid var(--color-border-primary)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: 'var(--color-text-primary)', 
                  marginBottom: '0.5rem' 
                }}>
                  Welcome back, {user.name}! 👋
                </h1>
                <p style={{ 
                  color: 'var(--color-text-secondary)', 
                  fontSize: '15px' 
                }}>
                  Here's what's happening in your network today.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ 
                  background: 'var(--color-primary-light)', 
                  borderRadius: '12px', 
                  padding: '1rem 1.5rem', 
                  textAlign: 'center', 
                  minWidth: '100px' 
                }}>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: 'var(--color-primary)' 
                  }}>
                    24
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--color-text-secondary)', 
                    marginTop: '0.25rem' 
                  }}>
                    Posts
                  </div>
                </div>
                <div style={{ 
                  background: 'var(--color-success-light)', 
                  borderRadius: '12px', 
                  padding: '1rem 1.5rem', 
                  textAlign: 'center', 
                  minWidth: '100px' 
                }}>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: 'var(--color-success)' 
                  }}>
                    156
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--color-text-secondary)', 
                    marginTop: '0.25rem' 
                  }}>
                    Connections
                  </div>
                </div>
                <div style={{ 
                  background: 'var(--color-warning-light)', 
                  borderRadius: '12px', 
                  padding: '1rem 1.5rem', 
                  textAlign: 'center', 
                  minWidth: '100px' 
                }}>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: '700', 
                    color: 'var(--color-warning)' 
                  }}>
                    8
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'var(--color-text-secondary)', 
                    marginTop: '0.25rem' 
                  }}>
                    Events
                  </div>
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
                <button style={{ 
                  background: 'var(--color-card-bg)', 
                  padding: '1.5rem', 
                  borderRadius: '12px', 
                  boxShadow: '0 1px 3px var(--color-card-shadow)', 
                  border: '1px solid var(--color-border-primary)', 
                  textAlign: 'left', 
                  cursor: 'pointer', 
                  transition: 'all var(--transition-base)' 
                }} onMouseOver={(e) => e.target.style.boxShadow = '0 4px 6px var(--color-card-shadow)'} onMouseOut={(e) => e.target.style.boxShadow = '0 1px 3px var(--color-card-shadow)'}>
                  <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>📝</div>
                  <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '15px' }}>Create Post</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Share your thoughts</div>
                </button>
                <button style={{ 
                  background: 'var(--color-card-bg)', 
                  padding: '1.5rem', 
                  borderRadius: '12px', 
                  boxShadow: '0 1px 3px var(--color-card-shadow)', 
                  border: '1px solid var(--color-border-primary)', 
                  textAlign: 'left', 
                  cursor: 'pointer', 
                  transition: 'all var(--transition-base)' 
                }} onMouseOver={(e) => e.target.style.boxShadow = '0 4px 6px var(--color-card-shadow)'} onMouseOut={(e) => e.target.style.boxShadow = '0 1px 3px var(--color-card-shadow)'}>
                  <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>📅</div>
                  <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '15px' }}>Events</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Browse upcoming events</div>
                </button>
                <button style={{ 
                  background: 'var(--color-card-bg)', 
                  padding: '1.5rem', 
                  borderRadius: '12px', 
                  boxShadow: '0 1px 3px var(--color-card-shadow)', 
                  border: '1px solid var(--color-border-primary)', 
                  textAlign: 'left', 
                  cursor: 'pointer', 
                  transition: 'all var(--transition-base)' 
                }} onMouseOver={(e) => e.target.style.boxShadow = '0 4px 6px var(--color-card-shadow)'} onMouseOut={(e) => e.target.style.boxShadow = '0 1px 3px var(--color-card-shadow)'}>
                  <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>👥</div>
                  <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '15px' }}>Network</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Connect with peers</div>
                </button>
                <button style={{ 
                  background: 'var(--color-card-bg)', 
                  padding: '1.5rem', 
                  borderRadius: '12px', 
                  boxShadow: '0 1px 3px var(--color-card-shadow)', 
                  border: '1px solid var(--color-border-primary)', 
                  textAlign: 'left', 
                  cursor: 'pointer', 
                  transition: 'all var(--transition-base)' 
                }} onMouseOver={(e) => e.target.style.boxShadow = '0 4px 6px var(--color-card-shadow)'} onMouseOut={(e) => e.target.style.boxShadow = '0 1px 3px var(--color-card-shadow)'}>
                  <div style={{ fontSize: '28px', marginBottom: '0.5rem' }}>💬</div>
                  <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '15px' }}>Messages</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Check your inbox</div>
                </button>
              </div>

              {/* Social Feed */}
              <div style={{ 
                background: 'var(--color-card-bg)', 
                borderRadius: '16px', 
                boxShadow: '0 1px 3px var(--color-card-shadow)', 
                border: '1px solid var(--color-border-primary)', 
                overflow: 'hidden' 
              }}>
                <SocialFeed />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
