# Change Password

Version: 1.0.0

Last updated: 2026-01-10

Authors: Documentation Team

Overview
--------

This document provides an extensive reference for the "Change Password" feature, covering API details, backend and frontend examples, validation rules, security requirements, testing guidance, monitoring and observability, deployment considerations, UX copy and accessibility, migration and rollback plans, and a comprehensive FAQ.

This is intended for engineers implementing the endpoint, frontend engineers wiring the UI, QA engineers writing tests, and security reviewers.

Table of contents
-----------------

1. Purpose
2. User stories
3. API specification
   - Endpoint
   - Authentication
   - Request schema
   - Response schema
   - Error codes
4. Data model and storage
5. Server-side implementation patterns (Node/Express examples)
6. Password hashing & salting recommendations
7. Password strength algorithm & checks
8. Rate limiting and brute-force protection
9. Frontend UX and implementation (React examples)
10. Client-side validation & accessibility
11. Session management and token rotation
12. Audit logging and monitoring
13. Testing matrix (unit, integration, e2e)
14. Load and performance considerations
15. Deployment and migration plan
16. Rollback strategy
17. Security checklist
18. Localization and copy
19. Troubleshooting & FAQ
20. Appendix: sample scripts and curl examples

1. Purpose
----------

Allow an authenticated user to change their account password by providing their current password and a replacement. This operation must be secure, highly auditable, resistant to abuse, and integrated with session and token lifecycle management.

2. User stories
---------------

- As a logged-in user, I want to change my password so I can rotate credentials periodically.
- As a user who suspects compromise, I want to change my password and sign out other sessions.
- As a user with a weak password, I want the system to guide me to pick a stronger password.
- As a security engineer, I want password changes to be audited and rate-limited.

3. API specification
--------------------

Endpoint
++++++

- Method: PUT
- URL: `/api/users/change-password`
- Content-Type: `application/json`
- Authentication: Required (Bearer token or session cookie)

Authentication
-------------

This endpoint requires a valid authentication context. For token-based auth, require the Authorization header `Bearer <access_token>`. For cookie-based sessions, require a secure, HttpOnly session cookie. The server must validate the session or token and extract the user id.

Request schema
--------------

JSON body fields:

- `currentPassword` (string, required): the user's current password in plaintext transmitted via TLS.
- `newPassword` (string, required): the new password the user wants to set.
- `logoutAllSessions` (boolean, optional, default false): whether to invalidate all other sessions after successful change.

Example request body:

{
  "currentPassword": "OldP@ssw0rd",
  "newPassword": "N3w$tr0ngP@ssw0rd",
  "logoutAllSessions": true
}

Response schema
---------------

Success response:

- Status: 200 OK
- Body:

  {
    "message": "Password changed successfully",
    "sessionInvalidated": true
  }

Failure responses (examples):

- 400 Bad Request
  - Body: { "error": "newPassword is too weak" }
- 401 Unauthorized
  - Body: { "error": "authentication required" }
  or { "error": "current password is incorrect" }
- 429 Too Many Requests
  - Body: { "error": "too many attempts; try again later" }
- 500 Internal Server Error

Error codes and shapes should be consistent across the API. Prefer using a JSON object with `error`, `code`, and optional `details` fields for programmatic handling.

4. Data model and storage
-------------------------

User model fields relevant to password change:

- `id` (UUID or numeric primary key)
- `email` (string)
- `passwordHash` (string)
- `passwordSalt` (if using a separate salt)
- `passwordChangedAt` (timestamp)
- `passwordHistory` (optional array or separate table storing previous password hashes and timestamps)
- `failedPasswordAttempts` (counter for throttling/lockout)

Schema example (SQL):

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  password_changed_at TIMESTAMP WITH TIME ZONE NULL,
  failed_password_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

If you use a `password_history` table, store hashes (not plaintext) and timestamps to prevent reuse of recent passwords.

5. Server-side implementation patterns (Node/Express examples)
------------------------------------------------------------

High-level steps for an Express controller:

