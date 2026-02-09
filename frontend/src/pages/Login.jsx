import { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../components/Navbar';
import ErrorMessage from '../components/ErrorMessage';
export default function Login() {
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState('');
    const handleResetSubmit = async (e) => {
      e.preventDefault();
      setResetLoading(true);
      setResetMessage('');
      try {
        const response = await fetch('http://localhost:3002/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: resetEmail })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send reset email');
        setResetMessage('Password reset email sent! Check your inbox.');
      } catch (err) {
        setResetMessage(err.message);
      } finally {
        setResetLoading(false);
      }
    };
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      login(data.token, data.user);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 lg:px-12 py-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 tracking-wide">COLLEGE MEDIA</span>
        </div>
        <Link to="/signup" className="auth-cta">
          Create an Account
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="auth-card w-full max-w-md p-10">
          <h1 className="auth-title text-3xl font-bold mb-10">Log in</h1>

          <ErrorMessage message={error} visible={!!error} />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="auth-input"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="8+ characters"
                  className="auth-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-toggle"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="mt-2 text-right">
                <button type="button" className="auth-link" style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', padding: 0 }} onClick={() => setShowResetModal(true)}>
                  Forgot password?
                </button>
                {showResetModal && (
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', minWidth: 320 }}>
                      <h3>Reset Password</h3>
                      <form onSubmit={handleResetSubmit}>
                        <input type="email" placeholder="Enter your email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                        <button className="auth-btn auth-btn-primary" type="submit" disabled={resetLoading} style={{ marginRight: '1rem' }}>Send Reset Email</button>
                        <button className="auth-btn" type="button" onClick={() => setShowResetModal(false)}>Cancel</button>
                      </form>
                      {resetMessage && <div style={{ marginTop: '1rem', color: resetMessage.includes('sent') ? 'green' : 'red' }}>{resetMessage}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="auth-btn auth-btn-primary"
            >
              <span>{loading ? 'Logging in...' : "Let's go"}</span>
              {!loading && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
