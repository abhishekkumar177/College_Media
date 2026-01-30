# College Media

A full-stack social media platform built for college students to connect, share posts, and engage with their community. This MERN stack application allows users to register, login, create posts with text and images, like posts, and comment on them.

## Tech Stack

- **Frontend:** React, Vite, Material-UI, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Other Libraries:** bcryptjs for password hashing, CORS for cross-origin requests

## Features

- User registration and login with JWT authentication
- Create, view, and interact with posts (text and images)
- Like and unlike posts
- Comment on posts
- Responsive design with Material-UI and Tailwind CSS
- Secure API endpoints with authentication middleware

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables (refer to `.env.example` for a template):

   - **PORT**: The port number on which the server will run. Defaults to 5000 if not specified.
   - **MONGODB_URI**: The connection string for your MongoDB database. Use a local MongoDB instance or a cloud service like MongoDB Atlas. Defaults to `mongodb://localhost:27017/college-media` if not specified.
   - **JWT_SECRET**: A secret key used for signing JSON Web Tokens (JWT) for authentication. This should be a strong, random string to ensure security. Change this in production to a unique value.

   Example `.env` file:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/college-media
   JWT_SECRET=your_secure_jwt_secret_here
   ```

4. Start the backend server:
   ```
   npm run dev
   ```
   The server will run on `http://localhost:5000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```
   The app will run on `http://localhost:5173` (default Vite port).

## Local Development Setup Guide

This guide provides a comprehensive step-by-step process to set up the College Media project for local development. It includes prerequisites, environment configuration, and troubleshooting for common issues.

### Prerequisites

Before starting, ensure you have the following installed on your system:

- **Node.js**: Version 14 or higher. Download from [nodejs.org](https://nodejs.org/). This includes npm (Node Package Manager).
- **MongoDB**: A local MongoDB instance or a cloud service like MongoDB Atlas.
  - For local MongoDB: Install from [mongodb.com](https://www.mongodb.com/try/download/community).
  - For MongoDB Atlas: Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
- **Package Manager**: npm (comes with Node.js) or yarn (optional, install via `npm install -g yarn`).

Verify installations:
```bash
node --version
npm --version
mongod --version  # For local MongoDB
```

### Environment Setup

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd college-media
   ```

2. **Backend Setup**:
   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file based on `.env.example`:
     ```bash
     cp .env.example .env
     ```
     Edit `.env` with your configurations:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/college-media  # Or your Atlas URI
     JWT_SECRET=your_secure_jwt_secret_here
     ```
   - Start MongoDB (if using local):
     ```bash
     mongod  # On macOS/Linux, or use brew services start mongodb/brew/mongodb-community on macOS
     ```
     On Windows, start MongoDB as a service via Services panel or command prompt.
   - Run the backend server:
     ```bash
     npm run dev
     ```
     Server should start on `http://localhost:5000`.

3. **Frontend Setup**:
   - Open a new terminal and navigate to the frontend directory:
     ```bash
     cd ../frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Run the development server:
     ```bash
     npm run dev
     ```
     App should start on `http://localhost:5173`.

4. **Verify Setup**:
   - Backend: Visit `http://localhost:5000` (may show a simple message or API docs).
   - Frontend: Visit `http://localhost:5173` to see the app.

### Common Setup Errors and Fixes

- **Error: `npm install` fails with permission issues**:
  - Fix: Use `sudo npm install` (not recommended) or fix npm permissions: `sudo chown -R $(whoami) ~/.npm`.
  - Alternative: Use nvm for Node.js management.

- **Error: MongoDB connection fails**:
  - Ensure MongoDB is running: Check with `ps aux | grep mongod` or Services panel.
  - Verify `MONGODB_URI` in `.env`: For Atlas, ensure IP whitelist includes your IP (0.0.0.0/0 for testing).
  - Local: Ensure MongoDB is installed and started on default port 27017.

- **Error: Port already in use**:
  - Backend: Change `PORT` in `.env` to an available port (e.g., 5001).
  - Frontend: Vite may auto-assign a port; check console for the actual port.

- **Error: `JWT_SECRET` not set**:
  - Ensure `.env` file exists and contains `JWT_SECRET=your_secret_here`.
  - Regenerate a new secret for security.

- **Error: CORS issues in browser**:
  - Ensure backend has CORS enabled (check `server.js`).
  - Frontend proxy: In `vite.config.js`, add proxy for API calls.

- **Error: Module not found during `npm install`**:
  - Clear npm cache: `npm cache clean --force`.
  - Delete `node_modules` and `package-lock.json`, then reinstall.

- **Error: Vite dev server not starting**:
  - Check for port conflicts: Kill processes on port 5173 with `lsof -ti:5173 | xargs kill -9`.
  - Ensure Node.js version is compatible.

If issues persist, check the console logs for detailed error messages and refer to the project's GitHub issues or community forums.

## Usage

1. Ensure both backend and frontend servers are running.
2. Open your browser and navigate to `http://localhost:5173`.
3. Register a new account or login with existing credentials.
4. Create posts, like and comment on others' posts, and explore the platform.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post (requires authentication)
- `PUT /api/posts/:id/like` - Like or unlike a post (requires authentication)

## Project Structure

```
college-media/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── posts.js
│   ├── package.json
│   ├── server.js
│   ├── .env.example
│   └── .env (create this file)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── About.jsx
│   │   │   ├── CTA.jsx
│   │   │   ├── Features.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Team.jsx
│   │   ├── pages/
│   │   │   └── Home.jsx
│   │   ├── styles/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
