# Contributing to College Media

Thank you for your interest in contributing to College Media! This document provides guidelines and information for contributors. Following these guidelines helps ensure a smooth collaboration and maintains code quality.

## Table of Contents

- [Contributing to College Media](#contributing-to-college-media)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Development Setup](#development-setup)
  - [Development Workflow](#development-workflow)
  - [ECWoC’26 Contribution Guidelines](#ecwoc26-contribution-guidelines)
  - [Branch Naming Conventions](#branch-naming-conventions)
    - [Branch Types](#branch-types)
    - [Examples](#examples)
  - [Commit Message Conventions](#commit-message-conventions)
    - [Commit Types](#commit-types)
    - [Scope (Optional)](#scope-optional)
    - [Examples](#examples-1)
    - [Guidelines](#guidelines)
  - [Pull Request Process](#pull-request-process)
    - [Creating a Pull Request](#creating-a-pull-request)
    - [PR Template](#pr-template)
    - [Review Process](#review-process)
    - [Review Guidelines](#review-guidelines)
  - [Code Style Guidelines](#code-style-guidelines)
    - [Linting](#linting)
  - [Testing](#testing)
    - [Frontend Testing](#frontend-testing)
    - [Backend Testing](#backend-testing)
    - [Manual Testing Checklist](#manual-testing-checklist)
  - [Reporting Issues](#reporting-issues)
    - [Bug Reports](#bug-reports)
    - [Feature Requests](#feature-requests)
  - [Code of Conduct](#code-of-conduct)

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git
- A GitHub account

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/College_Media.git
   cd College_Media
   ```
3. **Set up upstream remote**:
   ```bash
   git remote add upstream https://github.com/Ewocs/College_Media.git
   ```
4. **Install dependencies**:
   ```bash
   # Backend dependencies
   cd backend
   npm install

   # Frontend dependencies
   cd ../frontend
   npm install

   # Return to root
   cd ..
   ```
5. **Set up environment variables**:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```
6. **Start the development servers**:
   ```bash
   # Terminal 1: Start backend
   cd backend
   npm run dev

   # Terminal 2: Start frontend
   cd frontend
   npm run dev
   ```

## Development Workflow

1. **Choose an issue** from the [GitHub Issues](https://github.com/Ewocs/College_Media/issues) or create one
2. **Create a feature branch** from `main`
3. **Make your changes** following the code style guidelines
4. **Test your changes** thoroughly
5. **Commit your changes** with descriptive messages
6. **Push your branch** and create a pull request
7. **Address review feedback** and make necessary changes
8. **Merge** once approved

 ## ECWoC’26 Contribution Guidelines
1.  **Issue labeling**: Use `enhancement`, `bug`, `documentation`, or `feature-request`.
2.  **PR submission**: Reference the issue number in your PR.
3.  **Review deadlines**: Ensure PRs are submitted at least 24 hours before the milestone deadline.
4.  **Code quality**: Maintain all code style, linting, and testing requirements.
5.  **Acknowledgment**: All accepted contributions will be credited in the project README and event dashboard.


## Branch Naming Conventions

Use descriptive, lowercase branch names with hyphens. Follow this pattern:

```
<type>/<description>
```

### Branch Types

- `feature/` - New features or enhancements
- `bugfix/` - Bug fixes
- `hotfix/` - Critical fixes for production
- `docs/` - Documentation updates
- `refactor/` - Code refactoring without changing functionality
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks, dependencies, etc.

### Examples

```
feature/user-authentication
bugfix/login-validation
docs/api-documentation
refactor/user-service
test/auth-middleware
chore/update-dependencies
```

## Commit Message Conventions

Write clear, descriptive commit messages that explain what was changed and why. Follow this format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Commit Types

- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

### Scope (Optional)

Specify the part of the codebase affected:
- `frontend`, `backend`
- Component or file names
- `auth`, `posts`, `chatbot`

### Examples

```
feat(auth): add JWT token refresh functionality

fix(frontend): resolve login form validation error

docs: update API documentation for posts endpoint

refactor(backend): simplify user authentication middleware

test: add unit tests for post service

chore: update Node.js dependencies
```

### Guidelines

- Use present tense ("add" not "added")
- Keep the subject line under 50 characters
- Use the body for detailed explanations if needed
- Reference issue numbers when applicable: `fix: resolve login issue #123`

## Pull Request Process

### Creating a Pull Request

1. **Ensure your branch is up to date**:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Push your branch** to your fork:
   ```bash
   git push origin your-branch
   ```

3. **Create a PR** on GitHub:
   - Use a descriptive title
   - Fill out the PR template
   - Link related issues
   - Add screenshots for UI changes

### PR Template

```
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Code refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] All tests pass

## Screenshots (if applicable)
Add screenshots of UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Commit messages are descriptive
- [ ] Documentation updated if needed
- [ ] Tests added for new functionality
```

### Review Process

1. **Automated Checks**: Ensure all CI checks pass
2. **Code Review**: At least one maintainer review is required
3. **Testing**: Reviewers may request additional tests
4. **Approval**: PR is merged once approved and all checks pass

### Review Guidelines

**For Reviewers:**
- Check code quality and adherence to style guidelines
- Verify tests are adequate
- Test the functionality manually
- Suggest improvements constructively
- Approve when requirements are met

**For Contributors:**
- Address all review comments
- Make requested changes
- Keep the PR updated with main branch
- Be responsive to feedback

## Code Style Guidelines

Follow the established code style defined in [CODE_STYLE.md](./CODE_STYLE.md). Key points:

- Use 2 spaces for indentation
- Follow naming conventions (camelCase, PascalCase, UPPER_CASE)
- Limit lines to 100 characters
- Use semicolons consistently
- Follow React and Node.js best practices

### Linting

Run linters before committing:

```bash
# Frontend
cd frontend
npm run lint

# Backend
cd backend
npm run lint
```

## Testing

### Frontend Testing

```bash
cd frontend
npm run test
```

### Backend Testing

```bash
cd backend
npm run test
```

### Manual Testing Checklist

- [ ] User registration and login work
- [ ] Post creation, viewing, and interaction work
- [ ] Chatbot responds appropriately
- [ ] Responsive design works on mobile/desktop
- [ ] No console errors in browser
- [ ] API endpoints return correct responses

## Reporting Issues

### Bug Reports

Use the bug report template and include:

- Clear title describing the issue
- Steps to reproduce
- Expected vs. actual behavior
- Browser/OS information
- Screenshots if applicable
- Console errors/logs

### Feature Requests

Use the feature request template and include:

- Clear description of the proposed feature
- Use case and benefits
- Mockups or examples if applicable
- Implementation suggestions

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy towards other contributors
- Help create a positive community

---

Thank you for contributing to College Media! Your efforts help make this platform better for college students everywhere. 🚀