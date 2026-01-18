import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BackupCodesMessage from '../../components/security/BackupCodesMessage';
import './SetupMFA.css';

/**
 * SetupMFA Page
 * Allows users to enable Two-Factor Authentication
 * Issue #884: MFA Implementation
 */

interface MFASetupData {
  secret: string;
  qrCodeUrl: string;
}

const SetupMFA: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'generate' | 'verify' | 'complete'>('generate');
  
  const [setupData, setSetupData] = useState<MFASetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    // Check if MFA is already enabled
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/2fa/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success && data.data.enabled) {
        navigate('/settings', { 
          state: { message: 'MFA is already enabled for your account' } 
        });
      }
    } catch (err) {
      console.error('Error checking MFA status:', err);
    }
  };

  const handleGenerateQR = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/2fa/setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setSetupData({
          secret: data.secret,
          qrCodeUrl: data.qrCodeUrl,
        });
        setStep('verify');
      } else {
        setError(data.message || 'Failed to generate QR code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Generate QR error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/2fa/enable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: setupData?.secret,
          token: verificationCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBackupCodes(data.backupCodes);
        setStep('complete');
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Enable MFA error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    navigate('/settings', { 
      state: { message: 'Two-Factor Authentication enabled successfully!' } 
    });
  };

  return (
    <div className="setup-mfa-container">
      <div className="setup-mfa-card">
        <h1>🔐 Setup Two-Factor Authentication</h1>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {step === 'generate' && (
          <div className="step-generate">
            <p className="description">
              Two-Factor Authentication (2FA) adds an extra layer of security to your account. 
              You'll need to enter a code from your authenticator app when logging in.
            </p>
            
            <div className="security-benefits">
              <h3>Benefits:</h3>
              <ul>
                <li>✅ Protect your account from unauthorized access</li>
                <li>✅ Secure sensitive data and transactions</li>
                <li>✅ Peace of mind knowing your account is safe</li>
              </ul>
            </div>

            <button
              onClick={handleGenerateQR}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Generating...' : 'Get Started'}
            </button>
          </div>
        )}

        {step === 'verify' && setupData && (
          <div className="step-verify">
            <h2>Scan QR Code</h2>
            <p className="description">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>

            <div className="qr-code-container">
              <img 
                src={setupData.qrCodeUrl} 
                alt="QR Code for 2FA setup"
                className="qr-code"
              />
            </div>

            <div className="manual-entry">
              <p>Can't scan? Enter this code manually:</p>
              <code className="secret-code">{setupData.secret}</code>
              <button
                onClick={() => navigator.clipboard.writeText(setupData.secret)}
                className="btn btn-secondary btn-sm"
              >
                📋 Copy Code
              </button>
            </div>

            <form onSubmit={handleVerifyAndEnable} className="verification-form">
              <label htmlFor="verification-code">
                Enter the 6-digit code from your app:
              </label>
              <input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="code-input"
                autoFocus
                required
              />

              <div className="button-group">
                <button
                  type="button"
                  onClick={() => setStep('generate')}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'complete' && (
          <div className="step-complete">
            <div className="success-icon">✓</div>
            <h2>2FA Enabled Successfully!</h2>
            
            <BackupCodesMessage codes={backupCodes} />

            <button
              onClick={handleComplete}
              className="btn btn-primary"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupMFA;
