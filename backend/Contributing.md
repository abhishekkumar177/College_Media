<<<<<<< HEAD
# Contributing Guidelines

Thank you for your interest in contributing to this project.  
This document defines **how to contribute**, **how the backend is structured**, and **the standards that must be followed** to keep the codebase clean, scalable, and maintainable.

Please read this document **fully before making any changes**.

---

## Table of Contents

- Purpose of This Document  
- Contribution Philosophy  
- Getting Started  
- Project Structure (Backend)  
- Architecture Rules (Mandatory)  
- Async Handling & Error Management  
- File Uploads (ImageKit)  
- Environment Setup  
- Development Workflow  
- Pull Request Guidelines  
- What NOT to Do  
- Review & Acceptance Criteria  
- Communication & Support  

---

## Purpose of This Document

The goal of this guide is to ensure that:

- All contributors follow **consistent architectural patterns**
- The backend remains **easy to debug and maintain**
- Changes are **reviewable and incremental**
- No unapproved or breaking changes are introduced

This project follows a **discussion-first, implementation-later** approach.

---

## Contribution Philosophy

- **Discuss before building**
- **Small, focused changes**
- **Clarity over cleverness**
- **Consistency over personal preference**
- **Architecture decisions > quick fixes**

If you are unsure about anything, **open an issue first**.

---

## Getting Started

### 1. Fork and clone the repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Install dependencies
```
npm install
```

### 3. Create a feature branch
```
git checkout -b feature/short-description
```

## Project Structure (Backend)

All backend code follows a strict separation of concerns.

## Project Structure

```text
src/
├── app.js                 # Express app configuration
├── server.js              # Server bootstrap
│
├── routes/                # Route definitions only
├── controllers/           # Request handlers (business logic)
├── models/                # Database schemas/models
├── middlewares/           # Auth, validation, error handling
├── utils/                 # Shared helpers & utilities
├── config/                # DB, env, third-party configs
└── constants/             # App-wide constants

```


## Architecture Rules (MANDATORY)
### Routes

- Must only define endpoints
- Must not contain business logic
- Must delegate to controllers

### Controllers

- Contain request/response logic
- Call services or utilities
- Must be wrapped with async handler

### Models

- Only schema and database definitions
- No Express or request logic

### Utils

- Pure reusable helpers
- No direct dependency on Express

## Async Handling & Error Management
### Async Handler (Required)
All async controllers must be wrapped using a centralized async handler.
```
export const asyncHandler = (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
```

This prevents repetitive try/catch blocks and ensures errors propagate correctly.

### Global Error Handler (Required)

All errors must be handled by a single global error middleware.
```
export const errorHandler = (err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
```

Controllers should throw errors, not handle them directly.

## File Uploads (ImageKit)

We use ImageKit for file and image uploads.
Why ImageKit?
- Generous free-tier storage
- CDN-backed delivery
- Reliable and fast
- Works well with our backend architecture

Rules
- Upload logic must live in utils/
- Controllers may only call helper functions
- Store both url and fileId in the database
- Never expose private keys to the client
- No direct SDK usage inside routes.

## Environment Setup
.env.example
```
PORT=5000
MONGO_URI=
JWT_SECRET=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
```
=======
# CONTRIBUTING TO COLLEGE MEDIA 🎓 - CONTAIN LISTED BELOW !!
Thank you for your interest in contributing! To maintain code quality and project integrity, please follow these guidelines.

## 🛠️ DEVELOPMENT STANDARDS
Framework: Built using React 19.

Styling: Use Tailwind CSS for all new components.

Naming Conventions:

PascalCase for React components (e.g., PostCard.jsx).

camelCase for variables and functions.

Linting: You must run npm run lint and fix all warnings before committing.

## 🚦 WORKFLOW

Fork & Clone: Fork the repository and clone it to your local machine.

Branching: Create a descriptive feature branch: git checkout -b feature/your-feature-name.

Environment: Copy .env.example to .env before starting development.

Pull Request: Submit your PR against the main branch using the required PR template.

## 📝 COMMIT MESSAGES

We follow the type(scope): subject format:

feat: A new feature

fix: A bug fix

docs: Documentation changes

refactor: Code changes that neither fix a bug nor add a feature

## 🚫 COMMUNITY GUIDELINES & MORALE

No Negative Comments: Comments on assigned issues that decrease morale or discourage other contributors are strictly prohibited.
Respect Assignment: Wait for an issue to be officially assigned to you before starting work or submitting a PR. Unsolicited PRs for unassigned issues will be closed.

## 📸 VISUAL REQUIREMENTS (MANDATORY)

Screenshots of Changes: You MUST provide screenshots or GIFs of the new changes in your PR.
Screenshots of the Area to be Changed: You MUST provide screenshots of the current state when opening an Issue.

# ⏱️ TIME CONSTRAINTS & DISQUALIFICATION

Assignment Window: Once assigned, work must begin immediately.

Max Limit: Contributors can ask for Maximum 3 Issues in a day, More only if the assigned Ones are done

Standard Deadline: Tasks should ideally be completed within 30 minutes to 48 hours.

Maximum Grace Period: If no progress is shown after 72 hours, the issue will be unassigned and given to another contributor.

Code Quality Disqualification: Submitting a PR that fails the build, ignores linting rules, or lacks the mandatory screenshots will result in immediate disqualification from the issue.

Duplicate Submissions: Submitting a PR for an issue already assigned to someone else is grounds for a warning or ban from the project.

Stale PRs: If a contributor fails to respond to requested changes within 24 hours, the PR may be closed.
>>>>>>> fc608099e44b486cca7b2391a3a7076acb5671e3
