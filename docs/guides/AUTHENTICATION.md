# 🔐 Authentication System

## Overview
College Media implements a secure JWT-based authentication system with support for standard email/password login, social providers (UI), and Two-Factor Authentication (2FA).

## Core Authentication

### User Flow
1.  **Signup**: Validates email (.edu preferred), hashes password (bcrypt), creates User.
2.  **Login**: Verifies credentials, issues JWT (7-day expiry), returns User object.
3.  **Persistence**: Token stored in localStorage; State managed via `AuthContext`.

### API Endpoints
- `POST /api/auth/register`: Create new account.
- `POST /api/auth/login`: Authenticate and receive token.
- `POST /api/auth/refresh-token`: (Optional) Rotate access tokens.

---

## Two-Factor Authentication (2FA)

### Implementation Status
- **Backend**: ✅ Complete (Speakeasy + QR Code).
- **Frontend**: 🚧 Pending integration in Settings.

### Architecture
1.  **Enable**: User requests 2FA -> Server generates TOTP secret -> Returns QR Code URL.
2.  **Verify**: User scans QR -> Enters 6-digit code -> Server validates -> 2FA enabled.
3.  **Login with 2FA**:
    - User enters password -> Server returns `2fa_required: true`.
    - UI prompts for code -> `POST /api/auth/2fa/verify-login`.
    - Server issues final JWT.

### Security Best Practices
- **Secrets**: Stored encrypted in MongoDB (`twoFactorSecret`).
- **Recovery**: (Future) Backup codes should be generated upon enabling 2FA.