1. Authenticate the request and retrieve `userId`.
2. Parse and validate request body.
3. Retrieve user record from database.
4. Compare `currentPassword` with stored `passwordHash` using safe compare.
5. Validate `newPassword` meets strength policy and is not in `passwordHistory`.
6. Generate new password hash (bcrypt/argon2), update user record and `passwordChangedAt`.
7. Optionally, invalidate or rotate sessions/tokens.
8. Emit audit log and return success.

Example controller (pseudo-code):

```js
// controllers/userController.js
const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword, logoutAllSessions } = req.body;

  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'missing fields' });

  const user = await db.users.findById(userId);
  if (!user) return res.status(404).json({ error: 'user not found' });

  const match = await verifyPassword(currentPassword, user.password_hash);
  if (!match) return res.status(401).json({ error: 'current password is incorrect' });

  const strength = checkPasswordStrength(newPassword);
  if (!strength.ok) return res.status(400).json({ error: 'new password is too weak', details: strength.details });

  if (await isPasswordInHistory(userId, newPassword)) {
    return res.status(400).json({ error: 'password was used recently' });
  }

  const newHash = await hashPassword(newPassword);
  await db.users.update(userId, { password_hash: newHash, password_changed_at: new Date() });

  if (logoutAllSessions) await invalidateOtherSessions(userId, req.sessionId);

  await audit.log({ userId, action: 'password_change', ip: req.ip });

  return res.json({ message: 'Password changed successfully', sessionInvalidated: logoutAllSessions });
};
```

6. Password hashing & salting recommendations
--------------------------------------------

- Use a modern, adaptive hashing algorithm: Argon2id is recommended, or bcrypt with a secure cost factor. Avoid SHA-family or MD5 for password storage.
- Use per-password random salt (most libraries handle this automatically).
- Configure appropriate memory/time/work factors for Argon2 based on your environment. For bcrypt, use a cost of at least 12 (higher if CPU allows).
- Ensure password hashing runs in a worker thread or separate process if your web server is single-threaded (Node.js) to avoid blocking event loop.

Example using `argon2` in Node:

```js
const argon2 = require('argon2');

async function hashPassword(plaintext) {
  return argon2.hash(plaintext, { type: argon2.argon2id, memoryCost: 2 ** 16, timeCost: 3, parallelism: 1 });
}

async function verifyPassword(plaintext, hash) {
  try { return await argon2.verify(hash, plaintext); }
  catch (e) { return false; }
}
```

7. Password strength algorithm & checks
--------------------------------------

Server-side checks should include (but not be limited to):

- Minimum length (recommend 12, allow 8 for legacy compatibility if required)
- Not equal to `currentPassword`
- Not in a list of common passwords (use top 100k breached passwords list)
- Entropy estimation (zxcvbn or similar) to score password strength
- Ensure inclusion of character classes if policy requires (upper, lower, number, symbol)
- Check against `passwordHistory` to prevent reuse

Example using `zxcvbn` and a blocklist:

```js
const zxcvbn = require('zxcvbn');
const breached = loadBreachedList(); // a set of common passwords

function checkPasswordStrength(pw) {
  if (breached.has(pw)) return { ok: false, details: 'password is commonly breached' };
  const score = zxcvbn(pw).score; // 0-4
  if (score < 3) return { ok: false, details: 'password too weak' };
  return { ok: true };
}
```

8. Rate limiting and brute-force protection
------------------------------------------

Because `currentPassword` is required, attackers may attempt many passwords. Protect the endpoint with layered defenses:

- IP-based rate limiting (e.g., 100 requests per 10 minutes)
- User-account rate limiting (e.g., 5 failed current password attempts within 15 minutes => temporary lockout)
- Exponential backoff for repeated failures
- CAPTCHA for large numbers of failures (optional)
- Notify users via email of suspicious activity after multiple failed attempts

Rate limiting example using `express-rate-limit`:

```js
const rateLimit = require('express-rate-limit');

const changePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  keyGenerator: (req) => req.user ? `user:${req.user.id}` : req.ip,
  handler: (req, res) => res.status(429).json({ error: 'Too many requests' })
});
```

