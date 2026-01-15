# Contributing to College Media 🎓

Thank you for your interest in contributing to College Media! We welcome contributions from developers of all skill levels. This document provides comprehensive guidelines to ensure smooth collaboration and maintain high code quality.

## Table of Contents

- [Development Workflow](#development-workflow)
- [Development Setup](#development-setup)
- [Git Workflow and Branching Strategy](#git-workflow-and-branching-strategy)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation Standards](#documentation-standards)
- [Code Review Process](#code-review-process)
- [Issue and PR Templates](#issue-and-pr-templates)
- [Community Guidelines](#community-guidelines)
- [Time Constraints](#time-constraints)

## Development Workflow

### 1. Choose an Issue

- Browse [open issues](https://github.com/Ewocs/College_Media/issues) for tasks
- Comment on the issue to express interest
- Wait for official assignment from maintainers
- Respect the assignment system - do not start work on unassigned issues

### 2. Set Up Development Environment

```bash
# Clone the repository
git clone https://github.com/Ewocs/College_Media.git
cd College_Media

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development servers
npm run dev          # Frontend
npm run server       # Backend
```

### 3. Create Feature Branch

```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description

# Or for documentation
git checkout -b docs/feature-description
```

### 4. Implement Changes

- Write clean, well-documented code
- Follow the established code standards
- Run tests and linting before committing
- Test your changes thoroughly

### 5. Submit Pull Request

- Push your branch to GitHub
- Create a PR against the `main` branch
- Fill out the PR template completely
- Include screenshots/GIFs of changes
- Request review from maintainers

## Development Setup

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: v2.30.0 or higher
- **MongoDB**: v6.0 or higher (for local development)
- **Redis**: v6.0 or higher (for caching)

### Environment Configuration

Create a `.env.local` file with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/college_media_dev

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# Email Service
RESEND_API_KEY=your-resend-api-key

# AWS Services
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name

# Redis
REDIS_URL=redis://localhost:6379

# Application
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
```

### Running the Application

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run tests
npm test

# Run linting
npm run lint
```

### Database Setup

```bash
# Start MongoDB (if using local instance)
mongod --dbpath /path/to/your/db

# Start Redis (if using local instance)
redis-server

# Seed database with initial data
npm run seed
```

## Git Workflow and Branching Strategy

### Branch Naming Convention

- **Features**: `feature/description-of-feature`
- **Bug Fixes**: `fix/description-of-bug`
- **Documentation**: `docs/description-of-docs`
- **Hotfixes**: `hotfix/critical-fix-description`

### Commit Message Format

We follow the conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add JWT token refresh functionality

fix(ui): resolve navbar overflow on mobile devices

docs(api): update authentication endpoint documentation

test(auth): add unit tests for password validation
```

### Git Workflow Steps

1. **Sync with main**:
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make commits**:
   ```bash
   git add .
   git commit -m "feat: implement user authentication"
   ```

4. **Push and create PR**:
   ```bash
   git push origin feature/your-feature
   ```

5. **Rebase if needed**:
   ```bash
   git rebase main
   git push --force-with-lease
   ```

## Code Standards

### JavaScript/React Standards

- **Framework**: React 19 with hooks
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer
- **HTTP Client**: Axios for API calls

### Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.jsx`)
- **Functions/Variables**: camelCase (e.g., `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Files**: kebab-case (e.g., `user-profile.jsx`)

### Code Quality

- **Linting**: ESLint with React and accessibility rules
- **Formatting**: Prettier for consistent code style
- **Imports**: Group imports (React, third-party, local)
- **Error Handling**: Try-catch blocks with proper error messages

### Backend Standards

- **Framework**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with refresh tokens
- **Validation**: Joi or express-validator
- **Security**: Helmet, CORS, rate limiting

## Testing Requirements

### Test Coverage

- **Unit Tests**: Minimum 80% coverage for utilities and hooks
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Critical user flows using Playwright
- **Component Tests**: React components using Vitest

### Testing Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test -- path/to/test/file.test.js
```

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── utils/         # Test utilities and mocks
```

### Testing Best Practices

- Write tests before implementing features (TDD)
- Use descriptive test names
- Mock external dependencies
- Test error scenarios
- Keep tests fast and reliable

## Documentation Standards

### Code Documentation

- **Functions**: JSDoc comments for complex functions
- **Components**: Prop types and usage examples
- **APIs**: OpenAPI/Swagger documentation
- **README**: Setup and usage instructions

### Documentation Files

- **README.md**: Project overview and setup
- **API_REFERENCE.md**: API endpoint documentation
- **ARCHITECTURE.md**: System architecture overview
- **TROUBLESHOOTING.md**: Common issues and solutions

### Documentation Updates

- Update documentation when making API changes
- Include code examples in documentation
- Keep screenshots up to date
- Document breaking changes clearly

## Code Review Process

### PR Requirements

- [ ] Code builds successfully
- [ ] All tests pass
- [ ] Linting passes with no errors
- [ ] Documentation updated if needed
- [ ] Screenshots/GIFs included for UI changes
- [ ] Commit messages follow conventional format
- [ ] Branch is up to date with main

### Review Checklist

**Code Quality:**
- [ ] Code follows established patterns
- [ ] No console.logs or debug statements
- [ ] Proper error handling
- [ ] Security best practices followed

**Functionality:**
- [ ] Requirements implemented correctly
- [ ] Edge cases handled
- [ ] No breaking changes
- [ ] Performance considerations addressed

**Testing:**
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] E2E tests updated if needed

### Review Process

1. **Automated Checks**: CI/CD runs tests and linting
2. **Peer Review**: At least one maintainer reviews code
3. **Approval**: PR approved and merged
4. **Deployment**: Changes deployed to staging/production

## Issue and PR Templates

### Issue Template

When creating issues, use the following format:

```markdown
## Description
Brief description of the issue

## Expected Behavior
What should happen

## Current Behavior
What currently happens

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Environment
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Node Version: [e.g., 18.0.0]

## Screenshots
Add screenshots of the issue

## Additional Context
Any other relevant information
```

### PR Template

When creating PRs, use the following format:

```markdown
## Description
Brief description of the changes

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots
Add screenshots/GIFs of the changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes

## Related Issues
Closes #123
```

## Community Guidelines

### Code of Conduct

- **Respect**: Treat all contributors with respect
- **Inclusivity**: Welcome contributors from all backgrounds
- **Collaboration**: Work together constructively
- **Quality**: Maintain high standards for code and communication

### Communication

- **GitHub Issues**: For bug reports and feature requests
- **Discussions**: For general questions and ideas
- **Pull Requests**: For code contributions
- **Discord/Slack**: For real-time communication (if available)

### Recognition

- Contributors are recognized in release notes
- Significant contributions may be highlighted
- Regular contributors may be invited to join the core team

## Time Constraints

### Assignment Window
Once assigned, work must begin immediately to show active engagement.

### Max Limit
Contributors can request a maximum of 3 issues per day. Additional issues only if currently assigned ones are completed.

### Standard Deadline
Tasks should ideally be completed within 30 minutes to 48 hours of assignment.

### Maximum Grace Period
If no progress is shown after 72 hours, the issue will be unassigned and made available to other contributors.

### Disqualification Criteria

**Code Quality Disqualification:**
- Submitting PRs that fail the build
- Ignoring linting rules
- Missing mandatory screenshots/GIFs

**Process Disqualification:**
- Submitting PRs for unassigned issues
- Duplicate submissions
- Failure to respond to review comments within 24 hours

### Reassignment Policy
Issues are reassigned if:
- No initial commit within 24 hours
- No progress updates for 72 hours
- Contributor becomes unresponsive

Thank you for contributing to College Media! Your efforts help make this platform better for the educational community. 🚀
