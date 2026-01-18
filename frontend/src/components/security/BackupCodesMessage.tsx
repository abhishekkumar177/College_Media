import React, { useState } from 'react';
import './BackupCodesMessage.css';

/**
 * BackupCodesMessage Component
 * Displays backup codes with download and copy functionality
 * Issue #884: MFA Implementation
 */

interface BackupCodesMessageProps {
  codes: string[];
}

const BackupCodesMessage: React.FC<BackupCodesMessageProps> = ({ codes }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const codesText = codes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    const codesText = codes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `college-media-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Backup Codes</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
        }
        h1 {
          color: #333;
          margin-bottom: 20px;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffc107;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .codes {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 20px;
        }
        .code {
          font-family: 'Courier New', monospace;
          font-size: 16px;
          padding: 10px;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
        }
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write('<h1>College Media - Backup Codes</h1>');
      printWindow.document.write('<div class="warning">');
      printWindow.document.write('<strong>⚠️ Important:</strong> Store these codes in a safe place. Each code can only be used once.');
      printWindow.document.write('</div>');
      printWindow.document.write('<div class="codes">');
      codes.forEach((code) => {
        printWindow.document.write(`<div class="code">${code}</div>`);
      });
      printWindow.document.write('</div>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="backup-codes-message">
      <div className="warning-box">
        <div className="warning-icon">⚠️</div>
        <div className="warning-content">
          <h3>Save Your Backup Codes</h3>
          <p>
            These backup codes can be used to access your account if you lose your authenticator device.
            <strong> Each code can only be used once.</strong>
          </p>
          <p className="warning-important">
            Store them in a safe place - you won't be able to see them again!
          </p>
        </div>
      </div>

      <div className="codes-container">
        <div className="codes-grid">
          {codes.map((code, index) => (
            <div key={index} className="backup-code">
              <span className="code-number">{index + 1}.</span>
              <code className="code-value">{code}</code>
            </div>
          ))}
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={handleCopy} className="btn btn-secondary">
          {copied ? '✓ Copied!' : '📋 Copy All'}
        </button>
        <button onClick={handleDownload} className="btn btn-secondary">
          💾 Download
        </button>
        <button onClick={handlePrint} className="btn btn-secondary">
          🖨️ Print
        </button>
      </div>

      <div className="storage-suggestions">
        <h4>Where to store your codes:</h4>
        <ul>
          <li>✅ Password manager (recommended)</li>
          <li>✅ Encrypted note on your device</li>
          <li>✅ Printed copy in a secure location</li>
          <li>❌ DO NOT store in plain text files</li>
          <li>❌ DO NOT share with anyone</li>
        </ul>
      </div>
    </div>
  );
};

export default BackupCodesMessage;