9. Frontend UX and implementation (React examples)
-------------------------------------------------

Goals:

- Provide clear inputs for current password, new password, and confirm new password.
- Give inline strength feedback for the new password using `zxcvbn`.
- Display clear, non-revealing error messages.
- Ensure forms are accessible to keyboard and screen reader users.

Example React component (concise):

```jsx
import React, { useState } from 'react';
import zxcvbn from 'zxcvbn';

export default function ChangePasswordForm() {
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const [feedback, setFeedback] = useState(null);

  const onChangeNew = (v) => {
    setNew(v);
    const score = zxcvbn(v);
    setFeedback(score);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPassword !== confirm) return alert('Passwords do not match');
    const res = await fetch('/api/users/change-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    if (res.ok) alert('Password changed');
    else { const data = await res.json(); alert(data.error || 'Failed'); }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Change password">
      <label>Current password<input type="password" value={currentPassword} onChange={e => setCurrent(e.target.value)} required /></label>
      <label>New password<input type="password" value={newPassword} onChange={e => onChangeNew(e.target.value)} required aria-describedby="pw-strength"/></label>
      <div id="pw-strength">Strength: {feedback ? feedback.score : '—'}</div>
      <label>Confirm password<input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required /></label>
      <button type="submit">Change password</button>
    </form>
  );
}
```

10. Client-side validation & accessibility
-----------------------------------------

Client-side checks (for user experience only — must be repeated server-side):

- Ensure `newPassword` and `confirm` match
- Provide password strength meter and suggestions
- Prevent submission if the `newPassword` fails minimal checks
- Use `aria-live` regions to announce validation errors for screen readers
- Ensure label associations and visible focus states

Accessibility considerations:

- Use clear error messages, not color alone, to show issues
- Ensure high-contrast and readable font sizes for the strength meter
- Support keyboard-only operation
- Do not auto-focus the password field if it causes confusion for screen reader users

11. Session management and token rotation
---------------------------------------

Decide on post-change session policy:

- Option A (recommended): Invalidate all existing sessions and require re-login everywhere. This reduces risk if account was compromised.
- Option B: Keep current session but invalidate other sessions.
- Option C: Keep all sessions but force re-auth for sensitive actions.

If tokens are stateless JWTs, implement token revocation by maintaining a `tokenVersion` in the user record that increments on password change; JWTs carry the version and server rejects mismatched versions.

Example: increment `token_version` column on password change. When validating a JWT, compare `payload.tokenVersion` to DB `token_version`.

12. Audit logging and monitoring
------------------------------

Log events for:

- Successful password change: user id, timestamp, ip, user-agent, whether sessions were invalidated.
- Failed attempts: user id or ip, timestamp, reason (incorrect password), increment failed counter.

Do NOT log sensitive fields such as `currentPassword` or `newPassword`.

Monitoring:

- Create dashboards for password-change rates and failed attempts per hour.
- Alert on spikes in failed attempts or rate-limit triggers.
- Track geographic anomalies (many failures from single IP block or country).

13. Testing matrix (unit, integration, e2e)
---------------------------------------

Unit tests

- Validate that `verifyPassword` correctly compares hashes.
- Validate `checkPasswordStrength` behaviour for weak and strong inputs.
- Validate `isPasswordInHistory` rejects reused passwords.

Integration tests

- Happy path: valid current password, strong new password => 200.
- Wrong current password => 401 and failed attempt increment.
- Weak new password => 400.
- Reused password => 400.
- logoutAllSessions true => other sessions invalidated.

E2E tests

- Simulate user filling the UI and verifying success flow.
- Test accessibility tree for form elements.

Edge cases

- Extremely long passwords (limit length server-side, e.g., 256 chars)
- Unicode and special characters in passwords — ensure hashing and comparisons handle them correctly.

Sample unit test (Jest):

```js
test('change password happy path', async () => {
  const user = await createTestUser({ password: 'OldP@ss' });
  const token = await loginTestUser(user);
  const res = await request(app).put('/api/users/change-password').set('Authorization', `Bearer ${token}`).send({ currentPassword: 'OldP@ss', newPassword: 'NewP@ssw0rd!' });
  expect(res.status).toBe(200);
});
```

