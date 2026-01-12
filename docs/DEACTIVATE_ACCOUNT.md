# Deactivate Account — Technical & User Documentation

> Last Updated: 2026-01-11

Table of Contents
- Overview
- Purpose & UX considerations
- Business rules and differences vs Delete
- Data model changes
- Backend implementation
  - Model methods
  - Routes & handlers
  - Mock DB support
  - Email notification on deactivation
  - Logging & auditing
- Frontend implementation
  - Settings page modal
  - Handlers and API integration
  - UX copy and accessibility
- API Reference
  - POST /api/account/deactivate
  - POST /api/account/reactivate
- Email template and examples
- Testing strategy
  - Unit tests
  - Integration tests
  - E2E tests
- Monitoring & observability
- Privacy, compliance & retention
- Rollback & migration steps
- Troubleshooting & FAQs
- Acceptance criteria & QA checklist
- Appendix: code snippets & utilities

---

## Overview

This document describes the design, implementation, API contract, testing, and operational considerations for the "Deactivate Account" feature in College Media.

Deactivate is a temporary, reversible action that places a user's account into a disabled state (not deleted). It is distinct from account deletion (soft-delete and scheduled permanent deletion). Deactivation preserves the user's data and allows the user to reactivate their account by logging back in.

The implementation includes:
- Backend model methods (`deactivate`, `reactivate`) for both MongoDB and the mock database
- API endpoints `POST /api/account/deactivate` and `POST /api/account/reactivate`
- Frontend Settings page modal with password confirmation and optional reason
- Email notification sent to the user's email address on successful deactivation
- Logging/auditing and non-blocking email send behavior


## Purpose & UX considerations

Why deactivate instead of delete?
- Deactivate is for users who want a break but plan to return.
- It hides the profile and prevents interactions but does not erase data.
- It should be quick to perform and easy to reverse.

Key UX goals:
- Make the difference between Deactivate and Delete clear in UI copy.
- Require password confirmation to avoid accidental deactivations.
- Notify the user by email (confirmation + instructions to reactivate).
- Preserve user data and connections while preventing public visibility and notifications.
- Ensure accessibility and keyboard navigation for modal flows.

Messaging should be reassuring and clear, e.g.:
- "Your account has been temporarily deactivated. You can reactivate anytime by logging in." 
- Email subject: "Account Deactivated — College Media"


## Business rules and differences vs Delete

Deactivate
- Effect: sets `isActive = false` for user record (account is disabled).
- Data: All data preserved (posts, messages, followers).
- Visibility: Profile hidden, no public listing, no notifications to the user.
- Reversible: Yes — user may reactivate by logging in or via `/api/account/reactivate`.
- Email: Send confirmation email on deactivation.

Delete (soft-delete)
- Effect: sets `isDeleted = true`, `isActive = false`, `deletedAt` timestamp, sets `scheduledDeletionDate`.
- Data: Soft-deleted with scheduling for permanent deletion (e.g., 30 days later).
- Visibility: Hidden and marked for deletion; some cleanup actions may be scheduled.
- Reversible: Yes within grace period via restore endpoint.
- Email: Potentially different flow (not covered here).


## Data model changes

User document (excerpt):

```js
settings: { ... },
isActive: { type: Boolean, default: true },
isDeleted: { type: Boolean, default: false },
deletedAt: Date,
deletedReason: String,
// new / reused fields
// deactivation reason stored in deletionReason for audit parity
```

Notes:
- Deactivation stores a `reason` string (optional) in `deletionReason` for audit. If you prefer a distinct `deactivationReason` field, add it and migrate existing data accordingly.


## Backend implementation

This section covers the model methods, routes, mock DB integration, email, and logging.

### Model methods (MongoDB)

Added to `backend/models/User.js`:

```js
// Deactivate account (temporary)
userSchema.methods.deactivate = async function(reason = null) {
  this.isActive = false;
  this.deletionReason = reason;
  return this.save();
};

// Reactivate account
userSchema.methods.reactivate = async function() {
  this.isActive = true;
  this.deletionReason = null;
  return this.save();
};
```

