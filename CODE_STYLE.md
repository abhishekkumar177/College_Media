# Code Style & Naming Conventions

This document outlines the coding standards and naming conventions for the College Media MERN stack project. Consistent code style improves readability, maintainability, and collaboration.

## Table of Contents

- [General Principles](#general-principles)
- [JavaScript/Node.js](#javascriptnodejs)
- [React/Frontend](#reactfrontend)
- [CSS/Styling](#cssstyling)
- [Backend/Node.js](#backendnodejs)
- [Database/Models](#databasemodels)
- [File Naming](#file-naming)
- [Tools & Enforcement](#tools--enforcement)

## General Principles

- **Consistency**: Follow these conventions consistently across the entire codebase.
- **Readability**: Code should be self-documenting. Use clear, descriptive names.
- **Simplicity**: Keep code simple and avoid unnecessary complexity.
- **DRY (Don't Repeat Yourself)**: Avoid code duplication.
- **Comments**: Use comments for complex logic, not obvious code.

## JavaScript/Node.js

### Naming Conventions

- **Variables**: Use `camelCase` for variables and function parameters.
  ```javascript
  const userId = req.userId;
  const existingUser = await User.findOne({ email });
  ```

- **Functions**: Use `camelCase` for function names.
  ```javascript
  function authenticateUser() {}
  const getPosts = async () => {};
  ```

- **Constants**: Use `UPPER_CASE` with underscores for constants.
  ```javascript
  const JWT_SECRET = process.env.JWT_SECRET;
  const PORT = process.env.PORT || 5000;
  ```

- **Classes/Models**: Use `PascalCase` for constructor functions and classes.
  ```javascript
  class UserService {}
  function User() {}
  ```

### Formatting Rules

- **Indentation**: Use 2 spaces for indentation (no tabs).
- **Semicolons**: Always use semicolons.
- **Quotes**: Use single quotes for strings, double quotes for JSX attributes.
- **Braces**: Use same-line braces for functions and control structures.
  ```javascript
  function example() {
    if (condition) {
      // code
    }
  }
  ```

- **Line Length**: Limit lines to 100 characters.
- **Spacing**: Use spaces around operators and after commas.
  ```javascript
  const result = a + b;
  const array = [1, 2, 3];
  ```

## React/Frontend

### Component Naming

- **Component Files**: Use `PascalCase` for component file names.
  ```
  Hero.jsx
  UserProfile.jsx
  LoginForm.jsx
  ```

- **Component Functions**: Use `PascalCase` for component function names.
  ```jsx
  export default function Hero() {
    return <div>...</div>;
  }
  ```

- **Hooks**: Prefix custom hooks with `use`.
  ```javascript
  function useAuth() {}
  function usePosts() {}
  ```

### JSX Conventions

- **Props**: Use `camelCase` for prop names.
  ```jsx
  <Button variant="primary" onClick={handleClick} />
  ```

- **Event Handlers**: Prefix with `handle` or `on`.
  ```javascript
  const handleSubmit = () => {};
  const onUserLogin = () => {};
  ```

- **Conditional Rendering**: Use ternary operators or logical AND for simple conditions.
  ```jsx
  {isLoading ? <Spinner /> : <Content />}
  {user && <UserProfile user={user} />}
  ```

### State and Variables

- **State Variables**: Use descriptive names with `useState`.
  ```javascript
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  ```

## CSS/Styling

### Class Naming

- **CSS Classes**: Use `kebab-case` for CSS class names.
  ```css
  .hero-section {}
  .btn-primary {}
  .user-profile {}
  ```

- **BEM Methodology**: Consider using BEM (Block Element Modifier) for complex components.
  ```css
  .card {}
  .card__title {}
  .card__content {}
  .card--featured {}
  ```

### CSS Variables

- **Custom Properties**: Use `kebab-case` for CSS custom properties.
  ```css
  :root {
    --primary-color: #6b46c1;
    --secondary-color: #d946ef;
  }
  ```

### Tailwind CSS

- **Utility Classes**: Use Tailwind's utility-first approach.
- **Custom Classes**: For complex styles, create custom classes in CSS files.
- **Responsive Design**: Use Tailwind's responsive prefixes (sm:, md:, lg:).

## Backend/Node.js

### API Routes

- **Route Files**: Use `camelCase` or `kebab-case` for route file names.
  ```
  auth.js
  user-posts.js
  ```

- **Route Paths**: Use `kebab-case` for API endpoints.
  ```
  /api/auth/login
  /api/posts
  /api/user/profile
  ```

### Middleware

- **Middleware Functions**: Use `camelCase` with descriptive names.
  ```javascript
  const authenticateToken = (req, res, next) => {};
  const validateUserInput = (req, res, next) => {};
  ```

### Error Handling

- **Error Messages**: Use clear, user-friendly error messages.
- **HTTP Status Codes**: Use appropriate status codes (400 for bad request, 401 for unauthorized, etc.).

## Database/Models

### Model Naming

- **Model Files**: Use `PascalCase` for model file names.
  ```
  User.js
  Post.js
  Comment.js
  ```

- **Schema Fields**: Use `camelCase` for field names.
  ```javascript
  const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    emailAddress: String,
  });
  ```

- **References**: Use singular form for references.
  ```javascript
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ```

### Database Naming

- **Collections**: MongoDB collections are automatically pluralized from model names.
- **Indexes**: Use descriptive names for compound indexes.

## File Naming

### General Rules

- **Directories**: Use `camelCase` or `kebab-case` for directory names.
  ```
  src/components
  backend/routes
  frontend/assets
  ```

- **Configuration Files**: Use standard naming conventions.
  ```
  package.json
  eslint.config.js
  tailwind.config.js
  vite.config.js
  ```

### File Extensions

- **JavaScript**: `.js` for Node.js, `.jsx` for React components.
- **CSS**: `.css` for stylesheets.
- **Markdown**: `.md` for documentation.

## Tools & Enforcement

### ESLint

- **Configuration**: ESLint is configured in `frontend/eslint.config.js`.
- **Rules**: Key rules include:
  - `no-unused-vars`: Error on unused variables (with exceptions for uppercase constants).
  - React hooks rules for proper hook usage.
  - Recommended JavaScript rules.

- **Running Linter**: Use `npm run lint` in the frontend directory.

### Prettier (Recommended)

While not currently configured, consider adding Prettier for consistent formatting:

1. Install Prettier: `npm install --save-dev prettier`
2. Create `.prettierrc` with formatting rules.
3. Add format script to `package.json`.

### VS Code Extensions

- **Recommended Extensions**:
  - ESLint
  - Prettier (if added)
  - Auto Rename Tag
  - Bracket Pair Colorizer

### Pre-commit Hooks

Consider using Husky and lint-staged for pre-commit checks:

```bash
npm install --save-dev husky lint-staged
npx husky install
```

## Best Practices for MERN Stack

### Frontend-Backend Communication

- **API Calls**: Use descriptive function names for API calls.
  ```javascript
  const fetchUserPosts = async (userId) => {};
  const createNewPost = async (postData) => {};
  ```

### State Management

- **Global State**: Use clear naming for state slices.
- **Actions**: Prefix action types with feature names.
  ```javascript
  const POSTS_LOADING = 'posts/loading';
  const POSTS_LOAD_SUCCESS = 'posts/loadSuccess';
  ```

### Security

- **Environment Variables**: Always use environment variables for sensitive data.
- **Input Validation**: Validate all user inputs on both frontend and backend.

### Performance

- **Code Splitting**: Use dynamic imports for route-based code splitting in React.
- **Image Optimization**: Optimize images and use appropriate formats.

## Enforcement

- **Code Reviews**: All code changes must pass review against these standards.
- **CI/CD**: Integrate linting and formatting checks in CI pipeline.
- **Documentation**: Update this document as conventions evolve.

## Exceptions

- **Third-party Code**: Follow the conventions of third-party libraries when integrating.
- **Legacy Code**: Gradually refactor legacy code to match these standards.
- **Performance**: In rare cases, standards may be bent for performance reasons (document exceptions).

---

This document should be reviewed and updated regularly to reflect the evolving needs of the project. For questions or clarifications, discuss with the development team.
