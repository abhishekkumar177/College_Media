# College Media

A full-stack social media platform built for college students to connect, share posts, and engage with their community. This MERN stack application allows users to register, login, create posts with text and images, like posts, and interact with an AI chatbot.

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
- AI-powered chatbot for user assistance
- Responsive design with Material-UI and Tailwind CSS
- Secure API endpoints with authentication middleware

## Chatbot

The application includes a built-in chatbot that provides information about the platform's features. The chatbot is implemented as a client-side service with predefined responses for common queries.

## Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download from nodejs.org](https://nodejs.org/)
- **MongoDB** - Choose one of the following options:
  - **MongoDB Atlas** (Cloud): Free tier available at [mongodb.com/atlas](https://www.mongodb.com/atlas)
  - **Local MongoDB**: Install from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- **Git** - [Download from git-scm.com](https://git-scm.com/)
- **npm** or **yarn** (comes with Node.js)

### Quick Setup (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ewocs/College_Media.git
   cd College_Media
   ```

2. **Environment Setup:**
   ```bash
   # Copy environment template
   cp backend/.env.example backend/.env
   ```

3. **Edit the `.env` file** in the `backend` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/college-media
   # OR for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/college-media
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   NODE_ENV=development
   # Optional: Email configuration for welcome emails
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

4. **Install dependencies and start services:**
   ```bash
   # Backend
   cd backend
   npm install
   npm run dev

   # Frontend (in a new terminal)
   cd ../frontend
   npm install
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/college-media
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   NODE_ENV=development
   # Optional: Email configuration for welcome emails
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`.

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The app will run on `http://localhost:5173` (default Vite port).

### Environment Setup Verification

After setup, verify everything is working:

1. **Check Node.js version:**
   ```bash
   node --version
   # Should show v18.x.x or higher
   ```

2. **Check MongoDB connection:**
   ```bash
   # If using local MongoDB, ensure it's running
   # You can test with MongoDB Compass or mongosh
   ```

3. **Test API endpoints:**
   ```bash
   curl http://localhost:5000
   # Should return: {"message": "College Media Backend Running"}
   ```

### Troubleshooting

#### Common Issues

**"MongoServerError: Authentication failed"**
- Check your MongoDB URI in `.env`
- For MongoDB Atlas, ensure IP whitelist includes your IP
- Verify username and password are correct

**"Port already in use"**
```bash
# Find process using port 5000
lsof -i :5000
# Kill the process or change PORT in .env
```

**"Module not found" errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**"CORS errors" in browser**
- Ensure both frontend and backend are running
- Check that backend allows requests from frontend origin

#### Alternative Setup Methods

**Using Docker (Coming Soon)**
Docker setup instructions will be added in a future update.

**Using yarn instead of npm**
Replace `npm install` with `yarn install` and `npm run dev` with `yarn dev`.

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

For detailed API documentation, see [API.md](backend/API.md).

## Environment Variables

The backend requires several environment variables to function properly. These are configured in the `.env` file in the `backend` directory.

### Required Variables

| Variable Name | Description | Required |
|---------------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string for the database | Yes |
| `JWT_SECRET` | Secret key used for JWT token signing and verification | Yes |
| `PORT` | Port number for the backend server to listen on | No (defaults to 5000) |
| `NODE_ENV` | Environment mode (development/production) | No (defaults to development) |

### Optional Variables (Email Configuration)

| Variable Name | Description | Required |
|---------------|-------------|----------|
| `EMAIL_HOST` | SMTP server host for sending emails | No |
| `EMAIL_PORT` | SMTP server port | No |
| `EMAIL_USER` | SMTP server username | No |
| `EMAIL_PASS` | SMTP server password | No |
| `EMAIL_FROM` | Email address to send emails from | No |

### Variable Descriptions

- **MONGODB_URI**: The connection string for your MongoDB database. For local MongoDB, use `mongodb://localhost:27017/college-media`. For MongoDB Atlas, use the provided connection string with your credentials.

- **JWT_SECRET**: A secure secret key for signing JWT tokens. This should be a long, random string and kept confidential. Change this in production to prevent token forgery.

- **PORT**: The port number the backend server will run on. Defaults to 5000 if not specified.

- **NODE_ENV**: Set to `development` for development mode or `production` for production. Affects cookie security settings and other behaviors.

- **Email Variables**: Used for sending welcome emails and other notifications. Configure with your SMTP provider details (e.g., Gmail, SendGrid). If not provided, email functionality will be disabled.

### Security Notes

- Never commit the `.env` file to version control.
- Use strong, unique values for `JWT_SECRET`.
- For production, use environment-specific values and secure credential management.
- The `.env.example` file provides template values for all variables.

## Project Structure

```
college-media/
├── backend/
│   ├── API.md
│   ├── package.json
│   ├── server.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── posts.js
│   └── utils/
│       └── sendEmail.js
├── frontend/
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── assets/
│       ├── components/
│       │   ├── About.jsx
│       │   ├── CTA.jsx
│       │   ├── Features.jsx
│       │   ├── Footer.jsx
│       │   ├── Hero.jsx
│       │   ├── Navbar.jsx
│       │   ├── Team.jsx
│       │   └── chatbot/
│       │       ├── chat.service.js
│       │       ├── ChatBody.jsx
│       │       ├── ChatbotWidget.jsx
│       │       ├── ChatHeader.jsx
│       │       └── ChatInput.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   ├── ChatContext.jsx
│       │   └── useChat.js
│       ├── hooks/
│       │   └── useChatbot.js
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   └── Signup.jsx
│       └── styles/
│           ├── chatbot.css
│           └── main.css
├── .github/
│   └── ISSUE_TEMPLATE/
│       └── documentation-improvement.yml
├── .gitignore
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
