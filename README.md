<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=header&text=College%20Media&fontSize=90" width="100%"/>

<div align="center">

# 🎓 College Media

### A Modern Social Media Dashboard Platform

![Project Status](https://img.shields.io/badge/Status-Development-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646cff?style=for-the-badge&logo=vite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e?style=for-the-badge&logo=javascript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js)

**A stunning, fully-responsive social media dashboard built for college communities**

[Overview](#-overview) • [Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Contributing](#-contributing) • [Roadmap](#-future-roadmap)

</div>

---

<img src="https://github.com/Mayur-Pagote/README_Design_Kit/blob/730d340c8008758ac291ebc555f818f851feda0f/Assets/RGB%20Line%20Thick.gif" width="100%" />

## 📱 Overview

**College Media** is a cutting-edge frontend application designed specifically for college communities. It replicates the core user experience of popular social media platforms with a fresh, gradient-themed UI optimized for visual media sharing, real-time interactions, and seamless user engagement.

Whether you're sharing campus moments, connecting with classmates, or building your college network, College Media provides an intuitive and visually appealing platform for digital expression.

### ✨ Key Highlights

- 🎯 **Purpose-Built** for college communities and student networks
- ⚡ **Lightning Fast** performance with Vite optimization (instant HMR)
- 🎨 **Beautiful UI/UX** with modern design patterns and smooth animations
- 📱 **Fully Responsive** - works perfectly on desktop, tablet, and mobile
- 🔄 **Real-time Interactions** with instant feedback and engagement metrics
- 🌐 **Modern Frontend Stack** - React 19 with ES6+ standards
- ♿ **Accessibility First** - WCAG compliant components
- 🔐 **Developer Friendly** - Clean, well-documented codebase

---

## 🚀 Features

- ✅ **User Profiles** - Customizable student profiles with bio and profile pictures
- ✅ **Feed & Posts** - Create, edit, and share posts with rich text formatting
- ✅ **Likes & Comments** - Real-time engagement tracking and interactions
- ✅ **Notifications** - Instant alerts for likes, comments, and follows
- ✅ **Search Functionality** - Quickly find users and posts across the platform
- ✅ **Dark/Light Mode** - Eye-friendly theme options for different environments
- ✅ **Mobile Responsive** - Optimized layout for all device sizes
- ✅ **Social Sharing** - Share posts across platforms with one click
- ✅ **Activity Feed** - Track trending content and top contributors
- ✅ **Performance Optimized** - Fast loading with lazy loading and code splitting

---

## 📋 Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend Framework** | React 19 (Latest) |
| **Build Tool** | Vite 7 (Lightning fast) |
| **Language** | JavaScript ES6+ |
| **Styling** | CSS3 with Gradient Theme |
| **Code Quality** | ESLint 9 |
| **Version Control** | Git |
| **Runtime** | Node.js (v18+) |
| **Package Manager** | npm/yarn |

---

## 📦 Installation & Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **Git** (for version control)

### Step-by-Step Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/abhishekkumar177/College_Media.git
   cd College_Media
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup (Optional)**
   ```bash
   # Copy the environment example file
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration settings. See [Environment Variables](#-environment-variables) section below for detailed documentation.

4. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The application will be available at `http://localhost:5173`

5. **Build for Production**
   ```bash
   npm run build
   # or
   yarn build
   ```

6. **Preview Production Build**
   ```bash
   npm run preview
   # or
   yarn preview
   ```

7. **Run Linting & Code Quality Checks**
   ```bash
   npm run lint
   # or
   yarn lint
   ```
   
   To automatically fix linting errors:
   ```bash
   npm run lint -- --fix
   # or
   yarn lint --fix
   ```

---

## � Environment Variables

The application uses environment variables for configuration. Create a `.env.local` file in the project root by copying `.env.example`:

### Available Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_APP_NAME` | string | College Media | Application display name |
| `VITE_ENV` | string | development | Environment mode (development/production) |
| `VITE_API_BASE_URL` | string | http://localhost:3000/api | Backend API endpoint (for future use) |
| `VITE_ENABLE_MOCK_DATA` | boolean | true | Use mock data or fetch from API |
| `VITE_DEBUG_MODE` | boolean | false | Enable debug logging and errors |
| `VITE_LOG_LEVEL` | string | debug | Log verbosity (debug/info/warn/error) |
| `VITE_PORT` | number | 5173 | Development server port |

### Example .env.local

```env
VITE_ENV=development
VITE_ENABLE_MOCK_DATA=true
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

### Important Notes

- **Never commit `.env.local`** to git - it may contain sensitive information
- Only `.env.example` should be committed
- Environment variables must start with `VITE_` to be exposed to the client
- Variables are processed at build time, not runtime

---

## �📁 Project Structure
## 🔐 Environment Variables

The application uses environment variables for configuration. Create a `.env.local` file in the project root by copying `.env.example`:

### Available Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_APP_NAME` | string | College Media | Application display name |
| `VITE_ENV` | string | development | Environment mode (development/production) |
| `VITE_API_BASE_URL` | string | http://localhost:3000/api | Backend API endpoint (for future use) |
| `VITE_ENABLE_MOCK_DATA` | boolean | true | Use mock data or fetch from API |
| `VITE_DEBUG_MODE` | boolean | false | Enable debug logging and errors |
| `VITE_LOG_LEVEL` | string | debug | Log verbosity (debug/info/warn/error) |
| `VITE_PORT` | number | 5173 | Development server port |

### Example .env.local

```env
VITE_ENV=development
VITE_ENABLE_MOCK_DATA=true
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

### Important Notes

- **Never commit `.env.local`** to git - it may contain sensitive information
- Only `.env.example` should be committed
- Environment variables must start with `VITE_` to be exposed to the client
- Variables are processed at build time, not runtime

---

## �📁 Project Structure

```
College_Media/
├── public/                      # Static assets (favicon, etc)
├── src/
│   ├── components/             # Reusable React components
│   │   ├── BentoGrid.jsx        # Bento-style grid layout component
│   │   ├── Footer.jsx           # Application footer
│   │   ├── Hero.jsx             # Landing page hero section
│   │   ├── HomeCTA.jsx          # Call-to-action section on home page
│   │   ├── KeyHighlight.jsx     # Key highlights / features section
│   │   ├── LandingNavbar.jsx    # Navbar for landing page
│   │   ├── Layout.jsx           # Common layout wrapper
│   │   ├── LeftSidebar.jsx      # Left navigation sidebar
│   │   ├── Navbar.jsx           # Main application navbar
│   │   ├── ProfileMenu.jsx      # User profile dropdown/menu
│   │   ├── RightSidebar.jsx     # Right sidebar (suggestions / activity)
│   │   ├── SkeletonPost.jsx     # Loading skeleton for posts
│   │   └── StackSection.jsx     # Tech stack / stack showcase section
│   │   └── ...
│   ├── pages/                  # Page-level components
│   │   ├── Home.jsx            # Main home/feed page
│   │   ├── Landing.jsx         # Landing / welcome page
│   │   ├── Messages.jsx        # Messages / chat page
│   │   ├── Profile.jsx         # User profile page
│   │   └── Profile.css         # Profile page specific styles
│   ├── assets/                 # Images, icons, and media files
│   │   ├── react.svg
│   │   └── ...
│   ├── App.jsx                 # Main application component (state & layout)
│   ├── App.css                 # Global application styles and animations
│   ├── main.jsx                # React app entry point and DOM mounting
│   ├── index.css               # Base CSS reset and CSS variables
│   
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── BACKEND_PROPOSAL.md        # Proposed backend architecture and plans
├── CONTRIBUTING.md            # Contribution guidelines
├── eslint.config.js           # ESLint configuration
├── index.html                 # HTML entry point
├── LICENSE                    # MIT License file
├── package-lock.json          # Dependency lock file
├── package.json               # Project metadata and scripts
├── postcss.config.js          # PostCSS configuration
├── README.md                  # Project documentation
├── tailwind.config.js         # Tailwind CSS configuration
└── vite.config.js             # Vite build configuration


---

## 🎯 Getting Started for Developers
 with proper prefixes
   - Keep components small and focused
   - Add JSDoc comments to functions and components

3. **Test Locally**
   ```bash
   npm run dev
   ```
   - Test on multiple devices/screen sizes (desktop, tablet, mobile)
   - Check browser console for errors and warnings
   - Verify responsive design with DevTools device emulation
   - Test with environment variables if applicable

4. **Lint Your Code**
   ```bash
   npm run lint
   ```
   - Fix any linting errors before pushing
   - Maintain code quality standards
   - Use `npm run lint -- --fix` to auto-fix errors

5. **Build & Preview**
   ```bash
   npm run build
   npm run preview
   ```
   - Verify production build runs correctly
   - Test all features in production mode

6. **Push & Create Pull Request**
   ```bash
   git add .
   git commit -m "feat: Add feature description"
   git push origin feature/your-feature-name
   ```

### Code Style Guidelines

#### Naming Conventions
- **camelCase** for variables and functions: `const userName = "john"`
- **PascalCase** for React components: `function PostCard() {}`
- **UPPER_SNAKE_CASE** for constants: `const MAX_FILE_SIZE = 5242880`
- **kebab-case** for CSS classes: `className="post-card-header"`

#### JavaScript/JSX Best Practices
- Use **const** by default, **let** when reassignment is needed, avoid **var**
- Add **JSDoc comments** to all exported functions and components
- Keep functions small and single-purpose (< 50 lines ideally)
- Use arrow functions for callbacks
- Use destructuring for props and object properties
- Add meaningful comments for complex logic or non-obvious code
- Use template literals for string interpolation: `` `Hello ${name}` ``

#### React Best Practices
- One component per file
- Use functional components with hooks
- Keep state as local as possible
- Extract complex logic into custom hooks
- Use PropTypes or TypeScript for type safety (future enhancement)
- Memoize expensive computations with `useMemo`
- Use `useCallback` for stable function references

#### Example Component with Proper Comments

```jsx
/**
 * PostCard Component
 * 
 * Displays a single social media post with user info, media, caption,
 * and interaction buttons (like, comment, share).
 * 
 * @component
 * @param {Object} props - Component props
 * @param {number} props.postId - Unique post identifier
 * @param {Object} props.post - Post data object
 * @param {Object} props.post.user - User who created the post
 * @param {string} props.post.caption - Post caption/description
 * @param {string} props.post.media - URL to post image/video
 * @param {number} props.post.likes - Initial like count
 * @param {Function} props.onLike - Callback when post is liked
 * @returns {React.ReactElement} Rendered post card
 */
const PostCard = ({ postId, post, onLike }) => {
  const [isLiked, setIsLiked] = useState(false);

  // Handle like button click
  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(postId);
  };

  return (
    <div className="post-card">
      {/* Post content */}
    </div>
  );

Follow conventional commit standards for clear version history:

```
type(scope): subject

body

footer
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes (README, comments, etc.)
- `style` - Code style changes (formatting, semicolons, etc.)
- `refactor` - Code refactoring without feature changes
- `perf` - Performance improvements
- `test` - Test additions/modifications
- `chore` - Build, dependencies, or tooling changes

**Examples:**
```
feat(auth): Add user login functionality
fix(posts): Correct like button animation timing
docs(readme): Update environment setup instructions
refactor(components): Extract PostCard to separate file
```
- Use **const** by default, **let** when reassignment is needed
- Add meaningful comments for complex logic
- Keep functions small and single-purpose
- Use proper JSDoc comments for exported functions

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Types of Contributions
- 🐛 **Bug Reports** - Report issues and help us improve
- 💡 **Feature Requests** - Suggest new features and enhancements
- 📝 **Documentation** - Improve README and inline code documentation
- 🎨 **UI/UX Improvements** - Enhance design and user experience
- ♻️ **Code Refactoring** - Clean up and optimize existing code
- ✅ **Testing** - Write unit and integration tests

### Contribution Guidelines

1. **Fork the Repository**
   - Click the Fork button on GitHub
   - Clone your fork locally

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make Your Changes**
   - Keep commits atomic and focused
   - Write clear, descriptive commit messages
   - Test your changes thoroughly

4. **Commit Your Changes**
   ```bash
   git commit -m 'feat: Add AmazingFeature'
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/AmazingFeature
   ```

6. **Open a Pull Request**
   - Provide a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - Wait for code review and feedback

### Commit Message Format
```
type(scope): subject

body

footer
```

**Types:** feat, fix, docs, style, refactor, perf, test, chore

--- & Solutions

#### Port 5173 already in use
```bash
# Use a different port
npm run dev -- --port 3000

# Or kill the process using port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

#### Dependencies not installing
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Or use npm ci for exact dependency versions
npm ci
```

#### Linting errors prevent development
```bash
# Let ESLint fix automatically fixable issues
npm run lint -- --fix

# Check which files have linting errors
npm run lint
```

#### Build fails or slow performance
```bash
# Ensure you have the latest dependencies
npm update

# Clean build cache
rm -rf dist .vite

# Build again
npm run build
```

#### Environment variables not loading
- Verify `.env.local` exists in the project root
- Ensure variable names start with `VITE_`
- Restart the dev server after changing environment variables
- Check browser console for any variable-related errors

#### Hot Module Replacement (HMR) not working
```bash
# Restart the development server
npm run dev

# If still not working, hard refresh your browser (Ctrl+Shift+R on Windows)
```

#### Module not found errors
```bash
# Check if all dependencies are installed
npm install

# Verify import paths match actual file locations
# Windows uses backslashes but imports use forward slashes: ./src/components/Header

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Getting More Help

- Check existing [Issues](https://github.com/abhishekkumar177/College_Media/issues) page
- Create a new issue with:
  - Clear error message and stack trace
  - Steps to reproduce
  - Your environment (OS, Node version, npm version)
  - Screenshot if UI-related
- Join [Discussions](https://github.com/abhishekkumar177/College_Media/discussions) for questions
## 📈 Future Roadmap

### Phase 1 - Backend Integration (Q1 2026)

**Planned Backend Direction (Tentative):**
- **Backend Framework:** JavaScript-based backend (e.g., Node.js ecosystem)
- **API Architecture:** RESTful APIs (planned)
- **Database:** To be finalized (under evaluation)
- **Authentication:** Planned (JWT-based approach under consideration)
- **Hosting:** To be decided (cloud platforms such as Vercel / Render / Railway under evaluation)

> ⚠️ **Important:**  
> The backend technology stack is **not finalized**.  
> The above items describe the *intended direction only* and may change
> based on maintainer decisions and community discussion.

> 🛠️ **Contributor Guidelines (Backend Architecture):**  
> Contributors should not implement backend features, APIs, or database-specific
> logic without prior discussion and approval via GitHub Issues.

**Scope:**
- [ ] Backend API setup
- [ ] REST endpoint design
- [ ] Database schema & models
- [ ] Authentication & authorization

### Phase 2 - Core Features (Q2 2026)
- [ ] User Authentication & Authorization (JWT)
- [ ] Database Implementation (MongoDB/PostgreSQL)
- [ ] User registration and login
- [ ] Profile management system

### Phase 3 - Advanced Features (Q3 2026)
- [ ] Real-time Messaging System (WebSocket)
- [ ] Media Upload & Storage (S3/Cloud)
- [ ] File management and image optimization
- [ ] Advanced Filtering & Search (Elasticsearch)

### Phase 4 - Optimization & Enhancement (Q4 2026)
- [ ] Performance Optimization & Caching
- [ ] Progressive Web App (PWA) Functionality
- [ ] Offline support
- [ ] Unit & Integration Tests (Jest, React Testing Library)
- [ ] E2E Testing (Cypress/Playwright)

### Phase 5 - Scaling (2027+)
- [ ] Microservices Architecture
- [ ] GraphQL Integration
- [ ] Mobile App (React Native)
- [ ] Analytics & Monitoring

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

MIT License is a permissive open-source license that allows:
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ⚠️ Requires license and copyright notice

---

## 🛠️ Troubleshooting

### Common Issues

**Port 5173 already in use**
```bash
# Use a different port
npm run dev -- --port 3000
```

**Dependencies not installing**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Linting errors**
```bash
# Let ESLint fix automatically fixable issues
npm run lint -- --fix
```

**Build fails**
```bash
# Ensure you have the latest dependencies
npm update
npm run build
```

For more help, check the [Issues](https://github.com/abhishekkumar177/College_Media/issues) page or create a new issue.

---

## 💬 Connect with the Team

- **Maintainer:** [@janavipandole](https://github.com/janavipandole)
- **Original Creator:** [@abhishekkumar177](https://github.com/abhishekkumar177)
- **Report Issues:** [GitHub Issues](https://github.com/abhishekkumar177/College_Media/issues)
- **Discussions:** [GitHub Discussions](https://github.com/abhishekkumar177/College_Media/discussions)
- **Questions?** Feel free to open an issue or start a discussion

---

## 🌟 Support the Project

If you found this project helpful:

⭐ **Star** the repository - It helps other developers discover the project  
🍴 **Fork** it to contribute - We'd love your improvements  
📢 **Share** it with your college community - Spread the word!  
💬 **Provide Feedback** - Help us improve through suggestions  
🤝 **Contribute Code** - Submit PRs for features and fixes  

### Recognition

Special thanks to all [contributors](https://github.com/abhishekkumar177/College_Media/graphs/contributors) who have helped shape this project!

---

## 📄 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [JavaScript ES6+ Guide](https://github.com/getify/You-Dont-Know-JS)
- [Web Development Best Practices](https://developer.mozilla.org/)

---

> "Community-driven development creates amazing projects. Together, we build better software." 🚀

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=footer" width="100%"/>