Rationale:
- Keep operations simple and safe.
- Use `deletionReason` to store both deletion and deactivation reasons to avoid schema churn — if clarity is needed, add `deactivationReason`.

### Mock DB support

Added to `backend/mockdb/userDB.js`:

```js
const deactivate = (id, reason = null) => { /* sets isActive=false, deletionReason=reason */ }
const reactivate = (id) => { /* sets isActive=true, deletionReason=null */ }
```

This ensures developers working in mock mode can test flows without MongoDB.

### Routes & handlers

Routes added to `backend/routes/account.js`:

- `POST /api/account/deactivate` — requires JWT, expects `{ password, reason? }`
- `POST /api/account/reactivate` — requires JWT, no body

Deactivate handler high-level flow:
1. Extract `password`, `reason` from request body
2. Verify JWT -> `req.userId`
3. Fetch user from DB (Mongo or mock)
4. If user not found -> 404
5. If already deactivated (isActive === false and not deleted) -> respond 200 (idempotent)
6. Verify password (bcrypt.compare with stored hash)
7. Call `user.deactivate(reason)` or `UserMock.deactivate(id, reason)`
8. Send confirmation email (non-blocking; log errors but do not roll back)
9. Return 200 with success message

Reactivate handler flow:
1. Verify JWT
2. Fetch user
3. If user not found -> 404
4. If `user.isActive === true` -> 400
5. If `user.isDeleted === true` -> 400 (deleted accounts require restore)
6. Call `user.reactivate()` or `UserMock.reactivate(id)`
7. Return success

Important security note:
- Deactivation requires password confirmation to avoid hijack and accidental disablement.
- Reactivation currently uses JWT presence; optionally require credentials if you want stronger reauth.

### Email notification on deactivation

Implementation: `backend/services/emailService.js` has a new function `sendAccountDeactivationEmail(email, username)` that sends an HTML email via Resend API (or your configured email provider).

Key behavior:
- Email send is attempted after DB update.
- If email fails, deactivation still completes; error is logged for operators.
- Make sure `process.env.RESEND_API_KEY` (or your provider credentials) are configured in production.

Example integration in handler:

```js
try {
  await sendAccountDeactivationEmail(user.email, user.username);
} catch (emailError) {
  console.error('Failed to send deactivation email:', emailError);
  // do not rollback; keep deactivation success
}
```

### Logging & auditing

A deactivation should be logged with the following fields:
- `userId`
- `timestamp`
- `action`: "deactivate"
- `ip` (optional: capture from request)
- `userAgent` (optional)
- `reason` (if provided)

If you use a centralized audit service or a database-backed audit log, add an entry there. Example log message:

```
User account deactivated: <userId> at <ISO timestamp> (reason: "on break")
```

For compliance, keep audit logs for the configured retention period.


## Frontend implementation

This section documents the Settings UI, modal, handlers, and integration with `accountApi`.

### Settings page modal

File: `frontend/src/pages/Settings.jsx`

- Added states:
  - `showDeactivateAccount` (boolean)
  - `deactivatePassword` (string)
  - `deactivateReason` (string)
  - `deactivateError` (string)
  - `deactivateLoading` (boolean)

- Modal details:
  - Title: "Deactivate Account"
  - Warning box describing temporary nature
  - Confirm Password (required)
  - Reason (optional textarea)
  - Cancel + Deactivate buttons

- UX details:
  - Yellow warning visuals (different than Delete red)
  - Accessibility: focus trap (modal), Escape to close, keyboard navigation

### Handlers and API integration

`handleDeactivateAccountSubmit` performs:
- Prevent default form submit
- Validate password present
- Set loading state
- Call `accountApi.deactivateAccount({ password, reason })`
- On success: logout user and redirect to `/login` with optional message
- On error: show `deactivateError` message

`accountApi` endpoints updated in `frontend/src/api/endpoints.js`:

```js
export const accountApi = {
  deactivateAccount: (data) => apiClient.post('/account/deactivate', data),
  reactivateAccount: () => apiClient.post('/account/reactivate'),
  // ...other endpoints
}
```