14. Load and performance considerations
-------------------------------------

Password hashing is intentionally CPU/memory heavy. Under load, consider:

- Offloading password hashing to a background worker or dedicated service
- Using a job queue for compute-heavy hash work
- Throttling change-password requests per user and globally

Benchmarking notes:

- Measure hash latency at chosen parameters and scale concurrency accordingly.
- If Argon2 memoryCost is high, ensure machines have enough RAM for parallel jobs.

15. Deployment and migration plan
--------------------------------

If introducing new password policy or hashing algorithm:

1. Deploy server code that supports both old and new hash verification (e.g., detect hash format).
2. On successful login or password change, re-hash passwords into the new algorithm.
3. Monitor for failures and roll back if necessary.

Example migration steps:

- Add `hash_algorithm` column to `users` table.
- Update login & password-change endpoints to handle both algorithms.
- Run a background job to rehash accounts as they log in.

16. Rollback strategy
---------------------

If a deployment causes issues (e.g., too slow hashing):

- Revert code to prior release quickly.
- If DB schema changed, provide backward-compatible migrations or run reversible migrations.
- Communicate to stakeholders and run incident postmortem.

17. Security checklist
---------------------

- [ ] TLS enforced for all endpoints
- [ ] Rate limiting applied
- [ ] Adaptive hashing algorithm in use
- [ ] Password breach list checked
- [ ] Password history enforced
- [ ] Audit logging in place
- [ ] Session/token invalidation strategy defined
- [ ] Unit, integration, and E2E tests created
- [ ] Monitoring and alerts configured

18. Localization and copy
------------------------

Use friendly, neutral copy that avoids revealing sensitive details. Examples:

- Success: "Your password was changed successfully. If you did not request this, please contact support."
- Incorrect current password: "Unable to change password. Please check your current password and try again." (do not state "current password incorrect" in contexts where leaking info is a concern)

Keep messages short for mobile screens and allow translations. Include `error.code` in responses for programmatic handling, separate from user-facing messages.

19. Troubleshooting & FAQ
-------------------------

Q: I changed my password but still see other sessions logged in.

A: If `logoutAllSessions` was not requested, some systems retain other sessions. Use the "Log out everywhere" option in profile or set `logoutAllSessions=true` when calling the API.

Q: My password change fails with rate limit errors.

A: Wait for the rate limit window to expire or contact support. If this happens frequently, consider whitelisting trusted IP ranges for CI or automation.

Q: I get unexpected encoding or unicode errors.

A: Ensure the client sends UTF-8 and the server handles UTF-8 consistently. Limit max password length server-side.

20. Appendix: sample scripts and curl examples
-------------------------------------------

Full curl example with token:

```bash
curl -X PUT "https://api.example.com/api/users/change-password" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"OldP@ssw0rd","newPassword":"N3w$tr0ngP@ssw0rd","logoutAllSessions":true}'
```

Example Node script calling endpoint:

```js
const fetch = require('node-fetch');

async function changePassword(token, current, next) {
  const res = await fetch('https://api.example.com/api/users/change-password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ currentPassword: current, newPassword: next, logoutAllSessions: true })
  });
  return res.json();
}
```

21. Sample database migration for password history
-------------------------------------------------

ALTER TABLE users ADD COLUMN password_changed_at TIMESTAMP WITH TIME ZONE;
CREATE TABLE password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

22. Example monitoring queries (Prometheus / Grafana)
---------------------------------------------------

Metric: `app_password_change_attempts_total` (labels: status=success|failure, reason)

Alert rule (example):

ALERT HighFailedPasswordChanges
IF increase(app_password_change_attempts_total{status="failure"}[5m]) > 100
FOR 10m
LABELS { severity = "critical" }
ANNOTATIONS { summary = "Spike in failed password change attempts" }

23. UX copy guidelines
----------------------

