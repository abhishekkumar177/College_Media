# ⚙️ Account Lifecycle: Deactivation & Deletion

## Overview
Users have two options for removing their presence from the platform: **Deactivation** (temporary) and **Deletion** (permanent).

---

## 1. Account Deactivation (Temporary)
Deactivation disables the account without erasing data. It is intended for users taking a break.

- **Effect**: `isActive = false`. Profile is hidden. No public listing.
- **Data**: All posts, messages, and followers are **preserved**.
- **Reversal**: User can reactivate simply by logging in.
- **API**: `POST /api/account/deactivate` (Requires password confirmation).

---

## 2. Account Deletion (Permanent)
Deletion is a destructive action with a 30-day grace period (Soft Delete).

- **Effect**: `isDeleted = true`, `scheduledDeletionDate = Now + 30 Days`.
- **Grace Period**: Account is hidden immediately. User has 30 days to "Restore" via the login screen.
- **Permanent Removal**: A background cron job runs daily to permanently remove accounts past their `scheduledDeletionDate`.
- **Data Export**: Users are prompted to export their data (GDPR compliant) before deletion.

### Security
- **Password Confirmation**: Required for both Deactivation and Deletion.
- **Audit Logging**: All lifecycle events (Deactivate, Delete, Restore) are logged with IP and timestamp.

### API Reference
- `DELETE /api/account`: Triggers soft delete.
- `POST /api/account/restore`: Cancels deletion (during grace period).
- `POST /api/account/export-data`: Generates a JSON dump of user data.