Token handling:
- `apiClient` should automatically include Authorization header with Bearer token from localStorage or cookie (as configured).

### UX copy & accessibility

Suggested UI copy for modal and confirmation:
- Modal header: "Deactivate Account"
- Warning: "Your account will be temporarily disabled — you can reactivate by logging in again. During deactivation your profile will be hidden and you will not receive notifications."
- Call-to-action button: "Deactivate Account"
- Confirmation message on success: "Your account has been deactivated. A confirmation email has been sent to your registered email."

Accessibility checklist for modal:
- `role="dialog"` with `aria-modal="true"`
- `aria-labelledby` for the modal title
- Focus trap inside modal while open
- `Escape` closes modal
- Buttons reachable by keyboard; primary button is first in DOM for screen reader convenience


## API Reference

### POST /api/account/deactivate

- Auth: Required (Bearer token)
- Body (JSON):
  - `password` (string, required) — the user's current password for confirmation
  - `reason` (string, optional) — optional reason for audit

Example Request:

```http
POST /api/account/deactivate
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "currentPassword123",
  "reason": "Taking a break for finals"
}
```

Example Success Response (200):

```json
{
  "success": true,
  "data": {
    "isActive": false,
    "message": "Your account has been deactivated. You can reactivate it anytime by logging in."
  },
  "message": "Account deactivated successfully. A confirmation email has been sent."
}
```

Errors:
- 400: Missing password or invalid input
- 401: Invalid JWT or token not provided
- 401: Incorrect password (invalid credentials)
- 404: User not found
- 500: Server error

Notes:
- Email send failure should not cause a 500 — it is logged and deactivation still returns success.

---

### POST /api/account/reactivate

- Auth: Required (Bearer token)
- Body: none

Example Success Response (200):

```json
{ "success": true, "data": null, "message": "Account reactivated successfully" }
```

Errors:
- 400: Account already active
- 400: Account deleted (must use restore endpoint)
- 401: Invalid token
- 404: User not found


## Email template and examples

The email template `sendAccountDeactivationEmail(email, username)` is an HTML mail with the following sections:
- Header with brand and subject: "Account Deactivated"
- Greeting: "Hi <username>"
- Confirmation: "Your account has been successfully deactivated"
- Warning box explaining what deactivation means (profile hidden, no notifications)
- Reactivation info: "Log in again to reactivate"
- Support contact: `support@collegemedia.com`

Plain-text fallback example (for non-HTML mail clients):

```
Subject: Account Deactivated - College Media

Hi <username>,

Your College Media account has been temporarily deactivated as requested.

What this means:
- Your profile will be hidden
- You won't receive notifications
- Your data is preserved

To reactivate: simply log in again with your credentials.

Questions: support@collegemedia.com

— College Media Team
```

Security: do not include password or sensitive tokens in email. Include only instructions.


## Testing strategy

### Unit tests (backend)

- Test `deactivate` model method toggles `isActive` and sets `deletionReason`.
- Test `reactivate` model method toggles `isActive` back to true.
- Test `POST /api/account/deactivate` handler:
  - When password missing -> 400
  - When password incorrect -> 401
  - When user not found -> 404
  - When correct -> 200 and `isActive` false
  - Verify email send attempted (mock email service) and errors are handled

Suggested test (Jest + Supertest):

```js
test('deactivates account with correct password', async () => {
  const res = await request(app)
    .post('/api/account/deactivate')
    .set('Authorization', `Bearer ${token}`)
    .send({ password: 'password123' });

  expect(res.status).toBe(200);
  const user = await User.findById(userId);
  expect(user.isActive).toBe(false);
});
```

Mocking email:
- Use Jest to mock `sendAccountDeactivationEmail` to assert it was called and to simulate failures.

### Integration tests (frontend+backend)

- Cypress test to open Settings page, open Deactivate modal, submit correct password, assert:
  - Redirect to `/login` after logout
  - `html` or API shows `isActive=false` (server state)
  - Confirmation toast or message appears
  - Local storage cleared if logout clears it

### E2E tests