- Buttons: "Change password", "Save", "Cancel"
- Place a short help text under new password: "At least 12 characters. Use a mix of letters, numbers, and symbols." 
- Provide a link to the password manager help: "Use a password manager"

24. Internationalization
------------------------

Provide translation keys for all messages. Example keys:

- `password.change.success`
- `password.change.error.invalid_current`
- `password.change.error.weak`
- `password.change.form.current_label`

25. Regulatory and compliance notes
---------------------------------

- For regulated industries, consider additional constraints (e.g., minimum entropy, regular rotation enforcement).
- Ensure audit logs are retained per your compliance retention schedule.

26. Example of token revocation using token version
-------------------------------------------------

1. Add `token_version` integer column to users table (default 0)
2. When issuing a JWT, include `tokenVersion` claim
3. On password change, increment `token_version`
4. On each request, validate token's `tokenVersion` matches DB

27. Password history policy
--------------------------

- Keep the last N passwords (commonly 5) hashed and compare on change.
- Optionally rotate and purge older history entries after a retention window.

28. Example: comparing new password against history
--------------------------------------------------

```js
async function isPasswordInHistory(userId, plaintext) {
  const rows = await db.password_history.find({ user_id: userId }).limit(5).orderBy('created_at', 'desc');
  for (const r of rows) {
    if (await verifyPassword(plaintext, r.password_hash)) return true;
  }
  return false;
}
```

29. CI/CD and testing automation
--------------------------------

- Add integration tests for change-password endpoint to CI pipeline.
- Run static analysis and security linters on the code handling passwords.

30. Example environments and configuration
----------------------------------------

Configuration keys (example):

- `PASSWORD_MIN_LENGTH=12`
- `PASSWORD_HISTORY_COUNT=5`
- `HASH_ALGORITHM=argon2id`
- `ARGON2_MEMORY=65536`
- `ARGON2_TIME=3`

31. Rollout plan for stricter password policies
----------------------------------------------

1. Announce upcoming stronger policies to users.
2. Deploy backend that accepts both old and new formats.
3. Gradually enforce for users on password change or next login.
4. Provide a migration window for enterprise users.

32. Developer notes: safe logging practices
-----------------------------------------

- Use structured logging (JSON) and ensure `password` fields are never included.
- Use redaction libraries or middleware to automatically remove sensitive fields from logs.

33. Sample redaction middleware (Express)
---------------------------------------

```js
function redactPasswords(req, res, next) {
  if (req.body && req.body.currentPassword) req.body.currentPassword = '[REDACTED]';
  if (req.body && req.body.newPassword) req.body.newPassword = '[REDACTED]';
  next();
}
app.use(redactPasswords);
```

34. Privacy considerations
-------------------------

- Do not use password change events as a vector to fingerprint users or leak PII.
- Keep audit logs minimal and encrypted at rest where required.

35. Backwards compatibility
---------------------------

If older clients expect different responses, maintain backward-compatible shapes and add versioning headers or accept a request parameter to indicate new behaviour.

36. Sample changelog entry
--------------------------

- Added comprehensive `CHANGE_PASSWORD` documentation and guidance (2026-01-10)

37. FAQ (extended)
------------------

Q: Can I set a password shorter than 12 characters?

A: Server policy may allow 8 characters for legacy accounts, but new passwords should be 12+ for security.

Q: Will changing my password delete my account data?

A: No. Changing password only modifies authentication state.

Q: How can admins help users who cannot change passwords?

A: Admins may use password reset flows (not change-password), or assist via support and identity verification.

38. Glossary
-----------

- Adaptive hashing: hashing algorithms whose work factor can be adjusted (e.g., bcrypt, Argon2).
- Password history: stored previous password hashes to prevent reuse.
- Token revocation: process of marking tokens invalid before their natural expiry.

39. References
--------------

- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- Argon2 paper and recommendations
- zxcvbn: https://github.com/dropbox/zxcvbn

40. Contact & ownership
-----------------------

Maintainers: Security and Auth teams

If you find issues or propose improvements, open a PR or contact the on-call security engineer.

---

End of document.

