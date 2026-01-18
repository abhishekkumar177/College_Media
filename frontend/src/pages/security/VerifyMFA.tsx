import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './VerifyMFA.css';

/**
 * VerifyMFA Page
 * Handles MFA verification during login
 * Issue #884: MFA Implementation
 */

const VerifyMFA: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setError: setAuthError } = useAuth();
  
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const userId = location.state?.userId;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    // If no userId in state, redirect to login
    if (!userId) {
      navigate('/login', { 
        state: { message: 'Please log in first' } 
      });
    }
  }, [userId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setError('Please enter a verification code');
      return;
    }

    if (!useBackupCode && verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/2fa/verify-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          token: verificationCode.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token
        const token = data.data.token || data.token;
        localStorage.setItem('token', token);

        // Fetch user profile
        const profileResponse = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const profileData = await profileResponse.json();
        
        if (profileData.success) {
          setUser(profileData.data);
          navigate('/feed', { 
            state: { message: 'Login successful!' } 
          });
        } else {
          throw new Error('Failed to fetch user profile');
        }
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
      console.error('MFA verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (useBackupCode) {
      // Allow alphanumeric for backup codes
      setVerificationCode(value.toUpperCase().slice(0, 8));
    } else {
      // Only digits for TOTP
      setVerificationCode(value.replace(/\D/g, '').slice(0, 6));
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="verify-mfa-container">
      <div className="verify-mfa-card">
        <div className="icon-header">
          <div className="lock-icon">🔐</div>
        </div>

        <h1>Two-Factor Authentication</h1>
        <p className="description">
          {useBackupCode 
            ? 'Enter one of your backup codes to continue'
            : 'Enter the 6-digit code from your authenticator app'
          }
        </p>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="verification-form">
          <div className="input-wrapper">
            <input
              type="text"
              value={verificationCode}
              onChange={handleInputChange}
              placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
              maxLength={useBackupCode ? 8 : 6}
              className="code-input"
              autoFocus
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || verificationCode.length < (useBackupCode ? 8 : 6)}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <div className="alternative-options">
          <button
            type="button"
            onClick={() => {
              setUseBackupCode(!useBackupCode);
              setVerificationCode('');
              setError(null);
            }}
            className="link-button"
          >
            {useBackupCode 
              ? '← Use authenticator code instead'
              : 'Lost your device? Use backup code'
            }
          </button>
        </div>

        <div className="back-to-login">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="link-button"
          >
            ← Back to login
          </button>
        </div>

        <div className="help-text">
          <p>
            <strong>Need help?</strong>
          </p>
          <p>
            If you've lost access to your authenticator app and don't have backup codes, 
            please contact support to regain access to your account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyMFA;