- Test reactivation by logging in again after deactivation -> account restored (isActive true)
- Test attempts to reactivate a deleted account -> proper error flow


## Monitoring & observability

Recommended metrics to record:
- `account.deactivate.request` (counter)
- `account.deactivate.success` (counter)
- `account.deactivate.failure` (counter, by error type)
- `account.deactivate.email_failure` (counter)
- `account.reactivate.request` (counter)

Log entries should include:
- `userId`, `timestamp`, `ip`, `userAgent`, `reason` (if any)

Alerting:
- If `account.deactivate.email_failure` spikes, investigate email provider.
- If `account.deactivate.failure` rate increases, check password verification and DB connectivity.

Audit log retention:
- Keep audit logs for the operational retention period (e.g., 365 days) or per regulatory requirements.


## Privacy, compliance & retention

- Deactivation preserves data; deletion is the action that triggers scheduled removal.
- For GDPR/DSAR: Deactivation does not remove data; users may still request full deletion via Delete flow.
- Logging should avoid storing raw passwords; only store audit metadata.
- Ensure email templates and processes comply with anti-spam and privacy policies.


## Rollback & migration steps

If you need to revert the feature:
1. Revert route changes in `backend/routes/account.js` and model methods in `User.js`.
2. Remove `deactivate`/`reactivate` utility exports in mock DB.
3. Remove UI modal from `Settings.jsx`.
4. Re-deploy backend and frontend in coordinated manner.

Migration note: If you add a new field `deactivationReason` instead of reusing `deletionReason`, write a migration script to backfill as needed.


## Troubleshooting & FAQs

Q: "I deactivated my account but didn't get an email."
A: Check spam folder; ensure `support@collegemedia.com` is not blocked. If not received and provider shows delivery issues, check backend logs for `Failed to send deactivation email` and ensure `RESEND_API_KEY` or mail provider credentials are valid.

Q: "I reactivated but still can't post."
A: Ensure your account was actually reactivated (check `isActive` in DB). If you restored from a deleted state, the restore endpoint must have been used instead.

Q: "Can another person deactivate my account?"
A: No — deactivation requires the account password.

Q: "Does deactivation free up my username?"
A: No — username is reserved during deactivation. Only permanent deletion may release it depending on policy.


## Acceptance criteria & QA checklist

- [ ] User can open Deactivate modal from Settings
- [ ] Modal requires password and optionally reason
- [ ] Submit with correct password: API returns 200, user logged out, email sent (or attempted)
- [ ] Submit with incorrect password: API returns 401 and modal shows error
- [ ] Reactivation by logging in sets `isActive=true`
- [ ] Deactivated users are not discoverable and do not receive notifications
- [ ] Email template renders properly in major mail clients (Gmail, Outlook, Apple Mail)
- [ ] Accessibility: modal is keyboard accessible and screen reader friendly
- [ ] Audit log entry created for deactivation
- [ ] Tests (unit/integration/E2E) are implemented and pass


## Appendix: code snippets & utilities

### Sample curl request (deactivate)

```bash
curl -X POST 'https://api.collegemedia.com/account/deactivate' \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"password":"currentPassword123","reason":"Taking a break"}'
```

### Sample axios client call (frontend)

```js
// frontend/src/api/endpoints.js
export const accountApi = {
  deactivateAccount: (data) => apiClient.post('/account/deactivate', data),
  reactivateAccount: () => apiClient.post('/account/reactivate'),
}

// usage
await accountApi.deactivateAccount({ password: 'pwd', reason: 'break' });
```

### Test helpers (mocking email send)

```js
// jest.mock('../services/emailService', () => ({
//  sendAccountDeactivationEmail: jest.fn().mockResolvedValue(true),
//}));
```

### Example log message format

```
INFO: account:deactivate userId=abc123 ip=1.2.3.4 ua="Mozilla/5.0" reason="break" timestamp=2026-01-11T12:34:56Z
```


---

If you'd like, I can now:
- add this file into `docs/` (already created here),
- run unit tests or add test scaffolding for the new routes,
- or add the document link to `docs/DOCUMENTATION_SUMMARY.md`.

Which next step would you prefer?