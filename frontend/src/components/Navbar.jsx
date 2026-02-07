import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { FaBars, FaTimes } from 'react-icons/fa';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setShowDropdown(false);
  }, [location]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
  };

  return (
    <nav>
      <div className="container nav-container">
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
          <div className="logo-icon">C</div>
          <span>ProjectX</span>
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Overlay */}
        <div
          className={`nav-overlay ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(false)}
        />

        <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          {isMenuOpen && (
            <button
              className="close-menu"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaTimes />
            </button>
          )}

          <ul>
            <li>
              <ThemeToggle />
            </li>
            <li><a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a></li>
            <li><a href="#about" onClick={() => setIsMenuOpen(false)}>About</a></li>
            <li><a href="#team" onClick={() => setIsMenuOpen(false)}>Team</a></li>
            {isAuthenticated ? (
              <li style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="btn btn-primary"
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {user?.name || 'User'} ▼
                </button>
                {showDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    minWidth: '160px',
                    zIndex: 1000,
                    overflow: 'hidden'
                  }}>
                    <Link
                      to={user && user._id ? `/profile/${user._id}` : '#'}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        display: 'block',
                        textAlign: 'left',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: theme === 'dark' ? '#fff' : '#1e293b',
                        fontWeight: '500',
                        textDecoration: 'none'
                      }}
                      onClick={() => setShowDropdown(false)}
                      onMouseEnter={e => e.target.style.backgroundColor = theme === 'dark' ? '#334155' : '#f3f4f6'}
                      onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: '#ef4444',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = theme === 'dark' ? '#334155' : '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <>
                <li>
                  <Link to="/login" className="login-link" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
          <NotificationBell />
        </div>
      </div>
    </nav>
  );
}
